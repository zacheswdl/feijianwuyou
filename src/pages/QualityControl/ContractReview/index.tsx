import React, { useState, useEffect, useCallback } from 'react';
import { Card, Row, Col, Statistic, Button, message, Modal } from 'antd';
import { FileTextOutlined, CheckCircleOutlined, ClockCircleOutlined, PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import PageHeader from '../../../components/Common/PageHeader';
import SearchForm from '../../../components/Common/SearchForm';
import DataTable from '../../../components/Common/DataTable';
import type { ContractReviewRecord } from '../../../types/index';
import { loadData, saveData, MODULE_KEYS } from '../../../utils/storage';
import ReviewForm from './ReviewForm';

const ContractReview: React.FC = () => {
  const [data, setData] = useState<ContractReviewRecord[]>([]);
  const [filteredData, setFilteredData] = useState<ContractReviewRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ContractReviewRecord | null>(null);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view'>('add');
  const [selectedRows, setSelectedRows] = useState<ContractReviewRecord[]>([]);

  const loadTableData = useCallback(async () => {
    setLoading(true);
    const result = await loadData<ContractReviewRecord>(MODULE_KEYS.CONTRACT_REVIEW);
    setData(result);
    setFilteredData(result);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadTableData();
  }, [loadTableData]);

  const handleSearch = (values: any) => {
    let result = [...data];
    
    if (values.reviewDate && values.reviewDate.length === 2) {
      const startDate = values.reviewDate[0].format('YYYY-MM-DD');
      const endDate = values.reviewDate[1].format('YYYY-MM-DD');
      result = result.filter(item => item.reviewDate >= startDate && item.reviewDate <= endDate);
    }
    
    if (values.contractNo) {
      result = result.filter(item => item.contractNo.includes(values.contractNo));
    }
    
    if (values.customerName) {
      result = result.filter(item => item.customerName.includes(values.customerName));
    }
    
    if (values.reviewResult) {
      result = result.filter(item => item.reviewResult === values.reviewResult);
    }
    
    if (values.reviewer) {
      result = result.filter(item => item.reviewer.includes(values.reviewer));
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

  const handleEdit = (record: ContractReviewRecord) => {
    setEditingRecord(record);
    setModalMode('edit');
    setModalVisible(true);
  };

  const handleView = (record: ContractReviewRecord) => {
    setEditingRecord(record);
    setModalMode('view');
    setModalVisible(true);
  };

  const handleDelete = (record: ContractReviewRecord) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除合同编号为 ${record.contractNo} 的评审记录吗？`,
      onOk: () => {
        const newData = data.filter(item => item.id !== record.id);
        saveData(MODULE_KEYS.CONTRACT_REVIEW, newData);
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
        saveData(MODULE_KEYS.CONTRACT_REVIEW, newData);
        setData(newData);
        setFilteredData(newData);
        setSelectedRows([]);
        message.success('批量删除成功');
      },
    });
  };

  const handleSave = (values: any) => {
    if (modalMode === 'add') {
      const newRecord: ContractReviewRecord = {
        id: Date.now().toString(),
        ...values,
        reviewDate: values.reviewDate.format('YYYY-MM-DD'),
      };
      const newData = [newRecord, ...data];
      saveData(MODULE_KEYS.CONTRACT_REVIEW, newData);
      setData(newData);
      setFilteredData(newData);
      message.success('新增成功');
    } else if (modalMode === 'edit' && editingRecord) {
      const newData = data.map(item => 
        item.id === editingRecord.id 
          ? { ...item, ...values, reviewDate: values.reviewDate.format('YYYY-MM-DD') }
          : item
      );
      saveData(MODULE_KEYS.CONTRACT_REVIEW, newData);
      setData(newData);
      setFilteredData(newData);
      message.success('修改成功');
    }
    setModalVisible(false);
  };

  const searchFields = [
    {
      type: 'rangePicker' as const,
      label: '评审日期',
      name: 'reviewDate',
    },
    {
      type: 'input' as const,
      label: '合同编号',
      name: 'contractNo',
      placeholder: '请输入合同编号',
    },
    {
      type: 'input' as const,
      label: '客户名称',
      name: 'customerName',
      placeholder: '请输入客户名称',
    },
    {
      type: 'select' as const,
      label: '评审结果',
      name: 'reviewResult',
      placeholder: '请选择评审结果',
      options: [
        { label: '通过', value: '通过' },
        { label: '不通过', value: '不通过' },
        { label: '需修改', value: '需修改' },
      ],
    },
    {
      type: 'input' as const,
      label: '评审人',
      name: 'reviewer',
      placeholder: '请输入评审人',
    },
  ];

  const columns = [
    {
      title: '评审日期',
      dataIndex: 'reviewDate',
      key: 'reviewDate',
      sorter: (a: ContractReviewRecord, b: ContractReviewRecord) => a.reviewDate.localeCompare(b.reviewDate),
    },
    {
      title: '合同编号',
      dataIndex: 'contractNo',
      key: 'contractNo',
    },
    {
      title: '客户名称',
      dataIndex: 'customerName',
      key: 'customerName',
    },
    {
      title: '检测项目',
      dataIndex: 'testItems',
      key: 'testItems',
      ellipsis: true,
    },
    {
      title: '评审内容',
      dataIndex: 'reviewContent',
      key: 'reviewContent',
      ellipsis: true,
    },
    {
      title: '评审结果',
      dataIndex: 'reviewResult',
      key: 'reviewResult',
      render: (result: string) => {
        const colorMap: Record<string, string> = {
          '通过': '#52c41a',
          '不通过': '#ff4d4f',
          '需修改': '#faad14',
        };
        return <span style={{ color: colorMap[result] || '#000' }}>{result}</span>;
      },
    },
    {
      title: '评审人',
      dataIndex: 'reviewer',
      key: 'reviewer',
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      ellipsis: true,
    },
  ];

  const totalCount = data.length;
  const passedCount = data.filter(item => item.reviewResult === '通过').length;
  const pendingCount = data.filter(item => item.reviewResult === '需修改').length;
  const todayCount = data.filter(item => item.reviewDate === dayjs().format('YYYY-MM-DD')).length;

  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { title: '首页', path: '/' },
          { title: '质量控制管理', path: '/quality-control' },
          { title: '合同评审记录' },
        ]}
      />

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic title="总评审数" value={totalCount} prefix={<FileTextOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="已通过" value={passedCount} styles={{ content: { color: '#52c41a' } }} prefix={<CheckCircleOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="需修改" value={pendingCount} styles={{ content: { color: '#faad14' } }} prefix={<ClockCircleOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="今日评审" value={todayCount} />
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
            新增评审记录
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
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total: number) => `共 ${total} 条`,
          }}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          rowSelection={{
            type: 'checkbox',
            onChange: (_selectedRowKeys: any, selectedRows: any) => setSelectedRows(selectedRows),
          }}
        />
      </Card>

      <ReviewForm
        visible={modalVisible}
        record={editingRecord}
        mode={modalMode}
        onCancel={() => setModalVisible(false)}
        onSave={handleSave}
      />
    </div>
  );
};

export default ContractReview;
