import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Mail, Sparkles, Zap, ArrowLeft, Send, AlertCircle } from "lucide-react";
import { authService } from "@/services/api";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      await authService.forgotPassword(email);
      setIsSubmitted(true);
    } catch (err) {
      setError(err.message || "Failed to send password reset email. Please try again.");
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
          <Link to="/login" className="inline-flex items-center mb-6 text-sm font-medium text-purple-700 hover:text-purple-800 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Sign In
          </Link>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-purple-900 to-gray-900 bg-clip-text text-transparent mb-4">
            Reset Password
          </h2>
          <p className="text-lg text-gray-600 max-w-sm mx-auto">
            Enter your email and we'll send you instructions to reset your password
          </p>
        </div>

        {/* Password Reset Form */}
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
                <div>Forgot Password?</div>
                <div className="text-base font-normal text-purple-100 mt-1">We'll help you recover it</div>
              </div>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-8 relative">
            {isSubmitted ? (
              <div className="text-center py-8 space-y-6">
                <div className="bg-green-100 text-green-800 p-4 rounded-xl inline-flex items-center justify-center mx-auto">
                  <div className="bg-green-200 rounded-full p-3">
                    <Send className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-800">Check Your Email</h3>
                <p className="text-gray-600">
                  We've sent password recovery instructions to <span className="font-semibold">{email}</span>
                </p>
                <Link
                  to="/login"
                  className="inline-block w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-4 rounded-xl text-center font-medium hover:from-purple-700 hover:to-indigo-700 transition-all duration-300"
                >
                  Back to Sign In
                </Link>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-6">
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full border-2 ${error ? 'border-red-300' : 'border-gray-200'} focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 rounded-xl py-3 px-4 transition-all duration-300`}
                    required
                  />
                  {error && (
                    <div className="flex items-center text-red-500 mt-2 text-sm">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      <span>{error}</span>
                    </div>
                  )}
                </div>

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
                      <Send className="mr-2 h-5 w-5" />
                    )}
                    {isLoading ? "Sending..." : "Reset Password"}
                  </div>
                </Button>

                <div className="text-center mt-6">
                  <Link to="/login" className="text-purple-600 hover:text-purple-800 font-semibold flex items-center justify-center">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Sign In
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ForgotPassword;
