import React from "react";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import PeopleOutlineOutlinedIcon from "@mui/icons-material/PeopleOutlineOutlined";
import { useStateContext } from "../contexts/ContextProvider";

const Statistics = ({ campaignCount, fundraiserCount, campaigns }) => {
  const { userData, externalData } = useStateContext();

  const findDonersCount = (referralCode) => {
    const found = externalData?.filter(
      (data) => data.referralCode === referralCode
    );
    return found ? found.length : 0;
  };

  const donersCount =
    userData && userData.referralCode
      ? findDonersCount(userData.referralCode)
      : 0;

  const getTotalRaisedForServiceCode = (referralCode) => {
    const filteredData = externalData?.filter(
      (data) => data.referralCode === referralCode
    );
    return filteredData.reduce((total, item) => total + item.amount, 0);
  };

  const totalRaisedForReferral =
    userData && userData.referralCode
      ? getTotalRaisedForServiceCode(userData.referralCode)
      : 0;

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

  return (
    <div className="grid lg:grid-cols-4 sm:grid-cols-2 gap-5 sm:gap-10">
      <div className="flex flex-row border p-4 items-center bg-white">
        <div className="bg-gray-100 p-2 mr-5">
          <AccountBalanceWalletOutlinedIcon
            fontSize="large"
            className="text-slate-500"
          />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500">Total Raised</p>

          {userData?.role === "admin" ? (
            <p className="text-2xl font-semibold">
              <small className="mr-1">GHS</small>
              {totalRaisedForAllServiceCodes.totalRaised}
            </p>
          ) : (
            <p className="text-2xl font-semibold">
              <small className="mr-1">GHS</small>
              {totalRaisedForReferral?.toLocaleString()}
            </p>
          )}
        </div>
      </div>
      {userData?.role === "admin" ? (
        <div className="flex flex-row border p-4 items-center bg-white">
          <div className="bg-gray-100 p-2 mr-5">
            <PeopleOutlineOutlinedIcon
              fontSize="large"
              className="text-slate-500"
            />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">
              Total Fundraisers
            </p>
            <p className="text-2xl font-semibold">
              <small className="mr-1"></small>
              {fundraiserCount}
            </p>
          </div>
        </div>
      ) : (
        ""
      )}
      <div className="flex flex-row border p-4 items-center bg-white">
        <div className="bg-gray-100 p-2 mr-5">
          <GroupsOutlinedIcon fontSize="large" className="text-slate-500" />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500">Total Donors</p>
          {userData?.role === "admin" ? (
            <p className="text-2xl font-semibold">
              <small className="mr-1"></small>
              {totalRaisedForAllServiceCodes.totalCount}
            </p>
          ) : (
            <p className="text-2xl font-semibold">
              <small className="mr-1"></small>
              {donersCount?.toLocaleString()}
            </p>
          )}
        </div>
      </div>
      <div className="flex flex-row border p-4 items-center bg-white">
        <div className="bg-gray-100 p-2 mr-5">
          <FavoriteBorderOutlinedIcon
            fontSize="large"
            className="text-slate-500"
          />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500">Campaigns</p>
          <p className="text-2xl font-semibold">
            <small className="mr-1"></small>
            {campaignCount}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
