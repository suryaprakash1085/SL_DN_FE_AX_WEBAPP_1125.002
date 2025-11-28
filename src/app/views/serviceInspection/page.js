"use client";
// React and Next imports
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DataNotFound from "@/components/dataNotFound.js";
// Function imports
import {
  fetchEntries,
  handleOptionChange,
  handleSearchChange,
  handleSearch,
  handleKeyPress,
  handleCardClick,
} from "../../../../controllers/ServiceInspectionControllers.js";

// Component imports
import Navbar from "../../../components/navbar.js";
import BackButton from "../../../components/backButton.js";

// Functional package imports
import { motion } from "framer-motion";

// UI package imports
import {
  Box,
  TextField,
  IconButton,
  Card,
  Typography,
  InputAdornment,
} from "@mui/material";

// Images and icon imports
import SearchIcon from "@mui/icons-material/Search";

export default function serviceCenter() {
  const router = useRouter();

  // Modal and Alert states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // FrontEnd form input states
  const [selectedOption, setSelectedOption] = useState("vehicleModel");
  const [searchText, setSearchText] = useState("");

  // Backend data states
  const [entries, setEntries] = useState([]);
  const [filteredEntries, setFilteredEntries] = useState([]);

  useEffect(() => {
    fetchEntries(setEntries, setFilteredEntries, setLoading, setError);
  }, []);

  return (
    <div>
      <Navbar pageName="Vehicles for Service" />

      <Box
        sx={{
          backgroundSize: "cover",
          color: "white",
          minHeight: "89vh",
        }}
      >
        <Box paddingX="1%">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "16px",
            }}
          >
            <div style={{ display: "flex" }}>
              {/* <BackButton />
              <h1 style={{ marginLeft: "10px" }}>Vehicles for Service</h1> */}
            </div>
            {/* Search Field */}
            <TextField
              placeholder="Search"
              variant="outlined"
              size="small"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyUp={(e) => {
                e.key === "Enter"
                  ? handleSearch(
                      searchText,
                      selectedOption,
                      entries,
                      setFilteredEntries
                    )
                  : null;
              }}
              sx={{ backgroundColor: "white", borderRadius: 1 }}
            />
          </div>

          {loading ? (
            <p>Loading...</p>
          ) : filteredEntries.filter((tile) => tile.status === "inspection")
              .length === 0 ? (
            <DataNotFound />
          ) : error ? (
            <p>Error: {error}</p>
          ) : (
            <>
              <Box
                display="flex"
                flexWrap="wrap"
                gap={2}
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  maxHeight: "70vh",
                  overflowY: "auto",
                  padding: "0.5% 0.5% 0.5% 0.5%",
                }}
              >
                {filteredEntries
                  .filter((tile) => tile.status === "inspection")
                  .map((tile) => (
                    <motion.div
                      key={tile._id}
                      className="box"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 1 }}
                    >
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        onClick={() =>
                          handleCardClick(router, tile.appointment_id)
                        }
                      >
                        <Card
                          sx={{
                            height: "110px",
                            cursor: "pointer",
                            width: "160px",
                            borderRadius: "20px",
                            padding: "10px 20px",
                            boxShadow: 3,
                            textAlign: "left",
                          }}
                        >
                          <Typography
                            variant="h6"
                            sx={{ marginBottom: "10px" }}
                          >
                            {tile.plateNumber || tile.vehicle_id}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Date:{" "}
                            {new Date(
                              tile.appointment_date
                            ).toLocaleDateString()}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Time: {tile.appointment_time}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Status: {tile.status}
                          </Typography>
                        </Card>
                      </motion.div>
                    </motion.div>
                  ))}
              </Box>
            </>
          )}
        </Box>
      </Box>
    </div>
  );
}
