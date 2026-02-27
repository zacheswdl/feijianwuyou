import React, { useState, useEffect, useCallback } from 'react';
import { Card, Row, Col, Statistic, Button, Table, Tag, message, Select } from 'antd';
import { DownloadOutlined, FileTextOutlined, WarningOutlined, FileSearchOutlined, CheckCircleOutlined } from '@ant-design/icons';
import PageHeader from '../../../components/Common/PageHeader';
import type { AuditPlanRecord, AuditNonconformityRecord, AuditChecklistRecord, AuditReportRecord, AuditRectificationRecord, AuditImplementationRecord } from '../../../types/index';
import { loadData, MODULE_KEYS } from '../../../utils/storage';

const AuditDownloadPage: React.FC = () => {
  const [plans, setPlans] = useState<AuditPlanRecord[]>([]);
  const [implementations, setImplementations] = useState<AuditImplementationRecord[]>([]);
  const [nonconformities, setNonconformities] = useState<AuditNonconformityRecord[]>([]);
  const [checklists, setChecklists] = useState<AuditChecklistRecord[]>([]);
  const [reports, setReports] = useState<AuditReportRecord[]>([]);
  const [rectifications, setRectifications] = useState<AuditRectificationRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const loadAllData = useCallback(async () => {
    setLoading(true);
    const [p, impl, nc, cl, rpt, rect] = await Promise.all([
      loadData<AuditPlanRecord>(MODULE_KEYS.AUDIT_PLAN),
      loadData<AuditImplementationRecord>(MODULE_KEYS.AUDIT_IMPLEMENTATION),
      loadData<AuditNonconformityRecord>(MODULE_KEYS.AUDIT_NONCONFORMITY),
      loadData<AuditChecklistRecord>(MODULE_KEYS.AUDIT_CHECKLIST),
      loadData<AuditReportRecord>(MODULE_KEYS.AUDIT_REPORT),
      loadData<AuditRectificationRecord>(MODULE_KEYS.AUDIT_RECTIFICATION),
    ]);
    setPlans(p); setImplementations(impl); setNonconformities(nc);
    setChecklists(cl); setReports(rpt); setRectifications(rect);
    setLoading(false);
  }, []);

  useEffect(() => { loadAllData(); }, [loadAllData]);

  const exportToCSV = (data: any[], filename: string, headers: { key: string; title: string }[]) => {
    if (data.length === 0) {
      message.warning('没有数据可导出');
      return;
    }
    const BOM = '\uFEFF';
    const headerRow = headers.map(h => h.title).join(',');
    const rows = data.map(item =>
      headers.map(h => {
        const val = item[h.key] ?? '';
        return `"${String(val).replace(/"/g, '""')}"`;
      }).join(',')
    );
    const csv = BOM + [headerRow, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    message.success(`${filename} 导出成功`);
  };

  const downloadItems = [
    {
      title: '内审计划', icon: <FileTextOutlined style={{ fontSize: 24, color: '#1890ff' }} />, count: plans.length,
      onDownload: () => exportToCSV(plans, '内审计划', [
        { key: 'planName', title: '计划名称' }, { key: 'planYear', title: '审核年度' },
        { key: 'auditScope', title: '审核范围' }, { key: 'auditBasis', title: '审核依据' },
        { key: 'plannedDate', title: '计划日期' }, { key: 'auditLeader', title: '审核组长' },
        { key: 'auditMembers', title: '审核成员' }, { key: 'status', title: '状态' }, { key: 'remark', title: '备注' },
      ]),
    },
    {
      title: '内审实施计划', icon: <FileSearchOutlined style={{ fontSize: 24, color: '#722ed1' }} />, count: implementations.length,
      onDownload: () => exportToCSV(implementations, '内审实施计划', [
        { key: 'planName', title: '关联计划' }, { key: 'auditDate', title: '审核日期' },
        { key: 'auditDepartment', title: '受审部门' }, { key: 'auditClause', title: '审核条款' },
        { key: 'auditMethod', title: '审核方法' }, { key: 'auditor', title: '审核员' },
        { key: 'auditee', title: '被审核人' }, { key: 'status', title: '状态' },
      ]),
    },
    {
      title: '不符合项记录', icon: <WarningOutlined style={{ fontSize: 24, color: '#ff4d4f' }} />, count: nonconformities.length,
      onDownload: () => exportToCSV(nonconformities, '不符合项记录', [
        { key: 'nonconformityNo', title: '编号' }, { key: 'auditDate', title: '审核日期' },
        { key: 'auditDepartment', title: '受审部门' }, { key: 'auditClause', title: '不符合条款' },
        { key: 'nonconformityType', title: '类型' }, { key: 'nonconformityDesc', title: '描述' },
        { key: 'responsiblePerson', title: '责任人' }, { key: 'deadline', title: '整改期限' }, { key: 'status', title: '状态' },
      ]),
    },
    {
      title: '内审检查表', icon: <FileSearchOutlined style={{ fontSize: 24, color: '#13c2c2' }} />, count: checklists.length,
      onDownload: () => exportToCSV(checklists, '内审检查表', [
        { key: 'checklistNo', title: '编号' }, { key: 'auditDate', title: '审核日期' },
        { key: 'auditDepartment', title: '受审部门' }, { key: 'auditClause', title: '审核条款' },
        { key: 'checkContent', title: '检查内容' }, { key: 'checkMethod', title: '检查方法' },
        { key: 'checkResult', title: '检查结果' }, { key: 'auditor', title: '审核员' }, { key: 'evidence', title: '审核证据' },
      ]),
    },
    {
      title: '内审报告', icon: <CheckCircleOutlined style={{ fontSize: 24, color: '#52c41a' }} />, count: reports.length,
      onDownload: () => exportToCSV(reports, '内审报告', [
        { key: 'reportNo', title: '报告编号' }, { key: 'reportName', title: '报告名称' },
        { key: 'auditDate', title: '审核日期' }, { key: 'auditScope', title: '审核范围' },
        { key: 'auditConclusion', title: '审核结论' }, { key: 'nonconformityCount', title: '不符合项数' },
        { key: 'observationCount', title: '观察项数' }, { key: 'auditLeader', title: '审核组长' },
        { key: 'approver', title: '批准人' }, { key: 'status', title: '状态' },
      ]),
    },
    {
      title: '整改记录', icon: <WarningOutlined style={{ fontSize: 24, color: '#faad14' }} />, count: rectifications.length,
      onDownload: () => exportToCSV(rectifications, '整改记录', [
        { key: 'nonconformityNo', title: '不符合项编号' }, { key: 'nonconformityDesc', title: '描述' },
        { key: 'responsiblePerson', title: '责任人' }, { key: 'rectificationMeasure', title: '整改措施' },
        { key: 'rectificationDate', title: '整改日期' }, { key: 'verifier', title: '验证人' },
        { key: 'verifyDate', title: '验证日期' }, { key: 'verifyResult', title: '验证结果' }, { key: 'status', title: '状态' },
      ]),
    },
  ];

  const handleDownloadAll = () => {
    downloadItems.forEach(item => {
      if (item.count > 0) item.onDownload();
    });
  };

  return (
    <div>
      <PageHeader breadcrumbs={[{ title: '首页', path: '/' }, { title: '内部审核管理' }, { title: '内审记录下载' }]} />

      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ margin: 0 }}>内审记录下载中心</h3>
          <Button type="primary" icon={<DownloadOutlined />} onClick={handleDownloadAll}>
            一键导出全部
          </Button>
        </div>
        <p style={{ color: '#999', marginBottom: 0 }}>选择需要下载的内审记录类型，系统将导出CSV格式文件，可使用Excel打开。</p>
      </Card>

      <Row gutter={[16, 16]}>
        {downloadItems.map((item, index) => (
          <Col span={8} key={index}>
            <Card hoverable>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {item.icon}
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: 16 }}>{item.title}</div>
                    <div style={{ color: '#999', fontSize: 13 }}>共 {item.count} 条记录</div>
                  </div>
                </div>
                <Button
                  type="primary"
                  icon={<DownloadOutlined />}
                  onClick={item.onDownload}
                  disabled={item.count === 0}
                >
                  导出
                </Button>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default AuditDownloadPage;
