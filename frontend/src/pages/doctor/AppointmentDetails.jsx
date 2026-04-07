import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { ArrowLeft, Bell, Video, MapPin, Calendar, Clock, Paperclip, Send, User, Play, Settings, Map, ExternalLink, FileText, CheckCircle, Plus, Trash, X } from 'lucide-react';

export default function DoctorAppointmentDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [prescription, setPrescription] = useState(null);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [prescForm, setPrescForm] = useState({ diagnosis: '', symptoms: '', notes: '', medicines: [] });
  const messagesEndRef = useRef(null);

  useEffect(() => {
    Promise.all([
      api.get(`/api/appointments/doctor/${user.id}`),
      api.get(`/api/chat/${id}`).catch(() => ({ data: { messages: [] } })),
      api.get(`/api/prescriptions/appointment/${id}`).catch(() => ({ data: null }))
    ])
      .then(([appRes, chatRes, presRes]) => {
        const found = appRes.data.appointments?.find((a) => a.id === id);
        setAppointment(found);
        setMessages(chatRes.data.messages || []);
        if (presRes.data) setPrescription(presRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id, user.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:8000/api/chat/ws/${id}`);
    ws.onmessage = (event) => {
      const newMsg = JSON.parse(event.data);
      setMessages((prev) => {
        if (prev.find(m => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
    };
    return () => ws.close();
  }, [id]);

  const handleMarkComplete = async () => {
    try {
      if (!window.confirm("Mark appointment as complete?")) return;
      await api.patch(`/api/appointments/${id}/status`, { status: 'COMPLETED' });
      setAppointment(prev => ({ ...prev, status: 'COMPLETED' }));
    } catch (e) {
      alert("Failed to mark complete");
    }
  };

  const handleAddMedicine = () => {
    setPrescForm(prev => ({ ...prev, medicines: [...prev.medicines, { name: '', dosage: '', duration_days: 1, instructions: '' }] }));
  };

  const submitPrescription = async () => {
    try {
      const payload = {
        appointment_id: id,
        diagnosis: prescForm.diagnosis,
        symptoms: prescForm.symptoms.split(',').map(s => s.trim()).filter(Boolean),
        medicines: prescForm.medicines,
        notes: prescForm.notes
      };
      let res;
      if (editMode && prescription?.id) {
        res = await api.put(`/api/prescriptions/${prescription.id}`, payload);
      } else {
        res = await api.post('/api/prescriptions/', payload);
      }
      setPrescription(res.data);
      setShowPrescriptionModal(false);
      setEditMode(false);
    } catch (e) {
      alert(e.response?.data?.detail || "Failed to save prescription");
    }
  };

  const handleEditPrescription = () => {
    if (!prescription) return;
    setPrescForm({
      diagnosis: prescription.diagnosis || '',
      symptoms: Array.isArray(prescription.symptoms) ? prescription.symptoms.join(', ') : '',
      notes: prescription.notes || '',
      medicines: prescription.medicines?.map(m => ({ ...m })) || [],
    });
    setEditMode(true);
    setShowPrescriptionModal(true);
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    const newMsg = {
      appointment_id: id,
      sender_id: user.id,
      sender_role: 'doctor',
      text: message
    };
    try {
      const res = await api.post('/api/chat', newMsg);
      setMessages((prev) => {
        if (prev.find(m => m.id === res.data.data.id)) return prev;
        return [...prev, res.data.data];
      });
      setMessage('');
    } catch (e) {
      console.error('Failed to send', e);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;
  if (!appointment) return <div className="p-8 text-center text-gray-500">Appointment not found</div>;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] -mt-8 -mx-8 relative overflow-hidden bg-gray-50">
      {/* Header */}
      <div className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-8 shrink-0">
        <button onClick={() => navigate('/doctor/appointments')} className="flex items-center text-gray-600 hover:text-gray-900 text-sm font-medium">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Appointments
        </button>
        <h1 className="text-xl font-bold text-gray-900 absolute left-1/2 -translate-x-1/2">Appointment Details</h1>
        <div className="flex items-center gap-4">
          <button className="text-gray-500 hover:text-gray-700">
            <Bell className="w-5 h-5" />
          </button>
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold overflow-hidden">
             {user?.name?.[0] || 'D'}
          </div>
        </div>
      </div>

      <div className="p-6 overflow-y-auto w-full h-full">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr,380px] gap-6 items-start h-full pb-10">
          
          {/* Left Column */}
          <div className="space-y-4 flex flex-col min-w-0">
            
            {/* Patient Info Card */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col md:flex-row items-start md:items-center justify-between shadow-sm gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 text-xl font-bold shrink-0 overflow-hidden shadow-inner">
                  {appointment.patientName?.[0] || <User className="w-6 h-6" />}
                </div>
                <div>
                  <h2 className="text-[18px] font-bold text-gray-900 tracking-tight">{appointment.patientName}</h2>
                  <p className="text-sm text-gray-500 font-medium mb-1">Contact: {appointment.patientContact}</p>
                </div>
              </div>
              <div className="flex flex-col md:flex-row items-end md:items-center gap-3">
                <div className="bg-green-50 text-green-700 px-4 py-1.5 rounded-full text-sm font-bold shadow-sm whitespace-nowrap">
                  {appointment.status === 'SCHEDULED' ? 'Confirmed' : appointment.status}
                </div>
                {appointment.status === 'SCHEDULED' && (
                  <button onClick={handleMarkComplete} className="text-sm bg-gray-900 border border-transparent hover:bg-gray-800 text-white font-bold py-1.5 px-4 rounded-full shadow-sm transition">
                    Mark Complete
                  </button>
                )}
                {appointment.status === 'COMPLETED' && !prescription && (
                  <button onClick={() => setShowPrescriptionModal(true)} className="text-sm bg-[#3B82F6] hover:bg-[#2563EB] text-white font-bold py-1.5 px-4 rounded-full shadow-sm transition flex items-center gap-1.5">
                    <FileText className="w-4 h-4" /> Write Prescription
                  </button>
                )}
              </div>
            </div>

            {/* Appointment Information Card */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <h3 className="font-bold text-gray-900 text-[16px] mb-4">Appointment Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                <div>
                  <p className="text-[13px] text-gray-500 font-medium mb-1.5">Date</p>
                  <p className="font-bold text-gray-900 text-[15px]">{appointment.date}</p>
                </div>
                <div>
                  <p className="text-[13px] text-gray-500 font-medium mb-1.5">Time</p>
                  <p className="font-bold text-gray-900 text-[15px]">{appointment.timeSlot}</p>
                </div>
                <div>
                  <p className="text-[13px] text-gray-500 font-medium mb-1.5">Consultation Fee</p>
                  <p className="font-bold text-gray-900 text-[15px]">${appointment.fee}</p>
                </div>
                <div>
                  <p className="text-[13px] text-gray-500 font-medium mb-1.5">Mode</p>
                  <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm font-bold">
                    {appointment.mode === 'ONLINE' ? (
                      <><Video className="w-4 h-4" /> Online Consultation</>
                    ) : (
                      <><MapPin className="w-4 h-4" /> In-Clinic Visit</>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Prescription Display Card */}
            {prescription && (
              <div className="bg-white rounded-2xl border border-blue-100 p-5 shadow-sm">
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <h3 className="font-bold text-gray-900 text-[16px]">Medical Prescription</h3>
                  </div>
                  <button
                    onClick={handleEditPrescription}
                    className="text-xs bg-blue-50 text-blue-600 font-bold px-3 py-1.5 rounded-lg hover:bg-blue-100 transition flex items-center gap-1.5">
                    ✏️ Edit Prescription
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <span className="text-[13px] text-gray-500 font-medium block mb-1">Diagnosis</span>
                    <p className="font-semibold text-gray-900 text-sm">{prescription.diagnosis}</p>
                  </div>
                  {prescription.symptoms?.length > 0 && (
                    <div>
                      <span className="text-[13px] text-gray-500 font-medium block mb-1">Symptoms</span>
                      <div className="flex flex-wrap gap-2">
                        {prescription.symptoms.map((s, i) => (
                          <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md font-medium">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {prescription.medicines?.length > 0 && (
                     <div>
                       <span className="text-[13px] text-gray-500 font-medium block mb-2">Medicines ({prescription.medicines.length})</span>
                       <div className="grid gap-2">
                         {prescription.medicines.map((m, i) => (
                           <div key={i} className="border border-gray-100 rounded-lg p-3 bg-gray-50/50 flex flex-col gap-1">
                             <div className="flex justify-between items-start">
                               <span className="font-bold text-sm text-gray-900">{m.name}</span>
                               <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{m.duration_days} Days</span>
                             </div>
                             <span className="text-[13px] font-medium text-gray-600">{m.dosage} — {m.instructions}</span>
                           </div>
                         ))}
                       </div>
                     </div>
                  )}
                  {prescription.notes && (
                    <div>
                      <span className="text-[13px] text-gray-500 font-medium block mb-1">Doctor's Notes</span>
                      <p className="text-sm text-gray-700 bg-yellow-50 p-3 rounded-lg border border-yellow-100 italic">{prescription.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Video Consultation / Clinic Address Card */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex flex-col">
              <h3 className="font-bold text-gray-900 text-[16px] mb-4">
                 {appointment.mode === 'ONLINE' ? 'Video Consultation' : 'Clinic Location'}
              </h3>
              
              {appointment.mode === 'ONLINE' ? (
                <div className="bg-[#111827] rounded-[20px] p-6 flex flex-col items-center justify-center text-center shadow-md relative overflow-hidden">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-4 shadow-inner ring-1 ring-white/5">
                    <Video className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="text-lg font-bold text-white mb-1 tracking-tight">Video Call Waiting Room</h4>
                  <p className="text-gray-400 text-[13px] mb-6 font-medium">Your patient will join here</p>
                  
                  <button 
                    onClick={() => window.open(appointment.linkOrAddress || 'https://meet.google.com/new', '_blank')}
                    className="w-full max-w-[280px] bg-[#2563EB] hover:bg-[#1D4ED8] hover:shadow-lg hover:-translate-y-0.5 text-white py-3 rounded-[12px] font-bold text-[14px] flex items-center justify-center transition-all duration-200">
                    <Video className="w-4 h-4 mr-2" /> Start Google Meet
                  </button>
                  <p className="text-gray-500 text-sm mt-5 mb-2">Link is active 5 minutes before appointment time</p>
                </div>
              ) : (
                <div className="bg-[#EFF6FF] rounded-[20px] p-6 flex flex-col items-center text-center border border-[#BFDBFE]">
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-4 text-[#3B82F6] shadow-sm">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <h4 className="text-lg font-bold text-[#1E3A8A] mb-2">Clinic Address</h4>
                  <p className="text-[#3B82F6] text-[14px] font-medium max-w-sm mb-6 leading-relaxed">
                    {appointment.linkOrAddress || '456 Medical Plaza, Suite 200, Downtown Hub, NY 10001'}
                  </p>
                </div>
              )}
            </div>

          </div>

          {/* Right Column - Chat */}
          <div className="bg-white rounded-2xl border border-gray-100 flex flex-col shadow-sm h-[calc(100vh-10rem)] lg:h-[calc(100vh-8rem)] lg:sticky lg:top-6 min-h-[400px]">
            {/* Chat Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Chat with {appointment.patientName}</h3>
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <span className="w-2 h-2 rounded-full bg-green-500 mr-2 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span> Online now
                </div>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="p-5 flex-1 overflow-y-auto flex flex-col gap-5 bg-gray-50/50">
              {messages.length === 0 ? (
                <div className="text-center text-sm text-gray-400 my-auto">No messages yet. Send a message to start the conversation!</div>
              ) : (
                messages.map((msg, index) => {
                  const isDoctor = msg.sender_role === 'doctor';
                  const t = new Date(msg.timestamp);
                  const timeString = isNaN(t.getTime()) ? '' : t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  return (
                    <div key={msg.id || index} className="flex flex-col gap-2">
                       <div className={`${isDoctor ? 'bg-[#2563EB] text-white self-end rounded-tr-sm shadow-sm' : 'bg-gray-100 text-gray-700 self-start rounded-tl-sm'} px-4 py-3 rounded-2xl text-[15px] max-w-[85%] font-medium leading-relaxed`}>
                        {msg.text}
                      </div>
                      <span className={`text-[11px] text-gray-400 font-medium ${isDoctor ? 'mr-1 self-end' : 'ml-1'}`}>
                        {timeString}
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-gray-100 bg-white shrink-0 mt-auto rounded-b-2xl">
              <div className="flex items-end gap-3 w-full">
                <button className="text-gray-400 hover:text-gray-600 pb-3 pl-1 transition-colors shrink-0">
                  <Paperclip className="w-5 h-5" />
                </button>
                <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex-1 focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-400 transition-all">
                  <textarea 
                    placeholder="Type your message..." 
                    className="w-full bg-transparent text-[15px] text-gray-700 focus:outline-none resize-none m-0 p-0 block placeholder-gray-400 font-medium"
                    rows="1"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                </div>
                <button onClick={handleSendMessage} className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors shadow-sm">
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
            
          </div>
        </div>
      </div>

      {/* Prescription Modal */}
      {showPrescriptionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[20px] w-full max-w-[600px] max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" /> {editMode ? 'Edit Prescription' : 'Issue Prescription'}
              </h2>
              <button onClick={() => setShowPrescriptionModal(false)} className="text-gray-400 hover:text-gray-700 bg-white shadow-sm p-1.5 rounded-full border border-gray-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-5">
              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-1">Diagnosis</label>
                <input type="text" value={prescForm.diagnosis} onChange={e => setPrescForm({...prescForm, diagnosis: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Primary condition..." />
              </div>
              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-1">Symptoms (comma separated)</label>
                <input type="text" value={prescForm.symptoms} onChange={e => setPrescForm({...prescForm, symptoms: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Fever, Cough, Headache" />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-[13px] font-bold text-gray-700">Medicines</label>
                  <button onClick={handleAddMedicine} className="text-xs bg-blue-50 text-blue-600 font-bold px-2 py-1 rounded-md flex items-center gap-1 hover:bg-blue-100 transition"><Plus className="w-3 h-3" /> Add Item</button>
                </div>
                {prescForm.medicines.length === 0 && <p className="text-xs text-gray-400 italic">No medicines added.</p>}
                <div className="space-y-3">
                  {prescForm.medicines.map((med, i) => (
                    <div key={i} className="flex flex-col gap-3 p-3 border border-gray-100 bg-gray-50 rounded-xl relative">
                      <button onClick={() => setPrescForm(prev => ({...prev, medicines: prev.medicines.filter((_, idx) => idx !== i)}))} className="absolute top-2 right-2 text-red-400 hover:text-red-600"><Trash className="w-4 h-4" /></button>
                      <div className="grid grid-cols-2 gap-3 pr-8">
                        <input type="text" placeholder="Medicine Name" value={med.name} onChange={e => { const m = [...prescForm.medicines]; m[i].name = e.target.value; setPrescForm({...prescForm, medicines: m}); }} className="border border-gray-200 rounded-lg px-3 py-2 text-xs w-full focus:ring-1 focus:ring-blue-500 outline-none" />
                        <input type="text" placeholder="Dosage (e.g., 500mg)" value={med.dosage} onChange={e => { const m = [...prescForm.medicines]; m[i].dosage = e.target.value; setPrescForm({...prescForm, medicines: m}); }} className="border border-gray-200 rounded-lg px-3 py-2 text-xs w-full focus:ring-1 focus:ring-blue-500 outline-none" />
                        <input type="number" placeholder="Days" value={med.duration_days} onChange={e => { const m = [...prescForm.medicines]; m[i].duration_days = parseInt(e.target.value) || 1; setPrescForm({...prescForm, medicines: m}); }} className="border border-gray-200 rounded-lg px-3 py-2 text-xs w-full focus:ring-1 focus:ring-blue-500 outline-none" min="1" />
                        <input type="text" placeholder="Instructions" value={med.instructions} onChange={e => { const m = [...prescForm.medicines]; m[i].instructions = e.target.value; setPrescForm({...prescForm, medicines: m}); }} className="border border-gray-200 rounded-lg px-3 py-2 text-xs w-full focus:ring-1 focus:ring-blue-500 outline-none" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-1">Additional Notes</label>
                <textarea rows="3" value={prescForm.notes} onChange={e => setPrescForm({...prescForm, notes: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none" placeholder="Drink plenty of water..." />
              </div>
            </div>

            <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0">
              <button onClick={() => { setShowPrescriptionModal(false); setEditMode(false); }} className="px-5 py-2.5 rounded-xl font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 text-sm">Cancel</button>
              <button onClick={submitPrescription} disabled={!prescForm.diagnosis || prescForm.medicines.length === 0} className="px-5 py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-sm shadow-sm">{editMode ? 'Save Changes' : 'Issue Prescription'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
