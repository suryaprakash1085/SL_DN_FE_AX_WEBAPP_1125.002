"use client";

//? React and Next imports
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

import { State, City } from "country-state-city";

//? UI package imports
import {
  Box,
  Typography,
  Modal,
  TextField,
  Button,
  Autocomplete,
  Snackbar,
  Alert,
} from "@mui/material";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  maxWidth: 700,
  bgcolor: "background.paper",
  borderRadius: "12px", // Rounded corners for consistency
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)", // Subtle shadow
  p: 4,
};

let references = [
  { label: "Online", name: "Online" },
  { label: "Tele in ", name: "Tele in" },
  { label: "Telecalling out", name: "Telecalling out" },
  { label: "walk-in", name: "walk-in" },
  { label: "Customer reference", name: "Customer reference" },
];

const prefixOptions = [
  { name: "Mr." },
  { name: "Ms." },
  { name: "Mrs." },
  { name: "M/S" },
];

// const addcustomerssOptions = [
//   { name: "Durga" },
//   { name: "Raji" },
//   { name: "Vidya" },
// ];

const type = [
  { name: "Lead" },
  { name: "BlackList" },
  // {name :"Customer"},
  { name: "Customer Sales" },
  { name: "Customer Service" },
];

const userName = Cookies.get("userName");
const userRole = Cookies.get("role");

export default function CreateUpdateModal({
  openCreateUpdateModal,
  setOpenCreateUpdateModal,
  details,
  data,
  stateOptions,
  cityOptions,
  url,
  row,
  method,
  disabledFields = [],
  onAddSuccess,
}) {
  const router = useRouter();
  const idKey = data
    ? Object.keys(data).find((key) => key.toLowerCase().endsWith("id"))
    : null;
  const idValue = idKey ? data[idKey] : "N/A";

  // console.log({ data });
  // Modal and Alert states

  //? FrontEnd form input states
  const [name, setName] = React.useState("");

  const [selectedType, setSelectedType] = React.useState(null);
  const [selectedState, setSelectedState] = React.useState(null);
  const [selectedCity, setSelectedCity] = React.useState(null);
  const [cities, setCities] = React.useState([]);
  const [token, setToken] = React.useState(null);
  const [refer, setRefer] = React.useState(null);
  const [prefix, setprefix] = React.useState(null);
  const [addcustomerssOptions, setaddcustomerssOptions] = useState([]);

  const [addcustomers, setaddcustomers] = React.useState(null);
  // const [selectedLead, setSelectedLead] = React.useState(null);

  //? State for managing form data
  const [formData, setFormData] = useState({
    leadsOwner: "", // Initial empty field for leads owner
  });
  //? Modal and ALert States
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const [selectedLead, setSelectedLead] = React.useState(null);
 
  useEffect(() => {
    const token = Cookies.get("token");
    setToken(token);
  }, []);

  useEffect(() => {
    setFormData(data);
  }, [data]);

  const fetchLeadOwner = async function () {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL
        }/auth/users`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      // console.log({ custData: data });

      if (response.ok) {
        // // Sort the filtered results
        // const sortedData = data.sort((a, b) => {
        //   if (a.type === "Blocklisted" && b.type !== "Blocklisted") return 1;
        //   if (a.type !== "Blocklisted" && b.type === "Blocklisted") return -1;
        //   return 0;
        // });
        const LeadArray = data.map(element => ({
          name: element.username,
          userid: element.user_id
          }));
       
        setaddcustomerssOptions(LeadArray)
        // setaddcustomerssOptions(data);
        // console.log({ setRows });
      } else {
        setaddcustomerssOptions([]);
      }
    } catch (error) {
      setaddcustomerssOptions([]);
      const alertData = {
        openAlert: true,
        message: "Error fetching User List. Please try again.",
        severity: "error",
        duration: 2000,
      };
      // showAlert(alertData);
    }
  }
  const handleInputChange = (key, value) => {
    // Validation for name fields
    // if (key.toLowerCase().includes("name")) {
    //   value = value.replace(/[^a-zA-Z\s]/g, ""); // Allow only alphabets and spaces
    // }

    // if (key.toLowerCase().includes("name")) {
    //   value = value.replace(/[^a-zA-Z\s]/[^0-9]/g, "");

    // }

    // Validation for number fields or phone

     if (key.toLowerCase().includes("name")) {
    value = value.replace(/[^a-zA-Z\s]/g, ""); // Allow only alphabets and spaces
  }
    if (key.toLowerCase().includes("phone" || "number")) {
      value = value.replace(/[^0-9]/g, "").slice(0, 10); // Allow only numbers, max length 10
    }

    if (key.toLowerCase().includes("mail")) {
      value = value.replace(/[^a-zA-Z0-9@._-]/g, ""); // Allow only alphabets, numbers, @, ., _ and -
    }

    if (key.toLowerCase().includes("street")) {
      value = value.replace(/[^a-zA-Z0-9\s/_-]/g, ""); // Allow only alphabets, numbers and spaces and /, -, _
    }

    setFormData((prevData) => ({
      ...prevData,
      [key]: value,
    }));
    
  };

  const handleStateChange = (event, state) => {
    if (state) {
      // Clear previous cities and set new ones
      setCities([]);
      const citiesData = City.getCitiesOfState("IN", state.isoCode).map(
        (city) => ({
          ...city,
          label: city.name,
        })
      );
      setCities(citiesData);
      
      // Reset the selected city when state changes
      setSelectedCity(null);
      
      // Update the state
      setSelectedState(state);
      
      // Update form data with new state and clear city
      setFormData(prevData => ({
        ...prevData,
        state: state.name,
        city: '' // Clear the city when state changes
      }));
    } else {
      // If no state is selected, clear everything
      setCities([]);
      setSelectedState(null);
      setSelectedCity(null);
      setFormData(prevData => ({
        ...prevData,
        state: '',
        city: ''
      }));
    }
  };

  useEffect(() => {
    if (data && data.state) {
      const state = stateOptions.find((option) => option.name === data.state);
      if (state) {
        setSelectedState(state);
        
        // Clear previous cities before setting new ones
        setCities([]);
        const citiesData = City.getCitiesOfState("IN", state.isoCode).map(
          (city) => ({
            ...city,
            label: city.name,
          })
        );
        setCities(citiesData);

        // Only set the city if it exists in the new cities list
        const initialCity = citiesData.find((city) => city.name === data.city);
        setSelectedCity(initialCity || null);
        
        // Update form data
        setFormData(prevData => ({
          ...prevData,
          state: state.name,
          city: initialCity ? initialCity.name : ''
        }));
      }
    } else {
      // Clear everything if no state in data
      setSelectedState(null);
      setSelectedCity(null);
      setCities([]);
      setFormData(prevData => ({
        ...prevData,
        state: '',
        city: ''
      }));
    }
  }, [data, stateOptions]);

  const handleSave = async () => {
    event.preventDefault();
    // Clear previous errors
    let errors = [];

    //  Check Customer Name
    if (!formData.customer_name) {
      errors.push("Customer Name is required");
    }

    //  Check Phone Number
  if (!formData.phone) {
  errors.push("Phone Number is required");
} else if (formData.phone.length !== 10) {
  errors.push("Phone Number must be exactly 10 digits");
}

    //  Check State
    if (!selectedState) {
      errors.push("State is required");
    }

    //  Check City
    if (!selectedCity) {
      errors.push("City is required");
    }

    //  Check Street
    if (!formData.street) {
      errors.push("Street is required");
    }

    //  Check Reference
    if (!formData.reference) {
      errors.push("Reference is required");
    }
    //  Check Reference
    if (!formData.prefix) {
      errors.push("prefix is required");
    }

    //  Check Referred By if Reference is "Customer Reference"
    if (refer?.label === "Customer reference" && !formData.referred_by) {
      errors.push("Referred By is required");
    }

    //  Now Check If Any Errors Exist
    if (errors.length > 0) {
      // Combine All Errors in One Message
      setSnackbarMessage(errors.join(", "));
      setSnackbarOpen(true);
      console.log(" Validation Failed! Errors:", errors);
      return;
    }

    //  Combine Ms + Customer Name
    let fullName = "";
    if (refer && refer.name) {
      fullName = `${formData.customer_name}`;
    } else {
      fullName = formData.customer_name;
    }

    //  Construct Data to Send
    const dataToSend = {
      ...formData,
      prefix: prefix ? prefix.name : "",
      customer_name: fullName, //  This will have "Mr. John Doe" or "Ms. Sara Smith"
      state: selectedState ? selectedState.name : null,
      city: selectedCity ? selectedCity.name : null,
      // person:
    };

    //  This Will Always Print Final Data Before API Call
    const LeadUserid = addcustomerssOptions.find((option) => option.name === formData.leads_owner);
    dataToSend.leads_owner = LeadUserid?.userId || Cookies.get("userId") || "";;
    // console.log("Final Data to Send:", dataToSend);

    try {
      const fetchUrl = method === "POST" ? url : `${url}/${idValue}`;
      // console.log({url});
      const response = await fetch(fetchUrl, {
        method: method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save data");
      }

      const result = await response.json();
      const newRow = {
        ...dataToSend,
        customer_id: result.customer_id || idValue,
      };

      onAddSuccess(newRow);
      setOpenCreateUpdateModal(false);
    } catch (error) {
      console.log(" Error saving data:", error);
      setSnackbarMessage(error.message);
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const resetFormFields = () => {
    setprefix(null);
    setRefer(null);
    setSelectedLead(null);
    setFormData(prevData => ({
      ...prevData,
      prefix: '',
      reference: '',
      type: ''
    }));
  };

  useEffect(() => {
    if (!openCreateUpdateModal) {
      resetFormFields();
    }
  }, [openCreateUpdateModal]);

  return (
    <>
      <Modal
        open={openCreateUpdateModal}
        // onClose={() => setOpenCreateUpdateModal(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography
            id="modal-modal-title"
            variant="h6"
            component="h2"
            sx={{
              fontWeight: "bold",
              fontSize: "1.25rem",
              color: "#333",
            }}
          >
            {details.action} {details.name}
          </Typography>

          <Typography
            id="modal-modal-description"
            sx={{
              mt: 2,
              fontSize: "1rem",
              color: "#555",
              lineHeight: "1.5",
            }}
          >
            Please enter the required details below:
          </Typography>

          <Typography
            id="modal-modal-description"
            sx={{
              mt: 2,
              fontSize: "1rem",
              color: "#555",
              lineHeight: "1.5",
            }}
          >
            <strong>Leads Owner:</strong> {data.leads_owner ||  Cookies.get("userName")}
          </Typography>

          {/* Form Fields */}
          <Box sx={{ mt: 3, display: "flex", flexWrap: "wrap", gap: 1 }}>
            {/*  2. Ms. Field */}

            {/*  4. Other Dynamic Fields */}
            {formData &&
              Object.keys(formData).map((key, index) => {

                 if (key === "leads_owner") {
                  return (
                    <Autocomplete
                      key={index}
                      size="small"
                      disabled={userRole !== "Supervisor"}
                      disablePortal
                      options={addcustomerssOptions}
                      getOptionLabel={(option) => option?.name || ""}
                      isOptionEqualToValue={(option, value) => option?.name === value?.name}
                      onChange={(event, newValue) => {
                        handleInputChange("leads_owner", newValue ? newValue.name : "");
                      }}
                      value={
                        addcustomerssOptions.find(option => option.name === formData[key]) ||
                        (Cookies.get("userName") ? { name: Cookies.get("userName") } : null)
                      }
                      sx={{
                        mb: 2,
                        borderRadius: "8px",
                        width: "49%",
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Leads Owner"
                          
                        />
                      )}
                    />

                  );
                }


                 else if (key === "prefix") {
                  return (
                    <Autocomplete
                      key={index}
                      size="small"
                      disablePortal
                      options={prefixOptions}
                      getOptionLabel={(option) => option.name}
                      isOptionEqualToValue={(option, value) =>
                        option.name === value.name
                      }
                      onChange={(event, newValue) => {
                        setprefix(newValue);
                        handleInputChange(
                          "prefix",
                          newValue ? newValue.name : ""
                        );
                      }}
                      value={formData.prefix ? { name: formData.prefix } : null}
                      sx={{
                        mb: 2,
                        borderRadius: "8px",
                        width: "49%",
                      }}
                      renderInput={(params) => (
                        <TextField {...params} label="prefix" />
                      )}
                    />
                  );
                }

                // else if (key === "addcustomers") {
                //   return (
                //     <Autocomplete
                //       key={index}
                //       size="small"
                //       disablePortal
                //       options={addcustomerssOptions}
                //       getOptionLabel={(option) => option.name}
                //       isOptionEqualToValue={(option, value) =>
                //         option.name === value.name
                //       }
                //       onChange={(event, newValue) => {
                //         setaddcustomers(newValue);
                //         handleInputChange("addcustomers", newValue ? newValue.name : "");
                //       }}
                //       value={addcustomers || null}
                //       sx={{
                //         mb: 2,
                //         borderRadius: "8px",
                //         width: "49%",
                //       }}
                //       renderInput={(params) => (
                //         <TextField {...params} label="addcustomers" />
                //       )}
                //     />
                //   );
                // }


                
              
                else if (key === "state") {
                  return (
                    <Autocomplete
                      key={index}
                      size="small"
                      disablePortal
                      options={stateOptions}
                      onChange={(event, newValue) => {
                        handleStateChange(event, newValue);
                        handleInputChange(key, newValue ? newValue.name : "");
                      }}
                      value={
                        selectedState ||
                        stateOptions?.find(
                          (option) => option.name === formData[key]
                        ) ||
                        null
                      }
                      sx={{
                        mb: 2,
                        borderRadius: "8px",
                        width: "49%",
                      }}
                      renderInput={(params) => (
                        <TextField {...params} label="State" />
                      )}
                    />
                  );
                } else if (key === "city") {
                  return (
                    <Autocomplete
                      key={index}
                      size="small"
                      disablePortal
                      options={cities}
                      onChange={(event, newValue) => {
                        setSelectedCity(newValue);
                        handleInputChange(key, newValue ? newValue.name : "");
                      }}
                      value={selectedCity}
                      sx={{
                        mb: 2,
                        borderRadius: "8px",
                        width: "49%",
                      }}
                      renderInput={(params) => (
                        <TextField 
                          {...params} 
                          label="City"
                          // error={Boolean(selectedState && !selectedCity && formData.state)}
                          // helperText={selectedState && !selectedCity && formData.state ? "Please select a city" : ""}
                        />
                      )}
                    />
                  );
                } else if (key === "reference") {
                  return (
                    <Autocomplete
                      key={index}
                      size="small"
                      disablePortal
                      options={references}
                      getOptionLabel={(option) => option.name}
                      isOptionEqualToValue={(option, value) =>
                        option.name === value.name
                      }
                      onChange={(event, newValue) => {
                        setRefer(newValue);
                        handleInputChange(key, newValue ? newValue.name : "");
                      }}
                      value={formData.reference ? { name: formData.reference, label: formData.reference } : null}
                      sx={{
                        mb: 2,
                        borderRadius: "8px",
                        width: "49%",
                      }}
                      renderInput={(params) => (
                        <TextField {...params} label="Reference" />
                      )}
                    />
                  );
                } else if (
                  refer?.label === "Customer reference" &&
                  key === "referred_by"
                ) {
                  return (
                    <TextField
                      key={index}
                      size="small"
                      label={key}
                      variant="outlined"
                      fullWidth
                      value={formData[key]}
                      onChange={(e) => handleInputChange(key, e.target.value)}
                      sx={{
                        mb: 2,
                        borderRadius: "8px",
                        width: "49%",
                      }}
                      disabled={disabledFields.includes(key)}
                    />
                  );
                } else if (refer !== "cust" && key === "referred_by") {
                  return <div key={index}></div>;
                } else if (key === "type") {
                  return (
                    <Autocomplete
                      key={index}
                      size="small"
                      disablePortal
                      options={type}
                      getOptionLabel={(option) => option.name}
                      isOptionEqualToValue={(option, value) =>
                        option.name === value.name
                      }
                      onChange={(event, newValue) => {
                        setSelectedLead(newValue);
                        handleInputChange(
                          "type",
                          newValue ? newValue.name : ""
                        );
                      }}
                      value={formData.type ? { name: formData.type } : null}
                      sx={{
                        mb: 2,
                        borderRadius: "8px",
                        width: "49%",
                      }}
                      renderInput={(params) => (
                        <TextField {...params} label="Type" />
                      )}
                    />
                  );
                } else {
                  return (
                    <TextField
                      key={index}
                      size="small"
                      label={key}
                      variant="outlined"
                      fullWidth
                      value={formData[key]}
                      onChange={(e) => handleInputChange(key, e.target.value)}
                      sx={{
                        mb: 2,
                        borderRadius: "8px",
                        width: "49%",
                      }}
                      disabled={disabledFields.includes(key)}
                    />
                  );
                }
              })}
          </Box>

          {/* Action Buttons */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",
              mt: 2,
            }}
          >
            <Button
              onClick={() => {
                resetFormFields();
                setOpenCreateUpdateModal(false);
              }}
              color="primary"
              variant="outlined"
              sx={{
                textTransform: "none",
                fontWeight: "bold",
                borderRadius: "8px",
                padding: "8px 16px",
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              color="primary"
              variant="contained"
              sx={{
                textTransform: "none",
                fontWeight: "bold",
                borderRadius: "8px",
                padding: "8px 16px",
              }}
            >
              Save
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Snackbar for error messages */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity="error"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
}
