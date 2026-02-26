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

// 类型别名 - 用于兼容新模块
export type EnvironmentMonitorRecord = EnvironmentMonitor;
export type DeviceMaintenanceRecord = DeviceMaintenance;
export type SoftwareValidationRecord = SoftwareValidation;
export type DataConsistencyRecord = DataConsistency;
export type TypicalReportRecord = TypicalReport;
export type ContractReviewRecord = ContractReview;
export type SatisfactionSurveyRecord = SatisfactionSurvey;
