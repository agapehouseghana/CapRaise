import React, { useEffect, useState } from "react";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { useStateContext } from "../contexts/ContextProvider";
import Countdown from "react-countdown";
import ShareIcon from '@mui/icons-material/Share';
import TimerIcon from '@mui/icons-material/Timer';
import FlagIcon from '@mui/icons-material/Flag';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PeopleIcon from '@mui/icons-material/People';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { toast } from "react-toastify";

const Campaign = ({ adminData, campaigns }) => {
  const { externalData } = useStateContext();
  const [copiedStates, setCopiedStates] = useState({});
  const [expandedCard, setExpandedCard] = useState(null);
  const [foundData, setFoundData] = useState([]);

  const getTotalRaisedForServiceCode = (serviceCode) => {
    const filteredData = foundData?.filter(
      (data) => data?.serviceCode === serviceCode
    );
    const totalAmount = filteredData?.reduce(
      (total, item) => total + item?.amount,
      0
    );
    return {
      totalAmount,
      count: filteredData?.length,
    };
  };

  const getTotalRaisedForServiceAndReferral = (serviceCode, referalCode) => {
    const filteredData = foundData?.filter(
      (data) =>
        data?.referalCode === referalCode && data?.serviceCode === serviceCode
    );
    const totalAmount = filteredData?.reduce(
      (total, item) => total + item?.amount,
      0
    );
    return {
      totalAmount,
      count: filteredData?.length,
    };
  };

  const specificReferalCode = adminData?.referalCode;

  useEffect(() => {
    if (!Array.isArray(externalData)) {
      console.log("External data is not an array:", externalData);
      return;
    }
  
    const newData = campaigns?.flatMap((item) =>
      externalData?.filter((data) => data?.serviceCode === item?.serviceCode)
    );
    setFoundData(newData);
  }, [externalData, campaigns]);

  const calculateTimeLeft = (endTime) => {
    const difference = +new Date(endTime) - +new Date();
    return difference > 0 ? difference : 0;
  };

  const calculatePercentage = (raised, goal) => {
    return Math.min(Math.round((raised / goal) * 100), 100);
  };

  const handleExpand = (index) => {
    setExpandedCard(expandedCard === index ? null : index);
  };

  const handleCopy = async (text, type, campaignId) => {
    try {
      await navigator?.clipboard?.writeText(text);
      setCopiedStates({ [`${type}_${campaignId}`]: true });
      toast.success("Copied to clipboard!");
      setTimeout(() => {
        setCopiedStates({});
      }, 2000);
    } catch (error) {
      console.error("Unable to copy:", error);
      toast.error("Failed to copy");
    }
  };

  const handleShare = async (textToShare, campaignName) => {
    try {
      const shareData = {
        title: "Support Our Campaign",
        text: `Hi! I'm fundraising for "${campaignName}". Your support would mean so much to us. Every contribution helps us reach our goal. Thank you for considering! 🙏`,
        url: textToShare,
      };
      await navigator?.share(shareData);
    } catch (error) {
      console.log("Sharing failed:", error);
      // Fallback to copy
      handleCopy(textToShare, 'share', campaignName);
    }
  };

  return (
    <div className="grid lg:grid-cols-2 grid-cols-1 gap-6">
      {campaigns.map((item, index) => {
        const { totalAmount } = getTotalRaisedForServiceCode(item.serviceCode);
        const { totalAmount: totalRaised, count: donorCount } =
          getTotalRaisedForServiceAndReferral(
            item.serviceCode,
            specificReferalCode
          );
        const timeLeft = calculateTimeLeft(item.endDate);
        const totalRaisedAmount = totalAmount + (item.currentProgress || 0);
        const raisedPercentage = calculatePercentage(
          totalRaisedAmount,
          item?.fundraisingGoal
        );

        return (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            {/* Campaign Images */}
            {Array.isArray(item?.imagesURL) && item?.imagesURL?.length > 0 && (
              <div className="h-64 relative">
                <Carousel 
                  showThumbs={false} 
                  showStatus={false}
                  infiniteLoop
                  autoPlay
                  interval={5000}
                  className="h-full"
                >
                  {item.imagesURL.map((url, i) => (
                    <div key={i} className="h-64">
                      <img
                        src={url}
                        alt={`${item.campaignName}_${i}`}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  ))}
                </Carousel>
                {/* Time badge */}
                <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm flex items-center space-x-1">
                  <TimerIcon className="w-4 h-4" />
                  <Countdown
                    date={Date.now() + timeLeft}
                    renderer={({ days }) => <span>{days} days left</span>}
                  />
                </div>
              </div>
            )}

            <div className="p-6">
              {/* Campaign Header */}
              <div className="mb-4">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {item.campaignName || item.title}
                </h3>
                <p className="text-gray-600 text-sm line-clamp-2">
                  {item.description}
                </p>
              </div>

              {/* Progress Section */}
              <div className="mb-6">
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <p className="text-2xl font-bold text-purple-600">
                      GHS {totalRaisedAmount.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">
                      raised of GHS {item.fundraisingGoal.toLocaleString()} goal
                    </p>
                  </div>
                  <span className="text-sm font-medium text-purple-600">{raisedPercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-600 to-purple-700 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${raisedPercentage}%` }}
                  />
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <FlagIcon className="w-5 h-5 text-gray-400 mr-1" />
                    <p className="text-lg font-semibold text-gray-900">{raisedPercentage}%</p>
                  </div>
                  <p className="text-xs text-gray-500">Funded</p>
                </div>
                <div className="text-center border-x border-gray-200">
                  <div className="flex items-center justify-center mb-1">
                    <PeopleIcon className="w-5 h-5 text-gray-400 mr-1" />
                    <p className="text-lg font-semibold text-gray-900">{getTotalRaisedForServiceCode(item.serviceCode).count}</p>
                  </div>
                  <p className="text-xs text-gray-500">Donors</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <TimerIcon className="w-5 h-5 text-gray-400 mr-1" />
                    <Countdown
                      date={Date.now() + timeLeft}
                      renderer={({ days }) => (
                        <p className="text-lg font-semibold text-gray-900">{days}</p>
                      )}
                    />
                  </div>
                  <p className="text-xs text-gray-500">Days left</p>
                </div>
              </div>

              {/* Share Section */}
              <div className="space-y-3 mb-4">
                {/* USSD Code */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs font-medium text-gray-600 mb-1">USSD Code (Mobile Money)</p>
                  <div className="flex items-center justify-between">
                    <code className="text-sm font-mono text-gray-900">
                      *227*{item.serviceCode}*{adminData.referalCode}#
                    </code>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleShare(
                          `*227*${item.serviceCode}*${adminData.referalCode}#`,
                          item.campaignName
                        )}
                        className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                      >
                        <ShareIcon className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => handleCopy(
                          `*227*${item.serviceCode}*${adminData.referalCode}#`,
                          'ussd',
                          index
                        )}
                        className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                      >
                        {copiedStates[`ussd_${index}`] ? (
                          <CheckIcon className="w-4 h-4 text-green-600" />
                        ) : (
                          <ContentCopyIcon className="w-4 h-4 text-gray-600" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Online Payment Link */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs font-medium text-gray-600 mb-1">Online Payment Link</p>
                  <div className="flex items-center justify-between">
                    <code className="text-sm font-mono text-gray-900 truncate max-w-[60%]">
                      collections.kowri.app/main/{item.serviceCode}/{adminData.referalCode}
                    </code>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleShare(
                          `https://collections.kowri.app/main/${item.serviceCode}/${adminData.referalCode}`,
                          item.campaignName
                        )}
                        className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                      >
                        <ShareIcon className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => handleCopy(
                          `https://collections.kowri.app/main/${item.serviceCode}/${adminData.referalCode}`,
                          'link',
                          index
                        )}
                        className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                      >
                        {copiedStates[`link_${index}`] ? (
                          <CheckIcon className="w-4 h-4 text-green-600" />
                        ) : (
                          <ContentCopyIcon className="w-4 h-4 text-gray-600" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Your Stats (Expandable) */}
              <div className="border-t pt-4">
                <button
                  onClick={() => handleExpand(index)}
                  className="w-full flex items-center justify-between text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors"
                >
                  <span className="flex items-center">
                    <TrendingUpIcon className="w-4 h-4 mr-1" />
                    Your Performance
                  </span>
                  <span>{expandedCard === index ? 'Hide' : 'Show'}</span>
                </button>
                
                {expandedCard === index && (
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="bg-purple-50 rounded-lg p-3 text-center">
                      <AttachMoneyIcon className="w-6 h-6 text-purple-600 mx-auto mb-1" />
                      <p className="text-xl font-bold text-purple-900">
                        GHS {totalRaised.toLocaleString()}
                      </p>
                      <p className="text-xs text-purple-700">You've raised</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3 text-center">
                      <PeopleIcon className="w-6 h-6 text-purple-600 mx-auto mb-1" />
                      <p className="text-xl font-bold text-purple-900">{donorCount}</p>
                      <p className="text-xs text-purple-700">Your donors</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Campaign;
