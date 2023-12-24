import React, { useEffect} from "react";
import { useStateContext } from "../contexts/ContextProvider";
import {
  Box,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  ToggleButton,
} from "@mui/material";
import ReplyOutlinedIcon from "@mui/icons-material/ReplyOutlined";
import WidgetsIcon from "@mui/icons-material/Widgets";
import { signOut} from "firebase/auth";
import { auth } from "../firebase/firebase";
import { Link, useNavigate } from "react-router-dom";
import { Logout } from "@mui/icons-material";

const Navbar = () => {
  
  const { activeMenu, setActiveMenu, setScreenSize, screenSize,userData } =
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
      setActiveMenu(true);
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
  const open = Boolean(anchorEl);
  const handleClick1 = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  return (
    <div
      className="flex justify-between  items-center relative bg-purple-500"
      style={{ height: "60px" }}
    >
      <ToggleButton
        value="center"
        aria-label="centered"
        onClick={handleActiveMenu}
        sx={{ border: "none" }}
      >
        {activeMenu ? (
          <ReplyOutlinedIcon style={{ color: "white", fontSize: "25px" }} />
        ) : (
          <WidgetsIcon style={{ color: "white", fontSize: "20px" }} />
        )}
      </ToggleButton>
      <Link
        to="/"
        onClick={handleCloseSideBar}
        className="items-center gap-3 ml-3 mt-4 mb-4 flex text-xl font-extrabold tracking-tight text-white sm:hidden"
      >
        <h1 className="w-20 ml-14">CapRaise</h1>
      </Link>
      <div className="mr-[40px] hidden sm:flex">
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            textAlign: "center",
            marginRight: "40px",
          }}
        >
          <p>
            <span className="text-white text-14">Hi,</span>
            <span className="text-white font-bold ml-2 text-14">{userData?.fullName?userData?.fullName:userData?.churchName}</span>
          </p>
          <IconButton
            onClick={handleClick1}
            size="small"
            sx={{ ml: 2, border: 1, color: "white" }}
            aria-controls={open ? "account-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={open ? "true" : undefined}
          >
            <Logout/>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            id="account-menu"
            open={anchorEl}
            onClose={handleClose}
            onClick={handleClose}
            transformOrigin={{ horizontal: "left", vertical: "top" }}
            anchorOrigin={{ horizontal: "left", vertical: "bottom" }}
          >
            <MenuItem onClick={userSignOut}>
              <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
              Sign Out
            </MenuItem>
          </Menu>
        </Box>
      </div>
      <div className="sm:hidden mr-[100px]"></div>
    </div>
  );
};

export default Navbar;
