
import Cookies from "js-cookie";
import serviceCenter from "../src/app/views/serviceCenter/page";

// Function to fetch entries from the backend
export async function fetchEntries(
  setEntries,
  setFilteredEntries,
  setLoading,
  setError,
  setNotFound
) {
  try {
    const token = Cookies.get("token");
    if (!token) {
      setError("No token found. Please log in.");
      setLoading(false);
      return;
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/appointment`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) throw new Error("Failed to fetch entries");

    const data = await response.json();
    // console.log("data", data);
    const filteredServiceData = data.filter((sd) => {
      return sd.status=="released" 
    }) 
    console.log("filteredServiceData", filteredServiceData);
    setEntries(filteredServiceData);
    setFilteredEntries(filteredServiceData);
    setLoading(false);
    if (filteredServiceData.length === 0) {
      setNotFound(true);
    } else {
      setNotFound(false);
    }
  } catch (err) {
    setError(err.message);
    setLoading(false);
  }
}

// Function to handle option changes
export const handleOptionChange = (event, setSelectedOption) => {
  setSelectedOption(event.target.value);
};

// Function to handle search input changes
export const handleSearchChange = (event, setSearchText) => {
  setSearchText(event.target.value);
};

// Function to handle search logic
export const handleSearch = (
  searchText,
  selectedOption,
  entries,
  setFilteredEntries
) => {
  if (!searchText) {
    setFilteredEntries(entries);
    return;
  }

  const results = entries.filter((tile) => {
    if (selectedOption === "vehicleModel") {
      let result =
        tile.plateNumber.toLowerCase().includes(searchText.toLowerCase()) ||
        tile.vehicle_id.toLowerCase().includes(searchText.toLowerCase());
      return result;
    } else if (selectedOption === "vehicleNumber") {
      return tile.customer_id.includes(searchText);
    }
    return false;
  });
  setFilteredEntries(results);
};

// Function to handle "Enter" key press for search
export const handleKeyPress = (event, handleSearch) => {
  if (event.key === "Enter") {
    handleSearch();
  }
};

// Function to handle card click
export const handleCardClick = (router, appointmentId) => {
  console.log("Appointment ID:", appointmentId);
  router.push(`/views/serviceCenter/${appointmentId}`);
};
