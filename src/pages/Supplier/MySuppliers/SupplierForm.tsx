import { Modal, Form, Input, Select, Button, Divider, message, Upload, Space } from 'antd';
import { UploadOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { uploadFile, deleteServerFile } from '../../../utils/fileUpload';
import FilePreview from '../../../components/Common/FilePreview';

const { TextArea } = Input;
const { Option } = Select;

interface SupplierFormProps {
  visible: boolean;
  record: any;
  mode: 'view' | 'edit' | 'add';
  onCancel: () => void;
  onSave: (values: any) => void;
}

const SupplierForm = ({ visible, record, mode, onCancel, onSave }: SupplierFormProps) => {
  const [form] = Form.useForm();
  const isView = mode === 'view';
  
  // 资质证明文件
  const [qualificationFiles, setQualificationFiles] = useState<any[]>([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewFile, setPreviewFile] = useState<{ id: string; name: string } | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (visible && !initialized) {
      setInitialized(true);
      
      if (record && Object.keys(record).length > 0) {
        form.setFieldsValue({
          ...record,
        });
        
        if (record.qualificationFiles && record.qualificationFiles.length > 0) {
          setQualificationFiles(record.qualificationFiles.map((file: any, index: number) => ({
            uid: `qual-${index}`,
            name: file.name,
            status: 'done',
            fileId: file.id,
          })));
        } else {
          setQualificationFiles([]);
        }
      } else {
        form.resetFields();
        setQualificationFiles([]);
      }
    }
    
    if (!visible) {
      setInitialized(false);
    }
  }, [visible, record, form, initialized]);

  const handleOk = async () => {
    if (isView) {
      onCancel();
      return;
    }
    try {
      const values = await form.validateFields();
      const formattedValues = {
        ...values,
        qualificationFiles: qualificationFiles.map(file => ({
          id: file.fileId,
          name: file.name,
        })),
      };
      onSave(formattedValues);
      form.resetFields();
      setQualificationFiles([]);
      setInitialized(false);
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setQualificationFiles([]);
    setInitialized(false);
    onCancel();
  };

  const getTitle = () => {
    switch (mode) {
      case 'add': return '新增服务商';
      case 'edit': return '编辑服务商';
      case 'view': return '查看服务商';
      default: return '服务商详情';
    }
  };

  // 上传资质证明文件
  const uploadQualificationFile = async (options: any) => {
    const { file, onSuccess, onError, onProgress } = options;
    
    try {
      onProgress?.({ percent: 30 });
      const result = await uploadFile(file);
      onProgress?.({ percent: 100 });
      
      const newFile = {
        uid: `qual-${Date.now()}`,
        name: result.name,
        status: 'done',
        fileId: result.id,
      };
      
      setQualificationFiles(prev => [...prev, newFile]);
      onSuccess?.('ok');
      message.success('资质文件上传成功');
    } catch (error) {
      console.error('上传失败:', error);
      onError?.(error);
      message.error('文件上传失败: ' + (error as Error).message);
    }
  };

  // 删除资质证明文件
  const removeQualificationFile = async (file: any) => {
    try {
      if (file.fileId && file.status === 'done') {
        await deleteServerFile(file.fileId);
      }
      setQualificationFiles(prev => prev.filter(item => item.uid !== file.uid));
      return true;
    } catch (error) {
      console.error('删除文件失败:', error);
      message.error('删除文件失败');
      return false;
    }
  };

  const handlePreview = (file: any) => {
    if (file.fileId) {
      setPreviewFile({ id: file.fileId, name: file.name });
      setPreviewVisible(true);
    }
  };

  return (
    <>
      <Modal
        title={getTitle()}
        open={visible}
        onOk={handleOk}
        onCancel={handleCancel}
        width={800}
        okText={isView ? '关闭' : '保存'}
        cancelText="取消"
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          disabled={isView}
          style={{ marginTop: 16 }}
        >
          <Divider orientation="left">基本信息</Divider>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item
              label="服务商名称"
              name="supplierName"
              rules={[{ required: true, message: '请输入服务商名称' }]}
            >
              <Input placeholder="请输入服务商名称" />
            </Form.Item>

            <Form.Item
              label="联系人"
              name="contactPerson"
            >
              <Input placeholder="请输入联系人" />
            </Form.Item>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item
              label="电话"
              name="phone"
            >
              <Input placeholder="请输入电话" />
            </Form.Item>

            <Form.Item
              label="提供产品（或支持服务）名称"
              name="supplyType"
            >
              <Select mode="multiple" placeholder="请选择提供产品（或支持服务）名称">
                <Option value="检定/校准服务">检定/校准服务</Option>
                <Option value="标准物质">标准物质</Option>
                <Option value="仪器设备">仪器设备</Option>
                <Option value="维修服务">维修服务</Option>
                <Option value="培训服务">培训服务</Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item
            label="服务商地址"
            name="supplierAddress"
          >
            <TextArea rows={2} placeholder="请输入服务商地址" />
          </Form.Item>

          <Divider orientation="left">资质证明</Divider>

          <Form.Item label="资质证明附件">
            <Space>
              <Button 
                type="primary" 
                size="small"
                disabled={qualificationFiles.length === 0}
                onClick={() => {
                  if (qualificationFiles.length > 0) {
                    handlePreview(qualificationFiles[0]);
                  }
                }}
              >
                查看
              </Button>
              {!isView && (
                <Upload
                  customRequest={uploadQualificationFile}
                  showUploadList={false}
                  accept=".doc,.docx,.pdf,.jpg,.jpeg,.png"
                >
                  <Button size="small" icon={<UploadOutlined />}>
                    上传附件 ({qualificationFiles.length})
                  </Button>
                </Upload>
              )}
            </Space>
            {qualificationFiles.length > 0 && (
              <div style={{ marginTop: 8 }}>
                {qualificationFiles.map((file, index) => (
                  <div key={file.uid} style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
                    {index + 1}. {file.name}
                    <Button 
                      type="link" 
                      size="small" 
                      icon={<EyeOutlined />}
                      onClick={() => handlePreview(file)}
                    >
                      预览
                    </Button>
                    {!isView && (
                      <Button 
                        type="link" 
                        danger 
                        size="small" 
                        icon={<DeleteOutlined />}
                        onClick={() => removeQualificationFile(file)}
                      >
                        删除
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Form.Item>
        </Form>
      </Modal>

      <FilePreview
        fileId={previewFile?.id}
        fileName={previewFile?.name}
        visible={previewVisible}
        onClose={() => {
          setPreviewVisible(false);
          setPreviewFile(null);
        }}
      />
    </>
  );
};

export default SupplierForm;
