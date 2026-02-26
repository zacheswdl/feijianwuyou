// 文件上传工具 - 使用后端服务器存储

const API_BASE_URL = 'http://localhost:3001';

// 上传文件到服务器
export const uploadFile = async (file: File): Promise<{ id: string; name: string; path: string }> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/api/upload`, {
    method: 'POST',
    body: formData,
    headers: {
      // 将原始文件名进行 URI 编码后传递，避免中文乱码
      'X-Original-Filename': encodeURIComponent(file.name),
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '上传失败');
  }

  const result = await response.json();
  return {
    id: result.data.id,
    name: result.data.name,
    path: result.data.path,
  };
};

// 获取文件 URL
export const getFileUrl = (fileId: string): string => {
  return `${API_BASE_URL}/uploads/${fileId}`;
};

// 删除服务器上的文件
export const deleteServerFile = async (fileId: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/files/${fileId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '删除失败');
  }
};

// 检查文件是否存在
export const checkFileExists = async (fileId: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/files/${fileId}`, {
      method: 'HEAD',
    });
    return response.ok;
  } catch {
    return false;
  }
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
