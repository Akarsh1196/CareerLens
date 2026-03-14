import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowLeft,
  Map,
  CheckCircle2,
  Circle
} from 'lucide-react';

export default function Roadmap() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  // In a real app, you might save roadmap progress to the DB.
  // We'll use local state for the demo feel.
  const [completedSteps, setCompletedSteps] = useState(new Set());

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

  const toggleStep = (stepIndex, itemIndex) => {
    const key = `${stepIndex}-${itemIndex}`;
    const newSet = new Set(completedSteps);
    if (newSet.has(key)) {
      newSet.delete(key);
    } else {
      newSet.add(key);
    }
    setCompletedSteps(newSet);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-base">
        <div className="w-12 h-12 border-4 border-border border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!report || !report.roadmap) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-bg-base p-6">
        <h2 className="text-xl font-semibold mb-4 text-text-base">Roadmap not found</h2>
        <button onClick={() => navigate('/dashboard')} className="text-primary hover:underline">
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-base pt-8 pb-20 px-4 md:px-8">
      
      <div className="max-w-3xl mx-auto">
        {/* Nav Bar */}
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-text-muted hover:text-text-base transition-colors mb-8"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Back to Dashboard</span>
        </button>

        {/* Header Hero */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4 text-primary">
            <Map size={32} />
            <h1 className="text-4xl md:text-5xl font-bold text-text-base tracking-tight">Your 12-Month Plan</h1>
          </div>
          <p className="text-xl text-text-muted">
            The step-by-step roadmap to transition into your top match: <strong className="text-text-base">{report.top_matches[0]?.title}</strong>.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative border-l-2 border-border ml-6 md:ml-8 space-y-12">
          {report.roadmap.map((phase, stepIndex) => (
            <div key={stepIndex} className="relative pl-8 md:pl-12">
              {/* Timeline Dot */}
              <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-primary ring-4 ring-bg-base"></div>
              
              <div className="bg-white border border-border rounded-3xl p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow">
                <span className="text-sm font-bold text-primary uppercase tracking-widest mb-2 block">
                  {phase.month_range}
                </span>
                <h3 className="text-2xl font-semibold mb-6 text-text-base">{phase.title}</h3>
                
                <ul className="flex flex-col gap-4">
                  {phase.action_items.map((item, itemIndex) => {
                    const isCompleted = completedSteps.has(`${stepIndex}-${itemIndex}`);
                    return (
                      <li 
                        key={itemIndex} 
                        className={`flex items-start gap-4 p-4 rounded-2xl cursor-pointer transition-all border ${
                          isCompleted 
                            ? 'bg-green-50/50 border-green-200/50' 
                            : 'bg-bg-base border-transparent hover:border-border'
                        }`}
                        onClick={() => toggleStep(stepIndex, itemIndex)}
                      >
                        <button className="mt-0.5 shrink-0 transition-colors">
                          {isCompleted ? (
                            <CheckCircle2 size={24} className="text-green-600" />
                          ) : (
                            <Circle size={24} className="text-text-muted" />
                          )}
                        </button>
                        <span className={`text-lg leading-relaxed ${isCompleted ? 'text-text-muted line-through decoration-text-muted/50' : 'text-text-base'}`}>
                          {item}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
