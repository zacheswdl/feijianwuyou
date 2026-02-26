import React, { useState, useEffect, useCallback } from 'react';
import { Card, Row, Col, Statistic, Button, message, Modal, Tag } from 'antd';
import { ExclamationCircleOutlined, CheckCircleOutlined, ClockCircleOutlined, PlusOutlined } from '@ant-design/icons';
import PageHeader from '../../../components/Common/PageHeader';
import SearchForm from '../../../components/Common/SearchForm';
import DataTable from '../../../components/Common/DataTable';
import type { ComplaintRecord } from '../../../types/index';
import { loadData, saveData, MODULE_KEYS } from '../../../utils/storage';
import ComplaintForm from './ComplaintForm';

const ComplaintRecordPage: React.FC = () => {
  const [data, setData] = useState<ComplaintRecord[]>([]);
  const [filteredData, setFilteredData] = useState<ComplaintRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ComplaintRecord | null>(null);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view'>('add');
  const [selectedRows, setSelectedRows] = useState<ComplaintRecord[]>([]);

  const loadTableData = useCallback(async () => {
    setLoading(true);
    const result = await loadData<ComplaintRecord>(MODULE_KEYS.COMPLAINT_RECORD);
    setData(result);
    setFilteredData(result);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadTableData();
  }, [loadTableData]);

  const handleSearch = (values: any) => {
    let result = [...data];
    
    if (values.complaintDate && values.complaintDate.length === 2) {
      const startDate = values.complaintDate[0].format('YYYY-MM-DD');
      const endDate = values.complaintDate[1].format('YYYY-MM-DD');
      result = result.filter(item => item.complaintDate >= startDate && item.complaintDate <= endDate);
    }
    
    if (values.customerName) {
      result = result.filter(item => item.customerName.includes(values.customerName));
    }
    
    if (values.complaintType) {
      result = result.filter(item => item.complaintType === values.complaintType);
    }
    
    if (values.handleStatus) {
      result = result.filter(item => item.handleStatus === values.handleStatus);
    }
    
    if (values.handler) {
      result = result.filter(item => item.handler?.includes(values.handler));
    }
    
    setFilteredData(result);
  };

  const handleReset = () => {
    setFilteredData(data);
  };

  const handleAdd = () => {
    setEditingRecord(null);
    setModalMode('add');
    setModalVisible(true);
  };

  const handleEdit = (record: ComplaintRecord) => {
    setEditingRecord(record);
    setModalMode('edit');
    setModalVisible(true);
  };

  const handleView = (record: ComplaintRecord) => {
    setEditingRecord(record);
    setModalMode('view');
    setModalVisible(true);
  };

  const handleDelete = (record: ComplaintRecord) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除 ${record.customerName} 的投诉记录吗？`,
      onOk: () => {
        const newData = data.filter(item => item.id !== record.id);
        saveData(MODULE_KEYS.COMPLAINT_RECORD, newData);
        setData(newData);
        setFilteredData(newData);
        message.success('删除成功');
      },
    });
  };

  const handleBatchDelete = () => {
    if (selectedRows.length === 0) {
      message.warning('请先选择要删除的记录');
      return;
    }
    Modal.confirm({
      title: '确认批量删除',
      content: `确定要删除选中的 ${selectedRows.length} 条记录吗？`,
      onOk: () => {
        const ids = selectedRows.map(item => item.id);
        const newData = data.filter(item => !ids.includes(item.id));
        saveData(MODULE_KEYS.COMPLAINT_RECORD, newData);
        setData(newData);
        setFilteredData(newData);
        setSelectedRows([]);
        message.success('批量删除成功');
      },
    });
  };

  const handleSave = (values: any) => {
    if (modalMode === 'add') {
      const newRecord: ComplaintRecord = {
        id: Date.now().toString(),
        ...values,
        complaintDate: values.complaintDate.format('YYYY-MM-DD'),
        handleDate: values.handleDate ? values.handleDate.format('YYYY-MM-DD') : undefined,
      };
      const newData = [newRecord, ...data];
      saveData(MODULE_KEYS.COMPLAINT_RECORD, newData);
      setData(newData);
      setFilteredData(newData);
      message.success('新增成功');
    } else if (modalMode === 'edit' && editingRecord) {
      const newData = data.map(item => 
        item.id === editingRecord.id 
          ? { 
              ...item, 
              ...values, 
              complaintDate: values.complaintDate.format('YYYY-MM-DD'),
              handleDate: values.handleDate ? values.handleDate.format('YYYY-MM-DD') : undefined,
            }
          : item
      );
      saveData(MODULE_KEYS.COMPLAINT_RECORD, newData);
      setData(newData);
      setFilteredData(newData);
      message.success('修改成功');
    }
    setModalVisible(false);
  };

  const searchFields = [
    {
      type: 'dateRange' as const,
      label: '投诉日期',
      name: 'complaintDate',
    },
    {
      type: 'input' as const,
      label: '客户名称',
      name: 'customerName',
      placeholder: '请输入客户名称',
    },
    {
      type: 'select' as const,
      label: '投诉类型',
      name: 'complaintType',
      placeholder: '请选择投诉类型',
      options: [
        { label: '服务态度', value: '服务态度' },
        { label: '检测质量', value: '检测质量' },
        { label: '检测效率', value: '检测效率' },
        { label: '收费问题', value: '收费问题' },
        { label: '其他', value: '其他' },
      ],
    },
    {
      type: 'select' as const,
      label: '处理状态',
      name: 'handleStatus',
      placeholder: '请选择处理状态',
      options: [
        { label: '待处理', value: '待处理' },
        { label: '处理中', value: '处理中' },
        { label: '已处理', value: '已处理' },
      ],
    },
    {
      type: 'input' as const,
      label: '处理人',
      name: 'handler',
      placeholder: '请输入处理人',
    },
  ];

  const columns = [
    {
      title: '投诉日期',
      dataIndex: 'complaintDate',
      key: 'complaintDate',
      sorter: (a: ComplaintRecord, b: ComplaintRecord) => a.complaintDate.localeCompare(b.complaintDate),
    },
    {
      title: '客户名称',
      dataIndex: 'customerName',
      key: 'customerName',
    },
    {
      title: '联系电话',
      dataIndex: 'contactPhone',
      key: 'contactPhone',
    },
    {
      title: '投诉类型',
      dataIndex: 'complaintType',
      key: 'complaintType',
    },
    {
      title: '投诉内容',
      dataIndex: 'complaintContent',
      key: 'complaintContent',
      ellipsis: true,
    },
    {
      title: '处理状态',
      dataIndex: 'handleStatus',
      key: 'handleStatus',
      render: (status: string) => {
        const colorMap: Record<string, string> = {
          '待处理': 'red',
          '处理中': 'orange',
          '已处理': 'green',
        };
        return <Tag color={colorMap[status] || 'default'}>{status}</Tag>;
      },
    },
    {
      title: '处理人',
      dataIndex: 'handler',
      key: 'handler',
    },
    {
      title: '处理结果',
      dataIndex: 'handleResult',
      key: 'handleResult',
      ellipsis: true,
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      ellipsis: true,
    },
  ];

  const totalCount = data.length;
  const pendingCount = data.filter(item => item.handleStatus === '待处理').length;
  const processingCount = data.filter(item => item.handleStatus === '处理中').length;
  const resolvedCount = data.filter(item => item.handleStatus === '已处理').length;

  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { title: '首页', path: '/' },
          { title: '客户服务', path: '/customer-service' },
          { title: '投诉记录汇总' },
        ]}
      />

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic title="总投诉数" value={totalCount} prefix={<ExclamationCircleOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="待处理" value={pendingCount} styles={{ content: { color: '#ff4d4f' } }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="处理中" value={processingCount} valueStyle={{ color: '#faad14' }} prefix={<ClockCircleOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="已处理" value={resolvedCount} styles={{ content: { color: '#52c41a' } }} prefix={<CheckCircleOutlined />} />
          </Card>
        </Col>
      </Row>

      <Card>
        <SearchForm
          fields={searchFields}
          onSearch={handleSearch}
          onReset={handleReset}
        />

        <div style={{ marginBottom: 16 }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增投诉记录
          </Button>
          <Button danger style={{ marginLeft: 8 }} onClick={handleBatchDelete} disabled={selectedRows.length === 0}>
            批量删除
          </Button>
        </div>

        <DataTable
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={loading}
          pagination={{
            current: 1,
            pageSize: 10,
            total: filteredData.length,
            onChange: () => {},
          }}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          rowSelection={{
            type: 'checkbox' as const,
            onChange: (_selectedRowKeys: any, selectedRows: any) => setSelectedRows(selectedRows),
          }}
        />
      </Card>

      <ComplaintForm
        visible={modalVisible}
        record={editingRecord}
        mode={modalMode}
        onCancel={() => setModalVisible(false)}
        onSave={handleSave}
      />
    </div>
  );
};

export default ComplaintRecordPage;
