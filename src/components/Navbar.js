import React, { useEffect } from "react";
import { useStateContext } from "../contexts/ContextProvider";
import {
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/firebase";
import { Link, useNavigate } from "react-router-dom";
import { Logout, AccountCircle } from "@mui/icons-material";
import Agape from "../utils/images/Agape.png";

const Navbar = () => {
  const { activeMenu, setActiveMenu, setScreenSize, screenSize, userData } =
    useStateContext();

  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => setScreenSize(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setScreenSize]);

  useEffect(() => {
    if (screenSize <= 900) {
      setActiveMenu(false);
    } else {
      setActiveMenu(false);
    }
  }, [screenSize, setActiveMenu]);

  const handleActiveMenu = () => setActiveMenu(!activeMenu);

  const userSignOut = () => {
    signOut(auth)
      .then(() => {
        console.log("sign out successful");
        navigate("/");
      })
      .catch((error) => console.log(error));
  };
  
  const handleCloseSideBar = () => {
    if (activeMenu !== undefined && screenSize <= 900) {
      setActiveMenu(false);
    }
  };

  const [anchorEl, setAnchorEl] = React.useState(false);
  const handleClick1 = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  return (
    <nav className="relative overflow-hidden">
      {/* Modern gradient background with multiple layers */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-800"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/10"></div>
      
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-transparent to-blue-500 animate-gradient-x"></div>
      </div>
      
      {/* Glass effect overlay */}
      <div className="absolute inset-0 backdrop-blur-[1px] bg-white/5"></div>
      
      {/* Content */}
      <div className="relative flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        {/* Left side - Menu toggle and Logo */}
        <div className="flex items-center">
          {/* Menu Toggle Button with glass effect */}
          <button
            onClick={handleActiveMenu}
            className="p-2 rounded-lg bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/30 group"
          >
            {activeMenu ? (
              <CloseIcon className="w-6 h-6 text-white group-hover:rotate-90 transition-transform duration-300" />
            ) : (
              <MenuIcon className="w-6 h-6 text-white group-hover:scale-110 transition-transform duration-300" />
            )}
          </button>

          {/* Mobile Logo */}
          <Link
            to="/"
            onClick={handleCloseSideBar}
            className="ml-4 sm:hidden transform hover:scale-105 transition-transform duration-300"
          >
            <img src={Agape} alt="logo" className="h-8 w-auto drop-shadow-lg" />
          </Link>
        </div>

        {/* Center - Optional tagline for desktop */}
        <div className="hidden lg:block absolute left-1/2 transform -translate-x-1/2">
          <p className="text-white/80 text-sm font-light tracking-wide">
            Empowering Communities Through Faith
          </p>
        </div>

        {/* Right side - User info */}
        <div className="flex items-center">
          {/* Desktop User Info */}
          <div className="hidden sm:flex items-center space-x-4">
            <div className="text-right">
              <p className="text-xs text-white/70 font-light">Welcome back,</p>
              <p className="text-sm font-semibold text-white drop-shadow-sm">
                {userData?.fullName || userData?.churchName || 'User'}
              </p>
            </div>
            
            <div className="relative">
              <IconButton
                onClick={handleClick1}
                className="bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 shadow-lg"
                size="small"
              >
                <AccountCircle className="w-8 h-8 text-white drop-shadow-md" />
              </IconButton>
              
              <Menu
                anchorEl={anchorEl}
                id="account-menu"
                open={Boolean(anchorEl)}
                onClose={handleClose}
                onClick={handleClose}
                transformOrigin={{ horizontal: "right", vertical: "top" }}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                PaperProps={{
                  elevation: 8,
                  sx: {
                    mt: 1.5,
                    minWidth: 220,
                    borderRadius: 2,
                    overflow: 'visible',
                    '&:before': {
                      content: '""',
                      display: 'block',
                      position: 'absolute',
                      top: 0,
                      right: 22,
                      width: 10,
                      height: 10,
                      bgcolor: 'background.paper',
                      transform: 'translateY(-50%) rotate(45deg)',
                      zIndex: 0,
                    },
                    '& .MuiMenuItem-root': {
                      px: 2,
                      py: 1.5,
                      borderRadius: 1,
                      mx: 1,
                      my: 0.5,
                    },
                  },
                }}
              >
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-900">
                    {userData?.fullName || userData?.churchName}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {userData?.email}
                  </p>
                  <p className="text-xs text-purple-600 font-medium mt-1">
                    {userData?.role === "admin" && "Administrator"}
                    {userData?.role === "SuperAdmin" && "Super Admin"}
                    {userData?.role === "member" && "Member"}
                  </p>
                </div>
                <MenuItem onClick={userSignOut} className="hover:bg-red-50 text-gray-700 hover:text-red-600 transition-colors">
                  <ListItemIcon>
                    <Logout fontSize="small" className="text-red-600" />
                  </ListItemIcon>
                  <span>Sign Out</span>
                </MenuItem>
              </Menu>
            </div>
          </div>

          {/* Mobile User Menu - Glass button */}
          <div className="sm:hidden">
            <IconButton
              onClick={userSignOut}
              size="small"
              className="bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300"
            >
              <Logout className="w-5 h-5 text-white" />
            </IconButton>
          </div>
        </div>
      </div>

      {/* Bottom gradient line for depth */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
    </nav>
  );
};

export default Navbar;
