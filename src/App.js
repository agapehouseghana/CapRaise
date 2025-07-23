import "./App.css";
import Register from "./components/auth/Register";
// import SignIn from "./components/auth/SignIn";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import React, { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import { useStateContext } from "./contexts/ContextProvider";
import Dashboard from "./pages/Dashboard";
import Dashboard2 from "./memberPages/Dashboard";
import RaiseFunds from "./memberPages/RaiseFunds";
import BottomNavbar from "./components/BottomNavbar";
import Fundraisers from "./pages/Fundraisers";
import Churches from "./pages/Churches";
import Campaigns from "./pages/Campaigns";
import AgapeSignIn from "./components/auth/AgapeSignIn";
import AgapeRegister from "./components/auth/AgapeRegister";
import ForgotPassword from "./components/auth/ForgotPassword";
import { Backdrop, CircularProgress } from "@mui/material";
import { ToastContainer } from "react-toastify";
import logo from "./utils/images/logo.png";
import "react-toastify/dist/ReactToastify.css";
import PWAInstallPrompt from './components/PWAInstallPrompt';
import OTP from "./components/auth/OTP";

function App() {
  const { setCurrentColor, activeMenu, userData, authUser, loading } =
    useStateContext();
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const currentThemeColor = localStorage.getItem("colorMode");
    if (currentThemeColor) {
      setCurrentColor(currentThemeColor);
    }
  }, [setCurrentColor]);

  const [welcome, setWelcome] = useState(true);
  useEffect(() => {
    setTimeout(() => {
      setWelcome(false);
    }, 2000);
  }, []);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setDeferredPrompt(event);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
      <Backdrop open={loading} style={{ backgroundColor: "#fff", zIndex: 9999 }}>
        <CircularProgress style={{ color: "purple" }} />
      </Backdrop>
      <BrowserRouter>
        {welcome ? (
          <div className="fixed inset-0 z-50 flex justify-center items-center bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800">
            <div className="text-center">
              <img src={logo} alt="logo" className="w-24 h-24 mx-auto animate-pulse drop-shadow-2xl"/>
              <p className="mt-4 text-white font-medium text-lg">Welcome to CapRaise</p>
            </div>
          </div>
        ) : (
          ""
        )}
        {authUser ? (
          <div className="flex h-screen overflow-hidden">
            {/* Sidebar with glass effect */}
            <div className={`${activeMenu ? 'w-72' : 'w-0'} transition-all duration-300 flex-shrink-0 relative z-20`}>
              <div className="h-full bg-white/80 backdrop-blur-xl shadow-2xl overflow-y-auto border-r border-gray-200/50">
                <Sidebar deferredPrompt={deferredPrompt} setDeferredPrompt={setDeferredPrompt}/>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 relative">
              {/* Subtle gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-purple-50/20 to-purple-100/30 pointer-events-none"></div>
              
              {/* Top Navbar */}
              <header className="relative z-10">
                <Navbar />
              </header>

              {/* Main Content */}
              <main className="flex-1 overflow-y-auto relative z-0 pb-16 sm:pb-0">
                <div className="h-full px-4 sm:px-6 lg:px-8 py-6">
                  {userData?.role === "admin" || userData?.role === "SuperAdmin" ? (
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/fundraisers" element={<Fundraisers />} />
                      {userData?.role === "SuperAdmin" && (
                        <Route path="/churches" element={<Churches />} /> 
                      )}
                      <Route path="/campaigns" element={<Campaigns />} />
                    </Routes>
                  ) : (
                    <Routes>
                      <Route path="/" element={<Dashboard2 />} />
                      <Route path="/dashboard" element={<Dashboard2 />} />
                      <Route path="/raise-funds" element={<RaiseFunds />} />
                    </Routes>
                  )}
                </div>
              </main>

              {/* Bottom Navigation - Mobile Only */}
              <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-200/50 sm:hidden z-20">
                <BottomNavbar />
              </nav>
            </div>
          </div>
        ) : (
          <Routes>
            <Route path="/" element={<AgapeSignIn />} />
            <Route path="/register" element={<Register />} />
            <Route path="/agape" element={<AgapeSignIn />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/OTP" element={<OTP />} />
            <Route path="/agape/register" element={<AgapeRegister />} />
          </Routes>
        )}
      <PWAInstallPrompt />
      </BrowserRouter>
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
}

export default App;
