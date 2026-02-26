import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, DatePicker } from 'antd';
import dayjs from 'dayjs';

interface ComplaintFormProps {
  visible: boolean;
  record: any;
  mode: 'view' | 'edit' | 'add';
  onCancel: () => void;
  onSave: (values: any) => void;
}

const ComplaintForm: React.FC<ComplaintFormProps> = ({
  visible,
  record,
  mode,
  onCancel,
  onSave,
}) => {
  const [form] = Form.useForm();
  const isView = mode === 'view';

  useEffect(() => {
    if (visible) {
      if (record && Object.keys(record).length > 0) {
        form.setFieldsValue({
          ...record,
          complaintDate: record.complaintDate ? dayjs(record.complaintDate) : null,
          handleDate: record.handleDate ? dayjs(record.handleDate) : null,
        });
      } else {
        form.resetFields();
      }
    }
  }, [visible, record, form]);

  const handleOk = () => {
    if (isView) {
      onCancel();
      return;
    }
    form.validateFields().then(values => {
      const formattedValues = {
        ...values,
        complaintDate: values.complaintDate ? values.complaintDate.format('YYYY-MM-DD') : '',
        handleDate: values.handleDate ? values.handleDate.format('YYYY-MM-DD') : '',
      };
      onSave(formattedValues);
    });
  };

  return (
    <Modal
      title={mode === 'add' ? '新增投诉记录' : mode === 'edit' ? '编辑投诉记录' : '查看投诉记录'}
      open={visible}
      onOk={handleOk}
      onCancel={onCancel}
      width={800}
      okButtonProps={{ style: { display: isView ? 'none' : 'inline-block' } }}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="complaintDate"
          label="投诉日期"
          rules={[{ required: true, message: '请选择投诉日期' }]}
        >
          <DatePicker style={{ width: '100%' }} disabled={isView} />
        </Form.Item>

        <Form.Item
          name="customerName"
          label="客户名称"
          rules={[{ required: true, message: '请输入客户名称' }]}
        >
          <Input placeholder="请输入客户名称" disabled={isView} />
        </Form.Item>

        <Form.Item
          name="contactPhone"
          label="联系电话"
          rules={[{ required: true, message: '请输入联系电话' }]}
        >
          <Input placeholder="请输入联系电话" disabled={isView} />
        </Form.Item>

        <Form.Item
          name="complaintType"
          label="投诉类型"
          rules={[{ required: true, message: '请选择投诉类型' }]}
        >
          <Select placeholder="请选择投诉类型" disabled={isView}>
            <Select.Option value="服务态度">服务态度</Select.Option>
            <Select.Option value="检测质量">检测质量</Select.Option>
            <Select.Option value="检测效率">检测效率</Select.Option>
            <Select.Option value="收费问题">收费问题</Select.Option>
            <Select.Option value="其他">其他</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="complaintContent"
          label="投诉内容"
          rules={[{ required: true, message: '请输入投诉内容' }]}
        >
          <Input.TextArea rows={3} placeholder="请输入投诉内容" disabled={isView} />
        </Form.Item>

        <Form.Item
          name="handleStatus"
          label="处理状态"
          rules={[{ required: true, message: '请选择处理状态' }]}
        >
          <Select placeholder="请选择处理状态" disabled={isView}>
            <Select.Option value="待处理">待处理</Select.Option>
            <Select.Option value="处理中">处理中</Select.Option>
            <Select.Option value="已处理">已处理</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="handler"
          label="处理人"
        >
          <Input placeholder="请输入处理人" disabled={isView} />
        </Form.Item>

        <Form.Item
          name="handleDate"
          label="处理日期"
        >
          <DatePicker style={{ width: '100%' }} disabled={isView} />
        </Form.Item>

        <Form.Item
          name="handleResult"
          label="处理结果"
        >
          <Input.TextArea rows={3} placeholder="请输入处理结果" disabled={isView} />
        </Form.Item>

        <Form.Item
          name="remark"
          label="备注"
        >
          <Input.TextArea rows={2} placeholder="请输入备注" disabled={isView} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ComplaintForm;
