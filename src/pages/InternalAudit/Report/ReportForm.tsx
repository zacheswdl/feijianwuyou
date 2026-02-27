import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, DatePicker, InputNumber, Button, Space } from 'antd';
import type { AuditReportRecord } from '../../../types/index';
import dayjs from 'dayjs';

const { TextArea } = Input;

interface ReportFormProps {
  visible: boolean;
  record: AuditReportRecord | null;
  mode: 'add' | 'edit' | 'view';
  onCancel: () => void;
  onSave: (values: any) => void;
}

const AuditReportForm: React.FC<ReportFormProps> = ({ visible, record, mode, onCancel, onSave }) => {
  const [form] = Form.useForm();
  const isView = mode === 'view';

  useEffect(() => {
    if (visible && record) {
      form.setFieldsValue({
        ...record,
        auditDate: record.auditDate ? dayjs(record.auditDate) : null,
        approveDate: record.approveDate ? dayjs(record.approveDate) : null,
      });
    } else if (visible) {
      form.resetFields();
      form.setFieldsValue({ auditDate: dayjs(), nonconformityCount: 0, observationCount: 0 });
    }
  }, [visible, record, form]);

  const handleSubmit = async () => {
    if (isView) { onCancel(); return; }
    try {
      const values = await form.validateFields();
      onSave({
        ...values,
        auditDate: values.auditDate?.format('YYYY-MM-DD'),
        approveDate: values.approveDate?.format('YYYY-MM-DD'),
      });
    } catch (error) { console.error('表单验证失败:', error); }
  };

  return (
    <Modal
      title={mode === 'add' ? '新增内审报告' : mode === 'edit' ? '编辑内审报告' : '查看内审报告'}
      open={visible} onCancel={onCancel} width={700}
      footer={isView ? <Button onClick={onCancel}>关闭</Button> : (
        <Space><Button onClick={onCancel}>取消</Button><Button type="primary" onClick={handleSubmit}>保存</Button></Space>
      )}
    >
      <Form form={form} layout="vertical" disabled={isView}>
        <Form.Item name="reportNo" label="报告编号" rules={[{ required: true, message: '请输入报告编号' }]}>
          <Input placeholder="请输入报告编号" />
        </Form.Item>
        <Form.Item name="reportName" label="报告名称" rules={[{ required: true, message: '请输入报告名称' }]}>
          <Input placeholder="请输入报告名称" />
        </Form.Item>
        <Form.Item name="auditDate" label="审核日期" rules={[{ required: true, message: '请选择审核日期' }]}>
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="auditScope" label="审核范围" rules={[{ required: true, message: '请输入审核范围' }]}>
          <TextArea rows={2} placeholder="请输入审核范围" />
        </Form.Item>
        <Form.Item name="auditBasis" label="审核依据" rules={[{ required: true, message: '请输入审核依据' }]}>
          <TextArea rows={2} placeholder="如：ISO/IEC 17025、CNAS-CL01等" />
        </Form.Item>
        <Form.Item name="auditConclusion" label="审核结论" rules={[{ required: true, message: '请输入审核结论' }]}>
          <TextArea rows={3} placeholder="请输入审核结论" />
        </Form.Item>
        <Form.Item name="nonconformityCount" label="不符合项数量" rules={[{ required: true, message: '请输入数量' }]}>
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="observationCount" label="观察项数量" rules={[{ required: true, message: '请输入数量' }]}>
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="auditLeader" label="审核组长" rules={[{ required: true, message: '请输入审核组长' }]}>
          <Input placeholder="请输入审核组长" />
        </Form.Item>
        <Form.Item name="approver" label="批准人" rules={[{ required: true, message: '请输入批准人' }]}>
          <Input placeholder="请输入批准人" />
        </Form.Item>
        <Form.Item name="approveDate" label="批准日期">
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="status" label="状态" rules={[{ required: true, message: '请选择状态' }]}>
          <Select placeholder="请选择状态">
            <Select.Option value="草稿">草稿</Select.Option>
            <Select.Option value="待审批">待审批</Select.Option>
            <Select.Option value="已审批">已审批</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item name="remark" label="备注"><TextArea rows={2} placeholder="请输入备注（可选）" /></Form.Item>
      </Form>
    </Modal>
  );
};

export default AuditReportForm;
