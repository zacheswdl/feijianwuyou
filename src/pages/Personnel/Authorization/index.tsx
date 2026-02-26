import { useState, useEffect } from 'react';
import { Card, Button, Space, Tag, Popconfirm, message, Statistic, Row, Col } from 'antd';
import { PlusOutlined, EditOutlined, EyeOutlined, DeleteOutlined, PaperClipOutlined } from '@ant-design/icons';
import PageHeader from '../../../components/Common/PageHeader';
import SearchForm from '../../../components/Common/SearchForm';
import DataTable from '../../../components/Common/DataTable';
import AuthorizationForm from './AuthorizationForm';
import { getData as getModuleData, saveModuleData } from '../../../utils/storage';

const MODULE_KEY = 'personnel_authorization';

// 模拟数据
const mockData = [
  {
    id: '1',
    documentNo: 'RAAYLS-SQ【2023001】号',
    authorizeDate: '2023-06-01',
    personNames: '张经理、李工程师、王德力、陈检测员、刘技术员',
    remark: '检测项目授权',
    attachments: [{ name: '授权文件2023001.docx', status: 'done' }],
    createTime: '2023-06-01 10:00:00',
  },
  {
    id: '2',
    documentNo: 'RAAYLS-SQ【2023002】号',
    authorizeDate: '2023-08-15',
    personNames: '王德力',
    remark: '授权签字人资格',
    attachments: [{ name: '授权文件2023002.pdf', status: 'done' }],
    createTime: '2023-08-15 14:30:00',
  },
];

const PersonnelAuthorization = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view'>('add');
  const [currentRecord, setCurrentRecord] = useState<any>(null);

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
      name: 'personNames',
      label: '姓名',
      placeholder: '请输入姓名',
    },
    {
      type: 'dateRange' as const,
      name: 'authorizeDateRange',
      label: '授权时间',
    },
    {
      type: 'input' as const,
      name: 'documentNo',
      label: '文件编号',
      placeholder: '请输入文件编号',
    },
  ];

  // 表格列配置
  const columns = [
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
      width: 60,
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: '文件编号',
      dataIndex: 'documentNo',
      key: 'documentNo',
      width: 200,
    },
    {
      title: '授权日期',
      dataIndex: 'authorizeDate',
      key: 'authorizeDate',
      width: 110,
    },
    {
      title: '姓名',
      dataIndex: 'personNames',
      key: 'personNames',
      ellipsis: true,
      width: 400,
    },
    {
      title: '附件',
      dataIndex: 'attachments',
      key: 'attachments',
      width: 100,
      render: (attachments: any[]) => (
        <Tag color={attachments && attachments.length > 0 ? 'blue' : 'default'}>
          <PaperClipOutlined /> 附件({attachments?.length || 0})
        </Tag>
      ),
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      ellipsis: true,
      width: 150,
      render: (text: string) => text || '-',
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
    let filtered = [...data];
    
    if (values.personNames) {
      filtered = filtered.filter(item => 
        item.personNames?.includes(values.personNames)
      );
    }
    if (values.documentNo) {
      filtered = filtered.filter(item => 
        item.documentNo?.includes(values.documentNo)
      );
    }
    if (values.authorizeDateRange && values.authorizeDateRange.length === 2) {
      const startDate = values.authorizeDateRange[0].format('YYYY-MM-DD');
      const endDate = values.authorizeDateRange[1].format('YYYY-MM-DD');
      filtered = filtered.filter(item => {
        return item.authorizeDate >= startDate && item.authorizeDate <= endDate;
      });
    }
    
    setData(filtered);
  };

  // 重置搜索
  const handleReset = () => {
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
  const handleDelete = (record: any) => {
    const newData = data.filter(item => item.id !== record.id);
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
    { title: '授权文件总数', value: data.length },
    { title: '已上传附件', value: data.filter(item => item.attachments && item.attachments.length > 0).length },
  ];

  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { title: '首页', path: '/' },
          { title: '人员管理' },
          { title: '人员授权' },
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
              新增授权文件
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

      <AuthorizationForm
        open={modalVisible}
        record={currentRecord}
        mode={modalMode}
        onCancel={() => setModalVisible(false)}
        onSave={handleSave}
      />
    </div>
  );
};

export default PersonnelAuthorization;
