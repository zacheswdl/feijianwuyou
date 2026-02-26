import { Modal, Form, Input, Select, DatePicker, Button, Divider, message, Upload } from 'antd';
import { UploadOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useState, useEffect } from 'react';
import { uploadFile, deleteServerFile } from '../../../utils/fileUpload';
import FilePreview from '../../../components/Common/FilePreview';

const { TextArea } = Input;
const { Option } = Select;

interface TrainingFormProps {
  visible: boolean;
  record: any;
  mode: 'view' | 'edit' | 'add';
  onCancel: () => void;
  onSave: (values: any) => void;
}

const TrainingForm = ({ visible, record, mode, onCancel, onSave }: TrainingFormProps) => {
  const [form] = Form.useForm();
  const isView = mode === 'view';
  const [implementationFile, setImplementationFile] = useState<any>(null);
  const [effectivenessFile, setEffectivenessFile] = useState<any>(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewFile, setPreviewFile] = useState<{ id: string; name: string } | null>(null);
  const [initialized, setInitialized] = useState(false);

  // 使用 useEffect 来处理 modal 打开时的初始化
  useEffect(() => {
    if (visible && !initialized) {
      setInitialized(true);
      
      if (record && Object.keys(record).length > 0) {
        // 编辑或查看模式
        form.setFieldsValue({
          ...record,
          planDate: record.planDate && dayjs(record.planDate).isValid() 
            ? dayjs(record.planDate) 
            : undefined,
        });
        
        // 设置实施记录文件
        if (record.implementationRecord) {
          setImplementationFile({
            uid: 'implementation',
            name: '实施记录.pdf',
            status: 'done',
            fileId: record.implementationRecord,
          });
        } else {
          setImplementationFile(null);
        }
        
        // 设置有效性评价文件
        if (record.effectivenessEvaluation) {
          setEffectivenessFile({
            uid: 'effectiveness',
            name: '有效性评价.pdf',
            status: 'done',
            fileId: record.effectivenessEvaluation,
          });
        } else {
          setEffectivenessFile(null);
        }
      } else {
        // 新增模式
        form.resetFields();
        setImplementationFile(null);
        setEffectivenessFile(null);
      }
    }
    
    // modal 关闭时重置初始化状态
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
      // 转换日期格式
      const formattedValues = {
        ...values,
        planDate: values.planDate?.format('YYYY-MM-DD'),
        // 保存文件信息
        implementationRecord: implementationFile?.fileId || null,
        effectivenessEvaluation: effectivenessFile?.fileId || null,
      };
      onSave(formattedValues);
      form.resetFields();
      setImplementationFile(null);
      setEffectivenessFile(null);
      setInitialized(false);
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setImplementationFile(null);
    setEffectivenessFile(null);
    setInitialized(false);
    onCancel();
  };

  const getTitle = () => {
    switch (mode) {
      case 'add': return '新增培训计划';
      case 'edit': return '编辑培训计划';
      case 'view': return '查看培训计划';
      default: return '培训计划详情';
    }
  };

  // 自定义上传 - 上传到后端服务器
  const customUpload = async (options: any, type: 'implementation' | 'effectiveness') => {
    const { file, onSuccess, onError, onProgress } = options;
    
    try {
      onProgress?.({ percent: 30 });
      const result = await uploadFile(file);
      onProgress?.({ percent: 100 });
      
      const newFile = {
        uid: `${type}_${Date.now()}`,
        name: result.name,
        status: 'done',
        fileId: result.id,
      };
      
      if (type === 'implementation') {
        setImplementationFile(newFile);
      } else {
        setEffectivenessFile(newFile);
      }
      
      onSuccess?.('ok');
      message.success('文件上传成功');
    } catch (error) {
      console.error('上传失败:', error);
      onError?.(error);
      message.error('文件上传失败: ' + (error as Error).message);
    }
  };

  // 处理文件移除
  const handleRemove = async (type: 'implementation' | 'effectiveness') => {
    try {
      const file = type === 'implementation' ? implementationFile : effectivenessFile;
      if (file?.fileId) {
        await deleteServerFile(file.fileId);
      }
      
      if (type === 'implementation') {
        setImplementationFile(null);
      } else {
        setEffectivenessFile(null);
      }
      return true;
    } catch (error) {
      console.error('删除文件失败:', error);
      message.error('删除文件失败');
      return false;
    }
  };

  // 打开文件预览
  const handlePreview = (file: any) => {
    if (file?.fileId) {
      setPreviewFile({ id: file.fileId, name: file.name });
      setPreviewVisible(true);
    }
  };

  // 渲染文件上传区域
  const renderFileUpload = (type: 'implementation' | 'effectiveness', label: string, file: any) => {
    return (
      <div style={{ marginBottom: 16 }}>
        <div style={{ marginBottom: 8, fontWeight: 'bold' }}>{label}</div>
        {!isView && !file && (
          <Upload
            customRequest={(options) => customUpload(options, type)}
            showUploadList={false}
            accept=".doc,.docx,.pdf,.jpg,.jpeg,.png"
          >
            <Button icon={<UploadOutlined />}>
              上传{label}
            </Button>
          </Upload>
        )}
        
        {file && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>{file.name}</span>
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
                onClick={() => handleRemove(type)}
              >
                删除
              </Button>
            )}
          </div>
        )}
      </div>
    );
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
          {/* 基本信息 */}
          <Divider orientation="left">基本信息</Divider>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item
              label="培训项目"
              name="trainingProject"
              rules={[{ required: true, message: '请输入培训项目' }]}
            >
              <Input placeholder="请输入培训项目名称" />
            </Form.Item>

            <Form.Item
              label="计划培训时间"
              name="planDate"
              rules={[{ required: true, message: '请选择计划培训时间' }]}
            >
              <DatePicker style={{ width: '100%' }} placeholder="请选择计划培训时间" />
            </Form.Item>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item
              label="培训对象"
              name="trainingTarget"
              rules={[{ required: true, message: '请输入培训对象' }]}
            >
              <Input placeholder="请输入培训对象，如：全体员工、检测车间人员" />
            </Form.Item>

            <Form.Item
              label="培训形式"
              name="trainingForm"
              rules={[{ required: true, message: '请选择培训形式' }]}
            >
              <Select placeholder="请选择培训形式">
                <Option value="内部培训">内部培训</Option>
                <Option value="外部培训">外部培训</Option>
                <Option value="线上培训">线上培训</Option>
                <Option value="外出学习">外出学习</Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item
            label="培训内容"
            name="trainingContent"
            rules={[{ required: true, message: '请输入培训内容' }]}
          >
            <TextArea 
              rows={4} 
              placeholder="请输入培训内容，包括培训目的、培训大纲、培训要求等"
            />
          </Form.Item>

          {/* 培训附件 */}
          <Divider orientation="left">培训附件</Divider>
          
          {renderFileUpload('implementation', '实施记录', implementationFile)}
          {renderFileUpload('effectiveness', '有效性评价', effectivenessFile)}
        </Form>
      </Modal>

      {/* 文件预览弹窗 */}
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

export default TrainingForm;
