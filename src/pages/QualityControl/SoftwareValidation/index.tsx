import React, { useState, useEffect } from 'react';
import { Card, Button, Space, Tag, message, Statistic, Row, Col } from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  DownloadOutlined,
  PrinterOutlined,
} from '@ant-design/icons';
import PageHeader from '../../../components/Common/PageHeader';
import SearchForm from '../../../components/Common/SearchForm';
import DataTable from '../../../components/Common/DataTable';
import ValidationForm from './ValidationForm';
import { getData, saveModuleData, addItem, updateItem, deleteItem } from '../../../utils/storage';

const MODULE_KEY = 'quality_software_validation';

// 搜索字段配置
const searchFields = [
  { name: 'softwareName', label: '软件名称', type: 'input' as const, placeholder: '请输入软件名称' },
  { name: 'validationResult', label: '确认结果', type: 'select' as const, options: [
    { label: '通过', value: 'passed' },
    { label: '不通过', value: 'failed' },
    { label: '待确认', value: 'pending' },
  ]},
];

// 表格列配置
const columns = [
  { title: '序号', dataIndex: 'index', key: 'index', width: 60, render: (_: any, __: any, index: number) => index + 1 },
  { title: '软件名称', dataIndex: 'softwareName', key: 'softwareName', width: 150 },
  { title: '版本号', dataIndex: 'version', key: 'version', width: 100 },
  { title: '确认日期', dataIndex: 'validationDate', key: 'validationDate', width: 120 },
  { title: '确认内容', dataIndex: 'validationContent', key: 'validationContent', ellipsis: true },
  {
    title: '确认结果',
    dataIndex: 'validationResult',
    key: 'validationResult',
    width: 100,
    render: (result: string) => {
      const map: Record<string, { text: string; color: string }> = {
        passed: { text: '通过', color: 'success' },
        failed: { text: '不通过', color: 'error' },
        pending: { text: '待确认', color: 'warning' },
      };
      const config = map[result] || { text: result, color: 'default' };
      return <Tag color={config.color}>{config.text}</Tag>;
    },
  },
  { title: '确认人', dataIndex: 'validator', key: 'validator', width: 100 },
  { title: '备注', dataIndex: 'remark', key: 'remark', ellipsis: true },
];

// 模拟数据
const mockData = [
  {
    id: '1',
    softwareName: '检测管理系统',
    version: 'v2.1.0',
    validationDate: '2024-01-10',
    validationContent: '系统功能测试、数据准确性验证',
    validationResult: 'passed',
    validator: '张三',
    remark: '系统运行正常',
  },
  {
    id: '2',
    softwareName: '数据分析软件',
    version: 'v1.5.2',
    validationDate: '2024-01-15',
    validationContent: '算法准确性、计算结果验证',
    validationResult: 'pending',
    validator: '李四',
    remark: '待进一步测试',
  },
];

const SoftwareValidation: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  
  const [formVisible, setFormVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>({});
  const [formMode, setFormMode] = useState<'view' | 'edit' | 'add'>('add');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setLoading(true);
    const storedData = getData(MODULE_KEY);
    if (storedData && storedData.length > 0) {
      setData(storedData);
      setFilteredData(storedData);
      setPagination(prev => ({ ...prev, total: storedData.length }));
    } else {
      setData(mockData);
      setFilteredData(mockData);
      setPagination(prev => ({ ...prev, total: mockData.length }));
      saveModuleData(MODULE_KEY, mockData);
    }
    setLoading(false);
  };

  const handleSearch = (values: any) => {
    let result = [...data];
    
    if (values.softwareName) {
      result = result.filter(item => item.softwareName?.includes(values.softwareName));
    }
    if (values.validationResult) {
      result = result.filter(item => item.validationResult === values.validationResult);
    }
    
    setFilteredData(result);
    setPagination(prev => ({ ...prev, current: 1, total: result.length }));
  };

  const handleReset = () => {
    setFilteredData(data);
    setPagination(prev => ({ ...prev, current: 1, total: data.length }));
  };

  const handleAdd = () => {
    setFormMode('add');
    setEditingRecord({});
    setFormVisible(true);
  };

  const handleEdit = (record: any) => {
    setFormMode('edit');
    setEditingRecord(record);
    setFormVisible(true);
  };

  const handleView = (record: any) => {
    setFormMode('view');
    setEditingRecord(record);
    setFormVisible(true);
  };

  const handleSave = (values: any) => {
    if (formMode === 'edit') {
      updateItem(MODULE_KEY, editingRecord.id, values);
      message.success('编辑成功');
    } else if (formMode === 'add') {
      addItem(MODULE_KEY, { ...values, id: Date.now().toString() });
      message.success('新增成功');
    }
    setFormVisible(false);
    loadData();
  };

  const handleCancel = () => {
    setFormVisible(false);
    setEditingRecord({});
  };

  const handleDelete = async (record: any) => {
    const newData = await deleteItem(MODULE_KEY, record.id);
    message.success('删除成功');
    setData(newData);
    setFilteredData(newData);
    setPagination(prev => ({ ...prev, total: newData.length }));
  };

  const handleBatchDelete = () => {
    let currentData = getData(MODULE_KEY);
    selectedRowKeys.forEach(key => {
      currentData = currentData.filter((item: any) => item.id !== key);
    });
    saveModuleData(MODULE_KEY, currentData);
    setSelectedRowKeys([]);
    message.success('批量删除成功');
    setData(currentData);
    setFilteredData(currentData);
    setPagination(prev => ({ ...prev, total: currentData.length }));
  };

  const handlePageChange = (page: number, pageSize?: number) => {
    setPagination(prev => ({ ...prev, current: page, pageSize: pageSize || 10 }));
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
  };

  const startIndex = (pagination.current - 1) * pagination.pageSize;
  const endIndex = startIndex + pagination.pageSize;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  const statistics = [
    { title: '确认记录总数', value: data.length },
    { title: '已通过', value: data.filter(item => item.validationResult === 'passed').length },
    { title: '不通过', value: data.filter(item => item.validationResult === 'failed').length },
    { title: '待确认', value: data.filter(item => item.validationResult === 'pending').length },
  ];

  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { title: '首页', path: '/' },
          { title: '质量控制管理' },
          { title: '软件适用性确认' },
        ]}
      />

      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          {statistics.map((stat, index) => (
            <Col span={6} key={index}>
              <Statistic title={stat.title} value={stat.value} />
            </Col>
          ))}
        </Row>
      </Card>
      
      <SearchForm fields={searchFields} onSearch={handleSearch} onReset={handleReset} />
      
      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新增确认记录
            </Button>
          </Space>
          <Space>
            <Button icon={<DeleteOutlined />} onClick={handleBatchDelete} disabled={selectedRowKeys.length === 0}>
              删除
            </Button>
            <Button icon={<DownloadOutlined />}>下载</Button>
            <Button icon={<PrinterOutlined />}>打印</Button>
          </Space>
        </div>
        
        <DataTable
          columns={columns}
          dataSource={paginatedData}
          loading={loading}
          pagination={{
            ...pagination,
            onChange: handlePageChange,
          }}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          rowSelection={rowSelection}
        />
      </Card>

      <ValidationForm
        visible={formVisible}
        record={editingRecord}
        mode={formMode}
        onCancel={handleCancel}
        onSave={handleSave}
      />
    </div>
  );
};

export default SoftwareValidation;
