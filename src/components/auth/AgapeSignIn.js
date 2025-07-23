import { signInWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import { auth } from "../../firebase/firebase";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { CircularProgress } from "@mui/material";
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import logo from "../../utils/images/logo.png";

const AgapeSignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const signIn = (e) => {
    e.preventDefault();
    setLoading(true);
    if (email === "") {
      setEmailError(true);
      setLoading(false);
    } else {
      setEmailError(false);
    }

    if (password === "") {
      setPasswordError(true);
      setLoading(false);
    } else {
      setPasswordError(false);
    }
    if (email && password) {
      signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          navigate("/");
          setLoading(false);
        })
        .catch((error) => {
          const errorMessage = error.message;
          console.log("Sign In Error:", errorMessage);
          toast.error("Invalid email or password");
          setLoading(false);
        });
    }
  };

  const redirectToRegister = () => {
    navigate("/agape/register");
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800">
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
      </div>
      
      {/* Animated shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <img src={logo} alt="CapRaise" className="w-20 h-20 mx-auto mb-4 drop-shadow-2xl" />
            <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-white/70">Sign in to continue to CapRaise</p>
          </div>

          {/* Glass card */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
            <form onSubmit={signIn} className="space-y-6">
              {/* Email Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/90">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <EmailOutlinedIcon className="h-5 w-5 text-white/50" />
                  </div>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full pl-10 pr-3 py-3 bg-white/10 border ${
                      emailError ? 'border-red-400' : 'border-white/20'
                    } rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all duration-300`}
                  />
                </div>
                {emailError && (
                  <p className="text-red-300 text-xs mt-1">Email is required</p>
                )}
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/90">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockOutlinedIcon className="h-5 w-5 text-white/50" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full pl-10 pr-10 py-3 bg-white/10 border ${
                      passwordError ? 'border-red-400' : 'border-white/20'
                    } rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all duration-300`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <VisibilityOffOutlinedIcon className="h-5 w-5 text-white/50 hover:text-white/70" />
                    ) : (
                      <VisibilityOutlinedIcon className="h-5 w-5 text-white/50 hover:text-white/70" />
                    )}
                  </button>
                </div>
                {passwordError && (
                  <p className="text-red-300 text-xs mt-1">Password is required</p>
                )}
              </div>

              {/* Remember me & Forgot password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-white/20 bg-white/10 text-purple-600 focus:ring-purple-500" />
                  <span className="ml-2 text-sm text-white/70">Remember me</span>
                </label>
                <button 
                  type="button" 
                  onClick={() => navigate("/forgot-password")}
                  className="text-sm text-white/70 hover:text-white transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-white text-purple-700 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <CircularProgress size={20} className="text-purple-700" />
                ) : (
                  <>
                    <LoginIcon className="w-5 h-5" />
                    <span>Sign In</span>
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/20"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-transparent text-white/70">Or continue with</span>
                </div>
              </div>

              {/* Register Link */}
              <button
                type="button"
                onClick={redirectToRegister}
                className="w-full py-3 px-4 bg-white/10 border border-white/20 text-white rounded-lg font-medium hover:bg-white/20 transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <PersonAddOutlinedIcon className="w-5 h-5" />
                <span>Create New Account</span>
              </button>
            </form>
          </div>

          {/* Footer */}
          <p className="text-center text-white/50 text-sm mt-8">
            © 2025 CapRaise. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AgapeSignIn;
