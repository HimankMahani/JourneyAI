import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import { popularDestinations } from '@/data/popularDestinations';

const LocationInput = ({ 
  label, 
  value, 
  onChange, 
  placeholder, 
  icon,
  className = "",
  disabled = false
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    // Close suggestions when clicking outside
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (e) => {
    if (disabled) return;
    const inputValue = e.target.value;
    onChange(inputValue);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (inputValue.length > 1) {
      // Immediate local search
      const localMatches = popularDestinations.filter(dest => 
        dest.toLowerCase().includes(inputValue.toLowerCase())
      ).slice(0, 5);
      
      setSuggestions(localMatches);
      setShowSuggestions(true);
      setIsLoading(true);

      // Debounced API search
      debounceRef.current = setTimeout(async () => {
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(inputValue)}&limit=5&addressdetails=1`,
            { headers: { 'User-Agent': 'JourneyAI-StudentProject/1.0' } }
          );
          
          if (response.ok) {
            const data = await response.json();
            const apiMatches = data.map(item => {
              // Format address nicely
              const address = item.address;
              const city = address.city || address.town || address.village || address.hamlet;
              const country = address.country;
              const state = address.state;
              
              // Try to create a clean "City, State, Country" string
              if (city && country) {
                const cleanName = state ? `${city}, ${state}, ${country}` : `${city}, ${country}`;
                // Only use the clean name if it actually matches what the user typed
                if (cleanName.toLowerCase().includes(inputValue.toLowerCase())) {
                  return cleanName;
                }
              }
              // Fallback to the full display name if the clean name doesn't match
              return item.display_name;
            }).filter(suggestion => 
              // Double check that the suggestion actually contains the input
              suggestion.toLowerCase().includes(inputValue.toLowerCase())
            );

            setSuggestions(prev => {
              const combined = Array.from(new Set([...localMatches, ...apiMatches]));
              return combined.slice(0, 10);
            });
          }
        } catch (error) {
          console.error("Failed to fetch location suggestions:", error);
        } finally {
          setIsLoading(false);
        }
      }, 500);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    onChange(suggestion);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <div className={`relative group ${className}`} ref={wrapperRef}>
      {label && (
        <label className={`text-sm font-semibold flex items-center text-gray-700 transition-colors mb-3 ${!disabled && 'group-hover:text-purple-600'}`}>
          {icon && (
            <div className={`p-2 rounded-lg mr-3 ${icon.className || ''}`}>
              {icon.component}
            </div>
          )}
          {label}
        </label>
      )}
      
      <div className="relative">
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={handleInputChange}
          onFocus={() => !disabled && value.length > 1 && setShowSuggestions(true)}
          disabled={disabled}
          className={`w-full border-2 border-gray-200 rounded-xl py-3 px-4 transition-all duration-300 pr-10 ${
            disabled 
              ? 'bg-gray-100 cursor-not-allowed text-gray-500' 
              : 'focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20'
          }`}
        />
        
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
          </div>
        )}
        
        {showSuggestions && suggestions.length > 0 && !disabled && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="px-4 py-3 hover:bg-purple-50 cursor-pointer flex items-center text-gray-700 transition-colors"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                {suggestion}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationInput;
