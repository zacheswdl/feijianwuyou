import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let supabase: SupabaseClient | null = null;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

export interface BaseRecord {
  id: string;
  created_at?: string;
  updated_at?: string;
}

export const createRecord = async <T extends BaseRecord>(table: string, data: Omit<T, 'id' | 'created_at' | 'updated_at'>) => {
  if (!supabase) {
    throw new Error('Supabase 未配置');
  }
  const { data: result, error } = await supabase
    .from(table)
    .insert({
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select('*')
    .single();
  
  if (error) {
    console.error('创建记录失败:', error);
    throw error;
  }
  
  return result;
};

export const updateRecord = async <T extends BaseRecord>(table: string, id: string, data: Partial<T>) => {
  if (!supabase) {
    throw new Error('Supabase 未配置');
  }
  const { data: result, error } = await supabase
    .from(table)
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*')
    .single();
  
  if (error) {
    console.error('更新记录失败:', error);
    throw error;
  }
  
  return result;
};

export const deleteRecord = async (table: string, id: string) => {
  if (!supabase) {
    throw new Error('Supabase 未配置');
  }
  const { error } = await supabase
    .from(table)
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('删除记录失败:', error);
    throw error;
  }
  
  return true;
};

export const getRecords = async (table: string, filters?: Record<string, any>) => {
  if (!supabase) {
    throw new Error('Supabase 未配置');
  }
  let query = supabase.from(table).select('*');
  
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('获取记录失败:', error);
    throw error;
  }
  
  return data || [];
};

export const getRecordById = async (table: string, id: string) => {
  if (!supabase) {
    throw new Error('Supabase 未配置');
  }
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('获取记录失败:', error);
    throw error;
  }
  
  return data;
};
