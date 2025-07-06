import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Mail, Lock, Eye, EyeOff, Sparkles, 
  Zap, LogIn, AlertCircle
} from "lucide-react";
import { useAuth } from "@/contexts/useAuth";

const SignIn = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        // Navigate to dashboard on successful login
        navigate('/planning');
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message || "Invalid email or password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="py-24 bg-gradient-to-br from-slate-50 via-white to-blue-50 relative overflow-hidden min-h-screen">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full opacity-30">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute -bottom-32 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="max-w-md mx-auto px-4 sm:px-6 relative">
        <div className="text-center mb-10">
          <div className="inline-flex items-center px-4 py-2 mb-6 text-sm font-medium bg-purple-100 text-purple-700 rounded-full">
            <LogIn className="w-4 h-4 mr-2" />
            Welcome Back
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-purple-900 to-gray-900 bg-clip-text text-transparent mb-4">
            Sign In
          </h2>
          <p className="text-lg text-gray-600 max-w-sm mx-auto">
            Access your account to continue your travel planning journey
          </p>
        </div>

        {/* Sign In Form */}
        <div className="max-w-md mx-auto shadow-2xl border-0 bg-white/80 backdrop-blur-lg relative overflow-hidden rounded-xl">
          {/* Card glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 via-pink-400/10 to-blue-400/10 rounded-xl"></div>
          
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 text-white rounded-t-xl relative overflow-hidden p-6">
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='7' cy='7' r='7'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}></div>
            <div className="text-2xl flex items-center relative z-10">
              <div className="bg-white/20 p-3 rounded-xl mr-4">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <div>Login to Your Account</div>
                <div className="text-base font-normal text-purple-100 mt-1">Resume your journey</div>
              </div>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-8 relative">
            <form onSubmit={handleSignIn} className="space-y-6">                <div className="space-y-3 group">
                  <label className="text-sm font-semibold flex items-center text-gray-700 group-hover:text-purple-600 transition-colors">
                    <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-2 rounded-lg mr-3">
                      <Mail className="h-4 w-4 text-white" />
                    </div>
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full border-2 ${error ? 'border-red-300' : 'border-gray-200'} focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 rounded-xl py-3 px-4 transition-all duration-300`}
                    required
                  />
                </div>

              <div className="space-y-3 group">
                <label className="text-sm font-semibold flex items-center text-gray-700 group-hover:text-purple-600 transition-colors">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-2 rounded-lg mr-3">
                    <Lock className="h-4 w-4 text-white" />
                  </div>
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="w-full border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 rounded-xl py-3 px-4 pr-12 transition-all duration-300"
                    required
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={() => setRememberMe(!rememberMe)}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    Remember me
                  </label>
                </div>
                <div className="text-sm">
                  <Link to="/forgot-password" className="text-purple-600 hover:text-purple-800 font-semibold">
                    Forgot password?
                  </Link>
                </div>
              </div>

              {error && (
                <div className="flex items-center bg-red-50 text-red-500 p-3 rounded-lg mt-3 mb-3 text-sm">
                  <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 hover:from-purple-700 hover:via-purple-800 hover:to-indigo-800 text-white py-6 text-lg font-bold rounded-xl shadow-xl transition-all duration-300 transform hover:scale-[1.02] relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                <div className="flex items-center justify-center relative z-10">
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                  ) : (
                    <LogIn className="mr-2 h-5 w-5" />
                  )}
                  {isLoading ? "Signing in..." : "Sign In"}
                </div>
              </Button>
              
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>
              
              <div className="flex justify-center">
                <button
                  type="button"
                  className="flex justify-center items-center py-3 px-6 border border-gray-300 rounded-xl shadow-sm bg-white text-gray-700 hover:bg-gray-50 transition-all duration-300 w-full max-w-xs"
                  onClick={() => {
                    // This is where we would typically trigger the Google Sign-In flow
                    // For now, we'll just show a message that this is not implemented yet
                    alert('Google Sign-In will be implemented in a future update');
                  }}
                >
                  <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Sign in with Google
                </button>
              </div>

              <div className="text-center mt-6 text-gray-600">
                Don't have an account?{" "}
                <Link to="/signup" className="text-purple-600 hover:text-purple-800 font-semibold">
                  Sign Up
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SignIn;
