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
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900/80 via-purple-900/30 to-blue-900/80 backdrop-blur-xl z-50 flex items-center justify-center overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>
      
      {/* Floating Particles */}
      <div className="absolute inset-0">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full animate-bounce"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <div className="relative bg-white/10 backdrop-blur-2xl rounded-3xl p-10 max-w-lg w-full mx-4 text-center shadow-2xl border border-white/20">
        {/* Main Loader Animation */}
        <div className="mb-8">
          <div className="relative mx-auto w-32 h-32 mb-6">
            {/* Outer rotating ring */}
            <div className="absolute inset-0 rounded-full border-4 border-transparent bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500 animate-spin" style={{ animationDuration: '3s' }}>
              <div className="absolute inset-1 rounded-full bg-white/10 backdrop-blur-sm"></div>
            </div>
            
            {/* Middle pulsing ring */}
            <div className="absolute inset-3 rounded-full border-2 border-white/30 animate-pulse"></div>
            
            {/* Inner rotating elements */}
            <div className="absolute inset-6 flex items-center justify-center">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }}>
                <div className="absolute inset-1 bg-white/20 rounded-full animate-pulse"></div>
              </div>
            </div>
            
            {/* Orbiting dots */}
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="absolute w-3 h-3 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full animate-spin"
                style={{
                  top: '50%',
                  left: '50%',
                  transformOrigin: '0 0',
                  transform: `translate(-50%, -50%) rotate(${i * 120}deg) translateX(50px)`,
                  animationDelay: `${i * 0.3}s`,
                  animationDuration: '4s'
                }}
              />
            ))}
          </div>
          
          <div className="space-y-2">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent animate-pulse">
              Creating Your Perfect Itinerary
            </h3>
            <p className="text-white/80 text-lg">
              Our AI is analyzing your preferences and crafting a personalized travel plan...
            </p>
          </div>
        </div>
        
        {/* Enhanced Progress Steps */}
        <div className="space-y-4 mb-8">
          {[
            { text: 'Analyzing your destination preferences', color: 'from-green-400 to-emerald-400', delay: '0s' },
            { text: 'Finding the best activities and restaurants', color: 'from-blue-400 to-cyan-400', delay: '0.8s' },
            { text: 'Optimizing your daily schedule', color: 'from-purple-400 to-violet-400', delay: '1.6s' },
            { text: 'Preparing your personalized recommendations', color: 'from-orange-400 to-amber-400', delay: '2.4s' }
          ].map((step, index) => (
            <div key={index} className="flex items-center text-sm text-white/90 group">
              <div 
                className={`w-3 h-3 bg-gradient-to-r ${step.color} rounded-full mr-4 animate-pulse shadow-lg`}
                style={{ animationDelay: step.delay }}
              />
              <span className="group-hover:text-white transition-colors duration-300">{step.text}</span>
              <div 
                className={`ml-auto w-6 h-6 bg-gradient-to-r ${step.color} rounded-full opacity-0 animate-ping`}
                style={{ animationDelay: step.delay, animationDuration: '2s' }}
              />
            </div>
          ))}
        </div>
        
        {/* Advanced Progress Bar */}
        <div className="space-y-3">
          <div className="relative w-full h-3 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm border border-white/20">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
            <div 
              className="h-full bg-gradient-to-r from-purple-500 via-blue-500 to-purple-400 rounded-full relative overflow-hidden"
              style={{ width: '85%', transition: 'width 3s ease-in-out' }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
              <div className="absolute right-0 top-0 w-8 h-full bg-gradient-to-r from-transparent to-white/50 animate-pulse"></div>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <p className="text-xs text-white/60">AI Processing...</p>
            <div className="flex space-x-1">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
            <p className="text-xs text-white/60">Almost ready!</p>
          </div>
        </div>
      </div>
    </div>
  );
};
