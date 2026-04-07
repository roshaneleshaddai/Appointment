import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Calendar as CalendarIcon, ClipboardList,
  Search, CreditCard, Settings, LogOut, ArrowRightLeft, Users
} from 'lucide-react';

const navConfig = {
  patient: [
    { to: '/patient/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/patient/appointments', label: 'My Appointments', icon: CalendarIcon },
    { to: '/patient/find-doctors', label: 'Find Doctors', icon: Search },
    { to: '/patient/payments', label: 'Payments', icon: CreditCard },
    { to: '/patient/settings', label: 'Settings', icon: Settings },
  ],
  doctor: [
    { to: '/doctor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/doctor/patients', label: 'Patients', icon: Users },
    { to: '/doctor/appointments', label: 'Appointments', icon: ClipboardList },
    { to: '/doctor/schedule', label: 'Schedule', icon: CalendarIcon },
    { to: '/doctor/settings', label: 'Settings', icon: Settings },
  ],
  admin: [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  ],
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = navConfig[user?.role] || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-[240px] bg-white border-r border-[#E5E7EB] flex flex-col z-40">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-[#E5E7EB]">
        <div className="w-8 h-8 rounded-lg bg-[#3B82F6] flex items-center justify-center shadow-sm">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="white"/>
            <path d="M10 10h4v2h-4v-2zm2-2v4h-2V8h2z" fill="#3B82F6" stroke="white" strokeWidth="2"/>
          </svg>
        </div>
        <span className="text-xl font-extrabold text-gray-900 tracking-tight">MediCare</span>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-medium transition-all ${
                isActive
                  ? 'bg-[#EFF6FF] text-[#2563EB]'
                  : 'text-[#4B5563] hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <Icon className="w-5 h-5 stroke-[1.5]" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User Footer */}
      <div className="border-t border-[#E5E7EB] p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-900 truncate leading-none">{user?.name}</span>
              <span className="text-xs text-[#6B7280] capitalize mt-1 leading-none">{user?.role}</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="text-[#9CA3AF] hover:text-[#EF4444] p-2 hover:bg-red-50 rounded-lg transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-[18px] h-[18px] stroke-[2]" />
          </button>
        </div>
      </div>
    </aside>
  );
}
