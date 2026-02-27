// 搜索字段类型
export interface SearchField {
  name: string;
  label: string;
  type: 'input' | 'select' | 'dateRange';
  options?: { label: string; value: string }[];
  placeholder?: string;
}

// 分页类型
export interface PaginationParams {
  current: number;
  pageSize: number;
  total: number;
}

// 通用列表项类型
export interface ListItem {
  id: string;
  createTime?: string;
  updateTime?: string;
  [key: string]: any;
}

// 环境监控记录
export interface EnvironmentMonitor {
  id: string;
  monitorDate: string;
  monitorItem: string;
  location: string;
  standardValue: string;
  actualValue: string;
  unit: string;
  result: 'normal' | 'abnormal';
  monitorPerson: string;
  remark?: string;
  createTime?: string;
}

// 设备维修维护
export interface DeviceMaintenance {
  id: string;
  deviceName: string;
  deviceNo: string;
  maintenanceType: string;
  maintenanceDate: string;
  maintenanceContent: string;
  maintenanceResult: string;
  maintenancePerson: string;
  remark?: string;
  createTime?: string;
}

// 软件适用性确认
export interface SoftwareValidation {
  id: string;
  softwareName: string;
  version: string;
  validationDate: string;
  validationContent: string;
  validationResult: 'passed' | 'failed' | 'pending';
  validator: string;
  remark?: string;
  createTime?: string;
}

// 数据一致性检查
export interface DataConsistency {
  id: string;
  checkDate: string;
  checkItem: string;
  originalData: string;
  systemData: string;
  checkResult: 'consistent' | 'inconsistent';
  differenceDesc?: string;
  checker: string;
  remark?: string;
  createTime?: string;
}

// 典型报告
export interface TypicalReport {
  id: string;
  reportCode: string;
  reportName: string;
  reportType: 'test' | 'calibration' | 'review' | 'other';
  createDate: string;
  reportContent: string;
  creator: string;
  status: 'draft' | 'pending' | 'approved';
  remark?: string;
  createTime?: string;
}

// 合同评审记录
export interface ContractReview {
  id: string;
  contractNo: string;
  customerName: string;
  testItems: string;
  reviewDate: string;
  reviewContent: string;
  reviewResult: '通过' | '不通过' | '需修改';
  reviewer: string;
  remark?: string;
  createTime?: string;
}

// 顾客满意度调查
export interface SatisfactionSurvey {
  id: string;
  surveyDate: string;
  customerName: string;
  contactPhone: string;
  surveyMethod: string;
  satisfactionScore: number;
  serviceAttitude: number;
  serviceEfficiency: number;
  serviceQuality: number;
  overallEvaluation: string;
  suggestions?: string;
  surveyPerson: string;
  remark?: string;
  createTime?: string;
}

// 投诉记录
export interface ComplaintRecord {
  id: string;
  complaintDate: string;
  customerName: string;
  contactPerson?: string;
  contactPhone: string;
  complaintType: string;
  complaintContent: string;
  handleStatus: string;
  handler?: string;
  handleDate?: string;
  handleResult?: string;
  remark?: string;
  createTime?: string;
}

// 内审计划
export interface AuditPlan {
  id: string;
  planName: string;
  planYear: string;
  auditScope: string;
  auditBasis: string;
  plannedDate: string;
  auditLeader: string;
  auditMembers: string;
  status: '待执行' | '进行中' | '已完成' | '已取消';
  remark?: string;
  createTime?: string;
}

// 内审实施计划
export interface AuditImplementation {
  id: string;
  planId: string;
  planName: string;
  auditDate: string;
  auditDepartment: string;
  auditClause: string;
  auditMethod: string;
  auditor: string;
  auditee: string;
  status: '待审核' | '审核中' | '已完成';
  remark?: string;
  createTime?: string;
}

// 内审不符合项
export interface AuditNonconformity {
  id: string;
  nonconformityNo: string;
  auditDate: string;
  auditDepartment: string;
  auditClause: string;
  nonconformityType: '严重' | '一般' | '观察项';
  nonconformityDesc: string;
  correctionRequirement: string;
  responsiblePerson: string;
  deadline: string;
  status: '待整改' | '整改中' | '已关闭';
  auditor: string;
  remark?: string;
  createTime?: string;
}

// 内审检查表
export interface AuditChecklist {
  id: string;
  checklistNo: string;
  auditDate: string;
  auditDepartment: string;
  auditClause: string;
  checkContent: string;
  checkMethod: string;
  checkResult: '符合' | '不符合' | '部分符合' | '不适用';
  auditor: string;
  evidence?: string;
  remark?: string;
  createTime?: string;
}

// 内审报告
export interface AuditReport {
  id: string;
  reportNo: string;
  reportName: string;
  auditDate: string;
  auditScope: string;
  auditBasis: string;
  auditConclusion: string;
  nonconformityCount: number;
  observationCount: number;
  auditLeader: string;
  approver: string;
  approveDate: string;
  status: '草稿' | '待审批' | '已审批';
  remark?: string;
  createTime?: string;
}

// 不符合项整改
export interface AuditRectification {
  id: string;
  nonconformityNo: string;
  nonconformityDesc: string;
  responsiblePerson: string;
  rectificationMeasure: string;
  rectificationDate: string;
  verifier: string;
  verifyDate: string;
  verifyResult: '通过' | '不通过' | '待验证';
  status: '待整改' | '已整改' | '已验证';
  remark?: string;
  createTime?: string;
}

// 类型别名 - 用于兼容新模块
export type EnvironmentMonitorRecord = EnvironmentMonitor;
export type DeviceMaintenanceRecord = DeviceMaintenance;
export type SoftwareValidationRecord = SoftwareValidation;
export type DataConsistencyRecord = DataConsistency;
export type TypicalReportRecord = TypicalReport;
export type ContractReviewRecord = ContractReview;
export type SatisfactionSurveyRecord = SatisfactionSurvey;
export type AuditPlanRecord = AuditPlan;
export type AuditImplementationRecord = AuditImplementation;
export type AuditNonconformityRecord = AuditNonconformity;
export type AuditChecklistRecord = AuditChecklist;
export type AuditReportRecord = AuditReport;
export type AuditRectificationRecord = AuditRectification;
