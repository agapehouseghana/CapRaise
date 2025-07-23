import React from "react";
import { links, memberLinks, superAdminLinks } from "../utils/dummys";
import { NavLink } from "react-router-dom";
import { useStateContext } from "../contexts/ContextProvider";

const BottomNavbar = () => {
  const { userData } = useStateContext();
  
  // Format display name - convert "raise-funds" to "Raise Funds"
  const formatDisplayName = (name) => {
    return name.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };
  
  // Determine which links to show based on user role
  const navigationLinks = userData?.role === "SuperAdmin" 
    ? superAdminLinks.slice(0, 4) // Show only first 4 items for mobile
    : userData?.role === "admin" 
    ? links 
    : memberLinks;
  
  return (
    <div className="bg-white/90 backdrop-blur-xl h-16 flex items-center justify-around px-2 shadow-2xl border-t border-gray-200/50">
      {navigationLinks.map((item) => (
        <NavLink
          key={item.name}
          to={`/${item.name}`}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center px-3 py-2 rounded-xl transition-all duration-200 ${
              isActive
                ? "text-purple-700 bg-purple-100/80 scale-95"
                : "text-gray-600 hover:text-purple-600 hover:bg-purple-50/50"
            }`
          }
        >
          <span className={({ isActive }) => 
            `mb-1 transition-all duration-200 ${isActive ? "scale-110 text-purple-700" : "text-gray-600"}`
          }>
            {React.cloneElement(item.icon, { 
              style: { fontSize: 22 }
            })}
          </span>
          <span className="text-[10px] font-medium">
            {formatDisplayName(item.name)}
          </span>
        </NavLink>
      ))}
    </div>
  );
};

export default BottomNavbar;
