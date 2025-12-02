import serviceInspection from "../src/app/views/serviceInspection/page";
import Cookies from "js-cookie";
// Function to fetch entries from the backend
export async function fetchEntries(
  setEntries,
  setFilteredEntries,
  setLoading,
  setError
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
        },
      }
    );

    if (!response.ok) throw new Error("Failed to fetch entries");

    const data = await response.json();
    console.log(data)
    setEntries(data);
    setFilteredEntries(data);
    setLoading(false);
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
  // console.log("Appointment ID:", appointmentId);
  router.push(`/views/serviceInspection/${appointmentId}`);
};
