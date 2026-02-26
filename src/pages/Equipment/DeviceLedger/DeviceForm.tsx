import { Modal, Form, Input, Select, DatePicker, Button, Divider, message, Upload, Radio, InputNumber, Space } from 'antd';
import { UploadOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useState, useEffect } from 'react';
import { uploadFile, deleteServerFile } from '../../../utils/fileUpload';
import FilePreview from '../../../components/Common/FilePreview';

const { TextArea } = Input;
const { Option } = Select;

interface DeviceFormProps {
  visible: boolean;
  record: any;
  mode: 'view' | 'edit' | 'add';
  onCancel: () => void;
  onSave: (values: any) => void;
}

const DeviceForm = ({ visible, record, mode, onCancel, onSave }: DeviceFormProps) => {
  const [form] = Form.useForm();
  const isView = mode === 'view';
  
  // 验收记录文件（最多1份）
  const [acceptanceFile, setAcceptanceFile] = useState<any>(null);
  // 检定校准证书文件（最多6份）
  const [certificateFiles, setCertificateFiles] = useState<any[]>([]);
  // 其他附件
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
          purchaseDate: record.purchaseDate && dayjs(record.purchaseDate).isValid() 
            ? dayjs(record.purchaseDate) 
            : undefined,
          lastVerificationDate: record.lastVerificationDate && dayjs(record.lastVerificationDate).isValid() 
            ? dayjs(record.lastVerificationDate) 
            : undefined,
          nextVerificationDate: record.nextVerificationDate && dayjs(record.nextVerificationDate).isValid() 
            ? dayjs(record.nextVerificationDate) 
            : undefined,
          lastMaintenanceDate: record.lastMaintenanceDate && dayjs(record.lastMaintenanceDate).isValid()
            ? dayjs(record.lastMaintenanceDate)
            : undefined,
        });
        
        // 设置验收记录文件
        if (record.acceptanceFile) {
          setAcceptanceFile({
            uid: 'acceptance',
            name: record.acceptanceFile.name || '验收记录.pdf',
            status: 'done',
            fileId: record.acceptanceFile.id,
          });
        } else {
          setAcceptanceFile(null);
        }
        
        // 设置检定校准证书文件
        if (record.certificateFiles && record.certificateFiles.length > 0) {
          setCertificateFiles(record.certificateFiles.map((file: any, index: number) => ({
            uid: `cert-${index}`,
            name: file.name,
            status: 'done',
            fileId: file.id,
          })));
        } else {
          setCertificateFiles([]);
        }
        
        // 设置其他附件
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
        setAcceptanceFile(null);
        setCertificateFiles([]);
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
        purchaseDate: values.purchaseDate?.format('YYYY-MM-DD'),
        lastVerificationDate: values.lastVerificationDate?.format('YYYY-MM-DD'),
        nextVerificationDate: values.nextVerificationDate?.format('YYYY-MM-DD'),
        lastMaintenanceDate: values.lastMaintenanceDate?.format('YYYY-MM-DD'),
        // 验收记录文件
        acceptanceFile: acceptanceFile ? {
          id: acceptanceFile.fileId,
          name: acceptanceFile.name,
        } : null,
        // 检定校准证书文件
        certificateFiles: certificateFiles.map(file => ({
          id: file.fileId,
          name: file.name,
        })),
        // 其他附件
        attachments: fileList.map(file => ({
          id: file.fileId,
          name: file.name,
          status: file.status,
        })),
      };
      onSave(formattedValues);
      form.resetFields();
      setAcceptanceFile(null);
      setCertificateFiles([]);
      setFileList([]);
      setInitialized(false);
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setAcceptanceFile(null);
    setCertificateFiles([]);
    setFileList([]);
    setInitialized(false);
    onCancel();
  };

  const getTitle = () => {
    switch (mode) {
      case 'add': return '新增设备';
      case 'edit': return '编辑设备';
      case 'view': return '查看设备';
      default: return '设备详情';
    }
  };

  // 上传验收记录（最多1份）
  const uploadAcceptanceFile = async (options: any) => {
    const { file, onSuccess, onError, onProgress } = options;
    
    try {
      onProgress?.({ percent: 30 });
      const result = await uploadFile(file);
      onProgress?.({ percent: 100 });
      
      setAcceptanceFile({
        uid: 'acceptance',
        name: result.name,
        status: 'done',
        fileId: result.id,
      });
      
      onSuccess?.('ok');
      message.success('验收记录上传成功');
    } catch (error) {
      console.error('上传失败:', error);
      onError?.(error);
      message.error('文件上传失败: ' + (error as Error).message);
    }
  };

  // 删除验收记录
  const removeAcceptanceFile = async () => {
    try {
      if (acceptanceFile?.fileId) {
        await deleteServerFile(acceptanceFile.fileId);
      }
      setAcceptanceFile(null);
      return true;
    } catch (error) {
      console.error('删除文件失败:', error);
      message.error('删除文件失败');
      return false;
    }
  };

  // 上传检定校准证书（最多6份）
  const uploadCertificateFile = async (options: any) => {
    const { file, onSuccess, onError, onProgress } = options;
    
    if (certificateFiles.length >= 6) {
      message.error('检定校准证书最多只能上传6份');
      onError?.(new Error('最多只能上传6份'));
      return;
    }
    
    try {
      onProgress?.({ percent: 30 });
      const result = await uploadFile(file);
      onProgress?.({ percent: 100 });
      
      const newFile = {
        uid: `cert-${Date.now()}`,
        name: result.name,
        status: 'done',
        fileId: result.id,
      };
      
      setCertificateFiles(prev => [...prev, newFile]);
      onSuccess?.('ok');
      message.success('证书上传成功');
    } catch (error) {
      console.error('上传失败:', error);
      onError?.(error);
      message.error('文件上传失败: ' + (error as Error).message);
    }
  };

  // 删除检定校准证书
  const removeCertificateFile = async (file: any) => {
    try {
      if (file.fileId && file.status === 'done') {
        await deleteServerFile(file.fileId);
      }
      setCertificateFiles(prev => prev.filter(item => item.uid !== file.uid));
      return true;
    } catch (error) {
      console.error('删除文件失败:', error);
      message.error('删除文件失败');
      return false;
    }
  };

  // 上传其他附件
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
        width={900}
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
              label="设备名称"
              name="deviceName"
              rules={[{ required: true, message: '请输入设备名称' }]}
            >
              <Input placeholder="请输入设备名称" />
            </Form.Item>

            <Form.Item
              label="设备自编号"
              name="customNo"
            >
              <Input placeholder="请输入设备自编号" />
            </Form.Item>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item
              label="设备编号"
              name="deviceNo"
              rules={[{ required: true, message: '请输入设备编号' }]}
            >
              <Input placeholder="请输入设备编号" />
            </Form.Item>

            <Form.Item
              label="规格型号"
              name="specification"
            >
              <Input placeholder="请输入规格型号" />
            </Form.Item>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item
              label="分辨力"
              name="resolution"
            >
              <Input placeholder="请输入分辨力" />
            </Form.Item>

            <Form.Item
              label="准确度等级"
              name="accuracyClass"
            >
              <Input placeholder="请输入准确度等级" />
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
              label="是否期间核查"
              name="needInspection"
            >
              <Radio.Group>
                <Radio value={true}>是</Radio>
                <Radio value={false}>否</Radio>
              </Radio.Group>
            </Form.Item>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item
              label="设备状态"
              name="deviceStatus"
              rules={[{ required: true, message: '请选择设备状态' }]}
            >
              <Select placeholder="请选择设备状态">
                <Option value="在用">在用</Option>
                <Option value="停用">停用</Option>
                <Option value="报废">报废</Option>
                <Option value="闲置">闲置</Option>
              </Select>
            </Form.Item>

            <Form.Item label="验收记录">
              <Space>
                <Button 
                  type="primary" 
                  size="small"
                  disabled={!acceptanceFile}
                  onClick={() => {
                    if (acceptanceFile) {
                      window.dispatchEvent(new CustomEvent('previewAcceptance', { 
                        detail: { file: acceptanceFile } 
                      }));
                    }
                  }}
                >
                  查看
                </Button>
                {!isView && (
                  <Upload
                    customRequest={uploadAcceptanceFile}
                    showUploadList={false}
                    accept=".doc,.docx,.pdf,.jpg,.jpeg,.png"
                    disabled={!!acceptanceFile}
                  >
                    <Button size="small" icon={<UploadOutlined />} disabled={!!acceptanceFile}>
                      {acceptanceFile ? '已上传' : '上传附件'}
                    </Button>
                  </Upload>
                )}
                {acceptanceFile && !isView && (
                  <Button 
                    type="link" 
                    danger 
                    size="small" 
                    icon={<DeleteOutlined />}
                    onClick={removeAcceptanceFile}
                  >
                    删除
                  </Button>
                )}
              </Space>
              {acceptanceFile && (
                <div style={{ marginTop: 4, fontSize: 12, color: '#666' }}>
                  {acceptanceFile.name}
                </div>
              )}
            </Form.Item>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item
              label="检定标准间隔(年)"
              name="verificationInterval"
            >
              <InputNumber style={{ width: '100%' }} min={0} placeholder="请输入检定标准间隔" />
            </Form.Item>

            <Form.Item label="检定校准证书">
              <Space>
                <Button 
                  type="primary" 
                  size="small"
                  disabled={certificateFiles.length === 0}
                  onClick={() => {
                    if (certificateFiles.length > 0) {
                      window.dispatchEvent(new CustomEvent('previewCertificateForm', { 
                        detail: { files: certificateFiles, currentIndex: 0 } 
                      }));
                    }
                  }}
                >
                  查看
                </Button>
                {!isView && (
                  <Upload
                    customRequest={uploadCertificateFile}
                    showUploadList={false}
                    accept=".doc,.docx,.pdf,.jpg,.jpeg,.png"
                    disabled={certificateFiles.length >= 6}
                  >
                    <Button size="small" icon={<UploadOutlined />} disabled={certificateFiles.length >= 6}>
                      上传附件 ({certificateFiles.length}/6)
                    </Button>
                  </Upload>
                )}
              </Space>
              {certificateFiles.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  {certificateFiles.map((file, index) => (
                    <div key={file.uid} style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
                      {index + 1}. {file.name}
                      {!isView && (
                        <Button 
                          type="link" 
                          danger 
                          size="small" 
                          style={{ marginLeft: 8 }}
                          onClick={() => removeCertificateFile(file)}
                        >
                          删除
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Form.Item>
          </div>

          <Divider orientation="left">时间信息</Divider>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item
              label="末次检定日期"
              name="lastVerificationDate"
            >
              <DatePicker style={{ width: '100%' }} placeholder="请选择末次检定日期" />
            </Form.Item>

            <Form.Item
              label="末次核查日期"
              name="lastInspectionDate"
            >
              <DatePicker style={{ width: '100%' }} placeholder="请选择末次核查日期" />
            </Form.Item>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item
              label="量程"
              name="measurementRange"
            >
              <Input placeholder="请输入量程" />
            </Form.Item>

            <Form.Item
              label="采购日期"
              name="purchaseDate"
            >
              <DatePicker style={{ width: '100%' }} placeholder="请选择采购日期" />
            </Form.Item>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item
              label="末次维护日期"
              name="lastMaintenanceDate"
            >
              <DatePicker style={{ width: '100%' }} placeholder="请选择末次维护日期" />
            </Form.Item>

            <Form.Item
              label="检测线"
              name="detectionLine"
            >
              <Select placeholder="请选择检测线">
                <Option value="外观检测线">外观检测线</Option>
                <Option value="安检1号线（平板）">安检1号线（平板）</Option>
                <Option value="安检2号线（滚筒）">安检2号线（滚筒）</Option>
                <Option value="安检3号线（摩托）">安检3号线（摩托）</Option>
                <Option value="环保1号线">环保1号线</Option>
                <Option value="环保2号线">环保2号线</Option>
                <Option value="环保3号线">环保3号线</Option>
                <Option value="环保4号线">环保4号线</Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="使用部门"
              name="usageDepartment"
            >
              <Select placeholder="请选择使用部门">
                <Option value="检测车间">检测车间</Option>
                <Option value="环保车间">环保车间</Option>
                <Option value="外检区">外检区</Option>
                <Option value="营业大厅">营业大厅</Option>
              </Select>
            </Form.Item>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item
              label="设备原值(万元)"
              name="deviceValue"
            >
              <InputNumber style={{ width: '100%' }} min={0} step={0.01} placeholder="请输入设备原值" />
            </Form.Item>

            <Form.Item
              label="计量方式"
              name="measurementMethod"
            >
              <Radio.Group>
                <Radio value="检定">检定</Radio>
                <Radio value="校准">校准</Radio>
                <Radio value="测试">测试</Radio>
                <Radio value="无需计量">无需计量</Radio>
              </Radio.Group>
            </Form.Item>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item
              label="存放地点"
              name="storageLocation"
            >
              <Select placeholder="请选择存放地点">
                <Option value="检测车间">检测车间</Option>
                <Option value="环保车间">环保车间</Option>
                <Option value="外检区">外检区</Option>
                <Option value="档案室">档案室</Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="下次检定日期"
              name="nextVerificationDate"
            >
              <DatePicker style={{ width: '100%' }} placeholder="请选择下次检定日期" />
            </Form.Item>
          </div>

          <Divider orientation="left">设备附件</Divider>

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

export default DeviceForm;
