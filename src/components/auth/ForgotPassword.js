import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CircularProgress } from "@mui/material";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../firebase/firebase";
import { toast } from "react-toastify";
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import logo from "../../utils/images/logo.png";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState(false);
  
  const navigate = useNavigate();

  const handleSendResetEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    setEmailError(false);
    
    if (!email) {
      setEmailError(true);
      setLoading(false);
      return;
    }
    
    try {
      // Firebase's built-in password reset
      await sendPasswordResetEmail(auth, email);
      
      // Success!
      setEmailSent(true);
      toast.success("Password reset email sent successfully!");
      
      // Optional: Redirect to login after a delay
      setTimeout(() => {
        navigate("/agape");
      }, 5000);
      
    } catch (error) {
      console.error("Error sending reset email:", error);
      
      // Handle specific Firebase errors
      if (error.code === 'auth/user-not-found') {
        toast.error("No account found with this email address.");
      } else if (error.code === 'auth/invalid-email') {
        toast.error("Invalid email address.");
      } else {
        toast.error("Failed to send reset email. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate("/agape");
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
            <h1 className="text-3xl font-bold text-white mb-2">
              {emailSent ? "Check Your Email" : "Forgot Password"}
            </h1>
            <p className="text-white/70">
              {emailSent 
                ? "We've sent password reset instructions to your email"
                : "Enter your email and we'll send you a reset link"
              }
            </p>
          </div>

          {/* Glass card */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
            {!emailSent ? (
              <form onSubmit={handleSendResetEmail} className="space-y-6">
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
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setEmailError(false);
                      }}
                      className={`w-full pl-10 pr-3 py-3 bg-white/10 border ${
                        emailError ? 'border-red-400' : 'border-white/20'
                      } rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all duration-300`}
                    />
                  </div>
                  {emailError && (
                    <p className="text-red-300 text-xs mt-1">Email is required</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-white text-purple-700 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <CircularProgress size={20} className="text-purple-700" />
                  ) : (
                    <>
                      <SendIcon className="w-5 h-5" />
                      <span>Send Reset Email</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="text-center space-y-6">
                {/* Success Icon */}
                <div className="flex justify-center">
                  <div className="bg-green-500/20 rounded-full p-4">
                    <CheckCircleOutlineIcon className="w-16 h-16 text-green-400" />
                  </div>
                </div>
                
                {/* Success Message */}
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-white">Email Sent!</h3>
                  <p className="text-white/70 text-sm">
                    We've sent a password reset link to:
                  </p>
                  <p className="text-white font-medium">{email}</p>
                </div>
                
                {/* Instructions */}
                <div className="bg-white/10 rounded-lg p-4 text-left space-y-2">
                  <p className="text-white/90 text-sm font-medium">What's next?</p>
                  <ul className="text-white/70 text-sm space-y-1 list-disc list-inside">
                    <li>Check your email inbox</li>
                    <li>Click the reset link in the email</li>
                    <li>Create a new secure password</li>
                  </ul>
                </div>
                
                <p className="text-white/50 text-xs">
                  Didn't receive the email? Check your spam folder or try again.
                </p>
              </div>
            )}

            {/* Back to Login */}
            <button
              type="button"
              onClick={handleBackToLogin}
              className="w-full mt-6 py-3 px-4 bg-white/10 border border-white/20 text-white rounded-lg font-medium hover:bg-white/20 transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <ArrowBackIcon className="w-5 h-5" />
              <span>Back to Sign In</span>
            </button>
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

export default ForgotPassword; 