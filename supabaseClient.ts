
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

/**
 * 健壮的环境变量解析器。
 * 兼容 Vite (import.meta.env)、Webpack/Node (process.env) 以及直接浏览器注入 (window)。
 */
const getEnv = (key: string): string => {
  const vKey = key.startsWith('VITE_') ? key : `VITE_${key}`;
  const rawKey = key.replace('VITE_', '');
  
  try {
    // 1. 尝试从 Vite 环境获取 (生产构建时常用)
    const metaEnv = (import.meta as any).env;
    if (metaEnv) {
      if (metaEnv[vKey]) return metaEnv[vKey];
      if (metaEnv[rawKey]) return metaEnv[rawKey];
    }

    // 2. 尝试从 process.env 获取 (某些 CI/CD 环境)
    if (typeof process !== 'undefined' && process.env) {
      if (process.env[vKey]) return process.env[vKey];
      if (process.env[rawKey]) return process.env[rawKey];
    }

    // 3. 尝试从全局对象获取 (手动注入或特定沙箱)
    const globalObj = (typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : {})) as any;
    if (globalObj[vKey]) return globalObj[vKey];
    if (globalObj[rawKey]) return globalObj[rawKey];

  } catch (e) {
    // 忽略错误
  }
  return '';
};

// 获取配置
const supabaseUrl = getEnv('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY');

/**
 * 模拟客户端：在配置缺失时提供友好的交互反馈
 */
const mockSupabase = {
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ 
      data: { subscription: { unsubscribe: () => {} } } 
    }),
    signInWithPassword: async () => ({ 
      data: {}, 
      error: { message: 'Supabase 未配置。请检查 Netlify 环境变量并确保已重新部署。' } 
    }),
    signUp: async () => ({ 
      data: {}, 
      error: { message: '注册失败：无法读取到 API 配置。如果您使用的是 Netlify 部署，请确保构建命令 (Build Command) 为空或正确执行了环境注入。' } 
    }),
    signOut: async () => ({ error: null }),
  },
  from: () => ({
    select: () => ({
      eq: () => ({
        single: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
        order: () => ({ limit: async () => ({ data: [], error: null }) })
      }),
      order: () => ({
        limit: async () => ({ data: [], error: null })
      })
    }),
    update: () => ({
      eq: () => ({
        eq: async () => ({ data: null, error: null }),
        single: async () => ({ data: null, error: null })
      })
    }),
    insert: () => ({
      select: () => ({
        single: async () => ({ data: null, error: null })
      })
    })
  })
} as any;

// 只有在 URL 看起来合法时才初始化客户端
const isConfigured = supabaseUrl && supabaseUrl.startsWith('http');

if (!isConfigured) {
  console.warn('Supabase 配置缺失。应用将以演示模式运行。');
}

export const supabase = isConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : mockSupabase;
