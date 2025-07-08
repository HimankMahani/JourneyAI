// Test component to demonstrate the loaders
import React, { useState } from 'react';
import { TripGenerationLoader, PlanningPageSkeleton } from '@/components/ui/PlanningPageSkeleton';
import { Button } from '@/components/ui/button';

const LoaderTest = () => {
  const [showTripLoader, setShowTripLoader] = useState(false);
  const [showPlanningSkeleton, setShowPlanningSkeleton] = useState(false);

  const testTripLoader = () => {
    setShowTripLoader(true);
    setTimeout(() => {
      setShowTripLoader(false);
    }, 5000); // Show for 5 seconds
  };

  const testPlanningSkeleton = () => {
    setShowPlanningSkeleton(true);
    setTimeout(() => {
      setShowPlanningSkeleton(false);
    }, 3000); // Show for 3 seconds
  };

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">Loader Components Test</h1>
      
      <div className="space-x-4">
        <Button onClick={testTripLoader} disabled={showTripLoader}>
          Test Trip Generation Loader
        </Button>
        
        <Button onClick={testPlanningSkeleton} disabled={showPlanningSkeleton}>
          Test Planning Page Skeleton
        </Button>
      </div>
      
      {showTripLoader && <TripGenerationLoader />}
      {showPlanningSkeleton && <PlanningPageSkeleton />}
    </div>
  );
};

export default LoaderTest;
