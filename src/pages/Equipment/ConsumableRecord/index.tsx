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
import ConsumableForm from './ConsumableForm';
import { getData, saveModuleData, addItem, updateItem, deleteItem } from '../../../utils/storage';

const MODULE_KEY = 'equipment_consumable_record';

// 搜索字段配置
const searchFields = [
  { name: 'year', label: '年份', type: 'select', options: [
    { label: '2024', value: '2024' },
    { label: '2023', value: '2023' },
    { label: '2022', value: '2022' },
    { label: '2021', value: '2021' },
  ]},
  { name: 'month', label: '月份', type: 'select', options: [
    { label: '1月', value: '1' },
    { label: '2月', value: '2' },
    { label: '3月', value: '3' },
    { label: '4月', value: '4' },
    { label: '5月', value: '5' },
    { label: '6月', value: '6' },
    { label: '7月', value: '7' },
    { label: '8月', value: '8' },
    { label: '9月', value: '9' },
    { label: '10月', value: '10' },
    { label: '11月', value: '11' },
    { label: '12月', value: '12' },
  ]},
  { name: 'location', label: '更换地点', type: 'select', options: [
    { label: '环检车间', value: '环检车间' },
    { label: '安检车间', value: '安检车间' },
  ]},
  { name: 'responsiblePerson', label: '责任人', type: 'input', placeholder: '请输入责任人' },
];

// 表格列配置
const columns = [
  { title: '序号', dataIndex: 'index', key: 'index', width: 60, render: (_: any, __: any, index: number) => index + 1 },
  { title: '年份', dataIndex: 'year', key: 'year', width: 80 },
  { title: '月份', dataIndex: 'month', key: 'month', width: 60, render: (month: string) => `${month}月` },
  { title: '更换日期', dataIndex: 'replaceDate', key: 'replaceDate', width: 100 },
  { title: '更换地点', dataIndex: 'location', key: 'location', width: 100 },
  { title: '责任人', dataIndex: 'responsiblePerson', key: 'responsiblePerson', width: 100 },
  { title: '记录人', dataIndex: 'recorder', key: 'recorder', width: 100 },
  {
    title: '耗材明细',
    dataIndex: 'consumables',
    key: 'consumables',
    width: 300,
    render: (consumables: any[]) => (
      <div style={{ fontSize: 12 }}>
        {consumables?.map((item, index) => (
          <div key={index} style={{ marginBottom: 4 }}>
            {item.name}: {item.quantity}{item.unit}
          </div>
        ))}
      </div>
    ),
  },
  {
    title: '附件',
    dataIndex: 'attachments',
    key: 'attachments',
    width: 100,
    render: (files: any[]) => {
      const count = files?.length || 0;
      if (count === 0) return '-';
      return <Tag color="blue">{count}个附件</Tag>;
    },
  },
];

// 模拟数据
const mockData = [
  {
    id: '1',
    year: '2024',
    month: '1',
    replaceDate: '2024-01-15',
    location: '环检车间',
    responsiblePerson: '陈杭',
    recorder: '张三',
    consumables: [
      { name: '取样探头', quantity: 2, unit: '个' },
      { name: '前置过滤器', quantity: 1, unit: '个' },
      { name: '双层滤芯', quantity: 3, unit: '个' },
    ],
    attachments: [],
  },
  {
    id: '2',
    year: '2024',
    month: '2',
    replaceDate: '2024-02-20',
    location: '安检车间',
    responsiblePerson: '李四',
    recorder: '王五',
    consumables: [
      { name: '取样探头', quantity: 1, unit: '个' },
      { name: '前置过滤器', quantity: 2, unit: '个' },
    ],
    attachments: [],
  },
];

const ConsumableRecord: React.FC = () => {
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
    
    if (values.year) {
      result = result.filter(item => item.year === values.year);
    }
    if (values.month) {
      result = result.filter(item => item.month === values.month);
    }
    if (values.location) {
      result = result.filter(item => item.location === values.location);
    }
    if (values.responsiblePerson) {
      result = result.filter(item => item.responsiblePerson?.includes(values.responsiblePerson));
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

  const handleDelete = (record: any) => {
    const newData = deleteItem(MODULE_KEY, record.id);
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
    { title: '更换记录总数', value: data.length },
    { title: '本年度', value: data.filter(item => item.year === '2024').length },
    { title: '环检车间', value: data.filter(item => item.location === '环检车间').length },
    { title: '安检车间', value: data.filter(item => item.location === '安检车间').length },
  ];

  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { title: '首页', path: '/' },
          { title: '设备管理' },
          { title: '设备耗材更换记录' },
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
              新增更换记录
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

      <ConsumableForm
        visible={formVisible}
        record={editingRecord}
        mode={formMode}
        onCancel={handleCancel}
        onSave={handleSave}
      />
    </div>
  );
};

export default ConsumableRecord;
