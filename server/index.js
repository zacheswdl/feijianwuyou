import express from 'express';
import multer from 'multer';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// 启用 CORS
app.use(cors());

// 解析 JSON
app.use(express.json());

// 确保上传目录存在
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// 配置文件存储
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // 从请求头获取原始文件名
    let originalName = req.headers['x-original-filename'];
    
    if (originalName) {
      try {
        originalName = decodeURIComponent(originalName);
      } catch (e) {
        originalName = file.originalname;
      }
    } else {
      originalName = file.originalname;
    }
    
    // 获取文件扩展名
    const ext = path.extname(originalName);
    // 获取文件名（不含扩展名）
    let basename = path.basename(originalName, ext);
    
    // 清理文件名中的非法字符，保留中文、英文、数字、下划线、横线
    // 将空格替换为下划线
    basename = basename
      .replace(/\s+/g, '_')           // 空格替换为下划线
      .replace(/[<>"/\\|?*]/g, '')   // 移除非法字符
      .substring(0, 50);              // 限制长度，避免文件名过长
    
    // 生成时间戳
    const timestamp = Date.now();
    
    // 组合文件名: 原始文件名_时间戳.扩展名
    const safeFilename = `${basename}_${timestamp}${ext}`;
    
    cb(null, safeFilename);
  }
});

// 文件过滤器
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['.doc', '.docx', '.pdf', '.jpg', '.jpeg', '.png', '.gif'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('不支持的文件类型'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB 限制
  }
});

// 文件上传接口
app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '没有上传文件' });
    }

    // 从请求头中获取原始文件名（前端传递的）
    let originalName = req.headers['x-original-filename'];
    
    // 如果没有从请求头获取，尝试从 req.file.originalname 获取并解码
    if (!originalName) {
      try {
        // 尝试解码 URI 编码的文件名
        originalName = decodeURIComponent(req.file.originalname);
      } catch (e) {
        originalName = req.file.originalname;
      }
    } else {
      try {
        originalName = decodeURIComponent(originalName);
      } catch (e) {
        // 解码失败则使用原值
      }
    }

    const fileInfo = {
      id: req.file.filename,
      name: originalName || req.file.originalname,
      size: req.file.size,
      type: req.file.mimetype,
      path: `/uploads/${req.file.filename}`,
      uploadTime: new Date().toISOString()
    };

    console.log('文件上传成功:', fileInfo);
    res.json({ 
      success: true, 
      message: '文件上传成功',
      data: fileInfo 
    });
  } catch (error) {
    console.error('上传失败:', error);
    res.status(500).json({ error: '文件上传失败' });
  }
});

// 文件访问接口
app.get('/uploads/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(uploadsDir, filename);
  
  // 安全检查：确保文件在 uploads 目录内
  const resolvedPath = path.resolve(filePath);
  const resolvedUploadsDir = path.resolve(uploadsDir);
  
  if (!resolvedPath.startsWith(resolvedUploadsDir)) {
    return res.status(403).json({ error: '访问被拒绝' });
  }

  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ error: '文件不存在' });
  }
});

// 获取文件信息接口
app.get('/api/files/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(uploadsDir, filename);
  
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    res.json({
      name: filename,
      size: stats.size,
      uploadTime: stats.mtime
    });
  } else {
    res.status(404).json({ error: '文件不存在' });
  }
});

// 删除文件接口
app.delete('/api/files/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(uploadsDir, filename);
  
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    res.json({ success: true, message: '文件已删除' });
  } else {
    res.status(404).json({ error: '文件不存在' });
  }
});

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// 错误处理
app.use((error, req, res, next) => {
  console.error('服务器错误:', error);
  res.status(500).json({ error: error.message || '服务器内部错误' });
});

app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
  console.log(`文件上传目录: ${uploadsDir}`);
});
