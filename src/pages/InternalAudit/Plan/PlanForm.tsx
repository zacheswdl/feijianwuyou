import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, DatePicker, Button, Space } from 'antd';
import type { AuditPlanRecord } from '../../../types/index';
import dayjs from 'dayjs';

const { TextArea } = Input;

interface PlanFormProps {
  visible: boolean;
  record: AuditPlanRecord | null;
  mode: 'add' | 'edit' | 'view';
  onCancel: () => void;
  onSave: (values: any) => void;
}

const PlanForm: React.FC<PlanFormProps> = ({ visible, record, mode, onCancel, onSave }) => {
  const [form] = Form.useForm();
  const isView = mode === 'view';

  useEffect(() => {
    if (visible && record) {
      form.setFieldsValue({
        ...record,
        plannedDate: record.plannedDate ? dayjs(record.plannedDate) : null,
      });
    } else if (visible) {
      form.resetFields();
      form.setFieldsValue({ plannedDate: dayjs(), planYear: dayjs().format('YYYY') });
    }
  }, [visible, record, form]);

  const handleSubmit = async () => {
    if (isView) { onCancel(); return; }
    try {
      const values = await form.validateFields();
      onSave({ ...values, plannedDate: values.plannedDate?.format('YYYY-MM-DD') });
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  return (
    <Modal
      title={mode === 'add' ? '新增内审计划' : mode === 'edit' ? '编辑内审计划' : '查看内审计划'}
      open={visible}
      onCancel={onCancel}
      footer={isView ? <Button onClick={onCancel}>关闭</Button> : (
        <Space><Button onClick={onCancel}>取消</Button><Button type="primary" onClick={handleSubmit}>保存</Button></Space>
      )}
      width={700}
    >
      <Form form={form} layout="vertical" disabled={isView}>
        <Form.Item name="planName" label="计划名称" rules={[{ required: true, message: '请输入计划名称' }]}>
          <Input placeholder="请输入计划名称" />
        </Form.Item>
        <Form.Item name="planYear" label="审核年度" rules={[{ required: true, message: '请输入审核年度' }]}>
          <Input placeholder="如：2024" />
        </Form.Item>
        <Form.Item name="auditScope" label="审核范围" rules={[{ required: true, message: '请输入审核范围' }]}>
          <TextArea rows={2} placeholder="请输入审核范围" />
        </Form.Item>
        <Form.Item name="auditBasis" label="审核依据" rules={[{ required: true, message: '请输入审核依据' }]}>
          <TextArea rows={2} placeholder="如：ISO/IEC 17025、CNAS-CL01等" />
        </Form.Item>
        <Form.Item name="plannedDate" label="计划审核日期" rules={[{ required: true, message: '请选择计划审核日期' }]}>
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="auditLeader" label="审核组长" rules={[{ required: true, message: '请输入审核组长' }]}>
          <Input placeholder="请输入审核组长" />
        </Form.Item>
        <Form.Item name="auditMembers" label="审核组成员" rules={[{ required: true, message: '请输入审核组成员' }]}>
          <Input placeholder="请输入审核组成员，多人用逗号分隔" />
        </Form.Item>
        <Form.Item name="status" label="状态" rules={[{ required: true, message: '请选择状态' }]}>
          <Select placeholder="请选择状态">
            <Select.Option value="待执行">待执行</Select.Option>
            <Select.Option value="进行中">进行中</Select.Option>
            <Select.Option value="已完成">已完成</Select.Option>
            <Select.Option value="已取消">已取消</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item name="remark" label="备注">
          <TextArea rows={2} placeholder="请输入备注（可选）" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default PlanForm;
