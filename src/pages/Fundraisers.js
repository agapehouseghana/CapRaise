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
import ClearIcon from "@mui/icons-material/Clear";
import SearchIcon from "@mui/icons-material/Search";
import { useStateContext } from "../contexts/ContextProvider";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebase";

const Fundraisers = () => {
  const { adminData } = useStateContext();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [usersLinkedToAdmin, setUsersLinkedToAdmin] = useState([]);

  const [loading, setLoading] = useState(false);

  const adminId = adminData?.adminId;
  const columns = [
    {
      id: "fullName",
      label: "Full Name",
      minWidth: 170,
      align: "left",
    },
    {
      id: "email",
      label: "Email",
      minWidth: 170,
      align: "left",
    },
    {
      id: "phoneNumber",
      label: "Phone Number",
      minWidth: 170,
      align: "left",
    },
  ];
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
  useEffect(() => {
    const fetchUsersLinkedToAdmin = async () => {
      setLoading(true);
      const usersCollectionRef = collection(db, "users");
      const q = query(usersCollectionRef, where("adminId", "==", adminId));

      try {
        const querySnapshot = await getDocs(q);
        const users = [];
        querySnapshot.forEach((doc) => {
          const userData = doc.data();
          users.push(userData);
        });
        setUsersLinkedToAdmin(users);
      } catch (error) {
        console.error("Error fetching users linked to admin:", error);
      }
      setLoading(false);
    };

    fetchUsersLinkedToAdmin();
  }, [adminId]);
  return (
    <>
      {loading ? (
        <div className="w-full h-screen flex justify-center items-center">
          <CircularProgress color="success" size={50} />
        </div>
      ) : (
        <div className="p-10">
          <h1 className="text-4xl text-gray-600 mb-10 font-bold">
            Fundraisers
          </h1>
          <div style={{ maxWidth: "40ch", marginBottom: "16px" }}>
            <input
              type="text"
              placeholder="Search Fundraisers"
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
                {fundraisers && fundraisers.length > 0 ? (
                  fundraisers
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
            count={fundraisers.length}
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

export default Fundraisers;
