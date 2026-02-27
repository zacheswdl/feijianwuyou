import React, { useState, useEffect, useCallback } from 'react';
import { Card, Row, Col, Button, message } from 'antd';
import { DownloadOutlined, FileTextOutlined, FileSearchOutlined, CheckCircleOutlined, SolutionOutlined, AuditOutlined } from '@ant-design/icons';
import PageHeader from '../../../components/Common/PageHeader';
import type { ReviewAnnualPlanRecord, ReviewImplementationRecord, ReviewInputRecord, ReviewMeetingRecord, ReviewReportRecord } from '../../../types/index';
import { loadData, MODULE_KEYS } from '../../../utils/storage';

const ReviewDownloadPage: React.FC = () => {
  const [annualPlans, setAnnualPlans] = useState<ReviewAnnualPlanRecord[]>([]);
  const [implementations, setImplementations] = useState<ReviewImplementationRecord[]>([]);
  const [inputs, setInputs] = useState<ReviewInputRecord[]>([]);
  const [meetings, setMeetings] = useState<ReviewMeetingRecord[]>([]);
  const [reports, setReports] = useState<ReviewReportRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const loadAllData = useCallback(async () => {
    setLoading(true);
    const [ap, impl, inp, mtg, rpt] = await Promise.all([
      loadData<ReviewAnnualPlanRecord>(MODULE_KEYS.REVIEW_ANNUAL_PLAN),
      loadData<ReviewImplementationRecord>(MODULE_KEYS.REVIEW_IMPLEMENTATION),
      loadData<ReviewInputRecord>(MODULE_KEYS.REVIEW_INPUT),
      loadData<ReviewMeetingRecord>(MODULE_KEYS.REVIEW_MEETING),
      loadData<ReviewReportRecord>(MODULE_KEYS.REVIEW_REPORT),
    ]);
    setAnnualPlans(ap); setImplementations(impl); setInputs(inp);
    setMeetings(mtg); setReports(rpt);
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
      title: '管理评审年度计划', icon: <FileTextOutlined style={{ fontSize: 24, color: '#1890ff' }} />, count: annualPlans.length,
      onDownload: () => exportToCSV(annualPlans, '管理评审年度计划', [
        { key: 'planName', title: '计划名称' }, { key: 'planYear', title: '年度' },
        { key: 'reviewObjective', title: '评审目的' }, { key: 'reviewScope', title: '评审范围' },
        { key: 'plannedDate', title: '计划日期' }, { key: 'organizer', title: '组织者' },
        { key: 'participants', title: '参加人员' }, { key: 'status', title: '状态' }, { key: 'remark', title: '备注' },
      ]),
    },
    {
      title: '管理评审实施计划', icon: <FileSearchOutlined style={{ fontSize: 24, color: '#722ed1' }} />, count: implementations.length,
      onDownload: () => exportToCSV(implementations, '管理评审实施计划', [
        { key: 'planName', title: '计划名称' }, { key: 'reviewDate', title: '评审日期' },
        { key: 'reviewLocation', title: '评审地点' }, { key: 'chairperson', title: '主持人' },
        { key: 'participants', title: '参加人员' }, { key: 'reviewItems', title: '评审事项' },
        { key: 'preparationRequirements', title: '准备要求' }, { key: 'status', title: '状态' }, { key: 'remark', title: '备注' },
      ]),
    },
    {
      title: '管理评审输入材料', icon: <SolutionOutlined style={{ fontSize: 24, color: '#13c2c2' }} />, count: inputs.length,
      onDownload: () => exportToCSV(inputs, '管理评审输入材料', [
        { key: 'materialName', title: '材料名称' }, { key: 'materialType', title: '材料类型' },
        { key: 'submitDate', title: '提交日期' }, { key: 'submitter', title: '提交人' },
        { key: 'department', title: '部门' }, { key: 'materialContent', title: '材料内容' },
        { key: 'status', title: '状态' }, { key: 'remark', title: '备注' },
      ]),
    },
    {
      title: '管理评审会议记录', icon: <AuditOutlined style={{ fontSize: 24, color: '#faad14' }} />, count: meetings.length,
      onDownload: () => exportToCSV(meetings, '管理评审会议记录', [
        { key: 'meetingNo', title: '会议编号' }, { key: 'meetingDate', title: '会议日期' },
        { key: 'meetingLocation', title: '会议地点' }, { key: 'chairperson', title: '主持人' },
        { key: 'attendees', title: '出席人员' }, { key: 'meetingContent', title: '会议内容' },
        { key: 'decisions', title: '会议决议' }, { key: 'actionItems', title: '行动项' },
        { key: 'recorder', title: '记录人' }, { key: 'remark', title: '备注' },
      ]),
    },
    {
      title: '管理评审报告', icon: <CheckCircleOutlined style={{ fontSize: 24, color: '#52c41a' }} />, count: reports.length,
      onDownload: () => exportToCSV(reports, '管理评审报告', [
        { key: 'reportNo', title: '报告编号' }, { key: 'reportName', title: '报告名称' },
        { key: 'reviewDate', title: '评审日期' }, { key: 'reviewConclusion', title: '评审结论' },
        { key: 'improvementMeasures', title: '改进措施' }, { key: 'resourceRequirements', title: '资源需求' },
        { key: 'responsiblePerson', title: '责任人' }, { key: 'completionDate', title: '完成日期' },
        { key: 'approver', title: '批准人' }, { key: 'approveDate', title: '批准日期' },
        { key: 'status', title: '状态' }, { key: 'remark', title: '备注' },
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
      <PageHeader breadcrumbs={[{ title: '首页', path: '/' }, { title: '管理评审管理' }, { title: '管理评审记录下载' }]} />

      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ margin: 0 }}>管理评审记录下载中心</h3>
          <Button type="primary" icon={<DownloadOutlined />} onClick={handleDownloadAll}>
            一键导出全部
          </Button>
        </div>
        <p style={{ color: '#999', marginBottom: 0 }}>选择需要下载的管理评审记录类型，系统将导出CSV格式文件，可使用Excel打开。</p>
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

export default ReviewDownloadPage;
