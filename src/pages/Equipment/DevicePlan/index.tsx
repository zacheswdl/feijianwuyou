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
import PlanForm from './PlanForm';
import { getData, saveModuleData, addItem, updateItem, deleteItem } from '../../../utils/storage';

const MODULE_KEY = 'equipment_device_plan';

// 搜索字段配置
const searchFields = [
  { name: 'planName', label: '计划名称', type: 'input', placeholder: '请输入计划名称' },
  { name: 'creator', label: '制单人', type: 'input', placeholder: '请输入制单人' },
  { name: 'planType', label: '计划类型', type: 'select', options: [
    { label: '检定校准', value: '检定校准' },
    { label: '期间核查', value: '期间核查' },
    { label: '设备维护', value: '设备维护' },
    { label: '功能性检查', value: '功能性检查' },
  ]},
  { name: 'planStatus', label: '计划状态', type: 'select', options: [
    { label: '运行中', value: '运行中' },
    { label: '已完成', value: '已完成' },
    { label: '已暂停', value: '已暂停' },
  ]},
];

// 表格列配置
const columns = [
  { title: '序号', dataIndex: 'index', key: 'index', width: 60, render: (_: any, __: any, index: number) => index + 1 },
  { title: '计划名称', dataIndex: 'planName', key: 'planName', width: 200 },
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
  { title: '所属年份', dataIndex: 'year', key: 'year', width: 80 },
  { title: '计划类型', dataIndex: 'planType', key: 'planType', width: 100 },
  {
    title: '应服务方',
    dataIndex: 'serviceProvider',
    key: 'serviceProvider',
    width: 100,
    render: (provider: string) => provider ? <Tag color="blue">{provider}</Tag> : '-',
  },
  {
    title: '标准要求',
    dataIndex: 'standardRequirement',
    key: 'standardRequirement',
    width: 100,
    render: (req: string) => req ? <Tag color="green">{req}</Tag> : '-',
  },
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
    width: 150,
    render: (progress: number) => (
      <Progress percent={progress || 0} size="small" status={progress === 100 ? 'success' : 'active'} />
    ),
  },
];

// 模拟数据
const mockData = [
  {
    id: '1',
    planName: '2023年度检定校准计划',
    createDate: '2023-04-25',
    year: '2023',
    planType: '检定校准',
    serviceProvider: '查看',
    standardRequirement: '查看',
    creator: '超级管理员',
    planStatus: '运行中',
    progress: 0,
  },
  {
    id: '2',
    planName: '2023年度期间核查计划',
    createDate: '2023-04-25',
    year: '2023',
    planType: '期间核查',
    serviceProvider: '查看',
    standardRequirement: '查看',
    creator: '超级管理员',
    planStatus: '运行中',
    progress: 50,
  },
  {
    id: '3',
    planName: '2023年度设备维护计划',
    createDate: '2023-02-11',
    year: '2023',
    planType: '设备维护',
    serviceProvider: '查看',
    standardRequirement: '查看',
    creator: '超级管理员',
    planStatus: '运行中',
    progress: 75,
  },
  {
    id: '4',
    planName: '2023年度功能性检查计划',
    createDate: '2023-03-15',
    year: '2023',
    planType: '功能性检查',
    serviceProvider: '查看',
    standardRequirement: '查看',
    creator: '超级管理员',
    planStatus: '运行中',
    progress: 30,
  },
];

const DevicePlan: React.FC = () => {
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
    if (values.creator) {
      result = result.filter(item => item.creator?.includes(values.creator));
    }
    if (values.planType) {
      result = result.filter(item => item.planType === values.planType);
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
    { title: '计划总数', value: data.length },
    { title: '运行中', value: data.filter(item => item.planStatus === '运行中').length },
    { title: '已完成', value: data.filter(item => item.planStatus === '已完成').length },
    { title: '平均进度', value: Math.round(data.reduce((sum, item) => sum + (item.progress || 0), 0) / (data.length || 1)) + '%' },
  ];

  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { title: '首页', path: '/' },
          { title: '设备管理' },
          { title: '设备计划管理' },
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
              新增计划
            </Button>
          </Space>
          <Space>
            <Button icon={<DeleteOutlined />} onClick={handleBatchDelete} disabled={selectedRowKeys.length === 0}>
              删除
            </Button>
            <Button icon={<DownloadOutlined />}>下载</Button>
            <Button icon={<DownloadOutlined />}>下载设备计量周期记录</Button>
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

      <PlanForm
        visible={formVisible}
        record={editingRecord}
        mode={formMode}
        onCancel={handleCancel}
        onSave={handleSave}
      />
    </div>
  );
};

export default DevicePlan;
