
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { AppState, SimulationVoxel, RebuildTarget, VoxelData } from '../types';
import { CONFIG, COLORS } from '../utils/voxelConstants';

export class VoxelEngine {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private controls: OrbitControls;
  private instanceMesh: THREE.InstancedMesh | null = null;
  private dummy = new THREE.Object3D();
  
  private voxels: SimulationVoxel[] = [];
  private rebuildTargets: RebuildTarget[] = [];
  private rebuildStartTime: number = 0;
  
  private state: AppState = AppState.STABLE;
  private onStateChange: (state: AppState) => void;
  private onCountChange: (count: number) => void;
  private onRotateChange: (enabled: boolean) => void;
  private animationId: number = 0;

  private gridHelper: THREE.GridHelper | null = null;

  constructor(
    container: HTMLElement, 
    onStateChange: (state: AppState) => void,
    onCountChange: (count: number) => void,
    onRotateChange: (enabled: boolean) => void
  ) {
    this.container = container;
    this.onStateChange = onStateChange;
    this.onCountChange = onCountChange;
    this.onRotateChange = onRotateChange;

    this.scene = new THREE.Scene();
    this.initOrangeEnvironment();

    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(0, 70, 100);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.autoRotate = false;
    this.controls.autoRotateSpeed = 1.2;
    this.controls.target.set(0, 15, 0);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(50, 80, 50);
    dirLight.castShadow = true;
    
    dirLight.shadow.camera.left = -100;
    dirLight.shadow.camera.right = 100;
    dirLight.shadow.camera.top = 100;
    dirLight.shadow.camera.bottom = -100;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 500;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.bias = -0.0005; 
    
    const targetObject = new THREE.Object3D();
    targetObject.position.set(0, 15, 0);
    this.scene.add(targetObject);
    dirLight.target = targetObject;
    
    this.scene.add(dirLight);

    const floorMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1 });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(1000, 1000), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = CONFIG.FLOOR_Y;
    floor.receiveShadow = true;
    floor.name = "Floor";
    this.scene.add(floor);

    this.animate = this.animate.bind(this);
    this.animate();
  }

  public initOrangeEnvironment() {
    const extraWarmColor = new THREE.Color(0xfff1e3);
    this.scene.background = extraWarmColor;
    this.scene.fog = new THREE.Fog(extraWarmColor, 70, 180);
    
    if (!this.gridHelper) {
        this.gridHelper = new THREE.GridHelper(200, 40, 0xfbdba7, 0xfff7ed);
        this.gridHelper.position.y = CONFIG.FLOOR_Y + 0.01;
        this.scene.add(this.gridHelper);
    }
    this.gridHelper.visible = true;
  }

  public loadInitialModel(data: VoxelData[], forcedCount?: number) {
    const count = forcedCount || data.length;
    this.createVoxels(data, count);
    this.onCountChange(this.voxels.length);
    this.state = AppState.STABLE;
    this.onStateChange(this.state);
  }

  private createVoxels(data: VoxelData[], count: number) {
    if (this.instanceMesh) {
      this.scene.remove(this.instanceMesh);
      this.instanceMesh.geometry.dispose();
      (this.instanceMesh.material as THREE.Material).dispose();
    }

    const orangeColor = new THREE.Color(COLORS.ORANGE);

    this.voxels = [];
    for (let i = 0; i < count; i++) {
        const source = data[i % data.length];
        this.voxels.push({
            id: i,
            x: source.x, 
            y: source.y, 
            z: source.z, 
            color: orangeColor.clone(),
            vx: 0, vy: 0, vz: 0, rx: 0, ry: 0, rz: 0,
            rvx: 0, rvy: 0, rvz: 0
        });
    }

    const geometry = new THREE.SphereGeometry(1.4, 16, 16);
    const material = new THREE.MeshStandardMaterial({ 
        roughness: 0.4, 
        metalness: 0.05,
        color: 0xffffff
    });

    this.instanceMesh = new THREE.InstancedMesh(geometry, material, this.voxels.length);
    this.instanceMesh.castShadow = true;
    this.instanceMesh.receiveShadow = true;
    this.scene.add(this.instanceMesh);

    this.draw();
  }

  private draw() {
    if (!this.instanceMesh) return;
    this.voxels.forEach((v, i) => {
        this.dummy.position.set(v.x, v.y, v.z);
        this.dummy.quaternion.copy(this.camera.quaternion);
        this.dummy.updateMatrix();
        this.instanceMesh!.setMatrixAt(i, this.dummy.matrix);
        this.instanceMesh!.setColorAt(i, v.color);
    });
    this.instanceMesh.instanceMatrix.needsUpdate = true;
    if (this.instanceMesh.instanceColor) this.instanceMesh.instanceColor.needsUpdate = true;
  }

  public dismantle() {
    if (this.state !== AppState.STABLE) return;
    this.state = AppState.DISMANTLING;
    this.onStateChange(this.state);
    if (this.controls.autoRotate) {
        this.controls.autoRotate = false;
        this.onRotateChange(false);
    }
    this.voxels.forEach(v => {
        v.vx = (Math.random() - 0.5) * 1.2;
        v.vy = Math.random() * 0.5;
        v.vz = (Math.random() - 0.5) * 1.2;
        v.rvx = (Math.random() - 0.5) * 0.1;
        v.rvy = (Math.random() - 0.5) * 0.1;
        v.rvz = (Math.random() - 0.5) * 0.1;
    });
  }

  private animate() {
    this.animationId = requestAnimationFrame(this.animate);
    this.controls.update();

    if (this.state === AppState.DISMANTLING) {
      this.voxels.forEach(v => {
        v.x += v.vx;
        v.y += v.vy;
        v.z += v.vz;
        
        v.rx += v.rvx;
        v.ry += v.rvy;
        v.rz += v.rvz;

        v.vy -= 0.02; // Gravity

        if (v.y < CONFIG.FLOOR_Y + 1) {
          v.y = CONFIG.FLOOR_Y + 1;
          v.vy *= -0.5;
          v.vx *= 0.95;
          v.vz *= 0.95;
        }
      });
    } else if (this.state === AppState.REBUILDING) {
      const now = performance.now();
      const elapsed = (now - this.rebuildStartTime) / 1000;
      let allDone = true;

      this.voxels.forEach((v, i) => {
        const target = this.rebuildTargets[i];
        if (!target) return;

        const t = Math.max(0, Math.min(1, (elapsed - target.delay) * 1.5));
        if (t < 1) allDone = false;

        const ease = t * t * (3 - 2 * t);
        v.x = v.x + (target.x - v.x) * ease * 0.15;
        v.y = v.y + (target.y - v.y) * ease * 0.15;
        v.z = v.z + (target.z - v.z) * ease * 0.15;

        if (t >= 0.99) {
          v.x = target.x;
          v.y = target.y;
          v.z = target.z;
        }
      });

      if (allDone && elapsed > 1.5) {
        this.state = AppState.STABLE;
        this.onStateChange(this.state);
      }
    }

    this.draw();
    this.renderer.render(this.scene, this.camera);
  }

  public handleResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  public cleanup() {
    cancelAnimationFrame(this.animationId);
    this.renderer.dispose();
    if (this.instanceMesh) {
      this.instanceMesh.geometry.dispose();
      (this.instanceMesh.material as THREE.Material).dispose();
    }
  }

  public setAutoRotate(enabled: boolean) {
    this.controls.autoRotate = enabled;
  }

  public getJsonData(): string {
    const data = this.voxels.map(v => ({
      x: Math.round(v.x),
      y: Math.round(v.y),
      z: Math.round(v.z),
      c: '#' + v.color.getHexString()
    }));
    return JSON.stringify(data);
  }

  public rebuild(targetModel: VoxelData[]) {
    if (this.state === AppState.REBUILDING) return;
    
    this.rebuildStartTime = performance.now();
    this.state = AppState.REBUILDING;
    this.onStateChange(this.state);
    
    const currentCount = this.voxels.length;
    this.rebuildTargets = new Array(currentCount).fill(null);
    const orangeColor = new THREE.Color(COLORS.ORANGE);

    for (let i = 0; i < currentCount; i++) {
        const target = targetModel[i % targetModel.length];
        this.rebuildTargets[i] = {
            x: target.x,
            y: target.y,
            z: target.z,
            delay: Math.random() * 0.4
        };
        this.voxels[i].color.set(orangeColor);
    }
  }
}
