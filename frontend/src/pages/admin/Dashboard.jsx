import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { BarChart3, TrendingUp, Video, MapPin, Users, DollarSign, Loader2, Calendar } from 'lucide-react';

export default function AdminDashboard() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/reports/daily-summary')
      .then(({ data }) => setReport(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  const modeData = report?.by_mode || [];
  const specData = report?.by_specialty || [];
  const statusData = report?.by_status || [];
  const trendData = report?.trend_7_days || [];
  const totalRevenue = modeData.reduce((s, m) => s + m.revenue, 0);
  const totalAppts = modeData.reduce((s, m) => s + m.count, 0);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 mt-0.5">Overview of appointments and revenue analytics</p>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-3">
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{report?.today?.total_appointments || 0}</p>
          <p className="text-sm text-gray-500">Today's Appointments</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center mb-3">
            <DollarSign className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">${report?.today?.total_revenue?.toFixed(0) || 0}</p>
          <p className="text-sm text-gray-500">Today's Revenue</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center mb-3">
            <Users className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalAppts}</p>
          <p className="text-sm text-gray-500">All-Time Appointments</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center mb-3">
            <TrendingUp className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">${totalRevenue.toFixed(0)}</p>
          <p className="text-sm text-gray-500">Total Revenue</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue by Mode */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-5 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-600" /> Revenue by Mode
          </h2>
          {modeData.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">No data yet</p>
          ) : (
            <div className="space-y-4">
              {modeData.map((m) => {
                const pct = totalRevenue > 0 ? (m.revenue / totalRevenue) * 100 : 0;
                return (
                  <div key={m.mode}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        {m.mode === 'ONLINE' ? <Video className="w-4 h-4 text-blue-500" /> : <MapPin className="w-4 h-4 text-orange-500" />}
                        {m.mode}
                      </span>
                      <span className="text-sm font-bold text-gray-900">${m.revenue.toFixed(0)} <span className="font-normal text-gray-400 text-xs">({m.count} appts)</span></span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all ${m.mode === 'ONLINE' ? 'bg-blue-500' : 'bg-orange-500'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Status Breakdown */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-5 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-purple-600" /> Appointment Status
          </h2>
          {statusData.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">No data yet</p>
          ) : (
            <div className="space-y-3">
              {statusData.map((s) => {
                const colors = { SCHEDULED: 'bg-blue-500', COMPLETED: 'bg-green-500', CANCELLED: 'bg-red-400' };
                const pct = totalAppts > 0 ? (s.count / totalAppts) * 100 : 0;
                return (
                  <div key={s.status}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-gray-700 capitalize">{s.status}</span>
                      <span className="text-sm font-bold text-gray-900">{s.count} <span className="text-xs text-gray-400">({pct.toFixed(0)}%)</span></span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                      <div className={`h-2.5 rounded-full transition-all ${colors[s.status] || 'bg-gray-300'}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Revenue by Specialty */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-5 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-green-600" /> Revenue by Specialty
        </h2>
        {specData.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-6">No data yet</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-100">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-5 font-medium text-gray-500">Specialty</th>
                  <th className="text-right py-3 px-5 font-medium text-gray-500">Appointments</th>
                  <th className="text-right py-3 px-5 font-medium text-gray-500">Revenue</th>
                  <th className="text-right py-3 px-5 font-medium text-gray-500">Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {specData.map((s) => (
                  <tr key={s.specialty} className="hover:bg-gray-50/50">
                    <td className="py-3 px-5 font-medium text-gray-900">{s.specialty}</td>
                    <td className="py-3 px-5 text-right text-gray-600">{s.count}</td>
                    <td className="py-3 px-5 text-right font-semibold text-gray-900">${s.revenue.toFixed(0)}</td>
                    <td className="py-3 px-5 text-right text-gray-500">{((s.revenue / totalRevenue) * 100).toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 7-Day Trend */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-semibold text-gray-900 mb-5 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-600" /> 7-Day Trend
        </h2>
        {trendData.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-6">No data yet</p>
        ) : (
          <div className="flex items-end gap-2 h-40">
            {trendData.map((d) => {
              const maxC = Math.max(...trendData.map((t) => t.count), 1);
              const height = (d.count / maxC) * 100;
              return (
                <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs font-semibold text-gray-700">{d.count}</span>
                  <div className="w-full bg-blue-500 rounded-t-lg transition-all hover:bg-blue-600" style={{ height: `${Math.max(height, 5)}%` }} />
                  <span className="text-[10px] text-gray-400 mt-1">{d.date?.slice(5)}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
