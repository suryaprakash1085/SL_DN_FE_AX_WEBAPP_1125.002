"use client";
// React and Next imports
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DataNotFound from "@/components/dataNotFound";
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

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleSearch(searchText, originalEntries, setEntries);
    }
  };

  const handleCardClick = (appointmentId) => {
    router.push(`/views/invoiceList/${appointmentId}`);
  };

  // ✔ Filter invoiced entries
  const invoicedEntries = entries.filter(
    (entry) => entry.status === "invoice"
  );

  return (
    <div>
      <Navbar pageName="Invoice List" />
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

          {/* ✔ Show loading / empty / invoiced results */}
          {loading ? (
            <p>Loading...</p>
          ) : invoicedEntries.length === 0 ? (
            <DataNotFound />
          ) : (
            <Box
              display="flex"
              flexWrap="wrap"
              gap={2}
              sx={{ display: "flex", justifyContent: "center", marginTop: 2 }}
            >
              {invoicedEntries.map((entry) => (
                <motion.div
                  key={entry._id}
                  className="box"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1 }}
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
                        padding: "10px 20px 20px 20px",
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
      <Snackbar open={openSnackbar}>
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
