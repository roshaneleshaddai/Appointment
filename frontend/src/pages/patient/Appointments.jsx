import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { Video, MapPin, Calendar, Search, ExternalLink, Filter, Clock, Map } from 'lucide-react';

const STATUS_TABS = ['All', 'SCHEDULED', 'COMPLETED', 'CANCELLED'];

export default function PatientAppointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get(`/api/appointments/patient/${user.id}`)
      .then(({ data }) => setAppointments(data.appointments || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user.id]);

  const handleCancel = async (id) => {
    if (!confirm('Cancel this appointment?')) return;
    try {
      await api.patch(`/api/appointments/${id}/status`, { status: 'CANCELLED' });
      setAppointments((prev) => prev.map((a) => a.id === id ? { ...a, status: 'CANCELLED' } : a));
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to cancel');
    }
  };

  const filtered = appointments
    .filter((a) => activeTab === 'All' || a.status === activeTab)
    .filter((a) => a.doctorName?.toLowerCase().includes(search.toLowerCase()) || a.specialty?.toLowerCase().includes(search.toLowerCase()));

  const counts = { All: appointments.length, SCHEDULED: 0, COMPLETED: 0, CANCELLED: 0 };
  appointments.forEach((a) => { counts[a.status] = (counts[a.status] || 0) + 1; });

  const getStatusLabel = (status) => {
    if (status === 'SCHEDULED') return 'Confirmed';
    return status.charAt(0) + status.slice(1).toLowerCase();
  };

  const getStatusStyle = (status) => {
    if (status === 'SCHEDULED') return 'bg-[#ECFDF5] text-[#059669]';
    if (status === 'COMPLETED') return 'bg-[#F3F4F6] text-[#6B7280]';
    if (status === 'CANCELLED') return 'bg-red-50 text-red-600';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="max-w-[1100px] mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-gray-900 tracking-tight leading-tight">My Appointments</h1>
          <p className="text-[15px] text-[#6B7280]">Manage and view your upcoming appointments</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/patient/book"
            className="flex items-center justify-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-6 py-3 rounded-[10px] text-[15px] font-semibold transition-colors shadow-sm w-full md:w-auto">
            + Book Appointment
          </Link>
        </div>
      </div>

      {/* Tabs & Filters Area */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div className="flex flex-wrap gap-2">
          {STATUS_TABS.map((tab) => {
            const displayTab = tab === 'All' ? 'All' : tab === 'SCHEDULED' ? 'Upcoming' : tab.charAt(0) + tab.slice(1).toLowerCase();
            return (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-[12px] text-[14px] font-bold transition-all ${
                  activeTab === tab 
                    ? 'bg-[#2563EB] text-white shadow-md' 
                    : 'bg-[#F3F4F6] text-[#4B5563] hover:bg-[#E5E7EB]'
                }`}>
                {displayTab}
                <span className={`text-[12px] px-2 py-0.5 rounded-full font-bold ${
                  activeTab === tab ? 'bg-white/20 text-white' : 'bg-white text-gray-600 shadow-sm'
                }`}>{counts[tab] ?? 0}</span>
              </button>
            );
          })}
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-[300px]">
            <Search className="w-[18px] h-[18px] text-[#9CA3AF] absolute left-4 top-1/2 -translate-y-1/2" />
            <input placeholder="Search appointments..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 border border-[#E5E7EB] rounded-[12px] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent transition-all shadow-sm" />
          </div>
          <button className="p-3 border border-[#E5E7EB] rounded-[12px] text-[#6B7280] bg-white hover:bg-gray-50 flex-shrink-0 shadow-sm">
            <Filter className="w-[18px] h-[18px]" />
          </button>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-20 text-[#6B7280]">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-[16px] border border-[#E5E7EB] shadow-[0_1px_2px_0_rgba(0,0,0,0.02)]">
          <Calendar className="w-12 h-12 text-[#D1D5DB] mx-auto mb-4" strokeWidth={1.5} />
          <p className="text-[16px] font-semibold text-gray-900">No appointments found</p>
          <p className="text-[14px] text-gray-500 mt-1">You don't have any appointments matching your filters.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {filtered.map((a) => (
            <div 
              key={a.id} 
              onClick={() => navigate(`/patient/appointments/${a.id}`)}
              className={`bg-white rounded-[16px] border border-[#E5E7EB] p-6 shadow-[0_1px_2px_0_rgba(0,0,0,0.02)] cursor-pointer hover:shadow-md transition-shadow ${a.status === 'CANCELLED' ? 'opacity-60 grayscale-[0.2]' : ''}`}>
              <div className="flex flex-col md:flex-row md:items-start gap-6">
                
                {/* Avatar Stack */}
                <div className="flex items-start gap-5 flex-1 min-w-0">
                  <div className="w-[72px] h-[72px] rounded-2xl bg-[#E0E7FF] flex items-center justify-center text-[#4338CA] font-extrabold text-[24px] flex-shrink-0 shadow-sm overflow-hidden">
                    {a.doctorPic ? <img src={a.doctorPic} alt="" className="w-full h-full object-cover"/> : a.doctorName?.[0]}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-2 md:gap-4 w-full">
                      <div className="min-w-0">
                        <h3 className="font-bold text-[18px] text-gray-900 truncate pr-4">{a.doctorName}</h3>
                        <p className="text-[14px] text-[#6B7280] font-medium">{a.specialty}</p>
                      </div>
                      <span className={`text-[12px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${getStatusStyle(a.status)}`}>
                        {getStatusLabel(a.status)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 mt-4">
                      <div className="flex items-center gap-2.5 text-[14px] text-[#4B5563] font-medium">
                        <Calendar className="w-4 h-4 text-[#3B82F6]" /> {a.date}
                      </div>
                      <div className="flex items-center gap-2.5 text-[14px] text-[#4B5563] font-medium">
                        <Clock className="w-4 h-4 text-[#3B82F6]" /> {a.timeSlot}
                      </div>
                      <div className="flex items-center gap-2.5 text-[14px] font-medium text-[#4B5563]">
                        {a.mode === 'ONLINE' ? (
                          <><Video className="w-4 h-4 text-[#3B82F6]" /> Online Consultation</>
                        ) : (
                          <><MapPin className="w-4 h-4 text-[#3B82F6]" /> In-Clinic Visit</>
                        )}
                      </div>
                      <div className="flex items-center gap-2.5 text-[14px] font-bold text-[#111827]">
                         <span className="text-gray-400 font-medium">$</span> {a.fee}
                      </div>
                    </div>

                    {/* Location Box for Offline */}
                    {a.mode === 'OFFLINE' && (
                      <div className="mt-4 flex items-start gap-3 bg-[#EFF6FF] rounded-[10px] p-4">
                        <Map className="w-[18px] h-[18px] text-[#3B82F6] flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[13px] font-bold text-gray-900">Clinic Address</p>
                          <p className="text-[14px] text-[#4B5563] mt-0.5">456 Medical Plaza, Suite 200, Downtown Hub</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions Section */}
                <div className="flex flex-row md:flex-col gap-3 justify-end items-end shrink-0 pt-4 md:pt-0 border-t md:border-0 border-gray-100 mt-4 md:mt-0 w-full md:w-auto">
                  {a.status === 'SCHEDULED' && a.mode === 'ONLINE' && (
                    <button onClick={(e) => { e.stopPropagation(); window.open(a.linkOrAddress || 'https://meet.google.com/', '_blank'); }} className="flex-1 md:flex-none w-full md:w-[180px] flex items-center justify-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-6 py-3 rounded-[10px] text-[14px] font-bold transition shadow-sm">
                      <Video className="w-[18px] h-[18px]" /> Join Video Call
                    </button>
                  )}
                  {a.status === 'SCHEDULED' && a.mode === 'OFFLINE' && (
                    <button onClick={(e) => e.stopPropagation()} className="flex-1 md:flex-none w-full md:w-[180px] flex items-center justify-center gap-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white px-6 py-3 rounded-[10px] text-[14px] font-bold transition shadow-sm">
                      <ExternalLink className="w-[18px] h-[18px]" /> Get Directions
                    </button>
                  )}
                  {a.status === 'SCHEDULED' && (
                    <button onClick={(e) => { e.stopPropagation(); handleCancel(a.id); }}
                      className="flex-1 md:flex-none w-full md:w-[180px] flex items-center justify-center gap-2 bg-white border border-[#E5E7EB] text-[#4B5563] px-6 py-3 rounded-[10px] text-[14px] font-bold hover:bg-gray-50 transition shadow-sm">
                      <Calendar className="w-[18px] h-[18px]" /> Cancel
                    </button>
                  )}
                  {a.status === 'COMPLETED' && (
                    <>
                      <button className="flex-1 md:flex-none w-full md:w-[180px] flex items-center justify-center gap-2 bg-[#10B981] hover:bg-[#059669] text-white px-6 py-3 rounded-[10px] text-[14px] font-bold transition shadow-sm">
                        View Report
                      </button>
                      <button className="flex-1 md:flex-none w-full md:w-[180px] flex items-center justify-center gap-2 bg-white border border-[#E5E7EB] text-[#4B5563] px-6 py-3 rounded-[10px] text-[14px] font-bold hover:bg-gray-50 transition shadow-sm">
                        Book Again
                      </button>
                    </>
                  )}
                </div>
                
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
