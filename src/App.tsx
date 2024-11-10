import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout/Layout';
import NetWorthCalculator from './pages/NetWorthCalculator';
import BudgetCalculator from './pages/BudgetCalculator';
import LoanCalculator from './pages/LoanCalculator';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/net-worth" replace />} />
            <Route path="/net-worth" element={<NetWorthCalculator />} />
            <Route path="/budget" element={<BudgetCalculator />} />
            <Route path="/loan" element={<LoanCalculator />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;