import { useContext } from 'react';
import TripContext from './TripContext';

// Custom hook to use the TripContext
export const useTripContext = () => {
  const context = useContext(TripContext);
  if (!context) {
    throw new Error('useTripContext must be used within a TripProvider');
  }
  return context;
};
