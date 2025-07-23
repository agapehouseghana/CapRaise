import React, { useEffect, useState } from "react";
import { CircularProgress } from "@mui/material";
import { useStateContext } from "../contexts/ContextProvider";
import { collection, query, getDocs, where } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import ShareIcon from "@mui/icons-material/Share";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import PeopleIcon from "@mui/icons-material/People";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import LanguageIcon from '@mui/icons-material/Language';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import CampaignIcon from '@mui/icons-material/Campaign';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { toast } from "react-toastify";
import Countdown from "react-countdown";

const RaiseFunds = () => {
  const { userData, externalData } = useStateContext();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copiedStates, setCopiedStates] = useState({});
  const [expandedDescriptions, setExpandedDescriptions] = useState({});
  const adminId = userData?.adminId;

  // Calculate active campaigns
  const activeCampaigns = campaigns?.filter(campaign => {
    const endDate = campaign.endDate ? new Date(campaign.endDate) : null;
    return !endDate || endDate > new Date();
  }) || [];

  // Toggle description expansion
  const toggleDescription = (campaignId) => {
    setExpandedDescriptions(prev => ({
      ...prev,
      [campaignId]: !prev[campaignId]
    }));
  };

  // Fetch campaigns
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

          querySnapshot?.forEach((doc) => {
            const campaignData = doc?.data();
            campaignList?.push(campaignData);
          });
          setCampaigns(campaignList);
        } catch (error) {
          console.log("Error fetching campaigns:", error);
        }
        setLoading(false);
      } else {
        console.log("Admin ID is undefined or null");
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, [adminId]);

  // Calculate campaign stats
  const getCampaignStats = (campaign) => {
    const campaignDonations = externalData?.filter(
      data => data.referalCode === userData?.referalCode && 
              data.serviceCode === campaign.serviceCode
    ) || [];
    
    const totalRaised = campaignDonations.reduce((sum, d) => sum + (d.amount || 0), 0);
    const donorCount = campaignDonations.length;
    const overallRaised = totalRaised + (campaign.currentProgress || 0);
    const progress = campaign.fundraisingGoal ? (overallRaised / campaign.fundraisingGoal) * 100 : 0;
    
    return { totalRaised, donorCount, progress, overallRaised };
  };

  // Copy to clipboard with state management
  const handleCopy = async (text, type, campaignId) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedStates({ ...copiedStates, [`${type}-${campaignId}`]: true });
      toast.success(`${type} copied!`);
      
      setTimeout(() => {
        setCopiedStates({ ...copiedStates, [`${type}-${campaignId}`]: false });
      }, 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
      toast.error("Failed to copy to clipboard");
    }
  };

  // Share functionality
  const handleShare = async (campaign) => {
    const shareText = `Support ${campaign.campaignName || campaign.title} - ${campaign.description}`;
    const shareUrl = `https://collections.kowri.app/main/${campaign.serviceCode}/${userData?.referalCode}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: campaign.campaignName || campaign.title,
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      handleCopy(shareUrl, 'Link', campaign.serviceCode);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1).replace(/\.0$/, '')}K`;
    }
    return amount.toLocaleString();
  };

  // Countdown renderer
  const countdownRenderer = ({ days, hours, minutes, completed }) => {
    if (completed) {
      return <span className="text-red-600 font-medium">Ended</span>;
    } else {
      return (
        <span className="text-gray-900 font-medium">
          {days}d {hours}h {minutes}m
        </span>
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <CircularProgress size={40} style={{ color: "#7c3aed" }} />
          <p className="mt-4 text-gray-600">Loading campaigns...</p>
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
            <div className="flex items-center space-x-3">
              <CampaignIcon className="w-8 h-8 text-purple-600" />
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  Raise Funds
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Share campaigns and track your fundraising progress
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                {activeCampaigns.length} Active
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 sm:pb-8">
        {/* Campaigns Grid */}
        {activeCampaigns.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            {activeCampaigns.map((campaign, index) => {
              const { totalRaised, donorCount, progress, overallRaised } = getCampaignStats(campaign);
              const isExpanded = expandedDescriptions[campaign.serviceCode];
              
              return (
                <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200 flex flex-col">
                  {/* Campaign Images */}
                  {campaign.imagesURL && campaign.imagesURL.length > 0 ? (
                    <div className="h-48 sm:h-56 bg-gray-100 relative flex-shrink-0">
                      <Carousel 
                        showThumbs={false} 
                        showStatus={false}
                        infiniteLoop
                        autoPlay
                        interval={5000}
                        className="h-full"
                      >
                        {campaign.imagesURL.map((url, i) => (
                          <div key={i} className="h-48 sm:h-56">
                            <img
                              src={url}
                              alt={`${campaign.campaignName || campaign.title}_${i}`}
                              className="object-cover w-full h-full"
                              style={{ objectFit: 'cover' }}
                            />
                          </div>
                        ))}
                      </Carousel>
                      {/* Time Badge */}
                      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-white/90 backdrop-blur-sm text-gray-900 px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm flex items-center shadow-lg">
                        <AccessTimeIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        <Countdown date={campaign.endDate} renderer={countdownRenderer} />
                      </div>
                    </div>
                  ) : (
                    <div className="h-48 sm:h-56 bg-gradient-to-br from-purple-100 to-blue-100 relative flex-shrink-0 flex items-center justify-center">
                      <CampaignIcon className="w-16 h-16 text-purple-300" />
                      {/* Time Badge */}
                      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-white/90 backdrop-blur-sm text-gray-900 px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm flex items-center shadow-lg">
                        <AccessTimeIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        <Countdown date={campaign.endDate} renderer={countdownRenderer} />
                      </div>
                    </div>
                  )}

                  <div className="flex-1 flex flex-col">
                    <div className="p-4 sm:p-6 flex-1">
                      {/* Campaign Header */}
                      <div className="mb-4 sm:mb-6">
                        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                          {campaign.campaignName || campaign.title}
                        </h2>
                        <div className="relative">
                          <p className={`text-sm text-gray-600 text-justify leading-relaxed ${!isExpanded ? 'line-clamp-2' : ''}`}>
                            {campaign.description}
                          </p>
                          {campaign.description && campaign.description.length > 100 && (
                            <button
                              onClick={() => toggleDescription(campaign.serviceCode)}
                              className="inline-flex items-center text-xs text-purple-600 hover:text-purple-700 font-medium mt-1"
                            >
                              {isExpanded ? (
                                <>
                                  Show less <ExpandLessIcon className="w-4 h-4 ml-0.5" />
                                </>
                              ) : (
                                <>
                                  Read more <ExpandMoreIcon className="w-4 h-4 ml-0.5" />
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Progress Section - More prominent */}
                      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-2 mb-2">
                          <div>
                            <p className="text-xl sm:text-2xl font-bold text-gray-900">
                              GHS {formatCurrency(overallRaised)}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-600">
                              raised of GHS {formatCurrency(campaign.fundraisingGoal || 0)} goal
                            </p>
                          </div>
                          <span className="text-base sm:text-lg font-bold text-purple-600 self-start sm:self-auto">{progress.toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 sm:h-3 overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-purple-600 to-blue-600 h-2.5 sm:h-3 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>
                      </div>

                      {/* Your Performance Stats */}
                      <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                        <div className="bg-gray-50 rounded-lg p-2.5 sm:p-3 text-center">
                          <p className="text-xs sm:text-sm text-gray-600 mb-1">Your Contribution</p>
                          <p className="text-lg sm:text-xl font-bold text-gray-900">GHS {formatCurrency(totalRaised)}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-2.5 sm:p-3 text-center">
                          <p className="text-xs sm:text-sm text-gray-600 mb-1">Your Donors</p>
                          <p className="text-lg sm:text-xl font-bold text-gray-900">{donorCount}</p>
                        </div>
                      </div>

                      {/* Share Methods - Redesigned */}
                      <div className="space-y-2.5 sm:space-y-3">
                        <h3 className="text-xs sm:text-sm font-semibold text-gray-900 uppercase tracking-wider mb-2 sm:mb-3">
                          Share Methods
                        </h3>
                        
                        {/* Mobile Money USSD */}
                        <div className="group relative bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 sm:p-4 hover:shadow-md transition-all cursor-pointer active:scale-[0.98]"
                             onClick={() => handleCopy(
                               `*227*${campaign.serviceCode}*${userData?.referalCode}#`,
                               'USSD Code',
                               campaign.serviceCode
                             )}>
                          <div className="flex items-start space-x-2 sm:space-x-3">
                            <div className="bg-green-100 p-1.5 sm:p-2 rounded-lg flex-shrink-0">
                              <PhoneAndroidIcon className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 text-sm sm:text-base mb-0.5 sm:mb-1">Mobile Money (USSD)</p>
                              <code className="text-xs sm:text-sm font-mono text-gray-700 bg-white/70 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded inline-block break-all">
                                *227*{campaign.serviceCode}*{userData?.referalCode}#
                              </code>
                              <p className="text-[10px] sm:text-xs text-gray-600 mt-1">Tap to copy • Works on all networks</p>
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                              {copiedStates[`USSD Code-${campaign.serviceCode}`] ? (
                                <CheckIcon className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                              ) : (
                                <ContentCopyIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Online Link */}
                        <div className="group relative bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 sm:p-4 hover:shadow-md transition-all cursor-pointer active:scale-[0.98]"
                             onClick={() => handleCopy(
                               `https://collections.kowri.app/main/${campaign.serviceCode}/${userData?.referalCode}`,
                               'Online Link',
                               campaign.serviceCode
                             )}>
                          <div className="flex items-start space-x-2 sm:space-x-3">
                            <div className="bg-blue-100 p-1.5 sm:p-2 rounded-lg flex-shrink-0">
                              <LanguageIcon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 text-sm sm:text-base mb-0.5 sm:mb-1">Online Donations</p>
                              <p className="text-xs sm:text-sm text-gray-700 break-all">
                                collections.kowri.app/main/{campaign.serviceCode}/{userData?.referalCode}
                              </p>
                              <p className="text-[10px] sm:text-xs text-gray-600 mt-1">Tap to copy • Cards & Mobile Money</p>
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                              {copiedStates[`Online Link-${campaign.serviceCode}`] ? (
                                <CheckIcon className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                              ) : (
                                <ContentCopyIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Referral Code */}
                        <div className="group relative bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3 sm:p-4 hover:shadow-md transition-all cursor-pointer active:scale-[0.98]"
                             onClick={() => handleCopy(
                               userData?.referalCode,
                               'Referral Code',
                               campaign.serviceCode
                             )}>
                          <div className="flex items-start space-x-2 sm:space-x-3">
                            <div className="bg-purple-100 p-1.5 sm:p-2 rounded-lg flex-shrink-0">
                              <FingerprintIcon className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 text-sm sm:text-base mb-0.5 sm:mb-1">Your Referral Code</p>
                              <p className="text-lg sm:text-xl font-bold text-purple-600">
                                {userData?.referalCode}
                              </p>
                              <p className="text-[10px] sm:text-xs text-gray-600 mt-1">Tap to copy • For manual entries</p>
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                              {copiedStates[`Referral Code-${campaign.serviceCode}`] ? (
                                <CheckIcon className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                              ) : (
                                <ContentCopyIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Primary Share Button - Hidden on mobile */}
                      <button
                        onClick={() => handleShare(campaign)}
                        className="hidden sm:flex w-full mt-4 sm:mt-6 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg font-medium sm:font-semibold transition-all transform hover:scale-[1.02] active:scale-[0.98] items-center justify-center space-x-2 shadow-md text-sm sm:text-base"
                      >
                        <ShareIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span>Share Campaign</span>
                      </button>
                    </div>

                    {/* Mobile Sticky Share Button */}
                    <div className="sm:hidden sticky bottom-0 p-4 bg-gradient-to-t from-white via-white to-white/95 border-t border-gray-100">
                      <button
                        onClick={() => handleShare(campaign)}
                        className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 px-4 rounded-lg font-semibold transition-all transform active:scale-[0.98] flex items-center justify-center space-x-2 shadow-lg"
                      >
                        <ShareIcon className="w-5 h-5" />
                        <span>Share Campaign</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AccessTimeIcon className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Campaigns</h3>
            <p className="text-gray-600">
              There are no active campaigns at the moment. Check back later or contact your administrator.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RaiseFunds; 