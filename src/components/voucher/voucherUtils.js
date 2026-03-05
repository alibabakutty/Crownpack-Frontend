// Client-side fallback (rarely used)
export const generateClientSideVoucherNumber = () => {

  const today = new Date();

  const day = today.getDate().toString().padStart(2, "0");
  const month = (today.getMonth() + 1).toString().padStart(2, "0");
  const year = today.getFullYear().toString().slice(-2);

  // random suffix
  const randomSuffix = Math.floor(Math.random() * 9000 + 1000);

  return `VCH-${day}-${month}-${year}-${randomSuffix}`;
};


// Fetch voucher number from server (primary method)
export const fetchVoucherNumberFromServer = async () => {

  try {

    const response = await fetch("http://localhost:7000/vouchers/random-number");

    if (!response.ok) {
      throw new Error("Server error");
    }

    const data = await response.json();

    return {
      voucherNumber: data.voucherNumber,
      success: true
    };

  } catch (error) {

    console.error("Error fetching voucher number:", error);

    // fallback
    const fallbackNumber = generateClientSideVoucherNumber();

    return {
      voucherNumber: fallbackNumber,
      success: false,
      error: error.message
    };

  }

};