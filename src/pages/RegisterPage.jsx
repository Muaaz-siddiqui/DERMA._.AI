import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Microscope, Mail, Lock, EyeOff, Eye, ArrowRight, User, Phone, 
  Shield, Zap, ClipboardList, Loader2, Info
} from 'lucide-react';
import authService from '../services/authService';

const RegisterPage = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  // Password strength calculation
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: '', color: '' };

    let score = 0;

    // Length check
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;

    // Character type checks
    if (/[a-z]/.test(pwd)) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^a-zA-Z0-9]/.test(pwd)) score++;

    // Determine strength level
    if (score <= 2) return { score: 1, label: 'Weak', color: '#DC2626' };
    if (score <= 4) return { score: 2, label: 'Moderate', color: '#F59E0B' };
    if (score <= 5) return { score: 3, label: 'Strong', color: '#16A34A' };
    return { score: 4, label: 'Very Strong', color: '#059669' };
  };

  const strength = getPasswordStrength(password);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      await authService.register(fullName, email, phone, password);
      // Navigate to login with success state
      navigate('/login', { state: { message: 'Registration successful. Please log in.' } });
    } catch (err) {
      setError(
        err.response?.data?.detail || 
        err.response?.data?.message ||
        'Registration failed. Please check your information and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#F8FAFC]">
      
      {/* Top Navbar */}
      <nav className="w-full bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between z-10 shrink-0">
        <Link to="/" className="flex items-center gap-2 text-[#0D9488]">
          <Microscope size={24} />
          <span className="text-xl font-bold">Derma AI</span>
        </Link>
        <div className="flex items-center gap-6 font-medium text-sm text-[#0D9488]">
          <Link to="/" className="hover:text-[#0F766E] transition-colors">Home</Link>
          <Link to="/login" className="hover:text-[#0F766E] transition-colors border-b-2 border-transparent hover:border-[#0D9488] pb-1">Login</Link>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:flex-row w-full bg-white relative overflow-hidden">
        
        {/* LEFT COLUMN - TEAL BACKGROUND (Hidden on mobile) */}
        <div className="hidden lg:flex lg:w-1/2 p-6">
          <div className="w-full h-full bg-gradient-to-br from-teal-800 to-[#0D9488] rounded-3xl flex flex-col items-center justify-center p-12 text-center relative overflow-hidden shadow-xl">
            {/* Subtle background circles for "microscope" aesthetic */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border-[40px] border-white/5 rounded-full z-0"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border-[20px] border-white/5 rounded-full z-0"></div>

          <div className="z-10 flex flex-col items-center max-w-lg">
            {/* Glowing Center Badge */}
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-white/20 blur-xl rounded-full"></div>
              <div className="relative w-28 h-28 rounded-full border-2 border-white/40 bg-white/10 flex items-center justify-center shadow-2xl backdrop-blur-md">
                <Microscope className="text-white w-14 h-14" />
              </div>
            </div>

            <h1 className="text-white text-5xl font-bold mb-3">Derma AI</h1>
            <p className="text-white/90 text-xl font-light mb-12 tracking-wide">
              AI-Powered Skin Disease Detection
            </p>

            {/* Stat Cards */}
            <div className="flex flex-row gap-5 w-full justify-center">
              <div className="bg-white/10 backdrop-blur-md rounded-xl px-5 py-4 flex items-center gap-4 border border-white/20 flex-1 shadow-lg">
                <div className="bg-white/20 p-2 rounded-lg">
                  <Shield className="text-white w-6 h-6" />
                </div>
                <div className="text-left">
                  <h3 className="text-white font-semibold text-sm">Advanced Analysis</h3>
                  <p className="text-white/70 text-xs">Reliable insights</p>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl px-5 py-4 flex items-center gap-4 border border-white/20 flex-1 shadow-lg">
                <div className="bg-white/20 p-2 rounded-lg">
                  <Zap className="text-white w-6 h-6" />
                </div>
                <div className="text-left">
                  <h3 className="text-white font-semibold text-sm">Fast Processing</h3>
                  <p className="text-white/70 text-xs">Quick turn-around</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>

        {/* RIGHT COLUMN - REGISTRATION FORM */}
        <div className="w-full lg:w-1/2 bg-white flex flex-col justify-center px-8 py-10 sm:px-16 lg:px-24 xl:px-32 overflow-y-auto">
          
          <div className="max-w-md mx-auto w-full">
            <h2 className="text-3xl font-bold text-[#111827] mb-2">Create an Account</h2>
            <p className="text-[#6B7280] text-sm mb-8">Start your clinical skin assessment journey today.</p>
            
            <form onSubmit={handleRegister} className="space-y-4">
              
              {/* Full Name Input */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#111827]">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-[#E5E7EB] rounded-lg text-[#111827] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] transition-colors sm:text-sm"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              {/* Email Input */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#111827]">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-[#E5E7EB] rounded-lg text-[#111827] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] transition-colors sm:text-sm"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              {/* Phone Input */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#111827]">Phone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-[#E5E7EB] rounded-lg text-[#111827] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] transition-colors sm:text-sm"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#111827]">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={8}
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
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                
                {/* Password Strength Bar */}
                {password.length > 0 && (
                  <div className="pt-1">
                    <div className="flex gap-1 h-1 w-full mb-1">
                      <div className="flex-1 rounded-full" style={{ backgroundColor: strength.score >= 1 ? strength.color : '#E5E7EB' }}></div>
                      <div className="flex-1 rounded-full" style={{ backgroundColor: strength.score >= 2 ? strength.color : '#E5E7EB' }}></div>
                      <div className="flex-1 rounded-full" style={{ backgroundColor: strength.score >= 3 ? strength.color : '#E5E7EB' }}></div>
                      <div className="flex-1 rounded-full" style={{ backgroundColor: strength.score >= 4 ? strength.color : '#E5E7EB' }}></div>
                    </div>
                    <div className="flex items-center text-[10px] gap-1" style={{ color: strength.color }}>
                      <Info className="w-3 h-3" />
                      <span>Strength: {strength.label}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password Input */}
              <div className="space-y-1 pb-2">
                <label className="text-xs font-semibold text-[#111827]">Confirm Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full pl-10 pr-10 py-2.5 border border-[#E5E7EB] rounded-lg text-[#111827] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] transition-colors sm:text-sm"
                    placeholder="••••••••"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
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
                    Creating...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
              
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-[#6B7280]">Already have an account? </span>
              <Link to="/login" className="font-semibold text-[#0D9488] hover:text-[#0F766E] transition-colors">
                Login
              </Link>
            </div>

          </div>
        </div>
      </div>

      {/* FOOTER SECTION */}
      <footer className="w-full bg-[#F8FAFC] border-t border-gray-200 py-6 px-8 sm:px-12 md:px-16 shrink-0">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <div className="flex items-center gap-2 text-[#0D9488] mb-1">
              <Microscope size={18} />
              <span className="font-bold text-sm">Derma AI</span>
            </div>
            <p className="text-[#6B7280] text-xs">
              © 2024 Derma AI. Clinical Precision with Human Accessibility.
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-xs text-[#6B7280]">
            <a href="#" className="hover:text-[#111827] transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-[#111827] transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-[#111827] transition-colors">Help Center</a>
            <a href="#" className="hover:text-[#111827] transition-colors">Contact Support</a>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default RegisterPage;
