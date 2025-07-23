import React, { createContext, useContext, useEffect, useState } from "react";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { auth } from "../firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import axios from "axios";
import apiService from "../services/api";

// Temporary Firestore instance for fallback operations only
// TODO: Remove when all operations are fully migrated to middleware
const db = getFirestore();

const StateContext = createContext();

const initialState = {
  chat: false,
  cart: false,
  userProfile: false,
  notification: false,
};

export const ContextProvider = ({ children }) => {
  const [screenSize, setScreenSize] = useState(undefined);
  const [currentColor, setCurrentColor] = useState("purple");
  const [currentMode, setCurrentMode] = useState("Light");
  const [themeSettings, setThemeSettings] = useState(false);
  const [activeMenu, setActiveMenu] = useState(true);
  const [isClicked, setIsClicked] = useState(initialState);

  const [authUser, setAuthUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);

  const [adminData, setAdminData] = useState("");

  const [externalData, setExternalData] = useState([]);


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
    const fetchAdminData = async () => {
      if (adminId) {
        try {
          // Try to get admin data via middleware first
          const currentUser = await apiService.getCurrentUser();
          if (currentUser && (currentUser.role === 'admin' || currentUser.adminId)) {
            setAdminData(currentUser);
            console.log('✅ Admin data fetched via middleware:', currentUser);
          }
        } catch (middlewareError) {
          console.warn('Middleware admin fetch failed, falling back to direct Firebase:', middlewareError.message);
          
          // Fallback to direct Firebase call
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
      }
    };

    fetchAdminData();
  }, [adminId]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (authUser) {
        setLoading(true);
        try {
          // Try to get current user data via middleware first
          const currentUser = await apiService.getCurrentUser();
          setUserData(currentUser);
          console.log('✅ User data fetched via middleware:', currentUser);
        } catch (middlewareError) {
          console.warn('Middleware user fetch failed, falling back to direct Firebase:', middlewareError.message);
          
          // Fallback to direct Firebase calls
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


    const fetchDataFromExternalAPI = async () => {
      // Only fetch donations if user is authenticated
      if (!authUser) {
        console.log("Waiting for user authentication before fetching donations...");
        return;
      }

      try {
        // Try to get donation data via middleware first
        const response = await apiService.getDonations();
        setExternalData(response.donations || []);
        console.log('✅ Donation data fetched via middleware:', response.donations?.length || 0);
      } catch (middlewareError) {
        console.warn('Middleware donation fetch failed, falling back to direct external API:', middlewareError.message);
        
        // Fallback to direct external API call
        try {
          const response = await axios.get("https://capraise-backend.onrender.com/api/v1/fetchData");
          setExternalData(response.data);
          console.log('✅ Fallback: Donation data fetched via external API:', response.data?.length || 0);
        } catch (error) {
          console.error("Error fetching donation data:", error.message);
          setExternalData([]); // Set empty array on complete failure
        }
      }
    };
  
    useEffect(() => {
      fetchDataFromExternalAPI();
    }, [authUser]); // Add authUser as dependency

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
        externalData
      }}
    >
      {children}
    </StateContext.Provider>
  );
};

export const useStateContext = () => useContext(StateContext);
