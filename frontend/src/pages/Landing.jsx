import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Compass, 
  Map, 
  Activity, 
  Zap,
  ArrowRight
} from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleCTA = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-bg-base text-text-base flex flex-col pt-6 overflow-x-hidden">
      
      {/* Navbar */}
      <nav className="w-full max-w-6xl mx-auto px-6 py-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-2 text-text-base">
          <Compass className="text-primary" size={28} />
          <span className="text-xl font-bold tracking-tight">CareerLens</span>
        </div>
        <button 
          onClick={handleCTA}
          className="bg-black text-white px-6 py-2.5 rounded-full font-medium text-sm hover:-translate-y-0.5 transition-all shadow-md"
        >
          {user ? 'Go to Dashboard' : 'Sign In'}
        </button>
      </nav>

      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 mt-16 md:mt-24 mb-32 z-10 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl -z-10"></div>
        
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-semibold mb-8">
          <Zap size={16} />
          AI-Powered Career Mapping
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold text-center max-w-4xl tracking-tight leading-[1.1] mb-8">
          Don't follow passion.<br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-teal-400">
            Follow your signals.
          </span>
        </h1>
        
        <p className="text-xl md:text-2xl text-text-muted text-center max-w-2xl mb-12 leading-relaxed font-light">
          We analyze your natural behavior—what you watch, read, and do at 11 PM—to generate a career identity and a 12-month roadmap that actually fits you.
        </p>

        <button 
          onClick={handleCTA}
          className="group flex items-center gap-3 bg-primary text-white px-10 py-5 rounded-2xl text-xl font-medium shadow-[0_8px_30px_rgb(59,130,246,0.3)] hover:-translate-y-1 transition-all"
        >
          Find Your Career Identity
          <ArrowRight className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Features Grid */}
      <div className="bg-white py-24 border-t border-border">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How CareerLens Works</h2>
            <p className="text-text-muted text-lg">Stop relying on generic career tests.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div className="bg-bg-base p-8 rounded-3xl border border-border">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                <Activity size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">Signal Extraction</h3>
              <p className="text-text-muted leading-relaxed">
                A conversational onboarding flow that asks about your raw behavior, not your desired job title. We map the domains you naturally gravitate towards.
              </p>
            </div>

            <div className="bg-bg-base p-8 rounded-3xl border border-border">
              <div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-6">
                <Compass size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">Identity Synthesis</h3>
              <p className="text-text-muted leading-relaxed">
                Connect the dots between your education and natural interests to build your distinct Career Identity and highlight "The Gap nobody told you about".
              </p>
            </div>

            <div className="bg-bg-base p-8 rounded-3xl border border-border">
              <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6">
                <Map size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">12-Month Roadmap</h3>
              <p className="text-text-muted leading-relaxed">
                Get a step-by-step Execution Plan bridging the skills you have to the skills you need for your #1 top career match.
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 text-center text-text-muted text-sm border-t border-border bg-white">
        &copy; {new Date().getFullYear()} CareerLens. Built with signals.
      </footer>

    </div>
  );
}
