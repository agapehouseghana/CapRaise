import React, { useState } from "react";
import { useStateContext } from "../contexts/ContextProvider";
import { Avatar, IconButton } from "@mui/material";
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useNavigate } from 'react-router-dom';

const TopFundraisers = ({ usersLinkedToAdmin, campaigns }) => {
  const { externalData } = useStateContext();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

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

  const formatCurrency = (amount) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1).replace(/\.0$/, '')}K`;
    }
    return amount.toString();
  };

  // Sort users by total raised amount
  const sortedUsers = [...usersLinkedToAdmin].sort((a, b) => {
    const totalA = calculateTotalRaisedForUser(a);
    const totalB = calculateTotalRaisedForUser(b);
    return totalB - totalA;
  });

  // Get top 20 performers
  const topPerformers = sortedUsers.slice(0, 20);

  // Calculate pagination
  const totalPages = Math.ceil(topPerformers.length / itemsPerPage);
  const isLastPage = currentPage === totalPages;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = isLastPage && topPerformers.length % itemsPerPage !== 0 
    ? startIndex + (topPerformers.length % itemsPerPage) 
    : startIndex + itemsPerPage;
  const currentPerformers = topPerformers.slice(startIndex, endIndex);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  if (!usersLinkedToAdmin || usersLinkedToAdmin.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-4">
          <TrendingUpIcon className="w-12 h-12 text-gray-300" />
        </div>
        <h3 className="text-lg font-medium text-gray-700 mb-2">No fundraisers yet</h3>
        <p className="text-sm text-gray-400">
          Start by inviting fundraisers to join your campaigns
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Grid of contact cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {currentPerformers.map((user, index) => {
          const donersCount = calculateDonersCount(user);
          const totalRaised = calculateTotalRaisedForUser(user);
          const globalIndex = startIndex + index + 1;

          return (
            <div
              key={user.id || index}
              className="relative group bg-gray-50 rounded-lg border border-gray-200 p-6 hover:shadow-md transition-all duration-200"
            >
              {/* Rank badge */}
              {globalIndex <= 3 && (
                <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                  globalIndex === 1 ? 'bg-gradient-to-br from-yellow-400 to-yellow-500' : 
                  globalIndex === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-400' : 
                  'bg-gradient-to-br from-orange-400 to-orange-500'
                }`}>
                  {globalIndex}
                </div>
              )}

              <div className="flex items-center space-x-4 mb-4">
                <Avatar className="h-14 w-14" sx={{ bgcolor: '#f3f4f6' }}>
                  <span className="text-gray-600 font-medium text-lg">
                    {user.fullName?.charAt(0) || 'F'}
                  </span>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-700 truncate">
                    {user.fullName}
                  </h3>
                  <p className="text-xs text-gray-400 truncate">
                    {user.email}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-2xl font-semibold text-gray-800">
                    GHS {formatCurrency(totalRaised)}
                  </p>
                  <p className="text-xs text-gray-400">Total raised</p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{donersCount}</p>
                    <p className="text-xs text-gray-400">Donors</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-600">
                      GHS {donersCount > 0 ? formatCurrency(Math.round(totalRaised / donersCount)) : '0'}
                    </p>
                    <p className="text-xs text-gray-400">Avg. donation</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 space-x-2">
                  <button className="flex-1 inline-flex items-center justify-center px-3 py-1.5 border border-gray-200 text-xs font-medium rounded-md text-gray-600 bg-white hover:bg-gray-50 transition-colors">
                    <EmailIcon className="w-3 h-3 mr-1 text-gray-400" />
                    Email
                  </button>
                  <button className="flex-1 inline-flex items-center justify-center px-3 py-1.5 border border-gray-200 text-xs font-medium rounded-md text-gray-600 bg-white hover:bg-gray-50 transition-colors">
                    <PhoneIcon className="w-3 h-3 mr-1 text-gray-400" />
                    Call
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {/* View All Card - Only on last page */}
        {isLastPage && (
          <div
            onClick={() => navigate('/Fundraisers')}
            className="relative group bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200 border-dashed p-6 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col items-center justify-center text-center"
          >
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <ArrowForwardIcon className="w-8 h-8 text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              View All Fundraisers
            </h3>
            <p className="text-sm text-gray-500">
              {usersLinkedToAdmin.length} total fundraisers
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center space-x-2">
          <IconButton
            size="small"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            sx={{ color: '#6b7280' }}
          >
            <ChevronLeftIcon />
          </IconButton>
          
          <div className="flex items-center space-x-1">
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index}
                onClick={() => handlePageChange(index + 1)}
                className={`w-8 h-8 rounded-full text-sm font-medium transition-all ${
                  currentPage === index + 1
                    ? 'bg-purple-500 text-white'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          <IconButton
            size="small"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            sx={{ color: '#6b7280' }}
          >
            <ChevronRightIcon />
          </IconButton>
        </div>
      )}
    </div>
  );
};

export default TopFundraisers;
