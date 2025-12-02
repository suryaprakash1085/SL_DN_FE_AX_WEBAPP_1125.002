"use client";
// React and Next imports
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

// Function imports
import { fetchEntries } from "../../../../controllers/jobStatusControllers";

// Component imports
import Navbar from "../../../components/navbar";
import BackButton from "../../../components/backButton";

// Functional package imports
import { motion } from "framer-motion";
import LinearProgress from "@mui/material/LinearProgress";
import Collapse from "@mui/material/Collapse";

import DataNotFound from "@/components/dataNotFound";
// UI package imports
import {
  Box,
  TextField,
  IconButton,
  Card,
  CardContent,
  Typography,
  InputAdornment,
  Grid,
  Snackbar,
  Alert,
  Badge,
  Switch,
  Tooltip,
} from "@mui/material";

// Images and icon imports
import SearchIcon from "@mui/icons-material/Search";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { set } from "date-fns";

export default function JobStatus() {
  const router = useRouter();

  // FrontEnd extracted data states
  const [token, setToken] = useState();

  // Backend Data states
  const [entries, setEntries] = useState([]);
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [totalVehicleInService, setTotalVehicleInService] = useState(0);
  const [totalVehicleReady, setTotalVehicleReady] = useState(0);

  // Modal and Alert states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState();
  const [snackBarSeverity, setSnackBarSeverity] = useState();
  let [showDeleted, setShowDeleted] = useState(false);

  // FrontEnd form input states
  const [selectedOption, setSelectedOption] = useState("vehicleModel");
  const [searchQuery, setSearchQuery] = useState("");

  // New state for grouping and collapsing
  const [collapsedStatuses, setCollapsedStatuses] = useState({});

  // New state for date filters
  const [startDate, setStartDate] = useState(() => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split("T")[0]; // Format as YYYY-MM-DD
  });

  const [endDate, setEndDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0]; // Format as YYYY-MM-DD
  });

  function LinearProgressWithLabel(props) {
    return (
      <Box
        sx={{
          display: props.counterSales ? "none" : "flex",
          alignItems: "center",
        }}
      >
        <Box sx={{ width: "100%", mr: 1 }}>
          <LinearProgress variant="determinate" {...props} />
        </Box>
        <Box sx={{ minWidth: 35 }}>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {`${Math.round(props.value)}%`}
          </Typography>
        </Box>
      </Box>
    );
  }

  const calculateCompletionPercentage = (tile) => {
    let totalServices = tile.services_actual.length;
    let completedServices = 0;

    tile.services_actual.map((service) => {
      service.service_status == "Completed"
        ? (completedServices = completedServices + 1)
        : "";
    });

    let percentage =
      (parseInt(completedServices) / parseInt(totalServices)) * 100;

    // console.log({
    //   totalServices: totalServices,
    //   completedServices: completedServices,
    // });

    if (isNaN(percentage)) {
      return 0;
    } else {
      return percentage;
    }
  };

  useEffect(() => {
    const storedToken = Cookies.get("token");
    setToken(storedToken);

    fetchEntries(
      storedToken,
      setEntries,
      setFilteredEntries,
      setLoading,
      setTotalVehicleInService,
      setOpenSnackbar,
      setSnackbarMessage,
      setSnackBarSeverity,
      showDeleted
    );
  }, [showDeleted]);

  // Initialize all statuses to be open
  useEffect(() => {
    const initialCollapsedStates = {};
    Object.keys(groupedEntries).forEach((status) => {
      initialCollapsedStates[status] = true; // Set to true for open state
    });
    setCollapsedStatuses(initialCollapsedStates);
  }, [filteredEntries]);

  const handleOptionChange = (event) => {
    setSelectedOption(event.target.value);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleSearch = () => {
    if (!searchQuery) {
      setFilteredEntries(entries);
      return;
    }

    const results = entries.filter((tile) => {
      if (selectedOption === "vehicleModel") {
        return tile.vehicle_id
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      } else if (selectedOption === "vehicleNumber") {
        return tile.customer_id.includes(searchQuery);
      }
      return false;
    });
    setFilteredEntries(results);
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  const label = { inputProps: { "aria-label": "Show Deleted" } };

  const handleCardClick = (appointmentId) => {
    // console.log("Appointment ID:", appointmentId);
    router.push(`/views/jobStatus/${appointmentId}`);
  };

  const groupedEntries = filteredEntries?.reduce((acc, tile) => {
    console.log({ filteredEntries });
    const status = tile.status;
    console.log({ status });
    if (!acc[status]) {
      acc[status] = [];
    }
    acc[status].push(tile);
    console.log({ acc });
    return acc;
  }, {});

  const toggleCollapse = (status) => {
    setCollapsedStatuses((prevCollapsedStatuses) => ({
      ...prevCollapsedStatuses,
      [status]: !prevCollapsedStatuses[status],
    }));
  };

  const handleDateFilter = () => {
    const filteredByDate = entries.filter((tile) => {
      const appointmentDate = new Date(tile.appointment_date);
      const invoiceDate = new Date(tile.invoice_date);
      const start = new Date(startDate);
      const end = new Date(endDate);

      return (
        (appointmentDate >= start && appointmentDate <= end) ||
        (invoiceDate >= start && invoiceDate <= end)
      );
    });
    setFilteredEntries(filteredByDate);
  };

  useEffect(() => {
    handleDateFilter();
  }, [startDate, endDate, entries]);

  return (
    <div>
      <Navbar pageName="Job Status" />
      <Box>
        <Box paddingX="1%">
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "16px",
            }}
          >
            <Box>
              <Badge
                badgeContent={totalVehicleInService}
                max={99}
                color="primary"
              >
                <Box
                  sx={{
                    textAlign: "center",
                    padding: "20px",
                    color: "black",
                    borderRadius: "15px",
                    backgroundColor: "#f9f9f9",
                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  In Service <br></br>{" "}
                </Box>
              </Badge>
            </Box>
            <Box>
              <Tooltip title={showDeleted ? "Hide Deleted" : "Show Deleted"}>
                <Switch
                  {...label}
                  color="warning"
                  onChange={(e) => {
                    let switchStatus = e.target.checked;
                    setShowDeleted(switchStatus);
                  }}
                />
              </Tooltip>
              {/* Date Filter Fields */}
              <TextField
                type="date"
                size="small"
                // label="Start Date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                sx={{
                  backgroundColor: "white",
                  borderRadius: 1,
                  marginRight: 2,
                }}
              />
              <TextField
                type="date"
                size="small"
                // label="End Date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                sx={{
                  backgroundColor: "white",
                  borderRadius: 1,
                  marginRight: 2,
                }}
              />
              {/* Search Field */}
              <TextField
                placeholder="Search"
                variant="outlined"
                size="small"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyUp={(e) => {
                  e.key === "Enter"
                    ? handleSearch(
                        entries,
                        searchQuery,
                        selectedOption,
                        setFilteredEntries
                      )
                    : null;
                }}
                sx={{ backgroundColor: "white", borderRadius: 1 }}
              />
            </Box>
          </Box>

          {loading ? (
            <p>Loading...</p>
          ) : entries === 0 ? (
            <DataNotFound />
          ) : (
            <>
              {Object.keys(groupedEntries).map((status) => (
                <Box key={status}>
                  {console.log({ groupedEntries })}
                  <Typography
                    variant="h6"
                    onClick={() => toggleCollapse(status)}
                    sx={{
                      color: "white",
                      fontSize: "1.2rem",
                      cursor: "pointer",
                    }}
                  >
                    <IconButton size="small">
                      {collapsedStatuses[status] ? (
                        <ExpandMoreIcon />
                      ) : (
                        <ExpandLessIcon />
                      )}
                    </IconButton>
                    {status} ({groupedEntries[status].length})
                  </Typography>
                  <Collapse in={collapsedStatuses[status]}>
                    <Box display="flex" flexWrap="wrap" gap={2}>
                      {groupedEntries[status].map((tile) => (
                        <motion.div
                          key={tile._id}
                          className="box"
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{
                            duration: 1,
                            ease: [0, 0.71, 0.2, 1.01],
                          }}
                        >
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            onClick={() => handleCardClick(tile.appointment_id)}
                          >
                            <Card
                              sx={{
                                height: "150px",
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
                                  {tile.plateNumber || tile.vehicle_id}
                                </Typography>

                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  {tile.appointment_id} ({tile.customer_name})
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  Date:{" "}
                                  {new Date(
                                    tile.appointment_date
                                  ).toLocaleDateString("en-GB")}
                                  ({tile.appointment_time})
                                </Typography>
                                {/* {tile.appointment_time && (
                                  <Typography variant="body2" color="text.secondary">
                                    Time: {tile.appointment_time}
                                  </Typography>
                                )} */}
                                {/* <Typography variant="body2" color="text.secondary">
                                  Apmt Status:{" "}
                                  {tile.status == "invoice generated"
                                    ? "invoiced"
                                    : tile.status}
                                </Typography> */}
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  Phone: {tile.phone || "N/A"}
                                </Typography>

                                <Box sx={{ width: "100%" }}>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    Job Status: {tile.status}
                                  </Typography>
                                  <LinearProgressWithLabel
                                    value={calculateCompletionPercentage(tile)}
                                    counterSales={
                                      tile.plateNumber == "CounterSales"
                                        ? true
                                        : false
                                    }
                                  />
                                </Box>
                              </Box>
                            </Card>
                          </motion.div>
                        </motion.div>
                      ))}
                    </Box>
                  </Collapse>
                </Box>
              ))}
            </>
          )}
        </Box>
      </Box>

      {/* Snackbar for Error Message */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={4000}
        onClose={() => handleCloseSnackBar(setOpenSnackbar)}
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
