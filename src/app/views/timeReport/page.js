"use client";

import React, { useState, useEffect } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import {
  handleGoClick,
  handleMonthKeyPress,
  handleSearchChange,
  handleSearch,
  handleDateClick,
  handleMonthChange,
  formatDate,
  handleScrollToTop,
  scrollToTopButtonDisplay,
  parseTimeRange,
  convertTo24Hour,
  fetchWorkSchedule,
  fetchReportData,
  fetchUsers,
  fetchTimeEntries,
  generatePDF,
} from "../../../../controllers/timeReportControllers";

import {
  Box,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Fab,
  InputAdornment,
  useMediaQuery,
} from "@mui/material";
import Navbar from "../../../components/navbar";
// import BackButton from "../../../components/backButton";
import { ArrowDropDown, ArrowDropUp } from "@mui/icons-material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import SearchIcon from "@mui/icons-material/Search";
import jsPDF from "jspdf";
import "jspdf-autotable";
import FileDownloadIcon from "@mui/icons-material/FileDownload";

export default function TimeReport() {
  const theme = createTheme(); // Create a theme instance

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();

  const currentMonth = String(currentDate.getMonth() + 1).padStart(2, "0");
  const [selectedMonth, setSelectedMonth] = useState(
    `${currentYear}-${currentMonth}`
  );
  const [dates, setDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isTableVisible, setIsTableVisible] = useState(false);
  const [visibleDates, setVisibleDates] = useState([]);
  const [workScheduleData, setWorkScheduleData] = useState([]);
  const [reportData, setReportData] = useState([]);
  const [usersData, setUsersData] = useState([]);
  const [timeEntriesData, setTimeEntriesData] = useState([]);
  const [report, setReport] = useState([]);
  const [showFab, setShowFab] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState(usersData);

  // Determine if the current view is mobile or tablet
  const isMobileView = useMediaQuery(theme.breakpoints.down("sm"));
  const isTabletView = useMediaQuery(theme.breakpoints.between("sm", "md"));

  useEffect(() => {
    fetchUsers(setUsersData);
    fetchTimeEntries(setTimeEntriesData);
  }, []);

  useEffect(() => {
    setFilteredUsers(usersData);
  }, [usersData]);

  useEffect(() => {
    handleGoClick(selectedMonth, setDates, setVisibleDates);
  }, [selectedMonth]);

  return (
    <ThemeProvider theme={theme}>
      <div>
        <Navbar pageName="Time Report" />
        <Box sx={{ padding: "20px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              color: "white",
              marginBottom: "16px",
              flexWrap: "wrap",
            }}
          >
            {/* Left: Search Field */}
            <div
              style={{ flex: 1, display: "flex", justifyContent: "flex-start" }}
            ></div>

            {/* Center: Month Picker */}
            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <Box sx={{ display: "flex", gap: 2, borderRadius: "10px" }}>
                <TextField
                  type="month"
                  value={selectedMonth}
                  size="small"
                  onChange={(event) => {
                    handleMonthChange(event, setSelectedMonth);
                    handleGoClick(selectedMonth, setDates, setVisibleDates);
                  }}
                  onKeyPress={(event) =>
                    handleMonthKeyPress(
                      event,
                      handleGoClick,
                      selectedMonth,
                      setDates,
                      setVisibleDates
                    )
                  }
                  sx={{
                    backgroundColor: "white",
                    borderRadius: "4px",
                    width: "200px",
                    "@media (max-width: 350px)": {
                      width: "150px",
                    },
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: "#474747",
                      },
                    },
                  }}
                />
              </Box>
            </div>

            {/* Right: Download Button */}
            <div
              style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}
            >
              <TextField
                variant="outlined"
                size="small"
                value={searchQuery}
                onChange={(event) => handleSearchChange(event, setSearchQuery)}
                onKeyPress={(event) => {
                  if (event.key === "Enter") {
                    handleSearch(searchQuery, usersData, setFilteredUsers);
                  }
                }}
                sx={{
                  backgroundColor: "white",
                  borderRadius: "5px",
                  marginRight: "10px",
                  width: "250px",
                  "@media (max-width: 450px)": {
                    width: "300px",
                  },
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() =>
                          handleSearch(searchQuery, usersData, setFilteredUsers)
                        }
                      >
                        <SearchIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <IconButton
                aria-label="downloadTemplate"
                onClick={() =>
                  generatePDF(
                    selectedMonth,
                    reportData,
                    filteredUsers,
                    usersData,
                    timeEntriesData,
                    searchQuery,
                    convertTo24Hour
                  )
                }
                sx={{
                  borderRadius: 1,
                  padding: "8px",
                  backgroundColor: "white",
                  "@media (max-width: 350px)": {
                    padding: "4px",
                  },
                  "&:hover": {
                    backgroundColor: "#f0f0f0",
                  },
                }}
              >
                <FileDownloadIcon fontSize="small" />
              </IconButton>
            </div>
          </div>

          <div>
            {isMobileView || isTabletView ? (
              // Render card design for mobile or tablet view
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {dates.map((date, index) => {
                  // Remove the shift_type filter to show all users
                  const dateEntries = filteredUsers
                    .map((user) => {
                      const userTimeEntries = timeEntriesData.filter(
                        (entry) =>
                          entry.employeeId === user.user_id &&
                          entry.date ===
                            date
                              .split(" / ")[0]
                              .split("-")
                              .map((part) =>
                                part.length === 1 ? `0${part}` : part
                              )
                              .join("/")
                      );

                      // Check if there are any non-empty time entries
                      const hasValidTimeEntries = userTimeEntries.some(
                        (entry) => entry.time
                      );

                      // Return true only if there are valid time entries
                      return hasValidTimeEntries;
                    })
                    .filter(Boolean);

                  // Skip rendering this date section if there are no valid entries
                  if (dateEntries.length === 0) {
                    return null;
                  }

                  return (
                    <Paper
                      key={index}
                      sx={{ padding: 2, backgroundColor: "lightpink" }}
                    >
                      <Typography
                        component="div"
                        sx={{
                          color: "black",
                          cursor: "pointer",
                          marginBottom: 1,
                        }}
                        onClick={() => handleDateClick(date, setVisibleDates)}
                      >
                        {date}
                      </Typography>
                      {visibleDates.includes(date) && (
                        <Box>
                          {filteredUsers
                            .map((user) => {
                              const userTimeEntries = timeEntriesData.filter(
                                (entry) =>
                                  entry.employeeId === user.user_id &&
                                  entry.date ===
                                    date
                                      .split(" / ")[0]
                                      .split("-")
                                      .map((part) =>
                                        part.length === 1 ? `0${part}` : part
                                      )
                                      .join("/")
                              );

                              const userReport = reportData.find((report) => {
                                const [startYear, startMonth, startDay] =
                                  report.startdate.split("-");
                                const [endYear, endMonth, endDay] =
                                  report.enddate.split("-");
                                const [currentDay, currentMonth, currentYear] = date
                                  .split(" / ")[0]
                                  .split("-");

                                const reportStartDate = new Date(
                                  startYear,
                                  startMonth - 1,
                                  startDay
                                );
                                const reportEndDate = new Date(
                                  endYear,
                                  endMonth - 1,
                                  endDay
                                );
                                const currentDate = new Date(
                                  currentYear,
                                  currentMonth - 1,
                                  currentDay
                                );

                                const currentDayName = currentDate.toLocaleDateString(
                                  "en-US",
                                  {
                                    weekday: "long",
                                  }
                                );

                                return (
                                  report.user_id === user.user_id &&
                                  currentDate >= reportStartDate &&
                                  currentDate <= reportEndDate &&
                                  report.days.includes(currentDayName)
                                );
                              });

                              const isOnLeave =
                                userReport && userReport.status === "leave";

                              const isAllFieldsEmpty =
                                (!userReport ||
                                  userReport.description === "----") &&
                                (!userReport || userReport.time === "----") &&
                                userTimeEntries.length === 0;

                              if (
                                isAllFieldsEmpty ||
                                userTimeEntries.every(
                                  (entry) =>
                                    !entry.time || entry.time.trim() === ""
                                )
                              ) {
                                return null; // Skip rendering if all time entries are empty
                              }

                              return (
                                <Box
                                  key={user.user_id}
                                  sx={{ marginBottom: 2 }}
                                >
                                  <Typography component="div" variant="body1">
                                    <b>Name:</b>{" "}
                                    {`${user.firstName} ${user.lastName}`}
                                  </Typography>
                                  <Typography component="div" variant="body1">
                                    <b>Time:</b>{" "}
                                    {userTimeEntries.length > 0
                                      ? userTimeEntries.map((entry) => entry.time).join(", ")
                                      : "----"}
                                  </Typography>
                                </Box>
                              );
                            })}
                        </Box>
                      )}
                    </Paper>
                  );
                })}
              </Box>
            ) : (
              // Render table design for larger screens
              <TableContainer
                id="scrollable-time-report"
                component={Paper}
                sx={{
                  maxHeight: "100%",
                  maxWidth: "100%",
                  minWidth: "100%",
                }}
                onScroll={(event) =>
                  scrollToTopButtonDisplay(event, setShowFab)
                }
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    backgroundColor: "white",
                    borderRadius: "10px",
                  }}
                >
                  {dates.map((date, index) => {
                    // Remove the shift_type filter to show all users
                    const dateEntries = filteredUsers
                      .map((user) => {
                        const userTimeEntries = timeEntriesData.filter(
                          (entry) =>
                            entry.employeeId === user.user_id &&
                            entry.date ===
                              date
                                .split(" / ")[0]
                                .split("-")
                                .map((part) =>
                                  part.length === 1 ? `0${part}` : part
                                )
                                .join("/")
                        );

                        // Check if there are any non-empty time entries
                        const hasValidTimeEntries = userTimeEntries.some(
                          (entry) => entry.time
                        );

                        // Return true only if there are valid time entries
                        return hasValidTimeEntries;
                      })
                      .filter(Boolean);

                    // Skip rendering this date section if there are no valid entries
                    if (dateEntries.length === 0) {
                      return null;
                    }

                    return (
                      <div
                        key={index}
                        style={{ display: "flex", flexDirection: "column" }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            backgroundColor: "lightpink",
                          }}
                        >
                          <Typography
                            sx={{
                              color: "black",
                              cursor: "pointer",
                              flexGrow: 1,
                              marginLeft: "20px",
                              overflowX: "auto",
                              "@media (max-width: 600px)": {
                                margin: "10px 0",
                                width: "100%",
                              },
                            }}
                            onClick={() =>
                              handleDateClick(date, setVisibleDates)
                            }
                          >
                            {date}
                          </Typography>
                          <IconButton
                            onClick={() =>
                              handleDateClick(date, setVisibleDates)
                            }
                          >
                            {visibleDates.includes(date) ? (
                              <ArrowDropUp />
                            ) : (
                              <ArrowDropDown />
                            )}
                          </IconButton>
                        </div>
                        {visibleDates.includes(date) && (
                          <Table
                            sx={{ minWidth: 650 }}
                            aria-label="time report table"
                          >
                            <TableHead>
                              <TableRow>
                                <TableCell align="left" sx={{ width: "50%" }}><b>Name</b></TableCell>
                                <TableCell align="left" sx={{ width: "50%" }}><b>Time</b></TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {filteredUsers
                                .map((user) => {
                                  const userTimeEntries = timeEntriesData.filter(
                                    (entry) =>
                                      entry.employeeId === user.user_id &&
                                      entry.date === date
                                        .split(" / ")[0]
                                        .split("-")
                                        .map((part) => (part.length === 1 ? `0${part}` : part))
                                        .join("/")
                                  );

                                  // Skip rendering if there are no time entries or all entries are empty
                                  if (userTimeEntries.length === 0 || 
                                      userTimeEntries.every(entry => !entry.time || entry.time === "----")) {
                                    return null;
                                  }

                                  return (
                                    <TableRow key={user.user_id}>
                                      <TableCell align="left">{`${user.firstName} ${user.lastName}`}</TableCell>
                                      <TableCell align="left">
                                        {userTimeEntries.map((entry, index) => (
                                          entry.time && entry.time !== "----" ? 
                                            <div key={entry.id || index}>{entry.time}</div> : null
                                        ))}
                                      </TableCell>
                                    </TableRow>
                                  );
                                })
                                .filter(Boolean)}
                            </TableBody>
                          </Table>
                        )}
                      </div>
                    );
                  })}
                </Box>
              </TableContainer>
            )}
            {showFab && (
              <Fab
                size="small"
                onClick={handleScrollToTop}
                style={{
                  backgroundColor: "white",
                  color: "primary",
                  position: "fixed",
                  bottom: 40,
                  right: 40,
                  zIndex: 10,
                }}
              >
                <ArrowUpwardIcon />
              </Fab>
            )}
          </div>
        </Box>
      </div>
    </ThemeProvider>
  );
}
