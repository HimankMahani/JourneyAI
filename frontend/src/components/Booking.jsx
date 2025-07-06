import React from 'react'
import AIButton from './ui/ai-button';
import { Calendar, MapIcon, Backpack, Download, Share2, Edit3, Phone, AlertTriangle, Hotel, Globe, Search } from 'lucide-react';

const Booking = () => {
    const sampleTrips = [
        {
          id: 1,
          destination: "Paris, France",
          dates: "July 15-22, 2024",
          travelers: 2,
          budget: "₹1,50,000",
          status: "upcoming",
          image: "https://images.unsplash.com/photo-1499856871958-5b9357976b82?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
        },
        {
          id: 2,
          destination: "Bali, Indonesia",
          dates: "September 5-15, 2024",
          travelers: 3,
          budget: "₹2,20,000",
          status: "planning",
          image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1738&q=80"
        }
      ];

      
  return (
    <div className="container mx-auto py-10 px-40">
      {/* Header with title and create button */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 py-5">
        <div className="mb-6 md:mb-0">
          <h1 className="text-4xl font-bold mb-2">My Trips</h1>
          <p className="text-lg text-gray-600">Plan, organize, and track your travel adventures</p>
        </div>
        <AIButton 
          className="flex items-center gap-2 px-6 py-3"
        >
          <span>Create a new Trip</span>
        </AIButton>
      </div>

<div className="relative">
  <Search className="text-gray-500 absolute top-3 left-3 size-4.5" />
  <input 
    type="text" 
    placeholder="Search trips by name or destinations..." 
    className="border rounded-lg p-2 pl-10 w-full mb-10" 
  />
</div>

      {/* Trip cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {sampleTrips.map((trip) => (
          <div key={trip.id} className="border rounded-lg overflow-hidden shadow-md">
            <img src={trip.image} alt={trip.destination} className="w-full h-48 object-cover" />
            <div className="p-4">
              <h2 className="text-xl font-semibold">{trip.destination}</h2>
              <p className="text-gray-600">{trip.dates}</p>
              <p className="text-gray-600">Travelers: {trip.travelers}</p>
              <p className="text-gray-600">Budget: {trip.budget}</p>
              <p className={`text-sm font-medium ${trip.status === "upcoming" ? "text-green-500" : "text-yellow-500"}`}>
                Status: {trip.status}
              </p>
              <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Booking
