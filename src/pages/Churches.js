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
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { collection, getDocs, getFirestore } from "firebase/firestore";
import ClearIcon from "@mui/icons-material/Clear";
import SearchIcon from "@mui/icons-material/Search";
import AddChurches from "../components/AddChurches";
import apiService from "../services/api";

// Temporary Firestore instance for fallback operations only
const db = getFirestore();

const Churches = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");

  const [churches,setChurches]=useState([]);

  const [loading, setLoading] = useState(false);

  const columns = [
    {
      id: "churchName",
      label: "Church Name",
      minWidth: 170,
      align: "left",
    },
    {
      id: "churchEmail",
      label: "Church Email",
      minWidth: 170,
      align: "left",
    },
    {
      id: "churchPhoneNumber",
      label: "Church PhoneNumber",
      minWidth: 170,
      align: "left",
    },
  ];

  useEffect(() => {
    const fetchAdmins = async () => {
      setLoading(true);
      try {
        // Try to get admins via middleware first
        const response = await apiService.getUsers({ role: 'admin' });
        setChurches(response.users || []);
        console.log('✅ Churches/Admins fetched via middleware:', response.users?.length || 0);
      } catch (middlewareError) {
        console.warn('Middleware admin fetch failed, falling back to direct Firebase:', middlewareError.message);
        
        // Fallback to direct Firebase call
        try {
          const adminsCollectionRef = collection(db, 'admins');
          const querySnapshot = await getDocs(adminsCollectionRef);
          const adminsData = querySnapshot.docs.map((doc) => ({
            adminId: doc.id,
            ...doc.data()
          }));
          setChurches(adminsData);
        } catch (error) {
          console.error('Error fetching admins: ', error);
        }
      }
      setLoading(false);
    };

    fetchAdmins(); 
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const church = churches.filter((item) =>
    Object.values(item).some(
      (value) =>
        value &&
        value.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };
  return (
    <>
    {loading ? (
      <div className="w-full h-screen flex justify-center items-center">
      <CircularProgress color="success" size={50} />
      </div>
    ) : (
    <div className="p-3 sm:p-10">
      <h1 className="text-4xl text-gray-600 mb-10 font-bold">Churches</h1>
      <div className="mb-4 sm:flex sm:justify-between items-center">
        <div style={{ maxWidth: "40ch" }}>
          <input
            type="text"
            placeholder="Search churches"
            value={searchQuery}
            onChange={handleSearch}
            style={{
              width: "100%",
              padding: "12px",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          />
          <IconButton
            onClick={() => setSearchQuery("")}
            size="small"
            style={{
              position: "absolute",
              top: "50%",
              right: "8px",
              transform: "translateY(-50%)",
            }}
          >
            {searchQuery ? <ClearIcon /> : <SearchIcon />}
          </IconButton>
        </div>
        <AddChurches/>
      </div>
      <TableContainer className="block border bg-white">
        <Table aria-label="empty table">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ minWidth: column.minWidth }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody className="text-center font-bold">
            {church && church.length > 0 ? (
              church
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row) => {
                  return (
                    <TableRow
                      hover
                      role="checkbox"
                      tabIndex={-1}
                      key={row.code}
                    >
                      {columns.map((column) => {
                        const value = row[column.id];
                        return (
                          <TableCell key={column.id} align={column.align}>
                            {value}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })
            ) : (
              <TableCell colSpan={columns.length} align="center">
                No Trips available
              </TableCell>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10]}
        component="div"
        count={church.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </div>
          )}
          </>
  );
};

export default Churches;
