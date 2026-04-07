import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { Video, MapPin, CheckCircle, ChevronRight, ChevronLeft, Loader2 } from 'lucide-react';

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

  // If mode pre-selected from URL, skip step 1
  useEffect(() => {
    if (searchParams.get('mode')) setStep(2);
  }, []);

  // Fetch doctors when specialty+mode chosen
  useEffect(() => {
    if (step === 3 && mode && specialty) {
      setLoading(true);
      api.get('/api/doctors', { params: { mode, specialty } })
        .then(({ data }) => setDoctors(data.doctors || []))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [step]);

  // Fetch slots when doctor + date selected
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
      <div className="max-w-lg mx-auto mt-20 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Appointment Booked!</h2>
        <p className="text-gray-500 mb-2">Your appointment with <strong>{selectedDoctor?.name}</strong> is confirmed.</p>
        <p className="text-gray-400 text-sm mb-8">{selectedDate} · {selectedSlot?.timeSlot}</p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => navigate('/patient/appointments')}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition text-sm">
            View My Appointments
          </button>
          <button onClick={() => { setStep(1); setSuccess(false); setMode(''); setSpecialty(''); setSelectedDoctor(null); setSelectedSlot(null); }}
            className="border border-gray-200 text-gray-600 px-6 py-2.5 rounded-xl font-medium hover:border-gray-300 transition text-sm">
            Book Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Book an Appointment</h1>
        <p className="text-gray-500 mt-1">Follow the steps below to schedule your appointment</p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center mb-8">
        {STEPS.map((label, i) => {
          const n = i + 1;
          const active = n === step;
          const done = n < step;
          return (
            <div key={label} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${done ? 'bg-blue-600 text-white' : active ? 'bg-blue-600 text-white ring-4 ring-blue-100' : 'bg-gray-100 text-gray-400'}`}>
                  {done ? <CheckCircle className="w-5 h-5" /> : n}
                </div>
                <span className={`text-xs mt-1.5 font-medium ${active ? 'text-blue-600' : done ? 'text-gray-700' : 'text-gray-400'}`}>{label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 mb-4 ${done ? 'bg-blue-600' : 'bg-gray-200'}`} />
              )}
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        {/* STEP 1: Mode */}
        {step === 1 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Choose Consultation Mode</h2>
            <p className="text-gray-400 text-sm mb-6">Select how you would like to consult with the doctor</p>
            <div className="grid grid-cols-2 gap-4">
              {['ONLINE', 'OFFLINE'].map((m) => (
                <button key={m} onClick={() => { setMode(m); setStep(2); }}
                  className="flex flex-col items-center gap-3 p-6 border-2 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition group">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${m === 'ONLINE' ? 'bg-blue-100' : 'bg-orange-100'}`}>
                    {m === 'ONLINE' ? <Video className="w-7 h-7 text-blue-600" /> : <MapPin className="w-7 h-7 text-orange-600" />}
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-gray-900">{m === 'ONLINE' ? 'Online Consultation' : 'In-Person Visit'}</p>
                    <p className="text-xs text-gray-400 mt-1">{m === 'ONLINE' ? 'Video call from anywhere' : 'Visit doctor at clinic'}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
                    <CheckCircle className="w-3.5 h-3.5" /> {m === 'ONLINE' ? 'Instant access' : 'Physical examination'}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: Specialty */}
        {step === 2 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Choose Specialty</h2>
            <p className="text-gray-400 text-sm mb-6">What type of doctor do you need?</p>
            <div className="grid grid-cols-3 gap-3">
              {SPECIALTIES.map((s) => (
                <button key={s} onClick={() => { setSpecialty(s); setStep(3); }}
                  className={`px-3 py-3 text-sm font-medium rounded-xl border-2 text-left transition-all ${specialty === s ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: Doctor */}
        {step === 3 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Select Doctor</h2>
            <p className="text-gray-400 text-sm mb-6">
              {mode === 'ONLINE' ? 'Online' : 'In-clinic'} {specialty} doctors available
            </p>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
              </div>
            ) : doctors.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 text-sm">No {mode.toLowerCase()} {specialty} doctors available</p>
                <button onClick={() => setStep(2)} className="text-blue-600 text-sm font-medium mt-2 hover:underline">Change specialty</button>
              </div>
            ) : (
              <div className="space-y-3">
                {doctors.map((d) => (
                  <button key={d.id} onClick={() => setSelectedDoctor(d)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${selectedDoctor?.id === d.id ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}>
                    <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
                      {d.name?.[0]}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{d.name}</p>
                      <p className="text-sm text-gray-500">{d.specialty}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${d.mode === 'ONLINE' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>{d.mode}</span>
                        <span className="text-sm font-semibold text-gray-900">${d.fee}</span>
                      </div>
                    </div>
                    {selectedDoctor?.id === d.id && <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 4: Time Slot */}
        {step === 4 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Select Date & Time Slot</h2>
            <p className="text-gray-400 text-sm mb-6">Available slots for {selectedDoctor?.name}</p>
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Choose Date</label>
              <input type="date" value={selectedDate} min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            {selectedDate && (
              loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                </div>
              ) : slots.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-6">No available slots for this date.</p>
              ) : (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-3">{slots.length} slots available</p>
                  <div className="grid grid-cols-3 gap-2">
                    {slots.map((s) => (
                      <button key={s.id} onClick={() => setSelectedSlot(s)}
                        className={`py-2.5 px-3 text-sm rounded-lg border-2 font-medium transition-all ${selectedSlot?.id === s.id ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-200 text-gray-700 hover:border-blue-300'}`}>
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
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Confirm Appointment</h2>
            <p className="text-gray-400 text-sm mb-6">Review your appointment details before confirming</p>
            <div className="bg-gray-50 rounded-xl p-5 space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Doctor</span>
                <span className="font-semibold text-gray-900">{selectedDoctor?.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Specialty</span>
                <span className="font-medium text-gray-700">{selectedDoctor?.specialty}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Mode</span>
                <span className={`font-medium px-2 py-0.5 rounded-full text-xs ${mode === 'ONLINE' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>{mode}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Date</span>
                <span className="font-medium text-gray-700">{selectedDate}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Time</span>
                <span className="font-medium text-gray-700">{selectedSlot?.timeSlot}</span>
              </div>
              <div className="border-t border-gray-200 pt-3 flex justify-between">
                <span className="font-semibold text-gray-900">Fee</span>
                <span className="font-bold text-blue-600 text-lg">${selectedDoctor?.fee}</span>
              </div>
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">{error}</div>
            )}
            <button onClick={handleBook} disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-60 flex items-center justify-center gap-2">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Booking...</> : 'Confirm Booking'}
            </button>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6">
          {step > 1 && (
            <button onClick={() => { setStep((s) => s - 1); setError(''); }}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 font-medium transition">
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
          )}
          <div className="ml-auto">
            {step === 3 && selectedDoctor && (
              <button onClick={() => setStep(4)}
                className="flex items-center gap-1.5 bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition">
                Next <ChevronRight className="w-4 h-4" />
              </button>
            )}
            {step === 4 && selectedSlot && (
              <button onClick={() => setStep(5)}
                className="flex items-center gap-1.5 bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition">
                Review <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
