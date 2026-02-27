import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, DatePicker, Button, Space } from 'antd';
import type { StandardSubscriptionRecord } from '../../../types/index';
import dayjs from 'dayjs';
const { TextArea } = Input;

interface SubscribeFormProps { visible: boolean; record: StandardSubscriptionRecord | null; mode: 'add' | 'edit' | 'view'; onCancel: () => void; onSave: (values: any) => void; }

const SubscribeForm: React.FC<SubscribeFormProps> = ({ visible, record, mode, onCancel, onSave }) => {
  const [form] = Form.useForm();
  const isView = mode === 'view';
  useEffect(() => {
    if (visible && record) { form.setFieldsValue({ ...record, subscribeDate: record.subscribeDate ? dayjs(record.subscribeDate) : null }); }
    else if (visible) { form.resetFields(); form.setFieldsValue({ subscribeDate: dayjs() }); }
  }, [visible, record, form]);
  const handleSubmit = async () => {
    if (isView) { onCancel(); return; }
    try { const values = await form.validateFields(); onSave({ ...values, subscribeDate: values.subscribeDate?.format('YYYY-MM-DD') }); } catch (e) { console.error('表单验证失败:', e); }
  };
  return (
    <Modal title={mode === 'add' ? '新增订阅' : mode === 'edit' ? '编辑订阅' : '查看订阅'} open={visible} onCancel={onCancel} width={700}
      footer={isView ? <Button onClick={onCancel}>关闭</Button> : <Space><Button onClick={onCancel}>取消</Button><Button type="primary" onClick={handleSubmit}>保存</Button></Space>}>
      <Form form={form} layout="vertical" disabled={isView}>
        <Form.Item name="subscriberName" label="订阅人" rules={[{ required: true, message: '请输入订阅人' }]}><Input placeholder="请输入订阅人" /></Form.Item>
        <Form.Item name="department" label="部门" rules={[{ required: true, message: '请输入部门' }]}><Input placeholder="请输入部门" /></Form.Item>
        <Form.Item name="subscribeType" label="订阅类型" rules={[{ required: true, message: '请选择订阅类型' }]}>
          <Select placeholder="请选择订阅类型"><Select.Option value="新标准发布">新标准发布</Select.Option><Select.Option value="标准修订">标准修订</Select.Option><Select.Option value="标准废止">标准废止</Select.Option><Select.Option value="全部">全部</Select.Option></Select>
        </Form.Item>
        <Form.Item name="subscribeScope" label="订阅范围" rules={[{ required: true, message: '请输入订阅范围' }]}><TextArea rows={3} placeholder="请输入订阅范围" /></Form.Item>
        <Form.Item name="contactEmail" label="联系邮箱" rules={[{ required: true, message: '请输入联系邮箱' }, { type: 'email', message: '请输入正确的邮箱格式' }]}><Input placeholder="请输入联系邮箱" /></Form.Item>
        <Form.Item name="contactPhone" label="联系电话" rules={[{ required: true, message: '请输入联系电话' }]}><Input placeholder="请输入联系电话" /></Form.Item>
        <Form.Item name="subscribeDate" label="订阅日期" rules={[{ required: true, message: '请选择订阅日期' }]}><DatePicker style={{ width: '100%' }} /></Form.Item>
        <Form.Item name="status" label="状态" rules={[{ required: true, message: '请选择状态' }]}>
          <Select placeholder="请选择状态"><Select.Option value="有效">有效</Select.Option><Select.Option value="已暂停">已暂停</Select.Option><Select.Option value="已取消">已取消</Select.Option></Select>
        </Form.Item>
        <Form.Item name="remark" label="备注"><TextArea rows={2} placeholder="请输入备注（可选）" /></Form.Item>
      </Form>
    </Modal>
  );
};
export default SubscribeForm;
