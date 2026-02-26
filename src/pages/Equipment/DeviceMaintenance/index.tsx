import React, { useState, useEffect, useCallback } from 'react';
import { Card, Row, Col, Statistic, Button, message, Modal } from 'antd';
import { ToolOutlined, CheckCircleOutlined, ClockCircleOutlined, PlusOutlined } from '@ant-design/icons';
import PageHeader from '../../../components/Common/PageHeader';
import SearchForm from '../../../components/Common/SearchForm';
import DataTable from '../../../components/Common/DataTable';
import type { DeviceMaintenanceRecord } from '../../../types/index';
import { loadData, saveData, MODULE_KEYS } from '../../../utils/storage';
import MaintenanceForm from './MaintenanceForm';
import dayjs from 'dayjs';

const DeviceMaintenance: React.FC = () => {
  const [data, setData] = useState<DeviceMaintenanceRecord[]>([]);
  const [filteredData, setFilteredData] = useState<DeviceMaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<DeviceMaintenanceRecord | null>(null);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view'>('add');
  const [selectedRows, setSelectedRows] = useState<DeviceMaintenanceRecord[]>([]);

  const loadTableData = useCallback(async () => {
    setLoading(true);
    const result = await loadData<DeviceMaintenanceRecord>(MODULE_KEYS.DEVICE_MAINTENANCE);
    setData(result);
    setFilteredData(result);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadTableData();
  }, [loadTableData]);

  const handleSearch = (values: any) => {
    let result = [...data];
    
    if (values.maintenanceDate && values.maintenanceDate.length === 2) {
      const startDate = values.maintenanceDate[0].format('YYYY-MM-DD');
      const endDate = values.maintenanceDate[1].format('YYYY-MM-DD');
      result = result.filter(item => item.maintenanceDate >= startDate && item.maintenanceDate <= endDate);
    }
    
    if (values.deviceName) {
      result = result.filter(item => item.deviceName.includes(values.deviceName));
    }
    
    if (values.deviceNo) {
      result = result.filter(item => item.deviceNo.includes(values.deviceNo));
    }
    
    if (values.maintenanceType) {
      result = result.filter(item => item.maintenanceType === values.maintenanceType);
    }
    
    if (values.maintenancePerson) {
      result = result.filter(item => item.maintenancePerson.includes(values.maintenancePerson));
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

  const handleEdit = (record: DeviceMaintenanceRecord) => {
    setEditingRecord(record);
    setModalMode('edit');
    setModalVisible(true);
  };

  const handleView = (record: DeviceMaintenanceRecord) => {
    setEditingRecord(record);
    setModalMode('view');
    setModalVisible(true);
  };

  const handleDelete = (record: DeviceMaintenanceRecord) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除 ${record.deviceName} 的维护记录吗？`,
      onOk: () => {
        const newData = data.filter(item => item.id !== record.id);
        saveData(MODULE_KEYS.DEVICE_MAINTENANCE, newData);
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
        saveData(MODULE_KEYS.DEVICE_MAINTENANCE, newData);
        setData(newData);
        setFilteredData(newData);
        setSelectedRows([]);
        message.success('批量删除成功');
      },
    });
  };

  const handleSave = (values: any) => {
    if (modalMode === 'add') {
      const newRecord: DeviceMaintenanceRecord = {
        id: Date.now().toString(),
        ...values,
        maintenanceDate: values.maintenanceDate.format('YYYY-MM-DD'),
      };
      const newData = [newRecord, ...data];
      saveData(MODULE_KEYS.DEVICE_MAINTENANCE, newData);
      setData(newData);
      setFilteredData(newData);
      message.success('新增成功');
    } else if (modalMode === 'edit' && editingRecord) {
      const newData = data.map(item => 
        item.id === editingRecord.id 
          ? { ...item, ...values, maintenanceDate: values.maintenanceDate.format('YYYY-MM-DD') }
          : item
      );
      saveData(MODULE_KEYS.DEVICE_MAINTENANCE, newData);
      setData(newData);
      setFilteredData(newData);
      message.success('修改成功');
    }
    setModalVisible(false);
  };

  const searchFields = [
    {
      type: 'dateRange' as const,
      label: '维护日期',
      name: 'maintenanceDate',
    },
    {
      type: 'input' as const,
      label: '设备名称',
      name: 'deviceName',
      placeholder: '请输入设备名称',
    },
    {
      type: 'input' as const,
      label: '设备编号',
      name: 'deviceNo',
      placeholder: '请输入设备编号',
    },
    {
      type: 'select' as const,
      label: '维护类型',
      name: 'maintenanceType',
      placeholder: '请选择维护类型',
      options: [
        { label: '日常保养', value: '日常保养' },
        { label: '定期维护', value: '定期维护' },
        { label: '故障维修', value: '故障维修' },
        { label: '校准调试', value: '校准调试' },
      ],
    },
    {
      type: 'input' as const,
      label: '维护人员',
      name: 'maintenancePerson',
      placeholder: '请输入维护人员',
    },
  ];

  const columns = [
    {
      title: '维护日期',
      dataIndex: 'maintenanceDate',
      key: 'maintenanceDate',
      sorter: (a: DeviceMaintenanceRecord, b: DeviceMaintenanceRecord) => a.maintenanceDate.localeCompare(b.maintenanceDate),
    },
    {
      title: '设备名称',
      dataIndex: 'deviceName',
      key: 'deviceName',
    },
    {
      title: '设备编号',
      dataIndex: 'deviceNo',
      key: 'deviceNo',
    },
    {
      title: '维护类型',
      dataIndex: 'maintenanceType',
      key: 'maintenanceType',
    },
    {
      title: '维护内容',
      dataIndex: 'maintenanceContent',
      key: 'maintenanceContent',
      ellipsis: true,
    },
    {
      title: '维护结果',
      dataIndex: 'maintenanceResult',
      key: 'maintenanceResult',
      render: (result: string) => (
        <span style={{ color: result === '正常' ? '#52c41a' : '#faad14' }}>
          {result === '正常' ? <CheckCircleOutlined /> : <ClockCircleOutlined />} {result}
        </span>
      ),
    },
    {
      title: '维护人员',
      dataIndex: 'maintenancePerson',
      key: 'maintenancePerson',
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      ellipsis: true,
    },
  ];

  const totalCount = data.length;
  const normalCount = data.filter(item => item.maintenanceResult === '正常').length;
  const repairCount = data.filter(item => item.maintenanceType === '故障维修').length;
  const todayCount = data.filter(item => item.maintenanceDate === dayjs().format('YYYY-MM-DD')).length;

  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { title: '首页', path: '/' },
          { title: '设备管理', path: '/equipment' },
          { title: '仪器设备维修及维护' },
        ]}
      />

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic title="总维护次数" value={totalCount} prefix={<ToolOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="正常完成" value={normalCount} valueStyle={{ color: '#52c41a' }} prefix={<CheckCircleOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="故障维修" value={repairCount} styles={{ content: { color: '#ff4d4f' } }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="今日维护" value={todayCount} />
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
            新增维护记录
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
            onChange: () => {},
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

      <MaintenanceForm
        visible={modalVisible}
        record={editingRecord}
        mode={modalMode}
        onCancel={() => setModalVisible(false)}
        onSave={handleSave}
      />
    </div>
  );
};

export default DeviceMaintenance;
