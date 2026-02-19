import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Checkbox } from "../../components/ui/checkbox";
import { toast } from "sonner";
import { apiClient } from "../../lib/api-client";
import { SIGNUP_ROUTE } from "../../utils/constants";
import { useAppStore } from "../../store";

const Auth = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const {setUserInfo} = useAppStore();
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Handle input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateSignup = () => {
    if (!formData.email.length || !formData.password.length) {
      toast.error("Email and password are required");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return false;
    }
    return true;
  };

  const validateLogin = () => {
    if (!formData.email.length || !formData.password.length) {
      toast.error("Email and password are required");
      return false;
    }
    return true;
  };

  // Handle form submission - FIXED: Added e.preventDefault() and proper error handling
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission
    
    if (isRegister) {
      if (!validateSignup()) return;
      
      try {
        const response = await apiClient.post(
          SIGNUP_ROUTE,
          { email: formData.email, password: formData.password },
          { withCredentials: true },
        );
        if (response.data.user.id) {
          toast.success("Registration Successful.");
         setUserInfo(response.data.user);
          navigate("/profile");
        }
        console.log({ response });
      } catch (error) {
        console.error("Signup failed:", error);
        toast.error(error.response?.data?.message || "Signup failed. Please try again.");
      }
    } else {
      if (!validateLogin()) return;
      
      try {
        const response = await apiClient.post(
          "/api/auth/login",
          { email: formData.email, password: formData.password },
          { withCredentials: true },
        );
        console.log({ response });
        if (response.status === 201 && response.data.user.id) {
          setUserInfo(response.data.user);
          toast.success("Login Successful.");
          if (response.data.user.profileSetup) navigate("/chat");
          else navigate("/profile");
        }
      } catch (error) {
        console.error("Login failed:", error);
        toast.error(error.response?.data?.message || "Login failed. Please try again.");
      }
    }
  };

  // Toggle between login and register
  const toggleMode = () => {
    setIsRegister(!isRegister);
    // Reset form when switching
    setFormData({
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  return (
    <div className="flex min-h-screen bg-gray-900">
      {/* Left Panel - Hero Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1721059050924-eaf014837bd1?q=80&w=387&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')`,
          }}
        >
          {/* Gradient Overlay - FIXED: Changed from bg-linear-to-t to bg-gradient-to-t */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-blue-900/20"></div>

          {/* Logo */}
          <div className="absolute top-8 left-8 flex items-center gap-2 text-white">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none">
                <path
                  d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-gray-800"
                />
              </svg>
            </div>
            <span className="text-xl font-semibold">Konnect</span>
          </div>

          {/* Content */}
          <div className="absolute bottom-12 left-8 right-8">
            <h1 className="text-white text-4xl lg:text-5xl font-bold mb-4 leading-tight">
              Find your sweet home
            </h1>
            <p className="text-white/90 text-lg">
              Schedule visit in just a few clicks.
              <br />
              Visits in just a few clicks
            </p>

            {/* Dots indicator */}
            <div className="flex gap-2 mt-8">
              <div className="w-2 h-2 rounded-full bg-white"></div>
              <div className="w-2 h-2 rounded-full bg-white/40"></div>
              <div className="w-2 h-2 rounded-full bg-white/40"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login/Register Form */}
      <div className="flex-1 flex items-center justify-center bg-white px-6 py-12 lg:px-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none">
                <path
                  d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="text-xl font-semibold text-gray-900">Konnect</span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
              {isRegister ? "Create Your Account" : "Welcome Back to Konnect!"}
            </h2>
            <p className="text-gray-500 text-sm">
              {isRegister ? "Sign up to get started" : "Sign in your account"}
            </p>
          </div>

          {/* Form - FIXED: Changed onClick to onSubmit */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Email
              </label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-6 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                placeholder="info.madhu786@gmail.com"
                required
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-6 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent pr-12"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password Input - Only for Register */}
            {isRegister && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-6 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent pr-12"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Submit Button - REMOVED onClick, form handles submission via onSubmit */}
            <Button
              type="submit"
              className="w-full bg-gray-900 hover:bg-gray-800 text-white py-6 rounded-lg font-medium transition-colors"
            >
              {isRegister ? "Create Account" : "Login"}
            </Button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  {isRegister ? "Or sign up with" : "Or continue with"}
                </span>
              </div>
            </div>

            {/* Social Login Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <Button
                type="button"
                variant="outline"
                className="w-full py-6 border-gray-300 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="text-sm text-gray-700">Google</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full py-6 border-gray-300 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span className="text-sm text-gray-700">Facebook</span>
              </Button>
            </div>

            {/* Toggle Login/Register Link */}
            <div className="text-center pt-4">
              <span className="text-sm text-gray-600">
                {isRegister
                  ? "Already have an account?"
                  : "Don't have any account?"}{" "}
              </span>
              <button
                type="button"
                onClick={toggleMode}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                {isRegister ? "Login" : "Register"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Auth;