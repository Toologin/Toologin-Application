import React from 'react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import UseToken from './components/useToken';
import VerifyToken from './components/verifyToken';
import Login from './components/Login';
import Layout from './Layout';
import Home from './pages/Home';
import Shop from './pages/Shop';

export default function App() {
  const { token, setToken } = UseToken();
  const { verify } = VerifyToken();

  if (!token || !verify) {
    return <Login setToken={setToken} />;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="/shop" element={<Shop />} />
        </Route>
      </Routes>
    </Router>
  );
}
