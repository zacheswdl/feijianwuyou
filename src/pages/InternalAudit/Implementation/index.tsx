import React, { useState, useEffect, useCallback } from 'react';
import { Card, Row, Col, Statistic, Button, Space, Tag, message, Modal } from 'antd';
import { FileTextOutlined, ClockCircleOutlined, CheckCircleOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import PageHeader from '../../../components/Common/PageHeader';
import SearchForm from '../../../components/Common/SearchForm';
import DataTable from '../../../components/Common/DataTable';
import ImplementationForm from './ImplementationForm';
import type { AuditImplementationRecord } from '../../../types/index';
import { loadData, saveData, MODULE_KEYS } from '../../../utils/storage';

const AuditImplementationPage: React.FC = () => {
  const [data, setData] = useState<AuditImplementationRecord[]>([]);
  const [filteredData, setFilteredData] = useState<AuditImplementationRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AuditImplementationRecord | null>(null);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view'>('add');
  const [selectedRows, setSelectedRows] = useState<AuditImplementationRecord[]>([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  const loadTableData = useCallback(async () => {
    setLoading(true);
    const result = await loadData<AuditImplementationRecord>(MODULE_KEYS.AUDIT_IMPLEMENTATION);
    setData(result); setFilteredData(result);
    setPagination(prev => ({ ...prev, total: result.length }));
    setLoading(false);
  }, []);

  useEffect(() => { loadTableData(); }, [loadTableData]);

  const handleSearch = (values: any) => {
    let result = [...data];
    if (values.planName) result = result.filter(item => item.planName.includes(values.planName));
    if (values.auditDepartment) result = result.filter(item => item.auditDepartment.includes(values.auditDepartment));
    if (values.status) result = result.filter(item => item.status === values.status);
    if (values.auditor) result = result.filter(item => item.auditor.includes(values.auditor));
    setFilteredData(result);
    setPagination(prev => ({ ...prev, current: 1, total: result.length }));
  };

  const handleReset = () => { setFilteredData(data); setPagination(prev => ({ ...prev, current: 1, total: data.length })); };
  const handleAdd = () => { setEditingRecord(null); setModalMode('add'); setModalVisible(true); };
  const handleEdit = (record: AuditImplementationRecord) => { setEditingRecord(record); setModalMode('edit'); setModalVisible(true); };
  const handleView = (record: AuditImplementationRecord) => { setEditingRecord(record); setModalMode('view'); setModalVisible(true); };

  const handleDelete = (record: AuditImplementationRecord) => {
    Modal.confirm({
      title: '确认删除', content: `确定要删除该实施计划吗？`,
      onOk: () => {
        const newData = data.filter(item => item.id !== record.id);
        saveData(MODULE_KEYS.AUDIT_IMPLEMENTATION, newData);
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
        saveData(MODULE_KEYS.AUDIT_IMPLEMENTATION, newData);
        setData(newData); setFilteredData(newData); setSelectedRows([]);
        setPagination(prev => ({ ...prev, total: newData.length }));
        message.success('批量删除成功');
      },
    });
  };

  const handleSave = (values: any) => {
    if (modalMode === 'add') {
      const newRecord: AuditImplementationRecord = { id: Date.now().toString(), ...values };
      const newData = [newRecord, ...data];
      saveData(MODULE_KEYS.AUDIT_IMPLEMENTATION, newData);
      setData(newData); setFilteredData(newData);
      setPagination(prev => ({ ...prev, total: newData.length }));
      message.success('新增成功');
    } else if (modalMode === 'edit' && editingRecord) {
      const newData = data.map(item => item.id === editingRecord.id ? { ...item, ...values } : item);
      saveData(MODULE_KEYS.AUDIT_IMPLEMENTATION, newData);
      setData(newData); setFilteredData(newData);
      message.success('修改成功');
    }
    setModalVisible(false);
  };

  const handlePageChange = (page: number, pageSize?: number) => {
    setPagination(prev => ({ ...prev, current: page, pageSize: pageSize || 10 }));
  };

  const searchFields = [
    { type: 'input' as const, label: '关联计划', name: 'planName', placeholder: '请输入计划名称' },
    { type: 'input' as const, label: '受审部门', name: 'auditDepartment', placeholder: '请输入部门' },
    { type: 'select' as const, label: '状态', name: 'status', options: [
      { label: '待审核', value: '待审核' }, { label: '审核中', value: '审核中' }, { label: '已完成', value: '已完成' },
    ]},
    { type: 'input' as const, label: '审核员', name: 'auditor', placeholder: '请输入审核员' },
  ];

  const columns = [
    { title: '序号', key: 'index', width: 60, render: (_: any, __: any, index: number) => index + 1 },
    { title: '关联计划', dataIndex: 'planName', key: 'planName' },
    { title: '审核日期', dataIndex: 'auditDate', key: 'auditDate', width: 120 },
    { title: '受审部门', dataIndex: 'auditDepartment', key: 'auditDepartment', width: 120 },
    { title: '审核条款', dataIndex: 'auditClause', key: 'auditClause', ellipsis: true },
    { title: '审核方法', dataIndex: 'auditMethod', key: 'auditMethod', ellipsis: true },
    { title: '审核员', dataIndex: 'auditor', key: 'auditor', width: 100 },
    { title: '被审核人', dataIndex: 'auditee', key: 'auditee', width: 100 },
    {
      title: '状态', dataIndex: 'status', key: 'status', width: 100,
      render: (status: string) => {
        const colorMap: Record<string, string> = { '待审核': 'default', '审核中': 'processing', '已完成': 'success' };
        return <Tag color={colorMap[status] || 'default'}>{status}</Tag>;
      },
    },
  ];

  const startIndex = (pagination.current - 1) * pagination.pageSize;
  const paginatedData = filteredData.slice(startIndex, startIndex + pagination.pageSize);

  return (
    <div>
      <PageHeader breadcrumbs={[{ title: '首页', path: '/' }, { title: '内部审核管理' }, { title: '内审实施计划' }]} />
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={8}><Statistic title="实施计划总数" value={data.length} prefix={<FileTextOutlined />} /></Col>
          <Col span={8}><Statistic title="待审核" value={data.filter(i => i.status === '待审核').length} prefix={<ClockCircleOutlined />} /></Col>
          <Col span={8}><Statistic title="已完成" value={data.filter(i => i.status === '已完成').length} prefix={<CheckCircleOutlined />} valueStyle={{ color: '#52c41a' }} /></Col>
        </Row>
      </Card>
      <SearchForm fields={searchFields} onSearch={handleSearch} onReset={handleReset} />
      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <Space><Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增实施计划</Button></Space>
          <Space><Button icon={<DeleteOutlined />} onClick={handleBatchDelete} disabled={selectedRows.length === 0}>删除</Button></Space>
        </div>
        <DataTable columns={columns} dataSource={paginatedData} loading={loading}
          pagination={{ ...pagination, onChange: handlePageChange }}
          onView={handleView} onEdit={handleEdit} onDelete={handleDelete}
          rowSelection={{ selectedRowKeys: selectedRows.map(r => r.id), onChange: (_: any, rows: any) => setSelectedRows(rows) }}
        />
      </Card>
      <ImplementationForm visible={modalVisible} record={editingRecord} mode={modalMode} onCancel={() => setModalVisible(false)} onSave={handleSave} />
    </div>
  );
};

export default AuditImplementationPage;
