import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Briefcase, 
  Map, 
  TrendingUp, 
  Zap, 
  ShieldAlert, 
  LogOut,
  ChevronRight,
  FileText,
  Activity
} from 'lucide-react';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchReport();
    }
  }, [user]);

  const fetchReport = async () => {
    try {
      const res = await fetch(`http://localhost:3001/api/report/${user?.id}`);
      if (res.ok) {
        const data = await res.json();
        setReport(data.report);
      }
    } catch (error) {
      console.error('Error fetching report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-bg-base">
        <div className="w-12 h-12 border-4 border-border border-t-primary rounded-full animate-spin mb-4"></div>
        <p className="text-text-muted">Loading your career framework...</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-bg-base p-6 text-center">
        <h2 className="text-2xl font-semibold mb-4 text-text-base">No Report Found</h2>
        <p className="text-text-muted mb-8 max-w-md">You haven't completed your career onboarding yet. Let's map out your signals.</p>
        <button 
          onClick={() => navigate('/onboarding')}
          className="bg-black text-white px-8 py-4 rounded-xl font-medium shadow-md hover:-translate-y-0.5 transition-all"
        >
          Start Onboarding
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-base pt-10 pb-20 px-4 md:px-8">
      
      {/* Header */}
      <div className="max-w-5xl mx-auto flex items-center justify-between mb-12">
        <h1 className="text-2xl font-bold tracking-tight text-text-base">CareerLens</h1>
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate('/checkin')}
            className="flex items-center gap-2 text-primary hover:text-primary-hover font-medium transition-colors"
          >
            <Activity size={18} />
            <span className="text-sm">Signal Check-in</span>
          </button>
          <button 
            onClick={handleSignOut}
            className="flex items-center gap-2 text-text-muted hover:text-text-base transition-colors"
          >
            <LogOut size={18} />
            <span className="text-sm font-medium">Sign Out</span>
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Main Identity Card */}
        <div className="md:col-span-3 bg-gradient-to-br from-gray-900 to-black rounded-3xl p-8 md:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Briefcase size={120} />
          </div>
          <div className="relative z-10">
            <span className="text-white/60 text-sm font-bold uppercase tracking-widest mb-4 block">Your Career Identity</span>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-300">
              {report.career_identity}
            </h2>
            <p className="text-lg md:text-xl text-white/80 max-w-2xl leading-relaxed">
              {report.career_identity_description}
            </p>
          </div>
        </div>

        {/* Top Matches */}
        <div className="md:col-span-2 bg-white border border-border rounded-3xl p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <TrendingUp size={24} />
            </div>
            <h3 className="text-xl font-semibold">Top Career Matches</h3>
          </div>
          
          <div className="flex flex-col gap-4">
            {report.top_matches.map((match, i) => (
              <div key={i} className="flex flex-col md:flex-row md:items-center justify-between p-4 md:p-5 border border-border rounded-2xl group hover:border-primary/30 transition-colors">
                <div className="flex-1 mb-3 md:mb-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-bold text-lg">{match.title}</span>
                    <span className="px-2.5 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full">
                      {match.percentage}% Match
                    </span>
                  </div>
                  <p className="text-sm text-text-muted">{match.explanation}</p>
                </div>
                <button 
                  onClick={() => navigate(`/matches/${i}`)}
                  className="w-full md:w-auto flex items-center justify-center gap-2 bg-text-base text-white px-5 py-2.5 rounded-xl font-medium opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Details <ChevronRight size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* The Gap & Strengths */}
        <div className="md:col-span-1 flex flex-col gap-6">
          <div className="bg-[#fff8f1] border border-[#ffe4cc] rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4 text-orange-600">
              <ShieldAlert size={20} />
              <h3 className="font-semibold">The Insight Gap</h3>
            </div>
            <p className="text-sm leading-relaxed text-orange-900/80 font-medium">
              {report.misalignment_insight}
            </p>
          </div>

          <div className="bg-white border border-border rounded-3xl p-6 shadow-sm flex-1">
            <div className="flex items-center gap-2 mb-4 text-primary">
              <Zap size={20} />
              <h3 className="font-semibold text-text-base">Natural Strengths</h3>
            </div>
            <ul className="flex flex-col gap-3">
              {report.strengths.map((str, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                  <span className="text-sm text-text-muted leading-relaxed">{str}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Next Steps CTA */}
        <div className="md:col-span-3 bg-white border border-border rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between shadow-sm">
          <div>
            <h3 className="text-xl font-semibold mb-2">Ready to take action?</h3>
            <p className="text-text-muted">View your personalized 12-month roadmap or download your full analysis.</p>
          </div>
          <div className="mt-4 md:mt-0 flex flex-col sm:flex-row w-full md:w-auto gap-4">
            <button 
              onClick={() => navigate('/report')}
              className="flex flex-1 items-center justify-center gap-2 bg-blue-50 text-blue-600 px-6 py-4 rounded-xl font-medium hover:bg-blue-100 transition-colors"
            >
              <FileText size={20} />
              Full Report
            </button>
            <button 
              onClick={() => navigate('/roadmap')}
              className="flex flex-1 items-center justify-center gap-2 bg-black text-white px-8 py-4 rounded-xl font-medium shadow-md hover:-translate-y-0.5 transition-all"
            >
              <Map size={20} />
              View Roadmap
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
