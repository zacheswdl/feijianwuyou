import React, { useState, useEffect } from 'react';
import { Card, Button, Space, Tag, message, Statistic, Row, Col } from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import PageHeader from '../../../components/Common/PageHeader';
import SearchForm from '../../../components/Common/SearchForm';
import DataTable from '../../../components/Common/DataTable';
import PeriodCheckForm from './PeriodCheckForm';
import { getData, saveModuleData, addItem, updateItem, deleteItem } from '../../../utils/storage';
import dayjs from 'dayjs';

const MODULE_KEY = 'equipment_period_check';

// 搜索字段配置
const searchFields = [
  { name: 'deviceName', label: '设备名称', type: 'input' as const, placeholder: '请输入设备名称' },
  { name: 'executor', label: '执行人', type: 'input' as const, placeholder: '请输入执行人' },
  { name: 'planCheckDate', label: '计划核查日期', type: 'dateRange' as const },
  { name: 'status', label: '完成状态', type: 'select' as const, options: [
    { label: '未完成', value: '未完成' },
    { label: '已完成', value: '已完成' },
  ]},
];

// 表格列配置
const columns = [
  { title: '序号', dataIndex: 'index', key: 'index', width: 60, render: (_: any, __: any, index: number) => index + 1 },
  { title: '设备名称', dataIndex: 'deviceName', key: 'deviceName', width: 150 },
  { title: '规格型号', dataIndex: 'specification', key: 'specification', width: 120 },
  { title: '设备编号', dataIndex: 'deviceNo', key: 'deviceNo', width: 120 },
  { title: '准确度等级', dataIndex: 'accuracyClass', key: 'accuracyClass', width: 100 },
  { title: '分辨力', dataIndex: 'resolution', key: 'resolution', width: 100 },
  { title: '期间核查方法', dataIndex: 'checkMethod', key: 'checkMethod', width: 150 },
  { title: '计划核查日期', dataIndex: 'planCheckDate', key: 'planCheckDate', width: 120 },
  { title: '核查日期', dataIndex: 'checkDate', key: 'checkDate', width: 120 },
  { 
    title: '完成状态', 
    dataIndex: 'status', 
    key: 'status', 
    width: 100,
    render: (status: string) => (
      <Tag color={status === '已完成' ? 'green' : 'orange'}>
        {status}
      </Tag>
    )
  },
  { title: '执行人', dataIndex: 'executor', key: 'executor', width: 100 },
];

// 模拟数据
const mockData = [
  {
    id: '1',
    deviceName: '平板制动试验台',
    deviceNo: '841',
    specification: 'PB-03',
    accuracyClass: '3T',
    resolution: '制动力检测范',
    checkMethod: '传递测量法',
    planCheckDate: dayjs().add(30, 'day').format('YYYY-MM-DD'),
    checkDate: '',
    status: '未完成',
    executor: '王德力',
  },
  {
    id: '2',
    deviceName: '机动车前照灯检测仪',
    deviceNo: '220322',
    specification: 'MQD-6A',
    accuracyClass: '1.发光强度示',
    resolution: '发光强度',
    checkMethod: '设备比对法',
    planCheckDate: dayjs().add(15, 'day').format('YYYY-MM-DD'),
    checkDate: '',
    status: '未完成',
    executor: '王德力',
  },
  {
    id: '3',
    deviceName: '机动车排气分析仪',
    deviceNo: '220397',
    specification: 'MQD-6A',
    accuracyClass: '1.发光强度示',
    resolution: '发光强度',
    checkMethod: '设备比对法',
    planCheckDate: dayjs().subtract(5, 'day').format('YYYY-MM-DD'),
    checkDate: '',
    status: '未完成',
    executor: '王德力',
  },
];

const DevicePeriodCheck: React.FC = () => {
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
    
    if (values.deviceName) {
      result = result.filter(item => item.deviceName?.includes(values.deviceName));
    }
    if (values.executor) {
      result = result.filter(item => item.executor?.includes(values.executor));
    }
    if (values.status) {
      result = result.filter(item => item.status === values.status);
    }
    if (values.planCheckDate && values.planCheckDate.length === 2) {
      const startDate = values.planCheckDate[0].format('YYYY-MM-DD');
      const endDate = values.planCheckDate[1].format('YYYY-MM-DD');
      result = result.filter(item => item.planCheckDate >= startDate && item.planCheckDate <= endDate);
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

  const handleDownload = () => {
    message.success('正在下载核查记录...');
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

  // 统计数据
  const incompleteCount = data.filter(item => item.status === '未完成').length;
  const completedCount = data.filter(item => item.status === '已完成').length;

  const statistics = [
    { title: '总核查数', value: data.length },
    { title: '未完成', value: incompleteCount, color: '#ff4d4f' },
    { title: '已完成', value: completedCount, color: '#52c41a' },
  ];

  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { title: '首页', path: '/' },
          { title: '设备管理' },
          { title: '设备期间核查' },
        ]}
      />

      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          {statistics.map((stat, index) => (
            <Col span={8} key={index}>
              <Statistic 
                title={stat.title} 
                value={stat.value} 
                styles={{ content: { color: stat.color } }}
              />
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
            <Button icon={<DeleteOutlined />} onClick={handleBatchDelete} disabled={selectedRowKeys.length === 0}>
              删除
            </Button>
          </Space>
          <Button icon={<DownloadOutlined />} onClick={handleDownload}>
            下载核查记录
          </Button>
        </div>
        
        <DataTable
          columns={columns}
          dataSource={paginatedData}
          loading={loading}
          pagination={{
            ...pagination,
            onChange: handlePageChange,
          }}
          rowSelection={rowSelection}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </Card>

      <PeriodCheckForm
        visible={formVisible}
        record={editingRecord}
        mode={formMode}
        onCancel={handleCancel}
        onSave={handleSave}
      />
    </div>
  );
};

export default DevicePeriodCheck;
