import React, { useState, useEffect, useCallback } from 'react';
import { Card, Row, Col, Statistic, Button, Space, Tag, message, Modal } from 'antd';
import { FileTextOutlined, CheckCircleOutlined, CloseCircleOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import PageHeader from '../../../components/Common/PageHeader';
import SearchForm from '../../../components/Common/SearchForm';
import DataTable from '../../../components/Common/DataTable';
import ChecklistForm from './ChecklistForm';
import type { AuditChecklistRecord } from '../../../types/index';
import { loadData, saveData, MODULE_KEYS } from '../../../utils/storage';

const AuditChecklistPage: React.FC = () => {
  const [data, setData] = useState<AuditChecklistRecord[]>([]);
  const [filteredData, setFilteredData] = useState<AuditChecklistRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AuditChecklistRecord | null>(null);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view'>('add');
  const [selectedRows, setSelectedRows] = useState<AuditChecklistRecord[]>([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  const loadTableData = useCallback(async () => {
    setLoading(true);
    const result = await loadData<AuditChecklistRecord>(MODULE_KEYS.AUDIT_CHECKLIST);
    setData(result); setFilteredData(result);
    setPagination(prev => ({ ...prev, total: result.length }));
    setLoading(false);
  }, []);

  useEffect(() => { loadTableData(); }, [loadTableData]);

  const handleSearch = (values: any) => {
    let result = [...data];
    if (values.checklistNo) result = result.filter(item => item.checklistNo.includes(values.checklistNo));
    if (values.auditDepartment) result = result.filter(item => item.auditDepartment.includes(values.auditDepartment));
    if (values.checkResult) result = result.filter(item => item.checkResult === values.checkResult);
    if (values.auditor) result = result.filter(item => item.auditor.includes(values.auditor));
    setFilteredData(result);
    setPagination(prev => ({ ...prev, current: 1, total: result.length }));
  };

  const handleReset = () => { setFilteredData(data); setPagination(prev => ({ ...prev, current: 1, total: data.length })); };
  const handleAdd = () => { setEditingRecord(null); setModalMode('add'); setModalVisible(true); };
  const handleEdit = (record: AuditChecklistRecord) => { setEditingRecord(record); setModalMode('edit'); setModalVisible(true); };
  const handleView = (record: AuditChecklistRecord) => { setEditingRecord(record); setModalMode('view'); setModalVisible(true); };

  const handleDelete = (record: AuditChecklistRecord) => {
    Modal.confirm({
      title: '确认删除', content: `确定要删除检查项"${record.checklistNo}"吗？`,
      onOk: () => {
        const newData = data.filter(item => item.id !== record.id);
        saveData(MODULE_KEYS.AUDIT_CHECKLIST, newData);
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
        saveData(MODULE_KEYS.AUDIT_CHECKLIST, newData);
        setData(newData); setFilteredData(newData); setSelectedRows([]);
        setPagination(prev => ({ ...prev, total: newData.length }));
        message.success('批量删除成功');
      },
    });
  };

  const handleSave = (values: any) => {
    if (modalMode === 'add') {
      const newRecord: AuditChecklistRecord = { id: Date.now().toString(), ...values };
      const newData = [newRecord, ...data];
      saveData(MODULE_KEYS.AUDIT_CHECKLIST, newData);
      setData(newData); setFilteredData(newData);
      setPagination(prev => ({ ...prev, total: newData.length }));
      message.success('新增成功');
    } else if (modalMode === 'edit' && editingRecord) {
      const newData = data.map(item => item.id === editingRecord.id ? { ...item, ...values } : item);
      saveData(MODULE_KEYS.AUDIT_CHECKLIST, newData);
      setData(newData); setFilteredData(newData);
      message.success('修改成功');
    }
    setModalVisible(false);
  };

  const handlePageChange = (page: number, pageSize?: number) => {
    setPagination(prev => ({ ...prev, current: page, pageSize: pageSize || 10 }));
  };

  const searchFields = [
    { type: 'input' as const, label: '编号', name: 'checklistNo', placeholder: '请输入编号' },
    { type: 'input' as const, label: '受审部门', name: 'auditDepartment', placeholder: '请输入部门' },
    { type: 'select' as const, label: '检查结果', name: 'checkResult', options: [
      { label: '符合', value: '符合' }, { label: '不符合', value: '不符合' },
      { label: '部分符合', value: '部分符合' }, { label: '不适用', value: '不适用' },
    ]},
    { type: 'input' as const, label: '审核员', name: 'auditor', placeholder: '请输入审核员' },
  ];

  const columns = [
    { title: '序号', key: 'index', width: 60, render: (_: any, __: any, index: number) => index + 1 },
    { title: '编号', dataIndex: 'checklistNo', key: 'checklistNo', width: 120 },
    { title: '审核日期', dataIndex: 'auditDate', key: 'auditDate', width: 120 },
    { title: '受审部门', dataIndex: 'auditDepartment', key: 'auditDepartment', width: 120 },
    { title: '审核条款', dataIndex: 'auditClause', key: 'auditClause', width: 130 },
    { title: '检查内容', dataIndex: 'checkContent', key: 'checkContent', ellipsis: true },
    { title: '检查方法', dataIndex: 'checkMethod', key: 'checkMethod', ellipsis: true },
    {
      title: '检查结果', dataIndex: 'checkResult', key: 'checkResult', width: 100,
      render: (result: string) => {
        const colorMap: Record<string, string> = { '符合': 'success', '不符合': 'error', '部分符合': 'warning', '不适用': 'default' };
        return <Tag color={colorMap[result] || 'default'}>{result}</Tag>;
      },
    },
    { title: '审核员', dataIndex: 'auditor', key: 'auditor', width: 100 },
    { title: '审核证据', dataIndex: 'evidence', key: 'evidence', ellipsis: true },
  ];

  const startIndex = (pagination.current - 1) * pagination.pageSize;
  const paginatedData = filteredData.slice(startIndex, startIndex + pagination.pageSize);

  return (
    <div>
      <PageHeader breadcrumbs={[{ title: '首页', path: '/' }, { title: '内部审核管理' }, { title: '内审检查表' }]} />
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={6}><Statistic title="检查项总数" value={data.length} prefix={<FileTextOutlined />} /></Col>
          <Col span={6}><Statistic title="符合" value={data.filter(i => i.checkResult === '符合').length} prefix={<CheckCircleOutlined />} valueStyle={{ color: '#52c41a' }} /></Col>
          <Col span={6}><Statistic title="不符合" value={data.filter(i => i.checkResult === '不符合').length} prefix={<CloseCircleOutlined />} valueStyle={{ color: '#ff4d4f' }} /></Col>
          <Col span={6}><Statistic title="部分符合" value={data.filter(i => i.checkResult === '部分符合').length} valueStyle={{ color: '#faad14' }} /></Col>
        </Row>
      </Card>
      <SearchForm fields={searchFields} onSearch={handleSearch} onReset={handleReset} />
      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <Space><Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增检查项</Button></Space>
          <Space><Button icon={<DeleteOutlined />} onClick={handleBatchDelete} disabled={selectedRows.length === 0}>删除</Button></Space>
        </div>
        <DataTable columns={columns} dataSource={paginatedData} loading={loading}
          pagination={{ ...pagination, onChange: handlePageChange }}
          onView={handleView} onEdit={handleEdit} onDelete={handleDelete}
          rowSelection={{ selectedRowKeys: selectedRows.map(r => r.id), onChange: (_: any, rows: any) => setSelectedRows(rows) }}
        />
      </Card>
      <ChecklistForm visible={modalVisible} record={editingRecord} mode={modalMode} onCancel={() => setModalVisible(false)} onSave={handleSave} />
    </div>
  );
};

export default AuditChecklistPage;
