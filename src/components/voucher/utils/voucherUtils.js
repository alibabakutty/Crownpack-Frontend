// Client-side fallback (rarely used)
// In your utility file
export const generateClientSideVoucherNumber = (divisionType) => {
  const today = new Date();
  const day = today.getDate().toString().padStart(2, "0");
  const month = (today.getMonth() + 1).toString().padStart(2, "0");
  const year = today.getFullYear().toString().slice(-2);

  const randomSuffix = Math.floor(Math.random() * 9000 + 1000);

  // Determine suffix: 'S' for single, 'M' for multiple
  const typeSuffix = divisionType === 'single' ? 'S' : 'M';

  return `VCH-${day}-${month}-${year}-${randomSuffix}-${typeSuffix}`;
};


// Fetch voucher number from server (primary method)
export const fetchVoucherNumberFromServer = async (divisionType) => {
  try {
    const response = await fetch("http://localhost:7000/vouchers/random-number");

    if (!response.ok) {
      console.warn("Server returned error, using fallback...");
      // Don't throw error, just use fallback
      const fallbackNumber = generateClientSideVoucherNumber(divisionType);
      return {
        voucherNumber: fallbackNumber,
        success: false,
        error: `Server error: ${response.status}`
      };
    }

    const data = await response.json();
    return {
      voucherNumber: data.voucherNumber,
      success: true
    };

  } catch (error) {
    console.warn("Network error, using fallback...");
    // Don't throw error, just use fallback
    const fallbackNumber = generateClientSideVoucherNumber(divisionType);
    return {
      voucherNumber: fallbackNumber,
      success: false,
      error: error.message
    };
  }
};

//   const formatAmountBasicINR = (value) => {
//     if (!value) return "";
//     return Number(value).toLocaleString("en-US", {
//       minimumFractionDigits: 2,
//     });
//   };

// export const formatNumber = num => {
//   if (num === null || num === undefined || num === '') return '';
//   const cleaned = typeof num === 'string' ? num.replace(/,/g, '') : num;
//   const parsed = parseFloat(cleaned);
//   if (isNaN(parsed)) return '';
//   return parsed.toLocaleString('en-US', {
//     minimumFractionDigits: 2,
//     maximumFractionDigits: 2,
//   });
// };

// export const formatAsCurrency = (val) => {
//   if (val === null || val === undefined || val === "") return "";
//   const num = parseFloat(val);
//   if (isNaN(num)) return "";
//   return new Intl.NumberFormat('en-US', {
//     minimumFractionDigits: 2,
//     maximumFractionDigits: 2,
//   }).format(num);
// };

export const formatToNaira = (value) => {
  const num = parseFloat(value) || 0;
  return `₦ ${num.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// Convert "₦1,000.50" to 1000.5
export const parseNairaString = (value) => {
  if (typeof value !== 'string') return value;
  return parseFloat(value.replace(/[^0-9.-]+/g, '')) || 0;
};
