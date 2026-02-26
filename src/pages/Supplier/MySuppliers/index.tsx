import React, { useState, useEffect } from 'react';
import { Card, Button, Space, Tag, message, Statistic, Row, Col } from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  DownloadOutlined,
  PrinterOutlined,
  ImportOutlined,
} from '@ant-design/icons';
import PageHeader from '../../../components/Common/PageHeader';
import SearchForm from '../../../components/Common/SearchForm';
import DataTable from '../../../components/Common/DataTable';
import SupplierForm from './SupplierForm';
import { getData, saveModuleData, addItem, updateItem, deleteItem } from '../../../utils/storage';

const MODULE_KEY = 'supplier_my_suppliers';

// 搜索字段配置
const searchFields = [
  { name: 'supplierName', label: '服务商名称', type: 'input', placeholder: '请输入服务商名称' },
  { name: 'supplierAddress', label: '服务商地址', type: 'input', placeholder: '请输入服务商地址' },
  { name: 'contactPerson', label: '联系人', type: 'input', placeholder: '请输入联系人' },
  { name: 'supplyType', label: '提供产品（或支持服务）名称', type: 'select', options: [
    { label: '检定/校准服务', value: '检定/校准服务' },
    { label: '标准物质', value: '标准物质' },
    { label: '仪器设备', value: '仪器设备' },
    { label: '维修服务', value: '维修服务' },
    { label: '培训服务', value: '培训服务' },
  ]},
];

// 表格列配置
const columns = [
  { title: '序号', dataIndex: 'index', key: 'index', width: 60, render: (_: any, __: any, index: number) => index + 1 },
  { title: '服务商名称', dataIndex: 'supplierName', key: 'supplierName', width: 200 },
  { title: '服务商地址', dataIndex: 'supplierAddress', key: 'supplierAddress', width: 250, ellipsis: true },
  { title: '联系人', dataIndex: 'contactPerson', key: 'contactPerson', width: 100 },
  { title: '电话', dataIndex: 'phone', key: 'phone', width: 120 },
  {
    title: '提供产品（或支持服务）名称',
    dataIndex: 'supplyType',
    key: 'supplyType',
    width: 200,
    render: (types: string[]) => (
      <Space size="small" wrap>
        {types?.map((type, index) => (
          <Tag key={index} color="blue">{type}</Tag>
        ))}
      </Space>
    ),
  },
  {
    title: '资质证明附件',
    dataIndex: 'qualificationFiles',
    key: 'qualificationFiles',
    width: 120,
    render: (files: any[]) => {
      const count = files?.length || 0;
      if (count === 0) return <Tag color="red">{count}个资质到期</Tag>;
      return <Tag color={count > 0 ? 'green' : 'red'}>{count}个资质有效</Tag>;
    },
  },
];

// 模拟数据
const mockData = [
  {
    id: '1',
    supplierName: '浙江省计量科学研究院',
    supplierAddress: '浙江省杭州市江干区下沙路300号1号楼',
    contactPerson: '赵建国',
    phone: '0571-852127145',
    supplyType: ['服务方-检定/校准服务'],
    qualificationFiles: [],
    performanceEvaluation: true,
    evaluationRecords: true,
    serviceRecords: true,
  },
  {
    id: '2',
    supplierName: '温州市计量科学研究院',
    supplierAddress: '温州市汤家桥南路计量大楼',
    contactPerson: '业务大厅',
    phone: '88662020、88662021',
    supplyType: ['服务方-检定/校准服务'],
    qualificationFiles: [],
    performanceEvaluation: true,
    evaluationRecords: true,
    serviceRecords: true,
  },
  {
    id: '3',
    supplierName: '深圳市元征科技股份有限公司',
    supplierAddress: '深圳市龙岗区坂雪岗工业园五和大道北元征大楼',
    contactPerson: '刘丽',
    phone: '0755-84528866',
    supplyType: ['供应商-仪器设备'],
    qualificationFiles: [],
    performanceEvaluation: true,
    evaluationRecords: true,
    serviceRecords: true,
  },
  {
    id: '4',
    supplierName: '浙江浙大鸣泉科技有限公司',
    supplierAddress: '浙江省杭州市西湖区西园四路2号1幢4层',
    contactPerson: '张一平',
    phone: '0571-87984529',
    supplyType: ['供应商-仪器设备'],
    qualificationFiles: [],
    performanceEvaluation: true,
    evaluationRecords: true,
    serviceRecords: true,
  },
  {
    id: '5',
    supplierName: '瑞安市计量测试检定所',
    supplierAddress: '瑞安市东山街道毓蒙路388号',
    contactPerson: '瑞安计量所',
    phone: '0577-65671796',
    supplyType: ['服务方-检定/校准服务'],
    qualificationFiles: [],
    performanceEvaluation: true,
    evaluationRecords: true,
    serviceRecords: true,
  },
  {
    id: '6',
    supplierName: '浙江江兴汽车检测设备有限公司',
    supplierAddress: '浙江省云工业园区新鹏路18号',
    contactPerson: '王经理',
    phone: '15305778690',
    supplyType: ['供应商-仪器设备'],
    qualificationFiles: [],
    performanceEvaluation: true,
    evaluationRecords: true,
    serviceRecords: true,
  },
  {
    id: '7',
    supplierName: '上海西派埃自动化仪表工程有限责任公司',
    supplierAddress: '上海市虹口区凉城路258号3楼302',
    contactPerson: '寿宇晨',
    phone: '021-65484678',
    supplyType: ['供应商-仪器设备'],
    qualificationFiles: [],
    performanceEvaluation: true,
    evaluationRecords: true,
    serviceRecords: true,
  },
  {
    id: '8',
    supplierName: '深圳市安车检测股份有限公司',
    supplierAddress: '深圳市南山区学苑大道1001号南山智园A5栋5层',
    contactPerson: '贺荣宁',
    phone: '75586187188',
    supplyType: ['供应商-仪器设备'],
    qualificationFiles: [],
    performanceEvaluation: true,
    evaluationRecords: true,
    serviceRecords: true,
  },
  {
    id: '9',
    supplierName: '杭州贝斯特气体有限公司',
    supplierAddress: '浙江省杭州市富阳区银湖街道九龙大道398号',
    contactPerson: '杨朝阳',
    phone: '18358147286',
    supplyType: ['供应商-标准物质'],
    qualificationFiles: [],
    performanceEvaluation: true,
    evaluationRecords: true,
    serviceRecords: true,
  },
];

const MySuppliers: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  
  const [formVisible, setFormVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>({});
  const [formMode, setFormMode] = useState<'view' | 'edit' | 'add'>('add');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setLoading(true);
    const storedData = getData(MODULE_KEY);
    if (storedData && storedData.length > 0) {
      setData(storedData);
      setFilteredData(storedData);
      setPagination(prev => ({ ...prev, total: storedData.length }));
    } else {
      setData(mockData);
      setFilteredData(mockData);
      setPagination(prev => ({ ...prev, total: mockData.length }));
      saveModuleData(MODULE_KEY, mockData);
    }
    setLoading(false);
  };

  const handleSearch = (values: any) => {
    let result = [...data];
    
    if (values.supplierName) {
      result = result.filter(item => item.supplierName?.includes(values.supplierName));
    }
    if (values.supplierAddress) {
      result = result.filter(item => item.supplierAddress?.includes(values.supplierAddress));
    }
    if (values.contactPerson) {
      result = result.filter(item => item.contactPerson?.includes(values.contactPerson));
    }
    if (values.supplyType) {
      result = result.filter(item => item.supplyType?.includes(values.supplyType));
    }
    
    setFilteredData(result);
    setPagination(prev => ({ ...prev, current: 1, total: result.length }));
  };

  const handleReset = () => {
    setFilteredData(data);
    setPagination(prev => ({ ...prev, current: 1, total: data.length }));
  };

  const handleAdd = () => {
    setFormMode('add');
    setEditingRecord({});
    setFormVisible(true);
  };

  const handleEdit = (record: any) => {
    setFormMode('edit');
    setEditingRecord(record);
    setFormVisible(true);
  };

  const handleView = (record: any) => {
    setFormMode('view');
    setEditingRecord(record);
    setFormVisible(true);
  };

  const handleSave = (values: any) => {
    if (formMode === 'edit') {
      updateItem(MODULE_KEY, editingRecord.id, values);
      message.success('编辑成功');
    } else if (formMode === 'add') {
      addItem(MODULE_KEY, { ...values, id: Date.now().toString() });
      message.success('新增成功');
    }
    setFormVisible(false);
    loadData();
  };

  const handleCancel = () => {
    setFormVisible(false);
    setEditingRecord({});
  };

  const handleDelete = async (record: any) => {
    const newData = await deleteItem(MODULE_KEY, record.id);
    message.success('删除成功');
    setData(newData);
    setFilteredData(newData);
    setPagination(prev => ({ ...prev, total: newData.length }));
  };

  const handleBatchDelete = () => {
    let currentData = getData(MODULE_KEY);
    selectedRowKeys.forEach(key => {
      currentData = currentData.filter((item: any) => item.id !== key);
    });
    saveModuleData(MODULE_KEY, currentData);
    setSelectedRowKeys([]);
    message.success('批量删除成功');
    setData(currentData);
    setFilteredData(currentData);
    setPagination(prev => ({ ...prev, total: currentData.length }));
  };

  const handlePageChange = (page: number, pageSize?: number) => {
    setPagination(prev => ({ ...prev, current: page, pageSize: pageSize || 10 }));
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
  };

  const startIndex = (pagination.current - 1) * pagination.pageSize;
  const endIndex = startIndex + pagination.pageSize;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  const statistics = [
    { title: '服务商总数', value: data.length },
    { title: '检定/校准服务', value: data.filter(item => item.supplyType?.includes('检定/校准服务')).length },
    { title: '仪器设备供应商', value: data.filter(item => item.supplyType?.includes('仪器设备')).length },
    { title: '标准物质供应商', value: data.filter(item => item.supplyType?.includes('标准物质')).length },
  ];

  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { title: '首页', path: '/' },
          { title: '供服务方管理' },
          { title: '我的供服务方' },
        ]}
      />

      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          {statistics.map((stat, index) => (
            <Col span={6} key={index}>
              <Statistic title={stat.title} value={stat.value} />
            </Col>
          ))}
        </Row>
      </Card>
      
      <SearchForm fields={searchFields} onSearch={handleSearch} onReset={handleReset} />
      
      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <Space>
            <Button icon={<ImportOutlined />}>批量导入</Button>
            <Button icon={<DownloadOutlined />}>模板下载(.xls)</Button>
          </Space>
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新增
            </Button>
            <Button icon={<DeleteOutlined />} onClick={handleBatchDelete} disabled={selectedRowKeys.length === 0}>
              删除
            </Button>
            <Button icon={<DownloadOutlined />}>下载合格供方</Button>
            <Button icon={<DownloadOutlined />}>下载合格服务商</Button>
            <Button icon={<PrinterOutlined />}>打印</Button>
          </Space>
        </div>
        
        <DataTable
          columns={columns}
          dataSource={paginatedData}
          loading={loading}
          pagination={{
            ...pagination,
            onChange: handlePageChange,
          }}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          rowSelection={rowSelection}
        />
      </Card>

      <SupplierForm
        visible={formVisible}
        record={editingRecord}
        mode={formMode}
        onCancel={handleCancel}
        onSave={handleSave}
      />
    </div>
  );
};

export default MySuppliers;
