import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, DatePicker, Button, Space } from 'antd';
import type { ReviewInputRecord } from '../../../types/index';
import dayjs from 'dayjs';
const { TextArea } = Input;

interface InputFormProps { visible: boolean; record: ReviewInputRecord | null; mode: 'add' | 'edit' | 'view'; onCancel: () => void; onSave: (values: any) => void; }

const InputForm: React.FC<InputFormProps> = ({ visible, record, mode, onCancel, onSave }) => {
  const [form] = Form.useForm();
  const isView = mode === 'view';
  useEffect(() => {
    if (visible && record) { form.setFieldsValue({ ...record, submitDate: record.submitDate ? dayjs(record.submitDate) : null }); }
    else if (visible) { form.resetFields(); form.setFieldsValue({ submitDate: dayjs() }); }
  }, [visible, record, form]);
  const handleSubmit = async () => {
    if (isView) { onCancel(); return; }
    try { const values = await form.validateFields(); onSave({ ...values, submitDate: values.submitDate?.format('YYYY-MM-DD') }); } catch (e) { console.error('表单验证失败:', e); }
  };
  return (
    <Modal title={mode === 'add' ? '新增输入材料' : mode === 'edit' ? '编辑输入材料' : '查看输入材料'} open={visible} onCancel={onCancel} width={700}
      footer={isView ? <Button onClick={onCancel}>关闭</Button> : <Space><Button onClick={onCancel}>取消</Button><Button type="primary" onClick={handleSubmit}>保存</Button></Space>}>
      <Form form={form} layout="vertical" disabled={isView}>
        <Form.Item name="materialName" label="材料名称" rules={[{ required: true, message: '请输入材料名称' }]}><Input placeholder="请输入材料名称" /></Form.Item>
        <Form.Item name="materialType" label="材料类型" rules={[{ required: true, message: '请选择材料类型' }]}>
          <Select placeholder="请选择材料类型"><Select.Option value="审核结果">审核结果</Select.Option><Select.Option value="客户反馈">客户反馈</Select.Option><Select.Option value="纠正措施">纠正措施</Select.Option><Select.Option value="改进建议">改进建议</Select.Option><Select.Option value="资源需求">资源需求</Select.Option><Select.Option value="风险评估">风险评估</Select.Option><Select.Option value="其他">其他</Select.Option></Select>
        </Form.Item>
        <Form.Item name="submitDate" label="提交日期" rules={[{ required: true, message: '请选择提交日期' }]}><DatePicker style={{ width: '100%' }} /></Form.Item>
        <Form.Item name="submitter" label="提交人" rules={[{ required: true, message: '请输入提交人' }]}><Input placeholder="请输入提交人" /></Form.Item>
        <Form.Item name="department" label="部门" rules={[{ required: true, message: '请输入部门' }]}><Input placeholder="请输入部门" /></Form.Item>
        <Form.Item name="materialContent" label="材料内容" rules={[{ required: true, message: '请输入材料内容' }]}><TextArea rows={3} placeholder="请输入材料内容" /></Form.Item>
        <Form.Item name="status" label="状态" rules={[{ required: true, message: '请选择状态' }]}>
          <Select placeholder="请选择状态"><Select.Option value="待提交">待提交</Select.Option><Select.Option value="已提交">已提交</Select.Option><Select.Option value="已采纳">已采纳</Select.Option></Select>
        </Form.Item>
        <Form.Item name="remark" label="备注"><TextArea rows={2} placeholder="请输入备注（可选）" /></Form.Item>
      </Form>
    </Modal>
  );
};
export default InputForm;
