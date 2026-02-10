
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

/**
 * 针对“无构建步骤”部署的直接配置方案。
 * 直接使用你提供的项目 URL 和最新的 Anon Key。
 */

// 1. 你的项目 URL
const SUPABASE_URL = 'https://yhtmfggneyufebqzmahx.supabase.co';

// 2. 你的最新 Anon Public Key (由用户在对话中提供)
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlodG1mZ2duZXl1ZmVicXptYWh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1MDgyMDQsImV4cCI6MjA4NjA4NDIwNH0.IMC4DkjI_pimHjbuUk2Vera9e9ttWVZEnvJib4cCHyY';

/**
 * 兜底模拟对象：仅在字符串为空时防崩溃使用
 */
const mockSupabase = {
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ 
      data: { subscription: { unsubscribe: () => {} } } 
    }),
    signInWithPassword: async () => ({ 
      data: {}, 
      error: { message: 'Supabase 配置无效。' } 
    }),
    signUp: async () => ({ 
      data: {}, 
      error: { message: '注册失败：Supabase 配置无效。' } 
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

// 检查字符串是否存在
const hasConfig = SUPABASE_URL && SUPABASE_ANON_KEY && SUPABASE_URL.includes('supabase.co');

export const supabase = hasConfig 
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) 
  : mockSupabase;

if (!hasConfig) {
  console.error('Supabase URL 或 Key 缺失。请确保 services/supabaseClient.ts 中的字符串已正确填写。');
}
