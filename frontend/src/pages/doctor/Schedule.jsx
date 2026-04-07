import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { CalendarDays, Clock, Plus, Trash2, Loader2, CheckCircle } from 'lucide-react';

export default function DoctorSchedule() {
  const { user } = useAuth();
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [slotMinutes, setSlotMinutes] = useState(30);
  const [generating, setGenerating] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [viewDate, setViewDate] = useState('');
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const fetchSlots = async (d) => {
    if (!d) return;
    setLoadingSlots(true);
    try {
      const { data } = await api.get(`/api/schedule/${user.id}`, { params: { date: d } });
      setSlots(data.slots || []);
    } catch { setSlots([]); }
    finally { setLoadingSlots(false); }
  };

  useEffect(() => { fetchSlots(viewDate); }, [viewDate]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(''); setGenerating(true);
    try {
      const { data } = await api.post('/api/schedule', {
        doctor_id: user.id, date, start_time: startTime, end_time: endTime, slot_minutes: slotMinutes,
      });
      setSuccess(data.message);
      if (viewDate === date) fetchSlots(date);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate slots');
    } finally { setGenerating(false); }
  };

  const handleDelete = async (slotId) => {
    if (!confirm('Delete this slot?')) return;
    try {
      await api.delete(`/api/schedule/${slotId}`);
      setSlots((prev) => prev.filter((s) => s.id !== slotId));
    } catch (err) {
      alert(err.response?.data?.detail || 'Cannot delete slot');
    }
  };

  const inputCls = 'px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Schedule Manager</h1>
        <p className="text-gray-500 mt-0.5">Generate availability slots for your patients to book</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Generator Panel */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <Plus className="w-4 h-4 text-blue-600" />
            </div>
            <h2 className="font-semibold text-gray-900">Generate Time Slots</h2>
          </div>

          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Date</label>
              <input type="date" required value={date} min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setDate(e.target.value)} className={inputCls + ' w-full'} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Start Time</label>
                <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className={inputCls + ' w-full'} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">End Time</label>
                <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className={inputCls + ' w-full'} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Slot Duration</label>
              <div className="flex gap-2">
                {[15, 30, 45, 60].map((m) => (
                  <button type="button" key={m}
                    onClick={() => setSlotMinutes(m)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium border-2 transition-all ${slotMinutes === m ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                    {m} min
                  </button>
                ))}
              </div>
            </div>

            {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">{error}</div>}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" /> {success}
              </div>
            )}

            <button type="submit" disabled={generating}
              className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-medium text-sm hover:bg-blue-700 transition disabled:opacity-60 flex items-center justify-center gap-2">
              {generating ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><CalendarDays className="w-4 h-4" /> Generate Slots</>}
            </button>
          </form>
        </div>

        {/* View Slots Panel */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
              <Clock className="w-4 h-4 text-purple-600" />
            </div>
            <h2 className="font-semibold text-gray-900">View Slots by Date</h2>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Select Date</label>
            <input type="date" value={viewDate} onChange={(e) => setViewDate(e.target.value)} className={inputCls + ' w-full'} />
          </div>

          {loadingSlots ? (
            <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 text-blue-600 animate-spin" /></div>
          ) : viewDate && slots.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-8">No slots for this date</p>
          ) : slots.length > 0 ? (
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-gray-700">{slots.length} slots</p>
                <div className="flex gap-3 text-xs">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400 inline-block" /> Available</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-400 inline-block" /> Booked</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto">
                {slots.map((s) => (
                  <div key={s.id}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-medium ${s.bookedFlag ? 'bg-orange-50 border-orange-200 text-orange-700' : 'bg-green-50 border-green-200 text-green-700'}`}>
                    <span>{s.timeSlot}</span>
                    {!s.bookedFlag && (
                      <button onClick={() => handleDelete(s.id)} className="text-gray-400 hover:text-red-500 transition">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <CalendarDays className="w-10 h-10 text-gray-200 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">Select a date to view slots</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
