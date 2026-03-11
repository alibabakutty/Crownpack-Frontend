import api from '../../../services/api';

export const voucherService = {
  // Fetch voucher number from server
  fetchVoucherNumber: async () => {
    try {
      const response = await api.get('/vouchers/next-number');
      console.log("fetchVoucherNumber response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching voucher number:", error);
      throw error;
    }
  },

  // Get voucher by number
  getVoucherByNumber: async (voucherNumber) => {
    try {
      const response = await api.get(`/vouchers/${voucherNumber}`);
      return response.data?.data || [];
    } catch (error) {
      console.error("Error fetching voucher:", error);
      throw error;
    }
  },

  // Get vouchers by ledger
  getVouchersByLedger: async (ledgerName) => {
    try {
      const response = await api.get(`/vouchers/ledger/${encodeURIComponent(ledgerName)}`);
      return response.data?.data || [];
    } catch (error) {
      console.error("Error fetching vouchers by ledger:", error);
      throw error;
    }
  },

  // Create new voucher
  createVoucher: async (voucherData) => {
    try {
      const response = await fetch("http://localhost:7000/vouchers", {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(voucherData)
      });
      return await response.json();
    } catch (error) {
      console.error("Error creating voucher:", error);
      throw error;
    }
  },

  // Update existing voucher
  updateVoucher: async (voucherNumber, voucherData) => {
    try {
      const response = await fetch(`http://localhost:7000/vouchers/${voucherNumber}`, {
        method: 'PUT',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(voucherData)
      });
      return await response.json();
    } catch (error) {
      console.error("Error updating voucher:", error);
      throw error;
    }
  }
};