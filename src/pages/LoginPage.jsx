import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Microscope, Mail, Lock, EyeOff, Eye, ArrowRight, Loader2 } from 'lucide-react';
import authService from '../services/authService';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.detail || 
        'Login failed. Please check your credentials and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F4F8] flex flex-col font-sans">
      
      {/* Main Content Area */}
      <div className="flex-1 flex items-center justify-center p-6">
        
        {/* Card Container */}
        <div className="w-full max-w-[900px] flex flex-col md:flex-row bg-white rounded-2xl shadow-xl overflow-hidden">
          
          {/* LEFT COLUMN - TEAL */}
          <div className="hidden md:flex flex-col md:w-[40%] bg-[#0D9488] p-10 justify-between">
            <div>
              <div className="flex items-center gap-2 mb-10 text-white">
                <Microscope size={28} />
                <span className="text-xl font-semibold">Derma AI</span>
              </div>
              
              <h1 className="text-white text-4xl font-bold leading-tight mb-4">
                AI-Powered Skin<br />Disease Detection
              </h1>
              
              <p className="text-white/80 text-sm leading-relaxed mb-10">
                Clinical precision through advanced computer vision. 
                Secure. Accurate. Reliable.
              </p>

              {/* Placeholder image box */}
              <div className="h-44 w-full bg-[#0F766E] rounded-xl flex items-center justify-center shadow-inner relative overflow-hidden border border-[#0F766E]/50">
                {/* Decorative mock graph/chart lines inside placeholder */}
                <div className="absolute bottom-0 w-full h-1/2 opacity-20 bg-gradient-to-t from-black to-transparent"></div>
                <div className="text-white/30 font-medium tracking-widest text-sm">SYSTEM DASHBOARD</div>
              </div>
            </div>

            <p className="text-white/70 text-xs mt-8">
              Trusted by leading dermatology clinics worldwide.
            </p>
          </div>

          {/* RIGHT COLUMN - WHITE */}
          <div className="w-full md:w-[60%] p-10 md:p-12 flex flex-col justify-center">
            
            <h2 className="text-3xl font-bold text-[#111827] mb-2">Welcome Back</h2>
            <p className="text-[#6B7280] text-sm mb-8">Access your clinical workspace</p>
            
            <form onSubmit={handleLogin} className="space-y-5">
              
              {/* Email Input */}
              <div className="space-y-1">
                <label className="text-sm font-semibold text-[#111827]">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-[#E5E7EB] rounded-lg text-[#111827] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] transition-colors sm:text-sm"
                    placeholder="physician@clinic.com"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold text-[#111827]">Password</label>
                  <a href="#" className="text-xs font-medium text-[#0D9488] hover:text-[#0F766E] transition-colors">
                    Forgot Password?
                  </a>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-10 py-2.5 border border-[#E5E7EB] rounded-lg text-[#111827] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] transition-colors sm:text-sm"
                    placeholder="••••••••"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Keep Signed In */}
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-[#0D9488] focus:ring-[#0D9488] border-gray-300 rounded cursor-pointer"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-[#6B7280] cursor-pointer">
                  Stay signed in for 30 days
                </label>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600 text-center">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 bg-[#0D9488] hover:bg-[#0F766E] text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  <>
                    Login to Workspace
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
              
            </form>

            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#E5E7EB]"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-transparent">Divider</span>
                </div>
              </div>
            </div>

            <div className="mt-6 text-center text-sm">
              <span className="text-[#6B7280]">Don't have an account? </span>
              <Link to="/register" className="font-medium text-[#0D9488] hover:text-[#0F766E] transition-colors">
                Register
              </Link>
            </div>

          </div>
        </div>
      </div>

      {/* FOOTER SECTION */}
      <div className="w-full pt-8 pb-6 border-t border-[#E5E7EB]/50 bg-white/40 backdrop-blur-sm mt-auto">
        <div className="max-w-[1200px] mx-auto px-6">
          <p className="text-center italic text-[#6B7280] text-[13px] mb-6 max-w-3xl mx-auto">
            Disclaimer: Derma AI is a clinical decision support tool and not a substitute for professional medical advice, diagnosis, or treatment.
          </p>
          
          <div className="flex flex-col md:flex-row justify-between items-center text-[12px] text-[#6B7280] gap-4">
            <p>© 2024 Derma AI. All rights reserved.</p>
            <div className="flex space-x-6">
              <a href="#" className="hover:text-[#111827] transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-[#111827] transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-[#111827] transition-colors">HIPAA Compliance</a>
              <a href="#" className="hover:text-[#111827] transition-colors">Contact Support</a>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default LoginPage;
