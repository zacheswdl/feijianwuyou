import React, { useState, useEffect } from 'react';
import { Card, Button, Space, message, Statistic, Row, Col } from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import PageHeader from '../../../components/Common/PageHeader';
import SearchForm from '../../../components/Common/SearchForm';
import DataTable from '../../../components/Common/DataTable';
import DeviceForm from './DeviceForm';
import { getData, saveModuleData, addItem, updateItem, deleteItem } from '../../../utils/storage';
import dayjs from 'dayjs';

const MODULE_KEY = 'equipment_device_ledger';

// 计算距下次检定天数
const calculateDaysToNextVerification = (nextVerificationDate: string): number => {
  if (!nextVerificationDate) return 999;
  const next = dayjs(nextVerificationDate);
  const today = dayjs();
  return next.diff(today, 'day');
};

// 搜索字段配置
const searchFields = [
  { name: 'deviceName', label: '设备名称', type: 'input' as const, placeholder: '请输入设备名称' },
  { name: 'deviceNo', label: '设备编号', type: 'input' as const, placeholder: '请输入设备编号' },
  { name: 'deviceStatus', label: '设备状态', type: 'select' as const, options: [
    { label: '在用', value: '在用' },
    { label: '停用', value: '停用' },
    { label: '报废', value: '报废' },
    { label: '闲置', value: '闲置' },
  ]},
];

// 表格列配置
const columns = [
  { title: '序号', dataIndex: 'index', key: 'index', width: 60, render: (_: any, __: any, index: number) => index + 1 },
  { title: '设备名称', dataIndex: 'deviceName', key: 'deviceName', width: 150 },
  { title: '设备编号', dataIndex: 'deviceNo', key: 'deviceNo', width: 120 },
  { title: '规格型号', dataIndex: 'specification', key: 'specification', width: 120 },
  { title: '准确度等级', dataIndex: 'accuracyClass', key: 'accuracyClass', width: 100 },
  { title: '分辨力', dataIndex: 'resolution', key: 'resolution', width: 100 },
  { title: '生产厂商', dataIndex: 'manufacturer', key: 'manufacturer', width: 150 },
  { 
    title: '距下次检定天数', 
    dataIndex: 'nextVerificationDate', 
    key: 'daysToNextVerification',
    width: 130,
    render: (nextVerificationDate: string) => {
      const days = calculateDaysToNextVerification(nextVerificationDate);
      let color = '#52c41a'; // 绿色 - 正常
      if (days <= 0) color = '#ff4d4f'; // 红色 - 逾期
      else if (days <= 60) color = '#faad14'; // 橙色 - 临期
      return (
        <span style={{ color }}>
          {days <= 0 ? `逾期${Math.abs(days)}天` : `剩余${days}天`}
        </span>
      );
    }
  },
  { title: '设备状态', dataIndex: 'deviceStatus', key: 'deviceStatus', width: 100 },
  { title: '存放地点', dataIndex: 'storageLocation', key: 'storageLocation', width: 100 },
  { title: '使用部门', dataIndex: 'usageDepartment', key: 'usageDepartment', width: 100 },
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
    manufacturer: '浙江浙大鸣泉',
    nextVerificationDate: dayjs().add(28, 'day').format('YYYY-MM-DD'),
    deviceStatus: '在用',
    storageLocation: '检测车间',
    usageDepartment: '检测车间',
  },
  {
    id: '2',
    deviceName: '机动车前照灯检测仪',
    deviceNo: '220322',
    specification: 'MQD-6A',
    accuracyClass: '1.发光强度示',
    resolution: '发光强度',
    manufacturer: '浙江浙大鸣泉',
    nextVerificationDate: dayjs().add(64, 'day').format('YYYY-MM-DD'),
    deviceStatus: '在用',
    storageLocation: '检测车间',
    usageDepartment: '检测车间',
  },
  {
    id: '3',
    deviceName: '机动车排气分析仪',
    deviceNo: '220397',
    specification: 'MQD-6A',
    accuracyClass: '1.发光强度示',
    resolution: '发光强度',
    manufacturer: '浙江浙大鸣泉',
    nextVerificationDate: dayjs().subtract(5, 'day').format('YYYY-MM-DD'),
    deviceStatus: '在用',
    storageLocation: '环保车间',
    usageDepartment: '环保车间',
  },
];

const DeviceLedger: React.FC = () => {
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
    if (values.deviceNo) {
      result = result.filter(item => item.deviceNo?.includes(values.deviceNo));
    }
    if (values.deviceStatus) {
      result = result.filter(item => item.deviceStatus === values.deviceStatus);
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

  // 统计数据
  const overdueCount = data.filter(item => calculateDaysToNextVerification(item.nextVerificationDate) <= 0).length;
  const nearDueCount = data.filter(item => {
    const days = calculateDaysToNextVerification(item.nextVerificationDate);
    return days > 0 && days <= 60;
  }).length;

  const statistics = [
    { title: '设备总数', value: data.length },
    { title: '在用设备', value: data.filter(item => item.deviceStatus === '在用').length },
    { title: '逾检设备', value: overdueCount, color: '#ff4d4f' },
    { title: '临检设备', value: nearDueCount, color: '#faad14' },
  ];

  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { title: '首页', path: '/' },
          { title: '设备管理' },
          { title: '检测设备台账' },
        ]}
      />

      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          {statistics.map((stat, index) => (
            <Col span={6} key={index}>
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
              新增设备
            </Button>
            <Button icon={<DeleteOutlined />} onClick={handleBatchDelete} disabled={selectedRowKeys.length === 0}>
              删除
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

      <DeviceForm
        visible={formVisible}
        record={editingRecord}
        mode={formMode}
        onCancel={handleCancel}
        onSave={handleSave}
      />
    </div>
  );
};

export default DeviceLedger;
