import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { CalendarDays, Clock, Trash2, Loader2, Calendar } from 'lucide-react';

export default function DoctorSchedule() {
  const { user } = useAuth();
  // Default to today's date
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [slotToDelete, setSlotToDelete] = useState(null);

  const fetchSlots = async (d) => {
    if (!d) return;
    setLoading(true);
    try {
      // Accessing this date lazily auto-generates 9-to-5 slots in backend
      const { data } = await api.get(`/api/schedule/${user.id}`, { params: { date: d } });
      setSlots(data.slots || []);
    } catch { setSlots([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchSlots(date); }, [date]);

  const confirmDelete = async () => {
    if (!slotToDelete) return;
    try {
      await api.delete(`/api/schedule/${slotToDelete}`);
      // Remove it instantly from UI
      setSlots((prev) => prev.filter((s) => s.id !== slotToDelete));
      setSlotToDelete(null);
    } catch (err) {
      alert(err.response?.data?.detail || 'Cannot delete slot');
    }
  };

  // Helper arrays to handle date navigations quickly
  const shiftDate = (days) => {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    setDate(next.toISOString().split('T')[0]);
  };

  return (
    <div className="max-w-4xl mx-auto w-full pb-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[28px] font-bold text-gray-900 tracking-tight leading-tight">My Availability</h1>
          <p className="text-[15px] text-[#6B7280] mt-1">Manage your appointment slots. A standard 9:00 AM to 5:00 PM schedule is generated for you automatically.</p>
        </div>
      </div>

      <div className="bg-white rounded-[20px] shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-[#E5E7EB] overflow-hidden">
        {/* Header Controls */}
        <div className="border-b border-[#E5E7EB] bg-[#F8FAFC] px-6 py-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-white border border-[#E5E7EB] rounded-lg p-1 shadow-sm">
              <button onClick={() => shiftDate(-1)} className="px-3 py-1.5 hover:bg-gray-50 text-gray-600 font-medium rounded-md text-sm transition">&larr; Prev</button>
              <div className="w-px h-5 bg-gray-200 mx-1"></div>
              <button onClick={() => shiftDate(1)} className="px-3 py-1.5 hover:bg-gray-50 text-gray-600 font-medium rounded-md text-sm transition">Next &rarr;</button>
            </div>
          </div>

          <div className="flex items-center bg-white border border-[#3B82F6] rounded-xl px-4 py-2.5 shadow-[0_0_0_2px_rgba(59,130,246,0.1)] ring-1 ring-blue-500 relative">
            <Calendar className="w-5 h-5 text-[#3B82F6] mr-3" />
            <input
              type="date"
              value={date}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setDate(e.target.value)}
              className="bg-transparent text-[#1F2937] font-semibold focus:outline-none placeholder-gray-400 [&::-webkit-calendar-picker-indicator]:bg-transparent [&::-webkit-calendar-picker-indicator]:bottom-0 [&::-webkit-calendar-picker-indicator]:left-0 [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:top-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:opacity-0 cursor-pointer"
            />
          </div>
        </div>

        {/* Schedule Grid Content */}
        <div className="p-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-10 h-10 text-[#3B82F6] animate-spin mb-4" />
              <p className="text-gray-500 font-medium">Loading your schedule...</p>
            </div>
          ) : slots.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <CalendarDays className="w-16 h-16 text-gray-200 mb-4" />
              <h3 className="text-lg font-bold text-gray-800">No Slots Available</h3>
              <p className="text-gray-500 max-w-md mx-auto mt-2">
                There are no active generic slots for this date. You may have marked the entire day as unavailable.
              </p>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between xl:justify-start gap-6 mb-6 px-2">
                <h3 className="font-bold text-gray-900 text-lg">
                  {new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </h3>
                <div className="flex gap-4 text-sm font-medium">
                  <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#10B981]"></div> <span className="text-gray-600">Available</span></div>
                  <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]"></div> <span className="text-gray-600">Booked by Patient</span></div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {slots.map((s) => (
                  <div
                    key={s.id}
                    className={`group relative overflow-hidden rounded-xl border ${s.bookedFlag ? 'bg-orange-50/50 border-orange-200' : 'bg-white border-gray-200 hover:border-[#3B82F6] hover:shadow-[0_2px_8px_-3px_rgba(6,81,237,0.15)] hover:-translate-y-0.5'} transition-all p-4 flex flex-col items-center justify-center`}
                  >
                    {s.bookedFlag && <div className="absolute top-0 left-0 w-full h-1 bg-orange-400"></div>}
                    {!s.bookedFlag && <div className="absolute top-0 left-0 w-full h-1 bg-[#10B981]"></div>}

                    <Clock className={`w-5 h-5 mb-2 ${s.bookedFlag ? 'text-orange-500' : 'text-gray-400 group-hover:text-[#3B82F6]'} transition-colors`} />
                    <span className={`text-[15px] font-bold ${s.bookedFlag ? 'text-orange-900' : 'text-gray-800'}`}>
                      {s.timeSlot.split(' - ')[0]}
                    </span>
                    <span className="text-[12px] font-semibold text-gray-500 uppercase tracking-wider mt-1">
                      {s.bookedFlag ? 'Booked' : 'Available'}
                    </span>

                    {!s.bookedFlag && (
                      <button
                        onClick={() => setSlotToDelete(s.id)}
                        title="Mark slot as unavailable"
                        className="absolute inset-0 bg-red-500/90 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
                      >
                        <Trash2 className="w-6 h-6 mb-1 drop-shadow-md" />
                        <span className="text-[12px] font-bold tracking-wider">MARK UNAVAILABLE</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {slotToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden relative animate-in fade-in zoom-in duration-200">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Slot</h3>
              <p className="text-gray-600 mb-6 text-sm">Are you sure you want to mark this slot as unavailable? This action cannot be undone.</p>
              
              <div className="flex items-center justify-end gap-3 mt-2">
                <button 
                  onClick={() => setSlotToDelete(null)}
                  className="px-4 py-2.5 text-sm hover:bg-gray-100 text-gray-700 font-medium rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete}
                  className="px-4 py-2.5 text-sm bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl shadow-sm transition-colors"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
