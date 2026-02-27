import React, { useState, useEffect, useCallback } from 'react';
import { Card, Row, Col, Statistic, Button, Space, Tag, message, Modal } from 'antd';
import { FileTextOutlined, ClockCircleOutlined, CheckCircleOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import PageHeader from '../../../components/Common/PageHeader';
import SearchForm from '../../../components/Common/SearchForm';
import DataTable from '../../../components/Common/DataTable';
import ImplementationForm from './ImplementationForm';
import type { ReviewImplementationRecord } from '../../../types/index';
import { loadData, saveData, MODULE_KEYS } from '../../../utils/storage';

const ReviewImplementationPage: React.FC = () => {
  const [data, setData] = useState<ReviewImplementationRecord[]>([]); const [filteredData, setFilteredData] = useState<ReviewImplementationRecord[]>([]);
  const [loading, setLoading] = useState(false); const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ReviewImplementationRecord | null>(null);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view'>('add');
  const [selectedRows, setSelectedRows] = useState<ReviewImplementationRecord[]>([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  const loadTableData = useCallback(async () => { setLoading(true); const result = await loadData<ReviewImplementationRecord>(MODULE_KEYS.REVIEW_IMPLEMENTATION); setData(result); setFilteredData(result); setPagination(prev => ({ ...prev, total: result.length })); setLoading(false); }, []);
  useEffect(() => { loadTableData(); }, [loadTableData]);

  const handleSearch = (values: any) => { let r = [...data]; if (values.planName) r = r.filter(i => i.planName.includes(values.planName)); if (values.chairperson) r = r.filter(i => i.chairperson.includes(values.chairperson)); if (values.status) r = r.filter(i => i.status === values.status); setFilteredData(r); setPagination(p => ({ ...p, current: 1, total: r.length })); };
  const handleReset = () => { setFilteredData(data); setPagination(p => ({ ...p, current: 1, total: data.length })); };
  const handleAdd = () => { setEditingRecord(null); setModalMode('add'); setModalVisible(true); };
  const handleEdit = (r: ReviewImplementationRecord) => { setEditingRecord(r); setModalMode('edit'); setModalVisible(true); };
  const handleView = (r: ReviewImplementationRecord) => { setEditingRecord(r); setModalMode('view'); setModalVisible(true); };
  const handleDelete = (record: ReviewImplementationRecord) => { Modal.confirm({ title: '确认删除', content: `确定要删除"${record.planName}"吗？`, onOk: () => { const nd = data.filter(i => i.id !== record.id); saveData(MODULE_KEYS.REVIEW_IMPLEMENTATION, nd); setData(nd); setFilteredData(nd); setPagination(p => ({ ...p, total: nd.length })); message.success('删除成功'); } }); };
  const handleBatchDelete = () => { if (!selectedRows.length) { message.warning('请先选择记录'); return; } Modal.confirm({ title: '确认批量删除', content: `确定要删除选中的 ${selectedRows.length} 条记录吗？`, onOk: () => { const ids = selectedRows.map(i => i.id); const nd = data.filter(i => !ids.includes(i.id)); saveData(MODULE_KEYS.REVIEW_IMPLEMENTATION, nd); setData(nd); setFilteredData(nd); setSelectedRows([]); setPagination(p => ({ ...p, total: nd.length })); message.success('批量删除成功'); } }); };
  const handleSave = (values: any) => { if (modalMode === 'add') { const nr = { id: Date.now().toString(), ...values }; const nd = [nr, ...data]; saveData(MODULE_KEYS.REVIEW_IMPLEMENTATION, nd); setData(nd); setFilteredData(nd); setPagination(p => ({ ...p, total: nd.length })); message.success('新增成功'); } else if (modalMode === 'edit' && editingRecord) { const nd = data.map(i => i.id === editingRecord.id ? { ...i, ...values } : i); saveData(MODULE_KEYS.REVIEW_IMPLEMENTATION, nd); setData(nd); setFilteredData(nd); message.success('修改成功'); } setModalVisible(false); };
  const handlePageChange = (page: number, pageSize?: number) => { setPagination(p => ({ ...p, current: page, pageSize: pageSize || 10 })); };

  const searchFields = [
    { type: 'input' as const, label: '计划名称', name: 'planName', placeholder: '请输入计划名称' },
    { type: 'input' as const, label: '主持人', name: 'chairperson', placeholder: '请输入主持人' },
    { type: 'select' as const, label: '状态', name: 'status', options: [{ label: '待评审', value: '待评审' }, { label: '评审中', value: '评审中' }, { label: '已完成', value: '已完成' }] },
  ];
  const columns = [
    { title: '序号', key: 'index', width: 60, render: (_: any, __: any, i: number) => i + 1 },
    { title: '计划名称', dataIndex: 'planName', key: 'planName' },
    { title: '评审日期', dataIndex: 'reviewDate', key: 'reviewDate', width: 120 },
    { title: '评审地点', dataIndex: 'reviewLocation', key: 'reviewLocation' },
    { title: '主持人', dataIndex: 'chairperson', key: 'chairperson', width: 100 },
    { title: '参加人员', dataIndex: 'participants', key: 'participants', ellipsis: true },
    { title: '评审事项', dataIndex: 'reviewItems', key: 'reviewItems', ellipsis: true },
    { title: '状态', dataIndex: 'status', key: 'status', width: 100, render: (s: string) => <Tag color={{ '待评审': 'default', '评审中': 'processing', '已完成': 'success' }[s]}>{s}</Tag> },
  ];
  const si = (pagination.current - 1) * pagination.pageSize;
  const pd = filteredData.slice(si, si + pagination.pageSize);
  return (
    <div>
      <PageHeader breadcrumbs={[{ title: '首页', path: '/' }, { title: '管理评审管理' }, { title: '管理评审实施计划' }]} />
      <Card style={{ marginBottom: 16 }}><Row gutter={16}>
        <Col span={8}><Statistic title="计划总数" value={data.length} prefix={<FileTextOutlined />} /></Col>
        <Col span={8}><Statistic title="待评审" value={data.filter(i => i.status === '待评审').length} prefix={<ClockCircleOutlined />} /></Col>
        <Col span={8}><Statistic title="已完成" value={data.filter(i => i.status === '已完成').length} prefix={<CheckCircleOutlined />} valueStyle={{ color: '#52c41a' }} /></Col>
      </Row></Card>
      <SearchForm fields={searchFields} onSearch={handleSearch} onReset={handleReset} />
      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <Space><Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增实施计划</Button></Space>
          <Space><Button icon={<DeleteOutlined />} onClick={handleBatchDelete} disabled={!selectedRows.length}>删除</Button></Space>
        </div>
        <DataTable columns={columns} dataSource={pd} loading={loading} pagination={{ ...pagination, onChange: handlePageChange }} onView={handleView} onEdit={handleEdit} onDelete={handleDelete} rowSelection={{ selectedRowKeys: selectedRows.map(r => r.id), onChange: (_: any, rows: any) => setSelectedRows(rows) }} />
      </Card>
      <ImplementationForm visible={modalVisible} record={editingRecord} mode={modalMode} onCancel={() => setModalVisible(false)} onSave={handleSave} />
    </div>
  );
};
export default ReviewImplementationPage;
