import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, DatePicker } from 'antd';
import type { DataConsistencyRecord } from '../../../types/index';
import dayjs from 'dayjs';

interface ConsistencyFormProps {
  visible: boolean;
  record: DataConsistencyRecord | null;
  mode: 'add' | 'edit' | 'view';
  onCancel: () => void;
  onSave: (values: any) => void;
}

const ConsistencyForm: React.FC<ConsistencyFormProps> = ({
  visible,
  record,
  mode,
  onCancel,
  onSave,
}) => {
  const [form] = Form.useForm();
  const isView = mode === 'view';

  useEffect(() => {
    if (visible && record) {
      form.setFieldsValue({
        ...record,
        checkDate: dayjs(record.checkDate),
      });
    } else if (visible) {
      form.resetFields();
      form.setFieldsValue({
        checkDate: dayjs(),
      });
    }
  }, [visible, record, form]);

  const handleOk = () => {
    if (isView) {
      onCancel();
      return;
    }
    form.validateFields().then(values => {
      onSave(values);
    });
  };

  return (
    <Modal
      title={mode === 'add' ? '新增检查记录' : mode === 'edit' ? '编辑检查记录' : '查看检查记录'}
      visible={visible}
      onOk={handleOk}
      onCancel={onCancel}
      width={700}
      okButtonProps={{ style: { display: isView ? 'none' : 'inline-block' } }}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="checkDate"
          label="检查日期"
          rules={[{ required: true, message: '请选择检查日期' }]}
        >
          <DatePicker style={{ width: '100%' }} disabled={isView} />
        </Form.Item>

        <Form.Item
          name="systemName"
          label="系统/软件名称"
          rules={[{ required: true, message: '请输入系统或软件名称' }]}
        >
          <Input placeholder="请输入系统或软件名称" disabled={isView} />
        </Form.Item>

        <Form.Item
          name="checkType"
          label="检查类型"
          rules={[{ required: true, message: '请选择检查类型' }]}
        >
          <Select placeholder="请选择检查类型" disabled={isView}>
            <Select.Option value="数据备份检查">数据备份检查</Select.Option>
            <Select.Option value="数据传输检查">数据传输检查</Select.Option>
            <Select.Option value="数据完整性检查">数据完整性检查</Select.Option>
            <Select.Option value="系统日志检查">系统日志检查</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="checkContent"
          label="检查内容"
          rules={[{ required: true, message: '请输入检查内容' }]}
        >
          <Input.TextArea rows={3} placeholder="请输入检查内容" disabled={isView} />
        </Form.Item>

        <Form.Item
          name="result"
          label="检查结果"
          rules={[{ required: true, message: '请选择检查结果' }]}
        >
          <Select placeholder="请选择检查结果" disabled={isView}>
            <Select.Option value="一致">一致</Select.Option>
            <Select.Option value="异常">异常</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="checker"
          label="检查人"
          rules={[{ required: true, message: '请输入检查人' }]}
        >
          <Input placeholder="请输入检查人" disabled={isView} />
        </Form.Item>

        <Form.Item
          name="remark"
          label="备注"
        >
          <Input.TextArea rows={2} placeholder="请输入备注" disabled={isView} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ConsistencyForm;
