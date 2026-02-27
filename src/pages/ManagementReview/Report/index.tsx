import React, { useState, useEffect, useCallback } from 'react';
import { Card, Row, Col, Statistic, Button, Space, Tag, message, Modal } from 'antd';
import { FileTextOutlined, ClockCircleOutlined, CheckCircleOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import PageHeader from '../../../components/Common/PageHeader';
import SearchForm from '../../../components/Common/SearchForm';
import DataTable from '../../../components/Common/DataTable';
import ReportForm from './ReportForm';
import type { ReviewReportRecord } from '../../../types/index';
import { loadData, saveData, MODULE_KEYS } from '../../../utils/storage';

const ReviewReportPage: React.FC = () => {
  const [data, setData] = useState<ReviewReportRecord[]>([]); const [filteredData, setFilteredData] = useState<ReviewReportRecord[]>([]);
  const [loading, setLoading] = useState(false); const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ReviewReportRecord | null>(null);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view'>('add');
  const [selectedRows, setSelectedRows] = useState<ReviewReportRecord[]>([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  const loadTableData = useCallback(async () => { setLoading(true); const result = await loadData<ReviewReportRecord>(MODULE_KEYS.REVIEW_REPORT); setData(result); setFilteredData(result); setPagination(prev => ({ ...prev, total: result.length })); setLoading(false); }, []);
  useEffect(() => { loadTableData(); }, [loadTableData]);

  const handleSearch = (values: any) => { let r = [...data]; if (values.reportNo) r = r.filter(i => i.reportNo.includes(values.reportNo)); if (values.reportName) r = r.filter(i => i.reportName.includes(values.reportName)); if (values.status) r = r.filter(i => i.status === values.status); setFilteredData(r); setPagination(p => ({ ...p, current: 1, total: r.length })); };
  const handleReset = () => { setFilteredData(data); setPagination(p => ({ ...p, current: 1, total: data.length })); };
  const handleAdd = () => { setEditingRecord(null); setModalMode('add'); setModalVisible(true); };
  const handleEdit = (r: ReviewReportRecord) => { setEditingRecord(r); setModalMode('edit'); setModalVisible(true); };
  const handleView = (r: ReviewReportRecord) => { setEditingRecord(r); setModalMode('view'); setModalVisible(true); };
  const handleDelete = (record: ReviewReportRecord) => { Modal.confirm({ title: '确认删除', content: `确定要删除"${record.reportName}"吗？`, onOk: () => { const nd = data.filter(i => i.id !== record.id); saveData(MODULE_KEYS.REVIEW_REPORT, nd); setData(nd); setFilteredData(nd); setPagination(p => ({ ...p, total: nd.length })); message.success('删除成功'); } }); };
  const handleBatchDelete = () => { if (!selectedRows.length) { message.warning('请先选择记录'); return; } Modal.confirm({ title: '确认批量删除', content: `确定要删除选中的 ${selectedRows.length} 条记录吗？`, onOk: () => { const ids = selectedRows.map(i => i.id); const nd = data.filter(i => !ids.includes(i.id)); saveData(MODULE_KEYS.REVIEW_REPORT, nd); setData(nd); setFilteredData(nd); setSelectedRows([]); setPagination(p => ({ ...p, total: nd.length })); message.success('批量删除成功'); } }); };
  const handleSave = (values: any) => { if (modalMode === 'add') { const nr = { id: Date.now().toString(), ...values }; const nd = [nr, ...data]; saveData(MODULE_KEYS.REVIEW_REPORT, nd); setData(nd); setFilteredData(nd); setPagination(p => ({ ...p, total: nd.length })); message.success('新增成功'); } else if (modalMode === 'edit' && editingRecord) { const nd = data.map(i => i.id === editingRecord.id ? { ...i, ...values } : i); saveData(MODULE_KEYS.REVIEW_REPORT, nd); setData(nd); setFilteredData(nd); message.success('修改成功'); } setModalVisible(false); };
  const handlePageChange = (page: number, pageSize?: number) => { setPagination(p => ({ ...p, current: page, pageSize: pageSize || 10 })); };

  const searchFields = [
    { type: 'input' as const, label: '报告编号', name: 'reportNo', placeholder: '请输入报告编号' },
    { type: 'input' as const, label: '报告名称', name: 'reportName', placeholder: '请输入报告名称' },
    { type: 'select' as const, label: '状态', name: 'status', options: [{ label: '草稿', value: '草稿' }, { label: '待审批', value: '待审批' }, { label: '已审批', value: '已审批' }] },
  ];
  const columns = [
    { title: '序号', key: 'index', width: 60, render: (_: any, __: any, i: number) => i + 1 },
    { title: '报告编号', dataIndex: 'reportNo', key: 'reportNo', width: 120 },
    { title: '报告名称', dataIndex: 'reportName', key: 'reportName' },
    { title: '评审日期', dataIndex: 'reviewDate', key: 'reviewDate', width: 120 },
    { title: '评审结论', dataIndex: 'reviewConclusion', key: 'reviewConclusion', ellipsis: true },
    { title: '责任人', dataIndex: 'responsiblePerson', key: 'responsiblePerson', width: 100 },
    { title: '批准人', dataIndex: 'approver', key: 'approver', width: 100 },
    { title: '状态', dataIndex: 'status', key: 'status', width: 100, render: (s: string) => <Tag color={{ '草稿': 'default', '待审批': 'processing', '已审批': 'success' }[s]}>{s}</Tag> },
  ];
  const si = (pagination.current - 1) * pagination.pageSize;
  const pd = filteredData.slice(si, si + pagination.pageSize);
  return (
    <div>
      <PageHeader breadcrumbs={[{ title: '首页', path: '/' }, { title: '管理评审管理' }, { title: '管理评审报告' }]} />
      <Card style={{ marginBottom: 16 }}><Row gutter={16}>
        <Col span={8}><Statistic title="报告总数" value={data.length} prefix={<FileTextOutlined />} /></Col>
        <Col span={8}><Statistic title="待审批" value={data.filter(i => i.status === '待审批').length} prefix={<ClockCircleOutlined />} valueStyle={{ color: '#faad14' }} /></Col>
        <Col span={8}><Statistic title="已审批" value={data.filter(i => i.status === '已审批').length} prefix={<CheckCircleOutlined />} valueStyle={{ color: '#52c41a' }} /></Col>
      </Row></Card>
      <SearchForm fields={searchFields} onSearch={handleSearch} onReset={handleReset} />
      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <Space><Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增评审报告</Button></Space>
          <Space><Button icon={<DeleteOutlined />} onClick={handleBatchDelete} disabled={!selectedRows.length}>删除</Button></Space>
        </div>
        <DataTable columns={columns} dataSource={pd} loading={loading} pagination={{ ...pagination, onChange: handlePageChange }} onView={handleView} onEdit={handleEdit} onDelete={handleDelete} rowSelection={{ selectedRowKeys: selectedRows.map(r => r.id), onChange: (_: any, rows: any) => setSelectedRows(rows) }} />
      </Card>
      <ReportForm visible={modalVisible} record={editingRecord} mode={modalMode} onCancel={() => setModalVisible(false)} onSave={handleSave} />
    </div>
  );
};
export default ReviewReportPage;
