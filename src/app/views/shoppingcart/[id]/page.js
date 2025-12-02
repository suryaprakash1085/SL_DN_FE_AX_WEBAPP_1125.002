"use client";
//? React Imports
import React, { useState, useEffect, useRef, use } from "react";
import { useRouter, useParams } from "next/navigation";
import { getCustomer, fetchVehicles } from "../../../../../controllers/shoppingidControllers";
import { FormControlLabel, Checkbox } from "@mui/material";
import AddProduct from "@/components/addProduct";
import AddIcon from "@mui/icons-material/Add"; // Import Add Icon3
import generatePDFInvoice from "@/components/PDFGenerator_invoice";

// import { Snackbars } from "@/components/snackBar";
//? Components Imports
import Navbar from "@/components/navbar";
// import LiveChat from "@/components/liveChat";
import Cookies from "js-cookie";

//? Functional Package Imports
import { Document, Page, View, Text, Image, pdf } from "@react-pdf/renderer";

import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";

import {
  Box,
  Typography,
  Table,
  TableBody,
  Modal,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Autocomplete,
  Grid,
  TextField,
  Snackbar,
  Paper,
  Divider,
} from "@mui/material";

import MuiAlert from "@mui/material/Alert";

// update,save,print icons
import PrintIcon from "@mui/icons-material/Print";
import SaveIcon from "@mui/icons-material/Save";
import UpdateIcon from "@mui/icons-material/Update";
import Tooltip from "@mui/material/Tooltip";

//? Image and Icon Imports
import DeleteIcon from "@mui/icons-material/Delete";
import SportsScoreIcon from "@mui/icons-material/SportsScore";
// import QRCode from 'qrcode.react'; // Import the QR code library
// import { QRCode } from 'react-qr-code'; // Import the new QR code library
import QRCode from "qrcode"; // Import QR code library for image generation

//? CSS / State Inits
const messageInit = [
  { sender: "Mechanic", text: "The vehicle inspection is complete." },
  { sender: "Garage Owner", text: "Great! Any issues found?" },
  {
    sender: "Mechanic",
    text: "Yes, there are a few issues with the brakes.",
  },
];

export default function CustomerDetail() {
  const router = useRouter();
  const params = useParams();
  const lastInputRef = useRef(null);

  //? FrontEnd extracted data states
  const appointmentId = params.id;
  const [PdfHeaderImage, setPdfHeaderImage] = useState("");
  const [pdfFooterImage, setPdfFooterImage] = useState("");

  //? Backend Data states
  const [customer, setCustomer] = useState(null);
  const [vehicleId, setVehicleId] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [formData, setFormData] = useState({});
  const [isChecked, setIsChecked] = useState(false);
  const [upi, setupi] = useState("");
  const [companyName, setCompanyName] = useState("");

  //? FrontEnd Data states
  const [km, setKm] = useState(0);
  const [tempKm, setTempKm] = useState(km);
  const [estimateItems, setEstimateItems] = useState([]);
  const [services, setServices] = useState([]);
  const [uomOptions, setUomOptions] = useState([]);
  const [prNo, setPrNo] = useState("");

  //? Boolean check states
  const [servicesActualExists, setServicesActualExists] = useState(false);
  const [servicesEstimateExists, setServicesEstimateExists] = useState(false);
  const [appointmentDataLog, setAppointmentDataLog] = useState([]);
  const [enableRelease, setEnableRelease] = useState(false);
  const [prCreated, setPrCreated] = useState(false);
  // const [updateButtonclicked, setUpdateButtonclicked] = useState(false);
  const [newdata, setnewdata] = useState();

  //? Modal and Alert states
  const [loading, setLoading] = useState(true);
  const [disableDelete, setDisableDelete] = useState(false);
  const [error, setError] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarSeverity, setSnackbarSeverity] = useState("info");
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [openAddProductModal, setOpenAddProductModal] = useState(false);
  const [typedname, setTypedname] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [makes, setMakes] = useState([]); //  Fixed State Type
  const [models, setModels] = useState([]); // Fixed State Type
  const [pdfLogo, setPdfLogo] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  // button disable

  const [saveButtonClicked, setSaveButtonClicked] = useState(false);
  const [updateButtonClicked, setUpdateButtonClicked] = useState(false);

  // Add this state variable
  const [isExistingCustomer, setIsExistingCustomer] = useState(false);

  // First, add a new state for company details
  const [companyDetails, setCompanyDetails] = useState([]);

  const addNewProduct = () => {
    setOpenAddProductModal(true);
  };

  useEffect(() => {
    const fetchss = async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ss`);
      console.log("customerData", response);
      const data = await response.json();
      setupi(data.company_details[0].company_upi);
      setCompanyName(data.company_details[0].company_name);
      setPdfHeaderImage(data.company_details[0]?.pdf_header || "");
      setPdfFooterImage(data.company_details[0]?.pdf_footer || "");
      setPdfLogo(data.company_details[0]?.logo || "");
    };
    fetchss();
  });

  // New function to refetch inventory
  const refetchInventory = async () => {
    const token = Cookies.get("token");
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/inventory?limit=1000000`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch inventory data");
      const data = await response.json();
      setInventory(data); // Update inventory state
    } catch (error) {
      console.log("Error fetching inventory data:", error);
    }
  };

  const [printedBy, setPrintedBy] = useState(
    Cookies.get("userName") || "Unknown User"
  );
  useEffect(() => {
    if (estimateItems.length === 1) {
      setDisableDelete(true);
    } else {
      setDisableDelete(false);
    }
  }, [estimateItems]);
  useEffect(() => {
    const storedToken = Cookies.get("token");
    setToken(storedToken);

    fetchSoftware(storedToken);
  }, []); // Empty dependency array since we're getting token from localStorage

  // First, update the fetchSoftware function to properly set the state
  const fetchSoftware = async (authToken) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ss`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      console.log("Company Details:", data.company_details);
      setCompanyDetails(data.company_details);
    } catch (error) {
      console.error("Error fetching company details:", error);
    }
  };

  const handleMakeChange = (value) => {
    console.log("handleMakeChange called with:", value);
    setMake(value);
    setModel("");

    const selectedMake = makes.find((item) => item.make_name === value);
    setModels(selectedMake ? selectedMake.models : []);
  };

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/ss/service`
        );
        const data = await response.json();
        setServices(data.services);
      } catch (error) {
        console.log("Error fetching services:", error);
      }
    };

    const fetchUomData = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/uom`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        setUomOptions(data);
      } catch (error) {
        console.log("Error fetching UOM data:", error);
      }
    };

    fetchUomData();

    fetchServices();
  }, []);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/ss/service`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        const data = await response.json();
        setServices(data.services);
      } catch (error) {
        console.error("Error fetching services:", error);
      }
    };
    fetchServices();
  }, []);

  useEffect(() => {
    if (!appointmentId) {
      console.log("Appointment ID is not available");
      setLoading(false);
      return;
    }

    const fetchDetails = async () => {
      const token = Cookies.get("token");
      try {
        const appointmentResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/countertopsales/${appointmentId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (!appointmentResponse.ok)
          throw new Error("Failed to fetch appointment details");
        const appointmentData = await appointmentResponse.json();
        const customerId = appointmentData.customer_id;
        const vehicleId = appointmentData.vehicle_id;
        if (appointmentData.km != undefined) {
          setKm(appointmentData.km);
        } else {
          setKm(0);
        }

        const [customerResponse, inventoryResponse] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/customer/${customerId}`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/inventory?limit=1000000`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }),
        ]);

        if (!customerResponse.ok)
          throw new Error("Failed to fetch customer details");
        if (!inventoryResponse.ok)
          throw new Error("Failed to fetch inventory details");

        const customerData = await customerResponse.json();
        const inventoryData = await inventoryResponse.json();

        setCustomer(customerData);
        setFormData({
          customer_id: customerData.customer_id,
          profix: customerData.prefix,
          email: customerData.email,
          name: customerData.customer_name,
          gst: customerData.gst_number || "",
          street: customerData.contact?.address?.street || "",
          city: customerData.contact?.address?.city || "",
          state: customerData.contact?.address?.state || "",
          phone: customerData?.contact?.phone || "",
          model: customerData?.vehicle?.model || "",

          appointment_id: appointmentId,
        });

        setVehicleId(vehicleId);
        setInventory(inventoryData);
        setAppointmentDataLog(appointmentData);
        // Pre-fill estimate items if services_actual exists
        if (
          appointmentData.services_actual &&
          appointmentData.services_actual.length > 0
        ) {
          const preFilledItems = appointmentData.services_actual.map(
            (service) => ({
              service_id: service.service_id || "",
              type: service.service_type || "",
              spareList: service.items_required[0]?.item_name || "",
              reportedIssue: service.service_description || "",
              qty: service.items_required[0]?.qty || 0,
              price: service.price || 0,
              // discount: service.items_required[0]?.discount || 0,
              discountType: "percentage",
              estimatedAmount: service.price || 0,
              tax: service.items_required[0]?.tax || 0,
            })
          );
          setEstimateItems(preFilledItems);
          calculateAllEstimatedAmounts(preFilledItems);
          // console.log("preFilledItems", preFilledItems);
        } else {
          if (appointmentData.services_actual.length > 0) {
            const preFilledItems = appointmentData.services_actual.map(
              (service) => ({
                service_id: service.service_id || "",
                type: service.service_type || "",
                spareList: service.items_required[0]?.item_name || "",
                reportedIssue: service.service_description || "",
                qty: service.items_required[0]?.qty || 1,
                price: service.price || 0,
                // discount: service.items_required[0]?.discount || 0,
                discountType: "percentage",
                estimatedAmount: service.price || 0,
                tax: service.items_required[0]?.tax || 0,
              })
            );
            setEstimateItems(preFilledItems);
            calculateAllEstimatedAmounts(preFilledItems);
          } else {
            setEstimateItems([
              {
                service_id: "",
                type: "Services",
                spareList: "",
                reportedIssue: "",
                qty: 0,
                price: 0,
                // discount: 0,
                discountType: "percentage",
                estimatedAmount: 0,
                tax: 0,
              },
            ]);
            calculateAllEstimatedAmounts([
              {
                service_id: "",
                type: "Services",
                spareList: "",
                reportedIssue: "",
                qty: 0,
                price: 0,
                // discount: 0,
                discountType: "percentage",
                estimatedAmount: 0,
                tax: 0,
              },
            ]);
          }
        }

        if (
          appointmentData.services_actual &&
          appointmentData.services_actual.length > 0
        ) {
          setServicesActualExists(true);
        }
        if (
          appointmentData.services_actual &&
          appointmentData.services_actual.length > 0
        ) {
          setServicesEstimateExists(true);
        }

        // console.log(appointmentData);
      } catch (err) {
        console.log("Error fetching details:", err);
        setError(err.message);
        setSnackbarMessage(err.message);
        setOpenSnackbar(true);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [appointmentId, saveButtonClicked]);

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };
  const calculateTotals = () => {
    const grandTotal = estimateItems.reduce(
      (acc, item) => acc + parseFloat(item.price) * parseFloat(item.qty),
      0
    );

    // Updated GST calculation
    const totalTax = estimateItems.reduce((acc, item) => {
      const itemTotal = parseFloat(item.price) * parseFloat(item.qty);
      const gstRate = parseFloat(item.tax);
      // Calculate GST amount using reverse calculation
      const gstAmount = itemTotal - itemTotal * (100 / (100 + gstRate));
      return acc + gstAmount;
    }, 0);

    const overallTotal = grandTotal; // Grand total already includes GST

    return { grandTotal, totalTax, overallTotal };
  };

  const { grandTotal, totalTax, overallTotal } = calculateTotals();

  const generatePDF = async () => {
    if (!estimateItems.some((item) => item.price > 0)) {
      showSnackbarAlert("Cannot print invoice: No valid prices available!", "error");
      return;
    }

    try {
      const token = Cookies.get("token");

      // Check if invoice already exists
      const checkResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/countertopsales/check-invoice/${appointmentId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const checkData = await checkResponse.json();
      let invoice_id;

      if (checkData.invoice_id) {
        // Use existing invoice_id if appointment is already invoiced
        invoice_id = checkData.invoice_id;
      } else {
        // Generate new invoice if appointment is not invoiced
        const generateResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/appointment/generateinvoice/${appointmentId}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!generateResponse.ok) {
          throw new Error("Failed to generate invoice");
        }

        const generateData = await generateResponse.json();
        invoice_id = generateData.invoice_id;
      }

      // Call the shared PDF generator function
      await generatePDFInvoice({
        customer,
        estimateItems,
        appointmentId,
        vehicleId,
        km,
        grandTotal,
        totalTax,
        PdfHeaderImage,
        pdfFooterImage,
        pdfLogo,
        invoiceId: invoice_id,
        companyDetails,
        upi: upiDetails.pa
      });

      router.push(`/views/`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      showSnackbarAlert("Error generating PDF", "error");
    }
  };

  const addEstimateItem = () => {
    const newItem = {
      type: "",
      spareList: "",
      reportedIssue: "",
      qty: 0,
      price: 0,
      // discount: 0,
      discountType: "percentage",
      estimatedAmount: 0,
      tax: 0,
      isNew: true,
    };
    setEstimateItems((prevItems) => {
      const updatedItems = [...prevItems, newItem];
      calculateEstimatedAmount(updatedItems.length - 1, updatedItems);
      return updatedItems;
    });
    setTimeout(() => {
      if (lastInputRef.current) {
        lastInputRef.current.focus();
      }
    }, 0);
  };

  // delete

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);

  //  Handle Delete Button Click
  const handleDeleteClick = (index) => {
    setSelectedIndex(index);
    setOpenDialog(true);
  };

  //  Handle Confirm Delete
  const handleConfirmDelete = async () => {
    setOpenDialog(false);
    const index = selectedIndex;
    const token = Cookies.get("token");
    const serviceId = estimateItems[index].service_id;

    if (!serviceId) {
      // Directly delete if there is no service_id
      setEstimateItems((prevItems) => prevItems.filter((_, i) => i !== index));
      showSnackbarAlert("Service deleted successfully");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/appointment/${appointmentId}/delete_service/${serviceId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        setEstimateItems((prevItems) =>
          prevItems.filter((_, i) => i !== index)
        );
        showSnackbarAlert("Service deleted successfully");
      } else if (response.status === 404) {
        showSnackbarAlert("Service not found");
      } else {
        showSnackbarAlert("Failed to delete service");
      }
    } catch (error) {
      console.log("Error deleting service:", error);
      showSnackbarAlert("Error deleting service");
    }
  };

  //  Handle Cancel Button
  const handleCancel = () => {
    setOpenDialog(false);
    setSelectedIndex(null);
  };

  const updateEstimateItem = (index, field, value) => {
    setEstimateItems((prevItems) => {
      const updatedItems = [...prevItems];
      updatedItems[index] = {
        ...updatedItems[index],
        [field]: value,
      };

      // Recalculate estimated amount if necessary
      if (["qty", "price", "tax"].includes(field)) {
        calculateEstimatedAmount(index, updatedItems);
      }

      return updatedItems;
    });
  };

  // old
  // const calculateEstimatedAmount = (index, items) => {
  //   const item = items[index];
  //   const price = parseFloat(item.price).toFixed(2) || 0; // Ensure price is a number
  //   const qty = parseFloat(item.qty).toFixed(1) || 0; // Ensure qty is a number
  //   const tax = parseFloat(item.tax).toFixed(2) || 0; // Ensure tax is a number

  //   // Calculate the estimated amount as quantity multiplied by price
  //   const estimatedAmount = qty * price;

  //   // Calculate the total amount including tax
  //   const estimatedAmountWithTax =
  //     estimatedAmount + (estimatedAmount * tax) / 100;

  //   // Update the estimated amount in the item
  //   items[index].estimatedAmount = estimatedAmountWithTax.toFixed(2); // Store the tax-included amount
  // };

  // new

  const calculateEstimatedAmount = (index, items) => {
    const item = items[index];

    // Ensure numeric values for calculations
    const price = parseFloat(item.price) || 0;
    const qty = parseFloat(item.qty) || 0;
    const tax = parseFloat(item.tax) || 0;

    // Calculate total amount (including GST)
    const totalAmount = price * qty;

    // Store the total amount (which includes GST)
    items[index].estimatedAmount = totalAmount;
  };

  // Function to calculate estimated amounts for all items
  const calculateAllEstimatedAmounts = (items) => {
    items.forEach((_, index) => {
      calculateEstimatedAmount(index, items);
    });
  };

  useEffect(() => {
    // console.log({ estimateItems: estimateItems });
    if (estimateItems.length > 0 && estimateItems[0]?.type !== "") {
      setEnableRelease(true);
    }
  }, [estimateItems]);

  const handleSpareListChange = (index, value) => {
    // console.log({ value });
    const isDuplicate = estimateItems.some(
      (item, i) => item.spareList === value && i !== index
    );

    if (isDuplicate) {
      showSnackbarAlert("Duplicate spare list item selected");
      return;
    }

    // Find the selected item in the inventory
    const selectedItem = inventory.find((item) => item.part_name === value);
    if (selectedItem) {
      // Update the estimate item with the selected spare list details
      updateEstimateItem(index, "spareList", value);
      updateEstimateItem(index, "price", selectedItem.price);
      updateEstimateItem(index, "qty", estimateItems[index].qty || 1);
      updateEstimateItem(
        index,
        "tax",
        selectedItem.tax || estimateItems[index].tax
      );

      // Set the type based on the selected inventory item's category
      updateEstimateItem(index, "type", selectedItem.category); // Use category or another relevant field
    } else {
      // If no item is found, reset the fields
      updateEstimateItem(index, "spareList", value);
      updateEstimateItem(index, "price", 0);
      updateEstimateItem(index, "qty", 0);
      updateEstimateItem(index, "type", ""); // Reset type if no item is found
    }
  };

  const getFilteredInventory = (type) => {
    return inventory.filter(
      (item) => item.category?.toLowerCase() === type?.toLowerCase()
    );
  };

  const handleTypeChange = (index, value) => {
    setEstimateItems((prevItems) => {
      const updatedItems = [...prevItems];
      updatedItems[index] = {
        ...updatedItems[index],
        type: value,
      };
      return updatedItems;
    });
  };

  const handleKeyPress = (event, index) => {
    if (event.key === "Enter" && index === estimateItems.length - 1) {
      addEstimateItem();
    }
  };

  const validateAndPostService = async (
    serviceType,
    appointmentDataLog,
    type
  ) => {
    const token = Cookies.get("token");

    // Validation
    if (!formData.name || !formData.phone) {
      showSnackbarAlert(
        !formData.name && !formData.phone
          ? "Customer name and phone number are required!"
          : !formData.name
            ? "Customer name is required!"
            : "Phone number is required!"
      );
      return;
    }

    // Ensure required items are valid
    const validItems = estimateItems.filter(
      (item) => item.spareList && item.qty > 0 && item.price > 0
    );

    let Status = "approved";
    if (serviceType === "services_actual") {
      Status =
        appointmentDataLog.services_actual.length > 0 ? "approved" : "released";
    }

    try {

      // Check if invoice already exists
      const checkResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/countertopsales/check-invoice/${appointmentId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const checkData = await checkResponse.json();
      let invoice_id;

      if (checkData.invoice_id) {
        // Use existing invoice_id if appointment is already invoiced
        appointmentDataLog.invoice_id = checkData.invoice_id;
      } else {
        // Generate new invoice if appointment is not invoiced
        const generateResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/appointment/generateinvoice/${appointmentId}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!generateResponse.ok) {
          throw new Error("Failed to generate invoice");
        }

        const generateData = await generateResponse.json();
        appointmentDataLog.invoice_id = generateData.invoice_id;
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      showSnackbarAlert("Error generating Invoice No", "error");
    }
    // catch (error) {
    //         console.error(error);
    //       }
    const services = validItems.map((item) => ({
      service_id: Status !== "released" ? item.service_id || "" : "",
      overallTotal: overallTotal,
      uom: item.uom,
      vehicle_id: appointmentDataLog.vehicle_id,
      items_required: [
        {
          item_id: inventory.find(
            (invItem) => invItem.part_name === item.spareList
          )?.inventory_id,
          item_name: item.spareList,
          qty: item.qty,
          tax: item.tax,
          price: item.price,
        },
      ],
      service_type: item.type,
      status: Status,
      customer_id: formData.customer_id,
      invoice_id: appointmentDataLog.invoice_id,
    }));
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/countertopsales/save/${appointmentId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(services),
        }
      );

      if (!response.ok) throw new Error(`Failed to post to ${serviceType}`);

      // Set dynamic success message based on action type
      showSnackbarAlert(
        type === "save"
          ? `Appointment ${appointmentId} saved successfully`
          : `Appointment ${appointmentId} updated successfully`
      );
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      if (type === "save") {
        setSaveButtonClicked(true);
        setUpdateButtonClicked(false);
      }

    } catch (error) {
      showSnackbarAlert("Invoice creation failed");
      throw error; // Throw error to allow button to re-enable
    }
  };

  // const updateKm = async (newKm) => {
  //   const token = Cookies.get("token");
  //   if (isNaN(newKm)) {
  //     setSnackbarMessage("KM should be a number");
  //     setOpenSnackbar(true);
  //     return;
  //   }
  //   const response = await fetch(
  //     `${process.env.NEXT_PUBLIC_API_URL}/appointment/${appointmentId}/update_km`,
  //     {
  //       method: "PUT",
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({ km: newKm }),
  //     }
  //   );
  //   if (!response.ok) throw new Error("Failed to update KM");
  //   setKm(newKm);

  //   setSnackbarMessage(`KM updated successfully`);
  //   setOpenSnackbar(true);
  // };
  // const handleKmChange = (event) => {
  //   setKm(event.target.value);
  //   updateKm(event.target.value);
  // };

  // useEffect(() => {
  //   setTempKm(km); // Update tempKm whenever km changes
  // }, [km]);

  // const handleTempKmChange = (event) => {
  //   setTempKm(event.target.value);
  // };

  // const handleUpdateKmClick = () => {
  //   updateKm(tempKm);
  // };
  // const handleRelease = async () => {
  //   // check if km is 0
  //   if (km === 0) {
  //     setSnackbarMessage("KM should be greater than 0");
  //     setOpenSnackbar(true);
  //     return;
  //   }

  //   // use appointment/released/appointmentId
  //   const token = Cookies.get("token");
  //   const response = await fetch(
  //     `${process.env.NEXT_PUBLIC_API_URL}/appointment/released/${appointmentId}`,
  //     {
  //       method: "PUT",
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //         "Content-Type": "application/json",
  //       },
  //     }
  //   );
  //   if (!response.ok) throw new Error("Failed to release appointment");
  //   setSnackbarMessage("Appointment released successfully");
  //   setOpenSnackbar(true);
  //   // refresh the page only if success
  //   if (response.ok) {
  //     // window.location.reload();
  //     router.push(`/app/`);
  //   }
  // };

  // const createProcurement = async () => {
  //   const token = Cookies.get("token");

  //   // Filter items to include only those that are out of stock
  //   const itemsToProcure = estimateItems
  //     .map((item) => {
  //       const stockQuantity =
  //         inventory.find((invItem) => invItem.part_name === item.spareList)
  //           ?.quantity || 0;
  //       const requiredQuantity =
  //         item.qty > stockQuantity ? item.qty - stockQuantity : 0; // Calculate the difference
  //       return {
  //         product: item.spareList, // Ensure product name is used
  //         qty: requiredQuantity, // Include only the difference in quantity
  //         service_id: item.service_id, // Include service_id
  //         item_id: inventory.find(
  //           (invItem) => invItem.part_name === item.spareList
  //         )?.inventory_id, // Add item_id
  //       };
  //     })
  //     .filter((item) => item.qty > 0); // Only include items with a positive quantity difference

  //   if (itemsToProcure.length === 0) {
  //     setSnackbarMessage("No items require procurement.");
  //     setOpenSnackbar(true);
  //     return; // Exit if no items need procurement
  //   }

  //   try {
  //     const response = await fetch(
  //       `${process.env.NEXT_PUBLIC_API_URL}/procurement/srpr`,
  //       {
  //         method: "POST",
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify({
  //           pr_type: "SRPR",
  //           items: itemsToProcure, // Send the updated items array
  //           service_id: itemsToProcure[0]?.service_id, // Use the service_id from the first item
  //         }),
  //       }
  //     );
  //     // console.log(body)
  //     if (!response.ok) throw new Error("Failed to create procurement");
  //     const data = await response.json();
  //     setPrNo(data.pr_no); // Set the PR number from the response
  //     setPrCreated(true); // Mark PR as created
  //     setSnackbarMessage("Procurement created successfully");
  //     setOpenSnackbar(true);
  //   } catch (error) {
  //     // console.error("Error creating procurement:", error);
  //     setSnackbarMessage("Error creating procurement");
  //     setOpenSnackbar(true);
  //   }
  // };

  // Calculate itemsToProcure for rendering // include item_id
  const itemsToProcure = estimateItems
    .map((item) => {
      const stockQuantity =
        inventory.find((invItem) => invItem.part_name === item.spareList)
          ?.quantity || 0;
      const requiredQuantity =
        item.qty > stockQuantity ? item.qty - stockQuantity : 0; // Calculate the difference
      return {
        ...item,
        qty: requiredQuantity,
        item_id: inventory.find(
          (invItem) => invItem.part_name === item.spareList
        )?.inventory_id,
      }; // Include only the difference in quantity
    })
    .filter((item) => item.qty > 0); // Only include items with a positive quantity difference

  const isCreatePrEnabled = itemsToProcure.length > 0 && !prCreated; // Enable if there are items to procure and PR not created

  // Function to get the common PR number from services_actual
  const getCommonPrNo = () => {
    if (!appointmentDataLog || !appointmentDataLog.services_actual) {
      return null; // Return null if data is not available
    }

    const prNumbers = appointmentDataLog.services_actual.flatMap((service) =>
      service.items_required.map((item) => item.pr_no)
    );

    // Filter out undefined values and get unique PR numbers
    const uniquePrNumbers = [...new Set(prNumbers.filter((pr) => pr))];

    // Return the common PR number if all are the same
    return uniquePrNumbers.length === 1 ? uniquePrNumbers[0] : null;
  };

  // Get the common PR number
  const commonPrNo = getCommonPrNo();

  const savecustomer = async () => {
    try {
      // console.log("Sending Data:", formData);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/countertopsales/countertop`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) throw new Error("Failed to add customer");

      const responseData = await response.json();
      showSnackbarAlert("Customer added successfully!");
    } catch (error) {
      console.log("Error:", error);
      showSnackbarAlert("Error adding customer. Please try again.", "error");
    }
  };

  const [isPhoneSelected, setIsPhoneSelected] = useState(false);
  const [customerData, setCustomerData] = useState([]); // Ensure it's initialized as an empty array
  const [token, setToken] = useState("");
  const [phone, setPhone] = useState("");
  // Ensure customerData.customers is always an array before trying to filter
  // Handle checkbox change (toggle GST field visibility)
  const handleCheckboxChange = (event) => {
    setIsChecked(event.target.checked);

    // If unchecking, clear the GST value
    if (!event.target.checked) {
      setFormData((prevData) => ({
        ...prevData,
        gst: "",
      }));
    }
  };
  // Handle input changes for name and GST fields
  const handleInputChange = (event, field) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: event.target.value,
    }));
  };
  // Filter customer data based on the phone number input
  const filteredData = customerData.filter((customer) =>
    customer.phone.includes(phone)
  );

  // Add this state to control form visibility
  const [showFullForm, setShowFullForm] = useState(false);

  // Add new function to handle showing snackbar alerts
  const showSnackbarAlert = (message, severity = "info") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setOpenSnackbar(true);
  };

  // Modify handlePhoneChange function
  const handlePhoneChange = (value) => {
    setFormData((prevData) => ({
      ...prevData,
      phone: value,
    }));

    setPhone(value);

    if (value && value.length > 0) {
      setShowFullForm(true);
      const selectedCustomer = customerData.find(
        (customer) => customer.phone === value
      );
      if (selectedCustomer) {
        setIsExistingCustomer(true); // Set to true when customer exists
        if (selectedCustomer.gst_number) {
          setIsChecked(true);
        }
        setFormData((prevData) => ({
          ...prevData,
          customer_id: selectedCustomer.customer_id,
          name: selectedCustomer.customer_name,
          gst: selectedCustomer.gst_number || "",
          street: selectedCustomer.street || "",
          appointment_id: appointmentId,
        }));
        setnewdata({
          customer_id: selectedCustomer.customer_id,
          name: selectedCustomer.customer_name,
          gst: selectedCustomer.gst_number || "",
          street: selectedCustomer.street || "",
          phone: selectedCustomer.phone || "",
        });
      } else {
        setIsExistingCustomer(false); // Set to false when customer doesn't exist
        setFormData((prevData) => ({
          ...prevData,
          name: "",
          gst: "",
          street: "",
        }));
        setnewdata({
          name: "",
          gst: "",
          street: "",
        });
      }
    } else {
      setShowFullForm(false);
      setIsExistingCustomer(false); // Reset when phone field is cleared
    }
  };

  // Modify handleAddNewCustomer function
  const handleAddNewCustomer = () => {
    if (formData.phone) {
      setShowFullForm(true);
    } else {
      showSnackbarAlert("Please enter a phone number", "warning");
    }
  };

  // Define UPI details
  let upiDetails = {
    pa: upi,
    pn: companyName,
    tn: "ARG's 7 Cars" + " - " + appointmentId,
    am: overallTotal,
    cu: "INR",
  };

  // Create UPI link with proper encoding
  let upiLink = `upi://pay?pa=${encodeURIComponent(
    upiDetails.pa
  )}&pn=${encodeURIComponent(upiDetails.pn)}&tn=${encodeURIComponent(
    upiDetails.tn
  )}&am=${encodeURIComponent(upiDetails.am)}&cu=${encodeURIComponent(
    upiDetails.cu
  )}`;

  const handleAddNewRow = () => {
    const newRow = {
      spareList: "", // Empty input
      qty: "",
      type: "",
      price: "",
      tax: "0",
      estimatedAmount: 0,
    };

    setEstimateItems((prevItems) => [...prevItems, newRow]); // Append new row
  };

  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [savingName, setSavingName] = useState(false);

  // Function to handle save
  const handleSaveName = async () => {
    if (!editedName.trim() || editedName === customer.customer_name) {
      setIsEditingName(false);
      return;
    }
    setSavingName(true);
    try {
      const token = Cookies.get("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/customer/name/${customer.customer_id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ customer_name: editedName }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        setCustomer({ ...customer, customer_name: editedName });
        setSnackbarMessage("Customer name updated successfully");
        setSnackbarSeverity("success");
        setOpenSnackbar(true);
      } else {
        setSnackbarMessage(data.error || "Failed to update name");
        setSnackbarSeverity("error");
        setOpenSnackbar(true);
      }
    } catch (err) {
      setSnackbarMessage("Error updating name");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    }
    setSavingName(false);
    setIsEditingName(false);
  };

  return (
    <div>
      <Modal
        open={openAddProductModal}
        onClose={() => setOpenAddProductModal(false)}
      >
        <AddProduct
          token={token}
          setOpenAddProductModal={setOpenAddProductModal}
          onProductAdded={refetchInventory}
          typedname={typedname}
        />
      </Modal>
      <Navbar pageName="Counter Sales" hasChanges={hasChanges} />
      <Box
        sx={{
          backgroundSize: "cover",
          color: "white",
          minHeight: "89vh",
        }}
      >
        <Box>
          {loading && <Typography>Loading details...</Typography>}
          <Snackbar
            open={openSnackbar}
            autoHideDuration={6000}
            onClose={handleCloseSnackbar}
          >
            <MuiAlert
              onClose={handleCloseSnackbar}
              severity={snackbarSeverity} //  Add this line
              sx={{ width: "100%" }}
            >
              {snackbarMessage}
            </MuiAlert>
          </Snackbar>

          {customer && (
            <Box display="flex" flexDirection="column" gap={3}>
              <Box sx={{ maxHeight: "40vh" }}>
                <Paper
                  elevation={3}
                  sx={{
                    borderRadius: 2,
                    marginBottom: 3,
                    paddingBottom: 2,
                    width: "%",
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    flexWrap: "wrap",
                    padding: 2,
                  }}
                >
                  <Grid container spacing={2} alignItems="center">
                    {/* 40% column */}
                    <Grid item xs={12}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          paddingBottom: 16,
                          width: "100%",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          {/* <BackButton /> */}
                          <Typography
                            variant="h6"
                            style={{ marginLeft: "8px" }}
                          >
                            Job Card No - {appointmentId}
                          </Typography>
                        </div>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          width: "100%",
                          flexWrap: "wrap",
                        }}
                      >
                        <div
                          style={{
                            flex: 1,
                            minWidth: "220px",
                            marginRight: 16,
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          {/* --- Customer Name with Edit --- */}
                          {!isEditingName ? (
                            <>
                              <Typography variant="h3" sx={{}}>
                                {customer.customer_name}
                              </Typography>
                              <IconButton
                                size="small"
                                sx={{ ml: 1 }}
                                onClick={() => {
                                  setEditedName(customer.customer_name);
                                  setIsEditingName(true);
                                }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </>
                          ) : (
                            <>
                              <TextField
                                size="small"
                                value={editedName}
                                onChange={e => setEditedName(e.target.value)}
                                onKeyDown={e => {
                                  if (e.key === "Enter") handleSaveName();
                                  if (e.key === "Escape") setIsEditingName(false);
                                }}
                                autoFocus
                                sx={{ mr: 1, minWidth: 120 }}
                                disabled={savingName}
                              />
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={handleSaveName}
                                disabled={savingName}
                              >
                                <SaveIcon fontSize="small" />
                              </IconButton>
                            </>
                          )}
                          {/* --- End Customer Name with Edit --- */}
                        </div>
                        <div
                          style={{ flex: 1, minWidth: "220px", marginLeft: 16 }}
                        >
                          <Typography variant="body2" sx={{ marginBottom: 1 }}>
                            <strong>Email:</strong>{" "}
                            <a
                              href={`mailto:${customer.contact.email}`}
                              style={{
                                color: "inherit",
                                textDecoration: "none",
                              }}
                            >
                              {customer.contact.email}
                            </a>
                          </Typography>
                          <Typography variant="body2" sx={{ marginBottom: 1 }}>
                            <strong>Address:</strong>{" "}
                            {customer.contact.address.street},{" "}
                            {customer.contact.address.city}
                          </Typography>
                          <Typography variant="body2">
                            {customer.contact.address.state} -{" "}
                            {customer.contact.address.pinCode}
                          </Typography>
                        </div>
                        <div
                          style={{ flex: 1, minWidth: "220px", marginLeft: 16 }}
                        >
                          {customer.vehicles
                            .filter(
                              (vehicle) => vehicle.vehicle_id === vehicleId
                            )
                            .map((vehicle, index) => (
                              <div key={index} style={{ marginBottom: 16 }}>
                                <Typography
                                  variant="h6"
                                  sx={{ fontWeight: "bold", color: "#333" }}
                                >
                                  {`${vehicle.make}`}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  sx={{ color: "#555" }}
                                >
                                  <strong>Model:</strong> {vehicle.model}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  sx={{ color: "#888" }}
                                >
                                  <strong>Plate Number:</strong>{" "}
                                  {vehicle.plateNumber || "N/A"}
                                </Typography>
                              </div>
                            ))}
                        </div>
                        {/* //! No Longer Needed in this page */}
                        {/* <div style={{ flex: 1, minWidth: "220px", marginLeft: 16 }}>
                      <Box display="flex" alignItems="center">
                        {Array.isArray(appointmentDataLog.services_actual) &&
                          // servicesEstimateExists && (
                          servicesActualExists && (
                            <>
                              <SportsScoreIcon
                                style={{
                                  fontSize: "100px",
                                  color:
                                    appointmentDataLog.status === "completed"
                                      ? "green"
                                      : appointmentDataLog.status === "released"
                                      ? "orange"
                                      : appointmentDataLog.status === "scheduled"
                                      ? "red"
                                      : "inherit",
                                }}
                              />
                              <Button
                                variant="contained"
                                color="success"
                                onClick={() => handleRelease()}
                                disabled={
                                  appointmentDataLog.status === "released" ||
                                  appointmentDataLog.status === "invoice" ||
                                  appointmentDataLog.status === "inspection" ||
                                  appointmentDataLog.status === "completed" ||
                                  enableRelease == false
                                }
                                sx={{ marginLeft: 2 }}
                                // disabled={enableRelease }
                              >
                                {appointmentDataLog.status === "released" ||
                                appointmentDataLog.status === "invoice" ||
                                appointmentDataLog.status === "inspection" ||
                                appointmentDataLog.status === "completed"
                                  ? "Already Released"
                                  : "Release"}
                              </Button>
                            </>
                          )}
                      </Box>
                    </div> */}
                      </div>
                    </Grid>
                  </Grid>
                </Paper>
              </Box>

              <Paper
                elevation={1}
                sx={{
                  padding: 1,
                  borderRadius: 2,
                  marginBottom: 3,
                  marginTop: -5,
                }}
              >
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <Typography variant="h6" gutterBottom>
                    Job Details
                  </Typography>
                  {/* Display the common PR number centered after the Job Details header */}
                  {commonPrNo && (
                    <Typography
                      variant="body2"
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontWeight: "bold",
                      }}
                    >
                      PR No: {commonPrNo}
                    </Typography>
                  )}
                  <Box
                    display="flex"
                    justifyContent="flex-end"
                    marginTop={0}
                    marginBottom={1}
                  >
                    {/* Invoice Print Button with Tooltip */}
                    {/* Invoice Print Button with Tooltip */}
                    <Tooltip title="Invoice Print">
                      <span>
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          sx={{
                            marginRight: 1,
                            height: "40px",
                            width: "40px", // Make the button a small square
                            minWidth: "40px", // Ensure it doesn't expand
                          }}
                          onClick={async () => {
                            setUpdateButtonClicked(true); // Disable button before API call
                            try {
                              generatePDF();
                            } catch (error) {
                              setUpdateButtonClicked(false); // Re-enable button if error occurs
                            }

                          }}
                          disabled={
                            !estimateItems.some((item) => item.price > 0)
                          } // Disable if no price
                        >
                          <PrintIcon fontSize="small" />{" "}
                          {/* Make the icon small */}
                        </Button>
                      </span>
                    </Tooltip>

                    <Box
                      display="flex"
                      justifyContent="flex-end"
                      marginTop={0}
                      marginBottom={1}
                    >
                      {Array.isArray(appointmentDataLog.services_actual) &&
                        appointmentDataLog.services_actual.length > 0 &&
                        appointmentDataLog.services_actual.some(
                          (service) => service.service_id
                        ) ? (
                        // Update Button
                        <Tooltip title="Update">
                          <span>
                            {" "}
                            {/* Wrapper to fix MUI disabled Tooltip issue */}
                            <Button
                              disabled={updateButtonClicked}
                              variant="contained"
                              color="success"
                              onClick={async () => {
                                setHasChanges(false);
                                // setUpdateButtonClicked(false); // Disable button before API call
                                try {
                                  await validateAndPostService(
                                    "services_actual",
                                    appointmentDataLog,
                                    "update"
                                  );
                                } catch (error) {
                                  // setUpdateButtonClicked(false); // Re-enable button if error occurs
                                }
                              }}
                              sx={{
                                marginRight: 2,
                                height: "40px",
                                width: "120px",
                              }}
                              startIcon={<UpdateIcon />}
                            >
                              Update
                            </Button>
                          </span>
                        </Tooltip>
                      ) : (
                        // Save Button
                        <Tooltip title="Save">
                          <span>
                            {" "}
                            {/* Wrapper to fix MUI disabled Tooltip issue */}
                            <Button
                              disabled={saveButtonClicked}
                              variant="contained"
                              color="warning"
                              onClick={async () => {
                                setHasChanges(false);
                                setSaveButtonClicked(true); // Disable button before API call
                                setUpdateButtonClicked(false); // Enable Button
                                try {
                                  await validateAndPostService(
                                    "services_actual",
                                    appointmentDataLog,
                                    "save"
                                  );
                                } catch (error) {
                                  setSaveButtonClicked(false); // Re-enable button if error occurs
                                  setUpdateButtonClicked(true); // Enable Button
                                }
                                // try {
                                // generatePDF();
                                // } catch (error) {
                                //   setSaveButtonClicked(false); // Re-enable button if error occurs
                                // }
                              }}
                              sx={{
                                marginRight: 2,
                                height: "40px",
                                width: "120px",
                              }}
                              startIcon={<SaveIcon />}
                            >
                              Save
                            </Button>
                          </span>
                        </Tooltip>
                      )}
                    </Box>
                  </Box>
                </div>
                <Divider sx={{ marginBottom: 2 }} />

                {/* //? Table Start */}
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell align="center" sx={{ width: "180px" }}>
                          Spare List
                        </TableCell>
                        <TableCell align="center" sx={{ width: "30px" }}>
                          Qty
                        </TableCell>
                        <TableCell align="center" sx={{ width: "80px" }}>
                          UOM
                        </TableCell>
                        <TableCell align="center" sx={{ width: "10px" }}>
                          Price
                        </TableCell>
                        <TableCell align="center" sx={{ width: "80px" }}>
                          Tax
                        </TableCell>
                        <TableCell align="left">Stock</TableCell>
                        <TableCell align="center">Estimated Amount</TableCell>
                        <TableCell align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>

                    {/* //? Table Body */}

                    <TableBody>
                      {estimateItems.map((item, index) => {
                        const selectedItem = inventory.find(
                          (invItem) => invItem.part_name === item.spareList
                        );
                        const isStockInsufficient =
                          selectedItem && selectedItem.quantity < item.qty;

                        // Find the UOM from the services_actual data
                        const service = appointmentDataLog.services_actual.find(
                          (service) => service.service_id === item.service_id
                        );
                        const preSelectedUOM = service ? service.uom : "";

                        // Check if PR number exists for the current service
                        const currentService =
                          appointmentDataLog.services_actual.find(
                            (service) => service.service_id === item.service_id
                          );

                        // Find the specific item in the current service's items_required
                        const currentItem = currentService?.items_required.find(
                          (requiredItem) =>
                            requiredItem.item_name === item.spareList
                        );

                        // Access the pr_no from the currentItem
                        const prNo = currentItem?.pr_no;

                        return (
                          <TableRow key={index}>
                            {/* //? Spare List */}
                            <TableCell>
                              <Autocomplete
                                size="small"
                                disablePortal
                                options={inventory.map(
                                  (option) => option.part_name
                                )} // Show all items in the Spare List
                                value={item.spareList || ""}
                                onChange={(e, newValue) => {
                                  setHasChanges(true);
                                  handleSpareListChange(index, newValue);
                                  const selectedItem = inventory.find(
                                    (invItem) => invItem.part_name === newValue
                                  );
                                  if (selectedItem) {
                                    updateEstimateItem(
                                      index,
                                      "type",
                                      selectedItem.category
                                    ); // Update type based on selected Spare List
                                  }
                                }}
                                sx={{ width: 300 }}
                                renderInput={(params) => (
                                  <TextField {...params} />
                                )}
                                onInputChange={(event, newValue) => {
                                  setTypedname(newValue);
                                }}
                                noOptionsText={
                                  <Box
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="space-between"
                                  >
                                    <Typography variant="body1">
                                      No Items Available
                                    </Typography>
                                    <Button
                                      size="small"
                                      color="primary"
                                      onClick={() => {
                                        setOpenAddProductModal(true);
                                        // console.log("Add button clicked");
                                      }}
                                    >
                                      Add
                                    </Button>
                                  </Box>
                                }
                              />
                            </TableCell>

                            {/* //? Quantity */}
                            <TableCell>
                              <TextField
                                value={item.qty}
                                size="small"
                                type="number"
                                inputProps={{ step: "0.5", min: "0" }}
                                onKeyDown={(e) => handleKeyPress(e, index)}
                                onChange={(e) => {
                                  setHasChanges(true);
                                  let newValue = e.target.value;

                                  // Allow empty value for deletion
                                  if (newValue === "") {
                                    updateEstimateItem(index, "qty", "");
                                    return;
                                  }

                                  newValue = parseFloat(newValue);
                                  if (isNaN(newValue) || newValue < 0) {
                                    return; // Prevent invalid values
                                  }

                                  updateEstimateItem(
                                    index,
                                    "qty",
                                    parseFloat(newValue.toFixed(1))
                                  );
                                }}
                                fullWidth
                                sx={{ width: "100px", margin: "0 5px" }}
                              />
                            </TableCell>

                            {/* //? UoM */}
                            <TableCell>
                              <Typography>
                                {item.type === "Services"
                                  ? inventory.find(
                                    (invItem) =>
                                      invItem.part_name === item.spareList
                                  )?.uom || "N/A"
                                  : inventory.find(
                                    (invItem) =>
                                      invItem.part_name === item.spareList
                                  )?.uom || "N/A"}
                              </Typography>
                            </TableCell>

                            {/* //? Price */}
                            <TableCell>
                              {item.type === "Services" ? (
                                <TextField
                                  value={item.price}
                                  size="small"
                                  min="0"
                                  onKeyDown={(e) => handleKeyPress(e, index)}
                                  onChange={(e) => {
                                    setHasChanges(true);
                                    updateEstimateItem(
                                      index,
                                      "price",
                                      e.target.value
                                    );
                                  }}
                                  fullWidth
                                  sx={{ width: "100px" }}
                                />
                              ) : (
                                <TextField
                                  value={item.price}
                                  size="small"
                                  type="number"
                                  onChange={(e) => {
                                    setHasChanges(true);
                                    const value = e.target.value;
                                    // Check if the value is a valid number and greater than or equal to 0
                                    if (value >= 0 || value === "") {
                                      updateEstimateItem(index, "price", value);
                                    }
                                  }}
                                  fullWidth
                                  sx={{ width: "100px" }}
                                  onKeyDown={(e) => handleKeyPress(e, index)}
                                />
                              )}
                            </TableCell>

                            {/* //? Tax */}
                            <TableCell>
                              <TextField
                                select
                                size="small"
                                sx={{ width: "80px" }}
                                value={item.tax || "0"}
                                onKeyDown={(e) => handleKeyPress(e, index)}
                                onChange={(e) => {
                                  setHasChanges(true);
                                  const newTax = e.target.value;
                                  updateEstimateItem(index, "tax", newTax);
                                  // Recalculate the estimated amount when tax changes
                                  calculateEstimatedAmount(
                                    index,
                                    estimateItems
                                  );
                                }}
                                fullWidth
                                SelectProps={{
                                  native: true,
                                }}
                                inputRef={
                                  index === estimateItems.length - 1
                                    ? lastInputRef
                                    : null
                                }
                              >
                                <option value="0">0%</option>
                                <option value="5">5%</option>
                                <option value="12">12%</option>
                                <option value="18">18%</option>
                                <option value="28">28%</option>
                              </TextField>
                            </TableCell>

                            {/* //? Stock */}
                            <TableCell>
                              <Box display="flex" alignItems="left">
                                <Typography>
                                  {item.type === "Services"
                                    ? "---"
                                    : selectedItem
                                      ? selectedItem.quantity
                                      : 0}
                                </Typography>
                              </Box>
                            </TableCell>

                            {/* //? Estimated Amount */}
                            <TableCell align="center">
                              <Typography>
                                {parseFloat(item.estimatedAmount).toFixed(2)}
                              </Typography>
                            </TableCell>

                            {/* //? Actions */}
                            <TableCell sx={{ padding: "0px 2px" }}>
                              {" "}
                              {/* 2px gap */}
                              <IconButton
                                disabled={disableDelete}
                                onClick={() => handleDeleteClick(index)}
                              >
                                <DeleteIcon />
                              </IconButton>
                              <IconButton
                                onClick={handleAddNewRow}
                                color="primary"
                                sx={{
                                  marginRight: "2px", // Add 2px right margin
                                  display:
                                    index !== estimateItems.length - 1
                                      ? "none"
                                      : "inline-flex", // Hide button if not last row
                                }}
                              >
                                <AddIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Paper
                  elevation={3}
                  sx={{ padding: 3, borderRadius: 2, marginBottom: 3 }}
                >
                  <Typography variant="h6" gutterBottom>
                    Summary
                  </Typography>
                  <Divider sx={{ marginBottom: 2 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="body1">
                        <strong>Total:</strong>{" "}
                        {grandTotal.toFixed(2) - totalTax.toFixed(2)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="body1">
                        <strong>Total Tax:</strong> {totalTax.toFixed(2)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="body1">
                        <strong>Overall Total:</strong>{" "}
                        {overallTotal.toFixed(2)}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Paper>
            </Box>
          )}

          {/* Chat Box */}
          {/* <LiveChat room={appointmentId} /> */}
        </Box>
      </Box>

      <Dialog
        open={openDialog}
        onClose={handleCancel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Confirm Service Deletion"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this service? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
