import { useAuth } from '../context/AuthContext';
import { LogIn } from 'lucide-react';
import { Navigate } from 'react-router-dom';

export default function Login() {
  const { user, signInWithGoogle } = useAuth();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-bg-base text-text-base flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-sm border border-border p-10 text-center flex flex-col items-center">
        <h1 className="text-4xl font-bold mb-3 text-primary tracking-tight">CareerLens</h1>
        <p className="text-text-muted mb-8 text-lg">Generate your career roadmap using behavioral signals.</p>
        
        <button 
          onClick={signInWithGoogle}
          className="flex items-center justify-center gap-3 w-full bg-text-base text-white hover:bg-black transition-colors px-6 py-4 rounded-xl font-medium text-lg"
        >
          <LogIn size={20} />
          Continue with Google
        </button>
        
        <p className="mt-6 text-sm text-text-muted">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
