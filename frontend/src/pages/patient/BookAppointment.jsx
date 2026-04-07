import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { Video, Building2, CheckCircle, ChevronRight, ChevronLeft, Loader2 } from 'lucide-react';

const STEPS = ['Choose Mode', 'Specialty', 'Select Doctor', 'Time Slot', 'Confirm'];
const SPECIALTIES = [
  'Cardiology','Dermatology','Orthopedics','Neurology','Pediatrics',
  'Gynecology','Ophthalmology','ENT','Psychiatry','General Physician',
  'Oncology','Endocrinology','Gastroenterology','Urology','Pulmonology',
];

export default function BookAppointment() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [step, setStep] = useState(1);
  const [mode, setMode] = useState(searchParams.get('mode') || '');
  const [specialty, setSpecialty] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (searchParams.get('mode')) setStep(2);
  }, []);

  useEffect(() => {
    if (step === 3 && mode && specialty) {
      setLoading(true);
      api.get('/api/doctors', { params: { mode, specialty } })
        .then(({ data }) => setDoctors(data.doctors || []))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [step]);

  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      setLoading(true);
      setSelectedSlot(null);
      api.get(`/api/schedule/${selectedDoctor.id}`, { params: { date: selectedDate, available_only: true } })
        .then(({ data }) => setSlots(data.slots || []))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [selectedDoctor, selectedDate]);

  const handleBook = async () => {
    setLoading(true);
    setError('');
    try {
      await api.post('/api/appointments/book', {
        patient_id: user.id,
        doctor_id: selectedDoctor.id,
        schedule_id: selectedSlot.id,
      });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.detail || 'Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-[700px] mx-auto mt-20 text-center">
        <div className="w-24 h-24 bg-[#ECFDF5] rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-12 h-12 text-[#10B981]" />
        </div>
        <h2 className="text-[28px] font-bold text-gray-900 mb-2">Appointment Booked!</h2>
        <p className="text-[15px] text-gray-500 mb-2">Your appointment with <strong className="text-gray-900">{selectedDoctor?.name}</strong> is confirmed.</p>
        <p className="text-gray-500 text-sm mb-10">{selectedDate} · {selectedSlot?.timeSlot}</p>
        <div className="flex gap-4 justify-center">
          <button onClick={() => navigate('/patient/appointments')}
            className="bg-[#2563EB] text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition shadow-sm">
            View My Appointments
          </button>
          <button onClick={() => { setStep(1); setSuccess(false); setMode(''); setSpecialty(''); setSelectedDoctor(null); setSelectedSlot(null); }}
            className="border border-[#E5E7EB] text-[#4B5563] px-8 py-3 rounded-xl font-semibold hover:bg-gray-50 transition shadow-sm">
            Book Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[900px] mx-auto pb-12">
      <div className="mb-10">
        <h1 className="text-[28px] font-bold text-gray-900 leading-tight">Book an Appointment</h1>
        <p className="text-[#6B7280] text-[15px] mt-1">Follow the steps below to schedule your appointment with our specialists</p>
      </div>

      {/* Modern Step Indicator */}
      <div className="flex items-center justify-center mb-12 max-w-[700px] mx-auto">
        {STEPS.map((label, i) => {
          const n = i + 1;
          const active = n === step;
          const done = n < step;
          return (
            <div key={label} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center relative z-10">
                <div className={`w-[44px] h-[44px] rounded-full flex items-center justify-center text-[15px] font-bold transition-all shadow-sm ${
                  done ? 'bg-[#2563EB] text-white' : 
                  active ? 'bg-[#2563EB] text-white ring-4 ring-blue-100' : 
                  'bg-[#F3F4F6] text-[#9CA3AF]'
                }`}>
                  {n}
                </div>
                <span className={`absolute top-[54px] text-[12px] font-semibold text-center w-24 ${
                  active ? 'text-[#2563EB]' : done ? 'text-[#4B5563]' : 'text-[#9CA3AF]'
                }`}>
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-[2px] mx-[-10px] ${done ? 'bg-[#2563EB]' : 'bg-[#E5E7EB]'}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Spacing for absolute text above */}
      <div className="h-4"></div>

      <div className="bg-white rounded-[16px] border border-[#E5E7EB] shadow-[0_1px_2px_0_rgba(0,0,0,0.02)] p-8">
        
        {/* STEP 1: Mode */}
        {step === 1 && (
          <div>
            <h2 className="text-[20px] font-bold text-gray-900 mb-1">Choose Consultation Mode</h2>
            <p className="text-[#6B7280] text-[15px] mb-8">Select how you would like to consult with the doctor</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { id: 'ONLINE', title: 'Online Consultation', desc: 'Video call with doctor from anywhere', tag: 'Instant access', icon: Video, color: 'blue' },
                { id: 'OFFLINE', title: 'In-Person Visit', desc: 'Visit doctor at clinic or hospital', tag: 'Physical examination', icon: Building2, color: 'purple' }
              ].map((m) => (
                <button key={m.id} onClick={() => { setMode(m.id); setStep(2); }}
                  className={`flex flex-col items-center p-8 border-2 rounded-[16px] transition-all group ${
                    mode === m.id ? 'border-blue-500 bg-blue-50/50' : 'border-[#E5E7EB] hover:border-blue-300 hover:bg-gray-50'
                  }`}>
                  <div className={`w-[72px] h-[72px] rounded-full flex items-center justify-center mb-6 shadow-sm ${
                    m.color === 'blue' ? 'bg-[#EFF6FF] text-[#3B82F6]' : 'bg-[#F5F3FF] text-[#8B5CF6]'
                  }`}>
                    <m.icon className="w-8 h-8" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-[18px] font-bold text-gray-900 mb-2">{m.title}</h3>
                  <p className="text-[14px] text-[#6B7280] text-center mb-6">{m.desc}</p>
                  <div className="flex items-center gap-1.5 text-[13px] text-[#059669] font-medium bg-[#ECFDF5] px-3 py-1 rounded-full">
                    <CheckCircle className="w-3.5 h-3.5" /> {m.tag}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: Specialty */}
        {step === 2 && (
          <div>
            <h2 className="text-[20px] font-bold text-gray-900 mb-1">Choose Specialty</h2>
            <p className="text-[#6B7280] text-[15px] mb-8">What type of doctor do you need?</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {SPECIALTIES.map((s) => (
                <button key={s} onClick={() => { setSpecialty(s); setStep(3); }}
                  className={`px-4 py-4 text-[15px] font-semibold rounded-[12px] border-2 text-center transition-all ${
                    specialty === s ? 'border-[#3B82F6] bg-[#EFF6FF] text-[#1D4ED8]' : 
                    'border-[#E5E7EB] text-[#4B5563] hover:border-[#BFDBFE] hover:bg-[#F8FAFC]'
                  }`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: Doctor */}
        {step === 3 && (
          <div>
            <h2 className="text-[20px] font-bold text-gray-900 mb-1">Select Doctor</h2>
            <p className="text-[#6B7280] text-[15px] mb-8">
              {mode === 'ONLINE' ? 'Online video' : 'In-clinic'} {specialty} specialists available
            </p>
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 text-[#3B82F6] animate-spin" />
              </div>
            ) : doctors.length === 0 ? (
              <div className="text-center py-16 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-gray-500 font-medium">No {mode.toLowerCase()} {specialty} doctors available</p>
                <button onClick={() => setStep(2)} className="text-[#3B82F6] font-semibold mt-3 hover:underline">Change specialty</button>
              </div>
            ) : (
              <div className="space-y-4">
                {doctors.map((d) => (
                  <button key={d.id} onClick={() => setSelectedDoctor(d)}
                    className={`w-full flex items-center gap-5 p-5 rounded-[12px] border-2 text-left transition-all ${
                      selectedDoctor?.id === d.id ? 'border-[#3B82F6] bg-[#EFF6FF] shadow-sm' : 
                      'border-[#E5E7EB] hover:border-[#BFDBFE] hover:shadow-sm'
                    }`}>
                    <div className="w-14 h-14 rounded-full bg-[#1D4ED8] flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                      {d.name?.[0]}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 text-[16px]">{d.name}</p>
                      <p className="text-[14px] text-gray-500 mt-0.5">{d.specialty}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className={`text-[12px] font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wide flex items-center gap-1 ${
                          d.mode === 'ONLINE' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                        }`}>
                          {d.mode === 'ONLINE' ? <Video className="w-3.5 h-3.5"/> : <Building2 className="w-3.5 h-3.5"/>}
                          {d.mode}
                        </span>
                        <span className="text-[14px] font-bold text-gray-700 border-l border-gray-300 pl-3">Fee: ${d.fee}</span>
                      </div>
                    </div>
                    {selectedDoctor?.id === d.id && <CheckCircle className="w-6 h-6 text-[#2563EB] flex-shrink-0" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 4: Time Slot */}
        {step === 4 && (
          <div>
            <h2 className="text-[20px] font-bold text-gray-900 mb-1">Select Date & Time Slot</h2>
            <p className="text-[#6B7280] text-[15px] mb-8">Available slots for {selectedDoctor?.name}</p>
            <div className="mb-8 max-w-md">
              <label className="block text-[14px] font-semibold text-gray-700 mb-2">Choose Date</label>
              <input type="date" value={selectedDate} min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-[10px] text-[15px] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent transition-shadow" />
            </div>
            {selectedDate && (
              loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-[#3B82F6] animate-spin" />
                </div>
              ) : slots.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-gray-500 font-medium">No available slots for this date.</p>
                </div>
              ) : (
                <div>
                  <p className="text-[14px] font-bold text-gray-900 mb-4">{slots.length} slots available on {selectedDate}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {slots.map((s) => (
                      <button key={s.id} onClick={() => setSelectedSlot(s)}
                        className={`py-3 px-4 text-[14px] rounded-[10px] border-2 font-bold transition-all ${
                          selectedSlot?.id === s.id ? 'border-[#3B82F6] bg-[#3B82F6] text-white shadow-md' : 
                          'border-[#E5E7EB] text-gray-700 hover:border-[#BFDBFE]'
                        }`}>
                        {s.timeSlot}
                      </button>
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
        )}

        {/* STEP 5: Confirm */}
        {step === 5 && (
          <div>
            <h2 className="text-[20px] font-bold text-gray-900 mb-1">Confirm Appointment</h2>
            <p className="text-[#6B7280] text-[15px] mb-8">Review your appointment details before confirming</p>
            
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-[16px] p-6 space-y-4 mb-8">
              <div className="flex justify-between items-center text-[15px]">
                <span className="text-gray-500">Doctor</span>
                <span className="font-bold text-gray-900">{selectedDoctor?.name}</span>
              </div>
              <div className="flex justify-between items-center text-[15px]">
                <span className="text-gray-500">Specialty</span>
                <span className="font-semibold text-gray-700">{selectedDoctor?.specialty}</span>
              </div>
              <div className="flex justify-between items-center text-[15px] border-b border-gray-200 pb-4">
                <span className="text-gray-500">Mode</span>
                <span className={`font-bold px-2.5 py-0.5 rounded-md capitalize ${mode === 'ONLINE' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>{mode.toLowerCase()}</span>
              </div>
              <div className="flex justify-between items-center text-[15px] pt-2">
                <span className="text-gray-500">Date</span>
                <span className="font-semibold text-gray-900">{selectedDate}</span>
              </div>
              <div className="flex justify-between items-center text-[15px]">
                <span className="text-gray-500">Time</span>
                <span className="font-bold text-gray-900">{selectedSlot?.timeSlot}</span>
              </div>
              <div className="border-t border-[#CBD5E1] pt-5 mt-4 flex justify-between items-center">
                <span className="font-bold text-gray-900">Total Fee</span>
                <span className="font-extrabold text-[#2563EB] text-[24px] tracking-tight">${selectedDoctor?.fee}</span>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-medium rounded-lg px-4 py-3 mb-6 flex items-center gap-2">
                {error}
              </div>
            )}

            <button onClick={handleBook} disabled={loading}
              className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white py-4 rounded-[12px] font-bold text-[16px] transition-colors shadow-sm disabled:opacity-60 flex items-center justify-center gap-2">
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</> : 'Confirm Booking'}
            </button>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-12 pt-6 border-t border-gray-100">
          {step > 1 && (
            <button onClick={() => { setStep((s) => s - 1); setError(''); }}
              className="flex items-center gap-1 text-[15px] text-[#6B7280] hover:text-gray-900 font-semibold transition px-2 py-1 rounded-md hover:bg-gray-100">
              <ChevronLeft className="w-5 h-5" /> Back
            </button>
          )}
          <div className="ml-auto">
            {step === 3 && selectedDoctor && (
              <button onClick={() => setStep(4)}
                className="flex items-center gap-1.5 bg-[#2563EB] text-white px-6 py-2.5 rounded-[10px] text-[15px] font-semibold hover:bg-[#1D4ED8] shadow-sm transition">
                Next Step <ChevronRight className="w-4 h-4" />
              </button>
            )}
            {step === 4 && selectedSlot && (
              <button onClick={() => setStep(5)}
                className="flex items-center gap-1.5 bg-[#2563EB] text-white px-6 py-2.5 rounded-[10px] text-[15px] font-semibold hover:bg-[#1D4ED8] shadow-sm transition">
                Review Details <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
