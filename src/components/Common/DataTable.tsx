import React from 'react';
import { Table, Button, Space, Pagination, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

interface DataTableProps {
  columns: ColumnsType<any>;
  dataSource: any[];
  loading?: boolean;
  rowKey?: string;
  pagination: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize?: number) => void;
  };
  onView?: (record: any) => void;
  onEdit?: (record: any) => void;
  onDelete?: (record: any) => void;
  rowSelection?: any;
}

const DataTable: React.FC<DataTableProps> = ({
  columns,
  dataSource,
  loading,
  rowKey = 'id',
  pagination,
  onView,
  onEdit,
  onDelete,
  rowSelection,
}) => {
  const actionColumn: ColumnsType<any> = [
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          {onView && (
            <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => onView(record)}>
              查看
            </Button>
          )}
          {onEdit && (
            <Button type="link" size="small" icon={<EditOutlined />} onClick={() => onEdit(record)}>
              编辑
            </Button>
          )}
          {onDelete && (
            <Popconfirm
              title="确定要删除吗？"
              onConfirm={() => onDelete(record)}
              okText="确定"
              cancelText="取消"
            >
              <Button type="link" size="small" danger icon={<DeleteOutlined />}>
                删除
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Table
        columns={[...columns, ...actionColumn]}
        dataSource={dataSource}
        loading={loading}
        rowSelection={rowSelection}
        pagination={false}
        rowKey={rowKey}
        scroll={{ x: 'max-content' }}
        size="middle"
      />
      <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
        <Pagination
          current={pagination.current}
          pageSize={pagination.pageSize}
          total={pagination.total}
          onChange={pagination.onChange}
          showSizeChanger
          showQuickJumper
          showTotal={(total) => `共 ${total} 条`}
          pageSizeOptions={['10', '20', '50', '100']}
        />
      </div>
    </div>
  );
};

export default DataTable;
