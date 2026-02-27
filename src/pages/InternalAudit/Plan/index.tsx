import React, { useState, useEffect, useCallback } from 'react';
import { Card, Row, Col, Statistic, Button, Space, Tag, message, Modal } from 'antd';
import { FileTextOutlined, ClockCircleOutlined, CheckCircleOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import PageHeader from '../../../components/Common/PageHeader';
import SearchForm from '../../../components/Common/SearchForm';
import DataTable from '../../../components/Common/DataTable';
import PlanForm from './PlanForm';
import type { AuditPlanRecord } from '../../../types/index';
import { loadData, saveData, MODULE_KEYS } from '../../../utils/storage';

const AuditPlanPage: React.FC = () => {
  const [data, setData] = useState<AuditPlanRecord[]>([]);
  const [filteredData, setFilteredData] = useState<AuditPlanRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AuditPlanRecord | null>(null);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view'>('add');
  const [selectedRows, setSelectedRows] = useState<AuditPlanRecord[]>([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  const loadTableData = useCallback(async () => {
    setLoading(true);
    const result = await loadData<AuditPlanRecord>(MODULE_KEYS.AUDIT_PLAN);
    setData(result);
    setFilteredData(result);
    setPagination(prev => ({ ...prev, total: result.length }));
    setLoading(false);
  }, []);

  useEffect(() => { loadTableData(); }, [loadTableData]);

  const handleSearch = (values: any) => {
    let result = [...data];
    if (values.planName) result = result.filter(item => item.planName.includes(values.planName));
    if (values.planYear) result = result.filter(item => item.planYear === values.planYear);
    if (values.status) result = result.filter(item => item.status === values.status);
    if (values.auditLeader) result = result.filter(item => item.auditLeader.includes(values.auditLeader));
    setFilteredData(result);
    setPagination(prev => ({ ...prev, current: 1, total: result.length }));
  };

  const handleReset = () => {
    setFilteredData(data);
    setPagination(prev => ({ ...prev, current: 1, total: data.length }));
  };

  const handleAdd = () => { setEditingRecord(null); setModalMode('add'); setModalVisible(true); };
  const handleEdit = (record: AuditPlanRecord) => { setEditingRecord(record); setModalMode('edit'); setModalVisible(true); };
  const handleView = (record: AuditPlanRecord) => { setEditingRecord(record); setModalMode('view'); setModalVisible(true); };

  const handleDelete = (record: AuditPlanRecord) => {
    Modal.confirm({
      title: '确认删除', content: `确定要删除计划"${record.planName}"吗？`,
      onOk: () => {
        const newData = data.filter(item => item.id !== record.id);
        saveData(MODULE_KEYS.AUDIT_PLAN, newData);
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
        saveData(MODULE_KEYS.AUDIT_PLAN, newData);
        setData(newData); setFilteredData(newData); setSelectedRows([]);
        setPagination(prev => ({ ...prev, total: newData.length }));
        message.success('批量删除成功');
      },
    });
  };

  const handleSave = (values: any) => {
    if (modalMode === 'add') {
      const newRecord: AuditPlanRecord = { id: Date.now().toString(), ...values };
      const newData = [newRecord, ...data];
      saveData(MODULE_KEYS.AUDIT_PLAN, newData);
      setData(newData); setFilteredData(newData);
      setPagination(prev => ({ ...prev, total: newData.length }));
      message.success('新增成功');
    } else if (modalMode === 'edit' && editingRecord) {
      const newData = data.map(item => item.id === editingRecord.id ? { ...item, ...values } : item);
      saveData(MODULE_KEYS.AUDIT_PLAN, newData);
      setData(newData); setFilteredData(newData);
      message.success('修改成功');
    }
    setModalVisible(false);
  };

  const handlePageChange = (page: number, pageSize?: number) => {
    setPagination(prev => ({ ...prev, current: page, pageSize: pageSize || 10 }));
  };

  const searchFields = [
    { type: 'input' as const, label: '计划名称', name: 'planName', placeholder: '请输入计划名称' },
    { type: 'input' as const, label: '审核年度', name: 'planYear', placeholder: '请输入年度' },
    { type: 'select' as const, label: '状态', name: 'status', placeholder: '请选择状态',
      options: [
        { label: '待执行', value: '待执行' }, { label: '进行中', value: '进行中' },
        { label: '已完成', value: '已完成' }, { label: '已取消', value: '已取消' },
      ],
    },
    { type: 'input' as const, label: '审核组长', name: 'auditLeader', placeholder: '请输入审核组长' },
  ];

  const columns = [
    { title: '序号', key: 'index', width: 60, render: (_: any, __: any, index: number) => index + 1 },
    { title: '计划名称', dataIndex: 'planName', key: 'planName' },
    { title: '审核年度', dataIndex: 'planYear', key: 'planYear', width: 100 },
    { title: '审核范围', dataIndex: 'auditScope', key: 'auditScope', ellipsis: true },
    { title: '审核依据', dataIndex: 'auditBasis', key: 'auditBasis', ellipsis: true },
    { title: '计划日期', dataIndex: 'plannedDate', key: 'plannedDate', width: 120 },
    { title: '审核组长', dataIndex: 'auditLeader', key: 'auditLeader', width: 100 },
    { title: '审核成员', dataIndex: 'auditMembers', key: 'auditMembers', ellipsis: true },
    {
      title: '状态', dataIndex: 'status', key: 'status', width: 100,
      render: (status: string) => {
        const colorMap: Record<string, string> = { '待执行': 'default', '进行中': 'processing', '已完成': 'success', '已取消': 'error' };
        return <Tag color={colorMap[status] || 'default'}>{status}</Tag>;
      },
    },
    { title: '备注', dataIndex: 'remark', key: 'remark', ellipsis: true },
  ];

  const startIndex = (pagination.current - 1) * pagination.pageSize;
  const paginatedData = filteredData.slice(startIndex, startIndex + pagination.pageSize);

  return (
    <div>
      <PageHeader breadcrumbs={[{ title: '首页', path: '/' }, { title: '内部审核管理' }, { title: '内审计划管理' }]} />
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={6}><Statistic title="计划总数" value={data.length} prefix={<FileTextOutlined />} /></Col>
          <Col span={6}><Statistic title="待执行" value={data.filter(i => i.status === '待执行').length} prefix={<ClockCircleOutlined />} /></Col>
          <Col span={6}><Statistic title="进行中" value={data.filter(i => i.status === '进行中').length} valueStyle={{ color: '#1890ff' }} /></Col>
          <Col span={6}><Statistic title="已完成" value={data.filter(i => i.status === '已完成').length} prefix={<CheckCircleOutlined />} valueStyle={{ color: '#52c41a' }} /></Col>
        </Row>
      </Card>
      <SearchForm fields={searchFields} onSearch={handleSearch} onReset={handleReset} />
      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增内审计划</Button>
          </Space>
          <Space>
            <Button icon={<DeleteOutlined />} onClick={handleBatchDelete} disabled={selectedRows.length === 0}>删除</Button>
          </Space>
        </div>
        <DataTable
          columns={columns} dataSource={paginatedData} loading={loading}
          pagination={{ ...pagination, onChange: handlePageChange }}
          onView={handleView} onEdit={handleEdit} onDelete={handleDelete}
          rowSelection={{ selectedRowKeys: selectedRows.map(r => r.id), onChange: (_: any, rows: any) => setSelectedRows(rows) }}
        />
      </Card>
      <PlanForm visible={modalVisible} record={editingRecord} mode={modalMode} onCancel={() => setModalVisible(false)} onSave={handleSave} />
    </div>
  );
};

export default AuditPlanPage;
