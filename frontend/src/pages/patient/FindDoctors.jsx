import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { Search, MapPin, Video, Building2, Star, ChevronRight, Stethoscope, Loader2 } from 'lucide-react';

export default function FindDoctors() {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  
  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [locationStr, setLocationStr] = useState('');
  const [selSpecialty, setSelSpecialty] = useState('Any');
  const [selMode, setSelMode] = useState('Any');

  useEffect(() => {
    // Fetch specialties
    api.get('/api/specialties').then((res) => {
      setSpecialties(res.data.specialties || []);
    }).catch(console.error);

    // Initial fetch of doctors
    fetchDoctors();
  }, []);

  const fetchDoctors = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setSearched(true);
    try {
      const params = {};
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (locationStr.trim()) params.location = locationStr.trim();
      if (selSpecialty !== 'Any') params.specialty = selSpecialty;
      if (selMode !== 'Any') params.mode = selMode;

      const { data } = await api.get('/api/doctors', { params });
      setDoctors(data.doctors || []);
    } catch (err) {
      console.error(err);
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-16">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-10 md:p-14 text-white shadow-xl relative overflow-hidden mb-10">
        <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
          <Stethoscope className="w-64 h-64 scale-150 transform rotate-12" />
        </div>
        
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Find the right doctor, right now.
          </h1>
          <p className="text-blue-100 text-lg mb-8 max-w-xl">
            Search from hundreds of trusted health professionals by location, specialty, or consultation mode.
          </p>
        </div>

        {/* Filter Bar (Floating) */}
        <form 
          onSubmit={fetchDoctors}
          className="relative z-20 bg-white p-3 md:p-4 rounded-2xl shadow-2xl flex flex-col md:flex-row gap-3 items-center"
        >
          {/* Search by Name */}
          <div className="flex items-center w-full bg-gray-50 rounded-xl px-4 py-3 border border-gray-100 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition">
            <Search className="w-5 h-5 text-gray-400 mr-3" />
            <input 
              type="text" 
              placeholder="Doctor name..."
              className="bg-transparent w-full text-gray-800 focus:outline-none placeholder-gray-400 font-medium"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Search by Location */}
          <div className="flex items-center w-full bg-gray-50 rounded-xl px-4 py-3 border border-gray-100 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition">
            <MapPin className="w-5 h-5 text-gray-400 mr-3" />
            <input 
              type="text" 
              placeholder="City or Address..."
              className="bg-transparent w-full text-gray-800 focus:outline-none placeholder-gray-400 font-medium"
              value={locationStr}
              onChange={(e) => setLocationStr(e.target.value)}
            />
          </div>

          {/* Specialty Dropdown */}
          <div className="w-full relative">
            <select
              className="w-full bg-gray-50 rounded-xl px-4 py-3 border border-gray-100 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 font-medium text-gray-700 appearance-none cursor-pointer"
              value={selSpecialty}
              onChange={(e) => setSelSpecialty(e.target.value)}
            >
              <option value="Any">All Specialties</option>
              {specialties.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <ChevronRight className="w-4 h-4 text-gray-400 rotate-90" />
            </div>
          </div>

          {/* Mode Dropdown */}
          <div className="w-full relative">
            <select
              className="w-full bg-gray-50 rounded-xl px-4 py-3 border border-gray-100 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 font-medium text-gray-700 appearance-none cursor-pointer"
              value={selMode}
              onChange={(e) => setSelMode(e.target.value)}
            >
              <option value="Any">Any Mode</option>
              <option value="ONLINE">Online</option>
              <option value="OFFLINE">Offline</option>
            </select>
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <ChevronRight className="w-4 h-4 text-gray-400 rotate-90" />
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit"
            className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] transition-transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center whitespace-nowrap"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Search'}
          </button>
        </form>
      </div>

      {/* Results Section */}
      <div className="px-2">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {searched ? 'Search Results' : 'Available Doctors'}
          </h2>
          <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {doctors.length} found
          </span>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            <p className="text-gray-500 font-medium">Searching for doctors...</p>
          </div>
        ) : doctors.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <Search className="w-10 h-10 text-blue-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">No doctors found</h3>
            <p className="text-gray-500 max-w-sm mt-2">
              We couldn't find any doctors matching your current filters. Try adjusting your search criteria or location.
            </p>
            <button 
              onClick={() => {
                setSearchQuery(''); setLocationStr(''); setSelSpecialty('Any'); setSelMode('Any');
                setTimeout(() => fetchDoctors(), 0);
              }}
              className="mt-6 text-blue-600 font-medium hover:text-blue-700 underline underline-offset-4"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map(doc => (
              <div key={doc.id} className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] hover:shadow-lg transition-all flex flex-col h-full overflow-hidden group">
                <div className="p-6 flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-4">
                      {/* Avatar Placeholder */}
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 border-2 border-white shadow-sm flex items-center justify-center text-blue-700 font-bold text-xl">
                        {doc.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">Dr. {doc.name}</h3>
                        <span className="inline-block bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-md mt-1">
                          {doc.specialty}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mt-5">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Experience</span>
                      <span className="font-semibold text-gray-900">{doc.experience_years || 0} Years</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Consultation Fee</span>
                      <span className="font-bold text-green-600">${doc.fee}</span>
                    </div>

                    <div className="pt-2 mt-2 border-t border-gray-100 space-y-2">
                      <div className="flex items-start gap-2 text-sm text-gray-600">
                        {doc.mode === 'ONLINE' ? <Video className="w-4 h-4 mt-0.5 text-blue-500" /> : <Building2 className="w-4 h-4 mt-0.5 text-purple-500" />}
                        <span className="font-medium">{doc.mode === 'ONLINE' ? 'Video Consultation' : 'In-Person Clinic'}</span>
                      </div>
                      
                      {doc.clinic_address && (
                        <div className="flex items-start gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4 mt-0.5 text-gray-400 shrink-0" />
                          <span className="line-clamp-2">{doc.clinic_address}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-50/50 border-t border-gray-100">
                  <button 
                    onClick={() => navigate(`/patient/book?doctor_id=${doc.id}`)}
                    className="w-full bg-white hover:bg-blue-50 text-blue-600 border border-blue-200 font-bold py-2.5 rounded-xl transition-colors flex justify-center items-center gap-2 group-hover:bg-blue-600 group-hover:text-white"
                  >
                    <span>Book Appointment</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
