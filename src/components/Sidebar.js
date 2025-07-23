import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { links, memberLinks, superAdminLinks } from "../utils/dummys";
import { useStateContext } from "../contexts/ContextProvider";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/firebase";
import Agape from "../utils/images/Agape.png";
import LogoutIcon from "@mui/icons-material/Logout";
import HomeIcon from "@mui/icons-material/Home";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";

const Sidebar = ({ setDeferredPrompt, deferredPrompt }) => {
  const { activeMenu, setActiveMenu, screenSize, userData } = useStateContext();
  const navigate = useNavigate();

  const handleCloseSideBar = () => {
    if (activeMenu !== undefined && screenSize <= 900) {
      setActiveMenu(false);
    }
  };

  const userSignOut = () => {
    signOut(auth)
      .then(() => {
        console.log("sign out successful");
        navigate("/");
      })
      .catch((error) => console.log(error));
  };

  // Format display name - convert "raise-funds" to "Raise Funds"
  const formatDisplayName = (name) => {
    return name.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  // Determine which links to show based on user role
  const navigationLinks = userData?.role === "SuperAdmin" 
    ? superAdminLinks 
    : userData?.role === "admin" 
    ? links 
    : memberLinks;

  return (
    <div className="h-full flex flex-col bg-transparent">
      {activeMenu && (
        <>
          {/* Logo Section with subtle gradient */}
          <div className="h-20 flex items-center px-6 mb-2">
            <Link
              to="/"
              onClick={handleCloseSideBar}
              className="flex items-center"
            >
              <img src={Agape} alt="logo" className="h-10 w-auto" />
            </Link>
          </div>

          {/* User Profile Section */}
          <div className="px-4 mb-4">
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="bg-white p-2 rounded-lg border border-gray-200">
                  <PersonOutlineIcon className="w-5 h-5 text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {userData?.fullName || userData?.churchName || 'User'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {userData?.role === "admin" && "Administrator"}
                    {userData?.role === "SuperAdmin" && "Super Admin"}
                    {userData?.role === "member" && "Member"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-3 py-2 overflow-y-auto">
            {navigationLinks.map((item) => (
              <NavLink
                key={item.name}
                to={`/${item.name}`}
                onClick={handleCloseSideBar}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2.5 mb-1 rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-purple-600 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span className={`flex items-center justify-center w-5 h-5 mr-3 ${
                      isActive ? "text-white" : "text-gray-500"
                    }`}>
                      {React.cloneElement(item.icon, { 
                        style: { fontSize: 18 },
                        className: "w-5 h-5"
                      })}
                    </span>
                    <span className={`text-sm font-medium ${
                      isActive ? "text-white" : "text-gray-700"
                    }`}>
                      {formatDisplayName(item.name)}
                    </span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Bottom Section */}
          <div className="p-4 border-t border-gray-200">
            {/* Install App Button */}
            {deferredPrompt && (
              <button
                onClick={() => {
                  deferredPrompt.prompt();
                  deferredPrompt.userChoice.then((choiceResult) => {
                    if (choiceResult.outcome === "accepted") {
                      console.log("User accepted the install prompt");
                    } else {
                      console.log("User dismissed the install prompt");
                    }
                    setDeferredPrompt(null);
                  });
                }}
                className="w-full mb-3 flex items-center justify-center px-3 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200 text-sm font-medium"
              >
                <HomeIcon className="w-4 h-4 mr-2" />
                Install App
              </button>
            )}

            {/* Mobile Sign Out Button */}
            <button
              onClick={userSignOut}
              className="w-full flex items-center justify-center px-3 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200 sm:hidden text-sm font-medium"
            >
              <LogoutIcon className="w-4 h-4 mr-2" />
              Sign Out
            </button>

            {/* Copyright */}
            <p className="text-center text-xs text-gray-400 mt-4">
              © 2025 CapRaise
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default Sidebar;

