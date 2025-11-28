"use client";
// React and Next imports
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Function imports
import {
  fetchEntries,
  handleSearch,
  handleCardClick,
  handleEditClick,
  deleteAppointment,
  handleCloseSnackBar,
  handleCloseAppointmentEditModal,
  updateAppointment,
} from "../../../../controllers/jobCardControllers";

// Functional package imports
import { motion } from "framer-motion";

// Component imports
import Navbar from "../../../components/navbar";
import BackButton from "../../../components/backButton";

import DataNotFound from "@/components/dataNotFound";
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import Cookies from "js-cookie";

// Images and icon imports
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { set } from "date-fns";

export default function JobCard() {
  const router = useRouter();

  // FrontEnd extracted data states
  let [token, setToken] = useState();

  // Backend Data states
  const [entries, setEntries] = useState([]);
  const [filteredEntries, setFilteredEntries] = useState([]);

  // Modal and Alert states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [appointmentEditModalOpen, setAppointmentEditModalOpen] = useState();
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState();
  const [snackbarSeverity, setSnackbarSeverity] = useState();

  // FrontEnd form input states
  const [searchText, setSearchText] = useState("");
  const [selectedOption, setSelectedOption] = useState("vehicleModel");
  const [searchQuery, setSearchQuery] = useState("");
  const [deletionID, setDeletionID] = useState();
  const [editAppointmentData, setEditAppointmentData] = useState();
  const [appointmentDate, setAppointmentDate] = useState();
  const [appointmentTime, setAppointmentTime] = useState();

  useEffect(() => {
    const storedToken = Cookies.get("token");
    setToken(storedToken);

    fetchEntries(
      storedToken,
      setEntries,
      setFilteredEntries,
      setLoading,
      setOpenSnackbar,
      setSnackbarMessage,
      setSnackbarSeverity
    );
  }, []);

  return (
    <div>
      <Navbar pageName="Job Cards" />
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
              {/* <BackButton /> */}
              {/* <h1 style={{ marginLeft: "10px" }}>Job Cards</h1> */}
            </div>
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
          </div>

          {loading ? (
            <p>Loading...</p>
          ) : filteredEntries.length === 0 ? (
            <DataNotFound />
          ) : error ? (
            <p>Error: {error}</p>
          ) : (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Box
                id="scrollable-table"
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
                {filteredEntries.map((tile, index) => (
                  // <Grid item xs={12} sm={6} md={4} lg={2} key={tile._id}>
                  <motion.div
                    key={tile._id}
                    className="box"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, ease: [0, 0.71, 0.2, 1.01] }}
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
                          position: "relative",
                          padding: "10px 20px 20px 20px",
                          textAlign: "left",
                          boxShadow: 3,
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                        }}
                      >
                        {/* <CardContent> */}
                        <Box sx={{ fontSize: "0.9rem" }}>
                          <Typography
                            variant="h6"
                            component="div"
                            sx={{ marginBottom: "10px" }}
                          >
                            {tile.plateNumber || tile.vehicle_id}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Name : {tile.customer_name?.slice(0, 10)}...
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
                        </Box>
                        {/* </CardContent> */}
                        <Box
                          sx={{
                            position: "absolute",
                            bottom: "1px",
                            right: "5px",
                          }}
                        >
                          <IconButton
                            onClick={(e) =>
                              handleEditClick(
                                e,
                                setAppointmentEditModalOpen,
                                tile,
                                setAppointmentDate,
                                setAppointmentTime,
                                setEditAppointmentData
                              )
                            }
                          >
                            <EditIcon style={{ fontSize: "20px" }} />
                          </IconButton>
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent card click
                              setDeletionID(tile.appointment_id);
                              setOpenDeleteDialog(true);
                            }}
                          >
                            <DeleteIcon style={{ fontSize: "20px" }} />
                          </IconButton>
                        </Box>
                      </Card>
                    </motion.div>
                  </motion.div>
                  // </Grid>
                ))}
              </Box>
            </div>
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
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {/* Deletion Conformation Dialogue */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this appointment? This action cannot
          be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)} color="primary">
            Cancel
          </Button>
          <Button
            onClick={(e) =>
              deleteAppointment(
                token,
                deletionID,
                setOpenDeleteDialog,
                setSnackbarMessage,
                setOpenSnackbar,
                setSnackbarSeverity
              )
            }
            color="error"
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Appointment Modal */}
      <Dialog
        open={appointmentEditModalOpen}
        // onClose={() => setAppointmentEditModalOpen(false)}
        fullWidth
        maxWidth="sm"
        gap={5}
      >
        <IconButton
          aria-label="close"
          onClick={() => {
            handleCloseAppointmentEditModal(setAppointmentEditModalOpen);
          }}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>

        <DialogContent>
          <Typography variant="h6" paddingBottom={2}>
            Edit Appointment Details
          </Typography>
          <Box display="flex" alignItems="center" gap={2}>
            <TextField
              required
              type="date"
              label="Appointment Date"
              size="small"
              variant="outlined"
              fullWidth
              margin="normal"
              value={appointmentDate}
              onChange={(e) => setAppointmentDate(e.target.value)}
            />
            <TextField
              required
              label="Appointment Time"
              size="small"
              type="time"
              variant="outlined"
              fullWidth
              margin="normal"
              value={appointmentTime}
              onChange={(e) => setAppointmentTime(e.target.value)}
            />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => setAppointmentEditModalOpen(false)}
            color="primary"
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              editAppointmentData.appointment_date = appointmentDate;
              editAppointmentData.appointment_time = appointmentTime;

              updateAppointment(
                token,
                editAppointmentData,
                setOpenSnackbar,
                setSnackbarMessage,
                setSnackbarSeverity,
                setAppointmentEditModalOpen
              );
            }}
            color="primary"
          >
            Update Appointment
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
