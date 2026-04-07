import { Link, useNavigate } from 'react-router-dom';
import { Heart, Video, MapPin, Clock, Shield, Star, ArrowRight, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const features = [
  { icon: Video, title: 'Online Consultations', desc: 'Video call with certified doctors from anywhere, anytime.' },
  { icon: MapPin, title: 'In-Clinic Visits', desc: 'Book physical appointments at your nearest clinic.' },
  { icon: Clock, title: 'Real-Time Availability', desc: 'See live slot availability and book instantly.' },
  { icon: Shield, title: 'Secure & Private', desc: 'Your health data is protected and encrypted end-to-end.' },
];

const specialties = ['Cardiology', 'Dermatology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Psychiatry'];

export default function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleBook = (mode) => {
    if (user) {
      navigate(`/patient/book?mode=${mode}`);
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur border-b border-gray-100 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">MediCare</span>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <button
                onClick={() => navigate(`/${user.role}/dashboard`)}
                className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
              >
                Go to Dashboard
              </button>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 hover:text-gray-900 text-sm font-medium px-4 py-2">
                  Sign In
                </Link>
                <Link to="/register" className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-28 pb-20 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <CheckCircle className="w-4 h-4" />
            Trusted by 50,000+ patients
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
            Your Health,{' '}
            <span className="text-blue-600">Your Schedule</span>
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10">
            Book online video consultations or in-clinic visits with top specialists — in seconds. Real-time slot locking ensures no double bookings, ever.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => handleBook('ONLINE')}
              className="flex items-center gap-3 bg-blue-600 text-white px-8 py-4 rounded-xl text-base font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-200"
            >
              <Video className="w-5 h-5" />
              Book Online Consultation
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleBook('OFFLINE')}
              className="flex items-center gap-3 bg-white text-gray-800 border border-gray-200 px-8 py-4 rounded-xl text-base font-semibold hover:border-blue-300 hover:text-blue-600 transition shadow-sm"
            >
              <MapPin className="w-5 h-5" />
              Book Clinic Visit
            </button>
          </div>
        </div>
      </section>

      {/* Specialties */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Browse by Specialty</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {specialties.map((s) => (
              <button
                key={s}
                onClick={() => navigate('/login')}
                className="px-5 py-2.5 rounded-full border border-gray-200 text-gray-700 text-sm font-medium hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Why MediCare?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to take care of your health?</h2>
          <p className="text-blue-100 mb-8">Join thousands of patients who trust MediCare for their healthcare needs.</p>
          <Link to="/register" className="inline-block bg-white text-blue-600 font-semibold px-8 py-3 rounded-xl hover:bg-blue-50 transition">
            Create Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 text-sm py-8 text-center">
        <p>© 2024 MediCare. All rights reserved.</p>
      </footer>
    </div>
  );
}
