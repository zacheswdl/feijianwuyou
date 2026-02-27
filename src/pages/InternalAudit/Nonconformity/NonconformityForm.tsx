import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, DatePicker, Button, Space } from 'antd';
import type { AuditNonconformityRecord } from '../../../types/index';
import dayjs from 'dayjs';

const { TextArea } = Input;

interface NonconformityFormProps {
  visible: boolean;
  record: AuditNonconformityRecord | null;
  mode: 'add' | 'edit' | 'view';
  onCancel: () => void;
  onSave: (values: any) => void;
}

const NonconformityForm: React.FC<NonconformityFormProps> = ({ visible, record, mode, onCancel, onSave }) => {
  const [form] = Form.useForm();
  const isView = mode === 'view';

  useEffect(() => {
    if (visible && record) {
      form.setFieldsValue({
        ...record,
        auditDate: record.auditDate ? dayjs(record.auditDate) : null,
        deadline: record.deadline ? dayjs(record.deadline) : null,
      });
    } else if (visible) {
      form.resetFields();
      form.setFieldsValue({ auditDate: dayjs() });
    }
  }, [visible, record, form]);

  const handleSubmit = async () => {
    if (isView) { onCancel(); return; }
    try {
      const values = await form.validateFields();
      onSave({
        ...values,
        auditDate: values.auditDate?.format('YYYY-MM-DD'),
        deadline: values.deadline?.format('YYYY-MM-DD'),
      });
    } catch (error) { console.error('表单验证失败:', error); }
  };

  return (
    <Modal
      title={mode === 'add' ? '新增不符合项' : mode === 'edit' ? '编辑不符合项' : '查看不符合项'}
      open={visible} onCancel={onCancel} width={700}
      footer={isView ? <Button onClick={onCancel}>关闭</Button> : (
        <Space><Button onClick={onCancel}>取消</Button><Button type="primary" onClick={handleSubmit}>保存</Button></Space>
      )}
    >
      <Form form={form} layout="vertical" disabled={isView}>
        <Form.Item name="nonconformityNo" label="不符合项编号" rules={[{ required: true, message: '请输入编号' }]}>
          <Input placeholder="请输入不符合项编号" />
        </Form.Item>
        <Form.Item name="auditDate" label="审核日期" rules={[{ required: true, message: '请选择审核日期' }]}>
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="auditDepartment" label="受审部门" rules={[{ required: true, message: '请输入受审部门' }]}>
          <Input placeholder="请输入受审部门" />
        </Form.Item>
        <Form.Item name="auditClause" label="不符合条款" rules={[{ required: true, message: '请输入不符合条款' }]}>
          <Input placeholder="如：CNAS-CL01 4.2" />
        </Form.Item>
        <Form.Item name="nonconformityType" label="不符合类型" rules={[{ required: true, message: '请选择类型' }]}>
          <Select placeholder="请选择不符合类型">
            <Select.Option value="严重">严重不符合</Select.Option>
            <Select.Option value="一般">一般不符合</Select.Option>
            <Select.Option value="观察项">观察项</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item name="nonconformityDesc" label="不符合描述" rules={[{ required: true, message: '请输入描述' }]}>
          <TextArea rows={3} placeholder="请详细描述不符合事实" />
        </Form.Item>
        <Form.Item name="correctionRequirement" label="纠正要求" rules={[{ required: true, message: '请输入纠正要求' }]}>
          <TextArea rows={2} placeholder="请输入纠正要求" />
        </Form.Item>
        <Form.Item name="responsiblePerson" label="责任人" rules={[{ required: true, message: '请输入责任人' }]}>
          <Input placeholder="请输入责任人" />
        </Form.Item>
        <Form.Item name="deadline" label="整改期限" rules={[{ required: true, message: '请选择整改期限' }]}>
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="auditor" label="审核员" rules={[{ required: true, message: '请输入审核员' }]}>
          <Input placeholder="请输入审核员" />
        </Form.Item>
        <Form.Item name="status" label="状态" rules={[{ required: true, message: '请选择状态' }]}>
          <Select placeholder="请选择状态">
            <Select.Option value="待整改">待整改</Select.Option>
            <Select.Option value="整改中">整改中</Select.Option>
            <Select.Option value="已关闭">已关闭</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item name="remark" label="备注"><TextArea rows={2} placeholder="请输入备注（可选）" /></Form.Item>
      </Form>
    </Modal>
  );
};

export default NonconformityForm;
