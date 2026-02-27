import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, DatePicker, Button, Space } from 'antd';
import type { AuditChecklistRecord } from '../../../types/index';
import dayjs from 'dayjs';

const { TextArea } = Input;

interface ChecklistFormProps {
  visible: boolean;
  record: AuditChecklistRecord | null;
  mode: 'add' | 'edit' | 'view';
  onCancel: () => void;
  onSave: (values: any) => void;
}

const ChecklistForm: React.FC<ChecklistFormProps> = ({ visible, record, mode, onCancel, onSave }) => {
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
      title={mode === 'add' ? '新增检查项' : mode === 'edit' ? '编辑检查项' : '查看检查项'}
      open={visible} onCancel={onCancel} width={700}
      footer={isView ? <Button onClick={onCancel}>关闭</Button> : (
        <Space><Button onClick={onCancel}>取消</Button><Button type="primary" onClick={handleSubmit}>保存</Button></Space>
      )}
    >
      <Form form={form} layout="vertical" disabled={isView}>
        <Form.Item name="checklistNo" label="检查表编号" rules={[{ required: true, message: '请输入编号' }]}>
          <Input placeholder="请输入检查表编号" />
        </Form.Item>
        <Form.Item name="auditDate" label="审核日期" rules={[{ required: true, message: '请选择审核日期' }]}>
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="auditDepartment" label="受审部门" rules={[{ required: true, message: '请输入受审部门' }]}>
          <Input placeholder="请输入受审部门" />
        </Form.Item>
        <Form.Item name="auditClause" label="审核条款" rules={[{ required: true, message: '请输入审核条款' }]}>
          <Input placeholder="如：CNAS-CL01 4.1" />
        </Form.Item>
        <Form.Item name="checkContent" label="检查内容" rules={[{ required: true, message: '请输入检查内容' }]}>
          <TextArea rows={3} placeholder="请输入检查内容" />
        </Form.Item>
        <Form.Item name="checkMethod" label="检查方法" rules={[{ required: true, message: '请输入检查方法' }]}>
          <Input placeholder="如：查阅记录、现场观察等" />
        </Form.Item>
        <Form.Item name="checkResult" label="检查结果" rules={[{ required: true, message: '请选择检查结果' }]}>
          <Select placeholder="请选择检查结果">
            <Select.Option value="符合">符合</Select.Option>
            <Select.Option value="不符合">不符合</Select.Option>
            <Select.Option value="部分符合">部分符合</Select.Option>
            <Select.Option value="不适用">不适用</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item name="auditor" label="审核员" rules={[{ required: true, message: '请输入审核员' }]}>
          <Input placeholder="请输入审核员" />
        </Form.Item>
        <Form.Item name="evidence" label="审核证据">
          <TextArea rows={2} placeholder="请输入审核证据（可选）" />
        </Form.Item>
        <Form.Item name="remark" label="备注"><TextArea rows={2} placeholder="请输入备注（可选）" /></Form.Item>
      </Form>
    </Modal>
  );
};

export default ChecklistForm;
