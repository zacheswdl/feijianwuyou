import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, DatePicker, Button, Space } from 'antd';
import type { AuditRectificationRecord } from '../../../types/index';
import dayjs from 'dayjs';

const { TextArea } = Input;

interface RectificationFormProps {
  visible: boolean;
  record: AuditRectificationRecord | null;
  mode: 'add' | 'edit' | 'view';
  onCancel: () => void;
  onSave: (values: any) => void;
}

const RectificationForm: React.FC<RectificationFormProps> = ({ visible, record, mode, onCancel, onSave }) => {
  const [form] = Form.useForm();
  const isView = mode === 'view';

  useEffect(() => {
    if (visible && record) {
      form.setFieldsValue({
        ...record,
        rectificationDate: record.rectificationDate ? dayjs(record.rectificationDate) : null,
        verifyDate: record.verifyDate ? dayjs(record.verifyDate) : null,
      });
    } else if (visible) {
      form.resetFields();
    }
  }, [visible, record, form]);

  const handleSubmit = async () => {
    if (isView) { onCancel(); return; }
    try {
      const values = await form.validateFields();
      onSave({
        ...values,
        rectificationDate: values.rectificationDate?.format('YYYY-MM-DD'),
        verifyDate: values.verifyDate?.format('YYYY-MM-DD'),
      });
    } catch (error) { console.error('表单验证失败:', error); }
  };

  return (
    <Modal
      title={mode === 'add' ? '新增整改记录' : mode === 'edit' ? '编辑整改记录' : '查看整改记录'}
      open={visible} onCancel={onCancel} width={700}
      footer={isView ? <Button onClick={onCancel}>关闭</Button> : (
        <Space><Button onClick={onCancel}>取消</Button><Button type="primary" onClick={handleSubmit}>保存</Button></Space>
      )}
    >
      <Form form={form} layout="vertical" disabled={isView}>
        <Form.Item name="nonconformityNo" label="不符合项编号" rules={[{ required: true, message: '请输入编号' }]}>
          <Input placeholder="请输入关联的不符合项编号" />
        </Form.Item>
        <Form.Item name="nonconformityDesc" label="不符合描述" rules={[{ required: true, message: '请输入描述' }]}>
          <TextArea rows={2} placeholder="请输入不符合项描述" />
        </Form.Item>
        <Form.Item name="responsiblePerson" label="责任人" rules={[{ required: true, message: '请输入责任人' }]}>
          <Input placeholder="请输入责任人" />
        </Form.Item>
        <Form.Item name="rectificationMeasure" label="整改措施" rules={[{ required: true, message: '请输入整改措施' }]}>
          <TextArea rows={3} placeholder="请详细描述整改措施" />
        </Form.Item>
        <Form.Item name="rectificationDate" label="整改日期" rules={[{ required: true, message: '请选择整改日期' }]}>
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="verifier" label="验证人" rules={[{ required: true, message: '请输入验证人' }]}>
          <Input placeholder="请输入验证人" />
        </Form.Item>
        <Form.Item name="verifyDate" label="验证日期">
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="verifyResult" label="验证结果" rules={[{ required: true, message: '请选择验证结果' }]}>
          <Select placeholder="请选择验证结果">
            <Select.Option value="通过">通过</Select.Option>
            <Select.Option value="不通过">不通过</Select.Option>
            <Select.Option value="待验证">待验证</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item name="status" label="状态" rules={[{ required: true, message: '请选择状态' }]}>
          <Select placeholder="请选择状态">
            <Select.Option value="待整改">待整改</Select.Option>
            <Select.Option value="已整改">已整改</Select.Option>
            <Select.Option value="已验证">已验证</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item name="remark" label="备注"><TextArea rows={2} placeholder="请输入备注（可选）" /></Form.Item>
      </Form>
    </Modal>
  );
};

export default RectificationForm;
