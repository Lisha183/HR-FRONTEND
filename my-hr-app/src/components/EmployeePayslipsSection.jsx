// import React, { useState } from 'react';
// import EmployeePayslipsPage from './EmployeePayslipsPage';
// import EmployeePayslipDetailPage from './EmployeePayslipDetailPage';

// export default function EmployeePayslipsSection() {
//   const [selectedPayslipId, setSelectedPayslipId] = useState(null);

//   return (
//     <div>
//       {!selectedPayslipId ? (
//         <EmployeePayslipsPage onViewDetails={setSelectedPayslipId} />
//       ) : (
//         <EmployeePayslipDetailPage
//           payslipId={selectedPayslipId}
//           onBack={() => setSelectedPayslipId(null)}
//         />
//       )}
//     </div>
//   );
// }
