import React, { useState, useEffect } from 'react';
import { Card, Button, Space, Tag, message, Statistic, Row, Col } from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  DownloadOutlined,
  PrinterOutlined,
  FileOutlined,
} from '@ant-design/icons';
import PageHeader from '../../../components/Common/PageHeader';
import SearchForm from '../../../components/Common/SearchForm';
import DataTable from '../../../components/Common/DataTable';
import TrainingForm from './TrainingForm';
import { getData, saveModuleData, addItem, updateItem, deleteItem } from '../../../utils/storage';

const MODULE_KEY = 'personnel_training';

// 搜索字段类型定义
interface SearchField {
  name: string;
  label: string;
  type: 'input' | 'select' | 'dateRange';
  options?: { label: string; value: string }[];
  placeholder?: string;
}

// 搜索字段配置
const searchFields: SearchField[] = [
  { name: 'trainingProject', label: '培训项目', type: 'input', placeholder: '请输入培训项目' },
  { name: 'trainingForm', label: '培训形式', type: 'select', options: [
    { label: '内部培训', value: '内部培训' },
    { label: '外部培训', value: '外部培训' },
    { label: '线上培训', value: '线上培训' },
    { label: '外出学习', value: '外出学习' },
  ]},
  { name: 'projectStatus', label: '项目状态', type: 'select', options: [
    { label: '计划中', value: '计划中' },
    { label: '已完成', value: '已完成' },
    { label: '未完成', value: '未完成' },
  ]},
];

// 计算项目状态
const calculateProjectStatus = (record: any): string => {
  const today = new Date();
  const planDate = record.planDate ? new Date(record.planDate) : null;
  
  // 如果上传了培训附件（实施记录或有效性评价），则视为已完成
  const hasAttachment = record.implementationRecord || record.effectivenessEvaluation;
  
  if (hasAttachment) {
    return '已完成';
  }
  
  if (planDate) {
    if (planDate < today) {
      return '未完成'; // 计划时间已过但未上传附件
    } else {
      return '计划中'; // 计划时间未到
    }
  }
  
  return '计划中';
};

// 表格列配置
const columns = [
  { title: '序号', dataIndex: 'index', key: 'index', width: 60, render: (_: any, __: any, index: number) => index + 1 },
  { title: '培训项目', dataIndex: 'trainingProject', key: 'trainingProject', width: 200 },
  { title: '计划培训时间', dataIndex: 'planDate', key: 'planDate', width: 120 },
  { title: '培训对象', dataIndex: 'trainingTarget', key: 'trainingTarget', width: 150 },
  {
    title: '项目状态',
    dataIndex: 'projectStatus',
    key: 'projectStatus',
    width: 100,
    render: (_: string, record: any) => {
      const status = calculateProjectStatus(record);
      const colorMap: { [key: string]: string } = {
        '计划中': 'blue',
        '已完成': 'green',
        '未完成': 'red',
      };
      return <Tag color={colorMap[status] || 'default'}>{status}</Tag>;
    },
  },
  {
    title: '培训附件',
    dataIndex: 'attachments',
    key: 'attachments',
    width: 150,
    render: (_: any, record: any) => {
      const hasImplementation = !!record.implementationRecord;
      const hasEffectiveness = !!record.effectivenessEvaluation;
      
      return (
        <Space direction="vertical" size="small">
          {hasImplementation && (
            <Tag color="blue" icon={<FileOutlined />}>实施记录</Tag>
          )}
          {hasEffectiveness && (
            <Tag color="green" icon={<FileOutlined />}>有效性评价</Tag>
          )}
          {!hasImplementation && !hasEffectiveness && (
            <span style={{ color: '#999' }}>-</span>
          )}
        </Space>
      );
    },
  },
  { title: '培训内容', dataIndex: 'trainingContent', key: 'trainingContent', width: 200, ellipsis: true },
  { title: '培训形式', dataIndex: 'trainingForm', key: 'trainingForm', width: 100 },
];

// 模拟数据
const mockData = [
  { 
    id: '1', 
    trainingProject: '2022年度人员培训计划', 
    planDate: '2022-05-18', 
    trainingTarget: '张经理,金益森,卢静怡', 
    trainingContent: '管理体系宣贯培训及机动车检验机构资质认定评审补充技术要求释义培训', 
    trainingForm: '内部培训',
    implementationRecord: 'implementation_123.pdf',
    effectivenessEvaluation: 'effectiveness_123.pdf',
  },
  { 
    id: '2', 
    trainingProject: '2023年培训计划表', 
    planDate: '2023-03-08', 
    trainingTarget: '郑晓红,吴建国', 
    trainingContent: '环保检测标准培训', 
    trainingForm: '外部培训',
    implementationRecord: null,
    effectivenessEvaluation: null,
  },
  { 
    id: '3', 
    trainingProject: '2023年度人员培训计划-补', 
    planDate: '2026-03-08', 
    trainingTarget: '全体员工', 
    trainingContent: '安检检测标准培训', 
    trainingForm: '线上培训',
    implementationRecord: null,
    effectivenessEvaluation: null,
  },
];

const PersonnelTraining: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  
  // 表单弹窗状态
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
      // 第一次加载，使用模拟数据并保存到 LocalStorage
      setData(mockData);
      setFilteredData(mockData);
      setPagination(prev => ({ ...prev, total: mockData.length }));
      saveModuleData(MODULE_KEY, mockData);
    }
    setLoading(false);
  };

  const handleSearch = (values: any) => {
    let result = [...data];
    
    if (values.trainingProject) {
      result = result.filter(item => item.trainingProject?.includes(values.trainingProject));
    }
    if (values.trainingForm) {
      result = result.filter(item => item.trainingForm === values.trainingForm);
    }
    if (values.projectStatus) {
      result = result.filter(item => calculateProjectStatus(item) === values.projectStatus);
    }
    
    setFilteredData(result);
    setPagination(prev => ({ ...prev, current: 1, total: result.length }));
  };

  const handleReset = () => {
    setFilteredData(data);
    setPagination(prev => ({ ...prev, current: 1, total: data.length }));
  };

  // 打开新增弹窗
  const handleAdd = () => {
    setFormMode('add');
    setEditingRecord({});
    setFormVisible(true);
  };

  // 打开编辑弹窗
  const handleEdit = (record: any) => {
    setFormMode('edit');
    setEditingRecord(record);
    setFormVisible(true);
  };

  // 打开查看弹窗
  const handleView = (record: any) => {
    setFormMode('view');
    setEditingRecord(record);
    setFormVisible(true);
  };

  // 保存数据
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

  // 关闭弹窗
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

  // 分页数据
  const startIndex = (pagination.current - 1) * pagination.pageSize;
  const endIndex = startIndex + pagination.pageSize;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  // 统计卡片数据
  const statistics = [
    { title: '培训计划总数', value: data.length },
    { title: '已完成', value: data.filter(item => calculateProjectStatus(item) === '已完成').length },
    { title: '计划中', value: data.filter(item => calculateProjectStatus(item) === '计划中').length },
    { title: '未完成', value: data.filter(item => calculateProjectStatus(item) === '未完成').length },
  ];

  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { title: '首页', path: '/' },
          { title: '人员管理' },
          { title: '人员培训' },
        ]}
      />

      {/* 统计卡片 */}
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
            <Button icon={<DeleteOutlined />} onClick={handleBatchDelete} disabled={selectedRowKeys.length === 0}>
              删除计划
            </Button>
          </Space>
          <Space>
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

      {/* 新增/编辑/查看弹窗 */}
      <TrainingForm
        visible={formVisible}
        record={editingRecord}
        mode={formMode}
        onCancel={handleCancel}
        onSave={handleSave}
      />
    </div>
  );
};

export default PersonnelTraining;
