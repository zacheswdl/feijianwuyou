import React, { useState, useEffect, useCallback } from 'react';
import { Card, Row, Col, Statistic, Button, message, Modal } from 'antd';
import { EnvironmentOutlined, CheckCircleOutlined, WarningOutlined, PlusOutlined } from '@ant-design/icons';
import PageHeader from '../../../components/Common/PageHeader';
import SearchForm from '../../../components/Common/SearchForm';
import DataTable from '../../../components/Common/DataTable';
import type { EnvironmentMonitorRecord } from '../../../types/index';
import { loadData, saveData, MODULE_KEYS } from '../../../utils/storage';
import MonitorForm from './MonitorForm';
import dayjs from 'dayjs';

const EnvironmentMonitor: React.FC = () => {
  const [data, setData] = useState<EnvironmentMonitorRecord[]>([]);
  const [filteredData, setFilteredData] = useState<EnvironmentMonitorRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<EnvironmentMonitorRecord | null>(null);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view'>('add');
  const [selectedRows, setSelectedRows] = useState<EnvironmentMonitorRecord[]>([]);

  const loadTableData = useCallback(() => {
    setLoading(true);
    const result = loadData<EnvironmentMonitorRecord>(MODULE_KEYS.ENVIRONMENT_MONITOR);
    setData(result);
    setFilteredData(result);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadTableData();
  }, [loadTableData]);

  const handleSearch = (values: any) => {
    let result = [...data];
    
    if (values.monitorDate && values.monitorDate.length === 2) {
      const startDate = values.monitorDate[0].format('YYYY-MM-DD');
      const endDate = values.monitorDate[1].format('YYYY-MM-DD');
      result = result.filter(item => item.monitorDate >= startDate && item.monitorDate <= endDate);
    }
    
    if (values.monitorItem) {
      result = result.filter(item => item.monitorItem.includes(values.monitorItem));
    }
    
    if (values.monitorLocation) {
      result = result.filter(item => item.monitorLocation.includes(values.monitorLocation));
    }
    
    if (values.monitor) {
      result = result.filter(item => item.monitor.includes(values.monitor));
    }
    
    if (values.result) {
      result = result.filter(item => item.result === values.result);
    }
    
    setFilteredData(result);
  };

  const handleReset = () => {
    setFilteredData(data);
  };

  const handleAdd = () => {
    setEditingRecord(null);
    setModalMode('add');
    setModalVisible(true);
  };

  const handleEdit = (record: EnvironmentMonitorRecord) => {
    setEditingRecord(record);
    setModalMode('edit');
    setModalVisible(true);
  };

  const handleView = (record: EnvironmentMonitorRecord) => {
    setEditingRecord(record);
    setModalMode('view');
    setModalVisible(true);
  };

  const handleDelete = (record: EnvironmentMonitorRecord) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除 ${record.monitorItem} 的监控记录吗？`,
      onOk: () => {
        const newData = data.filter(item => item.id !== record.id);
        saveData(MODULE_KEYS.ENVIRONMENT_MONITOR, newData);
        setData(newData);
        setFilteredData(newData);
        message.success('删除成功');
      },
    });
  };

  const handleBatchDelete = () => {
    if (selectedRows.length === 0) {
      message.warning('请先选择要删除的记录');
      return;
    }
    Modal.confirm({
      title: '确认批量删除',
      content: `确定要删除选中的 ${selectedRows.length} 条记录吗？`,
      onOk: () => {
        const ids = selectedRows.map(item => item.id);
        const newData = data.filter(item => !ids.includes(item.id));
        saveData(MODULE_KEYS.ENVIRONMENT_MONITOR, newData);
        setData(newData);
        setFilteredData(newData);
        setSelectedRows([]);
        message.success('批量删除成功');
      },
    });
  };

  const handleSave = (values: any) => {
    if (modalMode === 'add') {
      const newRecord: EnvironmentMonitorRecord = {
        id: Date.now().toString(),
        ...values,
        monitorDate: values.monitorDate.format('YYYY-MM-DD'),
      };
      const newData = [newRecord, ...data];
      saveData(MODULE_KEYS.ENVIRONMENT_MONITOR, newData);
      setData(newData);
      setFilteredData(newData);
      message.success('新增成功');
    } else if (modalMode === 'edit' && editingRecord) {
      const newData = data.map(item => 
        item.id === editingRecord.id 
          ? { ...item, ...values, monitorDate: values.monitorDate.format('YYYY-MM-DD') }
          : item
      );
      saveData(MODULE_KEYS.ENVIRONMENT_MONITOR, newData);
      setData(newData);
      setFilteredData(newData);
      message.success('修改成功');
    }
    setModalVisible(false);
  };

  const searchFields = [
    {
      type: 'rangePicker' as const,
      label: '监控日期',
      name: 'monitorDate',
    },
    {
      type: 'input' as const,
      label: '监控项目',
      name: 'monitorItem',
      placeholder: '请输入监控项目',
    },
    {
      type: 'input' as const,
      label: '监控地点',
      name: 'monitorLocation',
      placeholder: '请输入监控地点',
    },
    {
      type: 'input' as const,
      label: '监控人',
      name: 'monitor',
      placeholder: '请输入监控人',
    },
    {
      type: 'select' as const,
      label: '监控结果',
      name: 'result',
      placeholder: '请选择监控结果',
      options: [
        { label: '正常', value: '正常' },
        { label: '异常', value: '异常' },
      ],
    },
  ];

  const columns = [
    {
      title: '监控日期',
      dataIndex: 'monitorDate',
      key: 'monitorDate',
      sorter: (a: EnvironmentMonitorRecord, b: EnvironmentMonitorRecord) => a.monitorDate.localeCompare(b.monitorDate),
    },
    {
      title: '监控项目',
      dataIndex: 'monitorItem',
      key: 'monitorItem',
    },
    {
      title: '监控地点',
      dataIndex: 'monitorLocation',
      key: 'monitorLocation',
    },
    {
      title: '标准值',
      dataIndex: 'standardValue',
      key: 'standardValue',
    },
    {
      title: '实测值',
      dataIndex: 'actualValue',
      key: 'actualValue',
    },
    {
      title: '监控结果',
      dataIndex: 'result',
      key: 'result',
      render: (result: string) => (
        <span style={{ color: result === '正常' ? '#52c41a' : '#ff4d4f' }}>
          {result === '正常' ? <CheckCircleOutlined /> : <WarningOutlined />} {result}
        </span>
      ),
    },
    {
      title: '监控人',
      dataIndex: 'monitor',
      key: 'monitor',
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      ellipsis: true,
    },
  ];

  const totalCount = data.length;
  const normalCount = data.filter(item => item.result === '正常').length;
  const abnormalCount = data.filter(item => item.result === '异常').length;
  const todayCount = data.filter(item => item.monitorDate === dayjs().format('YYYY-MM-DD')).length;

  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { label: '首页', path: '/' },
          { label: '设备管理', path: '/equipment' },
          { label: '环境监控记录' },
        ]}
      />

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic title="总监控次数" value={totalCount} prefix={<EnvironmentOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="正常" value={normalCount} styles={{ content: { color: '#52c41a' } }} prefix={<CheckCircleOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="异常" value={abnormalCount} styles={{ content: { color: '#ff4d4f' } }} prefix={<WarningOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="今日监控" value={todayCount} />
          </Card>
        </Col>
      </Row>

      <Card>
        <SearchForm
          fields={searchFields}
          onSearch={handleSearch}
          onReset={handleReset}
        />

        <div style={{ marginBottom: 16 }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增监控记录
          </Button>
          <Button danger style={{ marginLeft: 8 }} onClick={handleBatchDelete} disabled={selectedRows.length === 0}>
            批量删除
          </Button>
        </div>

        <DataTable
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={loading}
          pagination={{
            current: 1,
            pageSize: 10,
            total: filteredData.length,
            onChange: (page: number) => {},
          }}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          rowSelection={{
            type: 'checkbox' as const,
            onChange: (_selectedRowKeys: any, selectedRows: any) => setSelectedRows(selectedRows),
          }}
        />
      </Card>

      <MonitorForm
        visible={modalVisible}
        record={editingRecord}
        mode={modalMode}
        onCancel={() => setModalVisible(false)}
        onSave={handleSave}
      />
    </div>
  );
};

export default EnvironmentMonitor;
