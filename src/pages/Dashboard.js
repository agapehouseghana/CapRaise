import React, { useEffect, useState } from "react";
import { CircularProgress } from "@mui/material";
import MemberStatsBarChart from "../components/MemberStatsBarChart";
import { useStateContext } from "../contexts/ContextProvider";
import { collection, query, getDocs, where } from "firebase/firestore";
import { db } from "../firebase/firebase";
import Statistics from "../components/Statistics";
import TopFundraisers from "../components/TopFundraisers";

const Dashboard = () => {
  const [loading, setLoading] = useState(false);
  const { adminData } = useStateContext();
  const [campaigns, setCampaigns] = useState([]);
  const [usersLinkedToAdmin, setUsersLinkedToAdmin] = useState([]);
  const adminId = adminData?.adminId;

  const campaignCount = campaigns.length;
  const fundraiserCount = usersLinkedToAdmin.length;

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
    const fetchUsersLinkedToAdmin = async () => {
      setLoading(true);
      const usersCollectionRef = collection(db, "users");
      const q = query(usersCollectionRef, where("adminId", "==", adminId));

      try {
        const querySnapshot = await getDocs(q);
        const users = [];
        querySnapshot.forEach((doc) => {
          const userData = doc.data();
          users.push(userData);
        });
        setUsersLinkedToAdmin(users);
      } catch (error) {
        console.error("Error fetching users linked to admin:", error);
      }
      setLoading(false);
    };
    fetchUsersLinkedToAdmin();
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
          <Statistics campaignCount={campaignCount}fundraiserCount={fundraiserCount} campaigns={campaigns}/>
          <div className="mt-[50px]">
            <p className="text-sm uppercase font-medium mb-3">Charts</p>
            <div className="">
              <div>
                <MemberStatsBarChart usersLinkedToAdmin={usersLinkedToAdmin} campaigns={campaigns}/>
              </div>
            </div>
          </div>

          <div className="my-[50px]">
            <p className="text-sm uppercase font-medium mb-3">
              Top Fundraisers
            </p>
            <TopFundraisers usersLinkedToAdmin={usersLinkedToAdmin} campaigns={campaigns}/>
          </div>
        </div>
      )}
    </>
  );
};

export default Dashboard;
