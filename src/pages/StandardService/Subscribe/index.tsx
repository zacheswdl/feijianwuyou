import React, { useState, useEffect, useCallback } from 'react';
import { Card, Row, Col, Statistic, Button, Space, Tag, message, Modal } from 'antd';
import { FileTextOutlined, CheckCircleOutlined, PauseCircleOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import PageHeader from '../../../components/Common/PageHeader';
import SearchForm from '../../../components/Common/SearchForm';
import DataTable from '../../../components/Common/DataTable';
import SubscribeForm from './SubscribeForm';
import type { StandardSubscriptionRecord } from '../../../types/index';
import { loadData, saveData, MODULE_KEYS } from '../../../utils/storage';

const StandardSubscribePage: React.FC = () => {
  const [data, setData] = useState<StandardSubscriptionRecord[]>([]); const [filteredData, setFilteredData] = useState<StandardSubscriptionRecord[]>([]);
  const [loading, setLoading] = useState(false); const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<StandardSubscriptionRecord | null>(null);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view'>('add');
  const [selectedRows, setSelectedRows] = useState<StandardSubscriptionRecord[]>([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  const loadTableData = useCallback(async () => { setLoading(true); const result = await loadData<StandardSubscriptionRecord>(MODULE_KEYS.STANDARD_SUBSCRIPTION); setData(result); setFilteredData(result); setPagination(prev => ({ ...prev, total: result.length })); setLoading(false); }, []);
  useEffect(() => { loadTableData(); }, [loadTableData]);

  const handleSearch = (values: any) => { let r = [...data]; if (values.subscriberName) r = r.filter(i => i.subscriberName.includes(values.subscriberName)); if (values.department) r = r.filter(i => i.department.includes(values.department)); if (values.subscribeType) r = r.filter(i => i.subscribeType === values.subscribeType); if (values.status) r = r.filter(i => i.status === values.status); setFilteredData(r); setPagination(p => ({ ...p, current: 1, total: r.length })); };
  const handleReset = () => { setFilteredData(data); setPagination(p => ({ ...p, current: 1, total: data.length })); };
  const handleAdd = () => { setEditingRecord(null); setModalMode('add'); setModalVisible(true); };
  const handleEdit = (r: StandardSubscriptionRecord) => { setEditingRecord(r); setModalMode('edit'); setModalVisible(true); };
  const handleView = (r: StandardSubscriptionRecord) => { setEditingRecord(r); setModalMode('view'); setModalVisible(true); };
  const handleDelete = (record: StandardSubscriptionRecord) => { Modal.confirm({ title: '确认删除', content: `确定要删除"${record.subscriberName}"的订阅吗？`, onOk: () => { const nd = data.filter(i => i.id !== record.id); saveData(MODULE_KEYS.STANDARD_SUBSCRIPTION, nd); setData(nd); setFilteredData(nd); setPagination(p => ({ ...p, total: nd.length })); message.success('删除成功'); } }); };
  const handleBatchDelete = () => { if (!selectedRows.length) { message.warning('请先选择记录'); return; } Modal.confirm({ title: '确认批量删除', content: `确定要删除选中的 ${selectedRows.length} 条记录吗？`, onOk: () => { const ids = selectedRows.map(i => i.id); const nd = data.filter(i => !ids.includes(i.id)); saveData(MODULE_KEYS.STANDARD_SUBSCRIPTION, nd); setData(nd); setFilteredData(nd); setSelectedRows([]); setPagination(p => ({ ...p, total: nd.length })); message.success('批量删除成功'); } }); };
  const handleSave = (values: any) => { if (modalMode === 'add') { const nr = { id: Date.now().toString(), ...values }; const nd = [nr, ...data]; saveData(MODULE_KEYS.STANDARD_SUBSCRIPTION, nd); setData(nd); setFilteredData(nd); setPagination(p => ({ ...p, total: nd.length })); message.success('新增成功'); } else if (modalMode === 'edit' && editingRecord) { const nd = data.map(i => i.id === editingRecord.id ? { ...i, ...values } : i); saveData(MODULE_KEYS.STANDARD_SUBSCRIPTION, nd); setData(nd); setFilteredData(nd); message.success('修改成功'); } setModalVisible(false); };
  const handlePageChange = (page: number, pageSize?: number) => { setPagination(p => ({ ...p, current: page, pageSize: pageSize || 10 })); };

  const searchFields = [
    { type: 'input' as const, label: '订阅人', name: 'subscriberName', placeholder: '请输入订阅人' },
    { type: 'input' as const, label: '部门', name: 'department', placeholder: '请输入部门' },
    { type: 'select' as const, label: '订阅类型', name: 'subscribeType', options: [{ label: '新标准发布', value: '新标准发布' }, { label: '标准修订', value: '标准修订' }, { label: '标准废止', value: '标准废止' }, { label: '全部', value: '全部' }] },
    { type: 'select' as const, label: '状态', name: 'status', options: [{ label: '有效', value: '有效' }, { label: '已暂停', value: '已暂停' }, { label: '已取消', value: '已取消' }] },
  ];
  const columns = [
    { title: '序号', key: 'index', width: 60, render: (_: any, __: any, i: number) => i + 1 },
    { title: '订阅人', dataIndex: 'subscriberName', key: 'subscriberName', width: 100 },
    { title: '部门', dataIndex: 'department', key: 'department', width: 100 },
    { title: '订阅类型', dataIndex: 'subscribeType', key: 'subscribeType', width: 110 },
    { title: '订阅范围', dataIndex: 'subscribeScope', key: 'subscribeScope', ellipsis: true },
    { title: '联系邮箱', dataIndex: 'contactEmail', key: 'contactEmail', ellipsis: true },
    { title: '联系电话', dataIndex: 'contactPhone', key: 'contactPhone', width: 130 },
    { title: '订阅日期', dataIndex: 'subscribeDate', key: 'subscribeDate', width: 120 },
    { title: '状态', dataIndex: 'status', key: 'status', width: 90, render: (s: string) => <Tag color={{ '有效': 'success', '已暂停': 'warning', '已取消': 'default' }[s]}>{s}</Tag> },
  ];
  const si = (pagination.current - 1) * pagination.pageSize;
  const pd = filteredData.slice(si, si + pagination.pageSize);
  return (
    <div>
      <PageHeader breadcrumbs={[{ title: '首页', path: '/' }, { title: '标准服务' }, { title: '标准查新订阅' }]} />
      <Card style={{ marginBottom: 16 }}><Row gutter={16}>
        <Col span={8}><Statistic title="订阅总数" value={data.length} prefix={<FileTextOutlined />} /></Col>
        <Col span={8}><Statistic title="有效" value={data.filter(i => i.status === '有效').length} prefix={<CheckCircleOutlined />} valueStyle={{ color: '#52c41a' }} /></Col>
        <Col span={8}><Statistic title="已暂停" value={data.filter(i => i.status === '已暂停').length} prefix={<PauseCircleOutlined />} valueStyle={{ color: '#faad14' }} /></Col>
      </Row></Card>
      <SearchForm fields={searchFields} onSearch={handleSearch} onReset={handleReset} />
      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <Space><Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增订阅</Button></Space>
          <Space><Button icon={<DeleteOutlined />} onClick={handleBatchDelete} disabled={!selectedRows.length}>删除</Button></Space>
        </div>
        <DataTable columns={columns} dataSource={pd} loading={loading} pagination={{ ...pagination, onChange: handlePageChange }} onView={handleView} onEdit={handleEdit} onDelete={handleDelete} rowSelection={{ selectedRowKeys: selectedRows.map(r => r.id), onChange: (_: any, rows: any) => setSelectedRows(rows) }} />
      </Card>
      <SubscribeForm visible={modalVisible} record={editingRecord} mode={modalMode} onCancel={() => setModalVisible(false)} onSave={handleSave} />
    </div>
  );
};
export default StandardSubscribePage;
