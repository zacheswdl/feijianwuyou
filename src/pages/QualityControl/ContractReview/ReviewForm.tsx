import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, DatePicker } from 'antd';
import type { ContractReviewRecord } from '../../../types/index';
import dayjs from 'dayjs';

interface ReviewFormProps {
  visible: boolean;
  record: ContractReviewRecord | null;
  mode: 'add' | 'edit' | 'view';
  onCancel: () => void;
  onSave: (values: any) => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({
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
        reviewDate: dayjs(record.reviewDate),
      });
    } else if (visible) {
      form.resetFields();
      form.setFieldsValue({
        reviewDate: dayjs(),
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
      title={mode === 'add' ? '新增评审记录' : mode === 'edit' ? '编辑评审记录' : '查看评审记录'}
      visible={visible}
      onOk={handleOk}
      onCancel={onCancel}
      width={700}
      okButtonProps={{ style: { display: isView ? 'none' : 'inline-block' } }}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="reviewDate"
          label="评审日期"
          rules={[{ required: true, message: '请选择评审日期' }]}
        >
          <DatePicker style={{ width: '100%' }} disabled={isView} />
        </Form.Item>

        <Form.Item
          name="contractNo"
          label="合同编号"
          rules={[{ required: true, message: '请输入合同编号' }]}
        >
          <Input placeholder="请输入合同编号" disabled={isView} />
        </Form.Item>

        <Form.Item
          name="customerName"
          label="客户名称"
          rules={[{ required: true, message: '请输入客户名称' }]}
        >
          <Input placeholder="请输入客户名称" disabled={isView} />
        </Form.Item>

        <Form.Item
          name="testItems"
          label="检测项目"
          rules={[{ required: true, message: '请输入检测项目' }]}
        >
          <Input.TextArea rows={2} placeholder="请输入检测项目" disabled={isView} />
        </Form.Item>

        <Form.Item
          name="reviewContent"
          label="评审内容"
          rules={[{ required: true, message: '请输入评审内容' }]}
        >
          <Input.TextArea rows={3} placeholder="请输入评审内容" disabled={isView} />
        </Form.Item>

        <Form.Item
          name="reviewResult"
          label="评审结果"
          rules={[{ required: true, message: '请选择评审结果' }]}
        >
          <Select placeholder="请选择评审结果" disabled={isView}>
            <Select.Option value="通过">通过</Select.Option>
            <Select.Option value="不通过">不通过</Select.Option>
            <Select.Option value="需修改">需修改</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="reviewer"
          label="评审人"
          rules={[{ required: true, message: '请输入评审人' }]}
        >
          <Input placeholder="请输入评审人" disabled={isView} />
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

export default ReviewForm;
