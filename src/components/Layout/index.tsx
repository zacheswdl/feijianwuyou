import React, { useState } from 'react';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SearchOutlined,
  BellOutlined,
  UserOutlined,
  HomeOutlined,
  TeamOutlined,
  ToolOutlined,
  ExperimentOutlined,
  ShopOutlined,
  FileSearchOutlined,
  AuditOutlined,
  ControlOutlined,
  FileOutlined,
  CustomerServiceOutlined,
} from '@ant-design/icons';
import { Layout, Menu, Button, Badge, Input, Avatar, theme } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

const { Header, Sider, Content } = Layout;

// 菜单配置
const menuItems = [
  {
    key: '/',
    icon: <HomeOutlined />,
    label: '首页',
  },
  {
    key: 'personnel',
    icon: <TeamOutlined />,
    label: '人员管理',
    children: [
      { key: '/personnel/archives', label: '人员档案' },
      { key: '/personnel/training', label: '人员培训' },
      { key: '/personnel/qualification', label: '资格确认' },
      { key: '/personnel/appointment', label: '人员任命' },
      { key: '/personnel/authorization', label: '人员授权' },
      { key: '/personnel/supervision', label: '人员监督' },
    ],
  },
  {
    key: 'equipment',
    icon: <ToolOutlined />,
    label: '设备管理',
    children: [
      { key: '/equipment/ledger', label: '检测设备台账' },
      { key: '/equipment/plan', label: '设备计划管理' },
      { key: '/equipment/usage', label: '设备使用记录' },
      { key: '/equipment/consumable-record', label: '设备耗材更换记录' },
      { key: '/equipment/environmental-check', label: '环保设备日常检查' },
      { key: '/equipment/environment-monitor', label: '环境监控记录' },
      { key: '/equipment/device-maintenance', label: '仪器设备维修及维护' },
      { key: '/equipment/period-check', label: '设备期间核查' },
      { key: '/equipment/calibration', label: '检定校准周期和确认' },
    ],
  },
  {
    key: 'standard-material',
    icon: <ExperimentOutlined />,
    label: '标准物质管理',
    children: [
      { key: '/standard-material/ledger', label: '标准物质台账' },
      { key: '/standard-material/inspection', label: '标物核查' },
      { key: '/standard-material/usage', label: '标物使用记录' },
    ],
  },
  {
    key: 'supplier',
    icon: <ShopOutlined />,
    label: '供服务方管理',
    children: [
      { key: '/supplier/my-suppliers', label: '我的供服务方' },
    ],
  },
  {
    key: 'internal-audit',
    icon: <FileSearchOutlined />,
    label: '内部审核管理',
    children: [
      { key: '/internal-audit/plan', label: '内审计划管理' },
      { key: '/internal-audit/implementation', label: '内审实施计划' },
      { key: '/internal-audit/nonconformity', label: '内审不符合项' },
      { key: '/internal-audit/checklist', label: '内审检查表' },
      { key: '/internal-audit/report', label: '内审报告' },
      { key: '/internal-audit/rectification', label: '不符合项整改' },
      { key: '/internal-audit/query', label: '内审记录查询' },
      { key: '/internal-audit/download', label: '内审记录下载' },
    ],
  },
  {
    key: 'management-review',
    icon: <AuditOutlined />,
    label: '管理评审管理',
    children: [
      { key: '/management-review/annual-plan', label: '管理评审年度计划' },
      { key: '/management-review/implementation', label: '管理评审实施计划' },
      { key: '/management-review/input', label: '管理评审输入材料' },
      { key: '/management-review/meeting', label: '管理评审会议记录' },
      { key: '/management-review/report', label: '管理评审报告' },
      { key: '/management-review/download', label: '管理评审记录下载' },
    ],
  },
  {
    key: 'quality-control',
    icon: <ControlOutlined />,
    label: '质量控制管理',
    children: [
      { key: '/quality-control/plan', label: '质量控制计划' },
      { key: '/quality-control/result', label: '质量控制结果' },
    ],
  },

  {
    key: 'standard-service',
    icon: <FileOutlined />,
    label: '标准服务',
    children: [
      { key: '/standard-service/search', label: '标准查新' },
      { key: '/standard-service/subscribe', label: '标准查新订阅' },
    ],
  },
  {
    key: 'customer-service',
    icon: <CustomerServiceOutlined />,
    label: '客户服务',
    children: [
      { key: '/customer-service/satisfaction-survey', label: '顾客满意度调查表' },
      { key: '/customer-service/complaint-record', label: '投诉记录汇总' },
    ],
  },
];

const AppLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        theme="light"
        style={{
          boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
        }}
      >
        <div style={{ 
          height: 64, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          borderBottom: '1px solid #f0f0f0',
          background: '#1890ff',
        }}>
          <h1 style={{ 
            color: '#fff', 
            margin: 0, 
            fontSize: collapsed ? 16 : 18,
            fontWeight: 'bold',
          }}>
            {collapsed ? '质管' : '质量管理系统'}
          </h1>
        </div>
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[location.pathname]}
          defaultOpenKeys={['personnel']}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ borderRight: 0 }}
        />
      </Sider>
      <Layout>
        <Header style={{ 
          padding: '0 24px', 
          background: colorBgContainer,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: 16, width: 64, height: 64 }}
            />
            <Input
              placeholder="请输入搜索内容"
              prefix={<SearchOutlined />}
              style={{ width: 300, marginLeft: 16 }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Badge count={5} size="small">
              <BellOutlined style={{ fontSize: 20, cursor: 'pointer' }} />
            </Badge>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Avatar icon={<UserOutlined />} />
              <span>管理员</span>
            </div>
          </div>
        </Header>
        <Content
          style={{
            margin: 24,
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
