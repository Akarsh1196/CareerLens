import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowLeft,
  Briefcase,
  Users,
  Target,
  Wrench,
  Clock,
  ExternalLink
} from 'lucide-react';
import { API_ENDPOINTS } from '../lib/api';

export default function CareerMatchDetail() {
  const { matchIndex } = useParams();
  const { user } = useAuth();
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
      const res = await fetch(API_ENDPOINTS.report(user?.id));
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-base">
        <div className="w-12 h-12 border-4 border-border border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!report || !report.top_matches[matchIndex]) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-bg-base p-6">
        <h2 className="text-xl font-semibold mb-4 text-text-base">Match not found</h2>
        <button onClick={() => navigate('/dashboard')} className="text-primary hover:underline">
          Return to Dashboard
        </button>
      </div>
    );
  }

  const match = report.top_matches[matchIndex];
  const isTopMatch = parseInt(matchIndex) === 0;

  return (
    <div className="min-h-screen bg-bg-base pt-8 pb-20 px-4 md:px-8">
      
      <div className="max-w-4xl mx-auto">
        {/* Nav Bar */}
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-text-muted hover:text-text-base transition-colors mb-8"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Back to Dashboard</span>
        </button>

        {/* Header Hero */}
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-border mb-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="px-3 py-1 bg-green-50 text-green-700 text-sm font-bold rounded-full">
                  {match.percentage}% Match Score
                </span>
                {isTopMatch && (
                  <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-bold rounded-full">
                    #1 Recommendation
                  </span>
                )}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-text-base mb-4 tracking-tight">
                {match.title}
              </h1>
              <p className="text-xl text-text-muted max-w-2xl leading-relaxed">
                {match.explanation}
              </p>
            </div>
            
            <div className="p-5 bg-bg-base rounded-2xl flex items-center justify-center shrink-0">
              <Briefcase size={56} className="text-primary opacity-80" />
            </div>
          </div>
          
          <button 
            onClick={() => navigate('/roadmap')}
            className="w-full md:w-auto bg-black text-white px-8 py-4 rounded-xl font-medium shadow-md hover:-translate-y-0.5 transition-all text-center"
          >
            Show me the roadmap for this
          </button>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Day in the Life */}
          <div className="col-span-1 md:col-span-2 bg-white rounded-3xl p-8 border border-border shadow-sm">
            <div className="flex items-center gap-3 mb-6 block text-primary">
              <Clock size={24} />
              <h3 className="text-2xl font-semibold text-text-base">A Day in the Life</h3>
            </div>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              {report.day_in_life?.map((item, i) => (
                <li key={i} className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                    {i + 1}
                  </div>
                  <p className="text-text-muted pt-1">{item}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* Real Indian Examples */}
          <div className="bg-white rounded-3xl p-8 border border-border shadow-sm">
            <div className="flex items-center gap-3 mb-6 text-orange-600">
              <Users size={24} />
              <h3 className="text-2xl font-semibold text-text-base">Real World Examples</h3>
            </div>
            <p className="text-text-muted mb-6">Indian professionals who successfully navigated this exact path.</p>
            <div className="flex flex-col gap-4">
              {report.indian_examples?.map((person, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-bg-base rounded-xl border border-border">
                  <span className="font-medium text-text-base">{person}</span>
                  <ExternalLink size={16} className="text-text-muted" />
                </div>
              ))}
            </div>
          </div>

          {/* The Give and Take */}
          <div className="flex flex-col gap-6">
            {/* Skill Bridge */}
            <div className="bg-green-50/50 rounded-3xl p-8 border border-green-100 flex-1">
              <div className="flex items-center gap-3 mb-4 text-green-700">
                <Target size={24} />
                <h3 className="text-xl font-semibold">The Advantage</h3>
              </div>
              <p className="text-green-900/80 leading-relaxed font-medium">
                {report.skill_bridge}
              </p>
            </div>

            {/* Skill Gap */}
            <div className="bg-red-50/50 rounded-3xl p-8 border border-red-100 flex-1">
              <div className="flex items-center gap-3 mb-4 text-red-700">
                <Wrench size={24} />
                <h3 className="text-xl font-semibold">The Hurdle</h3>
              </div>
              <p className="text-red-900/80 leading-relaxed font-medium">
                {report.skill_gap}
              </p>
            </div>
          </div>
          
        </div>

      </div>
    </div>
  );
}
