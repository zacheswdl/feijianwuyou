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
import QualificationForm from './QualificationForm';
import { getData, saveModuleData, addItem, updateItem, deleteItem } from '../../../utils/storage';

const MODULE_KEY = 'personnel_qualification';

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
  { name: 'personName', label: '姓名', type: 'input', placeholder: '请输入姓名' },
  { name: 'position', label: '岗位', type: 'input', placeholder: '请输入岗位' },
  { name: 'education', label: '学历', type: 'input', placeholder: '请输入学历' },
];

// 表格列配置
const columns = [
  { title: '序号', dataIndex: 'index', key: 'index', width: 60, render: (_: any, __: any, index: number) => index + 1 },
  { title: '姓名', dataIndex: 'personName', key: 'personName', width: 100 },
  { title: '岗位', dataIndex: 'position', key: 'position', width: 120 },
  { title: '学历及所学专业', dataIndex: 'education', key: 'education', width: 150, ellipsis: true },
  { title: '确认时间', dataIndex: 'confirmDate', key: 'confirmDate', width: 110 },
  { title: '专业特长', dataIndex: 'specialty', key: 'specialty', width: 200, ellipsis: true },
  {
    title: '确认人',
    dataIndex: 'confirmPerson',
    key: 'confirmPerson',
    width: 120,
    render: (text: string) => text || '-',
  },
];

// 模拟数据
const mockData = [
  { 
    id: '1', 
    personName: '涂海丹', 
    position: '授权签字人', 
    education: '大专/涉外文秘',
    confirmDate: '2026-01-29',
    specialty: '机动车安全检验技术、排放检测技术、相关法律法规及标准',
    trainingExperience: `2017.06 参加中认科研（北京）标准化技术研究院 机动车安全技术检验员 培训 取证 CS20172415402
2025.07 参加浙江省环境监测协会 机动车排气污染检验技术培训取证(机)字第2025021236
2025.06 参加省机动车检测维修专业技术人员职业资格 机动车检测维修工程师考核取证 31520250633020400201`,
    workExperience: `2015-06 至 2016-12 瑞安市塘下车辆检测有限公司 担任检测员
2017-04 至 2020-10 瑞安市车辆综合性能检测站 担任检测员
2026 年 1 月至今 瑞安市安阳隆山车辆检测有限公司 担任授权签字人`,
    mainInstruments: '',
    instrumentConfirmation: '经确认，该员工经相关培训并通过考核取得相关证件，经质量监督确认具备现行的安检、环检标准认知能力，熟悉检验检测报告审核程序。',
    projectConfirmation: '经确认，该员工经相关培训并通过考核取得相关证照，经质量监督确认具备现行的安检、环检标准认知能力，熟悉检验检测报告审核程序，有能力进行检验检测报告签字工作。',
    confirmPerson: '',
    confirmPersonDate: '',
  },
];

const PersonnelQualification: React.FC = () => {
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

    if (values.personName) {
      result = result.filter(item => item.personName?.includes(values.personName));
    }
    if (values.position) {
      result = result.filter(item => item.position?.includes(values.position));
    }
    if (values.education) {
      result = result.filter(item => item.education?.includes(values.education));
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

  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { title: '首页', path: '/' },
          { title: '人员管理' },
          { title: '资格确认' },
        ]}
      />

      {/* 统计卡片 */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={6}>
            <Statistic title="资格确认文件总数" value={data.length} />
          </Col>
          <Col span={6}>
            <Statistic 
              title="已上传附件" 
              value={data.filter(item => item.attachments && item.attachments.length > 0).length} 
            />
          </Col>
        </Row>
      </Card>

      <SearchForm fields={searchFields} onSearch={handleSearch} onReset={handleReset} />

      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新增资格确认记录
            </Button>
            <Button icon={<DeleteOutlined />} onClick={handleBatchDelete} disabled={selectedRowKeys.length === 0}>
              删除
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
      <QualificationForm
        visible={formVisible}
        record={editingRecord}
        mode={formMode}
        onCancel={handleCancel}
        onSave={handleSave}
      />
    </div>
  );
};

export default PersonnelQualification;
