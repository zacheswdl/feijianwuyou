import React, { useEffect } from 'react';
import { Modal, Form, Input, DatePicker, Button, Space } from 'antd';
import type { ReviewMeetingRecord } from '../../../types/index';
import dayjs from 'dayjs';
const { TextArea } = Input;

interface MeetingFormProps { visible: boolean; record: ReviewMeetingRecord | null; mode: 'add' | 'edit' | 'view'; onCancel: () => void; onSave: (values: any) => void; }

const MeetingForm: React.FC<MeetingFormProps> = ({ visible, record, mode, onCancel, onSave }) => {
  const [form] = Form.useForm();
  const isView = mode === 'view';
  useEffect(() => {
    if (visible && record) { form.setFieldsValue({ ...record, meetingDate: record.meetingDate ? dayjs(record.meetingDate) : null }); }
    else if (visible) { form.resetFields(); form.setFieldsValue({ meetingDate: dayjs() }); }
  }, [visible, record, form]);
  const handleSubmit = async () => {
    if (isView) { onCancel(); return; }
    try { const values = await form.validateFields(); onSave({ ...values, meetingDate: values.meetingDate?.format('YYYY-MM-DD') }); } catch (e) { console.error('表单验证失败:', e); }
  };
  return (
    <Modal title={mode === 'add' ? '新增会议记录' : mode === 'edit' ? '编辑会议记录' : '查看会议记录'} open={visible} onCancel={onCancel} width={700}
      footer={isView ? <Button onClick={onCancel}>关闭</Button> : <Space><Button onClick={onCancel}>取消</Button><Button type="primary" onClick={handleSubmit}>保存</Button></Space>}>
      <Form form={form} layout="vertical" disabled={isView}>
        <Form.Item name="meetingNo" label="会议编号" rules={[{ required: true, message: '请输入会议编号' }]}><Input placeholder="请输入会议编号" /></Form.Item>
        <Form.Item name="meetingDate" label="会议日期" rules={[{ required: true, message: '请选择会议日期' }]}><DatePicker style={{ width: '100%' }} /></Form.Item>
        <Form.Item name="meetingLocation" label="会议地点" rules={[{ required: true, message: '请输入会议地点' }]}><Input placeholder="请输入会议地点" /></Form.Item>
        <Form.Item name="chairperson" label="主持人" rules={[{ required: true, message: '请输入主持人' }]}><Input placeholder="请输入主持人" /></Form.Item>
        <Form.Item name="attendees" label="出席人员" rules={[{ required: true, message: '请输入出席人员' }]}><Input placeholder="多人用逗号分隔" /></Form.Item>
        <Form.Item name="meetingContent" label="会议内容" rules={[{ required: true, message: '请输入会议内容' }]}><TextArea rows={3} placeholder="请输入会议内容" /></Form.Item>
        <Form.Item name="decisions" label="会议决议" rules={[{ required: true, message: '请输入会议决议' }]}><TextArea rows={3} placeholder="请输入会议决议" /></Form.Item>
        <Form.Item name="actionItems" label="行动项" rules={[{ required: true, message: '请输入行动项' }]}><TextArea rows={3} placeholder="请输入行动项" /></Form.Item>
        <Form.Item name="recorder" label="记录人" rules={[{ required: true, message: '请输入记录人' }]}><Input placeholder="请输入记录人" /></Form.Item>
        <Form.Item name="remark" label="备注"><TextArea rows={2} placeholder="请输入备注（可选）" /></Form.Item>
      </Form>
    </Modal>
  );
};
export default MeetingForm;
