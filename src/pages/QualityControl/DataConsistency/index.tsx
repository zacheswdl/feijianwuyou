import React, { useState, useEffect, useCallback } from 'react';
import { Card, Row, Col, Statistic, Button, message, Modal } from 'antd';
import { CheckCircleOutlined, WarningOutlined, FileSearchOutlined, PlusOutlined } from '@ant-design/icons';
import PageHeader from '../../../components/Common/PageHeader';
import SearchForm from '../../../components/Common/SearchForm';
import DataTable from '../../../components/Common/DataTable';
import type { DataConsistencyRecord } from '../../../types/index';
import { loadData, saveData, MODULE_KEYS } from '../../../utils/storage';
import ConsistencyForm from './ConsistencyForm';
import dayjs from 'dayjs';

const DataConsistency: React.FC = () => {
  const [data, setData] = useState<DataConsistencyRecord[]>([]);
  const [filteredData, setFilteredData] = useState<DataConsistencyRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<DataConsistencyRecord | null>(null);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view'>('add');
  const [selectedRows, setSelectedRows] = useState<DataConsistencyRecord[]>([]);

  const loadTableData = useCallback(() => {
    setLoading(true);
    const result = loadData<DataConsistencyRecord>(MODULE_KEYS.DATA_CONSISTENCY);
    setData(result);
    setFilteredData(result);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadTableData();
  }, [loadTableData]);

  const handleSearch = (values: any) => {
    let result = [...data];
    
    if (values.checkDate && values.checkDate.length === 2) {
      const startDate = values.checkDate[0].format('YYYY-MM-DD');
      const endDate = values.checkDate[1].format('YYYY-MM-DD');
      result = result.filter(item => item.checkDate >= startDate && item.checkDate <= endDate);
    }
    
    if (values.systemName) {
      result = result.filter(item => item.systemName.includes(values.systemName));
    }
    
    if (values.checkType) {
      result = result.filter(item => item.checkType === values.checkType);
    }
    
    if (values.checker) {
      result = result.filter(item => item.checker.includes(values.checker));
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

  const handleEdit = (record: DataConsistencyRecord) => {
    setEditingRecord(record);
    setModalMode('edit');
    setModalVisible(true);
  };

  const handleView = (record: DataConsistencyRecord) => {
    setEditingRecord(record);
    setModalMode('view');
    setModalVisible(true);
  };

  const handleDelete = (record: DataConsistencyRecord) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除 ${record.systemName} 的检查记录吗？`,
      onOk: () => {
        const newData = data.filter(item => item.id !== record.id);
        saveData(MODULE_KEYS.DATA_CONSISTENCY, newData);
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
        saveData(MODULE_KEYS.DATA_CONSISTENCY, newData);
        setData(newData);
        setFilteredData(newData);
        setSelectedRows([]);
        message.success('批量删除成功');
      },
    });
  };

  const handleSave = (values: any) => {
    if (modalMode === 'add') {
      const newRecord: DataConsistencyRecord = {
        id: Date.now().toString(),
        ...values,
        checkDate: values.checkDate.format('YYYY-MM-DD'),
      };
      const newData = [newRecord, ...data];
      saveData(MODULE_KEYS.DATA_CONSISTENCY, newData);
      setData(newData);
      setFilteredData(newData);
      message.success('新增成功');
    } else if (modalMode === 'edit' && editingRecord) {
      const newData = data.map(item => 
        item.id === editingRecord.id 
          ? { ...item, ...values, checkDate: values.checkDate.format('YYYY-MM-DD') }
          : item
      );
      saveData(MODULE_KEYS.DATA_CONSISTENCY, newData);
      setData(newData);
      setFilteredData(newData);
      message.success('修改成功');
    }
    setModalVisible(false);
  };

  const searchFields = [
    {
      type: 'rangePicker' as const,
      label: '检查日期',
      name: 'checkDate',
    },
    {
      type: 'input' as const,
      label: '系统/软件名称',
      name: 'systemName',
      placeholder: '请输入系统或软件名称',
    },
    {
      type: 'select' as const,
      label: '检查类型',
      name: 'checkType',
      placeholder: '请选择检查类型',
      options: [
        { label: '数据备份检查', value: '数据备份检查' },
        { label: '数据传输检查', value: '数据传输检查' },
        { label: '数据完整性检查', value: '数据完整性检查' },
        { label: '系统日志检查', value: '系统日志检查' },
      ],
    },
    {
      type: 'input' as const,
      label: '检查人',
      name: 'checker',
      placeholder: '请输入检查人',
    },
    {
      type: 'select' as const,
      label: '检查结果',
      name: 'result',
      placeholder: '请选择检查结果',
      options: [
        { label: '一致', value: '一致' },
        { label: '异常', value: '异常' },
      ],
    },
  ];

  const columns = [
    {
      title: '检查日期',
      dataIndex: 'checkDate',
      key: 'checkDate',
      sorter: (a: DataConsistencyRecord, b: DataConsistencyRecord) => a.checkDate.localeCompare(b.checkDate),
    },
    {
      title: '系统/软件名称',
      dataIndex: 'systemName',
      key: 'systemName',
    },
    {
      title: '检查类型',
      dataIndex: 'checkType',
      key: 'checkType',
    },
    {
      title: '检查内容',
      dataIndex: 'checkContent',
      key: 'checkContent',
      ellipsis: true,
    },
    {
      title: '检查结果',
      dataIndex: 'result',
      key: 'result',
      render: (result: string) => (
        <span style={{ color: result === '一致' ? '#52c41a' : '#ff4d4f' }}>
          {result === '一致' ? <CheckCircleOutlined /> : <WarningOutlined />} {result}
        </span>
      ),
    },
    {
      title: '检查人',
      dataIndex: 'checker',
      key: 'checker',
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      ellipsis: true,
    },
  ];

  const totalCount = data.length;
  const normalCount = data.filter(item => item.result === '一致').length;
  const abnormalCount = data.filter(item => item.result === '异常').length;
  const todayCount = data.filter(item => item.checkDate === dayjs().format('YYYY-MM-DD')).length;

  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { label: '首页', path: '/' },
          { label: '质量控制管理', path: '/quality-control' },
          { label: '数据一致性检查表' },
        ]}
      />

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic title="总检查次数" value={totalCount} prefix={<FileSearchOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="一致" value={normalCount} valueStyle={{ color: '#52c41a' }} prefix={<CheckCircleOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="异常" value={abnormalCount} styles={{ content: { color: '#ff4d4f' } }} prefix={<WarningOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="今日检查" value={todayCount} />
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
            新增检查记录
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

      <ConsistencyForm
        visible={modalVisible}
        record={editingRecord}
        mode={modalMode}
        onCancel={() => setModalVisible(false)}
        onSave={handleSave}
      />
    </div>
  );
};

export default DataConsistency;
