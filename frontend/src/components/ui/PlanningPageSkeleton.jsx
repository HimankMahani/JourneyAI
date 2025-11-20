import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export const TripGenerationLoader = () => {
  const [progress, setProgress] = useState(8);

  useEffect(() => {
    let mounted = true;
    const maxProgress = 92; // keep a little room for completion
    const interval = setInterval(() => {
      if (!mounted) return;
      setProgress((prev) => {
        if (prev >= maxProgress) return prev;
        // Ease-out increment: larger jumps early, smaller near the cap
        const step = Math.max(0.4, (maxProgress - prev) * 0.06);
        const next = Math.min(maxProgress, prev + step);
        return next;
      });
    }, 180);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

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
              style={{ width: `${progress}%`, transition: 'width 300ms ease-out' }}
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
