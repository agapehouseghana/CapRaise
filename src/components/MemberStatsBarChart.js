import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useStateContext } from "../contexts/ContextProvider";

const MemberStatsBarChart = ({ usersLinkedToAdmin, campaigns }) => {
  const { externalData } = useStateContext();
  const findDonersCount = (referalCode, serviceCode) => {
    const filteredData = externalData?.filter(
      (data) =>
        data.referalCode === referalCode && data.serviceCode === serviceCode
    );
    return filteredData ? filteredData.length : 0;
  };

  const calculateDonersCount = (user) => {
    let totalDonersCount = 0;

    if (user && user.referalCode && Array.isArray(campaigns)) {
      campaigns.forEach((campaign) => {
        const currentServiceCode = campaign.serviceCode;
        const donersCountForCampaign = findDonersCount(
          user.referalCode,
          currentServiceCode
        );
        totalDonersCount += donersCountForCampaign;
      });
    }

    return totalDonersCount;
  };

  const getTotalRaisedForServiceCode = (referalCode, serviceCode) => {
    const filteredData = externalData?.filter(
      (data) =>
        data.referalCode === referalCode && data.serviceCode === serviceCode
    );
    return filteredData.reduce((total, item) => total + item.amount, 0);
  };

  const calculateTotalRaisedForUser = (user) => {
    let totalRaisedAmount = 0;

    if (user && user.referalCode && Array.isArray(campaigns)) {
      campaigns.forEach((campaign) => {
        const currentServiceCode = campaign.serviceCode;
        const raisedAmountForCampaign = getTotalRaisedForServiceCode(
          user.referalCode,
          currentServiceCode
        );
        totalRaisedAmount += raisedAmountForCampaign;
      });
    }

    return totalRaisedAmount;
  };
  const donersChartData = usersLinkedToAdmin.map((item, index) => ({
    name: item.fullName,
    doners: calculateDonersCount(item),
    index: index + 1,
  }));

  const totalRaisedChartData = usersLinkedToAdmin.map((item, index) => ({
    name: item.fullName,
    total: calculateTotalRaisedForUser(item),
    index: index + 1,
  }));
  return (
    <div className="grid md:grid-cols-3 gap-10">
      <div className=" border bg-white">
        <h2 className="text-center m-4 text-xl font-semibold text-blue-500">Donors Chart</h2>
        <ResponsiveContainer width="100%" height={400} className="py-10">
          <BarChart
            data={donersChartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="doners" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className=" border bg-white">
        <h2 className="text-center m-4 text-xl font-semibold text-purple-400">Total Raised Chart</h2>
        <ResponsiveContainer width="100%" height={400} className="py-10">
          <BarChart
            data={totalRaisedChartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="total" fill="#a400b4" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MemberStatsBarChart;
