import { useState, useEffect } from 'react';
import { Modal, Button, Space, message } from 'antd';
import { EyeOutlined, DownloadOutlined, FileOutlined } from '@ant-design/icons';
import { getFileUrl, isImage, isPDF } from '../../utils/fileUpload';

interface FilePreviewProps {
  fileId?: string;
  fileName?: string;
  visible: boolean;
  onClose: () => void;
}

const FilePreview = ({ fileId, fileName, visible, onClose }: FilePreviewProps) => {
  const [loading, setLoading] = useState(false);

  const fileUrl = fileId ? getFileUrl(fileId) : '';

  useEffect(() => {
    if (visible && fileId) {
      setLoading(true);
      // 模拟加载延迟
      setTimeout(() => setLoading(false), 300);
    }
  }, [visible, fileId]);

  const handleDownload = () => {
    if (fileUrl && fileName) {
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleOpenInNewWindow = () => {
    if (fileUrl) {
      window.open(fileUrl, '_blank');
    }
  };

  const renderPreview = () => {
    if (loading) {
      return <div style={{ textAlign: 'center', padding: 50 }}>加载中...</div>;
    }

    if (!fileUrl) {
      return <div style={{ textAlign: 'center', padding: 50 }}>文件不存在</div>;
    }

    // 图片预览
    if (isImage(fileName || '')) {
      return (
        <div style={{ textAlign: 'center', padding: 20 }}>
          <img
            src={fileUrl}
            alt={fileName}
            style={{ maxWidth: '100%', maxHeight: '70vh' }}
            onError={() => message.error('图片加载失败')}
          />
        </div>
      );
    }

    // PDF 预览
    if (isPDF(fileName || '')) {
      return (
        <div style={{ height: '70vh' }}>
          <iframe
            src={fileUrl}
            style={{ width: '100%', height: '100%', border: 'none' }}
            title={fileName}
          />
        </div>
      );
    }

    // 其他文件类型
    return (
      <div style={{ textAlign: 'center', padding: 50 }}>
        <FileOutlined style={{ fontSize: 64, color: '#1890ff' }} />
        <p style={{ marginTop: 16, fontSize: 16 }}>{fileName}</p>
        <p style={{ color: '#999' }}>该文件类型不支持在线预览，请下载查看</p>
      </div>
    );
  };

  return (
    <Modal
      title={`文件预览 - ${fileName}`}
      open={visible}
      onCancel={onClose}
      width={900}
      style={{ top: 20 }}
      styles={{ mask: { zIndex: 2000 }, wrapper: { zIndex: 2001 } }}
      footer={
        <Space>
          <Button onClick={onClose}>关闭</Button>
          <Button icon={<DownloadOutlined />} onClick={handleDownload}>
            下载文件
          </Button>
          {fileUrl && (
            <Button icon={<EyeOutlined />} onClick={handleOpenInNewWindow}>
              新窗口打开
            </Button>
          )}
        </Space>
      }
    >
      {renderPreview()}
    </Modal>
  );
};

export default FilePreview;
