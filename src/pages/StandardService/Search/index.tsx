import React, { useState, useEffect, useCallback } from 'react';
import { Card, Row, Col, Statistic, Button, Space, Tag, message, Modal } from 'antd';
import { FileTextOutlined, CheckCircleOutlined, ClockCircleOutlined, StopOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import PageHeader from '../../../components/Common/PageHeader';
import SearchForm from '../../../components/Common/SearchForm';
import DataTable from '../../../components/Common/DataTable';
import StandardSearchForm from './SearchForm';
import type { StandardSearchRecord } from '../../../types/index';
import { loadData, saveData, MODULE_KEYS } from '../../../utils/storage';

const StandardSearchPage: React.FC = () => {
  const [data, setData] = useState<StandardSearchRecord[]>([]); const [filteredData, setFilteredData] = useState<StandardSearchRecord[]>([]);
  const [loading, setLoading] = useState(false); const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<StandardSearchRecord | null>(null);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view'>('add');
  const [selectedRows, setSelectedRows] = useState<StandardSearchRecord[]>([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  const loadTableData = useCallback(async () => { setLoading(true); const result = await loadData<StandardSearchRecord>(MODULE_KEYS.STANDARD_SEARCH); setData(result); setFilteredData(result); setPagination(prev => ({ ...prev, total: result.length })); setLoading(false); }, []);
  useEffect(() => { loadTableData(); }, [loadTableData]);

  const handleSearch = (values: any) => { let r = [...data]; if (values.standardNo) r = r.filter(i => i.standardNo.includes(values.standardNo)); if (values.standardName) r = r.filter(i => i.standardName.includes(values.standardName)); if (values.standardStatus) r = r.filter(i => i.standardStatus === values.standardStatus); setFilteredData(r); setPagination(p => ({ ...p, current: 1, total: r.length })); };
  const handleReset = () => { setFilteredData(data); setPagination(p => ({ ...p, current: 1, total: data.length })); };
  const handleAdd = () => { setEditingRecord(null); setModalMode('add'); setModalVisible(true); };
  const handleEdit = (r: StandardSearchRecord) => { setEditingRecord(r); setModalMode('edit'); setModalVisible(true); };
  const handleView = (r: StandardSearchRecord) => { setEditingRecord(r); setModalMode('view'); setModalVisible(true); };
  const handleDelete = (record: StandardSearchRecord) => { Modal.confirm({ title: '确认删除', content: `确定要删除"${record.standardName}"吗？`, onOk: () => { const nd = data.filter(i => i.id !== record.id); saveData(MODULE_KEYS.STANDARD_SEARCH, nd); setData(nd); setFilteredData(nd); setPagination(p => ({ ...p, total: nd.length })); message.success('删除成功'); } }); };
  const handleBatchDelete = () => { if (!selectedRows.length) { message.warning('请先选择记录'); return; } Modal.confirm({ title: '确认批量删除', content: `确定要删除选中的 ${selectedRows.length} 条记录吗？`, onOk: () => { const ids = selectedRows.map(i => i.id); const nd = data.filter(i => !ids.includes(i.id)); saveData(MODULE_KEYS.STANDARD_SEARCH, nd); setData(nd); setFilteredData(nd); setSelectedRows([]); setPagination(p => ({ ...p, total: nd.length })); message.success('批量删除成功'); } }); };
  const handleSave = (values: any) => { if (modalMode === 'add') { const nr = { id: Date.now().toString(), ...values }; const nd = [nr, ...data]; saveData(MODULE_KEYS.STANDARD_SEARCH, nd); setData(nd); setFilteredData(nd); setPagination(p => ({ ...p, total: nd.length })); message.success('新增成功'); } else if (modalMode === 'edit' && editingRecord) { const nd = data.map(i => i.id === editingRecord.id ? { ...i, ...values } : i); saveData(MODULE_KEYS.STANDARD_SEARCH, nd); setData(nd); setFilteredData(nd); message.success('修改成功'); } setModalVisible(false); };
  const handlePageChange = (page: number, pageSize?: number) => { setPagination(p => ({ ...p, current: page, pageSize: pageSize || 10 })); };

  const searchFields = [
    { type: 'input' as const, label: '标准编号', name: 'standardNo', placeholder: '请输入标准编号' },
    { type: 'input' as const, label: '标准名称', name: 'standardName', placeholder: '请输入标准名称' },
    { type: 'select' as const, label: '标准状态', name: 'standardStatus', options: [{ label: '现行', value: '现行' }, { label: '即将实施', value: '即将实施' }, { label: '已废止', value: '已废止' }, { label: '被替代', value: '被替代' }] },
  ];
  const columns = [
    { title: '序号', key: 'index', width: 60, render: (_: any, __: any, i: number) => i + 1 },
    { title: '标准编号', dataIndex: 'standardNo', key: 'standardNo', width: 140 },
    { title: '标准名称', dataIndex: 'standardName', key: 'standardName' },
    { title: '发布日期', dataIndex: 'publishDate', key: 'publishDate', width: 120 },
    { title: '实施日期', dataIndex: 'implementDate', key: 'implementDate', width: 120 },
    { title: '标准状态', dataIndex: 'standardStatus', key: 'standardStatus', width: 100, render: (s: string) => <Tag color={{ '现行': 'success', '即将实施': 'processing', '已废止': 'error', '被替代': 'warning' }[s]}>{s}</Tag> },
    { title: '查新人', dataIndex: 'searcher', key: 'searcher', width: 100 },
    { title: '部门', dataIndex: 'department', key: 'department', width: 100 },
  ];
  const si = (pagination.current - 1) * pagination.pageSize;
  const pd = filteredData.slice(si, si + pagination.pageSize);
  return (
    <div>
      <PageHeader breadcrumbs={[{ title: '首页', path: '/' }, { title: '标准服务' }, { title: '标准查新' }]} />
      <Card style={{ marginBottom: 16 }}><Row gutter={16}>
        <Col span={6}><Statistic title="标准总数" value={data.length} prefix={<FileTextOutlined />} /></Col>
        <Col span={6}><Statistic title="现行" value={data.filter(i => i.standardStatus === '现行').length} prefix={<CheckCircleOutlined />} valueStyle={{ color: '#52c41a' }} /></Col>
        <Col span={6}><Statistic title="即将实施" value={data.filter(i => i.standardStatus === '即将实施').length} prefix={<ClockCircleOutlined />} valueStyle={{ color: '#1890ff' }} /></Col>
        <Col span={6}><Statistic title="已废止" value={data.filter(i => i.standardStatus === '已废止').length} prefix={<StopOutlined />} valueStyle={{ color: '#ff4d4f' }} /></Col>
      </Row></Card>
      <SearchForm fields={searchFields} onSearch={handleSearch} onReset={handleReset} />
      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <Space><Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增标准查新</Button></Space>
          <Space><Button icon={<DeleteOutlined />} onClick={handleBatchDelete} disabled={!selectedRows.length}>删除</Button></Space>
        </div>
        <DataTable columns={columns} dataSource={pd} loading={loading} pagination={{ ...pagination, onChange: handlePageChange }} onView={handleView} onEdit={handleEdit} onDelete={handleDelete} rowSelection={{ selectedRowKeys: selectedRows.map(r => r.id), onChange: (_: any, rows: any) => setSelectedRows(rows) }} />
      </Card>
      <StandardSearchForm visible={modalVisible} record={editingRecord} mode={modalMode} onCancel={() => setModalVisible(false)} onSave={handleSave} />
    </div>
  );
};
export default StandardSearchPage;
