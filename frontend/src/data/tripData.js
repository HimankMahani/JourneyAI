// Mock data for the planning component

export const selectedTrip = {
  destination: "Paris, France", 
  startDate: "2025-07-10",
  endDate: "2025-07-16", 
  travelers: 2,
  budget: {
    amount: 292000,
    currency: "₹"
  }
};

export const itinerary = [
  {
    day: 1,
    date: "July 15, 2024",
    theme: "Arrival & Orientation",
    activities: [
      { time: "09:00", type: "transport", title: "Arrive at Charles de Gaulle Airport", location: "Terminal 2E", duration: "30 min", cost: "₹0" },
      { time: "11:30", type: "transport", title: "Airport Transfer to Hotel", location: "RER B to Châtelet", duration: "45 min", cost: "₹1,000" },
      { time: "14:00", type: "accommodation", title: "Check-in at Hotel des Grands Boulevards", location: "17 Boulevard Poissonnière", duration: "30 min", cost: "₹0" },
      { time: "15:30", type: "meal", title: "Late Lunch at Café de Flore", location: "172 Boulevard Saint-Germain", duration: "1.5 hrs", cost: "₹3,750" },
      { time: "18:00", type: "activity", title: "Evening Seine River Walk", location: "Pont Neuf to Pont Alexandre III", duration: "2 hrs", cost: "₹0" },
      { time: "20:30", type: "meal", title: "Dinner at L'Ami Jean", location: "27 Rue Malar", duration: "2 hrs", cost: "₹7,100" }
    ]
  },
  {
    day: 2,
    date: "July 16, 2024",
    theme: "Iconic Landmarks",
    activities: [
      { time: "08:30", type: "meal", title: "Breakfast at Hotel", location: "Hotel Dining Area", duration: "1 hr", cost: "₹0 (included)" },
      { time: "10:00", type: "activity", title: "Eiffel Tower Visit", location: "Champ de Mars", duration: "3 hrs", cost: "₹2,300" },
      { time: "13:30", type: "meal", title: "Lunch at Le Jules Verne", location: "Eiffel Tower", duration: "1.5 hrs", cost: "₹9,500" },
      { time: "16:00", type: "activity", title: "Arc de Triomphe", location: "Place Charles de Gaulle", duration: "1.5 hrs", cost: "₹1,200" },
      { time: "18:00", type: "activity", title: "Champs-Élysées Walk", location: "Avenue des Champs-Élysées", duration: "2 hrs", cost: "₹0" },
      { time: "20:30", type: "meal", title: "Dinner at Chez Francis", location: "7 Place de l'Alma", duration: "2 hrs", cost: "₹6,300" }
    ]
  },
  {
    day: 3,
    date: "July 17, 2024",
    theme: "Museums & Art",
    activities: [
      { time: "08:30", type: "meal", title: "Breakfast at Hotel", location: "Hotel Dining Area", duration: "1 hr", cost: "₹0 (included)" },
      { time: "10:00", type: "activity", title: "Louvre Museum", location: "Rue de Rivoli", duration: "4 hrs", cost: "₹1,900" },
      { time: "14:30", type: "meal", title: "Lunch at Café Marly", location: "93 Rue de Rivoli", duration: "1.5 hrs", cost: "₹4,200" },
      { time: "16:30", type: "activity", title: "Musée d'Orsay", location: "1 Rue de la Légion d'Honneur", duration: "2.5 hrs", cost: "₹1,600" },
      { time: "19:30", type: "meal", title: "Dinner at Le Petit Pontoise", location: "9 Rue de Pontoise", duration: "2 hrs", cost: "₹5,500" }
    ]
  }
];

export const packingList = {
  essentials: [
    "Passport & Visa Documents",
    "Flight Tickets (Print & Digital)",
    "Hotel Booking Confirmation",
    "Travel Insurance Documents",
    "International Driver's License",
    "Credit/Debit Cards",
    "Cash (Euros)",
    "Power Adapters (Type E/F)",
    "Smartphone & Charger",
    "Portable Power Bank"
  ],
  clothing: [
    "Light Jackets",
    "T-shirts/Tops",
    "Long-sleeve Shirts",
    "Jeans/Pants",
    "Walking Shoes",
    "Formal Outfit for Fine Dining",
    "Comfortable Socks",
    "Underwear",
    "Light Sweater",
    "Rain Jacket/Umbrella"
  ],
  toiletries: [
    "Toothbrush & Toothpaste",
    "Shampoo & Conditioner",
    "Body Wash/Soap",
    "Deodorant",
    "Sunscreen (SPF 30+)",
    "Face Wash",
    "Moisturizer",
    "Hand Sanitizer",
    "Prescription Medicines",
    "Basic First Aid Kit"
  ],
  gadgets: [
    "Camera & Charger",
    "Memory Cards",
    "Noise-Cancelling Headphones",
    "E-reader/Books",
    "Universal Travel Adapter",
    "Portable Wi-Fi (Optional)",
    "Voltage Converter (If needed)",
    "Smartphone Tripod",
    "Language Translation Device",
    "Portable Bluetooth Speaker"
  ]
};

export const destinationInfo = {
  weather: {
    avgTemp: "24°C (75°F)",
    conditions: "Partly cloudy with occasional light showers in July. Warm days and pleasant evenings.",
    recommendation: "Pack light clothing with a light jacket or sweater for evenings. A small umbrella or rain jacket is recommended for occasional showers."
  },
  culture: {
    language: "French",
    currency: "Euro (€)",
    tipping: "Service is typically included in restaurant bills (look for 'service compris'). If not included, 5-10% is appreciated for good service.",
    greeting: "Bonjour (Hello) / Merci (Thank you)"
  },
  tips: [
    "Learn basic French phrases - locals appreciate visitors trying to speak their language.",
    "Many museums in Paris are free on the first Sunday of each month.",
    "The Paris Museum Pass offers great value if you plan to visit multiple attractions.",
    "Avoid restaurants with menus translated into multiple languages near tourist attractions.",
    "Verify Metro operating hours as they typically close around 1:00 AM (2:00 AM on weekends).",
    "Always validate your Metro ticket before boarding to avoid fines.",
    "Dress smartly when dining at nicer restaurants - casual but elegant is the Parisian way.",
    "Be aware of common scams targeting tourists around major attractions."
  ]
};

export const travelTimeline = [
  { icon: "Plane", title: "Departure", date: "July 15, 2024 • 09:00 AM", subtitle: "Charles de Gaulle Airport" },
  { icon: "Hotel", title: "Check-in", date: "July 15, 2024 • 02:00 PM", subtitle: "Hotel des Grands Boulevards" },
  { icon: "Star", title: "Eiffel Tower", date: "July 16, 2024 • 05:30 PM", subtitle: "Main attraction visit" },
  { icon: "Plane", title: "Return Flight", date: "July 22, 2024 • 10:30 AM", subtitle: "Charles de Gaulle Airport" }
];

export const budgetBreakdown = [
  { icon: "Plane", category: "Flights", amount: "₹1,20,000" },
  { icon: "Hotel", category: "Hotels", amount: "₹80,000" },
  { icon: "Utensils", category: "Food", amount: "₹60,000" },
  { icon: "Camera", category: "Activities", amount: "₹20,000" },
  { icon: "Car", category: "Transport", amount: "₹12,000" }
];

export const documentChecklist = [
  { icon: "BookOpen", label: "Passport", status: true },
  { icon: "Plane", label: "Flight Tickets", status: true },
  { icon: "Hotel", label: "Hotel Booking", status: true },
  { icon: "Shield", label: "Travel Insurance", status: false },
  { icon: "CreditCard", label: "Credit Cards", status: true },
  { icon: "Smartphone", label: "Offline Maps", status: false }
];

export const emergencyContacts = [
  { 
    icon: "AlertTriangle", 
    title: "Emergency Services", 
    phoneNumber: "112",
    description: "General Emergency (Police, Fire, Medical)"
  },
  {
    icon: "Hotel",
    title: "Hotel Reception",
    phoneNumber: "+33 1 47 70 21 61",
    description: "Hotel des Grands Boulevards"
  },
  {
    icon: "Globe",
    title: "Indian Embassy",
    phoneNumber: "+33 1 43 12 22 22",
    description: "15 Rue Alfred Dehodencq, Paris"
  }
];

export const weatherOverview = {
  temp: "24°C",
  description: "Perfect for sightseeing!",
  rainChance: "30%",
  windSpeed: "Light",
  recommendation: "Pack layers and a light rain jacket. Perfect weather for outdoor activities and sightseeing!"
};
