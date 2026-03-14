import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  ArrowLeft,
  ChevronRight,
  Check
} from 'lucide-react';
import { onboardingQuestions } from '../data/onboardingQuestions';
import { useAuth } from '../context/AuthContext';

export default function Onboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});

  const question = onboardingQuestions[currentIndex];
  const isLastQuestion = currentIndex === onboardingQuestions.length - 1;
  const progressPercent = ((currentIndex + 1) / onboardingQuestions.length) * 100;

  const handleNext = async () => {
    if (isLastQuestion) {
      try {
        const response = await fetch('http://localhost:3001/api/onboarding', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.id,
            email: user?.email || '',
            answers: answers
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to save answers');
        }

        navigate('/dashboard');
      } catch (error) {
        console.error('Error saving answers:', error);
        alert('Could not save your answers. Please try again.');
      }
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const currentAnswer = answers[question.id] || '';

  const canProceed = 
    question.skippable || 
    (question.type === 'rating_grid' 
      ? question.skills.every(s => answers[`${question.id}_${s.id}`]) 
      : Boolean(currentAnswer));

  // Auto-advance for select if an option is clicked (optional enhancement)
  const isSelectAnswered = question.type === 'select' && currentAnswer;

  return (
    <div className="min-h-screen bg-bg-base text-text-base flex flex-col items-center pt-16 px-6 pb-20 overflow-x-hidden">
      
      {/* Progress Bar Header */}
      <div className="w-full max-w-2xl flex flex-col mb-12">
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={handleBack}
            disabled={currentIndex === 0}
            className={`p-2 -ml-2 rounded-full transition-colors ${
              currentIndex === 0 ? 'text-text-muted/30 cursor-not-allowed' : 'text-text-muted hover:bg-black/5 hover:text-text-base'
            }`}
          >
            <ArrowLeft size={24} />
          </button>
          <span className="text-sm font-medium text-text-muted tracking-wider uppercase">
             Block {question.block} / 8
          </span>
          <div className="w-10"></div> {/* Spacer for centering */}
        </div>

        <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Main Question Container */}
      <div className="w-full max-w-2xl flex-1 flex flex-col justify-center animate-in fade-in slide-in-from-bottom-4 duration-500" key={currentIndex}>
        <h2 className="text-3xl md:text-4xl font-semibold mb-8 text-text-base leading-tight">
          {question.text}
        </h2>

        {/* Dynamic Input Types */}
        <div className="w-full">
          {question.type === 'text' && (
            <input 
              autoFocus
              type="text"
              value={currentAnswer || ''}
              onChange={(e) => setAnswers({ ...answers, [question.id]: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && canProceed && handleNext()}
              placeholder={question.placeholder}
              className="w-full text-2xl md:text-3xl border-b-2 border-border focus:border-primary bg-transparent py-3 outline-none transition-colors placeholder:text-border"
            />
          )}

          {question.type === 'number' && (
            <input 
              autoFocus
              type="number"
              value={currentAnswer || ''}
              onChange={(e) => setAnswers({ ...answers, [question.id]: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && canProceed && handleNext()}
              placeholder={question.placeholder}
              className="w-full text-2xl md:text-3xl border-b-2 border-border focus:border-primary bg-transparent py-3 outline-none transition-colors placeholder:text-border"
            />
          )}

          {question.type === 'textarea' && (
            <textarea 
              autoFocus
              value={currentAnswer || ''}
              onChange={(e) => setAnswers({ ...answers, [question.id]: e.target.value })}
              placeholder={question.placeholder}
              rows={4}
              className="w-full text-xl md:text-2xl border border-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary bg-white p-5 py-4 outline-none transition-all placeholder:text-text-muted/50 resize-none shadow-sm"
            />
          )}

          {question.type === 'select' && (
            <div className="flex flex-col gap-3">
              {question.options?.map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    setAnswers({ ...answers, [question.id]: opt });
                    // Optional: automatically go to next here
                  }}
                  className={`w-full text-left p-5 rounded-xl border text-xl transition-all shadow-sm ${
                    currentAnswer === opt 
                      ? 'border-primary bg-primary/5 text-primary' 
                      : 'border-border bg-white text-text-base hover:border-text-muted'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{opt}</span>
                    {currentAnswer === opt && <Check size={20} />}
                  </div>
                </button>
              ))}
            </div>
          )}

          {question.type === 'rating_grid' && (
            <div className="grid gap-6 md:grid-cols-2">
              {question.skills?.map((skill) => {
                const val = answers[`${question.id}_${skill.id}`] || '';
                return (
                  <div key={skill.id} className="flex flex-col gap-2 bg-white p-4 rounded-xl border border-border shadow-sm">
                    <label className="font-medium text-text-base">{skill.label}</label>
                    <input 
                      type="range"
                      min="1"
                      max="10"
                      value={val || 5}
                      onChange={(e) => setAnswers({ ...answers, [`${question.id}_${skill.id}`]: e.target.value })}
                      className="w-full accent-primary"
                    />
                    <div className="flex justify-between text-xs text-text-muted px-1">
                      <span>1 (Low)</span>
                      <span className="font-medium text-primary text-sm">{val || 'Select'}</span>
                      <span>10 (High)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Action Bottom Bar */}
        <div className="mt-12 flex flex-col gap-4">
          <button
            onClick={handleNext}
            disabled={!canProceed}
            className={`w-full md:w-auto md:ml-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-lg font-medium transition-all shadow-md ${
              canProceed 
                ? 'bg-black text-white hover:bg-black/80 hover:-translate-y-0.5' 
                : 'bg-border text-text-muted cursor-not-allowed opacity-70'
            }`}
          >
            {isLastQuestion ? 'Generate My Report' : 'Next'}
            {isLastQuestion ? <ArrowRight size={20} /> : <ChevronRight size={20} />}
          </button>
          
          {question.skippable && !currentAnswer && (
            <button
              onClick={handleNext}
              className="text-text-muted text-center hover:text-text-base transition-colors md:ml-auto md:mr-4 w-full md:w-auto"
            >
              Skip for now
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
