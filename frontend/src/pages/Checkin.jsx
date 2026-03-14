import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowLeft,
  CalendarDays,
  Activity,
  ChevronRight
} from 'lucide-react';

export default function Checkin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState({
    media: '',
    projects: '',
    excitement: ''
  });

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // In a real app we would send this to /api/checkin
      const response = await fetch('http://localhost:3001/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          answers
        }),
      });
      
      // Simulate API call for demo if backend not fully wired for checkin yet
      if (!response.ok) {
        // Fallback demo timeout
        await new Promise(r => setTimeout(r, 1500));
      }

      navigate('/dashboard');
    } catch (error) {
      console.error('Checkin Error:', error);
      // Fallback transition for demo
      setTimeout(() => navigate('/dashboard'), 1000);
    }
  };

  const handleNext = () => {
    if (step === 3) {
      handleSubmit();
    } else {
      setStep(s => s + 1);
    }
  };

  const currentAnswer = 
    step === 1 ? answers.media :
    step === 2 ? answers.projects :
    answers.excitement;

  const updateAnswer = (val) => {
    if (step === 1) setAnswers({...answers, media: val});
    else if (step === 2) setAnswers({...answers, projects: val});
    else setAnswers({...answers, excitement: val});
  };

  return (
    <div className="min-h-screen bg-bg-base flex flex-col pt-8 pb-20 px-6">
      
      <div className="w-full max-w-2xl mx-auto flex flex-col flex-1">
        {/* Nav Bar */}
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-text-muted hover:text-text-base transition-colors w-fit mb-12"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Back to Dashboard</span>
        </button>

        {/* Header Phase */}
        {step === 0 && (
          <div className="flex-1 flex flex-col justify-center animate-in fade-in slide-in-from-bottom-4">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-8 shadow-inner">
              <CalendarDays size={32} />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-text-base mb-4 tracking-tight">
              Monthly Check-in
            </h1>
            <p className="text-xl text-text-muted mb-12 max-w-lg leading-relaxed">
              Your interests shift over time. Let's recalibrate your career compass to make sure your roadmap matches who you are today.
            </p>
            <button 
              onClick={() => setStep(1)}
              className="w-full md:w-auto flex items-center justify-center gap-3 bg-black text-white px-8 py-4 rounded-xl font-medium shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgb(0,0,0,0.2)] transition-all text-lg"
            >
              Start Calibration
            </button>
          </div>
        )}

        {/* Question Phase */}
        {step > 0 && (
          <div className="flex-1 flex flex-col justify-center animate-in fade-in slide-in-from-bottom-4">
            
            <div className="flex items-center gap-2 text-primary font-bold text-sm tracking-wider uppercase mb-8">
              <Activity size={18} />
              <span>Signal Check {step}/3</span>
            </div>

            <h2 className="text-3xl md:text-4xl font-semibold mb-8 text-text-base leading-tight">
              {step === 1 && "What have you been mostly watching or reading this month?"}
              {step === 2 && "Have you worked on any personal projects? What were they?"}
              {step === 3 && "Has anything changed in what genuinely excites you right now?"}
            </h2>

            <textarea 
              autoFocus
              value={currentAnswer}
              onChange={(e) => updateAnswer(e.target.value)}
              placeholder="Be honest, don't overthink it..."
              rows={5}
              className="w-full text-xl md:text-2xl border border-border rounded-2xl focus:border-primary focus:ring-4 focus:ring-primary/10 bg-white p-6 outline-none transition-all placeholder:text-text-muted/50 resize-none shadow-sm mb-8"
            />

            <button
              onClick={handleNext}
              disabled={loading || !currentAnswer.trim()}
              className={`w-full md:w-auto md:ml-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-lg font-medium transition-all shadow-md ${
                !currentAnswer.trim()
                  ? 'bg-border text-text-muted cursor-not-allowed opacity-70'
                  : 'bg-black text-white hover:-translate-y-0.5'
              }`}
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  {step === 3 ? 'Save & Recalibrate' : 'Next'}
                  {step < 3 && <ChevronRight size={20} />}
                </>
              )}
            </button>

          </div>
        )}

      </div>
    </div>
  );
}
