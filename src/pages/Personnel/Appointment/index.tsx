import { useState, useEffect } from 'react';
import { Card, Button, Space, Tag, Popconfirm, message, Statistic, Row, Col } from 'antd';
import { PlusOutlined, EditOutlined, EyeOutlined, DeleteOutlined, PaperClipOutlined } from '@ant-design/icons';
import PageHeader from '../../../components/Common/PageHeader';
import SearchForm from '../../../components/Common/SearchForm';
import DataTable from '../../../components/Common/DataTable';
import AppointmentForm from './AppointmentForm';
import { getData as getModuleData, saveModuleData } from '../../../utils/storage';

const MODULE_KEY = 'personnel_appointment';

// 模拟数据 - 根据截图示例
const mockData = [
  {
    id: '1',
    documentNo: 'RAAYLS【2023001】号',
    appointDate: '2023-06-01',
    personNames: '吴韬、余伟峰、金益森、管京、陈杭、柳孟绸、林思怡、蒋建娜、刘兴兴、朱武宗、张木卫',
    remark: '关键岗位人员任命',
    attachments: [{ name: '任命文件2023001.docx', status: 'done' }],
    createTime: '2023-06-01 10:00:00',
  },
  {
    id: '2',
    documentNo: 'RAAYLS【2023004】号',
    appointDate: '2023-08-15',
    personNames: '谢建华',
    remark: '总经理任命',
    attachments: [{ name: '任命文件2023004.pdf', status: 'done' }],
    createTime: '2023-08-15 14:30:00',
  },
];

const PersonnelAppointment = () => {
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
      name: 'appointDateRange',
      label: '任命时间',
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
      width: 180,
    },
    {
      title: '任命日期',
      dataIndex: 'appointDate',
      key: 'appointDate',
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
    if (values.appointDateRange && values.appointDateRange.length === 2) {
      const startDate = values.appointDateRange[0].format('YYYY-MM-DD');
      const endDate = values.appointDateRange[1].format('YYYY-MM-DD');
      filtered = filtered.filter(item => {
        return item.appointDate >= startDate && item.appointDate <= endDate;
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
    { title: '任命文件总数', value: data.length },
    { title: '已上传附件', value: data.filter(item => item.attachments && item.attachments.length > 0).length },
  ];

  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { title: '首页', path: '/' },
          { title: '人员管理' },
          { title: '人员任命' },
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
              新增任命文件
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

      <AppointmentForm
        open={modalVisible}
        record={currentRecord}
        mode={modalMode}
        onCancel={() => setModalVisible(false)}
        onSave={handleSave}
      />
    </div>
  );
};

export default PersonnelAppointment;
