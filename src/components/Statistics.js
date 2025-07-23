import React from "react";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import PeopleOutlineOutlinedIcon from "@mui/icons-material/PeopleOutlineOutlined";
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { useStateContext } from "../contexts/ContextProvider";

const Statistics = ({ campaignCount, fundraiserCount, campaigns, analytics }) => {
  const { userData, externalData } = useStateContext();

  const findDonersCount = (referalCode, serviceCode) => {
    const filteredData = externalData?.filter(
      (data) =>
        data.referalCode === referalCode && data.serviceCode === serviceCode
    );
    return filteredData ? filteredData.length : 0;
  };

  let totalDonersCount = 0;

  if (userData && userData.referalCode && Array.isArray(campaigns)) {
    campaigns.forEach((campaign) => {
      const currentServiceCode = campaign.serviceCode;
      const donersCountForCampaign =
        userData && userData.referalCode
          ? findDonersCount(userData.referalCode, currentServiceCode)
          : 0;
      totalDonersCount += donersCountForCampaign;
    });
  }
  // Use analytics data if available, fallback to calculated values
  const donersCount = analytics?.totalDonors || totalDonersCount;

  const getTotalRaisedForServiceCode = (referalCode, serviceCode) => {
    const filteredData = externalData?.filter(
      (data) =>
        data.referalCode === referalCode && data.serviceCode === serviceCode
    );
    return filteredData.reduce((total, item) => total + item.amount, 0);
  };

  let totalRaisedAmount = 0;

  if (userData && userData.referalCode && Array.isArray(campaigns)) {
    campaigns.forEach((campaign) => {
      const currentServiceCode = campaign.serviceCode;
      const raisedAmountForCampaign =
        userData && userData.referalCode
          ? getTotalRaisedForServiceCode(
              userData.referalCode,
              currentServiceCode
            )
          : 0;
      totalRaisedAmount += raisedAmountForCampaign;
    });
  }

  // Use analytics data if available, fallback to calculated values
  const totalRaisedForReferral = analytics?.totalRaised || totalRaisedAmount;

  const getTotalRaisedForAllServiceCodes = () => {
    if (
      !Array.isArray(campaigns) ||
      campaigns.length === 0 ||
      !Array.isArray(externalData) ||
      externalData?.length === 0
    ) {
      return { totalRaised: 0, totalCount: 0 };
    }

    const totalRaised = campaigns.reduce(
      (accumulator, campaign) => {
        const filteredData = externalData?.filter(
          (data) => data.serviceCode === campaign.serviceCode
        );

        const campaignTotal = filteredData.reduce(
          (campaignTotal, item) => campaignTotal + item.amount,
          0
        );

        return {
          totalRaised: accumulator.totalRaised + campaignTotal,
          totalCount: accumulator.totalCount + filteredData.length,
        };
      },
      { totalRaised: 0, totalCount: 0 }
    );

    return totalRaised;
  };

  const totalRaisedForAllServiceCodes = getTotalRaisedForAllServiceCodes();

  // Calculate active campaigns
  const activeCampaigns = campaigns?.filter(campaign => {
    const endDate = campaign.endDate ? new Date(campaign.endDate) : null;
    return !endDate || endDate > new Date();
  }) || [];

  const statsData = [
    {
      title: "Total Raised",
      value: userData?.role === "admin" 
        ? totalRaisedForAllServiceCodes.totalRaised 
        : totalRaisedForReferral,
      formatter: (val) => `GHS ${val.toLocaleString()}`,
      icon: AccountBalanceWalletOutlinedIcon,
      iconBgColor: "bg-purple-100",
      iconColor: "text-purple-600",
      trend: "+12%",
      trendColor: "text-green-600",
      description: "from last month"
    },
    ...(userData?.role === "admin" ? [{
      title: "Total Fundraisers",
      value: fundraiserCount || 0,
      formatter: (val) => val.toString(),
      icon: PeopleOutlineOutlinedIcon,
      iconBgColor: "bg-blue-100",
      iconColor: "text-blue-600",
      trend: "+8",
      trendColor: "text-green-600",
      description: "new this month"
    }] : []),
    {
      title: "Total Donors",
      value: userData?.role === "admin" 
        ? totalRaisedForAllServiceCodes.totalCount 
        : donersCount,
      formatter: (val) => val.toLocaleString(),
      icon: GroupsOutlinedIcon,
      iconBgColor: "bg-green-100",
      iconColor: "text-green-600",
      trend: userData?.role === "admin" ? "+15%" : `${donersCount}`,
      trendColor: "text-green-600",
      description: userData?.role === "admin" ? "growth rate" : "total supporters"
    },
    {
      title: "Active Campaigns",
      value: activeCampaigns.length,
      formatter: (val) => val.toString(),
      icon: FavoriteBorderOutlinedIcon,
      iconBgColor: "bg-orange-100",
      iconColor: "text-orange-600",
      trend: `${campaigns.length - activeCampaigns.length}`,
      trendColor: "text-gray-600",
      description: "completed"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsData.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <div
            key={index}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.iconBgColor} p-3 rounded-lg`}>
                <IconComponent className={`w-6 h-6 ${stat.iconColor}`} />
              </div>
              {stat.trend && (
                <div className="flex items-center space-x-1">
                  {stat.trendColor === "text-green-600" && (
                    <TrendingUpIcon className="w-4 h-4 text-green-600" />
                  )}
                  <span className={`text-sm font-medium ${stat.trendColor}`}>
                    {stat.trend}
                  </span>
                </div>
              )}
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                {stat.title}
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {stat.formatter(stat.value)}
              </p>
              {stat.description && (
                <p className="text-xs text-gray-500 mt-1">
                  {stat.description}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Statistics;
