import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, DatePicker, Button, Space } from 'antd';
import type { ReviewImplementationRecord } from '../../../types/index';
import dayjs from 'dayjs';
const { TextArea } = Input;

interface ImplementationFormProps { visible: boolean; record: ReviewImplementationRecord | null; mode: 'add' | 'edit' | 'view'; onCancel: () => void; onSave: (values: any) => void; }

const ImplementationForm: React.FC<ImplementationFormProps> = ({ visible, record, mode, onCancel, onSave }) => {
  const [form] = Form.useForm();
  const isView = mode === 'view';
  useEffect(() => {
    if (visible && record) { form.setFieldsValue({ ...record, reviewDate: record.reviewDate ? dayjs(record.reviewDate) : null }); }
    else if (visible) { form.resetFields(); form.setFieldsValue({ reviewDate: dayjs() }); }
  }, [visible, record, form]);
  const handleSubmit = async () => {
    if (isView) { onCancel(); return; }
    try { const values = await form.validateFields(); onSave({ ...values, reviewDate: values.reviewDate?.format('YYYY-MM-DD') }); } catch (e) { console.error('表单验证失败:', e); }
  };
  return (
    <Modal title={mode === 'add' ? '新增评审实施计划' : mode === 'edit' ? '编辑评审实施计划' : '查看评审实施计划'} open={visible} onCancel={onCancel} width={700}
      footer={isView ? <Button onClick={onCancel}>关闭</Button> : <Space><Button onClick={onCancel}>取消</Button><Button type="primary" onClick={handleSubmit}>保存</Button></Space>}>
      <Form form={form} layout="vertical" disabled={isView}>
        <Form.Item name="planName" label="计划名称" rules={[{ required: true, message: '请输入计划名称' }]}><Input placeholder="请输入计划名称" /></Form.Item>
        <Form.Item name="reviewDate" label="评审日期" rules={[{ required: true, message: '请选择评审日期' }]}><DatePicker style={{ width: '100%' }} /></Form.Item>
        <Form.Item name="reviewLocation" label="评审地点" rules={[{ required: true, message: '请输入评审地点' }]}><Input placeholder="请输入评审地点" /></Form.Item>
        <Form.Item name="chairperson" label="主持人" rules={[{ required: true, message: '请输入主持人' }]}><Input placeholder="请输入主持人" /></Form.Item>
        <Form.Item name="participants" label="参加人员" rules={[{ required: true, message: '请输入参加人员' }]}><Input placeholder="多人用逗号分隔" /></Form.Item>
        <Form.Item name="reviewItems" label="评审事项" rules={[{ required: true, message: '请输入评审事项' }]}><TextArea rows={3} placeholder="请输入评审事项" /></Form.Item>
        <Form.Item name="preparationRequirements" label="准备要求" rules={[{ required: true, message: '请输入准备要求' }]}><TextArea rows={3} placeholder="请输入准备要求" /></Form.Item>
        <Form.Item name="status" label="状态" rules={[{ required: true, message: '请选择状态' }]}>
          <Select placeholder="请选择状态"><Select.Option value="待评审">待评审</Select.Option><Select.Option value="评审中">评审中</Select.Option><Select.Option value="已完成">已完成</Select.Option></Select>
        </Form.Item>
        <Form.Item name="remark" label="备注"><TextArea rows={2} placeholder="请输入备注（可选）" /></Form.Item>
      </Form>
    </Modal>
  );
};
export default ImplementationForm;
