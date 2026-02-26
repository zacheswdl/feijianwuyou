import { useState, useEffect } from 'react';
import { Card, Button, Space, Tag, Popconfirm, message, Statistic, Row, Col } from 'antd';
import { PlusOutlined, EditOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import PageHeader from '../../../components/Common/PageHeader';
import SearchForm from '../../../components/Common/SearchForm';
import DataTable from '../../../components/Common/DataTable';
import SupervisionForm from './SupervisionForm';
import { getData as getModuleData, saveModuleData } from '../../../utils/storage';

const MODULE_KEY = 'personnel_supervision';

// 模拟数据
const mockData = [
  {
    id: '1',
    personName: '张经理',
    supervisionDate: '2024-01-15',
    supervisor: '李质量监督员',
    supervisionType: '日常监督',
    supervisionContent: '机动车安全技术检验操作过程监督',
    supervisionMethod: '现场观察',
    result: '合格',
    issues: '',
    correctiveRequirements: '',
    correctiveActions: '',
    verification: '',
    remark: '操作规范，符合要求',
    attachments: [],
    createTime: '2024-01-15 10:00:00',
  },
  {
    id: '2',
    personName: '王德力',
    supervisionDate: '2024-02-20',
    supervisor: '张质量监督员',
    supervisionType: '新上岗监督',
    supervisionContent: '排放检测操作及报告审核监督',
    supervisionMethod: '现场观察+报告核查',
    result: '基本合格',
    issues: '报告审核时部分项目描述不够规范',
    correctiveRequirements: '加强报告审核培训，规范报告描述',
    correctiveActions: '已参加报告审核专项培训',
    verification: '经复核，整改已完成',
    remark: '需持续关注',
    attachments: [],
    createTime: '2024-02-20 14:30:00',
  },
  {
    id: '3',
    personName: '金益森',
    supervisionDate: '2024-03-10',
    supervisor: '李质量监督员',
    supervisionType: '专项监督',
    supervisionContent: '底盘部件检测操作监督',
    supervisionMethod: '盲样考核',
    result: '合格',
    issues: '',
    correctiveRequirements: '',
    correctiveActions: '',
    verification: '',
    remark: '盲样考核结果满意',
    attachments: [],
    createTime: '2024-03-10 09:00:00',
  },
];

const PersonnelSupervision = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view'>('add');
  const [currentRecord, setCurrentRecord] = useState<any>(null);
  const [searchValues, setSearchValues] = useState({});

  // 加载数据
  const loadData = () => {
    setLoading(true);
    const stored = getModuleData(MODULE_KEY);
    if (stored && stored.length > 0) {
      setData(stored);
    } else {
      setData(mockData);
      saveModuleData(MODULE_KEY, mockData);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // 搜索字段配置
  const searchFields = [
    {
      type: 'input' as const,
      name: 'personName',
      label: '被监督人',
      placeholder: '请输入被监督人姓名',
    },
    {
      type: 'select' as const,
      name: 'supervisionType',
      label: '监督类型',
      placeholder: '请选择监督类型',
      options: [
        { label: '日常监督', value: '日常监督' },
        { label: '专项监督', value: '专项监督' },
        { label: '新上岗监督', value: '新上岗监督' },
        { label: '新项目监督', value: '新项目监督' },
        { label: '投诉调查', value: '投诉调查' },
        { label: '其他', value: '其他' },
      ],
    },
    {
      type: 'select' as const,
      name: 'result',
      label: '监督结果',
      placeholder: '请选择监督结果',
      options: [
        { label: '合格', value: '合格' },
        { label: '基本合格', value: '基本合格' },
        { label: '不合格', value: '不合格' },
      ],
    },
  ];

  // 表格列配置
  const columns = [
    {
      title: '被监督人',
      dataIndex: 'personName',
      key: 'personName',
      width: 100,
    },
    {
      title: '监督日期',
      dataIndex: 'supervisionDate',
      key: 'supervisionDate',
      width: 110,
    },
    {
      title: '监督员',
      dataIndex: 'supervisor',
      key: 'supervisor',
      width: 120,
    },
    {
      title: '监督类型',
      dataIndex: 'supervisionType',
      key: 'supervisionType',
      width: 110,
      render: (text: string) => {
        const colorMap: { [key: string]: string } = {
          '日常监督': 'blue',
          '专项监督': 'purple',
          '新上岗监督': 'orange',
          '新项目监督': 'cyan',
          '投诉调查': 'red',
          '其他': 'default',
        };
        return <Tag color={colorMap[text] || 'default'}>{text}</Tag>;
      },
    },
    {
      title: '监督内容',
      dataIndex: 'supervisionContent',
      key: 'supervisionContent',
      width: 200,
      ellipsis: true,
    },
    {
      title: '监督方式',
      dataIndex: 'supervisionMethod',
      key: 'supervisionMethod',
      width: 120,
    },
    {
      title: '监督结果',
      dataIndex: 'result',
      key: 'result',
      width: 90,
      render: (text: string) => {
        const colorMap: { [key: string]: string } = {
          '合格': 'success',
          '基本合格': 'warning',
          '不合格': 'error',
        };
        return <Tag color={colorMap[text] || 'default'}>{text}</Tag>;
      },
    },
    {
      title: '发现问题',
      dataIndex: 'issues',
      key: 'issues',
      width: 150,
      ellipsis: true,
      render: (text: string) => text || '-',
    },
    {
      title: '整改验证',
      dataIndex: 'verification',
      key: 'verification',
      width: 150,
      ellipsis: true,
      render: (text: string) => text || '-',
    },
    {
      title: '建议下次监督日期',
      dataIndex: 'nextSupervisionDate',
      key: 'nextSupervisionDate',
      width: 130,
      render: (text: string) => {
        if (!text) return '-';
        const nextDate = new Date(text);
        const today = new Date();
        const daysDiff = Math.ceil((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff < 0) {
          return <span style={{ color: '#ff4d4f' }}>{text} (已过期)</span>;
        } else if (daysDiff <= 7) {
          return <span style={{ color: '#faad14' }}>{text} (即将到期)</span>;
        }
        return text;
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 150,
    },
  ];

  // 处理搜索
  const handleSearch = (values: any) => {
    setSearchValues(values);
    let filtered = [...data];
    
    if (values.personName) {
      filtered = filtered.filter(item => 
        item.personName?.includes(values.personName)
      );
    }
    if (values.supervisionType) {
      filtered = filtered.filter(item => item.supervisionType === values.supervisionType);
    }
    if (values.result) {
      filtered = filtered.filter(item => item.result === values.result);
    }
    
    setData(filtered);
  };

  // 重置搜索
  const handleReset = () => {
    setSearchValues({});
    loadData();
  };

  // 新增
  const handleAdd = () => {
    setCurrentRecord(null);
    setModalMode('add');
    setModalVisible(true);
  };

  // 编辑
  const handleEdit = (record: any) => {
    setCurrentRecord(record);
    setModalMode('edit');
    setModalVisible(true);
  };

  // 查看
  const handleView = (record: any) => {
    setCurrentRecord(record);
    setModalMode('view');
    setModalVisible(true);
  };

  // 删除
  const handleDelete = (id: string) => {
    const newData = data.filter(item => item.id !== id);
    setData(newData);
    saveModuleData(MODULE_KEY, newData);
    message.success('删除成功');
  };

  // 保存
  const handleSave = (values: any) => {
    const now = new Date().toLocaleString('zh-CN');
    
    if (modalMode === 'add') {
      const newRecord = {
        ...values,
        id: Date.now().toString(),
        createTime: now,
      };
      const newData = [newRecord, ...data];
      setData(newData);
      saveModuleData(MODULE_KEY, newData);
      message.success('新增成功');
    } else if (modalMode === 'edit' && currentRecord) {
      const newData = data.map(item => 
        item.id === currentRecord.id 
          ? { ...item, ...values, createTime: item.createTime }
          : item
      );
      setData(newData);
      saveModuleData(MODULE_KEY, newData);
      message.success('修改成功');
    }
    setModalVisible(false);
  };

  // 统计卡片数据
  const statistics = [
    { title: '监督记录总数', value: data.length },
    { title: '合格', value: data.filter(item => item.result === '合格').length },
    { title: '基本合格', value: data.filter(item => item.result === '基本合格').length },
    { title: '不合格', value: data.filter(item => item.result === '不合格').length },
    { 
      title: '需整改', 
      value: data.filter(item => item.issues && item.issues.trim() !== '').length 
    },
    { 
      title: '即将到期监督', 
      value: data.filter(item => {
        if (!item.nextSupervisionDate) return false;
        const nextDate = new Date(item.nextSupervisionDate);
        const today = new Date();
        const daysDiff = Math.ceil((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return daysDiff <= 7 && daysDiff >= 0;
      }).length 
    },
  ];

  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { title: '首页', path: '/' },
          { title: '人员管理' },
          { title: '人员监督' },
        ]}
      />

      {/* 统计卡片 */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          {statistics.map((stat, index) => (
            <Col span={4} key={index}>
              <Statistic title={stat.title} value={stat.value} />
            </Col>
          ))}
        </Row>
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新增监督记录
            </Button>
          </Space>
        </div>

        <SearchForm
          fields={searchFields}
          onSearch={handleSearch}
          onReset={handleReset}
        />

        <DataTable
          columns={columns}
          dataSource={data}
          loading={loading}
          pagination={{
            current: 1,
            pageSize: 10,
            total: data.length,
            onChange: () => {},
          }}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </Card>

      <SupervisionForm
        open={modalVisible}
        record={currentRecord}
        mode={modalMode}
        onCancel={() => setModalVisible(false)}
        onSave={handleSave}
      />
    </div>
  );
};

export default PersonnelSupervision;
