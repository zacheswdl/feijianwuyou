import React, { useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Row,
  Col,
  Divider,
} from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

interface PersonnelFormProps {
  visible: boolean;
  record: any;
  mode: 'view' | 'edit' | 'add';
  onCancel: () => void;
  onSave: (values: any) => void;
}

const PersonnelForm: React.FC<PersonnelFormProps> = ({
  visible,
  record,
  mode,
  onCancel,
  onSave,
}) => {
  const [form] = Form.useForm();
  const isView = mode === 'view';
  const isEdit = mode === 'edit';
  const isAdd = mode === 'add';

  useEffect(() => {
    if (visible) {
      if (isEdit || isView) {
        // 编辑或查看模式，填充数据
        form.setFieldsValue({
          ...record,
          entryDate: record.entryDate ? dayjs(record.entryDate) : null,
          birthDate: record.birthDate ? dayjs(record.birthDate) : null,
          workDate: record.workDate ? dayjs(record.workDate) : null,
        });
      } else {
        // 新增模式，重置表单
        form.resetFields();
      }
    }
  }, [visible, record, isEdit, isView, form]);

  const handleOk = async () => {
    if (isView) {
      // 查看模式直接关闭
      onCancel();
      return;
    }
    
    try {
      const values = await form.validateFields();
      // 转换日期格式
      const formattedValues = {
        ...values,
        entryDate: values.entryDate?.format('YYYY-MM-DD'),
        birthDate: values.birthDate?.format('YYYY-MM-DD'),
        workDate: values.workDate?.format('YYYY-MM-DD'),
      };
      onSave(formattedValues);
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  const getTitle = () => {
    if (isView) return '查看人员档案';
    if (isEdit) return '编辑人员档案';
    return '新增人员档案';
  };

  return (
    <Modal
      title={getTitle()}
      open={visible}
      onOk={handleOk}
      onCancel={onCancel}
      width={900}
      destroyOnClose
      okText={isView ? '关闭' : '保存'}
      cancelText={isView ? '' : '取消'}
      cancelButtonProps={{ style: { display: isView ? 'none' : undefined } }}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          gender: '男',
          education: '高中',
        }}
      >
        <Divider orientation="left">基本信息</Divider>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="personnelNo"
              label="人员编号"
              rules={[{ required: !isView, message: '请输入人员编号' }]}
            >
              <Input placeholder="请输入人员编号" disabled={isView} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="name"
              label="人员姓名"
              rules={[{ required: !isView, message: '请输入人员姓名' }]}
            >
              <Input placeholder="请输入人员姓名" disabled={isView} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="gender"
              label="性别"
              rules={[{ required: !isView, message: '请选择性别' }]}
            >
              <Select placeholder="请选择性别" disabled={isView}>
                <Option value="男">男</Option>
                <Option value="女">女</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="birthDate"
              label="出生日期"
            >
              <DatePicker style={{ width: '100%' }} placeholder="请选择出生日期" disabled={isView} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="phone"
              label="手机号"
              rules={[{ pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }]}
            >
              <Input placeholder="请输入手机号" disabled={isView} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="idCard"
              label="身份证号"
              rules={[{ pattern: /^\d{17}[\dXx]$/, message: '请输入正确的身份证号' }]}
            >
              <Input placeholder="请输入身份证号" disabled={isView} />
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left">工作信息</Divider>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="department"
              label="部门"
              rules={[{ required: !isView, message: '请选择部门' }]}
            >
              <Select 
                placeholder="请选择部门" 
                disabled={isView}
                mode="multiple"
                allowClear
              >
                <Option value="检测车间">检测车间</Option>
                <Option value="营业大厅">营业大厅</Option>
                <Option value="管理层">管理层</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="position"
              label="岗位"
              rules={[{ required: !isView, message: '请选择岗位' }]}
            >
              <Select 
                placeholder="请选择岗位" 
                disabled={isView}
                mode="multiple"
                allowClear
              >
                <Option value="外观检验员">外观检验员</Option>
                <Option value="底盘检验员">底盘检验员</Option>
                <Option value="引车员">引车员</Option>
                <Option value="环保操作员">环保操作员</Option>
                <Option value="登录员">登录员</Option>
                <Option value="技术负责人">技术负责人</Option>
                <Option value="质量负责人">质量负责人</Option>
                <Option value="授权签字人">授权签字人</Option>
                <Option value="站长">站长</Option>
                <Option value="车间主任">车间主任</Option>
                <Option value="大厅主任">大厅主任</Option>
                <Option value="档案管理员">档案管理员</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="entryDate"
              label="入职时间"
            >
              <DatePicker style={{ width: '100%' }} placeholder="请选择入职时间" disabled={isView} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="workDate"
              label="从业日期"
            >
              <DatePicker style={{ width: '100%' }} placeholder="请选择从业日期" disabled={isView} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="workYears"
              label="工作年限"
            >
              <Input type="number" placeholder="请输入工作年限" disabled={isView} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="age"
              label="年龄"
            >
              <Input type="number" placeholder="请输入年龄" disabled={isView} />
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left">学历信息</Divider>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="education"
              label="学历"
            >
              <Select placeholder="请选择学历" disabled={isView}>
                <Option value="高中">高中</Option>
                <Option value="大专">大专</Option>
                <Option value="本科">本科</Option>
                <Option value="硕士">硕士</Option>
                <Option value="博士">博士</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="major"
              label="所学专业"
            >
              <Input placeholder="请输入所学专业" disabled={isView} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="technicalTitle"
              label="技术职称"
            >
              <Input placeholder="请输入技术职称" disabled={isView} />
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left">其他信息</Divider>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="storageLocation"
              label="存放地点"
            >
              <Select placeholder="请选择存放地点" disabled={isView}>
                <Option value="档案室">档案室</Option>
                <Option value="仓库">仓库</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={16}>
            <Form.Item
              name="address"
              label="住址"
            >
              <Input placeholder="请输入住址" disabled={isView} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="remark"
              label="备注"
            >
              <TextArea rows={2} placeholder="请输入备注" disabled={isView} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="educationExperience"
              label="教育经历"
            >
              <TextArea rows={3} placeholder="请输入教育经历" disabled={isView} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="workExperience"
              label="工作经历"
            >
              <TextArea rows={3} placeholder="请输入工作经历" disabled={isView} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="trainingExperience"
              label="培训经历"
            >
              <TextArea rows={3} placeholder="请输入培训经历" disabled={isView} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default PersonnelForm;
