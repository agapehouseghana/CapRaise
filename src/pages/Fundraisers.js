import React, { useEffect, useState } from "react";
import {
  CircularProgress,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Chip,
  Menu,
  MenuItem,
  Avatar,
  Button
} from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import SearchIcon from "@mui/icons-material/Search";
import PeopleIcon from '@mui/icons-material/People';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useStateContext } from "../contexts/ContextProvider";
import { collection, query, where, getDocs, getFirestore } from "firebase/firestore";
import apiService from "../services/api";
import { toast } from "react-toastify";

// Temporary Firestore instance for fallback operations only
const db = getFirestore();

const Fundraisers = () => {
  const { adminData, userData, externalData } = useStateContext();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [usersLinkedToAdmin, setUsersLinkedToAdmin] = useState([]);
  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const adminId = adminData?.adminId || userData?.adminId;

  useEffect(() => {
    const fetchUsersLinkedToAdmin = async () => {
      if (!adminId) {
        console.log("Waiting for admin ID...");
        return;
      }

      setLoading(true);
      try {
        // Try to get users via middleware first
        const response = await apiService.getUsers();
        setUsersLinkedToAdmin(response.users || []);
        console.log('✅ Fundraisers fetched via middleware:', response.users?.length || 0);
      } catch (middlewareError) {
        console.warn('Middleware users fetch failed, falling back to direct Firebase:', middlewareError.message);
        
        // Fallback to direct Firebase call
        try {
          const usersCollectionRef = collection(db, "users");
          const q = query(usersCollectionRef, where("adminId", "==", adminId));
          const querySnapshot = await getDocs(q);
          const users = [];
          
          querySnapshot.forEach((doc) => {
            const userData = doc.data();
            users.push({ ...userData, id: doc.id });
          });
          setUsersLinkedToAdmin(users);
        } catch (error) {
          console.error("Error fetching users linked to admin:", error);
        }
      }
      setLoading(false);
    };

    fetchUsersLinkedToAdmin();
  }, [adminId]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const fundraisers = usersLinkedToAdmin.filter((item) =>
    Object.values(item).some(
      (value) =>
        value &&
        value.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleMenuOpen = (event, fundraiser) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success("Referral code copied to clipboard!");
  };

  const handleAddFundraiser = () => {
    toast.info("Add fundraiser functionality coming soon!");
  };

  const getTotalRaised = (fundraiser) => {
    if (!fundraiser.referalCode || !externalData) return 0;
    
    const raised = externalData.filter(
      (data) => data.referalCode === fundraiser.referalCode
    ).reduce((total, item) => total + item.amount, 0);
    
    return raised;
  };

  const getDonorCount = (fundraiser) => {
    if (!fundraiser.referalCode || !externalData) return 0;
    
    return externalData.filter(
      (data) => data.referalCode === fundraiser.referalCode
    ).length;
  };

  const formatCurrency = (amount) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1).replace(/\.0$/, '')}K`;
    }
    return amount.toString();
  };

  if (loading) {
    return (
      <div className="w-full h-[calc(100vh-200px)] flex justify-center items-center">
        <div className="text-center">
          <CircularProgress style={{ color: "#7c3aed" }} size={50} />
          <p className="mt-4 text-gray-600">Loading fundraisers...</p>
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
              <PeopleIcon className="w-8 h-8 text-purple-600" />
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Fundraisers</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Manage your fundraising team members
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                {fundraisers.length} fundraisers
              </span>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddFundraiser}
                sx={{
                  backgroundColor: '#7c3aed',
                  '&:hover': {
                    backgroundColor: '#6b21a8'
                  }
                }}
              >
                Add Fundraiser
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search fundraisers by name, email, or phone..."
              value={searchQuery}
              onChange={handleSearch}
              className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
            />
            {searchQuery && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <IconButton
                  onClick={() => setSearchQuery("")}
                  size="small"
                >
                  <ClearIcon className="h-5 w-5 text-gray-400" />
                </IconButton>
              </div>
            )}
          </div>
        </div>

        {fundraisers.length > 0 ? (
          <>
            {/* Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow className="bg-gray-50">
                      <TableCell className="font-medium text-xs text-gray-500 uppercase tracking-wider">
                        Fundraiser
                      </TableCell>
                      <TableCell className="font-medium text-xs text-gray-500 uppercase tracking-wider">
                        Contact
                      </TableCell>
                      <TableCell className="font-medium text-xs text-gray-500 uppercase tracking-wider">
                        Referral Code
                      </TableCell>
                      <TableCell className="font-medium text-xs text-gray-500 uppercase tracking-wider">
                        Performance
                      </TableCell>
                      <TableCell className="font-medium text-xs text-gray-500 uppercase tracking-wider">
                        Status
                      </TableCell>
                      <TableCell align="center" className="font-medium text-xs text-gray-500 uppercase tracking-wider">
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {fundraisers
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((fundraiser) => {
                        const raised = getTotalRaised(fundraiser);
                        const donors = getDonorCount(fundraiser);
                        
                        return (
                          <TableRow key={fundraiser.id} hover>
                            <TableCell>
                              <div className="flex items-center">
                                <Avatar className="h-10 w-10 bg-purple-100">
                                  <span className="text-purple-600 font-medium">
                                    {fundraiser.fullName?.charAt(0) || 'F'}
                                  </span>
                                </Avatar>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {fundraiser.fullName}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    Member
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div className="flex items-center text-gray-900">
                                  <EmailIcon className="w-4 h-4 mr-1 text-gray-400" />
                                  {fundraiser.email}
                                </div>
                                <div className="flex items-center text-gray-500 mt-1">
                                  <PhoneIcon className="w-4 h-4 mr-1 text-gray-400" />
                                  {fundraiser.phoneNumber}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                                  {fundraiser.referalCode}
                                </code>
                                <IconButton
                                  size="small"
                                  onClick={() => handleCopyCode(fundraiser.referalCode)}
                                >
                                  <ContentCopyIcon fontSize="small" />
                                </IconButton>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div className="text-gray-900 font-medium">
                                  GHS {formatCurrency(raised)}
                                </div>
                                <div className="text-gray-500">
                                  {donors} donors
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label="Active"
                                color="success"
                                size="small"
                              />
                            </TableCell>
                            <TableCell align="center">
                              <IconButton
                                size="small"
                                onClick={(e) => handleMenuOpen(e, fundraiser)}
                              >
                                <MoreVertIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={fundraisers.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </div>
          </>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <PeopleIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchQuery ? "No fundraisers found" : "No fundraisers yet"}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery 
                ? "Try adjusting your search terms" 
                : "Start by adding your first fundraiser"}
            </p>
            {!searchQuery && (
              <div className="flex justify-center">
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAddFundraiser}
                  sx={{
                    backgroundColor: '#7c3aed',
                    '&:hover': {
                      backgroundColor: '#6b21a8'
                    }
                  }}
                >
                  Add Fundraiser
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>
          <EmailIcon fontSize="small" className="mr-2" />
          Send Email
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <PhoneIcon fontSize="small" className="mr-2" />
          Call
        </MenuItem>
        <MenuItem onClick={handleMenuClose} className="text-red-600">
          Remove
        </MenuItem>
      </Menu>
    </div>
  );
};

export default Fundraisers;
