import React, { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Card,
  Statistic,
  Badge,
  List,
  Typography,
  Progress,
  Button,
  Tag,
  Divider,
} from 'antd';
import {
  ToolOutlined,
  TeamOutlined,
  FileTextOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  RightOutlined,
} from '@ant-design/icons';
import { getData } from '../../utils/storage';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

// 计算距下次检定天数
const calculateDaysToNextVerification = (nextVerificationDate: string): number => {
  if (!nextVerificationDate) return 999;
  const next = dayjs(nextVerificationDate);
  const today = dayjs();
  return next.diff(today, 'day');
};

// 计算有效期剩余天数
const calculateDaysToExpiry = (expiryDate: string): number => {
  if (!expiryDate) return 999;
  const expiry = dayjs(expiryDate);
  const today = dayjs();
  return expiry.diff(today, 'day');
};

// 待办工作
const todoList = [
  { title: '待制定（应于1月10日前完成）2026年度质量控制计划', date: '2026-02-13', status: 'urgent' },
  { title: '待制定（应于1月10日前完成）2026年度设备检定/校准计划', date: '2026-02-13', status: 'urgent' },
  { title: '待制定（应于1月10日前完成）2026年度设备期间核查计划', date: '2026-02-13', status: 'urgent' },
  { title: '待制定（应于1月10日前完成）2026年度质量控制计划', date: '2026-02-13', status: 'urgent' },
];

// 完成工作
const doneList = [
  { title: '已维护汽车环保底盘测功机等3台设备', date: '2023-12-24' },
  { title: '已维护平板制动试验台等2台设备', date: '2023-12-23' },
  { title: '已维护机动车排气流量分析仪等16台设备', date: '2023-12-19' },
  { title: '已维护汽车环保底盘测功机等3台设备', date: '2023-12-18' },
];

// 计划进度
const progressData = [
  { name: '2022年度人员培训计划', progress: 100, total: '12/12' },
  { name: '2023年培训计划表', progress: 58, total: '7/12' },
  { name: '2023年度人员培训计划-补', progress: 30, total: '3/10' },
];

// 快捷入口
const quickLinks = [
  { name: '设备台账', icon: <ToolOutlined />, path: '/equipment/ledger' },
  { name: '设备管理', icon: <ToolOutlined />, path: '/equipment/plan' },
  { name: '供服务方', icon: <TeamOutlined />, path: '/supplier/my-suppliers' },
  { name: '人员档案', icon: <TeamOutlined />, path: '/personnel/archives' },
  { name: '资格确认', icon: <CheckCircleOutlined />, path: '/personnel/qualification' },
  { name: '人员授权', icon: <FileTextOutlined />, path: '/personnel/authorization' },
  { name: '人员任命', icon: <TeamOutlined />, path: '/personnel/appointment' },
  { name: '人员监督', icon: <TeamOutlined />, path: '/personnel/supervision' },
  { name: '人员培训', icon: <TeamOutlined />, path: '/personnel/training' },
  { name: '在线学习', icon: <FileTextOutlined />, path: '/personnel/training' },
];

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [warningData, setWarningData] = useState([
    { title: '逾检设备', value: 0, unit: '台', color: '#ff4d4f', path: '/equipment/ledger' },
    { title: '临检设备', value: 0, unit: '台', color: '#faad14', path: '/equipment/ledger' },
    { title: '临期标准物质', value: 0, unit: '个', color: '#1890ff', path: '/standard-material/ledger' },
    { title: '人员所需补充信息', value: 28, unit: '条', color: '#52c41a', path: '/personnel/archives' },
    { title: '设备期间核查', value: 0, unit: '个', color: '#ff4d4f', path: '/equipment/period-check' },
    { title: '计量结果未确认', value: 0, unit: '条', color: '#faad14', path: '/equipment/calibration' },
  ]);

  useEffect(() => {
    calculateWarningData();
  }, []);

  const calculateWarningData = () => {
    // 1. 逾检设备 - 检测设备台账中距下次检定天数 <= 0
    const deviceLedgerData = getData('equipment_device_ledger') || [];
    const overdueDevices = deviceLedgerData.filter((item: any) => {
      const days = calculateDaysToNextVerification(item.nextVerificationDate);
      return days <= 0;
    }).length;

    // 2. 临检设备 - 检测设备台账中距下次检定天数 <= 60 且 > 0
    const nearDueDevices = deviceLedgerData.filter((item: any) => {
      const days = calculateDaysToNextVerification(item.nextVerificationDate);
      return days > 0 && days <= 60;
    }).length;

    // 3. 临期标准物质 - 标准物质台账中有效期剩余天数 <= 30
    const standardMaterialData = getData('standard_material_ledger') || [];
    const nearExpiryMaterials = standardMaterialData.filter((item: any) => {
      const days = calculateDaysToExpiry(item.validityPeriod);
      return days <= 30;
    }).length;

    // 4. 设备期间核查 - 设备期间核查中状态为"未完成"
    const periodCheckData = getData('equipment_period_check') || [];
    const incompletePeriodChecks = periodCheckData.filter((item: any) => 
      item.status === '未完成'
    ).length;

    // 5. 计量结果未确认 - 检定校准周期和确认中状态为"未完成"
    const calibrationData = getData('equipment_calibration') || [];
    const incompleteCalibrations = calibrationData.filter((item: any) => 
      item.status === '未完成'
    ).length;

    setWarningData(prev => [
      { ...prev[0], value: overdueDevices },
      { ...prev[1], value: nearDueDevices },
      { ...prev[2], value: nearExpiryMaterials },
      { ...prev[3], value: 28 }, // 人员所需补充信息保持固定值
      { ...prev[4], value: incompletePeriodChecks },
      { ...prev[5], value: incompleteCalibrations },
    ]);
  };

  const handleWarningClick = (path: string) => {
    if (path) {
      navigate(path);
    }
  };

  const handleQuickLinkClick = (path: string) => {
    if (path) {
      navigate(path);
    }
  };

  return (
    <div>
      {/* 预警专区 */}
      <Card 
        title={<Title level={4} style={{ margin: 0 }}>预警专区</Title>}
        style={{ marginBottom: 24 }}
      >
        <Row gutter={[16, 16]}>
          {warningData.map((item, index) => (
            <Col xs={12} sm={8} md={6} lg={4} key={index}>
              <Card 
                hoverable 
                style={{ textAlign: 'center', borderRadius: 8, cursor: 'pointer' }}
                styles={{ body: { padding: 16 } }}
                onClick={() => handleWarningClick(item.path)}
              >
                <Statistic
                  title={<Text type="secondary">{item.title}</Text>}
                  value={item.value}
                  suffix={item.unit}
                  styles={{ content: { color: item.color, fontSize: 28, fontWeight: 'bold' } }}
                />
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      {/* 待办工作和完成工作 */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card 
            title={
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <ClockCircleOutlined style={{ color: '#1890ff', marginRight: 8 }} />
                <Title level={5} style={{ margin: 0 }}>待办工作</Title>
              </div>
            }
          >
            <List
              dataSource={todoList}
              renderItem={(item) => (
                <List.Item>
                  <div style={{ display: 'flex', alignItems: 'flex-start', width: '100%' }}>
                    <Badge status="error" style={{ marginTop: 6, marginRight: 8 }} />
                    <div style={{ flex: 1 }}>
                      <Text>{item.title}</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 12 }}>{item.date}</Text>
                    </div>
                    <Tag color="red">紧急</Tag>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card 
            title={
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                <Title level={5} style={{ margin: 0 }}>完成工作</Title>
              </div>
            }
          >
            <List
              dataSource={doneList}
              renderItem={(item) => (
                <List.Item>
                  <div style={{ display: 'flex', alignItems: 'flex-start', width: '100%' }}>
                    <Badge status="success" style={{ marginTop: 6, marginRight: 8 }} />
                    <div style={{ flex: 1 }}>
                      <Text>{item.title}</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 12 }}>{item.date}</Text>
                    </div>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* 计划进度跟踪和快捷入口 */}
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card 
            title={
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <ExclamationCircleOutlined style={{ color: '#faad14', marginRight: 8 }} />
                <Title level={5} style={{ margin: 0 }}>计划进度跟踪</Title>
              </div>
            }
          >
            <List
              dataSource={progressData}
              renderItem={(item) => (
                <List.Item>
                  <div style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <Text>{item.name}</Text>
                      <Text type="secondary">{item.total}</Text>
                    </div>
                    <Progress percent={item.progress} status={item.progress === 100 ? 'success' : 'active'} />
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card 
            title={
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <FileTextOutlined style={{ color: '#1890ff', marginRight: 8 }} />
                <Title level={5} style={{ margin: 0 }}>快捷入口</Title>
              </div>
            }
          >
            <Row gutter={[8, 8]}>
              {quickLinks.map((link, index) => (
                <Col span={12} key={index}>
                  <Button 
                    icon={link.icon} 
                    style={{ width: '100%', textAlign: 'left' }}
                    onClick={() => handleQuickLinkClick(link.path)}
                  >
                    {link.name}
                  </Button>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
