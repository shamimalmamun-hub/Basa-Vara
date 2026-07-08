import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useApp } from './contexts/AppContext';

// Pages
import Navbar from './components/Navbar';
import ScrollingText from './components/ScrollingText';
import Footer from './components/Footer';
import Home from './pages/Home';
import Rentals from './pages/Rentals';
import Tutors from './pages/Tutors';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import Dashboard from './pages/Dashboard';
import PendingApproval from './pages/PendingApproval';
import WhatsAppWidget from './components/WhatsAppWidget';

function ProtectedRoute({ children, roleRequired }: { children: React.ReactNode, roleRequired?: string[] }) {
  const { currentUser, isLoading } = useApp();
  
  if (isLoading) return <div className="h-screen flex items-center justify-center">Loading...</div>;
  if (!currentUser) return <Navigate to="/login" replace />;
  if (roleRequired && !roleRequired.includes(currentUser.role)) return <Navigate to="/" replace />;
  
  return <>{children}</>;
}

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A0F1C] font-sans text-slate-800 dark:text-slate-200 transition-colors duration-500 relative selection:bg-indigo-500/30">
      {/* Modern Background Elements - Light Mode */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden dark:hidden flex justify-center">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-100/60 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse" style={{ animationDuration: '8s' }}></div>
        <div className="absolute bottom-0 right-1/4 w-[30rem] h-[30rem] bg-violet-100/50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse" style={{ animationDuration: '10s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.015] mix-blend-overlay"></div>
      </div>
      
      {/* Modern Background Elements - Dark Mode */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden hidden dark:flex justify-center">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-900/20 blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-violet-900/20 blur-[100px]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay"></div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        <ScrollingText />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/rentals" element={<Rentals />} />
            <Route path="/tutors" element={<Tutors />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/pending" element={<PendingApproval />} />
            
            <Route path="/dashboard/*" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
          </Routes>
        </main>
        <Footer />
        <WhatsAppWidget />
      </div>
    </div>
  );
}
