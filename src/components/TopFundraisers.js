import { Divider } from "@mui/material";
import React from "react";
import { useStateContext } from "../contexts/ContextProvider";

const TopFundraisers = ({ usersLinkedToAdmin, campaigns }) => {
  const { externalData } = useStateContext();
  const findDonersCount = (referralCode, serviceCode) => {
    const filteredData = externalData?.filter(
      (data) =>
        data.referralCode === referralCode && data.serviceCode === serviceCode
    );
    return filteredData ? filteredData.length : 0;
  };

  const calculateDonersCount = (user) => {
    let totalDonersCount = 0;

    if (user && user.referralCode && Array.isArray(campaigns)) {
      campaigns.forEach((campaign) => {
        const currentServiceCode = campaign.serviceCode;
        const donersCountForCampaign = findDonersCount(
          user.referralCode,
          currentServiceCode
        );
        totalDonersCount += donersCountForCampaign;
      });
    }

    return totalDonersCount;
  };

  const getTotalRaisedForServiceCode = (referralCode, serviceCode) => {
    const filteredData = externalData?.filter(
      (data) =>
        data.referralCode === referralCode && data.serviceCode === serviceCode
    );
    return filteredData.reduce((total, item) => total + item.amount, 0);
  };

  const calculateTotalRaisedForUser = (user) => {
    let totalRaisedAmount = 0;

    if (user && user.referralCode && Array.isArray(campaigns)) {
      campaigns.forEach((campaign) => {
        const currentServiceCode = campaign.serviceCode;
        const raisedAmountForCampaign = getTotalRaisedForServiceCode(
          user.referralCode,
          currentServiceCode
        );
        totalRaisedAmount += raisedAmountForCampaign;
      });
    }

    return totalRaisedAmount;
  };

  return (
    <div className="grid lg:grid-cols-4 sm:grid-cols-2 gap-5 sm:gap-10">
      {usersLinkedToAdmin.map((item, index) => {
        const donersCount = calculateDonersCount(item);
        const totalRaisedForUser = calculateTotalRaisedForUser(item);
        return (
          <div key={index} className="flex flex-col border bg-white">
            <div className="text-2xl font-semibold p-4">
              <p className="text-2xl font-semibold">
                <small className="mr-1">GHS</small>
                {totalRaisedForUser}
              </p>
            </div>
            <Divider />
            <div className="p-4">
              <div className="flex justify-between">
                <p className="text-lg font-medium">{item.fullName}</p>
                <p className="text-lg font-medium text-slate-500">
                  {donersCount} <small>doners</small>
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TopFundraisers;
