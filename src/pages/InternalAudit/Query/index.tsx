import React, { useState, useEffect, useCallback } from 'react';
import { Card, Row, Col, Statistic, Button, Tag, Table, Input, Select, DatePicker, Form } from 'antd';
import { FileSearchOutlined, FileTextOutlined, WarningOutlined, CheckCircleOutlined } from '@ant-design/icons';
import PageHeader from '../../../components/Common/PageHeader';
import type { AuditPlanRecord, AuditNonconformityRecord, AuditChecklistRecord, AuditReportRecord } from '../../../types/index';
import { loadData, MODULE_KEYS } from '../../../utils/storage';

const { RangePicker } = DatePicker;

const AuditQueryPage: React.FC = () => {
  const [plans, setPlans] = useState<AuditPlanRecord[]>([]);
  const [nonconformities, setNonconformities] = useState<AuditNonconformityRecord[]>([]);
  const [checklists, setChecklists] = useState<AuditChecklistRecord[]>([]);
  const [reports, setReports] = useState<AuditReportRecord[]>([]);
  const [activeTab, setActiveTab] = useState<string>('plan');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [loading, setLoading] = useState(false);

  const loadAllData = useCallback(async () => {
    setLoading(true);
    const [planData, ncData, clData, rptData] = await Promise.all([
      loadData<AuditPlanRecord>(MODULE_KEYS.AUDIT_PLAN),
      loadData<AuditNonconformityRecord>(MODULE_KEYS.AUDIT_NONCONFORMITY),
      loadData<AuditChecklistRecord>(MODULE_KEYS.AUDIT_CHECKLIST),
      loadData<AuditReportRecord>(MODULE_KEYS.AUDIT_REPORT),
    ]);
    setPlans(planData); setNonconformities(ncData); setChecklists(clData); setReports(rptData);
    setLoading(false);
  }, []);

  useEffect(() => { loadAllData(); }, [loadAllData]);

  const filterByKeyword = (items: any[], fields: string[]) => {
    if (!searchKeyword) return items;
    return items.filter(item => fields.some(f => item[f]?.toString().toLowerCase().includes(searchKeyword.toLowerCase())));
  };

  const planColumns = [
    { title: '计划名称', dataIndex: 'planName', key: 'planName' },
    { title: '审核年度', dataIndex: 'planYear', key: 'planYear', width: 100 },
    { title: '审核范围', dataIndex: 'auditScope', key: 'auditScope', ellipsis: true },
    { title: '计划日期', dataIndex: 'plannedDate', key: 'plannedDate', width: 120 },
    { title: '审核组长', dataIndex: 'auditLeader', key: 'auditLeader', width: 100 },
    {
      title: '状态', dataIndex: 'status', key: 'status', width: 100,
      render: (s: string) => <Tag color={{ '待执行': 'default', '进行中': 'processing', '已完成': 'success', '已取消': 'error' }[s]}>{s}</Tag>,
    },
  ];

  const ncColumns = [
    { title: '编号', dataIndex: 'nonconformityNo', key: 'nonconformityNo', width: 120 },
    { title: '审核日期', dataIndex: 'auditDate', key: 'auditDate', width: 120 },
    { title: '受审部门', dataIndex: 'auditDepartment', key: 'auditDepartment', width: 120 },
    { title: '类型', dataIndex: 'nonconformityType', key: 'nonconformityType', width: 100,
      render: (t: string) => <Tag color={{ '严重': 'error', '一般': 'warning', '观察项': 'default' }[t]}>{t}</Tag> },
    { title: '描述', dataIndex: 'nonconformityDesc', key: 'nonconformityDesc', ellipsis: true },
    { title: '状态', dataIndex: 'status', key: 'status', width: 100,
      render: (s: string) => <Tag color={{ '待整改': 'error', '整改中': 'processing', '已关闭': 'success' }[s]}>{s}</Tag> },
  ];

  const clColumns = [
    { title: '编号', dataIndex: 'checklistNo', key: 'checklistNo', width: 120 },
    { title: '审核日期', dataIndex: 'auditDate', key: 'auditDate', width: 120 },
    { title: '受审部门', dataIndex: 'auditDepartment', key: 'auditDepartment', width: 120 },
    { title: '审核条款', dataIndex: 'auditClause', key: 'auditClause', width: 130 },
    { title: '检查内容', dataIndex: 'checkContent', key: 'checkContent', ellipsis: true },
    { title: '结果', dataIndex: 'checkResult', key: 'checkResult', width: 100,
      render: (r: string) => <Tag color={{ '符合': 'success', '不符合': 'error', '部分符合': 'warning', '不适用': 'default' }[r]}>{r}</Tag> },
  ];

  const rptColumns = [
    { title: '报告编号', dataIndex: 'reportNo', key: 'reportNo', width: 120 },
    { title: '报告名称', dataIndex: 'reportName', key: 'reportName' },
    { title: '审核日期', dataIndex: 'auditDate', key: 'auditDate', width: 120 },
    { title: '不符合项数', dataIndex: 'nonconformityCount', key: 'nonconformityCount', width: 100 },
    { title: '审核组长', dataIndex: 'auditLeader', key: 'auditLeader', width: 100 },
    { title: '状态', dataIndex: 'status', key: 'status', width: 100,
      render: (s: string) => <Tag color={{ '草稿': 'default', '待审批': 'processing', '已审批': 'success' }[s]}>{s}</Tag> },
  ];

  const tabConfig: Record<string, { data: any[]; columns: any[]; fields: string[]; label: string }> = {
    plan: { data: plans, columns: planColumns, fields: ['planName', 'auditScope', 'auditLeader', 'planYear'], label: '内审计划' },
    nonconformity: { data: nonconformities, columns: ncColumns, fields: ['nonconformityNo', 'auditDepartment', 'nonconformityDesc'], label: '不符合项' },
    checklist: { data: checklists, columns: clColumns, fields: ['checklistNo', 'auditDepartment', 'checkContent', 'auditClause'], label: '检查表' },
    report: { data: reports, columns: rptColumns, fields: ['reportNo', 'reportName', 'auditLeader'], label: '内审报告' },
  };

  const current = tabConfig[activeTab];
  const filteredData = filterByKeyword(current.data, current.fields);

  return (
    <div>
      <PageHeader breadcrumbs={[{ title: '首页', path: '/' }, { title: '内部审核管理' }, { title: '内审记录查询' }]} />
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={6}><Statistic title="内审计划" value={plans.length} prefix={<FileTextOutlined />} /></Col>
          <Col span={6}><Statistic title="不符合项" value={nonconformities.length} prefix={<WarningOutlined />} valueStyle={{ color: nonconformities.length > 0 ? '#ff4d4f' : undefined }} /></Col>
          <Col span={6}><Statistic title="检查记录" value={checklists.length} prefix={<FileSearchOutlined />} /></Col>
          <Col span={6}><Statistic title="内审报告" value={reports.length} prefix={<CheckCircleOutlined />} /></Col>
        </Row>
      </Card>

      <Card>
        <div style={{ marginBottom: 16, display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <Select value={activeTab} onChange={setActiveTab} style={{ width: 160 }}>
            <Select.Option value="plan">内审计划</Select.Option>
            <Select.Option value="nonconformity">不符合项</Select.Option>
            <Select.Option value="checklist">检查表</Select.Option>
            <Select.Option value="report">内审报告</Select.Option>
          </Select>
          <Input.Search
            placeholder={`搜索${current.label}...`}
            value={searchKeyword}
            onChange={e => setSearchKeyword(e.target.value)}
            onSearch={() => {}}
            style={{ width: 300 }}
            allowClear
          />
          <span style={{ color: '#999' }}>共 {filteredData.length} 条记录</span>
        </div>

        <Table
          columns={current.columns}
          dataSource={filteredData}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 10, showSizeChanger: true, showQuickJumper: true, showTotal: (total: number) => `共 ${total} 条` }}
          scroll={{ x: 'max-content' }}
          size="middle"
        />
      </Card>
    </div>
  );
};

export default AuditQueryPage;
