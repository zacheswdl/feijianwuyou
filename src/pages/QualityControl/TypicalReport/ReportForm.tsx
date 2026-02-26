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

interface ReportFormProps {
  visible: boolean;
  record: any;
  mode: 'view' | 'edit' | 'add';
  onCancel: () => void;
  onSave: (values: any) => void;
}

const ReportForm: React.FC<ReportFormProps> = ({
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
        createDate: record.createDate ? dayjs(record.createDate) : null,
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
        createDate: values.createDate?.format('YYYY-MM-DD'),
      });
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  return (
    <Modal
      title={mode === 'add' ? '新增报告' : mode === 'edit' ? '编辑报告' : '查看报告'}
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
          name="reportCode"
          label="报告编号"
          rules={[{ required: true, message: '请输入报告编号' }]}
        >
          <Input placeholder="请输入报告编号" />
        </Form.Item>

        <Form.Item
          name="reportName"
          label="报告名称"
          rules={[{ required: true, message: '请输入报告名称' }]}
        >
          <Input placeholder="请输入报告名称" />
        </Form.Item>

        <Form.Item
          name="reportType"
          label="报告类型"
          rules={[{ required: true, message: '请选择报告类型' }]}
        >
          <Select placeholder="请选择报告类型">
            <Option value="test">检测报告</Option>
            <Option value="calibration">校准报告</Option>
            <Option value="review">评审报告</Option>
            <Option value="other">其他</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="createDate"
          label="编制日期"
          rules={[{ required: true, message: '请选择编制日期' }]}
        >
          <DatePicker style={{ width: '100%' }} placeholder="选择日期" />
        </Form.Item>

        <Form.Item
          name="reportContent"
          label="报告内容"
          rules={[{ required: true, message: '请输入报告内容' }]}
        >
          <TextArea rows={4} placeholder="请输入报告内容摘要" />
        </Form.Item>

        <Form.Item
          name="creator"
          label="编制人"
          rules={[{ required: true, message: '请输入编制人' }]}
        >
          <Input placeholder="请输入编制人姓名" />
        </Form.Item>

        <Form.Item
          name="status"
          label="状态"
          rules={[{ required: true, message: '请选择状态' }]}
        >
          <Select placeholder="请选择状态">
            <Option value="draft">草稿</Option>
            <Option value="pending">待审核</Option>
            <Option value="approved">已批准</Option>
          </Select>
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

export default ReportForm;
