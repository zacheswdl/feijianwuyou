import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, DatePicker, Button, Space } from 'antd';
import type { ReviewReportRecord } from '../../../types/index';
import dayjs from 'dayjs';
const { TextArea } = Input;

interface ReportFormProps { visible: boolean; record: ReviewReportRecord | null; mode: 'add' | 'edit' | 'view'; onCancel: () => void; onSave: (values: any) => void; }

const ReportForm: React.FC<ReportFormProps> = ({ visible, record, mode, onCancel, onSave }) => {
  const [form] = Form.useForm();
  const isView = mode === 'view';
  useEffect(() => {
    if (visible && record) { form.setFieldsValue({ ...record, reviewDate: record.reviewDate ? dayjs(record.reviewDate) : null, completionDate: record.completionDate ? dayjs(record.completionDate) : null, approveDate: record.approveDate ? dayjs(record.approveDate) : null }); }
    else if (visible) { form.resetFields(); form.setFieldsValue({ reviewDate: dayjs() }); }
  }, [visible, record, form]);
  const handleSubmit = async () => {
    if (isView) { onCancel(); return; }
    try { const values = await form.validateFields(); onSave({ ...values, reviewDate: values.reviewDate?.format('YYYY-MM-DD'), completionDate: values.completionDate?.format('YYYY-MM-DD'), approveDate: values.approveDate?.format('YYYY-MM-DD') }); } catch (e) { console.error('表单验证失败:', e); }
  };
  return (
    <Modal title={mode === 'add' ? '新增评审报告' : mode === 'edit' ? '编辑评审报告' : '查看评审报告'} open={visible} onCancel={onCancel} width={700}
      footer={isView ? <Button onClick={onCancel}>关闭</Button> : <Space><Button onClick={onCancel}>取消</Button><Button type="primary" onClick={handleSubmit}>保存</Button></Space>}>
      <Form form={form} layout="vertical" disabled={isView}>
        <Form.Item name="reportNo" label="报告编号" rules={[{ required: true, message: '请输入报告编号' }]}><Input placeholder="请输入报告编号" /></Form.Item>
        <Form.Item name="reportName" label="报告名称" rules={[{ required: true, message: '请输入报告名称' }]}><Input placeholder="请输入报告名称" /></Form.Item>
        <Form.Item name="reviewDate" label="评审日期" rules={[{ required: true, message: '请选择评审日期' }]}><DatePicker style={{ width: '100%' }} /></Form.Item>
        <Form.Item name="reviewConclusion" label="评审结论" rules={[{ required: true, message: '请输入评审结论' }]}><TextArea rows={3} placeholder="请输入评审结论" /></Form.Item>
        <Form.Item name="improvementMeasures" label="改进措施" rules={[{ required: true, message: '请输入改进措施' }]}><TextArea rows={3} placeholder="请输入改进措施" /></Form.Item>
        <Form.Item name="resourceRequirements" label="资源需求" rules={[{ required: true, message: '请输入资源需求' }]}><TextArea rows={3} placeholder="请输入资源需求" /></Form.Item>
        <Form.Item name="responsiblePerson" label="责任人" rules={[{ required: true, message: '请输入责任人' }]}><Input placeholder="请输入责任人" /></Form.Item>
        <Form.Item name="completionDate" label="完成日期" rules={[{ required: true, message: '请选择完成日期' }]}><DatePicker style={{ width: '100%' }} /></Form.Item>
        <Form.Item name="approver" label="批准人" rules={[{ required: true, message: '请输入批准人' }]}><Input placeholder="请输入批准人" /></Form.Item>
        <Form.Item name="approveDate" label="批准日期"><DatePicker style={{ width: '100%' }} /></Form.Item>
        <Form.Item name="status" label="状态" rules={[{ required: true, message: '请选择状态' }]}>
          <Select placeholder="请选择状态"><Select.Option value="草稿">草稿</Select.Option><Select.Option value="待审批">待审批</Select.Option><Select.Option value="已审批">已审批</Select.Option></Select>
        </Form.Item>
        <Form.Item name="remark" label="备注"><TextArea rows={2} placeholder="请输入备注（可选）" /></Form.Item>
      </Form>
    </Modal>
  );
};
export default ReportForm;
