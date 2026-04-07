import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { Calendar as CalendarIcon, Activity, Pill, Video, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PatientDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/api/appointments/patient/${user.id}`)
      .then(({ data }) => setAppointments(data.appointments || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user.id]);

  const scheduled = appointments.filter(a => a.status === 'SCHEDULED');
  const past = appointments.filter(a => a.status !== 'SCHEDULED');
  const nextAppt = scheduled.length > 0 ? scheduled[0] : null;

  return (
    <div className="max-w-[1100px] mx-auto w-full pb-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[28px] font-bold text-gray-900 tracking-tight leading-tight">Dashboard</h1>
          <p className="text-[15px] text-[#6B7280]">Welcome back, {user.name}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full border border-gray-200 overflow-hidden bg-gray-100 flex items-center justify-center text-gray-500 font-bold shrink-0">
             {user.name[0]}
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-[16px] border border-[#E5E7EB] p-5 shadow-[0_1px_2px_0_rgba(0,0,0,0.02)] flex flex-col justify-center">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-[#EFF6FF] rounded-full flex items-center justify-center shrink-0">
              <CalendarIcon className="w-6 h-6 text-[#3B82F6]" />
            </div>
            <div>
              <p className="text-[13px] font-medium text-[#6B7280] uppercase tracking-wide">Next Appointment</p>
              {nextAppt ? (
                <>
                  <p className="text-xl font-bold text-gray-900 mt-1">{nextAppt.date}</p>
                  <p className="text-[15px] text-gray-600 font-medium">{nextAppt.timeSlot}</p>
                </>
              ) : (
                <p className="text-xl font-bold text-gray-900 mt-1">None</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[16px] border border-[#E5E7EB] p-5 shadow-[0_1px_2px_0_rgba(0,0,0,0.02)] flex flex-col justify-center">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-[#ECFDF5] rounded-full flex items-center justify-center shrink-0">
              <Activity className="w-6 h-6 text-[#10B981]" />
            </div>
            <div>
              <p className="text-[13px] font-medium text-[#6B7280] uppercase tracking-wide">Total Visits</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{appointments.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[16px] border border-[#E5E7EB] p-5 shadow-[0_1px_2px_0_rgba(0,0,0,0.02)] flex flex-col justify-center">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-[#F5F3FF] rounded-full flex items-center justify-center shrink-0">
              <Pill className="w-6 h-6 text-[#8B5CF6]" />
            </div>
            <div>
              <p className="text-[13px] font-medium text-[#6B7280] uppercase tracking-wide">Active Prescriptions</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">0</p>
            </div>
          </div>
        </div>
      </div>

      {/* Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Upcoming Appointments */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[18px] font-bold text-gray-900">Upcoming Appointments</h2>
            <Link to="/patient/appointments" className="text-[14px] font-semibold text-[#3B82F6] hover:underline">View All</Link>
          </div>
          
          <div className="bg-white rounded-[16px] border border-[#E5E7EB] shadow-[0_1px_2px_0_rgba(0,0,0,0.02)] p-6 space-y-5">
            {scheduled.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-6">No upcoming appointments.</p>
            ) : (
              scheduled.map((a) => (
                <div key={a.id} className="flex gap-4 p-4 border border-[#BFDBFE] bg-[#F8FAFC] rounded-[12px] relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#3B82F6]"></div>
                  
                  <div className="w-12 h-12 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-bold shrink-0">
                    {a.doctorName?.[0]}
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-gray-900 text-[15px]">{a.doctorName}</h3>
                        <p className="text-sm text-gray-500">{a.specialty}</p>
                      </div>
                      
                      {a.mode === 'ONLINE' ? (
                        <button className="bg-[#EFF6FF] text-[#2563EB] text-[13px] font-semibold px-4 py-1.5 rounded-full hover:bg-blue-100 transition">
                          Join Video
                        </button>
                      ) : (
                        <span className="bg-[#ECFDF5] text-[#059669] text-[12px] font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
                          Confirmed
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 mt-3 text-[13px] text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <CalendarIcon className="w-4 h-4" />
                        {a.date}, {a.timeSlot}
                      </div>
                      <div className="flex items-center gap-1.5">
                        {a.mode === 'ONLINE' ? 'Video Consult' : 'Clinic Visit'}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-4 bg-white rounded-[16px] border border-[#E5E7EB] p-6">
             <h2 className="text-[17px] font-bold text-gray-900 mb-5">Quick Actions</h2>
             <div className="flex flex-col gap-3">
               <Link to="/patient/book?mode=ONLINE" className="flex items-center justify-center gap-2 w-full bg-[#1D4ED8] hover:bg-[#1E40AF] text-white py-3 rounded-[10px] font-medium text-[15px] transition">
                 <Video className="w-5 h-5" />
                 Book Online Appointment
               </Link>
               <Link to="/patient/book?mode=OFFLINE" className="flex items-center justify-center gap-2 w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white py-3 rounded-[10px] font-medium text-[15px] transition">
                 <span className="text-xl">+</span> Book Offline Appointment
               </Link>
               <button className="w-full bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#4B5563] py-3 rounded-[10px] font-semibold text-[15px] transition flex justify-center gap-2">
                 <ClipboardList className="w-5 h-5" /> View Records
               </button>
             </div>
          </div>
        </div>

        {/* Recent Appointments & Summary */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[18px] font-bold text-gray-900">Recent Appointments</h2>
            <Link to="/patient/appointments" className="text-[14px] font-semibold text-[#3B82F6] hover:underline">View All</Link>
          </div>
          
          <div className="bg-white rounded-[16px] border border-[#E5E7EB] shadow-[0_1px_2px_0_rgba(0,0,0,0.02)] p-6 space-y-6">
            {past.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-6">No recent appointments.</p>
            ) : (
              past.slice(0, 4).map((a) => (
                <div key={a.id} className="flex gap-4">
                  <div className="w-11 h-11 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold shrink-0">
                    {a.doctorName?.[0]}
                  </div>
                  <div className="flex-1 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-gray-900 text-[15px]">{a.doctorName}</h3>
                        <p className="text-sm text-gray-500">{a.specialty}</p>
                      </div>
                      {a.status === 'COMPLETED' ? (
                        <button className="bg-[#EFF6FF] text-[#2563EB] text-[12px] font-semibold px-3 py-1.5 rounded-lg hover:bg-blue-100 transition">
                          View Notes
                        </button>
                      ) : (
                        <span className="text-xs text-red-500 font-semibold bg-red-50 px-2 py-1 rounded">Cancelled</span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3 mt-2 text-[13px] text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <CalendarIcon className="w-4 h-4" />
                        {a.date}, {a.timeSlot}
                      </div>
                      {a.status === 'COMPLETED' && (
                        <span className="text-[#059669] bg-[#ECFDF5] px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wide">
                          Completed
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-4 bg-white rounded-[16px] border border-[#E5E7EB] shadow-[0_1px_2px_0_rgba(0,0,0,0.02)] p-6">
             <h2 className="text-[17px] font-bold text-gray-900 mb-5">Health Summary</h2>
             <div className="space-y-4 text-[14px]">
               <div className="flex justify-between pb-3 border-b border-gray-50">
                 <span className="text-gray-500">Blood Pressure</span>
                 <span className="text-[#059669] font-semibold">120/80</span>
               </div>
               <div className="flex justify-between pb-3 border-b border-gray-50">
                 <span className="text-gray-500">Height</span>
                 <span className="text-[#059669] font-semibold">174cm</span>
               </div>
               <div className="flex justify-between pb-3 border-b border-gray-50">
                 <span className="text-gray-500">Weight</span>
                 <span className="text-[#2563EB] font-semibold">145 lbs</span>
               </div>
               <div className="flex justify-between text-sm">
                 <span className="text-gray-500">Last Appointment</span>
                 <span className="text-gray-700 font-medium">{past[0]?.date || 'N/A'}</span>
               </div>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}
