import "./App.css";
import Register from "./components/auth/Register";
import SignIn from "./components/auth/SignIn";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import React, { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import { useStateContext } from "./contexts/ContextProvider";
import Dashboard from "./pages/Dashboard";
import Dashboard2 from "./memberPages/Dashboard";
import BottomNavbar from "./components/BottomNavbar";
import Fundraisers from "./pages/Fundraisers";
import Churches from "./pages/Churches";
import Campaigns from "./pages/Campaigns";
import AgapeSignIn from "./components/auth/AgapeSignIn";
import AgapeRegister from "./components/auth/AgapeRegister";
import { Backdrop, CircularProgress } from "@mui/material";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import branch from "branch-sdk";

function App() {
  const { authUser, userData, loading } = useStateContext();
  const [welcome, setWelcome] = useState(true);
  const { activeMenu } = useStateContext();

  useEffect(() => {
    const timer = setTimeout(() => {
      setWelcome(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    branch.init('key_live_fsmuy5YHmP245wlULiJfkjimxDkwz7MA', (err, data) => {
      if (err) {
        console.log('Error initializing Branch:', err);
        return;
      }
    });
  }, []);

  if (loading) {
    return (
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    );
  }

  return (
    <div
      style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
    >
      <BrowserRouter>
        {welcome ? (
          <div className="w-full h-screen flex justify-center items-center bg-orange-50">
            <p className="text-5xl font-semibold text-orange-300">CapRaise</p>
          </div>
        ) : (
          ""
        )}
        {authUser ? (
          <div className="flex relative dark:bg-main-dark-bg">
            {activeMenu ? (
              <div className="w-72 fixed sidebar dark:bg-secondary-dark-bg bg-white ">
                <Sidebar />
              </div>
            ) : (
              <div className="w-0 dark:bg-secondary-dark-bg">
                <Sidebar />
              </div>
            )}
            <div
              className={
                activeMenu
                  ? "dark:bg-main-dark-bg  bg-main-bg min-h-screen md:ml-72 w-full  "
                  : "bg-main-bg dark:bg-main-dark-bg  w-full min-h-screen flex-2 "
              }
              style={{ position: "relative" }}
            >
              <div className="static sm:static bg-main-bg dark:bg-main-dark-bg navbar w-full ">
                <Navbar />
              </div>
              <div className="overflow-y-scroll" style={{ height: "90vh" }}>
                {userData?.role === "admin" ||
                userData?.role === "SuperAdmin" ? (
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
                  </Routes>
                )}
              </div>
              <div className="bg-main-bg navbar w-full absolute bottom-0">
                <BottomNavbar />
              </div>
            </div>
          </div>
        ) : (
          <Routes>
            <Route path="/" element={<SignIn />} />
            <Route path="/register" element={<Register />} />
            <Route path="/agape" element={<AgapeSignIn />} />
            <Route path="/agape/register" element={<AgapeRegister />} />
          </Routes>
        )}
      </BrowserRouter>
      <ToastContainer />
    </div>
  );
}

export default App;
