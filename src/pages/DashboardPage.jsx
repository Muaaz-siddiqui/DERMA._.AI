import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import api from '../services/api';
import { 
  BarChart3, 
  AlertTriangle, 
  MessageSquare, 
  TrendingUp,
  Camera,
  Clock,
  User,
  MoreVertical,
  Bot,
  Loader2
} from 'lucide-react';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/detection/v1/detections/');
      setHistory(response.data);
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setLoading(false);
    }
  };

  // derived stats
  const totalScans = history.length;
  const lastDetection = history.length > 0 ? history[0] : null;
  const recentDetections = history.slice(0, 3); // show only top 3

  // Helper function to map risk badge colors
  const getRiskStyles = (confidence) => {
    const num = parseFloat(confidence);
    if (num >= 0.90) return { label: 'HIGH RISK', classes: 'bg-[#FEE2E2] text-[#DC2626]', thumb: 'bg-red-100' };
    if (num >= 0.70) return { label: 'MODERATE RISK', classes: 'bg-[#FEF3C7] text-[#D97706]', thumb: 'bg-orange-100' };
    return { label: 'LOW RISK', classes: 'bg-[#DCFCE7] text-[#16A34A]', thumb: 'bg-green-100' };
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown Date';
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: 'numeric', minute: '2-digit', hour12: true
    });
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans overflow-hidden">
      <Sidebar activePage="dashboard" />

      <div className="flex-1 flex flex-col ml-[240px] relative h-full">
        <Header />

        <main className="flex-1 overflow-y-auto p-6 md:p-8 relative">
          <div className="max-w-6xl mx-auto space-y-8 pb-12">
            
            {/* SECTION 1 - Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Card 1: Total Scans */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[#6B7280] text-sm font-medium">Total Scans</span>
                  <div className="bg-[#0D9488]/10 p-2 rounded-lg">
                    <BarChart3 className="w-5 h-5 text-[#0D9488]" />
                  </div>
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-[#111827] mb-1">
                    {loading ? <Loader2 className="animate-spin text-[#0D9488]" /> : totalScans}
                  </h3>
                  {!loading && totalScans > 0 && (
                    <div className="flex items-center text-[#0D9488] text-xs font-medium">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      <span>Updated recently</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card 2: Last Detection */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[#6B7280] text-sm font-medium">Last Detection</span>
                  <div className="bg-red-50 p-2 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-[#DC2626]" />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-[#111827] mb-1 truncate">
                    {loading ? <Loader2 className="animate-spin text-[#0D9488]" /> : (lastDetection?.disease || 'No Detections')}
                  </h3>
                  <div className="text-[#6B7280] text-xs font-medium">
                    {lastDetection ? formatDate(lastDetection.date || lastDetection.created_at) : 'Perform a scan to see data'}
                  </div>
                </div>
              </div>

              {/* Card 3: Active Chats */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[#6B7280] text-sm font-medium">Active Chats</span>
                  <div className="bg-[#0D9488]/10 p-2 rounded-lg">
                    <MessageSquare className="w-5 h-5 text-[#0D9488]" />
                  </div>
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-[#111827] mb-1">On Standby</h3>
                  <div className="text-[#6B7280] text-xs font-medium">
                    RAG Assistant available
                  </div>
                </div>
              </div>

            </div>

            {/* SECTION 2 - Hero Banner Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row min-h-[280px]">
              <div className="w-full md:w-[60%] p-8 lg:p-10 flex flex-col justify-center">
                <h2 className="text-2xl font-bold text-[#111827] mb-4">Start New Skin Analysis</h2>
                <p className="text-[#6B7280] leading-relaxed mb-8 max-w-lg">
                  Utilize our state-of-the-art AI neural networks for instant clinical-grade dermatological screening and risk assessment.
                </p>
                <div className="flex flex-wrap gap-4">
                  <button 
                    onClick={() => navigate('/upload')}
                    className="flex items-center gap-2 bg-[#0D9488] hover:bg-[#0F766E] text-white px-6 py-3 rounded-lg font-medium transition-colors cursor-pointer z-10"
                  >
                    <Camera className="w-5 h-5 cursor-pointer" />
                    Initialize Scan Now
                  </button>
                </div>
              </div>
              
              <div className="hidden md:flex w-full md:w-[40%] bg-gray-900 relative overflow-hidden items-center justify-center">
                <div className="absolute w-[400px] h-[400px] border border-[#0D9488]/20 rounded-full flex items-center justify-center">
                  <div className="absolute w-[300px] h-[300px] border border-[#0D9488]/40 rounded-full flex items-center justify-center">
                    <div className="absolute w-[200px] h-[200px] border-2 border-[#0D9488]/80 shadow-[0_0_40px_rgba(13,148,136,0.3)] rounded-full flex items-center justify-center bg-gray-900 z-10">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#0D9488] to-gray-900 border border-gray-700 shadow-[inset_0_0_15px_black]"></div>
                    </div>
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#0D9488]/10 to-transparent z-0"></div>
              </div>
            </div>

            {/* SECTION 3 - Recent Detections */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-[#111827]">Recent Detections</h2>
                <Link to="/history" className="text-[#0D9488] font-medium hover:text-[#0F766E] transition-colors flex items-center text-sm">
                  View All History <span className="ml-1">›</span>
                </Link>
              </div>

              {loading ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="animate-spin text-[#0D9488] w-8 h-8" />
                </div>
              ) : recentDetections.length === 0 ? (
                <div className="bg-white rounded-xl p-8 text-center text-[#6B7280] shadow-sm border border-gray-100">
                  <p>No recent detections found. Perform a scan to see history here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentDetections.map((item, index) => {
                    const risk = getRiskStyles(item.confidence);
                    
                    return (
                      <div key={item.id || index} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-5 hover:shadow-md transition-shadow">
                        
                        <div className={`w-20 h-20 rounded-lg flex-shrink-0 border border-gray-200 overflow-hidden relative flex items-center justify-center bg-gray-100`}>
                          {item.image_url ? (
                            <img src={item.image_url.startsWith('http') ? item.image_url : `http://localhost:8000${item.image_url}`} alt="Scan" className="w-full h-full object-cover" />
                          ) : (
                            <Camera className="w-6 h-6 text-gray-400" />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-bold text-[#111827] truncate text-lg">
                              {item.disease || 'Unknown'}
                            </h4>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider ${risk.classes}`}>
                              {risk.label}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-4 text-[#6B7280] text-xs">
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5" />
                              <span>{formatDate(item.date || item.created_at)}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5" />
                              <span>Patient ID: #DERM-{item.id?.toString().padStart(4, '0') || '0000'}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="flex flex-col items-end text-right">
                            <span className="text-2xl font-bold text-[#0D9488]">
                              {(parseFloat(item.confidence) * (item.confidence > 1 ? 1 : 100)).toFixed(1)}%
                            </span>
                            <span className="text-[10px] font-semibold text-[#6B7280] tracking-widest uppercase">AI Confidence</span>
                          </div>
                          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
                            <MoreVertical className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </main>
      </div>

      {/* FLOATING BUTTON */}
      <button 
        onClick={() => navigate('/chat')}
        className="fixed bottom-8 right-8 w-14 h-14 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-full flex items-center justify-center shadow-[0_8px_20px_rgba(13,148,136,0.3)] transition-transform hover:scale-105 z-50 cursor-pointer"
      >
        <Bot className="w-7 h-7" />
      </button>

    </div>
  );
};

export default DashboardPage;
