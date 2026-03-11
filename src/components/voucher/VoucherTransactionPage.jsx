import React, { useState, useEffect } from 'react';
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
  const [voucherList, setVoucherList] = useState([]);
  const [currentVoucherIndex, setCurrentVoucherIndex] = useState(0);
  const [searchLedger, setSearchLedger] = useState('');
  const navigate = useNavigate();
  const { ledgerOptions } = FetchElements();
  const location = useLocation();
  const { voucherNumberParam, ledger } = useParams();

  const path = location.pathname;

  const isCreatePage =
    path.includes('/voucher-transaction-single') ||
    path.includes('/voucher-transaction-multiple');

  const isUpdatePage =
    path.includes('/fetch-voucher-update');

  const isLedgerPage = path.includes('/vouchers/ledger') ||
    path.includes('/secondary-fetch-ledger');

  const mode = isCreatePage ? "create" : isUpdatePage ? "update" : isLedgerPage ? "ledger" : "view";

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        navigate(-1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [navigate]);

  // Set division type based on path
  useEffect(() => {
    if (path.includes('/voucher-transaction-single')) {
      setDivisionType('single');
    }
    if (path.includes('/voucher-transaction-multiple')) {
      setDivisionType('multiple');
    }
  }, [path]);

  // Fetch voucher number
  const updateVoucherNumber = async () => {
    try {
      const result = await fetchVoucherNumberFromServer();
      const baseNumber = result.voucherNumber.split('-').slice(0, -1).join('-');
      const typeSuffix = divisionType === 'single' ? 'S' : 'M';
      setVoucherNumber(`${baseNumber}-${typeSuffix}`);
    } catch (error) {
      console.error("Error fetching voucher number:", error);
    }
  };

  // Update voucher number when division type changes
  useEffect(() => {
    if (mode === 'create') {
      updateVoucherNumber();
    }
    console.log("Now What is the Mode:", mode);
  }, [divisionType, mode]);

  // Initialize rows
  const initializeRows = () => {
    const baseRow = {
      id: 1,
      ledgerCode: '',
      ledgerName: '',
      ledgerData: null,
    };

    if (divisionType === 'single') {
      setRows([{
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
      setRows([multipleRow]);
    }
    setNextRowId(2);
  };

  // Initialize rows when division type or number of divisions changes
  useEffect(() => {
    if (mode === 'create') {
      initializeRows();
    }
  }, [divisionType, numberOfDivisions, mode]);

  // Fetch data based on mode
  useEffect(() => {
    const fetchData = async () => {
      try {

        // CASE 1: View or Update a specific voucher
        if ((mode === "view" || mode === "update") && voucherNumberParam) {

          const res = await api.get(`/vouchers/${voucherNumberParam}`);
          const data = res.data?.data || [];

          if (data.length > 0) {

            setVoucherNumber(data[0].voucher_number);

            const isMultiple = data.some(item =>
              parseFloat(item.d2Amount) > 0 ||
              parseFloat(item.d3Amount) > 0 ||
              parseFloat(item.d4Amount) > 0 ||
              parseFloat(item.d5Amount) > 0
            );

            setDivisionType(isMultiple ? "multiple" : "single");

            const mappedRows = data.map((item, index) => {

              const baseRow = {
                id: index + 1,
                ledgerCode: item.ledger_code,
                ledgerName: item.ledger_name,
                ledgerData: {
                  value: item.ledger_code,
                  ledger_name: item.ledger_name
                },
                totalDr: item.totalDr || "0.00",
                totalCr: item.totalCr || "0.00",
                netAmt: item.netAmt || "0.00"
              };

              if (isMultiple) {
                return {
                  ...baseRow,
                  d1Amount: item.d1Amount || "",
                  d1Type: item.d1Type || "Debit",
                  d2Amount: item.d2Amount || "",
                  d2Type: item.d2Type || "Debit",
                  d3Amount: item.d3Amount || "",
                  d3Type: item.d3Type || "Debit",
                  d4Amount: item.d4Amount || "",
                  d4Type: item.d4Type || "Debit",
                  d5Amount: item.d5Amount || "",
                  d5Type: item.d5Type || "Debit",
                };
              }

              return {
                ...baseRow,
                amount: item.d1Amount || "",
                type: item.d1Type || "Debit",
              };

            });

            setRows(mappedRows);
            setNextRowId(mappedRows.length + 1);
          }
        }

        // CASE 2: Ledger search (find all vouchers containing ledger)
        if (mode === "ledger" && ledger) {
          const decodedLedger = decodeURIComponent(ledger);

          setSearchLedger(decodedLedger);

          const res = await api.get(`/vouchers/ledger/${encodeURIComponent(decodedLedger)}`);
          const data = res.data?.data || [];

          if (data.length > 0) {

            const voucherMap = new Map();

            data.forEach(item => {
              if (!voucherMap.has(item.voucher_number)) {
                voucherMap.set(item.voucher_number, []);
              }
              voucherMap.get(item.voucher_number).push(item);
            });

            const uniqueVoucherNumbers = Array.from(voucherMap.keys());

            setVoucherList(uniqueVoucherNumbers);

            if (uniqueVoucherNumbers.length > 0) {
              setCurrentVoucherIndex(0);
              await loadCompleteVoucher(uniqueVoucherNumbers[0]);
            }
          }
        }

      } catch (error) {
        console.error("Fetch error:", error);
      }
    };

    fetchData();

  }, [voucherNumberParam, ledger, mode]);

  // Function to load complete voucher transaction
  const loadCompleteVoucher = async (voucherNum) => {
    try {
      const res = await api.get(`/vouchers/${voucherNum}`);
      const data = res.data?.data || [];

      if (data.length > 0) {
        setVoucherNumber(data[0].voucher_number);

        // Determine if it's multiple division
        const isMultiple = data.some(item =>
          parseFloat(item.d2Amount) > 0 ||
          parseFloat(item.d3Amount) > 0 ||
          parseFloat(item.d4Amount) > 0 ||
          parseFloat(item.d5Amount) > 0
        );

        setDivisionType(isMultiple ? 'multiple' : 'single');

        const mappedRows = data.map((item, index) => {
          const row = {
            id: index + 1,
            ledgerCode: item.ledger_code,
            ledgerName: item.ledger_name,
            ledgerData: { value: item.ledger_code, ledger_name: item.ledger_name },
            totalDr: item.totalDr || '0.00',
            totalCr: item.totalCr || '0.00',
            netAmt: item.netAmt || '0.00',
            isSearchLedger: item.ledger_code === searchLedger // Highlight the searched ledger
          };

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
      console.error("Error loading complete voucher:", error);
    }
  };

  // Handle voucher navigation in ledger mode
  const handlePreviousVoucher = async () => {
    if (currentVoucherIndex > 0) {
      const newIndex = currentVoucherIndex - 1;
      setCurrentVoucherIndex(newIndex);
      await loadCompleteVoucher(voucherList[newIndex]);
    }
  };

  const handleNextVoucher = async () => {
    if (currentVoucherIndex < voucherList.length - 1) {
      const newIndex = currentVoucherIndex + 1;
      setCurrentVoucherIndex(newIndex);
      await loadCompleteVoucher(voucherList[newIndex]);
    }
  };

  // Update date and time
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
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Add new row
  const addNewRow = () => {
    if (mode === 'view') return;

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
  const removeRow = (rowId) => {
    if (mode === 'view') return;

    if (rows.length > 1) {
      setRows(prev => prev.filter(row => row.id !== rowId));
    }
  };

  // Handle ledger selection
  const handleLedgerChange = (rowId, selectedOption) => {
    if (mode === 'view') return;

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
    if (mode === 'view') return;

    setRows(prev => prev.map(row => {
      if (row.id === rowId) {
        const updatedRow = { ...row, [field]: value };

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

  // Calculate division totals
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

  // Handle update for voucher
  const handleUpdateVoucher = async () => {
    // Validation
    const invalidRows = rows.filter(row => !row.ledgerCode);
    if (invalidRows.length > 0) {
      alert("Please select ledger for all rows");
      return;
    }

    if (divisionType === "single") {
      const rowsWithoutAmount = rows.filter(
        row => !row.amount || parseFloat(row.amount) === 0
      );
      if (rowsWithoutAmount.length > 0) {
        alert("Please enter amount for all rows");
        return;
      }
    }

    const voucherData = {
      voucherNumber,
      dateTime: currentDateTime,
      divisionType,
      transactions: rows
    };

    try {
      setIsSubmitting(true);

      const response = await fetch(`http://localhost:7000/vouchers/${voucherNumber}`, {
        method: 'PUT',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(voucherData)
      });

      const data = await response.json();

      if (data.success) {
        alert("✅ Voucher updated successfully");
      } else {
        alert("❌ Failed to update voucher");
      }
    } catch (error) {
      console.error("❌ API error:", error);
      alert("Server error while updating voucher");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle create new voucher
  const handleCreateVoucher = async () => {
    // Validation
    const invalidRows = rows.filter(row => !row.ledgerCode);
    if (invalidRows.length > 0) {
      alert("Please select ledger for all rows");
      return;
    }

    if (divisionType === "single") {
      const rowsWithoutAmount = rows.filter(
        row => !row.amount || parseFloat(row.amount) === 0
      );
      if (rowsWithoutAmount.length > 0) {
        alert("Please enter amount for all rows");
        return;
      }
    }

    const voucherData = {
      voucherNumber,
      dateTime: currentDateTime,
      divisionType,
      transactions: rows
    };

    try {
      setIsSubmitting(true);

      const response = await fetch("http://localhost:7000/vouchers", {
        method: 'POST',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(voucherData)
      });

      const data = await response.json();

      if (data.success) {
        alert("✅ Voucher saved successfully");
        await resetForm();
      } else {
        alert("❌ Failed to save voucher");
      }
    } catch (error) {
      console.error("❌ API error:", error);
      alert("Server error while saving voucher");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = async () => {
    await updateVoucherNumber();
    setDivisionType("single");
    setNumberOfDivisions(5);
    initializeRows();
  };

  const divisionWidths = [140, 140, 140, 140, 140, 140];
  const columnWidths = {
    sno: '40px',
    ledger: '220px',
    amount: '120px',
    type: '70px',
    total: '120px',
    action: '70px',
  };

  return (
    <div className="flex font-amasis">
      <div className="w-full h-screen border border-gray-600 bg-amber-50 flex flex-col">
        {/* Header */}
        <div>
          <div className="absolute flex items-center gap-2">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-white hover:text-gray-200 transition-colors bg-green-800 hover:bg-green-700 rounded-lg backdrop-blur-sm mt-1 ml-1 cursor-pointer p-1"
              title="Go back (Esc)"
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

            {/* Voucher Navigation in Ledger Mode */}
            {mode === "ledger" && voucherList.length > 1 && (
              <div className="flex items-center gap-2 ml-10 bg-blue-100 px-2 py-1 rounded">
                <button
                  onClick={handlePreviousVoucher}
                  disabled={currentVoucherIndex === 0}
                  className="px-2 py-0.5 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 text-xs"
                >
                  ← Previous
                </button>
                <span className="text-xs font-semibold">
                  Voucher {currentVoucherIndex + 1} of {voucherList.length}
                </span>
                <button
                  onClick={handleNextVoucher}
                  disabled={currentVoucherIndex === voucherList.length - 1}
                  className="px-2 py-0.5 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 text-xs"
                >
                  Next →
                </button>
              </div>
            )}
          </div>

          <h2 className="px-1 py-0.3 bg-green-800 text-white text-center text-[13px] pl-3">
            Voucher Transaction
            {mode !== 'create' && (
              mode === 'update'
                ? ` - View/Edit Voucher ${voucherNumberParam}`
                : ` - All Transactions containing Ledger: ${searchLedger}`
            )}
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
                readOnly
                className="px-2 py-1 text-xs font-semibold border border-gray-300 rounded w-36 focus:outline-none focus:border-blue-500 bg-gray-100"
                placeholder="Voucher No"
              />
            </div>

            <div className="flex items-center gap-4 ml-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold">Division Type:</span>
                <span className="text-xs font-semibold bg-white px-3 py-1 border border-gray-300 rounded">
                  {divisionType === 'single' ? 'Single' : 'Multiple'}
                </span>
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
            key={`${divisionType}-${voucherNumber}`}
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
            onSubmit={mode === 'create' ? handleCreateVoucher : handleUpdateVoucher}
            hideFooter={true}
            isReadOnly={(mode === 'view' || mode === "ledger")} // Make fields read-only in view mode
            searchLedger={searchLedger} // Pass the search ledger to highlight it
          />
        </div>

        {/* Sticky Grand Total Footer */}
        <div className="sticky bottom-0 bg-white border-t border-slate-400 shadow-sm">
          <table className="w-full border border-slate-400 table-fixed">
            <tfoot>
              <tr className="text-[12px] bg-yellow-100">
                <td className="p-1 border border-slate-400">
                  {(mode === "create" || mode === "update") && (
                    <button
                      onClick={mode === 'create' ? handleCreateVoucher : handleUpdateVoucher}
                      disabled={isSubmitting}
                      className="px-3 py-0.5 bg-green-500 text-white rounded hover:bg-green-600 text-xs disabled:bg-gray-400"
                    >
                      {isSubmitting ? 'Saving...' : mode === 'create' ? 'Submit' : 'Update'}
                    </button>
                  )}
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
                        <td
                          style={{ width: `${divisionWidths[i]}px` }}
                          className="px-2 py-1 border border-slate-400 text-right font-bold"
                        >
                          {formatToNaira(divisionTotals[`d${i + 1}`])}
                        </td>
                        {i !== numberOfDivisions - 1 && (
                          <td style={{ width: "15px" }} className="border border-slate-400"></td>
                        )}
                      </React.Fragment>
                    ))}
                  </>
                )}

                <td className="w-[10px] border border-slate-400 text-right font-bold"></td>
                <td className="p-1 border border-slate-400 text-right font-bold" style={{ width: columnWidths.total }}>
                  {formatToNaira(grandTotalDr)}
                </td>
                <td className="p-1 border border-slate-400 text-right font-bold" style={{ width: columnWidths.total }}>
                  {formatToNaira(grandTotalCr)}
                </td>
                <td className="w-[28px] border border-slate-400 text-right font-bold"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VoucherTransactionPage;