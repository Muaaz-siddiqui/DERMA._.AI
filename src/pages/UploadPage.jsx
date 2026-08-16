import React, { useState, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { UploadCloud, CheckCircle, AlertTriangle, ChevronRight, FileImage, Loader2 } from 'lucide-react';
import api from '../services/api';

const UploadPage = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = (file) => {
    setError('');
    setResult(null);

    if (!file) {
      setSelectedFile(null);
      setPreviewUrl('');
      return;
    }

    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setError('Only JPG and PNG images under 5MB are allowed.');
      setSelectedFile(null);
      setPreviewUrl('');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be under 5MB.');
      setSelectedFile(null);
      setPreviewUrl('');
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    handleFileChange(file);
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setResult(null);
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError('Please upload an image first.');
      return;
    }

    setError('');
    setIsAnalyzing(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

      const response = await api.post('/api/detection/detect/', formData);
      setResult(response.data);
    } catch (err) {
      console.error('Analysis failed:', err);
      setError(
        err.response?.data?.detail || 
        'Could not connect to backend. Make sure the server is running.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans overflow-hidden">
      <Sidebar activePage="upload" />
      <div className="flex-1 flex flex-col ml-[240px] relative h-full">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto space-y-6">
            
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Advanced Detection</h1>
              <p className="text-gray-500 mt-1">Upload a skin image for AI-powered analysis.</p>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-md">
                <div className="flex items-center text-red-700">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  <p>{error}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* LEFT COLUMN: Upload & Progress */}
              <div className="space-y-6">
                
                {/* Drag and Drop Zone */}
                <div 
                  className={`bg-white rounded-xl border-2 border-dashed transition-colors flex flex-col items-center justify-center p-12 text-center shadow-sm relative ${selectedFile ? 'border-[#0D9488]' : 'border-[#0D9488]/40 hover:border-[#0D9488]/80'}`}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/jpeg, image/png"
                    onChange={(e) => handleFileChange(e.target.files[0])}
                  />

                  {previewUrl ? (
                    <div className="w-full relative">
                      <img 
                        src={previewUrl} 
                        alt="Preview" 
                        className="max-h-64 mx-auto rounded-lg shadow-sm object-cover"
                      />
                      <div className="mt-6 flex justify-center gap-4">
                        <button 
                          onClick={clearSelection}
                          className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                          Clear
                        </button>
                        <button 
                          onClick={handleAnalyze}
                          disabled={isAnalyzing}
                          className="px-6 py-2 text-sm font-medium text-white bg-[#00796B] hover:bg-[#005A4F] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        >
                          {isAnalyzing ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Analyzing...
                            </>
                          ) : 'Analyze Image'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="bg-[#E6F4F1] p-4 rounded-full mb-4">
                        <UploadCloud className="w-8 h-8 text-[#0D9488]" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Drag and Drop</h3>
                      <p className="text-gray-500 mb-6 text-sm">Valid formats: JPG, PNG (Max 5MB)</p>
                      <button 
                        onClick={() => fileInputRef.current.click()}
                        className="px-6 py-2.5 text-sm font-medium text-white bg-[#00796B] hover:bg-[#005A4F] rounded-lg shadow-sm transition-colors"
                      >
                        Browse Files
                      </button>
                    </>
                  )}
                </div>

                {/* Progress Card */}
                {isAnalyzing && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Loader2 className="w-5 h-5 text-[#0D9488] animate-spin" />
                        <h3 className="font-semibold text-gray-900">AI Analysis in Progress...</h3>
                      </div>
                      <span className="text-sm font-medium text-[#0D9488]">Processing</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 mb-2 overflow-hidden">
                      <div className="bg-[#00796B] h-2 rounded-full animate-[pulse_1.5s_ease-in-out_infinite]" style={{ width: '60%' }}></div>
                    </div>
                    <p className="text-xs text-gray-500 text-right">Extracting features...</p>
                  </div>
                )}
              </div>

              {/* RIGHT COLUMN: Result Card */}
              <div>
                {result ? (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center gap-2 mb-6 text-[#0D9488]">
                      <CheckCircle className="w-6 h-6" />
                      <h2 className="text-xl font-bold text-gray-900">Analysis Complete</h2>
                    </div>

                    <div className="space-y-6 flex-1">
                      {/* Detection Result & Confidence */}
                      <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                          <p className="text-sm text-gray-500 font-medium uppercase tracking-wider mb-1">Detected Condition</p>
                          <h3 className="text-2xl font-bold text-gray-900">{result.disease || 'Unknown'}</h3>
                        </div>
                        <div className="text-left sm:text-right">
                          <p className="text-sm text-gray-500 font-medium uppercase tracking-wider mb-1">Confidence Score</p>
                          <div className="inline-block px-3 py-1 bg-green-100 text-green-800 font-bold rounded-lg text-lg">
                            {result.confidence ? `${(result.confidence * 100).toFixed(1)}%` : 'N/A'}
                          </div>
                        </div>
                      </div>

                      {/* Detail / Description */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Clinical Description</h4>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {result.description || 'No detailed description available for this condition.'}
                        </p>
                      </div>

                      {/* High Risk Alert Box (#FFF5F5) */}
                      <div className="bg-[#FFF5F5] border border-red-200 rounded-xl p-5 mt-auto">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="text-red-800 font-semibold mb-1">Medical Disclaimer</h4>
                            <p className="text-red-600 text-sm leading-relaxed">
                              {result.disclaimer || 'DermaAI provides an AI-assisted evaluation and is NOT a definitive medical diagnosis. Always consult a qualified dermatologist or medical professional for proper clinical assessment.'}
                            </p>
                          </div>
                        </div>
                      </div>

                      <button 
                        onClick={() => window.location.href='/doctors'}
                        className="w-full flex items-center justify-center py-3 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm mt-4 group"
                      >
                        Consult a Specialist
                        <ChevronRight className="w-4 h-4 ml-1 text-gray-400 group-hover:text-gray-600" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-xl border border-gray-100 p-6 h-full flex flex-col items-center justify-center text-center opacity-70">
                    <FileImage className="w-12 h-12 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-400">No Analysis Results Yet</h3>
                    <p className="text-sm text-gray-400 max-w-sm mt-2">
                      Upload an image using the field on the left and click 'Analyze' to view the AI diagnostic results here.
                    </p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default UploadPage;
