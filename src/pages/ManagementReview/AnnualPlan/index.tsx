import React, { useState, useEffect, useCallback } from 'react';
import { Card, Row, Col, Statistic, Button, Space, Tag, message, Modal } from 'antd';
import { FileTextOutlined, ClockCircleOutlined, CheckCircleOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import PageHeader from '../../../components/Common/PageHeader';
import SearchForm from '../../../components/Common/SearchForm';
import DataTable from '../../../components/Common/DataTable';
import AnnualPlanForm from './AnnualPlanForm';
import type { ReviewAnnualPlanRecord } from '../../../types/index';
import { loadData, saveData, MODULE_KEYS } from '../../../utils/storage';

const ReviewAnnualPlanPage: React.FC = () => {
  const [data, setData] = useState<ReviewAnnualPlanRecord[]>([]); const [filteredData, setFilteredData] = useState<ReviewAnnualPlanRecord[]>([]);
  const [loading, setLoading] = useState(false); const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ReviewAnnualPlanRecord | null>(null);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view'>('add');
  const [selectedRows, setSelectedRows] = useState<ReviewAnnualPlanRecord[]>([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  const loadTableData = useCallback(async () => { setLoading(true); const result = await loadData<ReviewAnnualPlanRecord>(MODULE_KEYS.REVIEW_ANNUAL_PLAN); setData(result); setFilteredData(result); setPagination(prev => ({ ...prev, total: result.length })); setLoading(false); }, []);
  useEffect(() => { loadTableData(); }, [loadTableData]);

  const handleSearch = (values: any) => { let r = [...data]; if (values.planName) r = r.filter(i => i.planName.includes(values.planName)); if (values.planYear) r = r.filter(i => i.planYear === values.planYear); if (values.status) r = r.filter(i => i.status === values.status); setFilteredData(r); setPagination(p => ({ ...p, current: 1, total: r.length })); };
  const handleReset = () => { setFilteredData(data); setPagination(p => ({ ...p, current: 1, total: data.length })); };
  const handleAdd = () => { setEditingRecord(null); setModalMode('add'); setModalVisible(true); };
  const handleEdit = (r: ReviewAnnualPlanRecord) => { setEditingRecord(r); setModalMode('edit'); setModalVisible(true); };
  const handleView = (r: ReviewAnnualPlanRecord) => { setEditingRecord(r); setModalMode('view'); setModalVisible(true); };
  const handleDelete = (record: ReviewAnnualPlanRecord) => { Modal.confirm({ title: '确认删除', content: `确定要删除"${record.planName}"吗？`, onOk: () => { const nd = data.filter(i => i.id !== record.id); saveData(MODULE_KEYS.REVIEW_ANNUAL_PLAN, nd); setData(nd); setFilteredData(nd); setPagination(p => ({ ...p, total: nd.length })); message.success('删除成功'); } }); };
  const handleBatchDelete = () => { if (!selectedRows.length) { message.warning('请先选择记录'); return; } Modal.confirm({ title: '确认批量删除', content: `确定要删除选中的 ${selectedRows.length} 条记录吗？`, onOk: () => { const ids = selectedRows.map(i => i.id); const nd = data.filter(i => !ids.includes(i.id)); saveData(MODULE_KEYS.REVIEW_ANNUAL_PLAN, nd); setData(nd); setFilteredData(nd); setSelectedRows([]); setPagination(p => ({ ...p, total: nd.length })); message.success('批量删除成功'); } }); };
  const handleSave = (values: any) => { if (modalMode === 'add') { const nr = { id: Date.now().toString(), ...values }; const nd = [nr, ...data]; saveData(MODULE_KEYS.REVIEW_ANNUAL_PLAN, nd); setData(nd); setFilteredData(nd); setPagination(p => ({ ...p, total: nd.length })); message.success('新增成功'); } else if (modalMode === 'edit' && editingRecord) { const nd = data.map(i => i.id === editingRecord.id ? { ...i, ...values } : i); saveData(MODULE_KEYS.REVIEW_ANNUAL_PLAN, nd); setData(nd); setFilteredData(nd); message.success('修改成功'); } setModalVisible(false); };
  const handlePageChange = (page: number, pageSize?: number) => { setPagination(p => ({ ...p, current: page, pageSize: pageSize || 10 })); };

  const searchFields = [
    { type: 'input' as const, label: '计划名称', name: 'planName', placeholder: '请输入计划名称' },
    { type: 'input' as const, label: '年度', name: 'planYear', placeholder: '请输入年度' },
    { type: 'select' as const, label: '状态', name: 'status', options: [{ label: '待执行', value: '待执行' }, { label: '进行中', value: '进行中' }, { label: '已完成', value: '已完成' }, { label: '已取消', value: '已取消' }] },
  ];
  const columns = [
    { title: '序号', key: 'index', width: 60, render: (_: any, __: any, i: number) => i + 1 },
    { title: '计划名称', dataIndex: 'planName', key: 'planName' },
    { title: '年度', dataIndex: 'planYear', key: 'planYear', width: 80 },
    { title: '评审目的', dataIndex: 'reviewObjective', key: 'reviewObjective', ellipsis: true },
    { title: '评审范围', dataIndex: 'reviewScope', key: 'reviewScope', ellipsis: true },
    { title: '计划日期', dataIndex: 'plannedDate', key: 'plannedDate', width: 120 },
    { title: '组织者', dataIndex: 'organizer', key: 'organizer', width: 100 },
    { title: '状态', dataIndex: 'status', key: 'status', width: 100, render: (s: string) => <Tag color={{ '待执行': 'default', '进行中': 'processing', '已完成': 'success', '已取消': 'error' }[s]}>{s}</Tag> },
  ];
  const si = (pagination.current - 1) * pagination.pageSize;
  const pd = filteredData.slice(si, si + pagination.pageSize);
  return (
    <div>
      <PageHeader breadcrumbs={[{ title: '首页', path: '/' }, { title: '管理评审管理' }, { title: '管理评审年度计划' }]} />
      <Card style={{ marginBottom: 16 }}><Row gutter={16}>
        <Col span={6}><Statistic title="计划总数" value={data.length} prefix={<FileTextOutlined />} /></Col>
        <Col span={6}><Statistic title="待执行" value={data.filter(i => i.status === '待执行').length} prefix={<ClockCircleOutlined />} /></Col>
        <Col span={6}><Statistic title="进行中" value={data.filter(i => i.status === '进行中').length} valueStyle={{ color: '#1890ff' }} /></Col>
        <Col span={6}><Statistic title="已完成" value={data.filter(i => i.status === '已完成').length} prefix={<CheckCircleOutlined />} valueStyle={{ color: '#52c41a' }} /></Col>
      </Row></Card>
      <SearchForm fields={searchFields} onSearch={handleSearch} onReset={handleReset} />
      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <Space><Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增年度计划</Button></Space>
          <Space><Button icon={<DeleteOutlined />} onClick={handleBatchDelete} disabled={!selectedRows.length}>删除</Button></Space>
        </div>
        <DataTable columns={columns} dataSource={pd} loading={loading} pagination={{ ...pagination, onChange: handlePageChange }} onView={handleView} onEdit={handleEdit} onDelete={handleDelete} rowSelection={{ selectedRowKeys: selectedRows.map(r => r.id), onChange: (_: any, rows: any) => setSelectedRows(rows) }} />
      </Card>
      <AnnualPlanForm visible={modalVisible} record={editingRecord} mode={modalMode} onCancel={() => setModalVisible(false)} onSave={handleSave} />
    </div>
  );
};
export default ReviewAnnualPlanPage;
