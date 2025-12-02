"use client";

import Navbar from "../../../components/navbar.js";
import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Tooltip,
  IconButton,
  Button,
  TextField,
  Snackbar,
  Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { useRouter } from "next/navigation";
import {
  fetchData,
  createCounterSale,
  deleteCTInvoice,
} from "./shoppingcartControllers.js";

const CustomerTable = () => {
  const [token, setToken] = useState();
  const [tableRows, setTableRows] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "error",
  });

  // Set initial date range (Last 7 Days)
  useEffect(() => {
    const getLast7DaysRange = () => {
      const today = new Date();
      const last7Days = new Date();
      last7Days.setDate(today.getDate() - 7); // Start date: 7 days ago

      const formatDate = (date) => date.toISOString().split("T")[0];
      return { start: formatDate(last7Days), end: formatDate(today) };
    };

    const { start, end } = getLast7DaysRange();
    setStartDate(start);
    setEndDate(end);
  }, []);

  // Fetch data from API
  useEffect(() => {
    const storedToken = Cookies.get("token");
    setToken(storedToken);

    fetchData(storedToken, setLoading, setTableRows);
  }, []);

  // Filter data for the last 7 days
  useEffect(() => {
    const filteredData = tableRows
      .filter((row) => {
        const rowDate = new Date(row.appointment_date?.split("T")[0]);
        return rowDate >= new Date(startDate) && rowDate <= new Date(endDate);
      })
      .sort((a, b) => {
        const dateDiff =
          new Date(b.appointment_date) - new Date(a.appointment_date); // Sort by date (latest first)
        if (dateDiff !== 0) return dateDiff;

        // Extract numeric part of Customer ID (assuming format "CTS-700321")
        const idA = parseInt(a.appointment_id.replace(/\D/g, ""), 10);
        const idB = parseInt(b.appointment_id.replace(/\D/g, ""), 10);

        return idB - idA; // Descending Order (Largest ID First)
      });

    setFilteredRows(filteredData);
  }, [startDate, endDate, tableRows]);

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Handle Add Counter Sale Button
  const handleAddLeadClick = async () => {
    const saleData = {};
    const newId = await createCounterSale(saleData, Cookies.get("token"));
    if (newId) {
      router.push(`/views/shoppingcart/${newId}`);
    } else {
      setSnackbar({
        open: true,
        message: "Failed to create a new counter sale",
        severity: "error",
      });
    }
  };

  return (
    <>
      <Navbar pageName="Counter Sales" />
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          padding: "20px",
        }}
      >
        <Box sx={{ display: "flex", gap: 2 }}>
          <TextField
            type="date"
            size="small"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            sx={{
              backgroundColor: "white",
              "& .MuiOutlinedInput-root": {
                "&:hover fieldset": { borderColor: "gray" },
                "&.Mui-focused fieldset": { borderColor: "blue" },
              },
            }}
          />
          <TextField
            type="date"
            size="small"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            sx={{
              backgroundColor: "white",
              "& .MuiOutlinedInput-root": {
                "&:hover fieldset": { borderColor: "gray" },
                "&.Mui-focused fieldset": { borderColor: "blue" },
              },
            }}
          />
        </Box>
        {/* <Tooltip title="Add Counter Sale">
          <IconButton onClick={handleAddLeadClick} sx={{ backgroundColor: "white", "&:hover": { backgroundColor: "white" } }}>
            <AddIcon fontSize="small" />
          </IconButton>
        </Tooltip> */}
      </Box>
      <TableContainer
        component={Paper}
        sx={{ maxHeight: "70vh", overflowY: "auto" }}
      >
        <Table sx={{ minWidth: 650 }} aria-label="customer table">
          <TableHead
            style={{ position: "sticky", top: 0, backgroundColor: "white" }}
          >
            <TableRow>
              <TableCell>Appointment Id</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Customer Name</TableCell>
              <TableCell>Phone No</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRows.length > 0 ? (
              filteredRows.map((row, index) => (
                <TableRow
                  key={index}
                  onClick={() =>
                    router.push(`/views/shoppingcart/${row.appointment_id}`)
                  }
                  style={{ cursor: "pointer" }}
                >
                  <TableCell>{row.appointment_id}</TableCell>
                  <TableCell>{row.appointment_date}</TableCell>
                  <TableCell>{row.customer_name || "N/A"}</TableCell>
                  <TableCell>{row.phone || "N/A"}</TableCell>
                  <TableCell>{row.invoice_amount}</TableCell>
                  <TableCell>
                    {/* <Button size="small">Edit</Button>
                    <Button size="small" color="error">
                      Cancel
                    </Button> */}

                    <IconButton
                      aria-label="edit"
                      size="small"
                      sx={{
                        display: row.invoice_amount == 0 ? "block" : "none",
                        zIndex: 40,
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteCTInvoice(
                          row.appointment_id,
                          token,
                          setLoading,
                          setTableRows
                        );
                      }}
                    >
                      <DeleteIcon color="error" fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No Data Found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default CustomerTable;
