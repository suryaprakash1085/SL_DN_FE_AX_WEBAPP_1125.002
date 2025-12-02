import axios from 'axios';
import Cookies from "js-cookie";

const storedToken = Cookies.get("token");


export const processPayments = (payments) => {
  const processed = Object.values(
    payments.reduce((acc, payment) => {
      if ((payment.paid_status.toLowerCase() === "not paid" || payment.paid_status.toLowerCase() === "partially paid")) {
        const pendingAmount = parseFloat(payment.invoice_amount) - parseFloat(payment.paid_amount);

        if (pendingAmount > 0) {
          if (!acc[payment.vehicle_id]) {
            acc[payment.vehicle_id] = {
              ...payment,
              pendingAmount: pendingAmount,
              totalInvoiceAmount: parseFloat(payment.invoice_amount),
              totalPaidAmount: parseFloat(payment.paid_amount),
              visitCount: 1
            };
          } else {
            acc[payment.vehicle_id].visitCount += 1;
            acc[payment.vehicle_id].totalInvoiceAmount += parseFloat(payment.invoice_amount);
            acc[payment.vehicle_id].totalPaidAmount += parseFloat(payment.paid_amount);
            acc[payment.vehicle_id].pendingAmount += pendingAmount;

            if (new Date(payment.appointment_date) > new Date(acc[payment.vehicle_id].appointment_date)) {
              acc[payment.vehicle_id] = {
                ...payment,
                pendingAmount: acc[payment.vehicle_id].pendingAmount,
                totalInvoiceAmount: acc[payment.vehicle_id].totalInvoiceAmount,
                totalPaidAmount: acc[payment.vehicle_id].totalPaidAmount,
                visitCount: acc[payment.vehicle_id].visitCount
              };
            }
          }
        }
      }
      return acc;
    }, {})
  );
  return processed;
};

export const handleOptionChange = (event, setSelectedOption, setSearchText, setFilteredPayments) => {
  setSelectedOption(event.target.value);
  setSearchText("");
  setFilteredPayments([]);
};

export const handleRowClick = (vehicleId, router) => {
  router.push(`/views/finance/vendorPayment/${vehicleId}`);
};

export const getDisplayPayments = (filteredPayments, uniqueVehiclePayments) => {
  return filteredPayments.length > 0 ? filteredPayments : uniqueVehiclePayments;

};

export const fetchPayments = async () => {
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/finance/transactions?type=supplier`,
      {
        headers: {
          Authorization: `Bearer ${storedToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.log("Error fetching payments:", error);
    return [];
  }
};
