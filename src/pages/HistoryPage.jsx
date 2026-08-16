import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { 
  FileImage, 
  Search, 
  Activity, 
  ShieldCheck, 
  PieChart, 
  Loader2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import api from '../services/api';

const HistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination state (client-side for now, can easily be switched to server-side)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

  // Helper functions
  const getRiskStyles = (confidence) => {
    const num = parseFloat(confidence);
    if (num >= 0.90) return { label: 'High Risk', class: 'bg-[#FFF5F5] text-[#DC2626] border-red-200' };
    if (num >= 0.70) return { label: 'Moderate', class: 'bg-[#F0F9FF] text-[#0284C7] border-blue-200' };
    return { label: 'Low Risk', class: 'bg-[#F0FDF4] text-[#16A34A] border-green-200' };
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    // Handle "YYYY-MM-DD HH:MM" format from backend
    const [datePart, timePart] = dateString.split(' ');
    const [year, month, day] = datePart.split('-');
    const [hour, minute] = timePart.split(':');
    const date = new Date(year, month - 1, day, hour, minute);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Calculate derived stats
  const totalScans = history.length;
  const avgConfidence = totalScans > 0 
    ? history.reduce((acc, curr) => acc + (curr.confidence || 0), 0) / totalScans 
    : 0;

  // Pagination Logic
  const totalPages = Math.ceil(history.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = history.slice(indexOfFirstItem, indexOfLastItem);

  const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const nextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans overflow-hidden">
      <Sidebar activePage="history" />
      
      <div className="flex-1 flex flex-col ml-[240px] relative h-full">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto space-y-6">
            
            {/* Top Title & Search */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Scan History</h1>
                <p className="text-gray-500 mt-1">Review and manage your past AI skin analyses.</p>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Filter records..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]"
                />
              </div>
            </div>

            {/* Main Data Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col min-h-[400px]">
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-sm text-left">
                  <thead className="bg-[#F8FAFC] border-b border-gray-200 text-gray-600 font-medium">
                    <tr>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Sample Image</th>
                      <th className="px-6 py-4">Condition</th>
                      <th className="px-6 py-4">Confidence</th>
                      <th className="px-6 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {loading ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                          <Loader2 className="w-8 h-8 text-[#0D9488] animate-spin mx-auto mb-2" />
                          Loading history...
                        </td>
                      </tr>
                    ) : currentItems.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                          <div className="flex justify-center mb-3">
                            <FileImage className="w-8 h-8 text-gray-300" />
                          </div>
                          No scans found in your history.
                        </td>
                      </tr>
                    ) : (
                      currentItems.map((item, index) => {
                        const confPercentage = Math.round((item.confidence || 0) * 100);
                        const risk = getRiskStyles(item.confidence);
                        
                        return (
                          <tr key={index} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-gray-600 font-medium">
                              {formatDate(item.date)}
                            </td>
                            <td className="px-6 py-4">
                              <div className="w-12 h-12 bg-gray-100 rounded-md border border-gray-200 flex items-center justify-center overflow-hidden">
                                {item.image ? (
                                  <img src={`http://localhost:8000${item.image}`} alt="Scan" className="w-full h-full object-cover" />
                                ) : (
                                  <FileImage className="w-5 h-5 text-gray-400" />
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 font-semibold text-gray-900">
                              {item.disease || 'Unknown'}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <span className="font-medium text-gray-700 w-12">{confPercentage}%</span>
                                <div className="w-24 bg-gray-100 rounded-full h-2">
                                  <div 
                                    className="bg-[#00796B] h-2 rounded-full" 
                                    style={{ width: `${confPercentage}%` }}
                                  ></div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${risk.class}`}>
                                {risk.label}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Footer */}
              {!loading && history.length > 0 && (
                <div className="border-t border-gray-200 p-4 flex items-center justify-between bg-white text-sm text-gray-500">
                  <span>
                    Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, totalScans)} of {totalScans} results
                  </span>
                  <div className="flex gap-2">
                    <button 
                      onClick={prevPage}
                      disabled={currentPage === 1}
                      className="p-1 px-3 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" /> Prev
                    </button>
                    <button 
                      onClick={nextPage}
                      disabled={currentPage === totalPages}
                      className="p-1 px-3 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
                    >
                      Next <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              {/* Card 1 */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#E0F2F1] flex items-center justify-center flex-shrink-0">
                  <Activity className="w-6 h-6 text-[#00796B]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Total Scans</p>
                  <h3 className="text-2xl font-bold text-gray-900">{totalScans}</h3>
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#E0F2F1] flex items-center justify-center flex-shrink-0">
                  <PieChart className="w-6 h-6 text-[#00796B]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Average Precision</p>
                  <h3 className="text-2xl font-bold text-gray-900">{(avgConfidence * 100).toFixed(1)}%</h3>
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#E0F2F1] flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-6 h-6 text-[#00796B]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Security Validation</p>
                  <h3 className="text-2xl font-bold text-gray-900">Active</h3>
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default HistoryPage;
