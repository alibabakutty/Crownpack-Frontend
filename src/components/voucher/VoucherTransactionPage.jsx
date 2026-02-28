import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import VoucherTable from './VoucherTable';
import FetchElements from './FetchElements';

const VoucherTransactionPage = () => {
  const [voucherNumber, setVoucherNumber] = useState('VCH-10001');
  const [currentDateTime, setCurrentDateTime] = useState('');
  const [rows, setRows] = useState([
    {
      id: 1,
      ledgerCode: '',
      ledgerName: '',
      d1Amount: '',
      d1Type: 'Debit',
      d2Amount: '',
      d2Type: 'Debit',
      d3Amount: '',
      d3Type: 'Debit',
      totalDr: '',
      totalCr: '',
      netAmt: '',
    },
  ]);
  const [nextRowId, setNextRowId] = useState(2);
  const navigate = useNavigate();
  const { ledgerOptions } = FetchElements();  // this is a hook


  // Set current date and time on component mount
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      // Format date as DD-MM-YYYY
      const day = now.getDate().toString().padStart(2, '0');
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      const year = now.getFullYear();

      // Format time as HH:mm:ss (24 hour)
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const seconds = now.getSeconds().toString().padStart(2, '0');

      const formatted = `${day}-${month}-${year} - ${hours}:${minutes}:${seconds}`;
      setCurrentDateTime(formatted);
    };

    updateDateTime();

    const interval = setInterval(updateDateTime, 100);

    return () => clearInterval(interval);
  }, []);

  // Add new row
  const addNewRow = () => {
    const newRowId = nextRowId;
    setRows(prevRows => [
      ...prevRows,
      {
        id: newRowId,
        ledgerCode: '',
        ledgerName: '',
        d1Amount: '',
        d1Type: 'Debit',
        d2Amount: '',
        d2Type: 'Debit',
        d3Amount: '',
        d3Type: 'Debit',
        totalDr: '',
        totalCr: '',
        netAmt: '',
      },
    ]);
    setNextRowId(prevId => prevId + 1);
  };

  // Remove row
  const removeRow = rowId => {
    if (rows.length > 1) {
      setRows(prevRows => prevRows.filter(row => row.id !== rowId));
    }
  };

  // Handle input changes
  const handleInputChange = (rowId, field, value) => {
    setRows(prevRows => prevRows.map(row => {
      if (row.id === rowId) {
        const updatedRow = { ...row, [field]: value };
        
        // Auto-calculate totals when amounts or types change
        if (field.includes('Amount') || field.includes('Type')) {
          return calculateRowTotals(updatedRow);
        }
        
        return updatedRow;
      }
      return row;
    }));
  };

  const handleLedgerChange = (rowId, selectedOption) => {
    setRows(prevRows => prevRows.map(row => {
      if (row.id === rowId) {
        return {
          ...row,
          ledgerCode: selectedOption ? selectedOption.value : '',
          ledgerName: selectedOption ? selectedOption.ledger_name : '',
        };
      }
      return row;
    }))
  }

  // Calculate row totals
  const calculateRowTotals = (row) => {
    const d1Dr = row.d1Type === 'Debit' ? (parseFloat(row.d1Amount) || 0) : 0;
    const d1Cr = row.d1Type === 'Credit' ? (parseFloat(row.d1Amount) || 0) : 0;
    
    const d2Dr = row.d2Type === 'Debit' ? (parseFloat(row.d2Amount) || 0) : 0;
    const d2Cr = row.d2Type === 'Credit' ? (parseFloat(row.d2Amount) || 0) : 0;
    
    const d3Dr = row.d3Type === 'Debit' ? (parseFloat(row.d3Amount) || 0) : 0;
    const d3Cr = row.d3Type === 'Credit' ? (parseFloat(row.d3Amount) || 0) : 0;

    const totalDr = d1Dr + d2Dr + d3Dr;
    const totalCr = d1Cr + d2Cr + d3Cr;
    const netAmt = totalDr - totalCr;

    return {
      ...row,
      totalDr: totalDr.toFixed(2),
      totalCr: totalCr.toFixed(2),
      netAmt: netAmt.toFixed(2),
    };
  };

  // Calculate grand totals
  const calculateGrandTotals = () => {
    const grandTotalDr = rows.reduce((sum, row) => sum + (parseFloat(row.totalDr) || 0), 0);
    const grandTotalCr = rows.reduce((sum, row) => sum + (parseFloat(row.totalCr) || 0), 0);
    const grandNetAmt = grandTotalDr - grandTotalCr;

    return {
      grandTotalDr: grandTotalDr.toFixed(2),
      grandTotalCr: grandTotalCr.toFixed(2),
      grandNetAmt: grandNetAmt.toFixed(2),
    };
  };

  const { grandTotalDr, grandTotalCr, grandNetAmt } = calculateGrandTotals();

  const handleBack = () => {
    navigate(-1);
  };

  const handleSubmit = () => {
    console.log('Voucher Data:', {
      voucherNumber,
      dateTime: currentDateTime,
      transactions: rows,
      totals: { grandTotalDr, grandTotalCr, grandNetAmt },
    });
    alert('Voucher submitted successfully!');
  };

  return (
    <div className="flex font-amasis">
      <div className="w-full h-screen border border-gray-600 bg-amber-50">
        {/* Header */}
        <div className="">
          <div className="absolute">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-white hover:text-gray-200 transition-colors bg-white/20 hover:bg-white/30 rounded-lg backdrop-blur-sm mt-1 ml-1 cursor-pointer"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
            </button>
          </div>

          <h2 className="px-1 py-0.3 bg-green-800 text-white text-center text-[13px] pl-3">
            Voucher Transaction
          </h2>
        </div>

        {/* Voucher Number and Date Time Header */}
        <div className="flex justify-between items-center px-4 py-2 bg-blue-100 border-b border-gray-300">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">MT.No:</span>
              <input
                type="text"
                value={voucherNumber}
                className="px-2 py-1 text-sm border border-gray-300 rounded w-32 focus:outline-none focus:border-blue-500"
                placeholder="Voucher No"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">Date & Time:</span>
            <span className="text-sm bg-white px-3 py-1 border border-gray-300 rounded">
              {currentDateTime}
            </span>
          </div>
        </div>

        {/* Transaction Table Component */}
        <VoucherTable
          rows={rows}
          onAddRow={addNewRow}
          onRemoveRow={removeRow}
          onInputChange={handleInputChange}
          onLedgerChange={handleLedgerChange}
          ledgerOptions={ledgerOptions}
          grandTotalDr={grandTotalDr}
          grandTotalCr={grandTotalCr}
          grandNetAmt={grandNetAmt}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
};

export default VoucherTransactionPage;