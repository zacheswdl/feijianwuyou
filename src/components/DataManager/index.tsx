import { Modal, Button, Space, message, Upload, Card } from 'antd';
import { UploadOutlined, DownloadOutlined, ImportOutlined, ExportOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { getAllData, saveAllData } from '../../utils/storage';

interface DataManagerProps {
  visible: boolean;
  onClose: () => void;
}

const DataManager = ({ visible, onClose }: DataManagerProps) => {
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);

  // 导出数据
  const handleExport = async () => {
    try {
      setExporting(true);
      const data = getAllData();
      const jsonData = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `质量管理数据备份_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      message.success('数据导出成功！');
    } catch (error) {
      console.error('导出失败:', error);
      message.error('数据导出失败');
    } finally {
      setExporting(false);
    }
  };

  // 导入数据
  const handleImport = async (options: any) => {
    const { file, onSuccess, onError } = options;
    
    try {
      setImporting(true);
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          saveAllData(data);
          message.success('数据导入成功！请刷新页面查看最新数据。');
          onSuccess?.('ok');
          setTimeout(() => {
            onClose();
            window.location.reload();
          }, 1500);
        } catch (error) {
          console.error('导入失败:', error);
          message.error('文件格式错误，请确保是正确的 JSON 备份文件');
          onError?.(error);
        } finally {
          setImporting(false);
        }
      };
      
      reader.onerror = () => {
        message.error('文件读取失败');
        onError?.(new Error('文件读取失败'));
        setImporting(false);
      };
      
      reader.readAsText(file);
    } catch (error) {
      console.error('导入失败:', error);
      message.error('数据导入失败');
      onError?.(error);
      setImporting(false);
    }
  };

  return (
    <Modal
      title="数据管理"
      open={visible}
      onCancel={onClose}
      footer={
        <Space>
          <Button onClick={onClose}>关闭</Button>
        </Space>
      }
      width={600}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Card 
          title={
            <Space>
              <ExportOutlined />
              <span>导出数据</span>
            </Space>
          }
          size="small"
        >
          <p style={{ color: '#666', marginBottom: 16 }}>
            将所有数据导出为 JSON 文件，可用于备份或迁移到其他环境
          </p>
          <Button 
            type="primary" 
            icon={<DownloadOutlined />} 
            onClick={handleExport}
            loading={exporting}
            block
          >
            导出全部数据
          </Button>
        </Card>

        <Card 
          title={
            <Space>
              <ImportOutlined />
              <span>导入数据</span>
            </Space>
          }
          size="small"
        >
          <p style={{ color: '#666', marginBottom: 16 }}>
            从 JSON 备份文件导入数据，<strong style={{ color: '#ff4d4f' }}>注意：导入会覆盖当前所有数据！</strong>
          </p>
          <Upload
            customRequest={handleImport}
            showUploadList={false}
            accept=".json"
            disabled={importing}
          >
            <Button 
              icon={<UploadOutlined />} 
              loading={importing}
              block
            >
              选择备份文件导入
            </Button>
          </Upload>
        </Card>
      </Space>
    </Modal>
  );
};

export default DataManager;
