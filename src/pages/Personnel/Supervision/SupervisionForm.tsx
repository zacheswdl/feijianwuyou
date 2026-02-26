import { Modal, Form, Input, Select, DatePicker, Radio, Upload, Button, message, Divider } from 'antd';
import { UploadOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useState, useEffect } from 'react';
import { uploadFile, deleteServerFile } from '../../../utils/fileUpload';
import FilePreview from '../../../components/Common/FilePreview';

const { TextArea } = Input;
const { Option } = Select;

interface SupervisionFormProps {
  open: boolean;
  record: any;
  mode: 'view' | 'edit' | 'add';
  onCancel: () => void;
  onSave: (values: any) => void;
}

const SupervisionForm = ({ open, record, mode, onCancel, onSave }: SupervisionFormProps) => {
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
          supervisionDate: record.supervisionDate && dayjs(record.supervisionDate).isValid() 
            ? dayjs(record.supervisionDate) 
            : undefined,
          nextSupervisionDate: record.nextSupervisionDate && dayjs(record.nextSupervisionDate).isValid() 
            ? dayjs(record.nextSupervisionDate) 
            : undefined,
          confirmDate: record.confirmDate && dayjs(record.confirmDate).isValid() 
            ? dayjs(record.confirmDate) 
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
        supervisionDate: values.supervisionDate?.format('YYYY-MM-DD'),
        nextSupervisionDate: values.nextSupervisionDate?.format('YYYY-MM-DD'),
        confirmDate: values.confirmDate?.format('YYYY-MM-DD'),
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
      case 'add': return '新增质量监督记录';
      case 'edit': return '编辑质量监督记录';
      case 'view': return '查看质量监督记录';
      default: return '质量监督详情';
    }
  };

  // 自定义上传 - 上传到后端服务器
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

  // 处理文件移除
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
          {/* 基本信息 */}
          <Divider orientation="left">基本信息</Divider>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item
              label="检测项目名称"
              name="projectName"
              rules={[{ required: true, message: '请输入检测项目名称' }]}
            >
              <Input placeholder="如：机动车安全技术检验" />
            </Form.Item>

            <Form.Item
              label="检测人员"
              name="personName"
              rules={[{ required: true, message: '请输入检测人员姓名' }]}
            >
              <Input placeholder="请输入检测人员姓名" />
            </Form.Item>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item
              label="质量监督原因"
              name="supervisionReason"
              rules={[{ required: true, message: '请输入质量监督原因' }]}
            >
              <Select placeholder="请选择监督原因">
                <Option value="日常监督">日常监督</Option>
                <Option value="新上岗监督">新上岗监督</Option>
                <Option value="投诉调查">投诉调查</Option>
                <Option value="能力验证">能力验证</Option>
                <Option value="定期监督">定期监督</Option>
                <Option value="其他">其他</Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="监督日期"
              name="supervisionDate"
              rules={[{ required: true, message: '请选择监督日期' }]}
            >
              <DatePicker style={{ width: '100%' }} placeholder="请选择监督日期" />
            </Form.Item>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item
              label="质量监督员"
              name="supervisor"
              rules={[{ required: true, message: '请输入质量监督员姓名' }]}
            >
              <Input placeholder="请输入质量监督员姓名" />
            </Form.Item>

            <Form.Item
              label="监督结果"
              name="result"
              rules={[{ required: true, message: '请选择监督结果' }]}
            >
              <Radio.Group>
                <Radio value="合格">合格</Radio>
                <Radio value="基本合格">基本合格</Radio>
                <Radio value="不合格">不合格</Radio>
              </Radio.Group>
            </Form.Item>
          </div>

          {/* 质量监督情况记录 */}
          <Divider orientation="left">质量监督情况记录</Divider>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item
              label="1. 样品是否受控"
              name="sampleControl"
            >
              <TextArea rows={2} placeholder="描述样品状态、标识、存储等情况" />
            </Form.Item>

            <Form.Item
              label="5. 原始记录是否填写正确，数据是否原始性"
              name="recordCheck"
            >
              <TextArea rows={2} placeholder="描述原始记录填写情况" />
            </Form.Item>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item
              label="2. 检测环境是否满足检测要求"
              name="environmentCheck"
            >
              <TextArea rows={2} placeholder="描述温度、湿度、环境条件等" />
            </Form.Item>

            <Form.Item
              label="6. 执行检测依据标准是否正确"
              name="standardCheck"
            >
              <TextArea rows={2} placeholder="描述所依据的标准规范" />
            </Form.Item>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item
              label="3. 检测过程是否正确严格按作业指导书或标准执行"
              name="procedureCheck"
            >
              <TextArea rows={2} placeholder="描述检测操作过程是否符合要求" />
            </Form.Item>

            <Form.Item
              label="7. 结论判断是否正确"
              name="conclusionCheck"
            >
              <TextArea rows={2} placeholder="描述检测结论判断情况" />
            </Form.Item>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item
              label="4. 对仪器设备的操作是否规范"
              name="equipmentCheck"
            >
              <TextArea rows={2} placeholder="描述仪器设备使用情况" />
            </Form.Item>

            <Form.Item
              label="8. 检测人员是否持有有效的上岗证"
              name="certificateCheck"
            >
              <TextArea rows={2} placeholder="描述上岗证持有情况" />
            </Form.Item>
          </div>

          <Form.Item
            label="其他情况说明"
            name="otherIssues"
          >
            <TextArea rows={3} placeholder="其他需要说明的情况" />
          </Form.Item>

          {/* 发现问题及整改 */}
          <Divider orientation="left">发现问题及整改</Divider>
          
          <Form.Item
            label="发现问题描述"
            name="issues"
          >
            <TextArea rows={3} placeholder="如监督中发现问题，请详细描述" />
          </Form.Item>

          <Form.Item
            label="整改要求"
            name="correctiveRequirements"
          >
            <TextArea rows={3} placeholder="请输入整改要求" />
          </Form.Item>

          <Form.Item
            label="整改措施"
            name="correctiveActions"
          >
            <TextArea rows={3} placeholder="请输入已采取的整改措施" />
          </Form.Item>

          <Form.Item
            label="整改验证"
            name="verification"
          >
            <TextArea rows={2} placeholder="请输入整改验证情况" />
          </Form.Item>

          {/* 监督结论 */}
          <Divider orientation="left">监督结论</Divider>
          
          <Form.Item
            label="质量监督结论"
            name="supervisionConclusion"
          >
            <TextArea rows={3} placeholder="请输入质量监督结论" />
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item
              label="受监督人员确认"
              name="personConfirm"
            >
              <Input placeholder="受监督人员签名" />
            </Form.Item>

            <Form.Item
              label="确认日期"
              name="confirmDate"
            >
              <DatePicker style={{ width: '100%' }} placeholder="请选择确认日期" />
            </Form.Item>
          </div>

          <Form.Item
            label="技术负责人审核"
            name="techManagerReview"
          >
            <Input placeholder="技术负责人签名" />
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item
              label="建议下次监督日期"
              name="nextSupervisionDate"
            >
              <DatePicker style={{ width: '100%' }} placeholder="请选择建议下次监督日期" />
            </Form.Item>
          </div>

          {/* 附件 */}
          <Divider orientation="left">相关附件</Divider>
          
          <Form.Item
            label="上传附件"
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

export default SupervisionForm;
