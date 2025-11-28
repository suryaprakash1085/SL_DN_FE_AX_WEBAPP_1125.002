async function fetchEntries(
  token,
  setEntries,
  setLoading,
  setOpenSnackbar,
  setSnackbarMessage,
  setSnackBarSeverity
) {
  try {
    if (!token) {
      setOpenSnackbar(true);
      setSnackbarMessage(
        "Unauthorized. Please log in with appropriate user credentials."
      );
      setSnackBarSeverity("error");
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
    console.log({data})
    setEntries(data);
    setLoading(false);
  } catch (err) {
    setOpenSnackbar(true);
    setSnackbarMessage(err.message);
    setSnackBarSeverity("error");
    setLoading(false);
  }
}

// Function to handle search logic
const handleSearch = (searchText, originalEntries, setEntries) => {
  if (!searchText) {
    setEntries(originalEntries);
    return;
  }

  const results = originalEntries.filter((tile) => {
    return (
      tile.plateNumber.toLowerCase().includes(searchText.toLowerCase()) ||
      tile.vehicle_id.toLowerCase().includes(searchText.toLowerCase())
    );
  });
  setEntries(results);
};

export { fetchEntries, handleSearch };
