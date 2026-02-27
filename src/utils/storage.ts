// LocalStorage 封装工具
import { createRecord, updateRecord, deleteRecord, getRecords } from './supabase';

const STORAGE_KEY = 'quality_management_system';

// 模块存储键名
export const MODULE_KEYS = {
  ENVIRONMENTAL_CHECK: 'environmental_check',
  ENVIRONMENT_MONITOR: 'environment_monitor',
  DEVICE_MAINTENANCE: 'device_maintenance',
  SOFTWARE_VALIDATION: 'software_validation',
  DATA_CONSISTENCY: 'data_consistency',
  TYPICAL_REPORT: 'typical_report',
  CONTRACT_REVIEW: 'contract_review',
  SATISFACTION_SURVEY: 'satisfaction_survey',
  COMPLAINT_RECORD: 'complaint_record',
  DEVICE_LEDGER: 'equipment_device_ledger',
  DEVICE_PLAN: 'equipment_device_plan',
  DEVICE_USAGE: 'equipment_device_usage',
  DEVICE_CONSUMABLE: 'equipment_consumable_record',
  STANDARD_MATERIAL_LEDGER: 'standard_material_ledger',
  STANDARD_MATERIAL_INSPECTION: 'standard_material_inspection',
  STANDARD_MATERIAL_USAGE: 'standard_material_usage',
  SUPPLIER: 'supplier_my_suppliers',
  PERSONNEL_ARCHIVES: 'personnel_archives',
  PERSONNEL_TRAINING: 'personnel_training',
  PERSONNEL_QUALIFICATION: 'personnel_qualification',
  PERSONNEL_APPOINTMENT: 'personnel_appointment',
  PERSONNEL_AUTHORIZATION: 'personnel_authorization',
  PERSONNEL_SUPERVISION: 'personnel_supervision',
  DEVICE_PERIOD_CHECK: 'equipment_period_check',
  DEVICE_CALIBRATION: 'equipment_calibration',
  AUDIT_PLAN: 'internal_audit_plan',
  AUDIT_IMPLEMENTATION: 'internal_audit_implementation',
  AUDIT_NONCONFORMITY: 'internal_audit_nonconformity',
  AUDIT_CHECKLIST: 'internal_audit_checklist',
  AUDIT_REPORT: 'internal_audit_report',
  AUDIT_RECTIFICATION: 'internal_audit_rectification',
  REVIEW_ANNUAL_PLAN: 'management_review_annual_plan',
  REVIEW_IMPLEMENTATION: 'management_review_implementation',
  REVIEW_INPUT: 'management_review_input',
  REVIEW_MEETING: 'management_review_meeting',
  REVIEW_REPORT: 'management_review_report',
  STANDARD_SEARCH: 'standard_service_search',
  STANDARD_SUBSCRIPTION: 'standard_service_subscription',
};

// 配置：是否使用 Supabase（需要配置 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY 环境变量）
export const USE_SUPABASE = true;

// 获取所有数据
export const getAllData = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : {};
};

// 保存所有数据
export const saveAllData = (data: any) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

// 获取指定模块数据
export const getData = (module: string) => {
  const allData = getAllData();
  return allData[module] || [];
};

// 保存指定模块数据
export const saveModuleData = (module: string, data: any) => {
  const allData = getAllData();
  allData[module] = data;
  saveAllData(allData);
};

// 兼容函数 - 用于新模块
export const loadData = async <T extends { id: string }>(module: string): Promise<T[]> => {
  if (USE_SUPABASE) {
    try {
      const data = await getRecords(module);
      return data as T[];
    } catch (error) {
      console.error('从 Supabase 加载数据失败，使用 localStorage:', error);
      return getData(module) as T[];
    }
  } else {
    return getData(module) as T[];
  }
};

export const saveData = async (module: string, data: any) => {
  if (USE_SUPABASE) {
    try {
      // 清空现有数据
      const existingData = await getRecords(module);
      for (const item of existingData) {
        await deleteRecord(module, item.id);
      }
      // 保存新数据
      for (const item of data) {
        if (item.id) {
          await updateRecord(module, item.id, item);
        } else {
          await createRecord(module, item);
        }
      }
    } catch (error) {
      console.error('保存数据到 Supabase 失败，使用 localStorage:', error);
      saveModuleData(module, data);
    }
  } else {
    saveModuleData(module, data);
  }
};

// 添加单条数据
export const addItem = async (module: string, item: any) => {
  const newItem = {
    ...item,
    id: Date.now().toString(),
    createTime: new Date().toISOString(),
  };
  
  if (USE_SUPABASE) {
    try {
      const result = await createRecord(module, newItem);
      return result;
    } catch (error) {
      console.error('添加数据到 Supabase 失败，使用 localStorage:', error);
      const data = getData(module);
      data.push(newItem);
      saveModuleData(module, data);
      return newItem;
    }
  } else {
    const data = getData(module);
    data.push(newItem);
    saveModuleData(module, data);
    return newItem;
  }
};

// 更新单条数据
export const updateItem = async (module: string, id: string, updates: any) => {
  if (USE_SUPABASE) {
    try {
      const result = await updateRecord(module, id, updates);
      return result;
    } catch (error) {
      console.error('更新数据到 Supabase 失败，使用 localStorage:', error);
      const data = getData(module);
      const index = data.findIndex((item: any) => item.id === id);
      if (index !== -1) {
        data[index] = { ...data[index], ...updates, updateTime: new Date().toISOString() };
        saveModuleData(module, data);
        return data[index];
      }
      return null;
    }
  } else {
    const data = getData(module);
    const index = data.findIndex((item: any) => item.id === id);
    if (index !== -1) {
      data[index] = { ...data[index], ...updates, updateTime: new Date().toISOString() };
      saveModuleData(module, data);
      return data[index];
    }
    return null;
  }
};

// 删除单条数据
export const deleteItem = async (module: string, id: string) => {
  if (USE_SUPABASE) {
    try {
      await deleteRecord(module, id);
      return await getRecords(module);
    } catch (error) {
      console.error('删除数据到 Supabase 失败，使用 localStorage:', error);
      const data = getData(module);
      const newData = data.filter((item: any) => item.id !== id);
      saveModuleData(module, newData);
      return newData;
    }
  } else {
    const data = getData(module);
    const newData = data.filter((item: any) => item.id !== id);
    saveModuleData(module, newData);
    return newData;
  }
};

// 清空所有数据
export const clearAllData = async () => {
  if (USE_SUPABASE) {
    try {
      // 清空所有表数据
      const tables = Object.values(MODULE_KEYS);
      for (const table of tables) {
        const data = await getRecords(table);
        for (const item of data) {
          await deleteRecord(table, item.id);
        }
      }
    } catch (error) {
      console.error('清空 Supabase 数据失败:', error);
    }
  }
  localStorage.removeItem(STORAGE_KEY);
};