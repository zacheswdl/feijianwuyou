const fs = require('fs');
const path = require('path');

const files = [
  'src/pages/Personnel/Supervision/SupervisionForm.tsx',
  'src/pages/Personnel/Archives/PersonnelForm.tsx',
  'src/pages/Personnel/Training/TrainingForm.tsx',
  'src/pages/Equipment/EnvironmentalCheck/CheckForm.tsx',
  'src/pages/StandardMaterial/Ledger/MaterialForm.tsx',
  'src/pages/StandardMaterial/Inspection/InspectionForm.tsx',
  'src/pages/StandardMaterial/Usage/UsageForm.tsx',
  'src/pages/Supplier/MySuppliers/SupplierForm.tsx',
  'src/pages/Equipment/DeviceUsage/UsageForm.tsx',
];

files.forEach(f => {
  const filePath = path.resolve(f);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // 修复 Divider orientation
  content = content.replace(/orientation="left"/g, 'orientation={"left" as const}');
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Fixed:', f);
});

console.log('All files fixed!');
