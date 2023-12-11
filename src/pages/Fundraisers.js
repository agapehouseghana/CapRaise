import {
    IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
} from "@mui/material";
import React, { useState } from "react";
import { fundraiser } from "../utils/dummys";
import ClearIcon from "@mui/icons-material/Clear";
import SearchIcon from "@mui/icons-material/Search";

const Fundraisers = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState(""); 
  const columns = [
    {
      id: "firstName",
      label: "First Name",
      minWidth: 170,
      align: "left",
    },
    {
      id: "lastName",
      label: "Last Name",
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
      id: "mobileNumber",
      label: "Mobile Number",
      minWidth: 170,
      align: "left",
    },
    {
      id: "referralCode",
      label: "Referral Code",
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

  const fundraisers = fundraiser.filter((item) =>
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
    <div className="p-10">
        <h1 className="text-4xl text-gray-600 mb-10 font-bold">Fundraisers</h1>
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
  );
};

export default Fundraisers;
