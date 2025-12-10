"use client";
import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Autocomplete,
  TextField,
  Button,
  Chip,
  Snackbar,
  Tooltip,
  IconButton,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import UserRegistration from "./userRegistration";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import CancelIcon from "@mui/icons-material/Cancel";
import SendIcon from "@mui/icons-material/Send";
import DeleteIcon from "@mui/icons-material/Delete";
import LockResetIcon from "@mui/icons-material/LockReset";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [token, setToken] = useState("");
  const [editingRowId, setEditingRowId] = useState(null);
  const [editedAccess, setEditedAccess] = useState({});
  const [modifiedUsers, setModifiedUsers] = useState({});
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [rolename, setRole] = useState([]);
  const [roleOptions, setRoleOptions] = useState([]);
  const [openPasswordModal, setOpenPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedUserId, setSelectedUserId] = useState(null);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    const token = Cookies.get("token");
    setToken(token);
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/users`
      );
      const data = await response.json();
      setUsers(data);
      console.log("data users", data);
      const initialAccess = {};
      data.forEach((user) => {
        initialAccess[user.user_id] = Array.isArray(user.access)
          ? user.access
          : JSON.parse(user.access || "[]");
      });
      setEditedAccess(initialAccess);
    } catch (error) {
      console.log("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
    const role = Cookies.get("role");
    setRole(role);
  }, []);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/roles`
        );
        const data = await response.json();
        console.log("data roles:", data);
        setRoleOptions(
          data.map((role) => ({
            role_name: role.role_name || "Unknown Role",
            role_id: role.role_id,
          }))
        );
      } catch (error) {
        console.log("Error fetching roles:", error);
      }
    };
    fetchRoles();
  }, []);

  const handleSubmit = async () => {
    if (editingRowId !== null) {
      const changedUser = modifiedUsers[editingRowId];
      if (changedUser) {
        // Validate email
        const emailValid = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        if (changedUser.email && !emailValid.test(changedUser.email)) {
          setSnackbar({
            open: true,
            message: "Invalid email format",
            severity: "error",
          });
          return; // Exit if email is invalid
        }

        // Validate phone number
        const phoneRegex = /^\d{10}$/;
        if (changedUser.phone && !phoneRegex.test(changedUser.phone)) {
          setSnackbar({
            open: true,
            message: "Enter Valid Phone Number",
            severity: "error",
          });
          return; // Exit if phone number is invalid
        }

        console.log("Changed User Data:", changedUser);
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/update_employee/${editingRowId}`,
            {
              method: "PUT",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify(changedUser),
            }
          );
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          setSnackbar({
            open: true,
            message: "User updated successfully",
            severity: "success",
          });
          fetchUsers();
        } catch (error) {
          console.log("Error submitting changes:", error);
          setSnackbar({
            open: true,
            message: "Error updating user",
            severity: "error",
          });
        }
      } else {
        console.log("No changes were made");
      }
    }

    setEditingRowId(null);
    setModifiedUsers({});
  };

  const handleCancel = () => {
    setEditingRowId(null);
    setModifiedUsers({});
    fetchUsers();
  };

  const handleFieldChange = (userId, field, value) => {
    // Allow only alphabetic characters for specific fields
    if (["firstName", "lastName"].includes(field)) {
      const regex = /^[A-Za-z]*$/;
      if (!regex.test(value)) {
        return; // Exit if the value contains non-alphabetic characters
      }
    }

    // Allow only numeric characters and limit to 10 digits for the phone field
    if (field === "phone") {
      const phoneRegex = /^\d{0,10}$/;
      if (!phoneRegex.test(value)) {
        return; // Exit if the value contains non-numeric characters or exceeds 10 digits
      }
    }

    const updatedUsers = users.map((user) => {
      if (user.user_id === userId) {
        return { ...user, [field]: value };
      }
      return user;
    });
    setUsers(updatedUsers);

    setModifiedUsers((prev) => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        user_id: userId,
        [field]: value,
      },
    }));
  };

  // Validate email on blur
  const handleEmailBlur = (userId, value) => {
    const emailValid = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  };

  const handleCreateCustomer = () => {
    setShowRegistrationForm(true);
  };

  const handleRegistrationComplete = () => {
    setShowRegistrationForm(false);
    fetchUsers();
  };

  const handleDeleteClick = (userId) => {
    setDeleteUserId(userId);
    setOpenDeleteDialog(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/delete_employee/${deleteUserId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      setSnackbar({
        open: true,
        message: "User deleted successfully",
        severity: "success",
      });
      fetchUsers();
    } catch (error) {
      console.log("Error deleting user:", error);
      setSnackbar({
        open: true,
        message: "Error deleting user",
        severity: "error",
      });
    } finally {
      setOpenDeleteDialog(false);
      setDeleteUserId(null);
    }
  };

  const handleOpenPasswordModal = (userId) => {
    setSelectedUserId(userId);
    setOpenPasswordModal(true);
  };

  const handleClosePasswordModal = () => {
    setOpenPasswordModal(false);
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleSavePassword = async () => {
    if (newPassword !== confirmPassword) {
      setSnackbar({
        open: true,
        message: "Passwords do not match",
        severity: "error",
      });
      return; // Exit early if passwords don't match
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/change_password`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: selectedUserId,
            password: newPassword,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      setSnackbar({
        open: true,
        message: "Password changed successfully",
        severity: "success",
      });
      handleClosePasswordModal();
    } catch (error) {
      console.log("Error changing password:", error);
      setSnackbar({
        open: true,
        message: "Error changing password",
        severity: "error",
      });
    }
  };

  return (
    <div>
      {showRegistrationForm ? (
        <UserRegistration onRegistrationComplete={handleRegistrationComplete} />
      ) : (
        <>
          <Box sx={{ display: "flex", justifyContent: "space-between", p: 2 }}>
            <Box>
              <Typography
                variant="h4"
                sx={{
                  fontSize: { xs: "1.5rem", md: "2rem" },
                }}
              >
                User Management
              </Typography>
            </Box>
            <Box>
              {!editingRowId && (
                <Tooltip title="Create Employee / User">
                  <IconButton
                    variant="contained"
                    onClick={handleCreateCustomer}
                    sx={{
                      height: "40px",
                      backgroundColor: "pink",
                      marginRight: "10px",
                    }}
                  >
                    <AddIcon />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </Box>
          <Box
            sx={{ height: "60vh", display: "flex", flexDirection: "column" }}
          >
            <TableContainer
              component={Paper}
              sx={{
                maxHeight: "70vh",
                overflow: "auto",
                "& .MuiTable-root": {
                  tableLayout: "fixed",
                  width: "100%",
                },
              }}
            >
              <Table
                sx={{ minWidth: { xs: "100%", sm: 800 } }}
                aria-label="user management table"
              >
                <TableHead>
                  <TableRow>
                    <TableCell
                      sx={{
                        position: "sticky",
  top: 0,
  zIndex: 2,
  backgroundColor: "white",
  fontWeight: "bold",
  minWidth: "120px",     // ⭐ prevent collapse
  whiteSpace: "nowrap", 
                      }}
                    >
                      Username
                    </TableCell>
                    <TableCell
                      sx={{
                        position: "sticky",
  top: 0,
  zIndex: 2,
  backgroundColor: "white",
  fontWeight: "bold",
  minWidth: "120px",     // ⭐ prevent collapse
  whiteSpace: "nowrap", 
                      }}
                    >
                      Role
                    </TableCell>
                    <TableCell
                      sx={{
                        position: "sticky",
  top: 0,
  zIndex: 2,
  backgroundColor: "white",
  fontWeight: "bold",
  minWidth: "120px",     // ⭐ prevent collapse
  whiteSpace: "nowrap", 
                      }}
                    >
                      Email
                    </TableCell>
                    <TableCell
                      sx={{
                         position: "sticky",
  top: 0,
  zIndex: 2,
  backgroundColor: "white",
  fontWeight: "bold",
  minWidth: "120px",     // ⭐ prevent collapse
  whiteSpace: "nowrap", 
                      }}
                    >
                      First Name
                    </TableCell>
                    <TableCell
                      sx={{
                        position: "sticky",
  top: 0,
  zIndex: 2,
  backgroundColor: "white",
  fontWeight: "bold",
  minWidth: "120px",     // ⭐ prevent collapse
  whiteSpace: "nowrap", 
                      }}
                    >
                      Last Name
                    </TableCell>
                    <TableCell
                      sx={{
                        position: "sticky",
  top: 0,
  zIndex: 2,
  backgroundColor: "white",
  fontWeight: "bold",
  minWidth: "120px",     // ⭐ prevent collapse
  whiteSpace: "nowrap", 
                      }}
                    >
                      Phone
                    </TableCell>
                    <TableCell
                      sx={{
                          minWidth: "150px",
    position: "sticky",
    top: 0,
    zIndex: 3,
    backgroundColor: "white", 
                      }}
                    >
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow
                      key={user.user_id}
                      sx={{ "&:hover": { backgroundColor: "#f5f5f5" } }}
                    >
                      <TableCell
                       sx={{
    minWidth: "120px",
    whiteSpace: "normal",
    wordBreak: "break-word",
  }}>
                        {editingRowId === user.user_id ? (
                          <TextField
                            variant="standard"
                            fullWidth
                            size="small"
                            value={user.username}
                            onChange={(e) =>
                              handleFieldChange(
                                user.user_id,
                                "username",
                                e.target.value
                              )
                            }
                          />
                        ) : (
                          user.username
                        )}
                      </TableCell>
                      <TableCell
                       sx={{
    minWidth: "120px",
    whiteSpace: "normal",
    wordBreak: "break-word",
  }}>
                        {editingRowId === user.user_id ? (
                          <Box sx={{ marginLeft: "1%", marginRight: "1%" }}>
                            <Autocomplete
                              options={roleOptions}
                              getOptionLabel={(option) =>
                                option.role_name || "Unknown Role"
                              }
                              value={
                                roleOptions.find(
                                  (role) => role.role_name === user.role_type
                                ) || null
                              }
                              onChange={(event, newValue) => {
                                if (newValue) {
                                  setModifiedUsers((prev) => ({
                                    ...prev,
                                    [user.user_id]: {
                                      ...prev[user.user_id],
                                      role_type: newValue.role_name,
                                      role_id: newValue.role_id,
                                    },
                                  }));
                                }
                              }}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  variant="standard"
                                  fullWidth
                                />
                              )}
                            />
                          </Box>
                        ) : (
                          user.role_type
                        )}
                      </TableCell>
                      <TableCell
                       sx={{
    minWidth: "120px",
    whiteSpace: "normal",
    wordBreak: "break-word",
  }}>
                        {editingRowId === user.user_id ? (
                          <TextField
                            variant="standard"
                            fullWidth
                            size="small"
                            value={user.email}
                            onChange={(e) =>
                              handleFieldChange(
                                user.user_id,
                                "email",
                                e.target.value
                              )
                            }
                            onBlur={(e) =>
                              handleEmailBlur(user.user_id, e.target.value)
                            }
                          />
                        ) : (
                          user.email
                        )}
                      </TableCell>
                      <TableCell
                       sx={{
    minWidth: "120px",
    whiteSpace: "normal",
    wordBreak: "break-word",
  }}>
                        {editingRowId === user.user_id ? (
                          <TextField
                            variant="standard"
                            fullWidth
                            size="small"
                            value={user.firstName}
                            onChange={(e) =>
                              handleFieldChange(
                                user.user_id,
                                "firstName",
                                e.target.value
                              )
                            }
                          />
                        ) : (
                          user.firstName
                        )}
                      </TableCell>
                      <TableCell
                       sx={{
    minWidth: "120px",
    whiteSpace: "normal",
    wordBreak: "break-word",
  }}>
                        {editingRowId === user.user_id ? (
                          <TextField
                            variant="standard"
                            fullWidth
                            size="small"
                            value={user.lastName}
                            onChange={(e) =>
                              handleFieldChange(
                                user.user_id,
                                "lastName",
                                e.target.value
                              )
                            }
                          />
                        ) : (
                          user.lastName
                        )}
                      </TableCell>
                      <TableCell
                       sx={{
    minWidth: "120px",
    whiteSpace: "normal",
    wordBreak: "break-word",
  }}>
                        {editingRowId === user.user_id ? (
                          <TextField
                            variant="standard"
                            fullWidth
                            size="small"
                            value={user.phone}
                            onChange={(e) =>
                              handleFieldChange(
                                user.user_id,
                                "phone",
                                e.target.value
                              )
                            }
                          />
                        ) : (
                          user.phone
                        )}
                      </TableCell>
                      <TableCell
                       sx={{
    minWidth: "120px",
    whiteSpace: "normal",
    wordBreak: "break-word",
  }}>
                        {editingRowId === user.user_id ? (
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "flex-end",
                            }}
                          >
                            <Tooltip title="Cancel">
                              <IconButton
                                variant="contained"
                                onClick={handleCancel}
                              >
                                <CancelIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Submit">
                              <IconButton
                                variant="contained"
                                onClick={handleSubmit}
                              >
                                <SendIcon />
                              </IconButton>
                            </Tooltip>
                          </div>
                        ) : (
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "flex-end",
                            }}
                          >
                            <Tooltip title="Edit">
                              <IconButton
                                variant="contained"
                                onClick={() => setEditingRowId(user.user_id)}
                                disabled={editingRowId !== null}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <span>
                                <IconButton
                                  variant="contained"
                                  onClick={() =>
                                    handleDeleteClick(user.user_id)
                                  }
                                  disabled={
                                    editingRowId !== null ||
                                    rolename !== "Admin"
                                  }
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </span>
                            </Tooltip>
                            <Tooltip title="Reset Password">
                              <IconButton
                                variant="contained"
                                onClick={() =>
                                  handleOpenPasswordModal(user.user_id)
                                }
                                disabled={editingRowId !== null}
                              >
                                <LockResetIcon />
                              </IconButton>
                            </Tooltip>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </>
      )}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this user? This action cannot be
          undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="error">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={openPasswordModal} onClose={handleClosePasswordModal}>
        <DialogTitle>Reset Password</DialogTitle>
        <DialogContent>
          <TextField
            label="New Password"
            type="password"
            fullWidth
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            margin="dense"
          />
          <TextField
            label="Confirm Password"
            type="password"
            fullWidth
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            margin="dense"
          />
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            onClick={handleClosePasswordModal}
            color="primary"
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSavePassword}
            color="primary"
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
