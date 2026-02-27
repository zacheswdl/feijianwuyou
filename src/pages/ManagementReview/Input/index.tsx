import React, { useState, useEffect, useCallback } from 'react';
import { Card, Row, Col, Statistic, Button, Space, Tag, message, Modal } from 'antd';
import { FileTextOutlined, ClockCircleOutlined, CheckCircleOutlined, SendOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import PageHeader from '../../../components/Common/PageHeader';
import SearchForm from '../../../components/Common/SearchForm';
import DataTable from '../../../components/Common/DataTable';
import InputForm from './InputForm';
import type { ReviewInputRecord } from '../../../types/index';
import { loadData, saveData, MODULE_KEYS } from '../../../utils/storage';

const ReviewInputPage: React.FC = () => {
  const [data, setData] = useState<ReviewInputRecord[]>([]); const [filteredData, setFilteredData] = useState<ReviewInputRecord[]>([]);
  const [loading, setLoading] = useState(false); const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ReviewInputRecord | null>(null);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view'>('add');
  const [selectedRows, setSelectedRows] = useState<ReviewInputRecord[]>([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  const loadTableData = useCallback(async () => { setLoading(true); const result = await loadData<ReviewInputRecord>(MODULE_KEYS.REVIEW_INPUT); setData(result); setFilteredData(result); setPagination(prev => ({ ...prev, total: result.length })); setLoading(false); }, []);
  useEffect(() => { loadTableData(); }, [loadTableData]);

  const handleSearch = (values: any) => { let r = [...data]; if (values.materialName) r = r.filter(i => i.materialName.includes(values.materialName)); if (values.materialType) r = r.filter(i => i.materialType === values.materialType); if (values.department) r = r.filter(i => i.department.includes(values.department)); if (values.status) r = r.filter(i => i.status === values.status); setFilteredData(r); setPagination(p => ({ ...p, current: 1, total: r.length })); };
  const handleReset = () => { setFilteredData(data); setPagination(p => ({ ...p, current: 1, total: data.length })); };
  const handleAdd = () => { setEditingRecord(null); setModalMode('add'); setModalVisible(true); };
  const handleEdit = (r: ReviewInputRecord) => { setEditingRecord(r); setModalMode('edit'); setModalVisible(true); };
  const handleView = (r: ReviewInputRecord) => { setEditingRecord(r); setModalMode('view'); setModalVisible(true); };
  const handleDelete = (record: ReviewInputRecord) => { Modal.confirm({ title: '确认删除', content: `确定要删除"${record.materialName}"吗？`, onOk: () => { const nd = data.filter(i => i.id !== record.id); saveData(MODULE_KEYS.REVIEW_INPUT, nd); setData(nd); setFilteredData(nd); setPagination(p => ({ ...p, total: nd.length })); message.success('删除成功'); } }); };
  const handleBatchDelete = () => { if (!selectedRows.length) { message.warning('请先选择记录'); return; } Modal.confirm({ title: '确认批量删除', content: `确定要删除选中的 ${selectedRows.length} 条记录吗？`, onOk: () => { const ids = selectedRows.map(i => i.id); const nd = data.filter(i => !ids.includes(i.id)); saveData(MODULE_KEYS.REVIEW_INPUT, nd); setData(nd); setFilteredData(nd); setSelectedRows([]); setPagination(p => ({ ...p, total: nd.length })); message.success('批量删除成功'); } }); };
  const handleSave = (values: any) => { if (modalMode === 'add') { const nr = { id: Date.now().toString(), ...values }; const nd = [nr, ...data]; saveData(MODULE_KEYS.REVIEW_INPUT, nd); setData(nd); setFilteredData(nd); setPagination(p => ({ ...p, total: nd.length })); message.success('新增成功'); } else if (modalMode === 'edit' && editingRecord) { const nd = data.map(i => i.id === editingRecord.id ? { ...i, ...values } : i); saveData(MODULE_KEYS.REVIEW_INPUT, nd); setData(nd); setFilteredData(nd); message.success('修改成功'); } setModalVisible(false); };
  const handlePageChange = (page: number, pageSize?: number) => { setPagination(p => ({ ...p, current: page, pageSize: pageSize || 10 })); };

  const searchFields = [
    { type: 'input' as const, label: '材料名称', name: 'materialName', placeholder: '请输入材料名称' },
    { type: 'select' as const, label: '材料类型', name: 'materialType', options: [{ label: '审核结果', value: '审核结果' }, { label: '客户反馈', value: '客户反馈' }, { label: '纠正措施', value: '纠正措施' }, { label: '改进建议', value: '改进建议' }, { label: '资源需求', value: '资源需求' }, { label: '风险评估', value: '风险评估' }, { label: '其他', value: '其他' }] },
    { type: 'input' as const, label: '部门', name: 'department', placeholder: '请输入部门' },
    { type: 'select' as const, label: '状态', name: 'status', options: [{ label: '待提交', value: '待提交' }, { label: '已提交', value: '已提交' }, { label: '已采纳', value: '已采纳' }] },
  ];
  const columns = [
    { title: '序号', key: 'index', width: 60, render: (_: any, __: any, i: number) => i + 1 },
    { title: '材料名称', dataIndex: 'materialName', key: 'materialName' },
    { title: '材料类型', dataIndex: 'materialType', key: 'materialType', width: 100 },
    { title: '提交日期', dataIndex: 'submitDate', key: 'submitDate', width: 120 },
    { title: '提交人', dataIndex: 'submitter', key: 'submitter', width: 100 },
    { title: '部门', dataIndex: 'department', key: 'department', width: 100 },
    { title: '材料内容', dataIndex: 'materialContent', key: 'materialContent', ellipsis: true },
    { title: '状态', dataIndex: 'status', key: 'status', width: 100, render: (s: string) => <Tag color={{ '待提交': 'default', '已提交': 'processing', '已采纳': 'success' }[s]}>{s}</Tag> },
  ];
  const si = (pagination.current - 1) * pagination.pageSize;
  const pd = filteredData.slice(si, si + pagination.pageSize);
  return (
    <div>
      <PageHeader breadcrumbs={[{ title: '首页', path: '/' }, { title: '管理评审管理' }, { title: '管理评审输入材料' }]} />
      <Card style={{ marginBottom: 16 }}><Row gutter={16}>
        <Col span={6}><Statistic title="材料总数" value={data.length} prefix={<FileTextOutlined />} /></Col>
        <Col span={6}><Statistic title="待提交" value={data.filter(i => i.status === '待提交').length} prefix={<ClockCircleOutlined />} /></Col>
        <Col span={6}><Statistic title="已提交" value={data.filter(i => i.status === '已提交').length} prefix={<SendOutlined />} valueStyle={{ color: '#1890ff' }} /></Col>
        <Col span={6}><Statistic title="已采纳" value={data.filter(i => i.status === '已采纳').length} prefix={<CheckCircleOutlined />} valueStyle={{ color: '#52c41a' }} /></Col>
      </Row></Card>
      <SearchForm fields={searchFields} onSearch={handleSearch} onReset={handleReset} />
      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <Space><Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增输入材料</Button></Space>
          <Space><Button icon={<DeleteOutlined />} onClick={handleBatchDelete} disabled={!selectedRows.length}>删除</Button></Space>
        </div>
        <DataTable columns={columns} dataSource={pd} loading={loading} pagination={{ ...pagination, onChange: handlePageChange }} onView={handleView} onEdit={handleEdit} onDelete={handleDelete} rowSelection={{ selectedRowKeys: selectedRows.map(r => r.id), onChange: (_: any, rows: any) => setSelectedRows(rows) }} />
      </Card>
      <InputForm visible={modalVisible} record={editingRecord} mode={modalMode} onCancel={() => setModalVisible(false)} onSave={handleSave} />
    </div>
  );
};
export default ReviewInputPage;
