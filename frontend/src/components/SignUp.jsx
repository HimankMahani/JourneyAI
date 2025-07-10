import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Mail, Lock, Eye, EyeOff, User, Users, 
  MapPin, Sparkles, UserPlus, AlertCircle,
  CheckCircle, ArrowRight
} from "lucide-react";
import { useAuth } from "@/contexts/useAuth";

const SignUp = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    location: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(1);

  const validateField = (field, value) => {
    switch (field) {
      case 'firstName':
        return value.trim().length < 2 ? 'First name must be at least 2 characters' : '';
      case 'lastName':
        return value.trim().length < 2 ? 'Last name must be at least 2 characters' : '';
      case 'email': {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return !emailRegex.test(value) ? 'Please enter a valid email address' : '';
      }
      case 'password':
        return value.length < 6 ? 'Password must be at least 6 characters' : '';
      case 'confirmPassword':
        return value !== formData.password ? 'Passwords do not match' : '';
      case 'location':
        return value.trim().length < 3 ? 'Please enter your city and country' : '';
      default:
        return '';
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleBlur = (field) => {
    const error = validateField(field, formData[field]);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const validateCurrentStep = () => {
    const newErrors = {};
    
    if (currentStep === 1) {
      // Step 1: Personal Information
      newErrors.firstName = validateField('firstName', formData.firstName);
      newErrors.lastName = validateField('lastName', formData.lastName);
    } else if (currentStep === 2) {
      // Step 2: Account Details
      newErrors.email = validateField('email', formData.email);
      newErrors.password = validateField('password', formData.password);
      newErrors.confirmPassword = validateField('confirmPassword', formData.confirmPassword);
      newErrors.location = validateField('location', formData.location);
    }
    
    setErrors(newErrors);
    return Object.values(newErrors).every(error => error === '');
  };

  const handleNextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep(2);
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(1);
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    
    if (!validateCurrentStep()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { confirmPassword: _confirmPassword, ...userData } = formData;
      const result = await register(userData);
      
      if (result.success) {
        navigate('/planning');
      } else {
        setErrors({ submit: result.error });
      }
    } catch (err) {
      setErrors({ submit: err.message || "Registration failed. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const getStepProgress = () => {
    return (currentStep / 2) * 100;
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
            <UserPlus className="w-4 h-4 mr-2" />
            Join Our Community
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-purple-900 to-gray-900 bg-clip-text text-transparent mb-4">
            Create Account
          </h2>
          <p className="text-lg text-gray-600 max-w-sm mx-auto">
            Start your journey with personalized travel planning powered by AI
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Step {currentStep} of 2</span>
            <span className="text-sm font-medium text-gray-700">{Math.round(getStepProgress())}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-600 to-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${getStepProgress()}%` }}
            ></div>
          </div>
        </div>

        {/* Sign Up Form */}
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
                <div>
                  {currentStep === 1 ? 'Personal Information' : 'Account Details'}
                </div>
                <div className="text-base font-normal text-purple-100 mt-1">
                  {currentStep === 1 ? 'Tell us about yourself' : 'Create your account'}
                </div>
              </div>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-8 relative">
            <form onSubmit={handleSignUp} className="space-y-6">
              {currentStep === 1 && (
                <>
                  {/* First Name */}
                  <div className="space-y-3 group">
                    <label className="text-sm font-semibold flex items-center text-gray-700 group-hover:text-purple-600 transition-colors">
                      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-2 rounded-lg mr-3">
                        <User className="h-4 w-4 text-white" />
                      </div>
                      First Name
                    </label>
                    <input
                      type="text"
                      placeholder="Enter your first name"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      onBlur={() => handleBlur('firstName')}
                      className={`w-full border-2 ${errors.firstName ? 'border-red-300' : 'border-gray-200'} focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 rounded-xl py-3 px-4 transition-all duration-300`}
                      required
                    />
                    {errors.firstName && (
                      <div className="flex items-center text-red-500 text-sm mt-1">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.firstName}
                      </div>
                    )}
                  </div>

                  {/* Last Name */}
                  <div className="space-y-3 group">
                    <label className="text-sm font-semibold flex items-center text-gray-700 group-hover:text-purple-600 transition-colors">
                      <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-2 rounded-lg mr-3">
                        <User className="h-4 w-4 text-white" />
                      </div>
                      Last Name
                    </label>
                    <input
                      type="text"
                      placeholder="Enter your last name"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      onBlur={() => handleBlur('lastName')}
                      className={`w-full border-2 ${errors.lastName ? 'border-red-300' : 'border-gray-200'} focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 rounded-xl py-3 px-4 transition-all duration-300`}
                      required
                    />
                    {errors.lastName && (
                      <div className="flex items-center text-red-500 text-sm mt-1">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.lastName}
                      </div>
                    )}
                  </div>

                  <Button
                    type="button"
                    onClick={handleNextStep}
                    className="w-full bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 hover:from-purple-700 hover:via-purple-800 hover:to-indigo-800 text-white py-6 text-lg font-bold rounded-xl shadow-xl transition-all duration-300 transform hover:scale-[1.02] relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                    <div className="flex items-center justify-center relative z-10">
                      Continue
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </div>
                  </Button>
                </>
              )}

              {currentStep === 2 && (
                <>
                  {/* Email */}
                  <div className="space-y-3 group">
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
                      onBlur={() => handleBlur('email')}
                      className={`w-full border-2 ${errors.email ? 'border-red-300' : 'border-gray-200'} focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 rounded-xl py-3 px-4 transition-all duration-300`}
                      required
                    />
                    {errors.email && (
                      <div className="flex items-center text-red-500 text-sm mt-1">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.email}
                      </div>
                    )}
                  </div>

                  {/* Location */}
                  <div className="space-y-3 group">
                    <label className="text-sm font-semibold flex items-center text-gray-700 group-hover:text-purple-600 transition-colors">
                      <div className="bg-gradient-to-r from-orange-500 to-red-500 p-2 rounded-lg mr-3">
                        <MapPin className="h-4 w-4 text-white" />
                      </div>
                      Location
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., New York, USA or London, UK"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      onBlur={() => handleBlur('location')}
                      className={`w-full border-2 ${errors.location ? 'border-red-300' : 'border-gray-200'} focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 rounded-xl py-3 px-4 transition-all duration-300`}
                      required
                    />
                    {errors.location && (
                      <div className="flex items-center text-red-500 text-sm mt-1">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.location}
                      </div>
                    )}
                    <div className="text-xs text-gray-500 mt-1">
                      We'll use this to calculate transportation costs in your travel plans
                    </div>
                  </div>

                  {/* Password */}
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
                        placeholder="Create a strong password"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        onBlur={() => handleBlur('password')}
                        className={`w-full border-2 ${errors.password ? 'border-red-300' : 'border-gray-200'} focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 rounded-xl py-3 px-4 pr-12 transition-all duration-300`}
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
                    {errors.password && (
                      <div className="flex items-center text-red-500 text-sm mt-1">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.password}
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-3 group">
                    <label className="text-sm font-semibold flex items-center text-gray-700 group-hover:text-purple-600 transition-colors">
                      <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg mr-3">
                        <Lock className="h-4 w-4 text-white" />
                      </div>
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        onBlur={() => handleBlur('confirmPassword')}
                        className={`w-full border-2 ${errors.confirmPassword ? 'border-red-300' : 'border-gray-200'} focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 rounded-xl py-3 px-4 pr-12 transition-all duration-300`}
                        required
                      />
                      <button
                        type="button"
                        onClick={toggleConfirmPasswordVisibility}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <div className="flex items-center text-red-500 text-sm mt-1">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.confirmPassword}
                      </div>
                    )}
                    {formData.confirmPassword && !errors.confirmPassword && formData.password && (
                      <div className="flex items-center text-green-500 text-sm mt-1">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Passwords match
                      </div>
                    )}
                  </div>

                  {errors.submit && (
                    <div className="flex items-center bg-red-50 text-red-500 p-3 rounded-lg mt-3 mb-3 text-sm">
                      <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                      <span>{errors.submit}</span>
                    </div>
                  )}

                  <div className="flex gap-4">
                    <Button
                      type="button"
                      onClick={handlePrevStep}
                      className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-6 text-lg font-bold rounded-xl shadow-xl transition-all duration-300"
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 hover:from-purple-700 hover:via-purple-800 hover:to-indigo-800 text-white py-6 text-lg font-bold rounded-xl shadow-xl transition-all duration-300 transform hover:scale-[1.02] relative overflow-hidden group"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                      <div className="flex items-center justify-center relative z-10">
                        {isLoading ? (
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                        ) : (
                          <UserPlus className="mr-2 h-5 w-5" />
                        )}
                        {isLoading ? "Creating..." : "Create Account"}
                      </div>
                    </Button>
                  </div>
                </>
              )}
              
              <div className="text-center mt-6 text-gray-600">
                Already have an account?{" "}
                <Link to="/login" className="text-purple-600 hover:text-purple-800 font-semibold">
                  Sign In
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SignUp;
