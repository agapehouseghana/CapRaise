import React, { useEffect, useState } from "react";
import { CircularProgress } from "@mui/material";
import { useStateContext } from "../contexts/ContextProvider";
import { collection, query, getDocs, where, getFirestore } from "firebase/firestore";
import apiService from "../services/api";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PeopleIcon from '@mui/icons-material/People';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ShareIcon from '@mui/icons-material/Share';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';
import { toast } from "react-toastify";

// Temporary Firestore instance for fallback operations only
const db = getFirestore();

const Dashboard = () => {
  const { userData, externalData } = useStateContext();
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [showCampaignDetails, setShowCampaignDetails] = useState(false);
  const adminId = userData?.adminId;
  const [loading, setLoading] = useState(false);

  // Calculate active campaigns
  const activeCampaigns = campaigns?.filter(campaign => {
    const endDate = campaign.endDate ? new Date(campaign.endDate) : null;
    return !endDate || endDate > new Date();
  }) || [];

  // Calculate member's total raised
  const calculateMemberStats = () => {
    let totalRaised = 0;
    let totalDonors = 0;
    
    if (userData?.referalCode && externalData) {
      campaigns.forEach(campaign => {
        const campaignDonations = externalData.filter(
          data => data.referalCode === userData.referalCode && 
                  data.serviceCode === campaign.serviceCode
        );
        
        totalRaised += campaignDonations.reduce((sum, d) => sum + (d.amount || 0), 0);
        totalDonors += campaignDonations.length;
      });
    }
    
    return { totalRaised, totalDonors };
  };

  const { totalRaised, totalDonors } = calculateMemberStats();

  // Share functionality
  const handleShare = () => {
    const shareUrl = `${window.location.origin}/donate/${userData?.referalCode}`;
    const shareText = `Support my fundraising campaign for ${userData?.churchName || 'our cause'}!`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Support My Fundraising Campaign',
        text: shareText,
        url: shareUrl,
      }).catch((error) => console.log('Error sharing:', error));
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(shareUrl);
      toast.success("Fundraising link copied to clipboard!");
    }
  };

  // View campaign details
  const handleViewCampaignDetails = (campaign) => {
    setSelectedCampaign(campaign);
    setShowCampaignDetails(true);
  };

  useEffect(() => {
    const fetchCampaigns = async () => {
      setLoading(true);
      if (adminId) {
        try {
          // Use middleware API to fetch campaigns
          const response = await apiService.getCampaigns();
          setCampaigns(response.campaigns || []);
          console.log('✅ Member dashboard campaigns fetched via middleware:', response.campaigns?.length || 0);
        } catch (error) {
          console.log("Error fetching campaigns:", error);
          // Fallback to direct Firebase if middleware fails
          try {
            const campaignsCollectionRef = collection(db, "campaigns");
            const q = query(
              campaignsCollectionRef,
              where("adminId", "==", adminId)
            );
            const querySnapshot = await getDocs(q);
            const campaignList = [];

            querySnapshot?.forEach((doc) => {
              const campaignData = doc?.data();
              campaignList?.push(campaignData);
            });
            setCampaigns(campaignList);
          } catch (fallbackError) {
            console.log("Fallback Firebase fetch also failed:", fallbackError);
          }
        }
        setLoading(false);
      } else {
        console.log("Admin ID is undefined or null");
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, [adminId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <CircularProgress size={40} className="text-gray-600" />
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Welcome back, {userData?.fullName?.split(' ')[0] || 'Member'}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Track your fundraising progress and manage campaigns
              </p>
            </div>
            <div className="hidden sm:block">
              <button 
                onClick={handleShare}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
              >
                <ShareIcon className="w-4 h-4" />
                <span>Share Your Page</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Raised */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Raised</p>
                <p className="mt-2 text-3xl font-semibold text-gray-900">
                  GHS {totalRaised.toLocaleString()}
                </p>
                <p className="mt-1 text-sm text-green-600 flex items-center">
                  <TrendingUpIcon className="w-4 h-4 mr-1" />
                  <span>+12% from last month</span>
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <AttachMoneyIcon className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Total Donors */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Donors</p>
                <p className="mt-2 text-3xl font-semibold text-gray-900">
                  {totalDonors}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Across all campaigns
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <PeopleIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Active Campaigns */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Campaigns</p>
                <p className="mt-2 text-3xl font-semibold text-gray-900">
                  {activeCampaigns.length}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {campaigns.length - activeCampaigns.length} completed
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <AccessTimeIcon className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Active Campaigns Section */}
        {activeCampaigns.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Active Campaigns</h2>
              <button 
                onClick={() => setShowCampaignDetails(true)}
                className="text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                View all campaigns →
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeCampaigns.slice(0, 3).map((campaign, index) => {
                // Calculate campaign-specific stats
                const campaignDonations = externalData?.filter(
                  data => data.referalCode === userData?.referalCode && 
                          data.serviceCode === campaign.serviceCode
                ) || [];
                
                const campaignRaised = campaignDonations.reduce((sum, d) => sum + (d.amount || 0), 0);
                const campaignDonors = campaignDonations.length;
                const progress = campaign.goal ? (campaignRaised / campaign.goal) * 100 : 0;
                
                return (
                  <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="font-medium text-gray-900 line-clamp-2">
                        {campaign.title}
                      </h3>
                      <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">
                        Active
                      </span>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-medium text-gray-900">{progress.toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Raised</p>
                          <p className="font-semibold text-gray-900">GHS {campaignRaised.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Donors</p>
                          <p className="font-semibold text-gray-900">{campaignDonors}</p>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleViewCampaignDetails(campaign)}
                          className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-1"
                        >
                          <VisibilityIcon className="w-4 h-4" />
                          <span>View Details</span>
                        </button>
                        <button 
                          onClick={handleShare}
                          className="bg-purple-50 hover:bg-purple-100 text-purple-700 p-2 rounded-lg transition-colors"
                        >
                          <ShareIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Activity Feed */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
              </div>
              <div className="p-6">
                {externalData && externalData.length > 0 ? (
                  <div className="space-y-4">
                    {externalData
                      .filter(d => d.referalCode === userData?.referalCode)
                      .slice(-5)
                      .reverse()
                      .map((donation, index) => {
                        const campaign = campaigns.find(c => c.serviceCode === donation.serviceCode);
                        return (
                          <div key={index} className="flex items-start space-x-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                            <div className="bg-green-100 p-2 rounded-full">
                              <AttachMoneyIcon className="w-4 h-4 text-green-600" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-gray-900">
                                New donation of <span className="font-semibold">GHS {donation.amount}</span>
                                {campaign && <span className="text-gray-600"> for {campaign.title}</span>}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {donation.donorName && <span>{donation.donorName} • </span>}
                                {new Date(donation.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        );
                      })}
        </div>
      ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <AccessTimeIcon className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-sm">No recent activity</p>
                    <p className="text-gray-400 text-xs mt-1">Share your fundraising page to get started</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button 
                  onClick={handleShare}
                  className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <ShareIcon className="w-5 h-5 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                        Share Fundraising Page
                      </span>
                    </div>
                    <span className="text-gray-400 group-hover:text-gray-600">→</span>
                  </div>
                </button>
                <button 
                  onClick={() => setShowCampaignDetails(true)}
                  className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <PeopleIcon className="w-5 h-5 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                        View All Donors
                      </span>
                    </div>
                    <span className="text-gray-400 group-hover:text-gray-600">→</span>
                  </div>
                </button>
                <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <DownloadIcon className="w-5 h-5 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                        Download Report
                      </span>
                    </div>
                    <span className="text-gray-400 group-hover:text-gray-600">→</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Help Section */}
            <div className="mt-6 bg-purple-50 rounded-lg p-6">
              <h3 className="font-medium text-gray-900 mb-2">Need Help?</h3>
              <p className="text-sm text-gray-600 mb-4">
                Learn how to maximize your fundraising efforts
              </p>
              <button className="text-sm font-medium text-purple-600 hover:text-purple-700">
                View Fundraising Guide →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Campaign Details Modal */}
      {showCampaignDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {selectedCampaign ? selectedCampaign.title : 'All Campaigns'}
              </h2>
              <button 
                onClick={() => {
                  setShowCampaignDetails(false);
                  setSelectedCampaign(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              {selectedCampaign ? (
                // Single Campaign Details
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Campaign Information</h3>
                      <dl className="space-y-2">
                        <div>
                          <dt className="text-sm text-gray-600">Description</dt>
                          <dd className="text-sm text-gray-900">{selectedCampaign.description || 'No description'}</dd>
                        </div>
                        <div>
                          <dt className="text-sm text-gray-600">Goal</dt>
                          <dd className="text-sm font-semibold text-gray-900">GHS {selectedCampaign.goal?.toLocaleString() || '0'}</dd>
                        </div>
                        <div>
                          <dt className="text-sm text-gray-600">Status</dt>
                          <dd className="text-sm">
                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                              Active
                            </span>
                          </dd>
                        </div>
                      </dl>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Your Performance</h3>
                      <dl className="space-y-2">
                        <div>
                          <dt className="text-sm text-gray-600">Amount Raised</dt>
                          <dd className="text-sm font-semibold text-gray-900">
                            GHS {(() => {
                              const donations = externalData?.filter(
                                d => d.referalCode === userData?.referalCode && 
                                     d.serviceCode === selectedCampaign.serviceCode
                              ) || [];
                              return donations.reduce((sum, d) => sum + (d.amount || 0), 0).toLocaleString();
                            })()}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-sm text-gray-600">Number of Donors</dt>
                          <dd className="text-sm font-semibold text-gray-900">
                            {externalData?.filter(
                              d => d.referalCode === userData?.referalCode && 
                                   d.serviceCode === selectedCampaign.serviceCode
                            ).length || 0}
                          </dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200">
                    <button 
                      onClick={handleShare}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                      Share This Campaign
                    </button>
                  </div>
                </div>
              ) : (
                // All Campaigns List
                <div className="space-y-4">
                  {campaigns.map((campaign, index) => {
                    const campaignDonations = externalData?.filter(
                      d => d.referalCode === userData?.referalCode && 
                           d.serviceCode === campaign.serviceCode
                    ) || [];
                    const raised = campaignDonations.reduce((sum, d) => sum + (d.amount || 0), 0);
                    const donors = campaignDonations.length;
                    
                    return (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">{campaign.title}</h3>
                            <p className="text-sm text-gray-600 mt-1">{campaign.description}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            activeCampaigns.includes(campaign) 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {activeCampaigns.includes(campaign) ? 'Active' : 'Completed'}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Raised</p>
                            <p className="font-semibold">GHS {raised.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Goal</p>
                            <p className="font-semibold">GHS {campaign.goal?.toLocaleString() || '0'}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Donors</p>
                            <p className="font-semibold">{donors}</p>
                          </div>
                        </div>
                        
                        <button 
                          onClick={() => setSelectedCampaign(campaign)}
                          className="mt-3 text-sm text-purple-600 hover:text-purple-700 font-medium"
                        >
                          View Details →
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
