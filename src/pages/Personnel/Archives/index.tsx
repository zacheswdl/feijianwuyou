import React, { useState, useEffect } from 'react';
import { Card, Button, Space, Tag, Tooltip, message } from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  DownloadOutlined,
  PrinterOutlined,
  FileExcelOutlined,
} from '@ant-design/icons';
import PageHeader from '../../../components/Common/PageHeader';
import SearchForm from '../../../components/Common/SearchForm';
import DataTable from '../../../components/Common/DataTable';
import PersonnelForm from './PersonnelForm';
import { getData, saveModuleData, addItem, updateItem, deleteItem } from '../../../utils/storage';

const MODULE_KEY = 'personnel_archives';

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
  { name: 'name', label: '姓名', type: 'input', placeholder: '请输入姓名' },
  { name: 'education', label: '学历', type: 'select', options: [
    { label: '高中', value: '高中' },
    { label: '大专', value: '大专' },
    { label: '本科', value: '本科' },
    { label: '硕士', value: '硕士' },
    { label: '博士', value: '博士' },
  ]},
  { name: 'department', label: '部门', type: 'select', options: [
    { label: '检测车间', value: '检测车间' },
    { label: '营业大厅', value: '营业大厅' },
    { label: '管理层', value: '管理层' },
  ]},
  { name: 'position', label: '岗位', type: 'select', options: [
    { label: '外观检验员', value: '外观检验员' },
    { label: '底盘检验员', value: '底盘检验员' },
    { label: '引车员', value: '引车员' },
    { label: '环保操作员', value: '环保操作员' },
    { label: '登录员', value: '登录员' },
    { label: '技术负责人', value: '技术负责人' },
    { label: '质量负责人', value: '质量负责人' },
    { label: '授权签字人', value: '授权签字人' },
    { label: '站长', value: '站长' },
    { label: '车间主任', value: '车间主任' },
    { label: '大厅主任', value: '大厅主任' },
    { label: '档案管理员', value: '档案管理员' },
  ]},
  { name: 'storageLocation', label: '存放地点', type: 'select', options: [
    { label: '档案室', value: '档案室' },
    { label: '仓库', value: '仓库' },
  ]},
];

// 表格列配置
const columns = [
  { title: '序号', dataIndex: 'index', key: 'index', width: 60, render: (_: any, __: any, index: number) => index + 1 },
  { title: '姓名', dataIndex: 'name', key: 'name', width: 100 },
  { title: '性别', dataIndex: 'gender', key: 'gender', width: 60 },
  { title: '学历', dataIndex: 'education', key: 'education', width: 80 },
  { title: '技术职称', dataIndex: 'technicalTitle', key: 'technicalTitle', width: 100 },
  { 
    title: '部门', 
    dataIndex: 'department', 
    key: 'department', 
    width: 120,
    render: (dept: string | string[]) => {
      if (Array.isArray(dept)) {
        return dept.join('、');
      }
      return dept || '-';
    }
  },
  { 
    title: '岗位', 
    dataIndex: 'position', 
    key: 'position', 
    width: 150,
    render: (pos: string | string[]) => {
      if (Array.isArray(pos)) {
        return pos.join('、');
      }
      return pos || '-';
    }
  },
  { title: '入职时间', dataIndex: 'entryDate', key: 'entryDate', width: 100 },
  { title: '存放地点', dataIndex: 'storageLocation', key: 'storageLocation', width: 100 },
  {
    title: '培训',
    dataIndex: 'trainingCount',
    key: 'trainingCount',
    width: 60,
    render: (count: number) => (
      <Tag color={count > 0 ? 'blue' : 'default'}>{count || 0}</Tag>
    ),
  },
  {
    title: '资格确认',
    dataIndex: 'qualificationCount',
    key: 'qualificationCount',
    width: 80,
    render: (count: number, record: any) => (
      <Tooltip title={record.qualificationTip}>
        <Tag color={count > 0 ? 'success' : 'error'}>{count || 0}</Tag>
      </Tooltip>
    ),
  },
  {
    title: '授权',
    dataIndex: 'authorizationCount',
    key: 'authorizationCount',
    width: 60,
    render: (count: number) => (
      <Tag color={count > 0 ? 'success' : 'default'}>{count || 0}</Tag>
    ),
  },
  {
    title: '任命',
    dataIndex: 'appointmentCount',
    key: 'appointmentCount',
    width: 60,
    render: (count: number) => (
      <Tag color={count > 0 ? 'success' : 'default'}>{count || 0}</Tag>
    ),
  },
  {
    title: '监督',
    dataIndex: 'supervisionCount',
    key: 'supervisionCount',
    width: 60,
    render: (count: number) => (
      <Tag color={count > 0 ? 'success' : 'default'}>{count || 0}</Tag>
    ),
  },
];

// 模拟数据
const mockData = [
  { id: '1', personnelNo: '001', name: '张经理', gender: '男', education: '高中', technicalTitle: '/', department: '检测车间', position: '引车员', entryDate: '2022-04-01', storageLocation: '档案室', trainingCount: 4, qualificationCount: 0, authorizationCount: 1, appointmentCount: 0, supervisionCount: 0, phone: '13800138001', idCard: '330101199001011234' },
  { id: '2', personnelNo: '002', name: '金益森', gender: '男', education: '高中', technicalTitle: '/', department: '检测车间', position: '底盘部件检测员', entryDate: '2022-04-01', storageLocation: '档案室', trainingCount: 4, qualificationCount: 0, authorizationCount: 1, appointmentCount: 0, supervisionCount: 0, phone: '13800138002', idCard: '330101199001021234' },
  { id: '3', personnelNo: '003', name: '卢静怡', gender: '女', education: '/', technicalTitle: '/', department: '办公室', position: '环保检测员', entryDate: '2022-04-01', storageLocation: '档案室', trainingCount: 2, qualificationCount: 0, authorizationCount: 1, appointmentCount: 0, supervisionCount: 0, phone: '13800138003', idCard: '330101199001031234' },
  { id: '4', personnelNo: '004', name: '郑晓红', gender: '女', education: '/', technicalTitle: '/', department: '检测车间', position: '环保检测员', entryDate: '2022-04-01', storageLocation: '档案室', trainingCount: 5, qualificationCount: 0, authorizationCount: 1, appointmentCount: 0, supervisionCount: 0, phone: '13800138004', idCard: '330101199001041234' },
  { id: '5', personnelNo: '005', name: '吴建国', gender: '男', education: '/', technicalTitle: '/', department: '办公室', position: '档案管理员', entryDate: '2022-04-01', storageLocation: '档案室', trainingCount: 3, qualificationCount: 0, authorizationCount: 1, appointmentCount: 0, supervisionCount: 0, phone: '13800138005', idCard: '330101199001051234' },
];

const PersonnelArchives: React.FC = () => {
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

  // 计算培训次数 - 根据培训对象统计
  const calculateTrainingCount = (personName: string): number => {
    const trainingData = getData('personnel_training') || [];
    let count = 0;
    
    trainingData.forEach((record: any) => {
      if (record.trainingTarget) {
        // 将姓名按顿号、逗号分隔，并去除空格
        const names = record.trainingTarget.split(/[、,，]/).map((name: string) => name.trim());
        if (names.includes(personName) || names.includes('全体员工')) {
          count++;
        }
      }
    });
    
    return count;
  };

  // 计算资格确认次数 - 根据姓名统计
  const calculateQualificationCount = (personName: string): number => {
    const qualificationData = getData('personnel_qualification') || [];
    return qualificationData.filter((record: any) => record.personName === personName).length;
  };

  // 计算授权次数 - 根据授权文件中的姓名统计
  const calculateAuthorizationCount = (personName: string): number => {
    const authorizationData = getData('personnel_authorization') || [];
    let count = 0;
    
    authorizationData.forEach((record: any) => {
      if (record.personNames) {
        // 将姓名按顿号分隔，并去除空格
        const names = record.personNames.split('、').map((name: string) => name.trim());
        if (names.includes(personName)) {
          count++;
        }
      }
    });
    
    return count;
  };

  // 计算任命次数 - 根据任命文件中的姓名统计
  const calculateAppointmentCount = (personName: string): number => {
    const appointmentData = getData('personnel_appointment') || [];
    let count = 0;
    
    appointmentData.forEach((record: any) => {
      if (record.personNames) {
        // 将姓名按顿号分隔，并去除空格
        const names = record.personNames.split('、').map((name: string) => name.trim());
        if (names.includes(personName)) {
          count++;
        }
      }
    });
    
    return count;
  };

  // 计算监督次数 - 根据被监督人姓名统计
  const calculateSupervisionCount = (personName: string): number => {
    const supervisionData = getData('personnel_supervision') || [];
    return supervisionData.filter((record: any) => record.personName === personName).length;
  };

  const loadData = () => {
    setLoading(true);
    const storedData = getData(MODULE_KEY);
    if (storedData && storedData.length > 0) {
      // 更新各项次数统计
      const updatedData = storedData.map((person: any) => ({
        ...person,
        trainingCount: calculateTrainingCount(person.name),
        qualificationCount: calculateQualificationCount(person.name),
        authorizationCount: calculateAuthorizationCount(person.name),
        appointmentCount: calculateAppointmentCount(person.name),
        supervisionCount: calculateSupervisionCount(person.name),
      }));
      setData(updatedData);
      setFilteredData(updatedData);
      setPagination(prev => ({ ...prev, total: updatedData.length }));
    } else {
      // 第一次加载，使用模拟数据并保存到 LocalStorage
      const updatedMockData = mockData.map((person: any) => ({
        ...person,
        trainingCount: calculateTrainingCount(person.name),
        qualificationCount: calculateQualificationCount(person.name),
        authorizationCount: calculateAuthorizationCount(person.name),
        appointmentCount: calculateAppointmentCount(person.name),
        supervisionCount: calculateSupervisionCount(person.name),
      }));
      setData(updatedMockData);
      setFilteredData(updatedMockData);
      setPagination(prev => ({ ...prev, total: updatedMockData.length }));
      // 保存模拟数据到 LocalStorage
      saveModuleData(MODULE_KEY, updatedMockData);
    }
    setLoading(false);
  };

  const handleSearch = (values: any) => {
    let result = [...data];
    
    if (values.name) {
      result = result.filter(item => item.name.includes(values.name));
    }
    if (values.education) {
      result = result.filter(item => item.education === values.education);
    }
    if (values.department) {
      result = result.filter(item => item.department === values.department);
    }
    if (values.position) {
      result = result.filter(item => item.position === values.position);
    }
    if (values.storageLocation) {
      result = result.filter(item => item.storageLocation === values.storageLocation);
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
  const handleSave = async (values: any) => {
    if (formMode === 'edit') {
      // 编辑模式
      await updateItem(MODULE_KEY, editingRecord.id, values);
      message.success('编辑成功');
    } else if (formMode === 'add') {
      // 新增模式
      await addItem(MODULE_KEY, values);
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

  const handleDelete = async (record: any) => {
    const newData = await deleteItem(MODULE_KEY, record.id);
    message.success('删除成功');
    // 更新本地状态
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
    // 更新本地状态
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

  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { title: '首页', path: '/' },
          { title: '人员管理' },
          { title: '人员档案' },
        ]}
      />
      
      <SearchForm fields={searchFields} onSearch={handleSearch} onReset={handleReset} />
      
      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新增人员
            </Button>
            <Button icon={<DeleteOutlined />} onClick={handleBatchDelete} disabled={selectedRowKeys.length === 0}>
              删除
            </Button>
          </Space>
          <Space>
            <Button icon={<FileExcelOutlined />}>模板下载</Button>
            <Button icon={<DownloadOutlined />}>数据导出</Button>
            <Button icon={<DownloadOutlined />}>下载人员一览表</Button>
            <Button icon={<DownloadOutlined />}>人员简历下载</Button>
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
      <PersonnelForm
        visible={formVisible}
        record={editingRecord}
        mode={formMode}
        onCancel={handleCancel}
        onSave={handleSave}
      />
    </div>
  );
};

export default PersonnelArchives;
