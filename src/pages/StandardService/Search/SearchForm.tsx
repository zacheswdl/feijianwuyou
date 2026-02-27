import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, DatePicker, Button, Space } from 'antd';
import type { StandardSearchRecord } from '../../../types/index';
import dayjs from 'dayjs';
const { TextArea } = Input;

interface SearchFormProps { visible: boolean; record: StandardSearchRecord | null; mode: 'add' | 'edit' | 'view'; onCancel: () => void; onSave: (values: any) => void; }

const SearchForm: React.FC<SearchFormProps> = ({ visible, record, mode, onCancel, onSave }) => {
  const [form] = Form.useForm();
  const isView = mode === 'view';
  useEffect(() => {
    if (visible && record) { form.setFieldsValue({ ...record, publishDate: record.publishDate ? dayjs(record.publishDate) : null, implementDate: record.implementDate ? dayjs(record.implementDate) : null, searchDate: record.searchDate ? dayjs(record.searchDate) : null }); }
    else if (visible) { form.resetFields(); form.setFieldsValue({ searchDate: dayjs() }); }
  }, [visible, record, form]);
  const handleSubmit = async () => {
    if (isView) { onCancel(); return; }
    try { const values = await form.validateFields(); onSave({ ...values, publishDate: values.publishDate?.format('YYYY-MM-DD'), implementDate: values.implementDate?.format('YYYY-MM-DD'), searchDate: values.searchDate?.format('YYYY-MM-DD') }); } catch (e) { console.error('表单验证失败:', e); }
  };
  return (
    <Modal title={mode === 'add' ? '新增标准查新' : mode === 'edit' ? '编辑标准查新' : '查看标准查新'} open={visible} onCancel={onCancel} width={700}
      footer={isView ? <Button onClick={onCancel}>关闭</Button> : <Space><Button onClick={onCancel}>取消</Button><Button type="primary" onClick={handleSubmit}>保存</Button></Space>}>
      <Form form={form} layout="vertical" disabled={isView}>
        <Form.Item name="standardNo" label="标准编号" rules={[{ required: true, message: '请输入标准编号' }]}><Input placeholder="请输入标准编号" /></Form.Item>
        <Form.Item name="standardName" label="标准名称" rules={[{ required: true, message: '请输入标准名称' }]}><Input placeholder="请输入标准名称" /></Form.Item>
        <Form.Item name="publishDate" label="发布日期" rules={[{ required: true, message: '请选择发布日期' }]}><DatePicker style={{ width: '100%' }} /></Form.Item>
        <Form.Item name="implementDate" label="实施日期" rules={[{ required: true, message: '请选择实施日期' }]}><DatePicker style={{ width: '100%' }} /></Form.Item>
        <Form.Item name="standardStatus" label="标准状态" rules={[{ required: true, message: '请选择标准状态' }]}>
          <Select placeholder="请选择标准状态"><Select.Option value="现行">现行</Select.Option><Select.Option value="即将实施">即将实施</Select.Option><Select.Option value="已废止">已废止</Select.Option><Select.Option value="被替代">被替代</Select.Option></Select>
        </Form.Item>
        <Form.Item name="replacedBy" label="替代标准"><Input placeholder="请输入替代标准编号（可选）" /></Form.Item>
        <Form.Item name="searchDate" label="查新日期" rules={[{ required: true, message: '请选择查新日期' }]}><DatePicker style={{ width: '100%' }} /></Form.Item>
        <Form.Item name="searcher" label="查新人" rules={[{ required: true, message: '请输入查新人' }]}><Input placeholder="请输入查新人" /></Form.Item>
        <Form.Item name="department" label="部门" rules={[{ required: true, message: '请输入部门' }]}><Input placeholder="请输入部门" /></Form.Item>
        <Form.Item name="remark" label="备注"><TextArea rows={2} placeholder="请输入备注（可选）" /></Form.Item>
      </Form>
    </Modal>
  );
};
export default SearchForm;
