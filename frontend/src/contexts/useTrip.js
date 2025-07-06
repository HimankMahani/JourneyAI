import { useContext } from 'react';
import TripContext from './TripContext';

export const useTrip = () => useContext(TripContext);
