import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, DatePicker, Rate } from 'antd';
import type { SatisfactionSurveyRecord } from '../../../types/index';
import dayjs from 'dayjs';

interface SurveyFormProps {
  visible: boolean;
  record: SatisfactionSurveyRecord | null;
  mode: 'add' | 'edit' | 'view';
  onCancel: () => void;
  onSave: (values: any) => void;
}

const SurveyForm: React.FC<SurveyFormProps> = ({
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
        surveyDate: dayjs(record.surveyDate),
      });
    } else if (visible) {
      form.resetFields();
      form.setFieldsValue({
        surveyDate: dayjs(),
        satisfactionScore: 5,
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
      title={mode === 'add' ? '新增调查记录' : mode === 'edit' ? '编辑调查记录' : '查看调查记录'}
      visible={visible}
      onOk={handleOk}
      onCancel={onCancel}
      width={700}
      okButtonProps={{ style: { display: isView ? 'none' : 'inline-block' } }}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="surveyDate"
          label="调查日期"
          rules={[{ required: true, message: '请选择调查日期' }]}
        >
          <DatePicker style={{ width: '100%' }} disabled={isView} />
        </Form.Item>

        <Form.Item
          name="customerName"
          label="客户名称"
          rules={[{ required: true, message: '请输入客户名称' }]}
        >
          <Input placeholder="请输入客户名称" disabled={isView} />
        </Form.Item>

        <Form.Item
          name="contactPhone"
          label="联系电话"
          rules={[{ required: true, message: '请输入联系电话' }]}
        >
          <Input placeholder="请输入联系电话" disabled={isView} />
        </Form.Item>

        <Form.Item
          name="surveyMethod"
          label="调查方式"
          rules={[{ required: true, message: '请选择调查方式' }]}
        >
          <Select placeholder="请选择调查方式" disabled={isView}>
            <Select.Option value="电话回访">电话回访</Select.Option>
            <Select.Option value="现场问卷">现场问卷</Select.Option>
            <Select.Option value="在线调查">在线调查</Select.Option>
            <Select.Option value="邮件调查">邮件调查</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="satisfactionScore"
          label="满意度评分"
          rules={[{ required: true, message: '请选择满意度评分' }]}
        >
          <Rate disabled={isView} />
        </Form.Item>

        <Form.Item
          name="serviceAttitude"
          label="服务态度"
          rules={[{ required: true, message: '请评价服务态度' }]}
        >
          <Rate disabled={isView} />
        </Form.Item>

        <Form.Item
          name="serviceEfficiency"
          label="服务效率"
          rules={[{ required: true, message: '请评价服务效率' }]}
        >
          <Rate disabled={isView} />
        </Form.Item>

        <Form.Item
          name="serviceQuality"
          label="服务质量"
          rules={[{ required: true, message: '请评价服务质量' }]}
        >
          <Rate disabled={isView} />
        </Form.Item>

        <Form.Item
          name="overallEvaluation"
          label="总体评价"
          rules={[{ required: true, message: '请选择总体评价' }]}
        >
          <Select placeholder="请选择总体评价" disabled={isView}>
            <Select.Option value="非常满意">非常满意</Select.Option>
            <Select.Option value="满意">满意</Select.Option>
            <Select.Option value="一般">一般</Select.Option>
            <Select.Option value="不满意">不满意</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="suggestions"
          label="意见建议"
        >
          <Input.TextArea rows={3} placeholder="请输入意见建议" disabled={isView} />
        </Form.Item>

        <Form.Item
          name="surveyPerson"
          label="调查人"
          rules={[{ required: true, message: '请输入调查人' }]}
        >
          <Input placeholder="请输入调查人" disabled={isView} />
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

export default SurveyForm;
