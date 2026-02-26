import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, DatePicker } from 'antd';
import type { EnvironmentMonitorRecord } from '../../../types/index';
import dayjs from 'dayjs';

interface MonitorFormProps {
  visible: boolean;
  record: EnvironmentMonitorRecord | null;
  mode: 'add' | 'edit' | 'view';
  onCancel: () => void;
  onSave: (values: any) => void;
}

const MonitorForm: React.FC<MonitorFormProps> = ({
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
        monitorDate: dayjs(record.monitorDate),
      });
    } else if (visible) {
      form.resetFields();
      form.setFieldsValue({
        monitorDate: dayjs(),
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
      title={mode === 'add' ? '新增监控记录' : mode === 'edit' ? '编辑监控记录' : '查看监控记录'}
      visible={visible}
      onOk={handleOk}
      onCancel={onCancel}
      width={700}
      okButtonProps={{ style: { display: isView ? 'none' : 'inline-block' } }}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="monitorDate"
          label="监控日期"
          rules={[{ required: true, message: '请选择监控日期' }]}
        >
          <DatePicker style={{ width: '100%' }} disabled={isView} />
        </Form.Item>

        <Form.Item
          name="monitorItem"
          label="监控项目"
          rules={[{ required: true, message: '请输入监控项目' }]}
        >
          <Input placeholder="请输入监控项目（如：温度、湿度、噪声等）" disabled={isView} />
        </Form.Item>

        <Form.Item
          name="monitorLocation"
          label="监控地点"
          rules={[{ required: true, message: '请输入监控地点' }]}
        >
          <Input placeholder="请输入监控地点" disabled={isView} />
        </Form.Item>

        <Form.Item
          name="standardValue"
          label="标准值"
          rules={[{ required: true, message: '请输入标准值' }]}
        >
          <Input placeholder="请输入标准值范围" disabled={isView} />
        </Form.Item>

        <Form.Item
          name="actualValue"
          label="实测值"
          rules={[{ required: true, message: '请输入实测值' }]}
        >
          <Input placeholder="请输入实测值" disabled={isView} />
        </Form.Item>

        <Form.Item
          name="result"
          label="监控结果"
          rules={[{ required: true, message: '请选择监控结果' }]}
        >
          <Select placeholder="请选择监控结果" disabled={isView}>
            <Select.Option value="正常">正常</Select.Option>
            <Select.Option value="异常">异常</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="monitor"
          label="监控人"
          rules={[{ required: true, message: '请输入监控人' }]}
        >
          <Input placeholder="请输入监控人" disabled={isView} />
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

export default MonitorForm;
