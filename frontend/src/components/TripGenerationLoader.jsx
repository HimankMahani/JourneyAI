import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export const PlanningPageSkeleton = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <Skeleton className="h-10 w-80 mb-2" />
              <div className="flex items-center space-x-6">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-28" />
              </div>
            </div>
            <div className="text-right">
              <Skeleton className="h-8 w-20 mb-1" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        </div>

        {/* Tabs Skeleton */}
        <div className="mb-6">
          <div className="flex space-x-1 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-10 w-32" />
            ))}
          </div>

          {/* Itinerary Cards Skeleton */}
          <div className="space-y-6">
            {[1, 2, 3].map((day) => (
              <Card key={day} className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Skeleton className="w-8 h-8 rounded-full" />
                      <div>
                        <Skeleton className="h-6 w-16 mb-1" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                    <Skeleton className="h-6 w-20" />
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map((activity) => (
                      <div key={activity} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                        <Skeleton className="w-10 h-10 rounded-lg" />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Skeleton className="h-5 w-16" />
                            <Skeleton className="h-4 w-12" />
                            <Skeleton className="h-4 w-16" />
                          </div>
                          <Skeleton className="h-5 w-48 mb-2" />
                          <Skeleton className="h-4 w-32 mb-2" />
                          <Skeleton className="h-3 w-64" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const TripGenerationLoader = () => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 text-center shadow-2xl">
        <div className="mb-6">
          <div className="relative mx-auto w-20 h-20 mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-purple-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-600 animate-spin"></div>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Creating Your Perfect Itinerary
          </h3>
          <p className="text-gray-600">
            Our AI is analyzing your preferences and crafting a personalized travel plan...
          </p>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center text-sm text-gray-600">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-3 animate-pulse"></div>
            Analyzing your destination preferences
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            Finding the best activities and restaurants
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <div className="w-2 h-2 bg-purple-500 rounded-full mr-3 animate-pulse" style={{ animationDelay: '1s' }}></div>
            Optimizing your daily schedule
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <div className="w-2 h-2 bg-orange-500 rounded-full mr-3 animate-pulse" style={{ animationDelay: '1.5s' }}></div>
            Preparing your personalized recommendations
          </div>
        </div>
        
        <div className="mt-6">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full animate-pulse" style={{ width: '75%' }}></div>
          </div>
          <p className="text-xs text-gray-500 mt-2">This usually takes 10-15 seconds</p>
        </div>
      </div>
    </div>
  );
};
