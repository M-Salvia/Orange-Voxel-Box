
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

/**
 * 健壮的环境变量解析器。
 * 搜索多个可能的存储位置和命名约定，以确保在各种部署环境下都能找到凭据。
 */
const getEnv = (key: string): string => {
  // 定义可能的键名变体：原始键、去掉 VITE_ 前缀的键、加上 VITE_ 前缀的键
  const variants = [key, key.replace('VITE_', ''), `VITE_${key}`];
  
  try {
    // 1. 检查 Vite/构建工具的元数据 (import.meta.env)
    const meta = import.meta as any;
    if (typeof meta !== 'undefined' && meta.env) {
      for (const v of variants) {
        if (meta.env[v]) return meta.env[v];
      }
    }

    // 2. 检查 Node/Netlify 的进程对象 (process.env)
    // 注意：在没有构建步骤的纯静态前端中，process 可能未定义
    if (typeof process !== 'undefined' && process.env) {
      for (const v of variants) {
        if ((process.env as any)[v]) return (process.env as any)[v];
      }
    }

    // 3. 检查浏览器全局对象 (window / globalThis)
    // 某些沙箱环境或预览器会将环境变量注入到全局
    const globalContext = (typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : {})) as any;
    for (const v of variants) {
      if (globalContext[v]) return globalContext[v];
    }

    return '';
  } catch {
    return '';
  }
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY');

/**
 * 当配置缺失时返回的模拟客户端，提供明确的错误反馈。
 */
const mockSupabase = {
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ 
      data: { subscription: { unsubscribe: () => {} } } 
    }),
    signInWithPassword: async () => ({ 
      data: {}, 
      error: { message: '找不到 Supabase 配置。请确保在 Netlify 后台或本地环境设置了 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY。' } 
    }),
    signUp: async () => ({ 
      data: {}, 
      error: { message: '注册失败：Supabase 未配置。如果你已在 Netlify 设置变量，请尝试添加 VITE_ 前缀并重新部署。' } 
    }),
    signOut: async () => ({ error: null }),
  },
  from: () => ({
    select: () => ({
      eq: () => ({
        single: async () => ({ data: null, error: { message: 'Supabase not configured' } })
      }),
      order: () => ({
        limit: async () => ({ data: [], error: null })
      })
    }),
    update: () => ({
      eq: () => ({
        eq: async () => ({ data: null, error: null }),
        single: async () => ({ data: null, error: null })
      }),
      eq_async: async () => ({ data: null, error: null })
    }),
    insert: () => ({
      select: () => ({
        single: async () => ({ data: null, error: null })
      })
    })
  })
} as any;

// 在控制台输出调试信息
if (!supabaseUrl || !supabaseUrl.startsWith('http')) {
  console.warn("Supabase 配置提示: 未检测到有效的 VITE_SUPABASE_URL。应用将运行在本地演示模式。");
}

// 只有在获得有效的 URL 时才初始化真实客户端
export const supabase = (supabaseUrl && supabaseUrl.startsWith('http')) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : mockSupabase;
