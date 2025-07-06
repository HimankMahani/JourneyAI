import { Button } from "@/components/ui/button";
import AIButton from "@/components/ui/ai-button";
import { GradientBadge } from "@/components/ui/GradientBadge";
import { Sparkles, Plane, MapPin, Globe } from "lucide-react";

const FLOATING_ICONS = [
  { Icon: Plane, top: "20%", left: "10%", delay: "0s", duration: "6s" },
  { Icon: MapPin, top: "40%", right: "15%", delay: "0.8s", duration: "6.5s" },
  { Icon: Globe, top: "60%", left: "20%", delay: "1.6s", duration: "7s" },
  { Icon: Plane, top: "25%", right: "25%", delay: "2.4s", duration: "7.5s" },
  { Icon: MapPin, top: "70%", right: "10%", delay: "3.2s", duration: "8s" },
];

const STATS = [
  { value: "50K+", label: "Happy Travelers", gradient: "from-yellow-300 to-orange-300" },
  { value: "200+", label: "Destinations", gradient: "from-green-300 to-blue-300" },
  { value: "99%", label: "Satisfaction", gradient: "from-pink-300 to-purple-300" },
];

const Hero = () => {
  return (
    <section className="relative min-h-[calc(100vh-4rem)] bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white overflow-hidden transition-all duration-700">
      {/* Background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent"></div>
        {[1, 2, 3].map((i) => (
          <div key={i}
            className={`absolute ${i===1 ? "top-1/4 left-1/4" : i===2 ? "bottom-1/4 right-1/4" : "top-20 right-20"} w-96 h-96 bg-${i===1 ? "purple" : i===2 ? "blue" : "pink"}-500/10 rounded-full blur-3xl animate-pulse`}
            style={{ animationDelay: `${i}s` }}
          ></div>
        ))}
      </div>
      
      {/* Floating icons */}
      <div className="absolute inset-0 pointer-events-none">
        {FLOATING_ICONS.map(({ Icon, top, left, right, delay, duration }, index) => (
          <div 
            key={index}
            className="absolute opacity-20 animate-float animate-spin" 
            style={{ 
              top, left, right, 
              animationDelay: delay, 
              animationDuration: duration 
            }}
          >
            <Icon className="h-6 w-6 text-white" />
          </div>
        ))}
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="text-center">
          <div className="animate-fade-in">
            <GradientBadge 
              icon={<Sparkles className="w-4 h-4 text-yellow-300" />}
              text="AI-Powered Travel Planning"
              className="mb-8"
            />

            <h1 className="text-6xl md:text-8xl font-bold mb-8 leading-tight">
              <span className="block bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
                Discover Your
              </span>
              <span className="block bg-gradient-to-r from-yellow-300 via-orange-300 to-red-300 bg-clip-text text-transparent animate-pulse">
                Next Adventure
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl mb-12 text-white/80 max-w-4xl mx-auto leading-relaxed">
              Let AI craft your perfect journey. Discover hidden gems, book luxury accommodations, 
              and create unforgettable memories with personalized travel recommendations powered by advanced AI.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <AIButton className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white font-semibold text-base px-12 py-4 rounded-xl">
                <Sparkles className="mr-3 h-6 w-6" />
                Start AI Planning
              </AIButton>
              
              <Button size="lg" variant="outline" className="border-2 border-white/50 bg-white/10 text-white backdrop-blur-sm text-lg px-10 py-6 rounded-2xl">
                <Globe className="mr-3 h-6 w-6" />
                Explore Destinations
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto">
              {STATS.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className={`text-3xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                    {stat.value}
                  </div>
                  <div className="text-white/60">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
