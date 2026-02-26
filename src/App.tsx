import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppLayout from './components/Layout';
import Dashboard from './pages/Dashboard';
import PersonnelArchives from './pages/Personnel/Archives';
import PersonnelTraining from './pages/Personnel/Training';
import PersonnelQualification from './pages/Personnel/Qualification';
import PersonnelAppointment from './pages/Personnel/Appointment';
import PersonnelAuthorization from './pages/Personnel/Authorization';
import PersonnelSupervision from './pages/Personnel/Supervision';
import DeviceLedger from './pages/Equipment/DeviceLedger';
import DevicePlan from './pages/Equipment/DevicePlan';
import DeviceUsage from './pages/Equipment/DeviceUsage';
import StandardMaterialLedger from './pages/StandardMaterial/Ledger';
import StandardMaterialInspection from './pages/StandardMaterial/Inspection';
import StandardMaterialUsage from './pages/StandardMaterial/Usage';
import MySuppliers from './pages/Supplier/MySuppliers';
import ConsumableRecord from './pages/Equipment/ConsumableRecord';
import EnvironmentalCheck from './pages/Equipment/EnvironmentalCheck';
import EnvironmentMonitor from './pages/Equipment/EnvironmentMonitor';
import DeviceMaintenance from './pages/Equipment/DeviceMaintenance';
import DevicePeriodCheck from './pages/Equipment/DevicePeriodCheck';
import DeviceCalibration from './pages/Equipment/DeviceCalibration';
import SoftwareValidation from './pages/QualityControl/SoftwareValidation';
import DataConsistency from './pages/QualityControl/DataConsistency';
import TypicalReport from './pages/QualityControl/TypicalReport';
import ContractReview from './pages/QualityControl/ContractReview';
import SatisfactionSurvey from './pages/CustomerService/SatisfactionSurvey';
import ComplaintRecord from './pages/CustomerService/ComplaintRecord';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          {/* 人员管理 */}
          <Route path="/personnel/archives" element={<PersonnelArchives />} />
          <Route path="/personnel/training" element={<PersonnelTraining />} />
          <Route path="/personnel/qualification" element={<PersonnelQualification />} />
          <Route path="/personnel/appointment" element={<PersonnelAppointment />} />
          <Route path="/personnel/authorization" element={<PersonnelAuthorization />} />
          <Route path="/personnel/supervision" element={<PersonnelSupervision />} />
          {/* 设备管理 */}
          <Route path="/equipment/ledger" element={<DeviceLedger />} />
          <Route path="/equipment/plan" element={<DevicePlan />} />
          <Route path="/equipment/usage" element={<DeviceUsage />} />
          <Route path="/equipment/consumable-record" element={<ConsumableRecord />} />
          <Route path="/equipment/environmental-check" element={<EnvironmentalCheck />} />
          <Route path="/equipment/environment-monitor" element={<EnvironmentMonitor />} />
          <Route path="/equipment/device-maintenance" element={<DeviceMaintenance />} />
          <Route path="/equipment/period-check" element={<DevicePeriodCheck />} />
          <Route path="/equipment/calibration" element={<DeviceCalibration />} />
          {/* 标准物质管理 */}
          <Route path="/standard-material/ledger" element={<StandardMaterialLedger />} />
          <Route path="/standard-material/inspection" element={<StandardMaterialInspection />} />
          <Route path="/standard-material/usage" element={<StandardMaterialUsage />} />
          {/* 供服务方管理 */}
          <Route path="/supplier/my-suppliers" element={<MySuppliers />} />
          {/* 质量控制管理 */}
          <Route path="/quality-control/software-validation" element={<SoftwareValidation />} />
          <Route path="/quality-control/data-consistency" element={<DataConsistency />} />
          <Route path="/quality-control/typical-report" element={<TypicalReport />} />
          <Route path="/quality-control/contract-review" element={<ContractReview />} />
          {/* 客户服务 */}
          <Route path="/customer-service/satisfaction-survey" element={<SatisfactionSurvey />} />
          <Route path="/customer-service/complaint-record" element={<ComplaintRecord />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;