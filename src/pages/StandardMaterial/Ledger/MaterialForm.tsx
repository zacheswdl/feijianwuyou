import { Modal, Form, Input, Select, DatePicker, Button, Divider, message, Upload } from 'antd';
import { UploadOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useState, useEffect } from 'react';
import { uploadFile, deleteServerFile } from '../../../utils/fileUpload';
import FilePreview from '../../../components/Common/FilePreview';

const { TextArea } = Input;
const { Option } = Select;

interface MaterialFormProps {
  visible: boolean;
  record: any;
  mode: 'view' | 'edit' | 'add';
  onCancel: () => void;
  onSave: (values: any) => void;
}

const MaterialForm = ({ visible, record, mode, onCancel, onSave }: MaterialFormProps) => {
  const [form] = Form.useForm();
  const isView = mode === 'view';
  const [fileList, setFileList] = useState<any[]>([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewFile, setPreviewFile] = useState<{ id: string; name: string } | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (visible && !initialized) {
      setInitialized(true);
      
      if (record && Object.keys(record).length > 0) {
        form.setFieldsValue({
          ...record,
          calibrationDate: record.calibrationDate && dayjs(record.calibrationDate).isValid() 
            ? dayjs(record.calibrationDate) 
            : undefined,
          validityPeriod: record.validityPeriod && dayjs(record.validityPeriod).isValid() 
            ? dayjs(record.validityPeriod) 
            : undefined,
          storageDate: record.storageDate && dayjs(record.storageDate).isValid() 
            ? dayjs(record.storageDate) 
            : undefined,
        });
        
        if (record.attachments && record.attachments.length > 0) {
          setFileList(record.attachments.map((att: any, index: number) => ({
            uid: `-${index}`,
            name: att.name,
            status: 'done',
            fileId: att.id,
          })));
        } else {
          setFileList([]);
        }
      } else {
        form.resetFields();
        setFileList([]);
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
        calibrationDate: values.calibrationDate?.format('YYYY-MM-DD'),
        validityPeriod: values.validityPeriod?.format('YYYY-MM-DD'),
        storageDate: values.storageDate?.format('YYYY-MM-DD'),
        attachments: fileList.map(file => ({
          id: file.fileId,
          name: file.name,
          status: file.status,
        })),
      };
      onSave(formattedValues);
      form.resetFields();
      setFileList([]);
      setInitialized(false);
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setFileList([]);
    setInitialized(false);
    onCancel();
  };

  const getTitle = () => {
    switch (mode) {
      case 'add': return '新增标准物质';
      case 'edit': return '编辑标准物质';
      case 'view': return '查看标准物质';
      default: return '标准物质详情';
    }
  };

  const customUpload = async (options: any) => {
    const { file, onSuccess, onError, onProgress } = options;
    
    try {
      onProgress?.({ percent: 30 });
      const result = await uploadFile(file);
      onProgress?.({ percent: 100 });
      
      const newFile = {
        uid: `-${Date.now()}`,
        name: result.name,
        status: 'done',
        fileId: result.id,
      };
      
      setFileList(prev => [...prev, newFile]);
      onSuccess?.('ok');
      message.success('文件上传成功');
    } catch (error) {
      console.error('上传失败:', error);
      onError?.(error);
      message.error('文件上传失败: ' + (error as Error).message);
    }
  };

  const handleRemove = async (file: any) => {
    try {
      if (file.fileId && file.status === 'done') {
        await deleteServerFile(file.fileId);
      }
      setFileList(prev => prev.filter(item => item.uid !== file.uid));
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
        width={700}
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
              label="标准物质名称"
              name="materialName"
              rules={[{ required: true, message: '请输入标准物质名称' }]}
            >
              <Input placeholder="请输入标准物质名称" />
            </Form.Item>

            <Form.Item
              label="标准物质编号"
              name="materialNo"
              rules={[{ required: true, message: '请输入标准物质编号' }]}
            >
              <Input placeholder="请输入标准物质编号" />
            </Form.Item>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item
              label="规格型号"
              name="specification"
            >
              <Input placeholder="请输入规格型号" />
            </Form.Item>

            <Form.Item
              label="证书编号"
              name="certificateNo"
            >
              <Input placeholder="请输入证书编号" />
            </Form.Item>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item
              label="生产厂商"
              name="manufacturer"
            >
              <Input placeholder="请输入生产厂商" />
            </Form.Item>

            <Form.Item
              label="标准物质状态"
              name="materialStatus"
              rules={[{ required: true, message: '请选择标准物质状态' }]}
            >
              <Select placeholder="请选择标准物质状态">
                <Option value="在库">在库</Option>
                <Option value="使用中">使用中</Option>
                <Option value="已用完">已用完</Option>
                <Option value="过期">过期</Option>
              </Select>
            </Form.Item>
          </div>

          <Divider orientation="left">时间信息</Divider>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item
              label="定值时间"
              name="calibrationDate"
            >
              <DatePicker style={{ width: '100%' }} placeholder="请选择定值时间" />
            </Form.Item>

            <Form.Item
              label="有效期"
              name="validityPeriod"
            >
              <DatePicker style={{ width: '100%' }} placeholder="请选择有效期" />
            </Form.Item>
          </div>

          <Form.Item
            label="入库时间"
            name="storageDate"
          >
            <DatePicker style={{ width: '100%' }} placeholder="请选择入库时间" />
          </Form.Item>

          <Divider orientation="left">附件</Divider>

          <Form.Item
            label="相关附件"
            name="attachments"
          >
            <Upload
              customRequest={customUpload}
              onRemove={handleRemove}
              fileList={fileList}
              onPreview={handlePreview}
              disabled={isView}
              accept=".doc,.docx,.pdf,.jpg,.jpeg,.png"
              listType="text"
              showUploadList={{
                showRemoveIcon: !isView,
                showPreviewIcon: true,
              }}
            >
              {!isView && (
                <Button icon={<UploadOutlined />}>
                  上传附件
                </Button>
              )}
            </Upload>
          </Form.Item>

          {fileList.length > 0 && (
            <Form.Item label="文件操作">
              <div>
                {fileList.map((file, index) => (
                  <div key={index} style={{ marginBottom: 8, display: 'flex', alignItems: 'center' }}>
                    <span style={{ marginRight: 8 }}>{file.name}</span>
                    <Button
                      type="link"
                      size="small"
                      icon={<EyeOutlined />}
                      onClick={() => handlePreview(file)}
                      disabled={false}
                    >
                      预览
                    </Button>
                    {!isView && (
                      <Button
                        type="link"
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={() => handleRemove(file)}
                      >
                        删除
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </Form.Item>
          )}
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

export default MaterialForm;
