import React, { useState, useEffect, useCallback } from 'react';
import { Card, Row, Col, Statistic, Button, Space, Tag, message, Modal } from 'antd';
import { FileTextOutlined, EditOutlined, CheckCircleOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import PageHeader from '../../../components/Common/PageHeader';
import SearchForm from '../../../components/Common/SearchForm';
import DataTable from '../../../components/Common/DataTable';
import AuditReportForm from './ReportForm';
import type { AuditReportRecord } from '../../../types/index';
import { loadData, saveData, MODULE_KEYS } from '../../../utils/storage';

const AuditReportPage: React.FC = () => {
  const [data, setData] = useState<AuditReportRecord[]>([]);
  const [filteredData, setFilteredData] = useState<AuditReportRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AuditReportRecord | null>(null);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view'>('add');
  const [selectedRows, setSelectedRows] = useState<AuditReportRecord[]>([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  const loadTableData = useCallback(async () => {
    setLoading(true);
    const result = await loadData<AuditReportRecord>(MODULE_KEYS.AUDIT_REPORT);
    setData(result); setFilteredData(result);
    setPagination(prev => ({ ...prev, total: result.length }));
    setLoading(false);
  }, []);

  useEffect(() => { loadTableData(); }, [loadTableData]);

  const handleSearch = (values: any) => {
    let result = [...data];
    if (values.reportNo) result = result.filter(item => item.reportNo.includes(values.reportNo));
    if (values.reportName) result = result.filter(item => item.reportName.includes(values.reportName));
    if (values.status) result = result.filter(item => item.status === values.status);
    if (values.auditLeader) result = result.filter(item => item.auditLeader.includes(values.auditLeader));
    setFilteredData(result);
    setPagination(prev => ({ ...prev, current: 1, total: result.length }));
  };

  const handleReset = () => { setFilteredData(data); setPagination(prev => ({ ...prev, current: 1, total: data.length })); };
  const handleAdd = () => { setEditingRecord(null); setModalMode('add'); setModalVisible(true); };
  const handleEdit = (record: AuditReportRecord) => { setEditingRecord(record); setModalMode('edit'); setModalVisible(true); };
  const handleView = (record: AuditReportRecord) => { setEditingRecord(record); setModalMode('view'); setModalVisible(true); };

  const handleDelete = (record: AuditReportRecord) => {
    Modal.confirm({
      title: '确认删除', content: `确定要删除报告"${record.reportName}"吗？`,
      onOk: () => {
        const newData = data.filter(item => item.id !== record.id);
        saveData(MODULE_KEYS.AUDIT_REPORT, newData);
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
        saveData(MODULE_KEYS.AUDIT_REPORT, newData);
        setData(newData); setFilteredData(newData); setSelectedRows([]);
        setPagination(prev => ({ ...prev, total: newData.length }));
        message.success('批量删除成功');
      },
    });
  };

  const handleSave = (values: any) => {
    if (modalMode === 'add') {
      const newRecord: AuditReportRecord = { id: Date.now().toString(), ...values };
      const newData = [newRecord, ...data];
      saveData(MODULE_KEYS.AUDIT_REPORT, newData);
      setData(newData); setFilteredData(newData);
      setPagination(prev => ({ ...prev, total: newData.length }));
      message.success('新增成功');
    } else if (modalMode === 'edit' && editingRecord) {
      const newData = data.map(item => item.id === editingRecord.id ? { ...item, ...values } : item);
      saveData(MODULE_KEYS.AUDIT_REPORT, newData);
      setData(newData); setFilteredData(newData);
      message.success('修改成功');
    }
    setModalVisible(false);
  };

  const handlePageChange = (page: number, pageSize?: number) => {
    setPagination(prev => ({ ...prev, current: page, pageSize: pageSize || 10 }));
  };

  const searchFields = [
    { type: 'input' as const, label: '报告编号', name: 'reportNo', placeholder: '请输入编号' },
    { type: 'input' as const, label: '报告名称', name: 'reportName', placeholder: '请输入名称' },
    { type: 'select' as const, label: '状态', name: 'status', options: [
      { label: '草稿', value: '草稿' }, { label: '待审批', value: '待审批' }, { label: '已审批', value: '已审批' },
    ]},
    { type: 'input' as const, label: '审核组长', name: 'auditLeader', placeholder: '请输入审核组长' },
  ];

  const columns = [
    { title: '序号', key: 'index', width: 60, render: (_: any, __: any, index: number) => index + 1 },
    { title: '报告编号', dataIndex: 'reportNo', key: 'reportNo', width: 120 },
    { title: '报告名称', dataIndex: 'reportName', key: 'reportName' },
    { title: '审核日期', dataIndex: 'auditDate', key: 'auditDate', width: 120 },
    { title: '审核范围', dataIndex: 'auditScope', key: 'auditScope', ellipsis: true },
    { title: '不符合项', dataIndex: 'nonconformityCount', key: 'nonconformityCount', width: 100 },
    { title: '观察项', dataIndex: 'observationCount', key: 'observationCount', width: 80 },
    { title: '审核组长', dataIndex: 'auditLeader', key: 'auditLeader', width: 100 },
    { title: '批准人', dataIndex: 'approver', key: 'approver', width: 100 },
    {
      title: '状态', dataIndex: 'status', key: 'status', width: 100,
      render: (status: string) => {
        const colorMap: Record<string, string> = { '草稿': 'default', '待审批': 'processing', '已审批': 'success' };
        return <Tag color={colorMap[status] || 'default'}>{status}</Tag>;
      },
    },
  ];

  const startIndex = (pagination.current - 1) * pagination.pageSize;
  const paginatedData = filteredData.slice(startIndex, startIndex + pagination.pageSize);

  return (
    <div>
      <PageHeader breadcrumbs={[{ title: '首页', path: '/' }, { title: '内部审核管理' }, { title: '内审报告' }]} />
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={8}><Statistic title="报告总数" value={data.length} prefix={<FileTextOutlined />} /></Col>
          <Col span={8}><Statistic title="待审批" value={data.filter(i => i.status === '待审批').length} prefix={<EditOutlined />} valueStyle={{ color: '#1890ff' }} /></Col>
          <Col span={8}><Statistic title="已审批" value={data.filter(i => i.status === '已审批').length} prefix={<CheckCircleOutlined />} valueStyle={{ color: '#52c41a' }} /></Col>
        </Row>
      </Card>
      <SearchForm fields={searchFields} onSearch={handleSearch} onReset={handleReset} />
      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <Space><Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增内审报告</Button></Space>
          <Space><Button icon={<DeleteOutlined />} onClick={handleBatchDelete} disabled={selectedRows.length === 0}>删除</Button></Space>
        </div>
        <DataTable columns={columns} dataSource={paginatedData} loading={loading}
          pagination={{ ...pagination, onChange: handlePageChange }}
          onView={handleView} onEdit={handleEdit} onDelete={handleDelete}
          rowSelection={{ selectedRowKeys: selectedRows.map(r => r.id), onChange: (_: any, rows: any) => setSelectedRows(rows) }}
        />
      </Card>
      <AuditReportForm visible={modalVisible} record={editingRecord} mode={modalMode} onCancel={() => setModalVisible(false)} onSave={handleSave} />
    </div>
  );
};

export default AuditReportPage;
