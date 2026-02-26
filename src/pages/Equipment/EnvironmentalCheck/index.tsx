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
import CheckForm from './CheckForm';
import { getData, saveModuleData, addItem, updateItem, deleteItem } from '../../../utils/storage';

const MODULE_KEY = 'equipment_environmental_check';

// 搜索字段配置
const searchFields = [
  { name: 'checkDate', label: '检查日期', type: 'dateRange' },
  { name: 'deviceName', label: '设备名称', type: 'input', placeholder: '请输入设备名称' },
  { name: 'checkResult', label: '检查结果', type: 'select', options: [
    { label: '正常', value: '正常' },
    { label: '异常', value: '异常' },
  ]},
];

// 表格列配置
const columns = [
  { title: '序号', dataIndex: 'index', key: 'index', width: 60, render: (_: any, __: any, index: number) => index + 1 },
  { title: '检查日期', dataIndex: 'checkDate', key: 'checkDate', width: 120 },
  { title: '设备名称', dataIndex: 'deviceName', key: 'deviceName', width: 200 },
  { title: '设备编号', dataIndex: 'deviceNo', key: 'deviceNo', width: 120 },
  { title: '检查项目', dataIndex: 'checkItems', key: 'checkItems', width: 250, ellipsis: true },
  { title: '检查人员', dataIndex: 'checker', key: 'checker', width: 100 },
  {
    title: '检查结果',
    dataIndex: 'checkResult',
    key: 'checkResult',
    width: 100,
    render: (result: string) => {
      const colorMap: { [key: string]: string } = {
        '正常': 'success',
        '异常': 'error',
      };
      return <Tag color={colorMap[result] || 'default'}>{result}</Tag>;
    },
  },
  { title: '异常情况说明', dataIndex: 'abnormalDesc', key: 'abnormalDesc', width: 200, ellipsis: true },
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
    checkDate: '2024-01-15',
    deviceName: '废气分析仪',
    deviceNo: 'FQ-001',
    checkItems: '外观检查、气路检查、传感器检查',
    checker: '张三',
    checkResult: '正常',
    abnormalDesc: '',
    attachments: [],
  },
  {
    id: '2',
    checkDate: '2024-01-16',
    deviceName: '烟度计',
    deviceNo: 'YD-002',
    checkItems: '光路检查、清洁度检查、校准检查',
    checker: '李四',
    checkResult: '异常',
    abnormalDesc: '光路有轻微污染，已清洁处理',
    attachments: [],
  },
];

const EnvironmentalCheck: React.FC = () => {
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
    if (values.checkResult) {
      result = result.filter(item => item.checkResult === values.checkResult);
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
    { title: '检查记录总数', value: data.length },
    { title: '本月检查', value: data.filter(item => item.checkDate?.startsWith('2024-01')).length },
    { title: '正常', value: data.filter(item => item.checkResult === '正常').length },
    { title: '异常', value: data.filter(item => item.checkResult === '异常').length },
  ];

  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { title: '首页', path: '/' },
          { title: '设备管理' },
          { title: '环保设备日常检查' },
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
              新增检查记录
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

      <CheckForm
        visible={formVisible}
        record={editingRecord}
        mode={formMode}
        onCancel={handleCancel}
        onSave={handleSave}
      />
    </div>
  );
};

export default EnvironmentalCheck;
