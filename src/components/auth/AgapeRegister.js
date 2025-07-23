import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { churchList } from "../../utils/dummys";
import { CircularProgress } from "@mui/material";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../../firebase/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import ChurchOutlinedIcon from '@mui/icons-material/ChurchOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import LoginOutlinedIcon from '@mui/icons-material/LoginOutlined';
import logo from "../../utils/images/logo.png";

const AgapeRegister = () => {
  const [loading, setLoading] = useState(false);

  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [church, setChurch] = useState("Agape House");
  const [showPassword, setShowPassword] = useState(false);
  const role = "member";

  const [fullNameError, setFullNameError] = useState("");
  const [phoneNumberError, setPhoneNumberError] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [churchError, setChurchError] = useState(false);

  const navigate = useNavigate();

  const redirectToSignIn = () => {
    navigate("/agape");
  };
  
  const signUp = (e) => {
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

    if (church === "") {
      setChurchError(true);
      setLoading(false);
    } else {
      setChurchError(false);
    }

    if (fullName === "") {
      setFullNameError(true);
      setLoading(false);
    } else {
      setFullNameError(false);
    }

    if (phoneNumber === "") {
      setPhoneNumberError(true);
      setLoading(false);
    } else {
      setPhoneNumberError(false);
    }

    if (email && password && fullName && phoneNumber) {
      createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          const userId = userCredential.user.uid;
          const userData = {
            fullName: fullName,
            email: userCredential.user.email,
            phoneNumber: phoneNumber,
            church: church,
            role: role,
            adminId: "3XXjbBVSIycV9IitM19W6i6W84y2",
          };
          
          function generateChurchReferalCode(length) {
            function generateRandomDigits(length) {
              let randomDigits = "";
              const characters = "0123456789";

              for (let i = 0; i < length; i++) {
                const randomIndex = Math.floor(
                  Math.random() * characters.length
                );
                randomDigits += characters.charAt(randomIndex);
              }

              return randomDigits;
            }

            const randomDigits = generateRandomDigits(length);
            return `${randomDigits}`;
          }
          
          const referalCode = generateChurchReferalCode(5);

          const usersCollectionRef = doc(db, "users", userId);
          return setDoc(usersCollectionRef, {
            ...userData,
            userId,
            referalCode: referalCode,
          });
        })
        .then(() => {
          console.log("User registered successfully!");
          setLoading(false);
          navigate("/");
        })
        .catch((error) => {
          console.error("Error registering user:", error);
          setLoading(false);
        });
      localStorage.removeItem("userData");
    }
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
          <div className="text-center mb-6">
            <img src={logo} alt="CapRaise" className="w-16 h-16 mx-auto mb-3 drop-shadow-2xl" />
            <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
            <p className="text-white/70">Join CapRaise and start fundraising</p>
          </div>

          {/* Glass card */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-6 border border-white/20">
            <form onSubmit={signUp} className="space-y-4">
              {/* Full Name Input */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-white/90">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <PersonOutlinedIcon className="h-5 w-5 text-white/50" />
                  </div>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className={`w-full pl-10 pr-3 py-3 bg-white/10 border ${
                      fullNameError ? 'border-red-400' : 'border-white/20'
                    } rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all duration-300`}
                  />
                </div>
                {fullNameError && (
                  <p className="text-red-300 text-xs mt-1">Full name is required</p>
                )}
              </div>

              {/* Phone Number Input */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-white/90">Phone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <PhoneOutlinedIcon className="h-5 w-5 text-white/50" />
                  </div>
                  <input
                    type="tel"
                    placeholder="233*********"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className={`w-full pl-10 pr-3 py-3 bg-white/10 border ${
                      phoneNumberError ? 'border-red-400' : 'border-white/20'
                    } rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all duration-300`}
                  />
                </div>
                {phoneNumberError && (
                  <p className="text-red-300 text-xs mt-1">Phone number is required</p>
                )}
              </div>

              {/* Email Input */}
              <div className="space-y-1">
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
              <div className="space-y-1">
                <label className="text-sm font-medium text-white/90">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockOutlinedIcon className="h-5 w-5 text-white/50" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
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

              {/* Church Selection */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-white/90">Church</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <ChurchOutlinedIcon className="h-5 w-5 text-white/50" />
                  </div>
                  <select
                    value={church}
                    onChange={(e) => setChurch(e.target.value)}
                    className={`w-full pl-10 pr-3 py-3 bg-white/10 border ${
                      churchError ? 'border-red-400' : 'border-white/20'
                    } rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all duration-300 appearance-none`}
                  >
                    <option value="Agape House" className="bg-purple-700">Agape House</option>
                    {churchList.map((church) => (
                      <option key={church.id} value={church.name} className="bg-purple-700">
                        {church.name}
                      </option>
                    ))}
                  </select>
                </div>
                {churchError && (
                  <p className="text-red-300 text-xs mt-1">Please select a church</p>
                )}
              </div>

              {/* Terms & Conditions */}
              <div className="flex items-start">
                <input type="checkbox" className="mt-1 rounded border-white/20 bg-white/10 text-purple-600 focus:ring-purple-500" />
                <span className="ml-2 text-xs text-white/70">
                  I agree to the{' '}
                  <button type="button" className="text-white underline hover:text-white/80">
                    Terms and Conditions
                  </button>{' '}
                  and{' '}
                  <button type="button" className="text-white underline hover:text-white/80">
                    Privacy Policy
                  </button>
                </span>
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
                    <PersonAddIcon className="w-5 h-5" />
                    <span>Create Account</span>
                  </>
                )}
              </button>

              {/* Sign In Link */}
              <button
                type="button"
                onClick={redirectToSignIn}
                className="w-full py-3 px-4 bg-white/10 border border-white/20 text-white rounded-lg font-medium hover:bg-white/20 transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <LoginOutlinedIcon className="w-5 h-5" />
                <span>Already have an account? Sign In</span>
              </button>
            </form>
          </div>

          {/* Footer */}
          <p className="text-center text-white/50 text-sm mt-6">
            © 2025 CapRaise. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AgapeRegister;
