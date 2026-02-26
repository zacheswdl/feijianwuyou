import React, { useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  DatePicker,
  Row,
  Col,
  Divider,
  Typography,
} from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Title } = Typography;

interface QualificationFormProps {
  visible: boolean;
  record: any;
  mode: 'view' | 'edit' | 'add';
  onCancel: () => void;
  onSave: (values: any) => void;
}

// 默认示例数据（参考截图中的内容）
const defaultExampleData = {
  personName: '涂海丹',
  confirmDate: dayjs('2026-01-29'),
  position: '授权签字人',
  education: '大专/涉外文秘',
  specialty: '机动车安全检验技术、排放检测技术、相关法律法规及标准',
  trainingExperience: `2017.06 参加中认科研（北京）标准化技术研究院 机动车安全技术检验员 培训 取证 CS20172415402
2025.07 参加浙江省环境监测协会 机动车排气污染检验技术培训取证(机)字第2025021236
2025.06 参加省机动车检测维修专业技术人员职业资格 机动车检测维修工程师考核取证 31520250633020400201`,
  workExperience: `2015-06 至 2016-12 瑞安市塘下车辆检测有限公司 担任检测员
2017-04 至 2020-10 瑞安市车辆综合性能检测站 担任检测员
2026 年 1 月至今 瑞安市安阳隆山车辆检测有限公司 担任授权签字人`,
  mainInstruments: '',
  instrumentConfirmation: '经确认，该员工经相关培训并通过考核取得相关证件，经质量监督确认具备现行的安检、环检标准认知能力，熟悉检验检测报告审核程序。',
  projectConfirmation: '经确认，该员工经相关培训并通过考核取得相关证照，经质量监督确认具备现行的安检、环检标准认知能力，熟悉检验检测报告审核程序，有能力进行检验检测报告签字工作。',
  confirmPerson: '',
  confirmPersonDate: null,
};

const QualificationForm: React.FC<QualificationFormProps> = ({
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
          confirmDate: record.confirmDate ? dayjs(record.confirmDate) : null,
          confirmPersonDate: record.confirmPersonDate ? dayjs(record.confirmPersonDate) : null,
        });
      } else if (isAdd) {
        // 新增模式，使用示例数据填充
        form.setFieldsValue(defaultExampleData);
      }
    }
  }, [visible, record, isEdit, isView, isAdd, form]);

  const handleOk = async () => {
    if (isView) {
      onCancel();
      return;
    }

    try {
      const values = await form.validateFields();
      const formattedValues = {
        ...values,
        confirmDate: values.confirmDate?.format('YYYY-MM-DD'),
        confirmPersonDate: values.confirmPersonDate?.format('YYYY-MM-DD'),
      };
      onSave(formattedValues);
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  const getTitle = () => {
    if (isView) return '查看人员上岗资格确认表';
    if (isEdit) return '编辑人员上岗资格确认表';
    return '新增人员上岗资格确认表';
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
      <Form form={form} layout="vertical">
        {/* 表头 */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={4} style={{ marginBottom: 8 }}>人员上岗资格确认表</Title>
          <div style={{ fontSize: 12, color: '#666' }}>RAAYLS/QR04.03.04</div>
        </div>

        {/* 第一行：姓名和确认时间 */}
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="personName"
              label="姓名"
              rules={[{ required: !isView, message: '请输入姓名' }]}
            >
              <Input placeholder="请输入姓名" disabled={isView} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="confirmDate"
              label="确认时间"
              rules={[{ required: !isView, message: '请选择确认时间' }]}
            >
              <DatePicker style={{ width: '100%' }} placeholder="请选择确认时间" disabled={isView} />
            </Form.Item>
          </Col>
        </Row>

        {/* 第二行：岗位和学历 */}
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="position"
              label="岗位"
              rules={[{ required: !isView, message: '请输入岗位' }]}
            >
              <Input placeholder="请输入岗位，如：授权签字人" disabled={isView} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="education"
              label="学历及所学专业"
              rules={[{ required: !isView, message: '请输入学历及所学专业' }]}
            >
              <Input placeholder="如：大专/涉外文秘" disabled={isView} />
            </Form.Item>
          </Col>
        </Row>

        {/* 第三行：专业特长 */}
        <Row>
          <Col span={24}>
            <Form.Item
              name="specialty"
              label="专业特长"
              rules={[{ required: !isView, message: '请输入专业特长' }]}
            >
              <TextArea rows={2} placeholder="请输入专业特长" disabled={isView} />
            </Form.Item>
          </Col>
        </Row>

        <Divider />

        {/* 主要的培训经历取证情况及工作经历 */}
        <Row>
          <Col span={24}>
            <Form.Item
              name="trainingExperience"
              label="主要的培训经历、取证情况"
            >
              <TextArea 
                rows={6} 
                placeholder="请输入培训经历和取证情况，如：
2017.06 参加中认科研（北京）标准化技术研究院 机动车安全技术检验员 培训 取证 CS20172415402
2025.07 参加浙江省环境监测协会 机动车排气污染检验技术培训取证(机)字第2025021236" 
                disabled={isView} 
              />
            </Form.Item>
          </Col>
        </Row>

        <Row>
          <Col span={24}>
            <Form.Item
              name="workExperience"
              label="工作经历"
            >
              <TextArea 
                rows={4} 
                placeholder="请输入工作经历，如：
2015-06 至 2016-12 XX公司 担任检测员
2017-04 至 2020-10 XX检测站 担任检测员" 
                disabled={isView} 
              />
            </Form.Item>
          </Col>
        </Row>

        <Divider />

        {/* 上岗资格确认部分 */}
        <Row>
          <Col span={24}>
            <Form.Item
              name="mainInstruments"
              label="操作的主要仪器"
            >
              <TextArea rows={3} placeholder="请输入操作的主要仪器设备" disabled={isView} />
            </Form.Item>
          </Col>
        </Row>

        <Row>
          <Col span={24}>
            <Form.Item
              name="instrumentConfirmation"
              label="上岗资格确认 - 仪器操作能力确认"
            >
              <TextArea 
                rows={3} 
                placeholder="经确认，该员工经相关培训并通过考核取得相关证件，经质量监督确认具备现行的安检、环检标准认知能力..." 
                disabled={isView} 
              />
            </Form.Item>
          </Col>
        </Row>

        <Row>
          <Col span={24}>
            <Form.Item
              name="projectConfirmation"
              label="上岗资格确认 - 检测项目能力确认"
            >
              <TextArea 
                rows={3} 
                placeholder="经确认，该员工经相关培训并通过考核取得相关证照，经质量监督确认具备现行的安检、环检标准认知能力，有能力进行检验检测报告签字工作..." 
                disabled={isView} 
              />
            </Form.Item>
          </Col>
        </Row>

        <Divider />

        {/* 底部备注 */}
        <div style={{ fontSize: 12, color: '#666', marginBottom: 16 }}>
          注：个人简历附后
        </div>

        {/* 确认人签名 */}
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="confirmPerson"
              label="确认人（技术负责人）"
            >
              <Input placeholder="请输入确认人姓名" disabled={isView} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="confirmPersonDate"
              label="日期"
            >
              <DatePicker style={{ width: '100%' }} placeholder="请选择日期" disabled={isView} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default QualificationForm;
