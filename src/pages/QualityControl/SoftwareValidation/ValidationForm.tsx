import React, { useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Space,
} from 'antd';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

interface ValidationFormProps {
  visible: boolean;
  record: any;
  mode: 'view' | 'edit' | 'add';
  onCancel: () => void;
  onSave: (values: any) => void;
}

const ValidationForm: React.FC<ValidationFormProps> = ({
  visible,
  record,
  mode,
  onCancel,
  onSave,
}) => {
  const [form] = Form.useForm();
  const isView = mode === 'view';

  useEffect(() => {
    if (visible && record) {
      form.setFieldsValue({
        ...record,
        validationDate: record.validationDate ? dayjs(record.validationDate) : null,
      });
    } else {
      form.resetFields();
    }
  }, [visible, record, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      onSave({
        ...values,
        validationDate: values.validationDate?.format('YYYY-MM-DD'),
      });
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  return (
    <Modal
      title={mode === 'add' ? '新增确认记录' : mode === 'edit' ? '编辑确认记录' : '查看确认记录'}
      open={visible}
      onCancel={onCancel}
      footer={
        isView ? (
          <Button onClick={onCancel}>关闭</Button>
        ) : (
          <Space>
            <Button onClick={onCancel}>取消</Button>
            <Button type="primary" onClick={handleSubmit}>
              保存
            </Button>
          </Space>
        )
      }
      width={700}
    >
      <Form
        form={form}
        layout="vertical"
        disabled={isView}
      >
        <Form.Item
          name="softwareName"
          label="软件名称"
          rules={[{ required: true, message: '请输入软件名称' }]}
        >
          <Input placeholder="请输入软件名称" />
        </Form.Item>

        <Form.Item
          name="version"
          label="版本号"
          rules={[{ required: true, message: '请输入版本号' }]}
        >
          <Input placeholder="如：v1.0.0" />
        </Form.Item>

        <Form.Item
          name="validationContent"
          label="确认内容"
          rules={[{ required: true, message: '请输入确认内容' }]}
        >
          <TextArea rows={3} placeholder="请详细描述软件适用性确认的内容" />
        </Form.Item>

        <Form.Item
          name="validationDate"
          label="确认日期"
          rules={[{ required: true, message: '请选择确认日期' }]}
        >
          <DatePicker style={{ width: '100%' }} placeholder="选择日期" />
        </Form.Item>

        <Form.Item
          name="validationResult"
          label="确认结果"
          rules={[{ required: true, message: '请选择确认结果' }]}
        >
          <Select placeholder="请选择确认结果">
            <Option value="passed">通过</Option>
            <Option value="failed">不通过</Option>
            <Option value="pending">待确认</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="validator"
          label="确认人"
          rules={[{ required: true, message: '请输入确认人' }]}
        >
          <Input placeholder="请输入确认人姓名" />
        </Form.Item>

        <Form.Item
          name="remark"
          label="备注"
        >
          <TextArea rows={3} placeholder="请输入备注信息（可选）" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ValidationForm;
