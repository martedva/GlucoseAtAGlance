import React from 'react';
import './App.css';

// const getData = async (event: React.MouseEvent<HTMLButtonElement>) => {
//   const data = {
//     "email": "mart.edva@gmail.com",
//     "password": "Vw1303b10"
//   };
//   const url = 'https://api.libreview.io/llu/auth/login';
//   const corsMode: RequestMode = 'no-cors';
//   const options = {
//     method: 'POST',
//     mode: corsMode,
//     headers: {
//       version: '4.7',
//       product: 'llu.android',
//       Accept: 'application/json, application/xml, multipart/form-data',
//     },
//     body: JSON.stringify(data)
//   };
// 
//   try {
//     const response = await fetch(url, options);
//     const data = await response.json();
//     console.log(data);
//   } catch (error) {
//     console.error(error);
//   }
// }

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
      </header>
    </div>
  );
}

export default App;
