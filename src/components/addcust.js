"use client";
// import Cookies from "js-cookie";
// React and Next imports
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Cookies from "js-cookie";
import { faker } from "@faker-js/faker";

// UI package imports - Alphabetical
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  FormControl,
  FormControlLabel,
  FormLabel,
  IconButton,
  Paper,
  Radio,
  RadioGroup,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";

import { Close } from "@mui/icons-material";

// let references = [
//   { label: "Google", name: "Google" },
//   { label: "JustDial", name: "JustDial" },
//   { label: "Person", name: "Person" },
// ];

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

export default function AddCustomer({ onSuccess, onClose }) {
  // FrontEnd extracted data states
  const router = useRouter();
  const [salesType, setSalesType] = useState("customer");
  const [openSalesTypeModal, setOpenSalesTypeModal] = useState(true);

  // Modal and Alert states
  const [activeStep, setActiveStep] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarSeverity, setSnackbarSeverity] = useState("error");
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarPosition] = useState({
    vertical: "bottom",
    horizontal: "right",
  });

  // FrontEnd form input states - Customer Info
  const [customerName, setCustomerName] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [gstCustomer, setGstCustomer] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  // Address states
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("Sivakasi");
  const [state, setState] = useState("Tamil Nadu");
  const [zip, setZip] = useState("");

  // Vehicle states
  const [plateNumber, setPlateNumber] = useState("");
  const [isPlateNumberHidden, setIsPlateNumberHidden] = useState(false);
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [vin, setVin] = useState("");
  const [fuelType, setFuelType] = useState("");

  // Appointment states
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [status, setStatus] = useState("scheduled");
  const [telecaller, setTelecaller] = useState("self");
  const [notes, setNotes] = useState("");

  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedState, setSelectedState] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [stateCityData, setStateCityData] = useState({});

  const [prefix, setPrefix] = useState(null);

  const [refer, setRefer] = useState(null);
  const [referBy, setReferBy] = useState("");
  const [companyDetails, setCompanyDetails] = useState(null);

  // Add new state for makes and models
  const [makes, setMakes] = useState([]);
  const [models, setModels] = useState([]);

  const [registrationDate, setRegistrationDate] = useState("");
  const [chassisNumber, setChassisNumber] = useState("");
  const [engineNumber, setEngineNumber] = useState("");
  const [chassisError, setChassisError] = useState("");
  const [engineError, setEngineError] = useState("");

  const [oneTimeCustomer, setOneTimeCustomer] = useState(false);

  useEffect(() => {
    const now = new Date();
    setAppointmentDate(now.toISOString().split("T")[0]);
    setAppointmentTime(now.toTimeString().slice(0, 5));
  });

  // Fetch state/city data from API on mount
  useEffect(() => {
    const fetchStateCityData = async () => {
      try {
        const token = Cookies.get("token"); // Or however you store your JWT
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/citystate`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error("Failed to fetch state/city data");
        const data = await response.json();
        setStateCityData(data);
        setStates(Object.keys(data));
      } catch (error) {
        setErrorMessage("Could not load state/city data");
      }
    };
    fetchStateCityData();
  }, []);

  const fetchVehicles = async (token, setModels, setMakes) => {
    try {
      if (!token) throw new Error("Token is missing");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/vehicles`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch vehicles");

      //  Convert response to JSON
      const data = await response.json();

      //  Extract Makes and Models
      const makes = data.map((item) => ({
        id: item.id,
        make_name: item.make_name,
        models: item.models.split(","),
      }));

      //  Set Makes and Models
      setMakes(makes);
    } catch (error) {
      console.error("Error fetching vehicles:", error.message);
    }
  };

  useEffect(() => {
    // Fetch makes and models data
    fetchVehicles(Cookies.get("token"), setModels, setMakes);
  }, []);

  // When state changes, update cities
  const handleStateChange = (event, value) => {
    setSelectedState(value);
    if (value && stateCityData[value]) {
      setCities(stateCityData[value]);
    } else {
      setCities([]);
    }
    setSelectedCity(null);
  };

  const handleCityChange = (event, value) => {
    setSelectedCity(value);
  };

  const validateYear = () => {
    const yearPattern = /^\d{4}$/;
    const currentYear = new Date().getFullYear();

    if (year && (!yearPattern.test(year) || parseInt(year) > currentYear)) {
      setSnackbarMessage("Please enter a valid year (past or present only)");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return false;
    }
    return true;
  };

  const validateStep = () => {
    const plateNumberPattern = /^[A-Z]{2}[0-9]{2}[A-Z -]{0,2}[0-9]{4}$/;
    const gstPattern =
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/;
    const errorMessages = [];

    if (activeStep === 0) {
      if (!customerName) errorMessages.push("Customer Name");
      if (!phone || phone.length !== 10) errorMessages.push("Phone");
      if (!street) errorMessages.push("Street");

      if (gstCustomer && !gstNumber) {
        errorMessages.push("GST Number");
      } else if (gstCustomer && !gstPattern.test(gstNumber)) {
        errorMessages.push("Invalid GST Number");
      }
      if (!city) errorMessages.push("City");
      if (!state) errorMessages.push("State");
      if (!refer) errorMessages.push("Reference");
    } else if (activeStep === 1 && salesType === "customer") {
      if (
        !isPlateNumberHidden &&
        (!plateNumber || !plateNumberPattern.test(plateNumber))
      ) {
        errorMessages.push("Valid Plate Number");
      }
      if (!make) errorMessages.push("Make");
      if (!fuelType) errorMessages.push("Fuel Type");
      if (!model) errorMessages.push("Model");

      if (!validateYear()) {
        return false;
      }
    }

    if (errorMessages.length > 0) {
      setSnackbarMessage(
        `Please correct the following:\n${errorMessages.join("\n")}`
      );
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return false;
    }

    return true;
  };

  const handleNext = (phone, email, customerName, street, zip) => {
    const indianPhoneRegex =
      /^(\+91|91)?\s?-?\(?[6-9]\d{2}\)?\s?-?\d{3}\s?-?\d{4}$/;

    const onlyAlphabets = /^[a-zA-Z\s]+$/;

    const numberOnly = /^[0-9]{6}$/;

    const streetValid = /^[a-zA-Z0-9\s,/-]*$/;

    const emailValid = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!phone || !indianPhoneRegex.test(phone)) {
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      setSnackbarMessage("Invalid phone number");
    } else if (!customerName) {
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      setSnackbarMessage("Customer Name Is Mandatory");
    } else if (email && !emailValid.test(email)) {
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      setSnackbarMessage("Invalid email address");
    } else if (zip && !numberOnly.test(zip)) {
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      setSnackbarMessage("Please enter a valid pin code");
    } else if (!street || !streetValid.test(street)) {
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      setSnackbarMessage("Invalid characters in street name");
    } else {
      if (validateStep()) {
        setActiveStep((prevStep) => prevStep + 1);
      }
    }
  };

  const handleBack = () => {
    setErrorMessage("");
    if (activeStep > 0) {
      setActiveStep((prevStep) => prevStep - 1);
    }
  };

  const handleFinish = async () => {
    if (!year) {
      setSnackbarOpen(true);
      setSnackbarMessage("Year is required");
      setSnackbarSeverity("error");
      return;
    }
    if (!refer) {
      setSnackbarOpen(true);
      setSnackbarMessage("Reference is required");
      setSnackbarSeverity("error");
      return;
    }
    if (!street) {
      setSnackbarOpen(true);
      setSnackbarMessage("Street is required");
      setSnackbarSeverity("error");
      return;
    }



    if (validateStep()) {
      // if oneTimeCustomer, add one_time: true
      const customerData = {
        one_time: oneTimeCustomer,
        leads_owner: Cookies.get("userId") || "",
        prefix: prefix?.name || "",
        customer_name: customerName,
        gstNumber: gstNumber,
        sales_type: salesType,
        contact: {
          phone: phone,
          email: email,
          address: {
            street: street,
            city: selectedCity || city,
            state: selectedState || state,
            zip: zip,
          },
        },
        reference: refer?.label,
        referred_by: referBy,
        vehicles:
          salesType === "customer" || (make && model)
            ? [
              {
                registration_date: registrationDate,
                chassis_number: chassisNumber,
                engine_number: engineNumber,
                plate_number: plateNumber,
                make: make,
                model: model,
                fuelType: fuelType,
                year: parseInt(year, 10),
                vin: vin || "",
                address: {
                  street: street,
                  city: selectedCity || city,
                  state: selectedState || state,
                  zip: zip,
                },
              },
            ]
            : [],
      };

      const token = Cookies.get("token");

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/customer`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(customerData),
          }
        );

        const result = await response.json();

        if (result.error) {
          setSnackbarOpen(true);
          setSnackbarMessage(result.error);
          setSnackbarSeverity("error");
        } else {
          setSnackbarOpen(true);
          setSnackbarMessage("Customer Created Successfully");
          setSnackbarSeverity("success");

          // Reset form fields
          setActiveStep(0);
          setCustomerName("");
          setPhone("");
          setEmail("");
          setStreet("");
          setCity("");
          setState("");
          setZip("");

          if (salesType === "counterSales") {
            // For counter sales, generate counter sale and redirect
            const counterSaleResult = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/countertopsales/add_countersales`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  name: customerName,
                  phone: phone,
                  gst: gstNumber || "",
                  street: street,
                  customer_id: result.customer_id,
                }),
              }
            );

            const counterData = await counterSaleResult.json();
            if (counterData) {
              router.push(`/views/shoppingcart/${counterData.appointment_id}`);
            }
          } else {
            // For regular customers, handle appointment and redirect
            handleAddAppointment(
              result.customer_id,
              result.vehicle_id,
              appointmentDate,
              appointmentTime,
              status,
              telecaller,
              notes
            );
          }

          if (onClose) onClose();
        }
      } catch (error) {
        console.log("my error", error);
        setSnackbarOpen(true);
        setSnackbarMessage(
          error.error ? error.error : "Error creating customer"
        );
        setSnackbarSeverity("error");
      }
    }
  };

  const handlePhoneChange = (e) => {
    const newValue = e.target.value.replace(/\D/g, "");
    if (newValue.length <= 10) {
      setPhone(newValue);
    }
  };

  const handleEmailChange = (e) => {
    const emailValue = e.target.value;
    setEmail(emailValue);
  };

  const handleEmailBlur = () => {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (email && !emailPattern.test(email)) {
      setErrorMessage("Improper Email format");
    } else {
      setErrorMessage("");
    }
  };

  const validateNumberPlate = () => {
    const numberPlatePattern = /^[A-Z]{2}[0-9]{2}[A-Z -]{0,2}[0-9]{4}$/;

    if (plateNumber && !numberPlatePattern.test(plateNumber)) {
      setErrorMessage("Invalid Number Plate");
    } else {
      setErrorMessage("");
    }
  };

  const handleCheckboxChange = (e) => {
    setIsPlateNumberHidden(!isPlateNumberHidden);
    if (!isPlateNumberHidden) {
      setPlateNumber("For Registration");
    } else {
      setPlateNumber("");
    }
  };

  const handleAddAppointment = async (
    custId,
    plateNumber,
    appointmentDate,
    appointmentTime,
    status,
    telecaller,
    notes
  ) => {
    const appointmentPayload = {
      customer_id: custId,
      vehicle_id: plateNumber,
      appointment_date: appointmentDate,
      appointment_time: appointmentTime,
      status,
      telecaller,
      notes,
    };

    try {
      const token = Cookies.get("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/appointment`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(appointmentPayload),
        }
      );

      const data = await response.json();

      console.log({ apppaignaofng: data });

      const AppointmentId = data.AppointmentsArray.appointment_id;
      router.push(`/views/jobCard/${AppointmentId}`);
    } catch (err) {
      setSnackbarMessage("Failed to add appointment. Please try again.");
    }
  };

  const handleFuelTypeChange = (e) => {
    setFuelType(e.target.value);
  };

  const handleMakeChange = (value) => {
    setMake(value);
    setModel("");

    // Find the selected make in state
    const selectedMake = makes.find((item) => item.make_name === value);

    // Set models based on make
    if (selectedMake) {
      setModels(selectedMake.models);
    } else {
      setModels([]);
    }
  };

  // const validateChassisNumber = (value) => {
  //   if (value.length !== 17) {
  //     return "Chassis number must be exactly 17 characters.";
  //   }
  //   if (!/^[A-HJ-NPR-Z0-9]*$/.test(value)) {
  //     return "Only A-Z (except I, O, Q) and 0-9 are allowed.";
  //   }
  //   return "";
  // };

  // const validateEngineNumber = (value) => {
  //   if (value.length !== 17) {
  //     return "Engine number must be exactly 17 characters.";
  //   }
  //   if (!/^[A-HJ-NPR-Z0-9]*$/.test(value)) {
  //     return "Only A-Z (except I, O, Q) and 0-9 are allowed.";
  //   }
  //   return "";
  // };

  // const handleChassisNumberChange = (e) => {
  //   const value = e.target.value;
  //   setChassisNumber(value);
  //   setChassisError(validateChassisNumber(value)); // Validate on input change
  // };

  // const handleEngineNumberChange = (e) => {
  //   const value = e.target.value;
  //   setEngineNumber(value);
  //   setEngineError(validateEngineNumber(value)); // Validate on input change
  // };

  // const getCookie = (name) => {
  //   const cookieString = document.cookie
  //     .split("; ")
  //     .find((row) => row.startsWith(`${name}=`));
  //   return cookieString ? cookieString.split("=")[1] : null;
  // };

  const username = Cookies.get("userName");

  const handleSalesTypeSelect = (type) => {
    setSalesType(type);
    setOpenSalesTypeModal(false);
  };

  const handleClose = () => {
    setOpenSalesTypeModal(false);
    if (onClose) onClose();
  };

  // // --- RANDOM DATA GENERATION LOGIC ONLY ---
  // useEffect(() => {
  //   if (oneTimeCustomer) {
  //     // Generate plain 10-digit phone number (e.g., 1234567891)
  //     setPhone(
  //       Array.from({ length: 10 }, () => Math.floor(Math.random() * 10)).join("")
  //     );
  //     setEmail(faker.internet.email());
  //     setStreet(faker.location.streetAddress());
  //     setZip(faker.location.zipCode('######'));

  //     // Pick random state/city from loaded data if available
  //     if (states.length > 0) {
  //       const randState = faker.helpers.arrayElement(states);
  //       setSelectedState(randState);

  //       // Find cities for the selected state
  //       let cityList = [];
  //       if (
  //         typeof stateCityData === "object" &&
  //         stateCityData !== null &&
  //         stateCityData[randState]
  //       ) {
  //         cityList = stateCityData[randState];
  //       } else if (Array.isArray(cities) && cities.length > 0) {
  //         cityList = cities;
  //       }
  //       if (cityList.length > 0) {
  //         const randCity = faker.helpers.arrayElement(cityList);
  //         setCities(cityList);
  //         setSelectedCity(randCity);
  //       }
  //     }

  //     // Vehicle
  //     if (makes.length > 0) {
  //       const randMake = faker.helpers.arrayElement(makes);
  //       setMake(randMake.make_name || randMake);
  //       if (randMake.models && randMake.models.length > 0) {
  //         setModels(randMake.models);
  //         setModel(faker.helpers.arrayElement(randMake.models));
  //       }
  //     }
  //     setYear(faker.date.past({ years: 20 }).getFullYear().toString());
  //     setVin(faker.vehicle.vin());
  //     // Generate plate number: 2 random letters + 95x + 4 random digits
  //     const platePrefix = faker.string.alpha({ length: 2, casing: "lower" });
  //     const plateDigits = faker.string.numeric(4);
  //     const final = `${platePrefix}95x${plateDigits}`;
  //     setPlateNumber(final.toUpperCase());
  //     setRegistrationDate(
  //       faker.date.past({ years: 2 }).toISOString().split("T")[0]
  //     );
  //     setChassisNumber(faker.string.alphanumeric(17).toUpperCase());
  //     setEngineNumber(faker.string.alphanumeric(17).toUpperCase());
  //     setFuelType(faker.helpers.arrayElement(["petrol", "diesel"]));
  //     setRefer(faker.helpers.arrayElement(references));
  //     setReferBy(faker.person.fullName());
  //     setGstCustomer(false);
  //     setGstNumber("");
  //   }
  //   // eslint-disable-next-line
  // }, [oneTimeCustomer, states, cities, makes, stateCityData]);

  // In your useEffect for autofill, update as below:
  useEffect(() => {
    if (oneTimeCustomer && companyDetails) {
      // Only fill phone number from company details
      setPhone(companyDetails.company_phone_number || "");
      // Do not fill email or vehicle details
      setStreet("Thiruthangal Road");
      setCity("Sivakasi");
      setState("Tamil Nadu");
      setZip("");
      setSelectedState("Tamil Nadu");
      setSelectedCity("Sivakasi");
      setGstCustomer(true);
      setGstNumber(companyDetails.company_gst || "");
      setRefer("walkin");
      setReferBy("");
      setPrefix(null);
      // Do not fill make, model, year, vin, plateNumber, registrationDate, chassisNumber, engineNumber, fuelType, or email
      setEmail("none");
      setMake("none");
      setModel("none");
      setYear((new Date().getFullYear()).toString());
      setVin("");
      setPlateNumber("");
      setRegistrationDate("");
      setChassisNumber("");
      setEngineNumber("");
      setFuelType("none");
    }
    // eslint-disable-next-line
  }, [oneTimeCustomer, companyDetails]);

  // Generate random plate number if new vehicle ticked (isPlateNumberHidden)
  useEffect(() => {
    if (oneTimeCustomer && isPlateNumberHidden) {
      // Generate random plate number like "for-regn-2829"
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      setPlateNumber(`for-regn-${randomNum}`);
    } else if (oneTimeCustomer && !isPlateNumberHidden) {
      setPlateNumber("");
    }
    // eslint-disable-next-line
  }, [isPlateNumberHidden, oneTimeCustomer]);

  // Fetch company details from /ss on mount
  useEffect(() => {
    const fetchCompanyDetails = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ss`);
        const data = await response.json();
        if (data && data.company_details && data.company_details.length > 0) {
          setCompanyDetails(data.company_details[0]);
        }
      } catch (err) {
        // Optionally handle error
      }
    };
    fetchCompanyDetails();
  }, []);

  return (
    <div>
      <Dialog open={openSalesTypeModal}>
        <DialogContent>
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <IconButton aria-label="close" onClick={handleClose}>
              <Close />
            </IconButton>
          </Box>
          <Typography variant="h5" gutterBottom>
            Select Sales Type
          </Typography>

          <Box display="flex" gap={2}>
            <Button
              size="small"
              variant="contained"
              onClick={() => handleSalesTypeSelect("customer")}
              fullWidth
            >
              Appointment
            </Button>
            <Button
              variant="contained"
              onClick={() => handleSalesTypeSelect("counterSales")}
              fullWidth
            >
              Counter Sales
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      <Box marginTop="1rem" style={{ overflowY: "auto" }}>
        {/* Hide all fields if oneTimeCustomer is true */}
        {!oneTimeCustomer && activeStep === 0 && (
          <div>
            <h1>Add New Customer:</h1>

            <h4>LeadOwer: {username ? username : "Guest"}</h4>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "flex-start",
                alignItems: "center",
              }}
            >
              <Typography>Is Customer Entitled for GST?</Typography>
              <Checkbox
                size="small"
                checked={gstCustomer}
                onChange={e => setGstCustomer(e.target.checked)}
                disabled={oneTimeCustomer}
              />
              {/* One Time Customer Checkbox on the right, same line */}
              <FormControlLabel
                control={
                  <Checkbox
                    checked={oneTimeCustomer}
                    onChange={e => setOneTimeCustomer(e.target.checked)}
                    size="small"
                  />
                }
                label="One Time Customer"
                sx={{ marginLeft: 2, fontSize: "0.9rem" }}
              />
            </div>

            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              {/* Prefix Field */}
              <Autocomplete
                options={prefixOptions}
                getOptionLabel={(option) => option.name || ""}
                isOptionEqualToValue={(option, value) =>
                  option.name === value?.name
                }
                onChange={(e, value) => setPrefix(value || null)}
                value={prefix}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Prefix"
                    size="small"
                    required
                    fullWidth
                  />
                )}
                sx={{
                  width: gstCustomer ? "33.33%" : "50%",
                  paddingBottom: "1px",
                }}
              />

              {/* Customer Name Field */}
              <TextField
                required
                label="Customer Name"
                size="small"
                variant="outlined"
                margin="normal"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                sx={{ width: gstCustomer ? "33.33%" : "50%" }}

              />

              {/* GST Number Field - Only shown when GST is enabled */}
              {gstCustomer && (
                <TextField
                  required
                  label="GST Number"
                  size="small"
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  value={gstNumber}
                  onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                  sx={{ width: "33.33%" }}
                />
              )}
            </div>

            <Box display="flex" justifyContent="space-between" marginY="normal">
              <TextField
                required
                label="Phone"
                size="small"
                variant="outlined"
                fullWidth
                margin="normal"
                value={phone}
                onChange={handlePhoneChange}
                inputProps={{ maxLength: 10 }}
                sx={{ flex: 1, marginRight: "8px" }}
                disabled={oneTimeCustomer}
              />
              <TextField
                label="Email"
                size="small"
                variant="outlined"
                fullWidth
                margin="normal"
                value={email}
                onChange={handleEmailChange}
                onBlur={handleEmailBlur}
                sx={{ flex: 1, marginTop: "16px" }}
                disabled={oneTimeCustomer}
              />
            </Box>

            <div></div>

            <div style={{ display: "flex", gap: 8 }}>
              <Autocomplete
                options={states}
                getOptionLabel={(option) => option}
                onChange={handleStateChange}
                value={selectedState}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="State"
                    size="small"
                    required
                    fullWidth
                  />
                )}
                sx={{ flex: 1 }}
              />
              <Autocomplete
                options={cities}
                getOptionLabel={(option) => option}
                onChange={handleCityChange}
                value={selectedCity}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="City"
                    size="small"
                    required
                    fullWidth
                  />
                )}
                disabled={!selectedState}
                sx={{ flex: 1 }}
              />
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <TextField
                required
                label="Street"
                size="small"
                variant="outlined"
                fullWidth
                margin="normal"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                sx={{ flex: 1 }}
                disabled={oneTimeCustomer}
              />
              <TextField
                label="Pincode"
                size="small"
                variant="outlined"
                fullWidth
                margin="normal"
                value={zip}
                inputProps={{ maxLength: 6 }}
                onChange={(e) => {
                  setZip(e.target.value);
                }}
                sx={{ flex: 1 }}
                disabled={oneTimeCustomer}
              />
            </div>

            <div
              style={{
                display: "flex",
                gap: 8,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Autocomplete
                options={references}
                getOptionLabel={(option) => option.label}
                onChange={(e, value) => {
                  console.log(value.label);
                  setRefer(value);
                }}
                value={refer}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Reference"
                    size="small"
                    required
                    fullWidth
                  />
                )}
                sx={{ flex: 1 }}
                disabled={oneTimeCustomer}
              />

              <TextField
                label="Referred By"
                size="small"
                variant="outlined"
                fullWidth
                margin="normal"
                value={referBy}
                onChange={(e) => {
                  setReferBy(e.target.value);
                }}
                sx={{ flex: refer?.label == "Customer reference" ? 1 : 0 }}
                disabled={oneTimeCustomer}
              />
            </div>
          </div>
        )}

        {!oneTimeCustomer && activeStep === 1 && (
          <div>
            <h1>
              Add Vehicle {salesType === "counterSales" ? "(Optional)" : ""}
            </h1>

            <Box display="flex" alignItems="center">
              <FormControlLabel
                control={
                  <Checkbox
                    checked={isPlateNumberHidden}
                    onChange={handleCheckboxChange}
                  />
                }
                label="New vehicle"
                margin="normal"
              />

              <TextField
                required
                label="Plate Number"
                size="small"
                variant="outlined"
                fullWidth
                margin="normal"
                onBlur={validateNumberPlate}
                value={plateNumber}
                onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
                style={{ display: isPlateNumberHidden ? "none" : "block" }}
                disabled={oneTimeCustomer}
              />
            </Box>

            <Box display="flex" alignItems="center" marginY="normal">
              <FormControl component="fieldset">
                <FormLabel component="legend">Fuel Type</FormLabel>
                <RadioGroup
                  row
                  aria-label="fuel type"
                  name="fuelType"
                  value={fuelType}
                  onChange={handleFuelTypeChange}
                >
                  <FormControlLabel
                    value="petrol"
                    control={<Radio />}
                    label="Petrol"
                  />
                  <FormControlLabel
                    value="diesel"
                    control={<Radio />}
                    label="Diesel"
                  />
                </RadioGroup>
              </FormControl>
            </Box>
            <Box
              display="flex"
              justifyContent="space-between"
              marginY="normal"
              paddingBottom={2}
            >
              <Autocomplete
                options={makes.map((item) => item.make_name)}
                onChange={(event, value) => handleMakeChange(value)}
                value={make}
                freeSolo
                fullWidth
                sx={{ flex: 1, marginRight: "8px" }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Make"
                    size="small"
                    required
                    onChange={(e) => {
                      if (e.target.value) setMake(e.target.value);
                    }}
                    disabled={oneTimeCustomer}
                  />
                )}
                onInputChange={(event, newInputValue) => {
                  setMake(newInputValue);
                }}
              />

              <Autocomplete
                options={Array.isArray(models) ? models : []}
                onChange={(event, value) => setModel(value)}
                value={model}
                freeSolo
                fullWidth
                sx={{ flex: 1, marginRight: "8px" }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Model"
                    size="small"
                    required
                    onChange={(e) => {
                      if (e.target.value) setModel(e.target.value);
                    }}
                    disabled={oneTimeCustomer}
                  />
                )}
                onInputChange={(event, newInputValue) => {
                  setModel(newInputValue);
                }}
                disabled={!make}
              />

              <TextField
                label="Variant"
                size="small"
                variant="outlined"
                fullWidth
                value={vin}
                onChange={(e) => setVin(e.target.value)}
                sx={{ flex: 1 }}
                disabled={!model}
              />
            </Box>

            <Box sx={{ display: "flex", gap: 2, width: "100%" }}>
              <TextField
                required
                label="Registration Date"
                type="date"
                size="small"
                variant="outlined"
                onChange={(e) => setRegistrationDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{
                  width: "33.33%",
                  "& .MuiFormLabel-asterisk": {
                    display: "none", // Hide the asterisk
                  },
                }}
                disabled={oneTimeCustomer}
              />

              <TextField
                required
                label="Chassis Number"
                size="small"
                variant="outlined"
                value={chassisNumber}
                onChange={(e) => setChassisNumber(e.target.value)}
                sx={{
                  width: "33.33%",
                  "& .MuiFormLabel-asterisk": {
                    display: "none",
                  },
                }}
                disabled={oneTimeCustomer}
              />

              <TextField
                required
                label="Engine Number"
                size="small"
                variant="outlined"
                value={engineNumber}
                onChange={(e) => setEngineNumber(e.target.value)}
                sx={{
                  width: "33.33%",
                  "& .MuiFormLabel-asterisk": {
                    display: "none",
                  },
                }}
                disabled={oneTimeCustomer}
              />
            </Box>

            <TextField
              required
              label="Year"
              size="small"
              variant="outlined"
              fullWidth
              onBlur={validateYear}
              margin="normal"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              disabled={oneTimeCustomer}
            />
          </div>
        )}

        {/* If oneTimeCustomer, show only prefix and name on step 0, and plate number + new/old tick on step 1 */}
        {oneTimeCustomer && activeStep === 0 && (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            minHeight="200px"
            gap={2}
          >
            <Typography variant="h6" color="primary">
              One Time Customer Mode Enabled
            </Typography>
            {/* <Typography variant="body2" color="textSecondary">
              All fields are hidden. Details will be auto-filled from company profile.
            </Typography> */}
            <Autocomplete
              options={prefixOptions}
              getOptionLabel={(option) => option.name || ""}
              isOptionEqualToValue={(option, value) => option.name === value?.name}
              onChange={(e, value) => setPrefix(value || null)}
              value={prefix}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Prefix"
                  size="small"
                  required
                  fullWidth
                />
              )}
              sx={{ width: "50%" }}
            />
            <TextField
              required
              label="Customer Name"
              size="small"
              variant="outlined"
              margin="normal"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              sx={{ width: "50%" }}
            />
          </Box>
        )}

        {oneTimeCustomer && activeStep === 1 && (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            minHeight="200px"
            gap={2}
          >
            <Typography variant="h6" color="primary">
              One Time Customer Mode Enabled
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Please enter the vehicle number.
            </Typography>
            <TextField
              required
              label="Plate Number"
              size="small"
              variant="outlined"
              margin="normal"
              value={plateNumber}
              onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
              sx={{ width: "50%" }}
            />
            {/* Old/New vehicle tick logic */}
            <FormControlLabel
              control={
                <Checkbox
                  checked={isPlateNumberHidden}
                  onChange={handleCheckboxChange}
                  color="primary"
                />
              }
              label="New Vehicle (No Number Plate)"
            />
          </Box>
        )}
      </Box>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
      // anchorOrigin={snackbarPosition}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
      <Box display="flex" justifyContent="space-between" marginTop="1rem">
        <Button
          variant="contained"
          onClick={handleBack}
          disabled={activeStep === 0}
        >
          Back
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            if (activeStep === 1) {
              handleFinish();
            } else {
              if (validateStep()) {
                setActiveStep((prev) => prev + 1);
              }
            }
          }}
        >
          {activeStep === 1 ? "Finish" : "Next"}
        </Button>
      </Box>
    </div>
  );
}
