import React, { useState, useEffect } from 'react';
import { Card, Button, Space, Tag, message, Statistic, Row, Col } from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  DownloadOutlined,
  PrinterOutlined,
  ImportOutlined,
} from '@ant-design/icons';
import PageHeader from '../../../components/Common/PageHeader';
import SearchForm from '../../../components/Common/SearchForm';
import DataTable from '../../../components/Common/DataTable';
import MaterialForm from './MaterialForm';
import { getData, saveModuleData, addItem, updateItem, deleteItem } from '../../../utils/storage';

const MODULE_KEY = 'standard_material_ledger';

// 搜索字段配置
const searchFields = [
  { name: 'materialNo', label: '标准物质编号', type: 'input', placeholder: '请输入标准物质编号' },
  { name: 'materialName', label: '标准物质名称', type: 'input', placeholder: '请输入标准物质名称' },
  { name: 'storageDate', label: '入库时间', type: 'dateRange' },
  { name: 'materialStatus', label: '标准物质状态', type: 'select', options: [
    { label: '在库', value: '在库' },
    { label: '使用中', value: '使用中' },
    { label: '已用完', value: '已用完' },
    { label: '过期', value: '过期' },
  ]},
];

// 计算有效期剩余天数
const calculateValidDays = (validityPeriod: string): number => {
  if (!validityPeriod) return 0;
  const today = new Date();
  const validDate = new Date(validityPeriod);
  const diffTime = validDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// 表格列配置
const columns = [
  { title: '序号', dataIndex: 'index', key: 'index', width: 60, render: (_: any, __: any, index: number) => index + 1 },
  { title: '标准物质名称', dataIndex: 'materialName', key: 'materialName', width: 180 },
  { title: '规格型号', dataIndex: 'specification', key: 'specification', width: 120 },
  { title: '标准物质编号', dataIndex: 'materialNo', key: 'materialNo', width: 120 },
  { title: '证书编号', dataIndex: 'certificateNo', key: 'certificateNo', width: 120 },
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
  {
    title: '有效期剩余天数',
    dataIndex: 'validDays',
    key: 'validDays',
    width: 120,
    render: (_: any, record: any) => {
      if (!record.validityPeriod) return '-';
      const days = calculateValidDays(record.validityPeriod);
      if (days < 0) {
        return <Tag color="red">已过期{Math.abs(days)}天</Tag>;
      } else if (days <= 30) {
        return <Tag color="orange">剩余{days}天</Tag>;
      }
      return <Tag color="green">剩余{days}天</Tag>;
    },
  },
  { title: '定值时间', dataIndex: 'calibrationDate', key: 'calibrationDate', width: 100 },
  { title: '有效期', dataIndex: 'validityPeriod', key: 'validityPeriod', width: 100 },
  { title: '生产厂商', dataIndex: 'manufacturer', key: 'manufacturer', width: 150, ellipsis: true },
  {
    title: '标准物质状态',
    dataIndex: 'materialStatus',
    key: 'materialStatus',
    width: 100,
    render: (status: string) => {
      const colorMap: { [key: string]: string } = {
        '在库': 'success',
        '使用中': 'processing',
        '已用完': 'default',
        '过期': 'error',
      };
      return <Tag color={colorMap[status] || 'default'}>{status}</Tag>;
    },
  },
];

// 模拟数据
const mockData = [
  {
    id: '1',
    materialName: '标准气',
    specification: '/',
    materialNo: '123',
    certificateNo: '/',
    calibrationDate: '2023-10-12',
    validityPeriod: '2025-10-11',
    manufacturer: '杭州新世纪气体有限公司',
    materialStatus: '在库',
  },
];

const StandardMaterialLedger: React.FC = () => {
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
    
    if (values.materialNo) {
      result = result.filter(item => item.materialNo?.includes(values.materialNo));
    }
    if (values.materialName) {
      result = result.filter(item => item.materialName?.includes(values.materialName));
    }
    if (values.materialStatus) {
      result = result.filter(item => item.materialStatus === values.materialStatus);
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
    { title: '标准物质总数', value: data.length },
    { title: '在库', value: data.filter(item => item.materialStatus === '在库').length },
    { title: '使用中', value: data.filter(item => item.materialStatus === '使用中').length },
    { title: '即将过期', value: data.filter(item => {
      if (!item.validityPeriod) return false;
      const days = calculateValidDays(item.validityPeriod);
      return days <= 30 && days >= 0;
    }).length },
  ];

  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { title: '首页', path: '/' },
          { title: '标准物质管理' },
          { title: '标准物质台账' },
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
              新增物质
            </Button>
            <Button icon={<ImportOutlined />}>
              批量导入
            </Button>
            <Button icon={<DownloadOutlined />}>
              模板下载(.xls)
            </Button>
          </Space>
          <Space>
            <Button icon={<DeleteOutlined />} onClick={handleBatchDelete} disabled={selectedRowKeys.length === 0}>
              删除
            </Button>
            <Button icon={<DownloadOutlined />}>下载标准物质登记台账</Button>
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

      <MaterialForm
        visible={formVisible}
        record={editingRecord}
        mode={formMode}
        onCancel={handleCancel}
        onSave={handleSave}
      />
    </div>
  );
};

export default StandardMaterialLedger;
