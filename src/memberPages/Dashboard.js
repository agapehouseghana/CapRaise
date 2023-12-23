import React, { useEffect, useState } from "react";
import {  CircularProgress } from "@mui/material";
import { useStateContext } from "../contexts/ContextProvider";
import { collection, query, getDocs, where } from "firebase/firestore";
import { db } from "../firebase/firebase";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import Campaign from "../components/Campaigns";
import Statistics from "../components/Statistics";

const Dashboard = () => {
  const { userData } = useStateContext();
  const [campaigns, setCampaigns] = useState([]);
  const adminId = userData?.adminId;
  const [loading, setLoading] = useState(false);
  const campaignCount = campaigns.length;

  useEffect(() => {
    const fetchCampaigns = async () => {
      setLoading(true);
      if (adminId) {
        const campaignsCollectionRef = collection(db, "campaigns");
        const q = query(
          campaignsCollectionRef,
          where("adminId", "==", adminId)
        );
        try {
          const querySnapshot = await getDocs(q);
          const campaignList = [];

          querySnapshot.forEach((doc) => {
            const campaignData = doc.data();
            campaignList.push(campaignData);
          });
          setCampaigns(campaignList);
        } catch (error) {
          console.error("Error fetching campaigns:", error);
        }
        setLoading(false);
      } else {
        console.error("Admin ID is undefined or null");
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, [adminId]);

  return (
    <>
      {loading ? (
        <div className="w-full h-screen flex justify-center items-center">
          <CircularProgress color="success" size={50} />
        </div>
      ) : (
        <div className="p-3 sm:p-10">
          <h1 className="text-4xl text-gray-600 mb-10 font-bold">Dashboard</h1>
          <Statistics campaignCount={campaignCount} campaigns={campaigns}/>
          <div className="my-[50px]">
            <p className="text-sm uppercase font-medium mb-3 bg-slate-200 w-max py-2 px-3">
              Campaigns
            </p>
            <Campaign adminData={userData} campaigns={campaigns}/>
          </div>
        </div>
      )}
    </>
  );
};

export default Dashboard;
