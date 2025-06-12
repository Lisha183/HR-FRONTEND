import './App.css'
import React, { useEffect, useState } from 'react';

function App() {
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    fetch('https://hr-backend-xs34.onrender.com/')
      .then((res) => res.json())
      .then((data) => setEmployees(data))
      .catch((err) => console.error('Failed to fetch:', err));
  }, []);


  return (
    
    <div style={{ padding: '1rem' }}>
    <h1>Employee List</h1>
    <ul>
      {employees.map(emp => (
        <li key={emp.id}>
          {emp.user}: {emp.position} in {emp.department}
        </li>
      ))}
    </ul>
  </div>

     

  )
}

export default App
