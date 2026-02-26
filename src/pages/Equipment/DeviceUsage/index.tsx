import React, { useState, useEffect } from 'react';
import { Card, Button, Space, Tag, message, Statistic, Row, Col } from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  DownloadOutlined,
  PrinterOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';
import PageHeader from '../../../components/Common/PageHeader';
import SearchForm from '../../../components/Common/SearchForm';
import DataTable from '../../../components/Common/DataTable';
import UsageForm from './UsageForm';
import { getData, saveModuleData, addItem, updateItem, deleteItem } from '../../../utils/storage';

const MODULE_KEY = 'equipment_device_usage';

// 搜索字段配置
const searchFields = [
  { name: 'detectionLine', label: '检测线', type: 'select', options: [
    { label: '外观检测线', value: '外观检测线' },
    { label: '安检1号线（平板）', value: '安检1号线（平板）' },
    { label: '安检2号线（滚筒）', value: '安检2号线（滚筒）' },
    { label: '安检3号线（摩托）', value: '安检3号线（摩托）' },
    { label: '环保1号线', value: '环保1号线' },
    { label: '环保2号线', value: '环保2号线' },
    { label: '环保3号线', value: '环保3号线' },
    { label: '环保4号线', value: '环保4号线' },
  ]},
];

// 表格列配置
const columns = [
  { title: '序号', dataIndex: 'index', key: 'index', width: 60, render: (_: any, __: any, index: number) => index + 1 },
  {
    title: '检测线',
    dataIndex: 'detectionLine',
    key: 'detectionLine',
    width: 150,
  },
  {
    title: '设备',
    dataIndex: 'devices',
    key: 'devices',
    width: 400,
    render: (devices: string) => (
      <div style={{ fontSize: 12, lineHeight: 1.5 }}>{devices}</div>
    ),
  },
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
];

// 模拟数据
const mockData = [
  {
    id: '1',
    detectionLine: '外观检测线',
    devices: '不解体金属探伤仪,内窥式测量仪,数显轮胎花纹深度尺,机动车方向盘转向力-转向角检测仪,机动车制动踏板力测试仪,手制动计,温湿度计,空气压',
  },
  {
    id: '2',
    detectionLine: '安检1号线（平板）',
    devices: '平板制动检验台,机动车前照灯检测仪',
  },
  {
    id: '3',
    detectionLine: '安检2号线（滚筒）',
    devices: 'OBD诊断仪,便携式制动性能测试仪,机动车前照灯检测仪,机动车侧滑检验台,汽车侧滑检验台,滚筒反力式制动检验台',
  },
  {
    id: '4',
    detectionLine: '安检3号线（摩托）',
    devices: '夹紧器,机动车前照灯检测仪,机动车侧滑检验台,滚筒反力式制动检验台',
  },
  {
    id: '5',
    detectionLine: '环保1号线',
    devices: '振动式转速分析仪,汽车排气分析仪,汽车排气烟度监测仪',
  },
  {
    id: '6',
    detectionLine: '环保2号线',
    devices: '机动车排气流量分析仪,汽车排气分析仪,汽车排气烟度监测仪,汽车环保底盘测功机',
  },
  {
    id: '7',
    detectionLine: '环保3号线',
    devices: '振动式转速分析仪,机动车排气流量分析仪,汽车排气分析仪,汽车排气烟度监测仪,汽车环保底盘测功机',
  },
  {
    id: '8',
    detectionLine: '环保4号线',
    devices: 'OBD诊断仪,振动式转速分析仪,汽车排气分析仪,汽车排气烟度监测仪,汽车环保底盘监测仪,环境参数仪,透射式烟度计',
  },
];

const DeviceUsage: React.FC = () => {
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
    
    if (values.detectionLine) {
      result = result.filter(item => item.detectionLine === values.detectionLine);
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
    { title: '检测线总数', value: data.length },
    { title: '安检线', value: data.filter(item => item.detectionLine?.includes('安检')).length },
    { title: '环保线', value: data.filter(item => item.detectionLine?.includes('环保')).length },
    { title: '其他', value: data.filter(item => !item.detectionLine?.includes('安检') && !item.detectionLine?.includes('环保')).length },
  ];

  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { title: '首页', path: '/' },
          { title: '设备管理' },
          { title: '设备使用记录' },
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
              新增使用记录
            </Button>
            <Button icon={<VideoCameraOutlined />}>
              操作视频
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

      <UsageForm
        visible={formVisible}
        record={editingRecord}
        mode={formMode}
        onCancel={handleCancel}
        onSave={handleSave}
      />
    </div>
  );
};

export default DeviceUsage;
