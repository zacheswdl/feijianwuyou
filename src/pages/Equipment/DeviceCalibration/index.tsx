import React, { useState, useEffect } from 'react';
import { Card, Button, Space, Tag, message, Statistic, Row, Col } from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import PageHeader from '../../../components/Common/PageHeader';
import SearchForm from '../../../components/Common/SearchForm';
import DataTable from '../../../components/Common/DataTable';
import CalibrationForm from './CalibrationForm';
import { getData, saveModuleData, addItem, updateItem, deleteItem } from '../../../utils/storage';
import dayjs from 'dayjs';

const MODULE_KEY = 'equipment_calibration';

// 搜索字段配置
const searchFields = [
  { name: 'deviceName', label: '设备名称', type: 'input' as const, placeholder: '请输入设备名称' },
  { name: 'executor', label: '执行人', type: 'input' as const, placeholder: '请输入执行人' },
  { name: 'planCompleteDate', label: '计划完成日期', type: 'dateRange' as const },
  { name: 'status', label: '完成状态', type: 'select' as const, options: [
    { label: '未完成', value: '未完成' },
    { label: '已完成', value: '已完成' },
  ]},
  { name: 'calibrationType', label: '计量类型', type: 'select' as const, options: [
    { label: '检定', value: '检定' },
    { label: '校准', value: '校准' },
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
  { title: '计量类型', dataIndex: 'calibrationType', key: 'calibrationType', width: 100 },
  { title: '计量单位', dataIndex: 'calibrationUnit', key: 'calibrationUnit', width: 150 },
  { title: '计划完成日期', dataIndex: 'planCompleteDate', key: 'planCompleteDate', width: 120 },
  { title: '结果确认日期', dataIndex: 'confirmDate', key: 'confirmDate', width: 120 },
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
    deviceName: '轮轴气压表',
    deviceNo: '/',
    specification: '/',
    accuracyClass: '',
    resolution: '',
    calibrationType: '校准',
    calibrationUnit: '浙江省计量科学研究院',
    planCompleteDate: dayjs().add(30, 'day').format('YYYY-MM-DD'),
    confirmDate: '',
    status: '未完成',
    executor: '吴皓',
  },
  {
    id: '2',
    deviceName: 'OBD检测仪',
    deviceNo: '969850005724',
    specification: 'HTTEV20',
    accuracyClass: '',
    resolution: '',
    calibrationType: '自校准',
    calibrationUnit: '浙江省计量科学研究院',
    planCompleteDate: dayjs().add(15, 'day').format('YYYY-MM-DD'),
    confirmDate: dayjs().format('YYYY-MM-DD'),
    status: '未完成',
    executor: '王德力',
  },
  {
    id: '3',
    deviceName: '平板制动试验台',
    deviceNo: '841',
    specification: 'PB-03',
    accuracyClass: '3T',
    resolution: '制动力检测范',
    calibrationType: '检定',
    calibrationUnit: '浙江省计量研究院',
    planCompleteDate: dayjs().subtract(5, 'day').format('YYYY-MM-DD'),
    confirmDate: '',
    status: '未完成',
    executor: '吴皓',
  },
];

const DeviceCalibration: React.FC = () => {
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
    if (values.calibrationType) {
      result = result.filter(item => item.calibrationType === values.calibrationType);
    }
    if (values.planCompleteDate && values.planCompleteDate.length === 2) {
      const startDate = values.planCompleteDate[0].format('YYYY-MM-DD');
      const endDate = values.planCompleteDate[1].format('YYYY-MM-DD');
      result = result.filter(item => item.planCompleteDate >= startDate && item.planCompleteDate <= endDate);
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

  const handleDownload = () => {
    message.success('正在下载校准记录...');
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
    { title: '总计划数', value: data.length },
    { title: '未完成', value: incompleteCount, color: '#ff4d4f' },
    { title: '已完成', value: completedCount, color: '#52c41a' },
  ];

  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { title: '首页', path: '/' },
          { title: '设备管理' },
          { title: '检定校准周期和确认' },
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
          <Space>
            <Button icon={<DownloadOutlined />} onClick={handleDownload}>
              下载校准结果确认表
            </Button>
            <Button icon={<DownloadOutlined />} onClick={handleDownload}>
              下载结果确认
            </Button>
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
          rowSelection={rowSelection}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </Card>

      <CalibrationForm
        visible={formVisible}
        record={editingRecord}
        mode={formMode}
        onCancel={handleCancel}
        onSave={handleSave}
      />
    </div>
  );
};

export default DeviceCalibration;
