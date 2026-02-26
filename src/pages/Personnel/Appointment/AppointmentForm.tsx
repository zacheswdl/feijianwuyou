import { Modal, Form, Input, Upload, Button, DatePicker, message } from 'antd';
import { UploadOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useState, useEffect } from 'react';
import { uploadFile, deleteServerFile } from '../../../utils/fileUpload';
import FilePreview from '../../../components/Common/FilePreview';

const { TextArea } = Input;

interface AppointmentFormProps {
  open: boolean;
  record: any;
  mode: 'view' | 'edit' | 'add';
  onCancel: () => void;
  onSave: (values: any) => void;
}

const AppointmentForm = ({ open, record, mode, onCancel, onSave }: AppointmentFormProps) => {
  const [form] = Form.useForm();
  const isView = mode === 'view';
  const [fileList, setFileList] = useState<any[]>([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewFile, setPreviewFile] = useState<{ id: string; name: string } | null>(null);
  const [initialized, setInitialized] = useState(false);

  // 使用 useEffect 来处理 modal 打开时的初始化
  useEffect(() => {
    if (open && !initialized) {
      setInitialized(true);
      
      if (record) {
        // 编辑或查看模式
        form.setFieldsValue({
          ...record,
          appointDate: record.appointDate && dayjs(record.appointDate).isValid() 
            ? dayjs(record.appointDate) 
            : undefined,
        });
        
        // 设置文件列表
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
        // 新增模式
        form.resetFields();
        setFileList([]);
      }
    }
    
    // modal 关闭时重置初始化状态
    if (!open) {
      setInitialized(false);
    }
  }, [open, record, form, initialized]);

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
        appointDate: values.appointDate?.format('YYYY-MM-DD'),
        // 保存文件信息
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
      case 'add': return '新增任命文件';
      case 'edit': return '编辑任命文件';
      case 'view': return '查看任命文件';
      default: return '任命文件详情';
    }
  };

  // 自定义上传 - 上传到后端服务器
  const customUpload = async (options: any) => {
    const { file, onSuccess, onError, onProgress } = options;
    
    try {
      // 显示上传进度
      onProgress?.({ percent: 30 });
      
      // 上传文件到服务器
      const result = await uploadFile(file);
      
      onProgress?.({ percent: 100 });
      
      // 添加到文件列表
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

  // 处理文件移除
  const handleRemove = async (file: any) => {
    try {
      // 如果文件已上传到服务器，删除服务器上的文件
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

  // 打开文件预览
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
        open={open}
        onOk={handleOk}
        onCancel={handleCancel}
        width={600}
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
          <Form.Item
            label="任命文件编号"
            name="documentNo"
            rules={[{ required: true, message: '请输入任命文件编号' }]}
          >
            <Input placeholder="如：RAAYLS【2023001】号" />
          </Form.Item>

          <Form.Item
            label="任命日期"
            name="appointDate"
            rules={[{ required: true, message: '请选择任命日期' }]}
          >
            <DatePicker style={{ width: '100%' }} placeholder="请选择任命日期" />
          </Form.Item>

          <Form.Item
            label="姓名"
            name="personNames"
            rules={[{ required: true, message: '请输入姓名' }]}
            extra="多个姓名请用顿号（、）分隔"
          >
            <TextArea 
              rows={3} 
              placeholder="请输入这份任命文件内所有人员的姓名，如：吴韬、余伟峰、金益森、管京、陈杭、柳孟绸、林思怡、蒋建娜、刘兴兴、朱武宗、张木卫"
            />
          </Form.Item>

          <Form.Item
            label="备注"
            name="remark"
          >
            <TextArea rows={2} placeholder="请输入备注信息" />
          </Form.Item>

          <Form.Item
            label="任命文件附件"
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
                  上传任命文件（Word或图片）
                </Button>
              )}
            </Upload>
          </Form.Item>

          {/* 已上传文件的预览和删除按钮 */}
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

export default AppointmentForm;
