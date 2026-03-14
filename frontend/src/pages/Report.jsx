import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { CareerReportPDF } from '../components/CareerReportPDF';
import { 
  ArrowLeft,
  Download,
  FileText,
  BadgeCheck
} from 'lucide-react';

export default function Report() {
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-base">
        <div className="w-12 h-12 border-4 border-border border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-bg-base p-6">
        <h2 className="text-xl font-semibold mb-4 text-text-base">Report not found</h2>
        <button onClick={() => navigate('/dashboard')} className="text-primary hover:underline">
          Return to Dashboard
        </button>
      </div>
    );
  }

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
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-border mb-8 text-center flex flex-col items-center">
          <div className="p-5 bg-blue-50 text-blue-600 rounded-2xl mb-6">
            <FileText size={48} />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-text-base mb-4 tracking-tight">
            Your Complete Career Analysis
          </h1>
          <p className="text-xl text-text-muted max-w-2xl leading-relaxed mb-8">
            The full synthesis of your behavioral signals, strengths, and optimal career pathways.
          </p>
          
          <PDFDownloadLink
            document={<CareerReportPDF report={report} user={user} />}
            fileName="CareerLens_Report.pdf"
            className="w-full md:w-auto flex items-center justify-center gap-3 bg-primary text-white px-8 py-4 rounded-xl font-medium shadow-md hover:-translate-y-0.5 transition-all text-lg"
          >
            {({ loading }) => (
              <>
                <Download size={24} className={loading ? 'animate-bounce' : ''} />
                {loading ? 'Generating PDF...' : 'Download PDF Report'}
              </>
            )}
          </PDFDownloadLink>
        </div>

        {/* Summary Snippets */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-gray-900 to-black text-white p-8 rounded-3xl shadow-md">
            <div className="flex items-center gap-2 mb-4 text-white/60">
              <BadgeCheck size={20} />
              <h3 className="font-semibold uppercase tracking-wider text-sm">Identity Concept</h3>
            </div>
            <p className="text-2xl font-bold leading-relaxed">
              "{report.career_identity_description}"
            </p>
          </div>

          <div className="bg-white border border-border p-8 rounded-3xl shadow-sm">
            <h3 className="text-xl font-bold text-text-base mb-4">Core Strengths Detected</h3>
            <ul className="flex flex-col gap-3">
              {report.strengths.map((s, i) => (
                <li key={i} className="flex gap-3 text-text-muted">
                  <span className="text-primary font-bold">0{i+1}</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
