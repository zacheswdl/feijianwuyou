import React from 'react';
import { Layout, Menu } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import { HomeOutlined, BookOutlined, FormOutlined, FileSearchOutlined, StarOutlined, SettingOutlined } from '@ant-design/icons';

const { Content, Sider } = Layout;

const QuizLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  const menuItems = [
    {
      key: 'home',
      icon: <HomeOutlined />,
      label: <Link to="/">首页</Link>
    },
    {
      key: 'practice',
      icon: <BookOutlined />,
      label: <Link to="/practice">练习模式</Link>
    },
    {
      key: 'exam',
      icon: <FormOutlined />,
      label: <Link to="/exam">模拟考试</Link>
    },
    {
      key: 'error-book',
      icon: <FileSearchOutlined />,
      label: <Link to="/error-book">错题本</Link>
    },
    {
      key: 'favorites',
      icon: <StarOutlined />,
      label: <Link to="/favorites">收藏夹</Link>
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: <Link to="/settings">设置</Link>
    }
  ];

  // 根据当前路径确定选中的菜单项
  const getSelectedKey = () => {
    const path = location.pathname;
    if (path.includes('/practice')) return 'practice';
    if (path.includes('/exam')) return 'exam';
    if (path.includes('/error-book')) return 'error-book';
    if (path.includes('/favorites')) return 'favorites';
    if (path.includes('/settings')) return 'settings';
    return 'home';
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={200} style={{ background: '#fff' }}>
        <div style={{ height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 'bold', color: '#1890ff' }}>
          刷题助手
        </div>
        <Menu
          mode="inline"
          selectedKeys={[getSelectedKey()]}
          style={{ height: '100%', borderRight: 0 }}
          items={menuItems}
        />
      </Sider>
      <Layout>
        <Content style={{ margin: '24px', background: '#fff', padding: '24px', borderRadius: '8px' }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default QuizLayout;