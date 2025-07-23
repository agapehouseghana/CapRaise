import React, { useState, useEffect } from "react";
import { CircularProgress, Chip, IconButton, Menu, MenuItem } from "@mui/material";
import { db } from "../firebase/firebase";
import { collection, query, getDocs, where, doc, deleteDoc } from "firebase/firestore";
import AddCampaign from "../components/AddCampaign";
import EditCampaign from "../components/EditCampaign";
import Campaign from "../components/Campaigns";
import { useStateContext } from "../contexts/ContextProvider";
import CampaignIcon from '@mui/icons-material/Campaign';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import TableViewIcon from '@mui/icons-material/TableChart';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import { toast } from "react-toastify";

const Campaigns = () => {
  const [refreshCampaigns, setRefreshCampaigns] = useState(false);
  const { adminData, userData, externalData } = useStateContext();
  const [campaigns, setCampaigns] = useState([]);
  const adminId = adminData?.adminId || userData?.adminId;
  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [showTableView, setShowTableView] = useState(true);
  const [editingCampaign, setEditingCampaign] = useState(null);

  useEffect(() => {
    const fetchCampaigns = async () => {
      if (!adminId) {
        console.log("Waiting for admin ID...");
        return;
      }

      setLoading(true);
      try {
        const campaignsCollectionRef = collection(db, "campaigns");
        const q = query(campaignsCollectionRef, where("adminId", "==", adminId));
        const querySnapshot = await getDocs(q);
        const campaignList = [];
        
        querySnapshot?.forEach((doc) => {
          const campaignsData = doc?.data();
          campaignList?.push({ ...campaignsData, id: doc.id });
        });
        setCampaigns(campaignList);
      } catch (error) {
        console.error("Error fetching campaigns:", error);
      }
      setLoading(false);
    };

    fetchCampaigns();
  }, [adminId, refreshCampaigns]);

  const handleMenuOpen = (event, campaign) => {
    setAnchorEl(event.currentTarget);
    setSelectedCampaign(campaign);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCampaign(null);
  };

  const handleDelete = async () => {
    if (!selectedCampaign) return;
    
    if (window.confirm(`Are you sure you want to delete "${selectedCampaign.campaignName || selectedCampaign.title}"?`)) {
      try {
        await deleteDoc(doc(db, "campaigns", selectedCampaign.id));
        toast.success("Campaign deleted successfully");
        setRefreshCampaigns(!refreshCampaigns);
      } catch (error) {
        console.error("Error deleting campaign:", error);
        toast.error("Failed to delete campaign");
      }
    }
    handleMenuClose();
  };

  const handleEdit = () => {
    setEditingCampaign(selectedCampaign);
    handleMenuClose();
  };

  const handlePreview = () => {
    // For now, just show in card view
    setShowTableView(false);
    handleMenuClose();
    toast.info("Showing campaign in card view");
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success("Service code copied to clipboard!");
  };

  const getCampaignStatus = (campaign) => {
    const now = new Date();
    const endDate = campaign.endDate ? new Date(campaign.endDate) : null;
    
    if (!endDate) return { label: "Ongoing", color: "info" };
    if (endDate < now) return { label: "Ended", color: "error" };
    
    // Calculate days remaining
    const daysLeft = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
    if (daysLeft <= 7) return { label: "Ending Soon", color: "warning" };
    
    return { label: "Active", color: "success" };
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No end date";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const formatCurrency = (amount) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1).replace(/\.0$/, '')}K`;
    }
    return amount.toString();
  };

  const getTotalRaised = (campaign) => {
    const raised = externalData?.filter(
      (data) => data.serviceCode === campaign.serviceCode
    ).reduce((total, item) => total + item.amount, 0) || 0;
    return raised + (campaign.currentProgress || 0);
  };

  const getDonorCount = (campaign) => {
    return externalData?.filter(
      (data) => data.serviceCode === campaign.serviceCode
    ).length || 0;
  };

  if (loading) {
    return (
      <div className="w-full h-[calc(100vh-200px)] flex justify-center items-center">
        <div className="text-center">
          <CircularProgress style={{ color: "#7c3aed" }} size={50} />
          <p className="mt-4 text-gray-600">Loading campaigns...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CampaignIcon className="w-8 h-8 text-purple-600" />
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Campaign Management</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Create and manage your fundraising campaigns
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <IconButton
                  size="small"
                  onClick={() => setShowTableView(true)}
                  className={showTableView ? "bg-white shadow-sm" : ""}
                >
                  <TableViewIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => setShowTableView(false)}
                  className={!showTableView ? "bg-white shadow-sm" : ""}
                >
                  <ViewModuleIcon fontSize="small" />
                </IconButton>
              </div>
              <AddCampaign setRefreshCampaigns={setRefreshCampaigns} />
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {campaigns.length > 0 ? (
          showTableView ? (
            /* Table View */
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Campaign
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        End Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Progress / Raised
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Donors
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {campaigns.map((campaign) => {
                      const status = getCampaignStatus(campaign);
                      const raised = getTotalRaised(campaign);
                      const progress = Math.min(Math.round((raised / campaign.fundraisingGoal) * 100), 100);
                      const donors = getDonorCount(campaign);

                      return (
                        <tr key={campaign.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                {campaign.imagesURL?.[0] ? (
                                  <img
                                    className="h-10 w-10 rounded-full object-cover"
                                    src={campaign.imagesURL[0]}
                                    alt=""
                                  />
                                ) : (
                                  <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                                    <CampaignIcon className="h-6 w-6 text-purple-600" />
                                  </div>
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm font-medium text-gray-900">
                                    {campaign.campaignName || campaign.title}
                                  </span>
                                  <code className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                                    {campaign.serviceCode}
                                  </code>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleCopyCode(campaign.serviceCode)}
                                    sx={{ padding: 0.5 }}
                                  >
                                    <ContentCopyIcon sx={{ fontSize: 14 }} />
                                  </IconButton>
                                </div>
                                <div className="text-sm text-gray-500">
                                  {campaign.description?.substring(0, 50)}...
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm text-gray-900">
                                {formatDate(campaign.endDate)}
                              </div>
                              <Chip
                                label={status.label}
                                color={status.color}
                                size="small"
                                className="mt-1"
                              />
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="flex items-center mb-1">
                                <div className="flex-1">
                                  <div className="w-40 bg-gray-200 rounded-full h-2">
                                    <div
                                      className="bg-purple-600 h-2 rounded-full"
                                      style={{ width: `${progress}%` }}
                                    />
                                  </div>
                                </div>
                                <span className="ml-2 text-xs text-gray-600 font-medium">{progress}%</span>
                              </div>
                              <div className="text-sm text-gray-900 font-medium">
                                GHS {formatCurrency(raised)} of {formatCurrency(campaign.fundraisingGoal)}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {donors}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                            <IconButton
                              size="small"
                              onClick={(e) => handleMenuOpen(e, campaign)}
                            >
                              <MoreVertIcon />
                            </IconButton>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Card View - Using existing Campaign component */
            <Campaign adminData={adminData} campaigns={campaigns} />
          )
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <CampaignIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No campaigns yet</h3>
            <p className="text-gray-600 mb-6">Get started by creating your first fundraising campaign</p>
            <div className="flex justify-center">
              <AddCampaign setRefreshCampaigns={setRefreshCampaigns} />
            </div>
          </div>
        )}
      </div>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handlePreview}>
          <VisibilityIcon fontSize="small" className="mr-2" />
          Preview
        </MenuItem>
        <MenuItem onClick={handleEdit}>
          <EditIcon fontSize="small" className="mr-2" />
          Edit
        </MenuItem>
        <MenuItem onClick={handleDelete} className="text-red-600">
          <DeleteIcon fontSize="small" className="mr-2" />
          Delete
        </MenuItem>
      </Menu>

      {/* Edit Campaign Modal */}
      {editingCampaign && (
        <EditCampaign
          open={Boolean(editingCampaign)}
          campaign={editingCampaign}
          onClose={() => setEditingCampaign(null)}
          onUpdate={() => {
            setRefreshCampaigns(!refreshCampaigns);
            setEditingCampaign(null);
          }}
        />
      )}
    </div>
  );
};

export default Campaigns;
