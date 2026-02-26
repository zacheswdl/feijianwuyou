import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, DatePicker } from 'antd';
import type { DeviceMaintenanceRecord } from '../../../types/index';
import dayjs from 'dayjs';

interface MaintenanceFormProps {
  visible: boolean;
  record: DeviceMaintenanceRecord | null;
  mode: 'add' | 'edit' | 'view';
  onCancel: () => void;
  onSave: (values: any) => void;
}

const MaintenanceForm: React.FC<MaintenanceFormProps> = ({
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
        maintenanceDate: dayjs(record.maintenanceDate),
      });
    } else if (visible) {
      form.resetFields();
      form.setFieldsValue({
        maintenanceDate: dayjs(),
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
      title={mode === 'add' ? '新增维护记录' : mode === 'edit' ? '编辑维护记录' : '查看维护记录'}
      visible={visible}
      onOk={handleOk}
      onCancel={onCancel}
      width={700}
      okButtonProps={{ style: { display: isView ? 'none' : 'inline-block' } }}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="maintenanceDate"
          label="维护日期"
          rules={[{ required: true, message: '请选择维护日期' }]}
        >
          <DatePicker style={{ width: '100%' }} disabled={isView} />
        </Form.Item>

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
          name="maintenanceType"
          label="维护类型"
          rules={[{ required: true, message: '请选择维护类型' }]}
        >
          <Select placeholder="请选择维护类型" disabled={isView}>
            <Select.Option value="日常保养">日常保养</Select.Option>
            <Select.Option value="定期维护">定期维护</Select.Option>
            <Select.Option value="故障维修">故障维修</Select.Option>
            <Select.Option value="校准调试">校准调试</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="maintenanceContent"
          label="维护内容"
          rules={[{ required: true, message: '请输入维护内容' }]}
        >
          <Input.TextArea rows={3} placeholder="请输入维护内容" disabled={isView} />
        </Form.Item>

        <Form.Item
          name="maintenanceResult"
          label="维护结果"
          rules={[{ required: true, message: '请选择维护结果' }]}
        >
          <Select placeholder="请选择维护结果" disabled={isView}>
            <Select.Option value="正常">正常</Select.Option>
            <Select.Option value="需跟进">需跟进</Select.Option>
            <Select.Option value="未完成">未完成</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="maintenancePerson"
          label="维护人员"
          rules={[{ required: true, message: '请输入维护人员' }]}
        >
          <Input placeholder="请输入维护人员" disabled={isView} />
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

export default MaintenanceForm;
