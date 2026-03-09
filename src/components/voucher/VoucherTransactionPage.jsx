import React from 'react';
import { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import VoucherTable from './VoucherTable';
import FetchElements from './FetchElements';
import { fetchVoucherNumberFromServer, formatToNaira } from './utils/voucherUtils';
import api from '../../services/api';

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
  const location = useLocation();
  const { voucherNumberParam } = useParams();
  const isUpdateVoucherTransaction = location.pathname.includes('/voucher-transaction-report');
  const mode = isUpdateVoucherTransaction ? 'update' : 'create';
  const isVoucherTransactionSingleCreate = location.pathname.includes('/voucher-transaction-single');
  const isVoucherTransactionMultipleCreate = location.pathname.includes('/voucher-transaction-multiple');

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        navigate(-1);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [navigate]);

  useEffect(() => {
    if (isVoucherTransactionSingleCreate) {
      setDivisionType('single');
    }

    if (isVoucherTransactionMultipleCreate) {
      setDivisionType('multiple')
    }
  }, [location.pathname]);

  const updateVoucherNumber = async () => {
    // Assuming you still want to fetch the base from server
    const result = await fetchVoucherNumberFromServer();

    // Extract base and append your dynamic suffix
    const baseNumber = result.voucherNumber.split('-').slice(0, -1).join('-');
    const typeSuffix = divisionType === 'single' ? 'S' : 'M';

    setVoucherNumber(`${baseNumber}-${typeSuffix}`);
  };

  // Listen for divisionType changes
  useEffect(() => {
    if (mode === 'create') {
      updateVoucherNumber();
    }
  }, [divisionType]);

  // Initialize rows based on division type
  useEffect(() => {
    if (mode === 'create') {
      initializeRows();
    }
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

  useEffect(() => {
    console.log("DEBUG: Effect Triggered. Mode:", mode, "Param:", voucherNumberParam);

    if (mode !== "update") {
      console.log("DEBUG: Exiting - Mode is not update");
      return;
    }

    if (!voucherNumberParam) {
      console.log("DEBUG: EXITED - voucherNumberParam is NULL or UNDEFINED");
      return;
    }

    const fetchVoucher = async () => {
      console.log("DEBUG: Fetching data for:", voucherNumberParam);
      try {
        const response = await api.get(`/vouchers/${voucherNumberParam}`);
        console.log("API RESPONSE FOR UPDATE:", response.data);
        const data = response.data?.data || [];

        if (data.length > 0) {
          setVoucherNumber(data[0].voucher_number);

          const firstRow = data[0];

          const isMultiple =
            parseFloat(firstRow.d2Amount) > 0 ||
            parseFloat(firstRow.d3Amount) > 0 ||
            parseFloat(firstRow.d4Amount) > 0 ||
            parseFloat(firstRow.d5Amount) > 0;

          setDivisionType(isMultiple ? 'multiple' : 'single');

          const mappedRows = data.map((item, index) => {
            // 1. Common fields for both types
            const row = {
              id: index + 1,
              ledgerCode: item.ledger_code,
              ledgerName: item.ledger_name,
              totalDr: item.totalDr,
              totalCr: item.totalCr,
              netAmt: item.netAmt
            };

            // 2. Conditional fields
            if (isMultiple) {
              return {
                ...row,
                d1Amount: item.d1Amount || '', d1Type: item.d1Type || 'Debit',
                d2Amount: item.d2Amount || '', d2Type: item.d2Type || 'Debit',
                d3Amount: item.d3Amount || '', d3Type: item.d3Type || 'Debit',
                d4Amount: item.d4Amount || '', d4Type: item.d4Type || 'Debit',
                d5Amount: item.d5Amount || '', d5Type: item.d5Type || 'Debit',
              };
            } else {
              return {
                ...row,
                amount: item.d1Amount || '',
                type: item.d1Type || 'Debit',
              };
            }
          });

          setRows(mappedRows);
          setNextRowId(mappedRows.length + 1);
        }
      } catch (error) {
        console.error("Voucher fetch error:", error);
      }
    };

    fetchVoucher();
  }, [mode, voucherNumberParam]);

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

  const calculateDivisionTotals = () => {

    const totals = {};

    for (let i = 1; i <= numberOfDivisions; i++) {
      totals[`d${i}`] = rows.reduce(
        (sum, row) => sum + (parseFloat(row[`d${i}Amount`]) || 0),
        0
      ).toFixed(2);
    }

    return totals;

  };

  const { grandTotalDr, grandTotalCr, grandNetAmt } = calculateGrandTotals();
  const divisionTotals = calculateDivisionTotals();

  const handleBack = () => {
    navigate(-1);
  };


  // Column width configuration (moved from VoucherTable)
  const columnWidths = {
    sno: '40px',
    ledger: '220px',
    amount: '120px',
    type: '70px',
    total: '120px',
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
      divisionType,
      transactions: rows
    };

    console.log("📦 Sending data:", voucherData);

    try {

      const url = mode === 'update'
        ? `http://localhost:7000/vouchers/${voucherNumber}`
        : "http://localhost:7000/vouchers";

      const method = mode === "update" ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(voucherData)
      });

      const data = await response.json();

      console.log("📥 Server response:", data);

      if (data.success) {

        alert(mode === "update"
          ? "✅ Voucher updated successfully"
          : "✅ Voucher saved successfully"
        );

        if (mode === "create") {
          await resetForm();
        }

      } else {

        alert("❌ Failed to save voucher");

      }

    } catch (error) {

      console.error("❌ API error:", error);
      alert("Server error while saving voucher");

    }

  };

  const resetForm = async () => {

    await updateVoucherNumber(); // generate new voucher

    setDivisionType("single");
    setNumberOfDivisions(5);

    initializeRows();
  };

  const divisionWidths = [140, 140, 140, 140, 140, 140];

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
                className="px-2 py-1 text-xs font-semibold border border-gray-300 rounded w-36 focus:outline-none focus:border-blue-500"
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
                    disabled={isVoucherTransactionMultipleCreate}
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
                    disabled={isVoucherTransactionSingleCreate}
                    className="cursor-pointer"
                  />
                  <span>Multiple</span>
                </label>
              </div>
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
            key={divisionType}
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
        <div className="sticky bottom-0 bg-white border-t border-slate-400 shadow-sm">
          <table className="w-full border border-slate-400 table-fixed">
            <tfoot>
              <tr className="text-[12px] bg-yellow-100">
                <td>
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="px-3 py-0.5 bg-green-500 text-white rounded hover:bg-green-600 text-xs"
                  >
                    {isSubmitting ? '...' : 'Submit'}
                  </button>
                </td>
                <td
                  colSpan={divisionType === 'single' ? 3 : 2 + (numberOfDivisions * 2)}
                  className="p-1 border border-slate-400 text-right font-bold"
                >
                  Grand Total:
                </td>

                {divisionType === "multiple" && (

                  <>
                    {Array.from({ length: numberOfDivisions }).map((_, i) => (
                      <React.Fragment key={i}>
                        {/* Value Cell */}
                        <td
                          style={{ width: `${divisionWidths[i]}px` }}
                          className="px-2 py-1 border border-slate-400 text-right font-bold"
                        >
                          {formatToNaira(divisionTotals[`d${i + 1}`])}
                        </td>

                        {/* Spacer Cell */}
                        {i !== numberOfDivisions - 1 && (
                          <td style={{ width: "15px" }} className="border border-slate-400"></td>
                        )}
                      </React.Fragment>
                    ))}
                  </>
                )}

                <td className="w-[10px] border border-slate-400 text-right font-bold">
                 
                </td>

                <td className="p-1 border border-slate-400 text-right font-bold" style={{ width: columnWidths.total }}>
                  {formatToNaira(grandTotalDr)}
                </td>
                <td className="p-1 border border-slate-400 text-right font-bold" style={{ width: columnWidths.total }}>
                  {formatToNaira(grandTotalCr)}
                </td>
                {/* <td className="p-1 border border-slate-400 text-right font-bold" style={{ width: columnWidths.total }}>
                  {formatToNaira(grandNetAmt)}
                </td> */}
                {/* <td className="p-1 border border-slate-400 text-center" style={{ width: columnWidths.action }}>
                  
                </td> */}
                <td className="w-[28px] border border-slate-400 text-right font-bold">
                 
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VoucherTransactionPage;