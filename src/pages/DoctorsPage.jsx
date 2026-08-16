import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import api from '../services/api';
import { 
  ChevronRight, 
  Info, 
  ChevronDown, 
  Star, 
  MapPin, 
  Phone, 
  Banknote,
  CheckCircle2,
  Loader2
} from 'lucide-react';

const DoctorsPage = () => {
  const [cityFilter, setCityFilter] = useState('All Cities');
  const [sortFilter, setSortFilter] = useState('Relevance');
  const [doctorsData, setDoctorsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detectedDisease, setDetectedDisease] = useState('');

  useEffect(() => {
    // Optionally, if they arrived here from Dashboard/Upload with some state:
    // e.g. search query or route state describing the condition
    fetchDoctors();
  }, [cityFilter]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (cityFilter !== 'All Cities') {
        params.append('city', cityFilter);
      }
      
      const response = await api.get(`/api/detection/v1/doctors/?${params.toString()}`);
      setDoctorsData(response.data);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper to map initials
  const getInitials = (name) => {
    return name
      .replace('Dr. ', '')
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  // Helper to process filtering and sorting locally as well (if needed)
  const getProcessedDoctors = () => {
    let sortedList = [...doctorsData];
    
    if (sortFilter === 'Fees Low to High') {
      sortedList.sort((a, b) => parseInt(a.fee.replace(/\D/g,'')) - parseInt(b.fee.replace(/\D/g,'')));
    } else if (sortFilter === 'Fees High to Low') {
      sortedList.sort((a, b) => parseInt(b.fee.replace(/\D/g,'')) - parseInt(a.fee.replace(/\D/g,'')));
    } else if (sortFilter === 'Rating') {
      sortedList.sort((a, b) => b.rating - a.rating);
    }
    return sortedList;
  };

  const processedDoctors = getProcessedDoctors();

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans overflow-hidden">
      {/* Fixed Sidebar */}
      <Sidebar activePage="doctors" />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col ml-[240px] relative h-full">
        <Header />

        <main className="flex-1 overflow-y-auto p-6 md:p-8 relative">
          <div className="max-w-5xl mx-auto pb-12">
            
            {/* Breadcrumbs */}
            <div className="flex items-center text-[#6B7280] text-sm mb-5 font-medium">
              <a href="#" className="hover:text-[#111827] transition-colors">Home</a>
              <ChevronRight className="w-4 h-4 mx-1" />
              <a href="#" className="hover:text-[#111827] transition-colors">Detection Results</a>
              <ChevronRight className="w-4 h-4 mx-1" />
              <span className="text-[#111827] font-semibold">Recommended Doctors</span>
            </div>

            {/* Header Section */}
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-1">
                <h1 className="text-3xl font-bold text-[#111827]">Recommended Dermatologists</h1>
                <div className="inline-flex items-center gap-1.5 bg-[#0D9488] text-white px-3 py-1 rounded-full text-xs font-semibold w-max shadow-sm">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Eczema (Atopic Dermatitis)
                </div>
              </div>
              <p className="text-[#6B7280]">Based on your detected condition</p>
            </div>

            {/* Info Notice Box */}
            <div className="bg-[#F3F4F6] border border-gray-200 rounded-lg p-4 mb-6 flex items-start gap-3">
              <Info className="w-5 h-5 text-[#0D9488] flex-shrink-0 mt-0.5" />
              <p className="text-sm text-[#4B5563] leading-relaxed">
                Contact the doctor directly to book an appointment. This is not a booking service.
              </p>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              {/* City Dropdown */}
              <div className="relative">
                <select 
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 text-[#111827] rounded-lg pl-4 pr-10 py-2.5 outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] font-medium text-sm cursor-pointer shadow-sm min-w-[140px]"
                >
                  <option value="All Cities">All Cities</option>
                  <option value="Lahore">Lahore</option>
                  <option value="Karachi">Karachi</option>
                  <option value="Islamabad">Islamabad</option>
                  <option value="Rawalpindi">Rawalpindi</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                  <ChevronDown className="h-4 w-4" />
                </div>
              </div>

              {/* Sort Dropdown */}
              <div className="relative">
                <select 
                  value={sortFilter}
                  onChange={(e) => setSortFilter(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 text-[#111827] rounded-lg pl-4 pr-10 py-2.5 outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] font-medium text-sm cursor-pointer shadow-sm min-w-[160px]"
                >
                  <option value="Relevance">Sort by: Relevance</option>
                  <option value="Fees Low to High">Fees Low to High</option>
                  <option value="Fees High to Low">Fees High to Low</option>
                  <option value="Rating">Rating</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                  <ChevronDown className="h-4 w-4" />
                </div>
              </div>

              <div className="ml-auto text-[#6B7280] text-sm font-medium">
                Showing {doctorsData.length} doctors
              </div>
            </div>

            {/* Doctors Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {loading ? (
                <div className="col-span-1 lg:col-span-2 flex justify-center items-center py-20">
                  <Loader2 className="w-8 h-8 text-[#0D9488] animate-spin" />
                </div>
              ) : processedDoctors.length === 0 ? (
                <div className="col-span-1 lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-500">
                  No doctors found for this filter.
                </div>
              ) : (
                processedDoctors.map((doctor) => (
                  <div key={doctor.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
                    
                    {/* Top Row: Avatar, Name, Qualification */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`w-[52px] h-[52px] rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0 bg-[#0D9488] text-white`}>
                        {getInitials(doctor.name)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h2 className="text-lg font-bold text-[#111827]">{doctor.name}</h2>
                          <span className="bg-[#F3F4F6] border border-gray-200 text-[#374151] text-[10px] uppercase font-bold px-2 py-0.5 rounded tracking-wide">
                            {doctor.qualification}
                          </span>
                        </div>
                        
                        {/* Rating Row inside top block for tighter grouping */}
                        <div className="flex items-center gap-1.5 align-middle mt-0.5">
                          <Star className="w-4 h-4 fill-[#F59E0B] text-[#F59E0B]" />
                          <span className="font-bold text-[#111827] text-sm leading-none">{doctor.rating}</span>
                          <span className="text-[#6B7280] text-xs leading-none">({doctor.reviews} Reviews)</span>
                        </div>
                        {doctor.specialty && (
                          <div className="mt-1.5 text-xs text-[#0D9488] font-semibold bg-teal-50 px-2 py-0.5 rounded-full inline-block border border-teal-100">
                            {doctor.specialty}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Info Rows (Location, Phone, Fee) */}
                    <div className="space-y-2.5 mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-start gap-2.5">
                        <MapPin className="w-4 h-4 text-[#0D9488] mt-0.5" />
                        <span className="text-sm text-[#4B5563]">{doctor.address}, {doctor.city}</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <Phone className="w-4 h-4 text-[#0D9488]" />
                        <span className="text-sm text-[#4B5563]">{doctor.phone}</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <Banknote className="w-4 h-4 text-[#0D9488]" />
                        <span className="text-sm font-semibold text-[#111827]">{doctor.fee}</span>
                      </div>
                    </div>

                  </div>
                ))
              )}
            </div>

          </div>
        </main>
      </div>

      {/* FIXED MAP PREVIEW CARD */}
      <div className="fixed bottom-6 right-6 w-[220px] bg-white rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] overflow-hidden border border-gray-200 z-40 hidden sm:block hover:scale-[1.02] cursor-pointer transition-transform duration-300">
        
        {/* Faux Map Background Area */}
        <div className="h-[130px] bg-gradient-to-br from-[#0D9488]/80 to-[#0F766E] relative overflow-hidden flex items-center justify-center">
          {/* Faux street lines using CSS */}
          <div className="absolute inset-0 opacity-20 bg-[linear-gradient(rgba(255,255,255,0.7)_.1em,transparent_.1em),linear-gradient(90deg,rgba(255,255,255,0.7)_.1em,transparent_.1em)] bg-[length:15px_15px]"></div>
          
          {/* Map Pins */}
          <div className="absolute w-2 h-2 bg-[#F97316] rounded-full shadow-[0_0_8px_#F97316] top-[30%] left-[25%] border border-white"></div>
          <div className="absolute w-2 h-2 bg-[#F97316] rounded-full shadow-[0_0_8px_#F97316] top-[45%] right-[20%] border border-white min-w-[8px]"></div>
          <div className="absolute w-2 h-2 bg-[#F97316] rounded-full shadow-[0_0_8px_#F97316] bottom-[35%] left-[45%] border border-white"></div>
          <div className="absolute w-2 h-2 bg-[#F97316] rounded-full shadow-[0_0_8px_#F97316] top-[60%] right-[35%] border border-white"></div>
        </div>

        {/* Bottom White Area */}
        <div className="py-2.5 items-center flex justify-center bg-white">
          <span className="text-[#0D9488] font-bold text-[11px] tracking-widest uppercase">
            Clinics In Lahore
          </span>
        </div>
      </div>

    </div>
  );
};

export default DoctorsPage;
