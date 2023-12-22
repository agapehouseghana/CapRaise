import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { links, memberLinks, superAdminLinks } from "../utils/dummys";
import { useStateContext } from "../contexts/ContextProvider";
import { ToggleButton } from "@mui/material";
import ReplyOutlinedIcon from "@mui/icons-material/ReplyOutlined";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/firebase";

const Sidebar = ({setDeferredPrompt,deferredPrompt}) => {
  const { currentColor, activeMenu, setActiveMenu, screenSize, userData } =
    useStateContext();
  const navigate = useNavigate();

  const handleCloseSideBar = () => {
    if (activeMenu !== undefined && screenSize <= 900) {
      setActiveMenu(false);
    }
  };
  const handleActiveMenu = () => setActiveMenu(!activeMenu);
  const userSignOut = () => {
    signOut(auth)
      .then(() => {
        console.log("sign out successful");
        navigate("/");
      })
      .catch((error) => console.log(error));
  };

  const activeLink =
    "flex items-center gap-5 pl-4 pt-3 pb-2.5 rounded-lg  text-white  text-md m-2";
  const normalLink =
    "flex items-center gap-5 pl-4 pt-3 pb-2.5 rounded-lg text-md text-gray-700 dark:text-gray-200 dark:hover:text-black hover:bg-light-gray m-2";

  return (
    <div className=" h-screen sm:overflow-hidden overflow-auto sm:hover:overflow-auto pb-10">
      {activeMenu && (
        <>
          <div
            className="flex justify-between items-center w-72 bg-orange-400"
            style={{ height: "60px" }}
          >
            <Link
              to="/"
              onClick={handleCloseSideBar}
              className="items-center gap-3 ml-3 mt-4 mb-4 flex text-xl font-extrabold tracking-tight text-white"
            >
              <h1 className="w-20 ml-14">CapRaise</h1>
            </Link>
            <div className="md:hidden">
              <ToggleButton
                value="center"
                aria-label="centered"
                onClick={handleActiveMenu}
                sx={{ border: "none" }}
              >
                <ReplyOutlinedIcon
                  style={{ color: "white", fontSize: "25px" }}
                />
              </ToggleButton>
            </div>
          </div>

          <div className="mt-10 hidden sm:block">
            {userData?.role === "admin" ? (
              <>
                {links.map((item) => (
                  <NavLink
                    to={`/${item.name}`}
                    key={item.name}
                    onClick={handleCloseSideBar}
                    style={({ isActive }) => ({
                      backgroundColor: isActive ? currentColor : "",
                    })}
                    className={({ isActive }) =>
                      isActive ? activeLink : normalLink
                    }
                  >
                    {item.icon}
                    <span className="capitalize p-2">{item.name}</span>
                  </NavLink>
                ))}
              </>
            ) : userData?.role === "SuperAdmin" ? (
              <>
                {superAdminLinks.map((item) => (
                  <NavLink
                    to={`/${item.name}`}
                    key={item.name}
                    onClick={handleCloseSideBar}
                    style={({ isActive }) => ({
                      backgroundColor: isActive ? currentColor : "",
                    })}
                    className={({ isActive }) =>
                      isActive ? activeLink : normalLink
                    }
                  >
                    {item.icon}
                    <span className="capitalize p-2">{item.name}</span>
                  </NavLink>
                ))}
              </>
            ) : (
              <>
                {memberLinks.map((item) => (
                  <NavLink
                    to={`/${item.name}`}
                    key={item.name}
                    onClick={handleCloseSideBar}
                    style={({ isActive }) => ({
                      backgroundColor: isActive ? currentColor : "",
                    })}
                    className={({ isActive }) =>
                      isActive ? activeLink : normalLink
                    }
                  >
                    {item.icon}
                    <span className="capitalize p-2">{item.name}</span>
                  </NavLink>
                ))}
              </>
            )}
          </div>
          <div className="mt-10 justify-center flex sm:hidden flex-col">
            <button onClick={userSignOut} className="font-semibold mb-10">
              Sign Out
            </button>
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
              >
                Install App
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Sidebar;
