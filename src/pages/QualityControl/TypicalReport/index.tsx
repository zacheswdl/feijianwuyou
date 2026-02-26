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
import ReportForm from './ReportForm';
import { getData, saveModuleData, addItem, updateItem, deleteItem } from '../../../utils/storage';

const MODULE_KEY = 'quality_typical_report';

// 搜索字段配置
const searchFields = [
  { name: 'reportName', label: '报告名称', type: 'input' as const, placeholder: '请输入报告名称' },
  { name: 'reportType', label: '报告类型', type: 'select' as const, options: [
    { label: '检测报告', value: 'test' },
    { label: '校准报告', value: 'calibration' },
    { label: '评审报告', value: 'review' },
    { label: '其他', value: 'other' },
  ]},
  { name: 'status', label: '状态', type: 'select' as const, options: [
    { label: '草稿', value: 'draft' },
    { label: '待审核', value: 'pending' },
    { label: '已批准', value: 'approved' },
  ]},
];

// 表格列配置
const columns = [
  { title: '序号', dataIndex: 'index', key: 'index', width: 60, render: (_: any, __: any, index: number) => index + 1 },
  { title: '报告编号', dataIndex: 'reportCode', key: 'reportCode', width: 120 },
  { title: '报告名称', dataIndex: 'reportName', key: 'reportName', width: 200 },
  {
    title: '报告类型',
    dataIndex: 'reportType',
    key: 'reportType',
    width: 100,
    render: (type: string) => {
      const map: Record<string, { text: string; color: string }> = {
        test: { text: '检测报告', color: 'blue' },
        calibration: { text: '校准报告', color: 'green' },
        review: { text: '评审报告', color: 'purple' },
        other: { text: '其他', color: 'default' }
      };
      const config = map[type] || { text: type, color: 'default' };
      return <Tag color={config.color}>{config.text}</Tag>;
    },
  },
  { title: '编制日期', dataIndex: 'createDate', key: 'createDate', width: 120 },
  { title: '编制人', dataIndex: 'creator', key: 'creator', width: 100 },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 100,
    render: (status: string) => {
      const map: Record<string, { text: string; color: string }> = {
        draft: { text: '草稿', color: 'default' },
        pending: { text: '待审核', color: 'warning' },
        approved: { text: '已批准', color: 'success' }
      };
      const config = map[status] || { text: status, color: 'default' };
      return <Tag color={config.color}>{config.text}</Tag>;
    },
  },
  { title: '备注', dataIndex: 'remark', key: 'remark', ellipsis: true },
];

// 模拟数据
const mockData = [
  {
    id: '1',
    reportCode: 'RPT-2024-001',
    reportName: '2024年第一季度检测报告',
    reportType: 'test',
    createDate: '2024-01-15',
    creator: '张三',
    status: 'approved',
    remark: '已完成审核',
  },
  {
    id: '2',
    reportCode: 'RPT-2024-002',
    reportName: '设备校准报告',
    reportType: 'calibration',
    createDate: '2024-01-20',
    creator: '李四',
    status: 'pending',
    remark: '待审核',
  },
];

const TypicalReport: React.FC = () => {
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
    
    if (values.reportName) {
      result = result.filter(item => item.reportName?.includes(values.reportName));
    }
    if (values.reportType) {
      result = result.filter(item => item.reportType === values.reportType);
    }
    if (values.status) {
      result = result.filter(item => item.status === values.status);
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
    { title: '报告总数', value: data.length },
    { title: '已批准', value: data.filter(item => item.status === 'approved').length },
    { title: '待审核', value: data.filter(item => item.status === 'pending').length },
    { title: '草稿', value: data.filter(item => item.status === 'draft').length },
  ];

  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { title: '首页', path: '/' },
          { title: '质量控制管理' },
          { title: '典型报告' },
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
              新增报告
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

      <ReportForm
        visible={formVisible}
        record={editingRecord}
        mode={formMode}
        onCancel={handleCancel}
        onSave={handleSave}
      />
    </div>
  );
};

export default TypicalReport;
