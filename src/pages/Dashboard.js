import React, { useEffect, useState } from "react";
import { CircularProgress } from "@mui/material";
import MemberStatsBarChart from "../components/MemberStatsBarChart";
import { useStateContext } from "../contexts/ContextProvider";
import { collection, query, getDocs, where } from "firebase/firestore";
import { db } from "../firebase/firebase";
import Statistics from "../components/Statistics";
import TopFundraisers from "../components/TopFundraisers";
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CampaignIcon from '@mui/icons-material/Campaign';
import PeopleIcon from '@mui/icons-material/People';
import AssessmentIcon from '@mui/icons-material/Assessment';

const Dashboard = () => {
  const [loading, setLoading] = useState(false);
  const { adminData, userData } = useStateContext();
  const [campaigns, setCampaigns] = useState([]);
  const [usersLinkedToAdmin, setUsersLinkedToAdmin] = useState([]);
  const adminId = adminData?.adminId || userData?.adminId;

  const campaignCount = campaigns?.length;
  const fundraiserCount = usersLinkedToAdmin?.length;

  useEffect(() => {
    const fetchData = async () => {
      if (!adminId) {
        console.log("Waiting for admin ID...");
        return;
      }

      setLoading(true);
      
      // Fetch campaigns
      try {
        const campaignsCollectionRef = collection(db, "campaigns");
        const campaignsQuery = query(
          campaignsCollectionRef,
          where("adminId", "==", adminId)
        );
        const campaignsSnapshot = await getDocs(campaignsQuery);
        const campaignList = [];

        campaignsSnapshot?.forEach((doc) => {
          const campaignData = doc?.data();
          campaignList?.push(campaignData);
        });
        setCampaigns(campaignList);
      } catch (error) {
        console.error("Error fetching campaigns:", error);
      }

      // Fetch users linked to admin
      try {
        const usersCollectionRef = collection(db, "users");
        const usersQuery = query(
          usersCollectionRef, 
          where("adminId", "==", adminId)
        );
        const usersSnapshot = await getDocs(usersQuery);
        const users = [];
        
        usersSnapshot?.forEach((doc) => {
          const userData = doc?.data();
          users?.push(userData);
        });
        setUsersLinkedToAdmin(users);
      } catch (error) {
        console.error("Error fetching users linked to admin:", error);
      }
      
      setLoading(false);
    };

    fetchData();
  }, [adminId]);

  return (
    <>
      {loading ? (
        <div className="w-full h-[calc(100vh-200px)] flex justify-center items-center">
          <div className="text-center">
            <CircularProgress style={{ color: "#7c3aed" }} size={50} />
            <p className="mt-4 text-gray-600">Loading dashboard data...</p>
          </div>
        </div>
      ) : (
        <div className="min-h-screen bg-gray-50/50">
          {/* Header Section */}
          <div className="bg-white border-b border-gray-200">
            <div className="px-4 sm:px-6 lg:px-8 py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
                  <p className="mt-1 text-sm text-gray-500">
                    Welcome back, {userData?.fullName || userData?.churchName || 'Admin'}
                  </p>
                </div>
                <div className="hidden sm:flex items-center space-x-3">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    <TrendingUpIcon className="w-4 h-4 mr-1" />
                    Overview
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="px-4 sm:px-6 lg:px-8 py-8">
            {/* Statistics Cards */}
            <div className="mb-8">
              <Statistics
                campaignCount={campaignCount}
                fundraiserCount={fundraiserCount}
                campaigns={campaigns}
              />
            </div>

            {/* Charts Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <AssessmentIcon className="w-5 h-5 text-purple-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Analytics</h2>
                </div>
                <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                  View detailed reports →
                </button>
              </div>
              
              <div className="mt-4">
                <MemberStatsBarChart
                  usersLinkedToAdmin={usersLinkedToAdmin}
                  campaigns={campaigns}
                />
              </div>
            </div>

            {/* Top Fundraisers Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <PeopleIcon className="w-5 h-5 text-purple-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Top Performers</h2>
                </div>
                {fundraiserCount > 0 && (
                  <span className="text-sm text-gray-500">
                    {fundraiserCount} total fundraisers
                  </span>
                )}
              </div>
              
              <TopFundraisers
                usersLinkedToAdmin={usersLinkedToAdmin}
                campaigns={campaigns}
              />
            </div>

            {/* Quick Actions */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <button className="p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 text-left group">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Create Campaign</p>
                    <p className="text-xs text-gray-500 mt-1">Launch a new fundraising campaign</p>
                  </div>
                  <CampaignIcon className="w-8 h-8 text-purple-600 group-hover:scale-110 transition-transform" />
                </div>
              </button>
              
              <button className="p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 text-left group">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Invite Members</p>
                    <p className="text-xs text-gray-500 mt-1">Add new fundraisers to your team</p>
                  </div>
                  <PeopleIcon className="w-8 h-8 text-purple-600 group-hover:scale-110 transition-transform" />
                </div>
              </button>
              
              <button className="p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 text-left group">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">View Reports</p>
                    <p className="text-xs text-gray-500 mt-1">Download detailed analytics</p>
                  </div>
                  <AssessmentIcon className="w-8 h-8 text-purple-600 group-hover:scale-110 transition-transform" />
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Dashboard;
