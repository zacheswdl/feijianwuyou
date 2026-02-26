import React from 'react';
import { Breadcrumb } from 'antd';
import { Link, useLocation } from 'react-router-dom';

interface BreadcrumbItem {
  title: string;
  path?: string;
}

interface PageHeaderProps {
  breadcrumbs: BreadcrumbItem[];
}

const PageHeader: React.FC<PageHeaderProps> = ({ breadcrumbs }) => {
  const location = useLocation();

  const items = breadcrumbs.map((item, index) => ({
    title: item.path ? (
      <Link to={item.path}>{item.title}</Link>
    ) : (
      item.title
    ),
  }));

  return (
    <div style={{ marginBottom: 16 }}>
      <Breadcrumb items={items} />
    </div>
  );
};

export default PageHeader;
