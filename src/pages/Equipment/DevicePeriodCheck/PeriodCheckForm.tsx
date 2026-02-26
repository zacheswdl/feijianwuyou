import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, DatePicker } from 'antd';
import dayjs from 'dayjs';

interface PeriodCheckFormProps {
  visible: boolean;
  record: any;
  mode: 'view' | 'edit' | 'add';
  onCancel: () => void;
  onSave: (values: any) => void;
}

const PeriodCheckForm: React.FC<PeriodCheckFormProps> = ({
  visible,
  record,
  mode,
  onCancel,
  onSave,
}) => {
  const [form] = Form.useForm();
  const isView = mode === 'view';

  useEffect(() => {
    if (visible) {
      if (record && Object.keys(record).length > 0) {
        form.setFieldsValue({
          ...record,
          planCheckDate: record.planCheckDate ? dayjs(record.planCheckDate) : null,
          checkDate: record.checkDate ? dayjs(record.checkDate) : null,
        });
      } else {
        form.resetFields();
      }
    }
  }, [visible, record, form]);

  const handleOk = () => {
    if (isView) {
      onCancel();
      return;
    }
    form.validateFields().then(values => {
      const formattedValues = {
        ...values,
        planCheckDate: values.planCheckDate ? values.planCheckDate.format('YYYY-MM-DD') : '',
        checkDate: values.checkDate ? values.checkDate.format('YYYY-MM-DD') : '',
      };
      onSave(formattedValues);
    });
  };

  return (
    <Modal
      title={mode === 'add' ? '新增期间核查计划' : mode === 'edit' ? '编辑期间核查计划' : '查看期间核查计划'}
      open={visible}
      onOk={handleOk}
      onCancel={onCancel}
      width={800}
      okButtonProps={{ style: { display: isView ? 'none' : 'inline-block' } }}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="deviceName"
          label="设备名称"
          rules={[{ required: true, message: '请输入设备名称' }]}
        >
          <Input placeholder="请输入设备名称" disabled={isView} />
        </Form.Item>

        <Form.Item
          name="deviceNo"
          label="设备编号"
          rules={[{ required: true, message: '请输入设备编号' }]}
        >
          <Input placeholder="请输入设备编号" disabled={isView} />
        </Form.Item>

        <Form.Item
          name="specification"
          label="规格型号"
          rules={[{ required: true, message: '请输入规格型号' }]}
        >
          <Input placeholder="请输入规格型号" disabled={isView} />
        </Form.Item>

        <Form.Item
          name="accuracyClass"
          label="准确度等级"
        >
          <Input placeholder="请输入准确度等级" disabled={isView} />
        </Form.Item>

        <Form.Item
          name="resolution"
          label="分辨力"
        >
          <Input placeholder="请输入分辨力" disabled={isView} />
        </Form.Item>

        <Form.Item
          name="checkMethod"
          label="期间核查方法"
          rules={[{ required: true, message: '请输入期间核查方法' }]}
        >
          <Input placeholder="请输入期间核查方法" disabled={isView} />
        </Form.Item>

        <Form.Item
          name="planCheckDate"
          label="计划核查日期"
          rules={[{ required: true, message: '请选择计划核查日期' }]}
        >
          <DatePicker style={{ width: '100%' }} disabled={isView} />
        </Form.Item>

        <Form.Item
          name="checkDate"
          label="实际核查日期"
        >
          <DatePicker style={{ width: '100%' }} disabled={isView} />
        </Form.Item>

        <Form.Item
          name="status"
          label="完成状态"
          rules={[{ required: true, message: '请选择完成状态' }]}
        >
          <Select placeholder="请选择完成状态" disabled={isView}>
            <Select.Option value="未完成">未完成</Select.Option>
            <Select.Option value="已完成">已完成</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="executor"
          label="执行人"
          rules={[{ required: true, message: '请输入执行人' }]}
        >
          <Input placeholder="请输入执行人" disabled={isView} />
        </Form.Item>

        <Form.Item
          name="remark"
          label="备注"
        >
          <Input.TextArea rows={3} placeholder="请输入备注" disabled={isView} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default PeriodCheckForm;
