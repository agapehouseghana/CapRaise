import React from "react";
import { links, memberLinks,superAdminLinks } from "../utils/dummys";
import { NavLink } from "react-router-dom";
import { useStateContext } from "../contexts/ContextProvider";

const BottomNavbar = () => {
  const { currentColor, userData } = useStateContext();
  const activeLink =
    "flex items-center  py-2 px-3  rounded-lg  text-white  text-md m-2";
  const normalLink =
    "flex items-center  py-2 px-3  rounded-lg text-md text-gray-700 hover:bg-light-gray m-2";
  return (
    <div
      className=" bg-white sidebar w-full sm:hidden flex justify-evenly items-center"
      style={{ height: "60px" }}
    >
      {userData?.role === "admin" ? (
        <>
          {links.map((item) => (
            <NavLink
              to={`/${item.name}`}
              key={item.name}
              style={({ isActive }) => ({
                backgroundColor: isActive ? currentColor : "",
              })}
              className={({ isActive }) => (isActive ? activeLink : normalLink)}
            >
              <div className="flex flex-col justify-center items-center">
                {item.icon}
                <p className="text-xs">{item.name}</p>
              </div>
            </NavLink>
          ))}
        </>
      ) : userData?.role === "SuperAdmin" ? (
        <>
          {superAdminLinks.map((item) => (
            <NavLink
              to={`/${item.name}`}
              key={item.name}
              style={({ isActive }) => ({
                backgroundColor: isActive ? currentColor : "",
              })}
              className={({ isActive }) => (isActive ? activeLink : normalLink)}
            >
              <div className="flex flex-col justify-center items-center">
                {item.icon}
                <p className="text-xs">{item.name}</p>
              </div>
            </NavLink>
          ))}
        </>
      ) : (
        <>
          {memberLinks.map((item) => (
            <NavLink
              to={`/${item.name}`}
              key={item.name}
              style={({ isActive }) => ({
                backgroundColor: isActive ? currentColor : "",
              })}
              className={({ isActive }) => (isActive ? activeLink : normalLink)}
            >
              <div className="flex flex-col justify-center items-center">
                {item.icon}
                <p className="text-xs">{item.name}</p>
              </div>
            </NavLink>
          ))}
        </>
      )}
    </div>
  );
};

export default BottomNavbar;
