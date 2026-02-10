# 橘子收集箱 | Orange Voxel Box 🍊

> **“一份耕耘，无限可能。”**
>
> **"One focus, infinite possibilities."**

[![Live Demo](https://img.shields.io/badge/Live-Demo-orange?style=for-the-badge&logo=vercel)](https://orange-voxel-box.netlify.app/)

**橘子收集箱**是一个 3D 体素创作与专注工具。无需下载安装，通过浏览器即可访问。

它通过预设的专注时间（45分钟）获取“橘子”作为建筑材料，并利用 AI 赋予这些材料生命，将抽象的专注力转化为具象的数字艺术。

🚀 **立即体验**: [https://orange-voxel-box.netlify.app/](https://orange-voxel-box.netlify.app/)

---

## 🌟 核心特性 (Features)

* **🍅 沉浸式专注计时**
    预设 45 分钟的深度专注周期，以液态橘子计时器视觉化呈现时间流逝，帮助用户进入心流状态。
* **🧱 体素物理引擎**
    基于 Three.js 的高性能体素渲染，支持粒子崩解、平滑重组和实时阴影效果，带来细腻的视觉反馈。
* **🤖 Gemini AI 驱动**
    集成 **`gemini-3-flash-preview`** 模型，能够精准理解语义，将用户的文字描述瞬间转化为复杂的 3D 坐标分布。
* **🔄 动态重塑**
    成长型反馈机制：获取的“橘子”数量越多，AI 雕刻出的模型细节就越丰富。
* **💾 蓝图系统**
    支持导出/导入 JSON 格式的模型数据，方便用户保存进度或分享创意蓝图。
* **🌐 多语言支持**
    内置中/英文界面切换，适应不同语言环境的用户。

---

## 📖 使用指南 (User Guide)

### 📤 导出（保存/分享你的作品）
如果你通过 Gemini AI 生成了一个非常酷的形状（比如一只猫或一座城堡），可以通过以下步骤保存：

1.  **点击“导出”按钮**：位于屏幕右上角的工具栏中。
2.  **复制内容**：弹出的窗口会显示一串复杂的代码（JSON）。点击下方的 **“全部复制” (Copy All)** 按钮。
3.  **本地保存**：你可以把这段代码粘贴到电脑的“记事本” (.txt) 里保存，或者直接通过微信/邮件发给朋友分享你的创意。

### 📥 导入（加载/还原作品）
如果你想加载之前保存的作品，或者尝试别人分享给你的蓝图：

1.  **准备代码**：复制你之前保存的那段 JSON 代码。
2.  **打开导入窗口**：
    * 点击左上角的 **“构建方案” (Build Schemes)** 下拉菜单。
    * 选择 **“导入 JSON 蓝图” (Import JSON Blueprint)**。
3.  **粘贴并应用**：在弹出的空白框中粘贴代码，点击 **“导入蓝图” (Import Blueprint)**。
4.  **实时重组**：你会看到场景中现有的橘子会像粒子一样自动飞向新坐标，重组成你导入的那个形状。

---

## 🛠️ 技术栈 (Tech Stack)

本项目完全基于现代 Web 技术构建，无需安装任何客户端。

| 模块 | 技术选型 |
| :--- | :--- |
| **Frontend (前端)** | React 19, TypeScript, Tailwind CSS |
| **3D Engine (3D 引擎)** | Three.js (Instanced Rendering / 实例渲染) |
| **AI Integration (AI 集成)** | Google Gemini API (`@google/genai`) |
| **Icons (图标)** | Lucide React |
| **Build Tool (构建工具)** | Vite / ES Modules |
