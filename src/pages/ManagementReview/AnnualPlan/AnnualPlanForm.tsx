import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, DatePicker, Button, Space } from 'antd';
import type { ReviewAnnualPlanRecord } from '../../../types/index';
import dayjs from 'dayjs';
const { TextArea } = Input;

interface PlanFormProps { visible: boolean; record: ReviewAnnualPlanRecord | null; mode: 'add' | 'edit' | 'view'; onCancel: () => void; onSave: (values: any) => void; }

const AnnualPlanForm: React.FC<PlanFormProps> = ({ visible, record, mode, onCancel, onSave }) => {
  const [form] = Form.useForm();
  const isView = mode === 'view';
  useEffect(() => {
    if (visible && record) { form.setFieldsValue({ ...record, plannedDate: record.plannedDate ? dayjs(record.plannedDate) : null }); }
    else if (visible) { form.resetFields(); form.setFieldsValue({ plannedDate: dayjs(), planYear: dayjs().format('YYYY') }); }
  }, [visible, record, form]);
  const handleSubmit = async () => {
    if (isView) { onCancel(); return; }
    try { const values = await form.validateFields(); onSave({ ...values, plannedDate: values.plannedDate?.format('YYYY-MM-DD') }); } catch (e) { console.error('表单验证失败:', e); }
  };
  return (
    <Modal title={mode === 'add' ? '新增年度计划' : mode === 'edit' ? '编辑年度计划' : '查看年度计划'} open={visible} onCancel={onCancel} width={700}
      footer={isView ? <Button onClick={onCancel}>关闭</Button> : <Space><Button onClick={onCancel}>取消</Button><Button type="primary" onClick={handleSubmit}>保存</Button></Space>}>
      <Form form={form} layout="vertical" disabled={isView}>
        <Form.Item name="planName" label="计划名称" rules={[{ required: true, message: '请输入计划名称' }]}><Input placeholder="请输入计划名称" /></Form.Item>
        <Form.Item name="planYear" label="年度" rules={[{ required: true, message: '请输入年度' }]}><Input placeholder="如：2024" /></Form.Item>
        <Form.Item name="reviewObjective" label="评审目的" rules={[{ required: true, message: '请输入评审目的' }]}><TextArea rows={2} placeholder="请输入评审目的" /></Form.Item>
        <Form.Item name="reviewScope" label="评审范围" rules={[{ required: true, message: '请输入评审范围' }]}><TextArea rows={2} placeholder="请输入评审范围" /></Form.Item>
        <Form.Item name="plannedDate" label="计划日期" rules={[{ required: true, message: '请选择日期' }]}><DatePicker style={{ width: '100%' }} /></Form.Item>
        <Form.Item name="organizer" label="组织者" rules={[{ required: true, message: '请输入组织者' }]}><Input placeholder="请输入组织者" /></Form.Item>
        <Form.Item name="participants" label="参加人员" rules={[{ required: true, message: '请输入参加人员' }]}><Input placeholder="多人用逗号分隔" /></Form.Item>
        <Form.Item name="status" label="状态" rules={[{ required: true, message: '请选择状态' }]}>
          <Select placeholder="请选择状态"><Select.Option value="待执行">待执行</Select.Option><Select.Option value="进行中">进行中</Select.Option><Select.Option value="已完成">已完成</Select.Option><Select.Option value="已取消">已取消</Select.Option></Select>
        </Form.Item>
        <Form.Item name="remark" label="备注"><TextArea rows={2} placeholder="请输入备注（可选）" /></Form.Item>
      </Form>
    </Modal>
  );
};
export default AnnualPlanForm;
