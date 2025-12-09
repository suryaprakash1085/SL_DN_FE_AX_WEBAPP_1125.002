"use client";
// React and Next imports
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DataNotFound from "@/components/dataNotFound";
import axios from "axios";
// Function imports
import { fetchEntries, handleSearch } from "../../../../controllers/invoiceListControllers";

// Component imports
import Navbar from "../../../components/navbar";

// Functional package imports
import { motion } from "framer-motion";
import Cookies from "js-cookie";

// UI package imports
import {
  Box,
  TextField,
  IconButton,
  Card,
  Typography,
  InputAdornment,
  Snackbar,
  Alert,
} from "@mui/material";

// Images and icon imports
import SearchIcon from "@mui/icons-material/Search";

export default function InvoiceList() {
  const router = useRouter();

  // FrontEnd extracted data states
  const [token, setToken] = useState();

  // Backend Data states
  const [entries, setEntries] = useState([]);
  const [invoiceEntries, setInvoiceEntries] = useState([]);
  const [originalEntries, setOriginalEntries] = useState([]);

  // Modal and Alert states
  const [loading, setLoading] = useState(true);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState();
  const [snackBarSeverity, setSnackBarSeverity] = useState();

  // FrontEnd form input states
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    let storedToken = Cookies.get("token");
    setToken(storedToken);

    fetchEntries(
      storedToken,
      (data) => {
        setEntries(data);
        setOriginalEntries(data);
      },
      setLoading,
      setOpenSnackbar,
      setSnackbarMessage,
      setSnackBarSeverity
    );
  }, []);

  useEffect(() => {
    const fetchInvoiceEntries = async () => {
      try {
        // const appointmentId = entries[0].appointment_id;
        console.log(entries);
        const token = Cookies.get("token");

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/appointment/get/get_all_appointments_to_invoice`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data) {
          setInvoiceEntries(response.data);
        }
      } catch (error) {
        console.error("Error fetching invoice entries:", error);
      }
    };

    fetchInvoiceEntries();
  }, [entries]);





  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleSearch(searchText, originalEntries, setEntries);
    }
  };

  const handleCardClick = (appointmentId) => {
    router.push(`/views/gstInvoice/${appointmentId}`);
  };


  const filteredEntries = entries.filter((entry) => {
  const match = invoiceEntries.some(
    (inv) => inv.invoice_id === entry.appointment_id
  );

  return (
    match &&
    entry.plateNumber !== "CounterSales" &&
    entry.status !== "deleted" &&
    entry.status === "invoiced"
  );
});


  return (
    <div>
      <Navbar pageName="GST Invoice" />
      <Box
        sx={{
          backgroundSize: "cover",
          minHeight: "89vh",
        }}
      >
        <Box paddingX="1%">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex" }}></div>
            <div>
              <TextField
                placeholder="Search"
                variant="outlined"
                size="small"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onKeyUp={handleKeyPress}
                sx={{ backgroundColor: "white", borderRadius: 1 }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() =>
                          handleSearch(searchText, originalEntries, setEntries)
                        }
                      >
                        <SearchIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </div>
          </div>
          {loading ? (
            <p>Loading...</p>
          ) :  filteredEntries.length === 0 ? (
  <DataNotFound />
): (
            <Box
              display="flex"
              flexWrap="wrap"
              gap={2}
              sx={{ display: "flex", justifyContent: "center", marginTop: 2 }}
            >
              {console.log({ invoiceEntries, entries })}
              {entries
                .filter(
                  (entry, invoiceEntries) =>
                    // entry.status === "invoiced" &&
                    // entry.plateNumber != "CounterSales"
                    invoiceEntries.invoice_id === invoiceEntries.appointment_id
                    &&
                    entry.plateNumber != "CounterSales"
                    &&
                    entry.status != "deleted"
                    &&
                    entry.status === "invoiced"
                )
                .map((entry) => (
                  <motion.div
                    key={entry._id}
                    className="box"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, ease: [0, 0.71, 0.2, 1.01] }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      onClick={() => handleCardClick(entry.appointment_id)}
                    >
                      <Card
                        sx={{
                          height: "110px",
                          cursor: "pointer",
                          width: "160px",
                          borderRadius: "20px",
                          position: "relative",
                          padding: "10px 20px 20px 20px",
                          textAlign: "left",
                          boxShadow: 3,
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                        }}
                      >
                        <Box sx={{ fontSize: "0.9rem" }}>
                          <Typography
                            variant="h6"
                            component="div"
                            sx={{ marginBottom: "10px" }}
                          >
                            {entry.plateNumber || entry.vehicle_id}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Date:{" "}
                            {new Date(
                              entry.appointment_date
                            ).toLocaleDateString()}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Time: {entry.appointment_time}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Status: {entry.status}
                          </Typography>
                        </Box>
                      </Card>
                    </motion.div>
                  </motion.div>
                ))}
            </Box>
          )}
        </Box>
      </Box>

      {/* Snackbar for Error Message */}
      <Snackbar
        open={openSnackbar}
      // autoHideDuration={4000}
      // onClose={() => handleCloseSnackBar(setOpenSnackbar)}
      >
        <Alert
          onClose={() => handleCloseSnackBar(setOpenSnackbar)}
          severity={snackBarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
}
