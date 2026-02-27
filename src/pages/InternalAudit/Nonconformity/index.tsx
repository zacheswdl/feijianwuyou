import React, { useState, useEffect, useCallback } from 'react';
import { Card, Row, Col, Statistic, Button, Space, Tag, message, Modal } from 'antd';
import { WarningOutlined, ClockCircleOutlined, CheckCircleOutlined, PlusOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import PageHeader from '../../../components/Common/PageHeader';
import SearchForm from '../../../components/Common/SearchForm';
import DataTable from '../../../components/Common/DataTable';
import NonconformityForm from './NonconformityForm';
import type { AuditNonconformityRecord } from '../../../types/index';
import { loadData, saveData, MODULE_KEYS } from '../../../utils/storage';

const AuditNonconformityPage: React.FC = () => {
  const [data, setData] = useState<AuditNonconformityRecord[]>([]);
  const [filteredData, setFilteredData] = useState<AuditNonconformityRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AuditNonconformityRecord | null>(null);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view'>('add');
  const [selectedRows, setSelectedRows] = useState<AuditNonconformityRecord[]>([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  const loadTableData = useCallback(async () => {
    setLoading(true);
    const result = await loadData<AuditNonconformityRecord>(MODULE_KEYS.AUDIT_NONCONFORMITY);
    setData(result); setFilteredData(result);
    setPagination(prev => ({ ...prev, total: result.length }));
    setLoading(false);
  }, []);

  useEffect(() => { loadTableData(); }, [loadTableData]);

  const handleSearch = (values: any) => {
    let result = [...data];
    if (values.nonconformityNo) result = result.filter(item => item.nonconformityNo.includes(values.nonconformityNo));
    if (values.auditDepartment) result = result.filter(item => item.auditDepartment.includes(values.auditDepartment));
    if (values.nonconformityType) result = result.filter(item => item.nonconformityType === values.nonconformityType);
    if (values.status) result = result.filter(item => item.status === values.status);
    setFilteredData(result);
    setPagination(prev => ({ ...prev, current: 1, total: result.length }));
  };

  const handleReset = () => { setFilteredData(data); setPagination(prev => ({ ...prev, current: 1, total: data.length })); };
  const handleAdd = () => { setEditingRecord(null); setModalMode('add'); setModalVisible(true); };
  const handleEdit = (record: AuditNonconformityRecord) => { setEditingRecord(record); setModalMode('edit'); setModalVisible(true); };
  const handleView = (record: AuditNonconformityRecord) => { setEditingRecord(record); setModalMode('view'); setModalVisible(true); };

  const handleDelete = (record: AuditNonconformityRecord) => {
    Modal.confirm({
      title: '确认删除', content: `确定要删除不符合项"${record.nonconformityNo}"吗？`,
      onOk: () => {
        const newData = data.filter(item => item.id !== record.id);
        saveData(MODULE_KEYS.AUDIT_NONCONFORMITY, newData);
        setData(newData); setFilteredData(newData);
        setPagination(prev => ({ ...prev, total: newData.length }));
        message.success('删除成功');
      },
    });
  };

  const handleBatchDelete = () => {
    if (selectedRows.length === 0) { message.warning('请先选择要删除的记录'); return; }
    Modal.confirm({
      title: '确认批量删除', content: `确定要删除选中的 ${selectedRows.length} 条记录吗？`,
      onOk: () => {
        const ids = selectedRows.map(item => item.id);
        const newData = data.filter(item => !ids.includes(item.id));
        saveData(MODULE_KEYS.AUDIT_NONCONFORMITY, newData);
        setData(newData); setFilteredData(newData); setSelectedRows([]);
        setPagination(prev => ({ ...prev, total: newData.length }));
        message.success('批量删除成功');
      },
    });
  };

  const handleSave = (values: any) => {
    if (modalMode === 'add') {
      const newRecord: AuditNonconformityRecord = { id: Date.now().toString(), ...values };
      const newData = [newRecord, ...data];
      saveData(MODULE_KEYS.AUDIT_NONCONFORMITY, newData);
      setData(newData); setFilteredData(newData);
      setPagination(prev => ({ ...prev, total: newData.length }));
      message.success('新增成功');
    } else if (modalMode === 'edit' && editingRecord) {
      const newData = data.map(item => item.id === editingRecord.id ? { ...item, ...values } : item);
      saveData(MODULE_KEYS.AUDIT_NONCONFORMITY, newData);
      setData(newData); setFilteredData(newData);
      message.success('修改成功');
    }
    setModalVisible(false);
  };

  const handlePageChange = (page: number, pageSize?: number) => {
    setPagination(prev => ({ ...prev, current: page, pageSize: pageSize || 10 }));
  };

  const searchFields = [
    { type: 'input' as const, label: '编号', name: 'nonconformityNo', placeholder: '请输入编号' },
    { type: 'input' as const, label: '受审部门', name: 'auditDepartment', placeholder: '请输入部门' },
    { type: 'select' as const, label: '不符合类型', name: 'nonconformityType', options: [
      { label: '严重不符合', value: '严重' }, { label: '一般不符合', value: '一般' }, { label: '观察项', value: '观察项' },
    ]},
    { type: 'select' as const, label: '状态', name: 'status', options: [
      { label: '待整改', value: '待整改' }, { label: '整改中', value: '整改中' }, { label: '已关闭', value: '已关闭' },
    ]},
  ];

  const columns = [
    { title: '序号', key: 'index', width: 60, render: (_: any, __: any, index: number) => index + 1 },
    { title: '编号', dataIndex: 'nonconformityNo', key: 'nonconformityNo', width: 120 },
    { title: '审核日期', dataIndex: 'auditDate', key: 'auditDate', width: 120 },
    { title: '受审部门', dataIndex: 'auditDepartment', key: 'auditDepartment', width: 120 },
    { title: '不符合条款', dataIndex: 'auditClause', key: 'auditClause', width: 130 },
    {
      title: '类型', dataIndex: 'nonconformityType', key: 'nonconformityType', width: 100,
      render: (type: string) => {
        const colorMap: Record<string, string> = { '严重': 'error', '一般': 'warning', '观察项': 'default' };
        return <Tag color={colorMap[type] || 'default'}>{type}</Tag>;
      },
    },
    { title: '不符合描述', dataIndex: 'nonconformityDesc', key: 'nonconformityDesc', ellipsis: true },
    { title: '责任人', dataIndex: 'responsiblePerson', key: 'responsiblePerson', width: 100 },
    { title: '整改期限', dataIndex: 'deadline', key: 'deadline', width: 120 },
    {
      title: '状态', dataIndex: 'status', key: 'status', width: 100,
      render: (status: string) => {
        const colorMap: Record<string, string> = { '待整改': 'error', '整改中': 'processing', '已关闭': 'success' };
        return <Tag color={colorMap[status] || 'default'}>{status}</Tag>;
      },
    },
  ];

  const startIndex = (pagination.current - 1) * pagination.pageSize;
  const paginatedData = filteredData.slice(startIndex, startIndex + pagination.pageSize);

  return (
    <div>
      <PageHeader breadcrumbs={[{ title: '首页', path: '/' }, { title: '内部审核管理' }, { title: '内审不符合项' }]} />
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={6}><Statistic title="不符合项总数" value={data.length} prefix={<WarningOutlined />} /></Col>
          <Col span={6}><Statistic title="严重不符合" value={data.filter(i => i.nonconformityType === '严重').length} prefix={<ExclamationCircleOutlined />} valueStyle={{ color: '#ff4d4f' }} /></Col>
          <Col span={6}><Statistic title="待整改" value={data.filter(i => i.status === '待整改').length} prefix={<ClockCircleOutlined />} valueStyle={{ color: '#faad14' }} /></Col>
          <Col span={6}><Statistic title="已关闭" value={data.filter(i => i.status === '已关闭').length} prefix={<CheckCircleOutlined />} valueStyle={{ color: '#52c41a' }} /></Col>
        </Row>
      </Card>
      <SearchForm fields={searchFields} onSearch={handleSearch} onReset={handleReset} />
      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <Space><Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增不符合项</Button></Space>
          <Space><Button icon={<DeleteOutlined />} onClick={handleBatchDelete} disabled={selectedRows.length === 0}>删除</Button></Space>
        </div>
        <DataTable columns={columns} dataSource={paginatedData} loading={loading}
          pagination={{ ...pagination, onChange: handlePageChange }}
          onView={handleView} onEdit={handleEdit} onDelete={handleDelete}
          rowSelection={{ selectedRowKeys: selectedRows.map(r => r.id), onChange: (_: any, rows: any) => setSelectedRows(rows) }}
        />
      </Card>
      <NonconformityForm visible={modalVisible} record={editingRecord} mode={modalMode} onCancel={() => setModalVisible(false)} onSave={handleSave} />
    </div>
  );
};

export default AuditNonconformityPage;
