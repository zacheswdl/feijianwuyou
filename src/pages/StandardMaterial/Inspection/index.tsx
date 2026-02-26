import React, { useState, useEffect } from 'react';
import { Card, Button, Space, Tag, message, Statistic, Row, Col, Progress } from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  DownloadOutlined,
  PrinterOutlined,
} from '@ant-design/icons';
import PageHeader from '../../../components/Common/PageHeader';
import SearchForm from '../../../components/Common/SearchForm';
import DataTable from '../../../components/Common/DataTable';
import InspectionForm from './InspectionForm';
import { getData, saveModuleData, addItem, updateItem, deleteItem } from '../../../utils/storage';

const MODULE_KEY = 'standard_material_inspection';

// 搜索字段配置
const searchFields = [
  { name: 'planName', label: '计划名称', type: 'input', placeholder: '请输入计划名称' },
  { name: 'createDate', label: '计划生成日期', type: 'dateRange' },
  { name: 'planStatus', label: '计划状态', type: 'select', options: [
    { label: '运行中', value: '运行中' },
    { label: '已完成', value: '已完成' },
    { label: '已暂停', value: '已暂停' },
  ]},
];

// 表格列配置
const columns = [
  { title: '序号', dataIndex: 'index', key: 'index', width: 60, render: (_: any, __: any, index: number) => index + 1 },
  { title: '计划名称', dataIndex: 'planName', key: 'planName', width: 250 },
  {
    title: '操作',
    dataIndex: 'operation',
    key: 'operation',
    width: 100,
    render: () => (
      <Space>
        <Button type="link" size="small">查看</Button>
        <Button type="link" size="small">编辑</Button>
      </Space>
    ),
  },
  { title: '计划生成日期', dataIndex: 'createDate', key: 'createDate', width: 120 },
  { title: '制单人', dataIndex: 'creator', key: 'creator', width: 100 },
  {
    title: '计划状态',
    dataIndex: 'planStatus',
    key: 'planStatus',
    width: 100,
    render: (status: string) => {
      const colorMap: { [key: string]: string } = {
        '运行中': 'processing',
        '已完成': 'success',
        '已暂停': 'warning',
      };
      return <Tag color={colorMap[status] || 'default'}>{status}</Tag>;
    },
  },
  {
    title: '完成进度',
    dataIndex: 'progress',
    key: 'progress',
    width: 200,
    render: (progress: number) => (
      <Progress percent={progress || 0} size="small" status={progress === 100 ? 'success' : 'active'} />
    ),
  },
];

// 模拟数据
const mockData = [
  {
    id: '1',
    planName: '2022年标物核查计划1',
    createDate: '2022-10-24',
    creator: '超级管理员',
    planStatus: '已完成',
    progress: 100,
  },
  {
    id: '2',
    planName: '2022年标物核查计划',
    createDate: '2022-10-22',
    creator: '超级管理员',
    planStatus: '已完成',
    progress: 100,
  },
];

const StandardMaterialInspection: React.FC = () => {
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
    
    if (values.planName) {
      result = result.filter(item => item.planName?.includes(values.planName));
    }
    if (values.planStatus) {
      result = result.filter(item => item.planStatus === values.planStatus);
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
    { title: '核查计划总数', value: data.length },
    { title: '运行中', value: data.filter(item => item.planStatus === '运行中').length },
    { title: '已完成', value: data.filter(item => item.planStatus === '已完成').length },
    { title: '平均进度', value: Math.round(data.reduce((sum, item) => sum + (item.progress || 0), 0) / (data.length || 1)) + '%' },
  ];

  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { title: '首页', path: '/' },
          { title: '标准物质管理' },
          { title: '标物核查' },
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
              新增
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

      <InspectionForm
        visible={formVisible}
        record={editingRecord}
        mode={formMode}
        onCancel={handleCancel}
        onSave={handleSave}
      />
    </div>
  );
};

export default StandardMaterialInspection;
