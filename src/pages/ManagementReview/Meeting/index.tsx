import React, { useState, useEffect, useCallback } from 'react';
import { Card, Row, Col, Statistic, Button, Space, Tag, message, Modal } from 'antd';
import { FileTextOutlined, CalendarOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import PageHeader from '../../../components/Common/PageHeader';
import SearchForm from '../../../components/Common/SearchForm';
import DataTable from '../../../components/Common/DataTable';
import MeetingForm from './MeetingForm';
import type { ReviewMeetingRecord } from '../../../types/index';
import { loadData, saveData, MODULE_KEYS } from '../../../utils/storage';
import dayjs from 'dayjs';

const ReviewMeetingPage: React.FC = () => {
  const [data, setData] = useState<ReviewMeetingRecord[]>([]); const [filteredData, setFilteredData] = useState<ReviewMeetingRecord[]>([]);
  const [loading, setLoading] = useState(false); const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ReviewMeetingRecord | null>(null);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view'>('add');
  const [selectedRows, setSelectedRows] = useState<ReviewMeetingRecord[]>([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  const loadTableData = useCallback(async () => { setLoading(true); const result = await loadData<ReviewMeetingRecord>(MODULE_KEYS.REVIEW_MEETING); setData(result); setFilteredData(result); setPagination(prev => ({ ...prev, total: result.length })); setLoading(false); }, []);
  useEffect(() => { loadTableData(); }, [loadTableData]);

  const handleSearch = (values: any) => { let r = [...data]; if (values.meetingNo) r = r.filter(i => i.meetingNo.includes(values.meetingNo)); if (values.chairperson) r = r.filter(i => i.chairperson.includes(values.chairperson)); if (values.recorder) r = r.filter(i => i.recorder.includes(values.recorder)); setFilteredData(r); setPagination(p => ({ ...p, current: 1, total: r.length })); };
  const handleReset = () => { setFilteredData(data); setPagination(p => ({ ...p, current: 1, total: data.length })); };
  const handleAdd = () => { setEditingRecord(null); setModalMode('add'); setModalVisible(true); };
  const handleEdit = (r: ReviewMeetingRecord) => { setEditingRecord(r); setModalMode('edit'); setModalVisible(true); };
  const handleView = (r: ReviewMeetingRecord) => { setEditingRecord(r); setModalMode('view'); setModalVisible(true); };
  const handleDelete = (record: ReviewMeetingRecord) => { Modal.confirm({ title: '确认删除', content: `确定要删除"${record.meetingNo}"吗？`, onOk: () => { const nd = data.filter(i => i.id !== record.id); saveData(MODULE_KEYS.REVIEW_MEETING, nd); setData(nd); setFilteredData(nd); setPagination(p => ({ ...p, total: nd.length })); message.success('删除成功'); } }); };
  const handleBatchDelete = () => { if (!selectedRows.length) { message.warning('请先选择记录'); return; } Modal.confirm({ title: '确认批量删除', content: `确定要删除选中的 ${selectedRows.length} 条记录吗？`, onOk: () => { const ids = selectedRows.map(i => i.id); const nd = data.filter(i => !ids.includes(i.id)); saveData(MODULE_KEYS.REVIEW_MEETING, nd); setData(nd); setFilteredData(nd); setSelectedRows([]); setPagination(p => ({ ...p, total: nd.length })); message.success('批量删除成功'); } }); };
  const handleSave = (values: any) => { if (modalMode === 'add') { const nr = { id: Date.now().toString(), ...values }; const nd = [nr, ...data]; saveData(MODULE_KEYS.REVIEW_MEETING, nd); setData(nd); setFilteredData(nd); setPagination(p => ({ ...p, total: nd.length })); message.success('新增成功'); } else if (modalMode === 'edit' && editingRecord) { const nd = data.map(i => i.id === editingRecord.id ? { ...i, ...values } : i); saveData(MODULE_KEYS.REVIEW_MEETING, nd); setData(nd); setFilteredData(nd); message.success('修改成功'); } setModalVisible(false); };
  const handlePageChange = (page: number, pageSize?: number) => { setPagination(p => ({ ...p, current: page, pageSize: pageSize || 10 })); };

  const currentMonth = dayjs().format('YYYY-MM');
  const searchFields = [
    { type: 'input' as const, label: '会议编号', name: 'meetingNo', placeholder: '请输入会议编号' },
    { type: 'input' as const, label: '主持人', name: 'chairperson', placeholder: '请输入主持人' },
    { type: 'input' as const, label: '记录人', name: 'recorder', placeholder: '请输入记录人' },
  ];
  const columns = [
    { title: '序号', key: 'index', width: 60, render: (_: any, __: any, i: number) => i + 1 },
    { title: '会议编号', dataIndex: 'meetingNo', key: 'meetingNo', width: 120 },
    { title: '会议日期', dataIndex: 'meetingDate', key: 'meetingDate', width: 120 },
    { title: '会议地点', dataIndex: 'meetingLocation', key: 'meetingLocation' },
    { title: '主持人', dataIndex: 'chairperson', key: 'chairperson', width: 100 },
    { title: '出席人员', dataIndex: 'attendees', key: 'attendees', ellipsis: true },
    { title: '会议内容', dataIndex: 'meetingContent', key: 'meetingContent', ellipsis: true },
    { title: '记录人', dataIndex: 'recorder', key: 'recorder', width: 100 },
  ];
  const si = (pagination.current - 1) * pagination.pageSize;
  const pd = filteredData.slice(si, si + pagination.pageSize);
  return (
    <div>
      <PageHeader breadcrumbs={[{ title: '首页', path: '/' }, { title: '管理评审管理' }, { title: '管理评审会议记录' }]} />
      <Card style={{ marginBottom: 16 }}><Row gutter={16}>
        <Col span={12}><Statistic title="会议总数" value={data.length} prefix={<FileTextOutlined />} /></Col>
        <Col span={12}><Statistic title="本月会议" value={data.filter(i => i.meetingDate && i.meetingDate.startsWith(currentMonth)).length} prefix={<CalendarOutlined />} valueStyle={{ color: '#1890ff' }} /></Col>
      </Row></Card>
      <SearchForm fields={searchFields} onSearch={handleSearch} onReset={handleReset} />
      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <Space><Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增会议记录</Button></Space>
          <Space><Button icon={<DeleteOutlined />} onClick={handleBatchDelete} disabled={!selectedRows.length}>删除</Button></Space>
        </div>
        <DataTable columns={columns} dataSource={pd} loading={loading} pagination={{ ...pagination, onChange: handlePageChange }} onView={handleView} onEdit={handleEdit} onDelete={handleDelete} rowSelection={{ selectedRowKeys: selectedRows.map(r => r.id), onChange: (_: any, rows: any) => setSelectedRows(rows) }} />
      </Card>
      <MeetingForm visible={modalVisible} record={editingRecord} mode={modalMode} onCancel={() => setModalVisible(false)} onSave={handleSave} />
    </div>
  );
};
export default ReviewMeetingPage;
