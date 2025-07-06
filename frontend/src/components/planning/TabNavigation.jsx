import React from 'react';
import { Calendar, Backpack, Info, MapPin } from 'lucide-react';

const TabNavigation = ({ activeTab, setActiveTab }) => {
  return (
    <div className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-lg shadow-xl border p-2 rounded-2xl">
      <button 
        className={`flex items-center justify-center space-x-2 p-3 rounded-xl transition-all duration-300 ${
          activeTab === 'itinerary' 
            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg' 
            : 'hover:bg-gray-100'
        }`}
        onClick={() => setActiveTab('itinerary')}
      >
        <Calendar className="h-4 w-4" />
        <span className="hidden sm:inline">Daily Itinerary</span>
        <span className="sm:hidden">Itinerary</span>
      </button>
      
      <button 
        className={`flex items-center justify-center space-x-2 p-3 rounded-xl transition-all duration-300 ${
          activeTab === 'packing' 
            ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg' 
            : 'hover:bg-gray-100'
        }`}
        onClick={() => setActiveTab('packing')}
      >
        <Backpack className="h-4 w-4" />
        <span className="hidden sm:inline">Packing List</span>
        <span className="sm:hidden">Packing</span>
      </button>
      
      <button 
        className={`flex items-center justify-center space-x-2 p-3 rounded-xl transition-all duration-300 ${
          activeTab === 'destination' 
            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg' 
            : 'hover:bg-gray-100'
        }`}
        onClick={() => setActiveTab('destination')}
      >
        <Info className="h-4 w-4" />
        <span className="hidden sm:inline">Destination Info</span>
        <span className="sm:hidden">Info</span>
      </button>
      
      <button 
        className={`flex items-center justify-center space-x-2 p-3 rounded-xl transition-all duration-300 ${
          activeTab === 'overview' 
            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' 
            : 'hover:bg-gray-100'
        }`}
        onClick={() => setActiveTab('overview')}
      >
        <MapPin className="h-4 w-4" />
        <span className="hidden sm:inline">Trip Overview</span>
        <span className="sm:hidden">Overview</span>
      </button>
    </div>
  );
};

export default TabNavigation;
