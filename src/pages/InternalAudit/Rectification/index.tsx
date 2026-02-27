import React, { useState, useEffect, useCallback } from 'react';
import { Card, Row, Col, Statistic, Button, Space, Tag, message, Modal } from 'antd';
import { ToolOutlined, ClockCircleOutlined, CheckCircleOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import PageHeader from '../../../components/Common/PageHeader';
import SearchForm from '../../../components/Common/SearchForm';
import DataTable from '../../../components/Common/DataTable';
import RectificationForm from './RectificationForm';
import type { AuditRectificationRecord } from '../../../types/index';
import { loadData, saveData, MODULE_KEYS } from '../../../utils/storage';

const AuditRectificationPage: React.FC = () => {
  const [data, setData] = useState<AuditRectificationRecord[]>([]);
  const [filteredData, setFilteredData] = useState<AuditRectificationRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AuditRectificationRecord | null>(null);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view'>('add');
  const [selectedRows, setSelectedRows] = useState<AuditRectificationRecord[]>([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  const loadTableData = useCallback(async () => {
    setLoading(true);
    const result = await loadData<AuditRectificationRecord>(MODULE_KEYS.AUDIT_RECTIFICATION);
    setData(result); setFilteredData(result);
    setPagination(prev => ({ ...prev, total: result.length }));
    setLoading(false);
  }, []);

  useEffect(() => { loadTableData(); }, [loadTableData]);

  const handleSearch = (values: any) => {
    let result = [...data];
    if (values.nonconformityNo) result = result.filter(item => item.nonconformityNo.includes(values.nonconformityNo));
    if (values.responsiblePerson) result = result.filter(item => item.responsiblePerson.includes(values.responsiblePerson));
    if (values.verifyResult) result = result.filter(item => item.verifyResult === values.verifyResult);
    if (values.status) result = result.filter(item => item.status === values.status);
    setFilteredData(result);
    setPagination(prev => ({ ...prev, current: 1, total: result.length }));
  };

  const handleReset = () => { setFilteredData(data); setPagination(prev => ({ ...prev, current: 1, total: data.length })); };
  const handleAdd = () => { setEditingRecord(null); setModalMode('add'); setModalVisible(true); };
  const handleEdit = (record: AuditRectificationRecord) => { setEditingRecord(record); setModalMode('edit'); setModalVisible(true); };
  const handleView = (record: AuditRectificationRecord) => { setEditingRecord(record); setModalMode('view'); setModalVisible(true); };

  const handleDelete = (record: AuditRectificationRecord) => {
    Modal.confirm({
      title: '确认删除', content: `确定要删除该整改记录吗？`,
      onOk: () => {
        const newData = data.filter(item => item.id !== record.id);
        saveData(MODULE_KEYS.AUDIT_RECTIFICATION, newData);
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
        saveData(MODULE_KEYS.AUDIT_RECTIFICATION, newData);
        setData(newData); setFilteredData(newData); setSelectedRows([]);
        setPagination(prev => ({ ...prev, total: newData.length }));
        message.success('批量删除成功');
      },
    });
  };

  const handleSave = (values: any) => {
    if (modalMode === 'add') {
      const newRecord: AuditRectificationRecord = { id: Date.now().toString(), ...values };
      const newData = [newRecord, ...data];
      saveData(MODULE_KEYS.AUDIT_RECTIFICATION, newData);
      setData(newData); setFilteredData(newData);
      setPagination(prev => ({ ...prev, total: newData.length }));
      message.success('新增成功');
    } else if (modalMode === 'edit' && editingRecord) {
      const newData = data.map(item => item.id === editingRecord.id ? { ...item, ...values } : item);
      saveData(MODULE_KEYS.AUDIT_RECTIFICATION, newData);
      setData(newData); setFilteredData(newData);
      message.success('修改成功');
    }
    setModalVisible(false);
  };

  const handlePageChange = (page: number, pageSize?: number) => {
    setPagination(prev => ({ ...prev, current: page, pageSize: pageSize || 10 }));
  };

  const searchFields = [
    { type: 'input' as const, label: '不符合项编号', name: 'nonconformityNo', placeholder: '请输入编号' },
    { type: 'input' as const, label: '责任人', name: 'responsiblePerson', placeholder: '请输入责任人' },
    { type: 'select' as const, label: '验证结果', name: 'verifyResult', options: [
      { label: '通过', value: '通过' }, { label: '不通过', value: '不通过' }, { label: '待验证', value: '待验证' },
    ]},
    { type: 'select' as const, label: '状态', name: 'status', options: [
      { label: '待整改', value: '待整改' }, { label: '已整改', value: '已整改' }, { label: '已验证', value: '已验证' },
    ]},
  ];

  const columns = [
    { title: '序号', key: 'index', width: 60, render: (_: any, __: any, index: number) => index + 1 },
    { title: '不符合项编号', dataIndex: 'nonconformityNo', key: 'nonconformityNo', width: 130 },
    { title: '不符合描述', dataIndex: 'nonconformityDesc', key: 'nonconformityDesc', ellipsis: true },
    { title: '责任人', dataIndex: 'responsiblePerson', key: 'responsiblePerson', width: 100 },
    { title: '整改措施', dataIndex: 'rectificationMeasure', key: 'rectificationMeasure', ellipsis: true },
    { title: '整改日期', dataIndex: 'rectificationDate', key: 'rectificationDate', width: 120 },
    { title: '验证人', dataIndex: 'verifier', key: 'verifier', width: 100 },
    { title: '验证日期', dataIndex: 'verifyDate', key: 'verifyDate', width: 120 },
    {
      title: '验证结果', dataIndex: 'verifyResult', key: 'verifyResult', width: 100,
      render: (result: string) => {
        const colorMap: Record<string, string> = { '通过': 'success', '不通过': 'error', '待验证': 'warning' };
        return <Tag color={colorMap[result] || 'default'}>{result}</Tag>;
      },
    },
    {
      title: '状态', dataIndex: 'status', key: 'status', width: 100,
      render: (status: string) => {
        const colorMap: Record<string, string> = { '待整改': 'error', '已整改': 'processing', '已验证': 'success' };
        return <Tag color={colorMap[status] || 'default'}>{status}</Tag>;
      },
    },
  ];

  const startIndex = (pagination.current - 1) * pagination.pageSize;
  const paginatedData = filteredData.slice(startIndex, startIndex + pagination.pageSize);

  return (
    <div>
      <PageHeader breadcrumbs={[{ title: '首页', path: '/' }, { title: '内部审核管理' }, { title: '不符合项整改' }]} />
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={6}><Statistic title="整改记录总数" value={data.length} prefix={<ToolOutlined />} /></Col>
          <Col span={6}><Statistic title="待整改" value={data.filter(i => i.status === '待整改').length} prefix={<ClockCircleOutlined />} valueStyle={{ color: '#ff4d4f' }} /></Col>
          <Col span={6}><Statistic title="已整改" value={data.filter(i => i.status === '已整改').length} valueStyle={{ color: '#1890ff' }} /></Col>
          <Col span={6}><Statistic title="已验证" value={data.filter(i => i.status === '已验证').length} prefix={<CheckCircleOutlined />} valueStyle={{ color: '#52c41a' }} /></Col>
        </Row>
      </Card>
      <SearchForm fields={searchFields} onSearch={handleSearch} onReset={handleReset} />
      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <Space><Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增整改记录</Button></Space>
          <Space><Button icon={<DeleteOutlined />} onClick={handleBatchDelete} disabled={selectedRows.length === 0}>删除</Button></Space>
        </div>
        <DataTable columns={columns} dataSource={paginatedData} loading={loading}
          pagination={{ ...pagination, onChange: handlePageChange }}
          onView={handleView} onEdit={handleEdit} onDelete={handleDelete}
          rowSelection={{ selectedRowKeys: selectedRows.map(r => r.id), onChange: (_: any, rows: any) => setSelectedRows(rows) }}
        />
      </Card>
      <RectificationForm visible={modalVisible} record={editingRecord} mode={modalMode} onCancel={() => setModalVisible(false)} onSave={handleSave} />
    </div>
  );
};

export default AuditRectificationPage;
