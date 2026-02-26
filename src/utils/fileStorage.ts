// 文件存储工具 - 使用 IndexedDB 存储文件数据

const DB_NAME = 'QualityManagementDB';
const DB_VERSION = 1;
const STORE_NAME = 'files';

// 打开数据库
const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
};

// 保存文件
export const saveFile = async (file: File): Promise<string> => {
  const db = await openDB();
  const transaction = db.transaction([STORE_NAME], 'readwrite');
  const store = transaction.objectStore(STORE_NAME);
  
  const id = `${Date.now()}_${file.name}`;
  const fileData = {
    id,
    name: file.name,
    type: file.type,
    size: file.size,
    data: file,
    uploadTime: new Date().toISOString(),
  };
  
  return new Promise((resolve, reject) => {
    const request = store.put(fileData);
    request.onsuccess = () => resolve(id);
    request.onerror = () => reject(request.error);
  });
};

// 获取文件
export const getFile = async (id: string): Promise<{ name: string; type: string; data: Blob } | null> => {
  const db = await openDB();
  const transaction = db.transaction([STORE_NAME], 'readonly');
  const store = transaction.objectStore(STORE_NAME);
  
  return new Promise((resolve, reject) => {
    const request = store.get(id);
    request.onsuccess = () => {
      const result = request.result;
      if (result) {
        resolve({
          name: result.name,
          type: result.type,
          data: result.data,
        });
      } else {
        resolve(null);
      }
    };
    request.onerror = () => reject(request.error);
  });
};

// 删除文件
export const deleteFile = async (id: string): Promise<void> => {
  const db = await openDB();
  const transaction = db.transaction([STORE_NAME], 'readwrite');
  const store = transaction.objectStore(STORE_NAME);
  
  return new Promise((resolve, reject) => {
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

// 创建文件 URL（用于预览）
export const createFileUrl = (file: Blob): string => {
  return URL.createObjectURL(file);
};

// 释放文件 URL
export const revokeFileUrl = (url: string): void => {
  URL.revokeObjectURL(url);
};

// 检查是否是图片
export const isImage = (fileName: string): boolean => {
  const ext = fileName.toLowerCase().split('.').pop();
  return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext || '');
};

// 检查是否是 PDF
export const isPDF = (fileName: string): boolean => {
  return fileName.toLowerCase().endsWith('.pdf');
};

// 检查是否是 Word 文档
export const isWord = (fileName: string): boolean => {
  const lower = fileName.toLowerCase();
  return lower.endsWith('.doc') || lower.endsWith('.docx');
};
