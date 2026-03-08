import './App.css'
import { Route, Routes, Navigate, useLocation } from 'react-router-dom';
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import Home from './pages/CivilEmployee/Home'
import LandingPage from './pages/Landing'; 
import Reports from './pages/CivilEmployee/Reports';
import MainPage from './pages/CivilEmployee/MainPage';
import Settings from './pages/CivilEmployee/Settings';
import MaintenanceTeams from './pages/CivilEmployee/MaintenanceTeams';
import Help from './pages/CivilEmployee/Help';
import ManageUsers from './pages/CivilEmployee/ManageUsers';
import Login from './pages/Auth/Login';
import Kids from './pages/KidsPage/Kids';

function App() {
  const location = useLocation();

  
  const hideLayout =  location.pathname === "/Kids" || location.pathname === "/" || location.pathname === "/login" || location.pathname.includes("login");

  return (
    <div className="flex h-screen w-full overflow-hidden" dir="rtl">
      
      {!hideLayout && <Sidebar />}

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        
        {!hideLayout && <Header />}
        
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/home" element={<Home />} />
            <Route path="/Reports" element={<Reports />} />
            <Route path="/teams" element={<MaintenanceTeams />} />
            <Route path="/users" element={<ManageUsers />} />
            <Route path="/Settings" element={<Settings />} />
            <Route path="/help" element={<Help />} />
            <Route path="/MainPage" element={<MainPage />} />
            <Route path="*" element={<Navigate to="/" />} />
            <Route path="/Kids" element={<Kids />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;