import React, { createContext, useContext, useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";

const StateContext = createContext();

const initialState = {
  chat: false,
  cart: false,
  userProfile: false,
  notification: false,
};

export const ContextProvider = ({ children }) => {
  const [screenSize, setScreenSize] = useState(undefined);
  const [currentColor, setCurrentColor] = useState("orange");
  const [currentMode, setCurrentMode] = useState("Light");
  const [themeSettings, setThemeSettings] = useState(false);
  const [activeMenu, setActiveMenu] = useState(true);
  const [isClicked, setIsClicked] = useState(initialState);

  const [authUser, setAuthUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);

  const [adminData, setAdminData] = useState("");

  const adminId = authUser?.uid;


  useEffect(() => {
    const listen = onAuthStateChanged(auth, (user) => {
      setLoading(true);
      if (user) {
        setAuthUser(user);
      } else {
        setAuthUser(null);
      }
      setLoading(false);
    });

    return () => {
      listen();
    };
  }, []);

  useEffect(() => {
    if (adminId) {
      const adminDocRef = doc(db, "admins", adminId);
      getDoc(adminDocRef)
        .then((docSnapshot) => {
          if (docSnapshot.exists()) {
            const adminData = docSnapshot.data();
            setAdminData(adminData);
          } else {
            console.log("Admin does not exist");
          }
        })
        .catch((error) => {
          console.error("Error getting admin data:", error);
        });
    }
  }, [adminId]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (authUser) {
        setLoading(true);
        try {
          const userDocRef = doc(db, "users", authUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            setUserData(userDocSnap.data());
          } else {
            try {
              const adminDocRef = doc(db, "admins", authUser.uid);
              const adminDocSnap = await getDoc(adminDocRef);

              if (adminDocSnap.exists()) {
                setUserData(adminDocSnap.data());
              } else {
                console.log("No admin document found!");
              }
            } catch (error) {
              console.error("Error fetching admin document:", error);
            }
          }
        } catch (error) {
          console.error("Error fetching user document:", error);
        }
        setLoading(false);
      }
    };

    fetchUserData();
  }, [authUser]);

  const setMode = (e) => {
    setCurrentMode(e.target.value);
    localStorage.setItem("themeMode", e.target.value);
  };

  const setColor = (color) => {
    setCurrentColor(color);
    localStorage.setItem("colorMode", color);
  };

  const handleClick = (clicked) =>
    setIsClicked({ ...initialState, [clicked]: true });

  return (
    // eslint-disable-next-line react/jsx-no-constructed-context-values
    <StateContext.Provider
      value={{
        currentColor,
        currentMode,
        activeMenu,
        screenSize,
        setScreenSize,
        handleClick,
        isClicked,
        initialState,
        setIsClicked,
        setActiveMenu,
        setCurrentColor,
        setCurrentMode,
        setMode,
        setColor,
        themeSettings,
        setThemeSettings,
        authUser,
        userData,
        loading,
        setAuthUser,
        adminData,
      }}
    >
      {children}
    </StateContext.Provider>
  );
};

export const useStateContext = () => useContext(StateContext);
