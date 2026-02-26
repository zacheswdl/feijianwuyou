import React from 'react';
import { Form, Input, Select, DatePicker, Button, Row, Col } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';

const { RangePicker } = DatePicker;

// 搜索字段类型定义
export interface SearchField {
  name: string;
  label: string;
  type: 'input' | 'select' | 'dateRange';
  options?: { label: string; value: string }[];
  placeholder?: string;
}

interface SearchFormProps {
  fields: SearchField[];
  onSearch: (values: any) => void;
  onReset: () => void;
}

const SearchForm: React.FC<SearchFormProps> = ({ fields, onSearch, onReset }) => {
  const [form] = Form.useForm();

  const handleReset = () => {
    form.resetFields();
    onReset();
  };

  return (
    <Form
      form={form}
      onFinish={onSearch}
      style={{ marginBottom: 16, padding: 16, background: '#f5f5f5', borderRadius: 8 }}
    >
      <Row gutter={[16, 16]} align="middle">
        {fields.map((field) => (
          <Col xs={24} sm={12} md={8} lg={6} key={field.name}>
            <Form.Item name={field.name} label={field.label} style={{ marginBottom: 0 }}>
              {field.type === 'input' && (
                <Input placeholder={field.placeholder || `请输入${field.label}`} />
              )}
              {field.type === 'select' && (
                <Select
                  placeholder={field.placeholder || `请选择${field.label}`}
                  options={field.options}
                  allowClear
                />
              )}
              {field.type === 'dateRange' && (
                <RangePicker style={{ width: '100%' }} />
              )}
            </Form.Item>
          </Col>
        ))}
        <Col xs={24} sm={12} md={8} lg={6}>
          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" icon={<SearchOutlined />} htmlType="submit" style={{ marginRight: 8 }}>
              查询
            </Button>
            <Button icon={<ReloadOutlined />} onClick={handleReset}>
              重置
            </Button>
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
};

export default SearchForm;
