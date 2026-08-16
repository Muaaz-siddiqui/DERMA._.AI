import React from 'react';
import { Search } from 'lucide-react';

const Header = () => {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6 sticky top-0 z-10">
      {/* LEFT: Placeholder to keep center alignment */}
      <div className="flex-none w-1/4">
      </div>

      {/* CENTER: Search Bar */}
      <div className="flex-1 flex justify-center">
        <div className="relative w-[320px]">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-transparent rounded-full leading-5 bg-gray-100 text-gray-900 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]/30 sm:text-sm transition-colors"
            placeholder="Search records or scans..."
          />
        </div>
      </div>

      {/* RIGHT: User Profile Avatar Placeholder */}
      <div className="flex-none w-1/4 flex items-center justify-end gap-3">
      </div>
    </header>
  );
};

export default Header;
