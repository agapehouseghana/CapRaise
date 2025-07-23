import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";
import { useStateContext } from "../contexts/ContextProvider";
import { Tab, Tabs, Box } from "@mui/material";
import ShowChartIcon from '@mui/icons-material/ShowChart';
import PieChartIcon from '@mui/icons-material/PieChart';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import GroupsIcon from '@mui/icons-material/Groups';

const MemberStatsBarChart = ({ usersLinkedToAdmin, campaigns }) => {
  const { externalData } = useStateContext();
  const [selectedTab, setSelectedTab] = useState(0);
  
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

  const formatCurrency = (value) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  };

  // Prepare data for charts
  const topFundraisers = usersLinkedToAdmin
    .map((user) => ({
      name: user.fullName?.split(' ')[0] || 'User',
      raised: calculateTotalRaisedForUser(user),
      donors: calculateDonersCount(user),
    }))
    .sort((a, b) => b.raised - a.raised)
    .slice(0, 10);

  // Campaign performance data
  const campaignData = campaigns.map((campaign) => {
    const raised = externalData?.filter(
      (data) => data.serviceCode === campaign.serviceCode
    ).reduce((total, item) => total + item.amount, 0) || 0;
    
    return {
      name: campaign.title || 'Unnamed Campaign',
      value: raised,
      target: campaign.fundraisingGoal || 0,
      percentage: campaign.fundraisingGoal ? (raised / campaign.fundraisingGoal) * 100 : 0,
    };
  }).filter(item => item.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  // Time series data (mock for now - you'd need timestamps in real data)
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      amount: Math.floor(Math.random() * 5000) + 1000,
      donors: Math.floor(Math.random() * 20) + 5,
    };
  });

  const COLORS = ['#7c3aed', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe'];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-medium text-gray-900">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.name.includes('GHS') || entry.name === 'raised' || entry.name === 'amount' 
                ? `GHS ${formatCurrency(entry.value)}` 
                : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  if (!externalData || externalData.length === 0) {
    return (
      <div className="text-center py-12">
        <ShowChartIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No data available</h3>
        <p className="text-sm text-gray-500">
          Analytics will appear here once fundraising activity begins
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Total Raised</p>
              <p className="text-2xl font-bold text-purple-900">
                GHS {formatCurrency(externalData.reduce((sum, item) => sum + item.amount, 0))}
              </p>
            </div>
            <TrendingUpIcon className="w-8 h-8 text-purple-400" />
          </div>
        </div>
        
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Donors</p>
              <p className="text-2xl font-bold text-blue-900">
                {formatCurrency(externalData.length)}
              </p>
            </div>
            <GroupsIcon className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Avg. Donation</p>
              <p className="text-2xl font-bold text-green-900">
                GHS {formatCurrency(Math.round(externalData.reduce((sum, item) => sum + item.amount, 0) / externalData.length))}
              </p>
            </div>
            <ShowChartIcon className="w-8 h-8 text-green-400" />
          </div>
        </div>
        
        <div className="bg-orange-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Active Campaigns</p>
              <p className="text-2xl font-bold text-orange-900">
                {campaigns.filter(c => new Date(c.endDate) > new Date()).length}
              </p>
            </div>
            <PieChartIcon className="w-8 h-8 text-orange-400" />
          </div>
        </div>
      </div>

      {/* Tabs for different views */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={selectedTab} onChange={handleTabChange}>
          <Tab label="Performance Trends" />
          <Tab label="Top Fundraisers" />
          <Tab label="Campaign Breakdown" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      <Box className="mt-6">
        {selectedTab === 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Daily Donations (Last 30 Days)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={last30Days}>
                  <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" fontSize={12} />
                  <YAxis fontSize={12} tickFormatter={(value) => `${formatCurrency(value)}`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#7c3aed" 
                    fillOpacity={1} 
                    fill="url(#colorAmount)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Donor Activity Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={last30Days}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="donors" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    dot={{ fill: '#8b5cf6', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {selectedTab === 1 && (
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Top 10 Fundraisers by Amount Raised</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={topFundraisers} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tickFormatter={(value) => `GHS ${formatCurrency(value)}`} fontSize={12} />
                <YAxis dataKey="name" type="category" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="raised" fill="#7c3aed" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {selectedTab === 2 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Campaign Performance</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={campaignData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name}: ${percentage.toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {campaignData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Campaign Goals Progress</h3>
              <div className="space-y-4">
                {campaignData.map((campaign, index) => (
                  <div key={index}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{campaign.name}</span>
                      <span className="text-sm text-gray-500">
                        {campaign.percentage.toFixed(0)}% of GHS {formatCurrency(campaign.target)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(campaign.percentage, 100)}%`,
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Box>
    </div>
  );
};

export default MemberStatsBarChart;
