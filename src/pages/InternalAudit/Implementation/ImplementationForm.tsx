import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, DatePicker, Button, Space } from 'antd';
import type { AuditImplementationRecord } from '../../../types/index';
import dayjs from 'dayjs';

const { TextArea } = Input;

interface ImplementationFormProps {
  visible: boolean;
  record: AuditImplementationRecord | null;
  mode: 'add' | 'edit' | 'view';
  onCancel: () => void;
  onSave: (values: any) => void;
}

const ImplementationForm: React.FC<ImplementationFormProps> = ({ visible, record, mode, onCancel, onSave }) => {
  const [form] = Form.useForm();
  const isView = mode === 'view';

  useEffect(() => {
    if (visible && record) {
      form.setFieldsValue({ ...record, auditDate: record.auditDate ? dayjs(record.auditDate) : null });
    } else if (visible) {
      form.resetFields();
      form.setFieldsValue({ auditDate: dayjs() });
    }
  }, [visible, record, form]);

  const handleSubmit = async () => {
    if (isView) { onCancel(); return; }
    try {
      const values = await form.validateFields();
      onSave({ ...values, auditDate: values.auditDate?.format('YYYY-MM-DD') });
    } catch (error) { console.error('表单验证失败:', error); }
  };

  return (
    <Modal
      title={mode === 'add' ? '新增实施计划' : mode === 'edit' ? '编辑实施计划' : '查看实施计划'}
      open={visible} onCancel={onCancel} width={700}
      footer={isView ? <Button onClick={onCancel}>关闭</Button> : (
        <Space><Button onClick={onCancel}>取消</Button><Button type="primary" onClick={handleSubmit}>保存</Button></Space>
      )}
    >
      <Form form={form} layout="vertical" disabled={isView}>
        <Form.Item name="planName" label="关联计划" rules={[{ required: true, message: '请输入关联计划名称' }]}>
          <Input placeholder="请输入关联的内审计划名称" />
        </Form.Item>
        <Form.Item name="auditDate" label="审核日期" rules={[{ required: true, message: '请选择审核日期' }]}>
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="auditDepartment" label="受审部门" rules={[{ required: true, message: '请输入受审部门' }]}>
          <Input placeholder="请输入受审部门" />
        </Form.Item>
        <Form.Item name="auditClause" label="审核条款" rules={[{ required: true, message: '请输入审核条款' }]}>
          <TextArea rows={2} placeholder="请输入审核条款" />
        </Form.Item>
        <Form.Item name="auditMethod" label="审核方法" rules={[{ required: true, message: '请输入审核方法' }]}>
          <Input placeholder="如：查阅文件、现场观察、人员访谈等" />
        </Form.Item>
        <Form.Item name="auditor" label="审核员" rules={[{ required: true, message: '请输入审核员' }]}>
          <Input placeholder="请输入审核员" />
        </Form.Item>
        <Form.Item name="auditee" label="被审核人" rules={[{ required: true, message: '请输入被审核人' }]}>
          <Input placeholder="请输入被审核人" />
        </Form.Item>
        <Form.Item name="status" label="状态" rules={[{ required: true, message: '请选择状态' }]}>
          <Select placeholder="请选择状态">
            <Select.Option value="待审核">待审核</Select.Option>
            <Select.Option value="审核中">审核中</Select.Option>
            <Select.Option value="已完成">已完成</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item name="remark" label="备注"><TextArea rows={2} placeholder="请输入备注（可选）" /></Form.Item>
      </Form>
    </Modal>
  );
};

export default ImplementationForm;
