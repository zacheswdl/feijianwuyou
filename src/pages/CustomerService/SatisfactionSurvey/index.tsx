import React, { useState, useEffect, useCallback } from 'react';
import { Card, Row, Col, Statistic, Button, message, Modal, Rate } from 'antd';
import { SmileOutlined, LikeOutlined, DislikeOutlined, PlusOutlined } from '@ant-design/icons';
import PageHeader from '../../../components/Common/PageHeader';
import SearchForm from '../../../components/Common/SearchForm';
import DataTable from '../../../components/Common/DataTable';
import type { SatisfactionSurveyRecord } from '../../../types/index';
import { loadData, saveData, MODULE_KEYS } from '../../../utils/storage';
import SurveyForm from './SurveyForm';

const SatisfactionSurvey: React.FC = () => {
  const [data, setData] = useState<SatisfactionSurveyRecord[]>([]);
  const [filteredData, setFilteredData] = useState<SatisfactionSurveyRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<SatisfactionSurveyRecord | null>(null);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view'>('add');
  const [selectedRows, setSelectedRows] = useState<SatisfactionSurveyRecord[]>([]);

  const loadTableData = useCallback(async () => {
    setLoading(true);
    const result = await loadData<SatisfactionSurveyRecord>(MODULE_KEYS.SATISFACTION_SURVEY);
    setData(result);
    setFilteredData(result);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadTableData();
  }, [loadTableData]);

  const handleSearch = (values: any) => {
    let result = [...data];
    
    if (values.surveyDate && values.surveyDate.length === 2) {
      const startDate = values.surveyDate[0].format('YYYY-MM-DD');
      const endDate = values.surveyDate[1].format('YYYY-MM-DD');
      result = result.filter(item => item.surveyDate >= startDate && item.surveyDate <= endDate);
    }
    
    if (values.customerName) {
      result = result.filter(item => item.customerName.includes(values.customerName));
    }
    
    if (values.contactPhone) {
      result = result.filter(item => item.contactPhone.includes(values.contactPhone));
    }
    
    if (values.surveyMethod) {
      result = result.filter(item => item.surveyMethod === values.surveyMethod);
    }
    
    if (values.surveyPerson) {
      result = result.filter(item => item.surveyPerson.includes(values.surveyPerson));
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

  const handleEdit = (record: SatisfactionSurveyRecord) => {
    setEditingRecord(record);
    setModalMode('edit');
    setModalVisible(true);
  };

  const handleView = (record: SatisfactionSurveyRecord) => {
    setEditingRecord(record);
    setModalMode('view');
    setModalVisible(true);
  };

  const handleDelete = (record: SatisfactionSurveyRecord) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除 ${record.customerName} 的满意度调查记录吗？`,
      onOk: () => {
        const newData = data.filter(item => item.id !== record.id);
        saveData(MODULE_KEYS.SATISFACTION_SURVEY, newData);
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
        saveData(MODULE_KEYS.SATISFACTION_SURVEY, newData);
        setData(newData);
        setFilteredData(newData);
        setSelectedRows([]);
        message.success('批量删除成功');
      },
    });
  };

  const handleSave = (values: any) => {
    if (modalMode === 'add') {
      const newRecord: SatisfactionSurveyRecord = {
        id: Date.now().toString(),
        ...values,
        surveyDate: values.surveyDate.format('YYYY-MM-DD'),
      };
      const newData = [newRecord, ...data];
      saveData(MODULE_KEYS.SATISFACTION_SURVEY, newData);
      setData(newData);
      setFilteredData(newData);
      message.success('新增成功');
    } else if (modalMode === 'edit' && editingRecord) {
      const newData = data.map(item => 
        item.id === editingRecord.id 
          ? { ...item, ...values, surveyDate: values.surveyDate.format('YYYY-MM-DD') }
          : item
      );
      saveData(MODULE_KEYS.SATISFACTION_SURVEY, newData);
      setData(newData);
      setFilteredData(newData);
      message.success('修改成功');
    }
    setModalVisible(false);
  };

  const searchFields = [
    {
      type: 'dateRange' as const,
      label: '调查日期',
      name: 'surveyDate',
    },
    {
      type: 'input' as const,
      label: '客户名称',
      name: 'customerName',
      placeholder: '请输入客户名称',
    },
    {
      type: 'input' as const,
      label: '联系电话',
      name: 'contactPhone',
      placeholder: '请输入联系电话',
    },
    {
      type: 'select' as const,
      label: '调查方式',
      name: 'surveyMethod',
      placeholder: '请选择调查方式',
      options: [
        { label: '电话回访', value: '电话回访' },
        { label: '现场问卷', value: '现场问卷' },
        { label: '在线调查', value: '在线调查' },
        { label: '邮件调查', value: '邮件调查' },
      ],
    },
    {
      type: 'input' as const,
      label: '调查人',
      name: 'surveyPerson',
      placeholder: '请输入调查人',
    },
  ];

  const columns = [
    {
      title: '调查日期',
      dataIndex: 'surveyDate',
      key: 'surveyDate',
      sorter: (a: SatisfactionSurveyRecord, b: SatisfactionSurveyRecord) => a.surveyDate.localeCompare(b.surveyDate),
    },
    {
      title: '客户名称',
      dataIndex: 'customerName',
      key: 'customerName',
    },
    {
      title: '联系电话',
      dataIndex: 'contactPhone',
      key: 'contactPhone',
    },
    {
      title: '调查方式',
      dataIndex: 'surveyMethod',
      key: 'surveyMethod',
    },
    {
      title: '满意度评分',
      dataIndex: 'satisfactionScore',
      key: 'satisfactionScore',
      render: (score: number) => <Rate disabled defaultValue={score} />,
    },
    {
      title: '总体评价',
      dataIndex: 'overallEvaluation',
      key: 'overallEvaluation',
      render: (evaluation: string) => {
        const colorMap: Record<string, string> = {
          '非常满意': '#52c41a',
          '满意': '#52c41a',
          '一般': '#faad14',
          '不满意': '#ff4d4f',
        };
        return <span style={{ color: colorMap[evaluation] || '#000' }}>{evaluation}</span>;
      },
    },
    {
      title: '调查人',
      dataIndex: 'surveyPerson',
      key: 'surveyPerson',
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      ellipsis: true,
    },
  ];

  const totalCount = data.length;
  const satisfiedCount = data.filter(item => item.overallEvaluation === '非常满意' || item.overallEvaluation === '满意').length;
  const dissatisfiedCount = data.filter(item => item.overallEvaluation === '不满意').length;
  const avgScore = data.length > 0 ? (data.reduce((sum, item) => sum + item.satisfactionScore, 0) / data.length).toFixed(1) : '0';

  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { title: '首页', path: '/' },
          { title: '客户服务', path: '/customer-service' },
          { title: '顾客满意度调查表' },
        ]}
      />

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic title="总调查数" value={totalCount} prefix={<SmileOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="满意数量" value={satisfiedCount} valueStyle={{ color: '#52c41a' }} prefix={<LikeOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="不满意数量" value={dissatisfiedCount} styles={{ content: { color: '#ff4d4f' } }} prefix={<DislikeOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="平均评分" value={avgScore} suffix="分" />
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
            新增调查记录
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
            type: 'checkbox',
            onChange: (_selectedRowKeys: any, selectedRows: any) => setSelectedRows(selectedRows),
          }}
        />
      </Card>

      <SurveyForm
        visible={modalVisible}
        record={editingRecord}
        mode={modalMode}
        onCancel={() => setModalVisible(false)}
        onSave={handleSave}
      />
    </div>
  );
};

export default SatisfactionSurvey;
