import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import VoucherTable from './VoucherTable';
import FetchElements from './FetchElements';
import { fetchVoucherNumberFromServer, formatNumber } from './utils/voucherUtils';

const VoucherTransactionPage = () => {
  const [voucherNumber, setVoucherNumber] = useState('');
  const [currentDateTime, setCurrentDateTime] = useState('');
  const [divisionType, setDivisionType] = useState('single');
  const [numberOfDivisions, setNumberOfDivisions] = useState(5);
  const [rows, setRows] = useState([]);
  const [nextRowId, setNextRowId] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { ledgerOptions } = FetchElements();

  const fetchVoucherNumber = async () => {

  const result = await fetchVoucherNumberFromServer();

  console.log("Generated Voucher:", result);

  setVoucherNumber(result.voucherNumber);

};

  useEffect(() => {

    fetchVoucherNumber();

  }, []);

  // Initialize rows based on division type
  useEffect(() => {
    initializeRows();
  }, [divisionType, numberOfDivisions]);

  const initializeRows = () => {
    const baseRow = {
      id: 1,
      ledgerCode: '',
      ledgerName: '',
      ledgerData: null, // Store full ledger data
    };

    if (divisionType === 'single') {
      // Single division: only amount and type
      setRows([{
        ...baseRow,
        amount: '',
        type: 'Debit',
        totalDr: '',
        totalCr: '',
        netAmt: '',
      }]);
    } else {
      // Multiple divisions: create dynamic division fields
      const multipleRow = { ...baseRow };
      for (let i = 1; i <= numberOfDivisions; i++) {
        multipleRow[`d${i}Amount`] = '';
        multipleRow[`d${i}Type`] = 'Debit';
      }
      multipleRow.totalDr = '';
      multipleRow.totalCr = '';
      multipleRow.netAmt = '';
      setRows([multipleRow]);
    }
    setNextRowId(2);
  };

  // Set current date and time
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const day = now.getDate().toString().padStart(2, '0');
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      const year = now.getFullYear();
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
    const baseRow = {
      id: newRowId,
      ledgerCode: '',
      ledgerName: '',
      ledgerData: null,
    };

    if (divisionType === 'single') {
      setRows(prev => [...prev, {
        ...baseRow,
        amount: '',
        type: 'Debit',
        totalDr: '',
        totalCr: '',
        netAmt: '',
      }]);
    } else {
      const multipleRow = { ...baseRow };
      for (let i = 1; i <= numberOfDivisions; i++) {
        multipleRow[`d${i}Amount`] = '';
        multipleRow[`d${i}Type`] = 'Debit';
      }
      multipleRow.totalDr = '';
      multipleRow.totalCr = '';
      multipleRow.netAmt = '';
      setRows(prev => [...prev, multipleRow]);
    }
    setNextRowId(prev => prev + 1);
  };

  // Remove row
  const removeRow = rowId => {
    if (rows.length > 1) {
      setRows(prev => prev.filter(row => row.id !== rowId));
    }
  };

  // Handle ledger selection
  const handleLedgerChange = (rowId, selectedOption) => {
    setRows(prev => prev.map(row => {
      if (row.id === rowId) {
        return {
          ...row,
          ledgerCode: selectedOption ? selectedOption.value : '',
          ledgerName: selectedOption ? selectedOption.ledger_name : '',
          ledgerData: selectedOption || null,
        };
      }
      return row;
    }));
  };

  // Handle input changes
  const handleInputChange = (rowId, field, value) => {
    setRows(prev => prev.map(row => {
      if (row.id === rowId) {
        const updatedRow = { ...row, [field]: value };

        // Auto-calculate totals
        if (divisionType === 'single') {
          return calculateSingleRowTotals(updatedRow);
        } else {
          return calculateMultipleRowTotals(updatedRow, numberOfDivisions);
        }
      }
      return row;
    }));
  };

  // Calculate totals for single division
  const calculateSingleRowTotals = (row) => {
    const amount = parseFloat(row.amount) || 0;
    const totalDr = row.type === 'Debit' ? amount : 0;
    const totalCr = row.type === 'Credit' ? amount : 0;
    const netAmt = totalDr - totalCr;

    return {
      ...row,
      totalDr: totalDr.toFixed(2),
      totalCr: totalCr.toFixed(2),
      netAmt: netAmt.toFixed(2),
    };
  };

  // Calculate totals for multiple divisions
  const calculateMultipleRowTotals = (row, numDivisions) => {
    let totalDr = 0;
    let totalCr = 0;

    for (let i = 1; i <= numDivisions; i++) {
      const amount = parseFloat(row[`d${i}Amount`]) || 0;
      const type = row[`d${i}Type`];

      if (type === 'Debit') {
        totalDr += amount;
      } else {
        totalCr += amount;
      }
    }

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
  

  // Column width configuration (moved from VoucherTable)
  const columnWidths = {
    sno: '40px',
    ledger: '220px',
    amount: '120px',
    type: '70px',
    total: '150px',
    action: '70px',
  };

  const handleSubmit = async () => {

  console.log("🔵 Submit button clicked!");
  console.log("Rows:", rows);

  // Ledger validation
  const invalidRows = rows.filter(row => !row.ledgerCode);

  if (invalidRows.length > 0) {
    alert("Please select ledger for all rows");
    return;
  }

  // Amount validation for single division
  if (divisionType === "single") {

    const rowsWithoutAmount = rows.filter(
      row => !row.amount || parseFloat(row.amount) === 0
    );

    if (rowsWithoutAmount.length > 0) {
      alert("Please enter amount for all rows");
      return;
    }
  }

  console.log("✅ Validation passed");

  // NEW STRUCTURE (simpler)
  const voucherData = {
    voucherNumber,
    dateTime: currentDateTime,
    transactions: rows
  };

  console.log("📦 Sending data:", voucherData);

  try {

    const response = await fetch("http://localhost:7000/vouchers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(voucherData)
    });

    const data = await response.json();

    console.log("📥 Server response:", data);

    if (data.success) {

      alert("✅ Voucher saved successfully");

      await resetForm();

    } else {

      alert("❌ Failed to save voucher");

    }

  } catch (error) {

    console.error("❌ API error:", error);
    alert("Server error while saving voucher");

  }

};

  const resetForm = async () => {

  await fetchVoucherNumber(); // generate new voucher

  setDivisionType("single");
  setNumberOfDivisions(5);

  initializeRows();

};

  return (
    <div className="flex font-amasis">
      <div className="w-full h-screen border border-gray-600 bg-amber-50 flex flex-col">
        {/* Header */}
        <div>
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

        {/* Controls Header */}
        <div className="flex justify-between items-center px-4 py-1 bg-blue-100 border-b border-gray-300">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold">MT.No:</span>
              <input
                type="text"
                value={voucherNumber}
                // onChange={(e) => setVoucherNumber(e.target.value)}
                readOnly
                className="px-2 py-1 text-xs font-semibold border border-gray-300 rounded w-32 focus:outline-none focus:border-blue-500"
                placeholder="Voucher No"
              />
            </div>

            <div className="flex items-center gap-4 ml-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold">Division Type:</span>
                <label className="flex items-center gap-1 text-xs font-semibold">
                  <input
                    type="radio"
                    name="divisionType"
                    value="single"
                    checked={divisionType === 'single'}
                    onChange={(e) => setDivisionType(e.target.value)}
                    className="cursor-pointer"
                  />
                  <span>Single</span>
                </label>
                <label className="flex items-center gap-1 text-xs font-semibold">
                  <input
                    type="radio"
                    name="divisionType"
                    value="multiple"
                    checked={divisionType === 'multiple'}
                    onChange={(e) => setDivisionType(e.target.value)}
                    className="cursor-pointer"
                  />
                  <span>Multiple</span>
                </label>
              </div>

              {divisionType === 'multiple' && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold">Divisions:</span>
                  <select
                    value={numberOfDivisions}
                    onChange={(e) => setNumberOfDivisions(parseInt(e.target.value))}
                    className="px-1 py-0.5 text-xs border border-gray-300 rounded w-8 focus:outline-none focus:border-blue-500 text-center"
                  >
                    {[2, 3, 4, 5].map(num => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold">Date & Time:</span>
            <span className="text-xs font-semibold bg-white px-3 py-1 border border-gray-300 rounded">
              {currentDateTime}
            </span>
          </div>
        </div>

        {/* Scrollable Table Area */}
        <div className="flex-1 overflow-auto">
          <VoucherTable
            rows={rows}
            divisionType={divisionType}
            numberOfDivisions={numberOfDivisions}
            onAddRow={addNewRow}
            onRemoveRow={removeRow}
            onInputChange={handleInputChange}
            onLedgerChange={handleLedgerChange}
            ledgerOptions={ledgerOptions}
            grandTotalDr={grandTotalDr}
            grandTotalCr={grandTotalCr}
            grandNetAmt={grandNetAmt}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit}
            hideFooter={true}
          />
        </div>

        {/* Sticky Grand Total Footer */}
        <div className="sticky bottom-0 bg-white border-t-2 border-slate-400 shadow-lg">
          <table className="w-full border border-slate-400 table-fixed">
            <tfoot>
              <tr className="text-[12px] bg-yellow-100">
                <td>
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-xs"
                  >
                    {isSubmitting ? '...' : 'Submit'}
                  </button>
                </td>
                <td
                  colSpan={divisionType === 'single' ? 3 : 2 + (numberOfDivisions * 2)}
                  className="p-2 border border-slate-400 text-right font-bold"
                >
                  Grand Total:
                </td>
                <td className="p-2 border border-slate-400 text-right font-bold" style={{ width: columnWidths.total }}>
                  {formatNumber(grandTotalDr)}
                </td>
                <td className="p-2 border border-slate-400 text-right font-bold" style={{ width: columnWidths.total }}>
                  {formatNumber(grandTotalCr)}
                </td>
                <td className="p-2 border border-slate-400 text-right font-bold" style={{ width: columnWidths.total }}>
                  {formatNumber(grandNetAmt)}
                </td>
                {/* <td className="p-1 border border-slate-400 text-center" style={{ width: columnWidths.action }}>
                  
                </td> */}
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VoucherTransactionPage;