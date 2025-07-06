import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">T</span>
              </div>
              <span className="text-xl font-bold text-white">Journey AI</span>
            </div>
            <p className="text-gray-400">
              Your AI-powered travel companion for unforgettable adventures.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-4 text-white">Destinations</h3>
            <ul className="space-y-2 text-gray-400">
              <li className="hover:text-blue-400 cursor-pointer transition-colors">Europe</li>
              <li className="hover:text-blue-400 cursor-pointer transition-colors">Asia</li>
              <li className="hover:text-blue-400 cursor-pointer transition-colors">Americas</li>
              <li className="hover:text-blue-400 cursor-pointer transition-colors">Africa</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4 text-white">Support</h3>
            <ul className="space-y-2 text-gray-400">
              <li className="hover:text-blue-400 cursor-pointer transition-colors">Help Center</li>
              <li className="hover:text-blue-400 cursor-pointer transition-colors">Contact Us</li>
              <li className="hover:text-blue-400 cursor-pointer transition-colors">Privacy Policy</li>
              <li className="hover:text-blue-400 cursor-pointer transition-colors">Terms of Service</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4 text-white">Connect</h3>
            <ul className="space-y-2 text-gray-400">
              <li className="hover:text-blue-400 cursor-pointer transition-colors">Newsletter</li>
              <li className="hover:text-blue-400 cursor-pointer transition-colors">Social Media</li>
              <li className="hover:text-blue-400 cursor-pointer transition-colors">Blog</li>
              <li className="hover:text-blue-400 cursor-pointer transition-colors">Community</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2025 Journey AI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;