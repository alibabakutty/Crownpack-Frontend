import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import VoucherTable from './VoucherTable';
import FetchElements from './FetchElements';
import api from '../../services/api';

const VoucherTransactionPage = () => {
  const [voucherNumber, setVoucherNumber] = useState('VCH-10001');
  const [currentDateTime, setCurrentDateTime] = useState('');
  const [divisionType, setDivisionType] = useState('single'); // 'single' or 'multiple'
  const [numberOfDivisions, setNumberOfDivisions] = useState(3); // Default 3 for multiple
  const [rows, setRows] = useState([]);
  const [nextRowId, setNextRowId] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { ledgerOptions } = FetchElements();

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

  // ========== UPDATED HANDLE SUBMIT ==========
  const handleSubmit = async () => {
    console.log('🔵 Submit button clicked!');
    console.log('API Base URL:', api.defaults.baseURL);
    // Validation - Check if any rows have ledger selected
    const invalidRows = rows.filter(row => !row.ledgerCode);
    if (invalidRows.length > 0) {
      alert('Please select ledger for all rows');
      return;
    }

    // Validation - Check if amounts are entered
    if (divisionType === 'single') {
      const rowsWithoutAmount = rows.filter(row => !row.amount || parseFloat(row.amount) === 0);
      if (rowsWithoutAmount.length > 0) {
        alert('Please enter amount for all rows');
        return;
      }
    } else {
      // For multiple divisions, check if at least one division has amount
      const invalidMultipleRows = rows.filter(row => {
        let hasAmount = false;
        for (let i = 1; i <= numberOfDivisions; i++) {
          if (parseFloat(row[`d${i}Amount`]) > 0) {
            hasAmount = true;
            break;
          }
        }
        return !hasAmount;
      });
      
      if (invalidMultipleRows.length > 0) {
        alert('Please enter amount in at least one division for all rows');
        return;
      }
    }

    // Validation - Check if debit equals credit
    const { grandTotalDr, grandTotalCr } = calculateGrandTotals();
    if (parseFloat(grandTotalDr) !== parseFloat(grandTotalCr)) {
      alert(`Voucher is not balanced! Debit: ${grandTotalDr}, Credit: ${grandTotalCr}`);
      return;
    }

    // Prepare data for API
    const voucherData = {
      voucherNumber,
      dateTime: currentDateTime,
      divisionType,
      numberOfDivisions: divisionType === 'multiple' ? numberOfDivisions : 1,
      transactions: rows.map(row => ({
        ledgerCode: row.ledgerCode,
        ledgerName: row.ledgerName,
        // Single division fields
        amount: row.amount || 0,
        type: row.type || 'Debit',
        // Multiple division fields
        d1Amount: row.d1Amount || 0,
        d1Type: row.d1Type || 'Debit',
        d2Amount: row.d2Amount || 0,
        d2Type: row.d2Type || 'Debit',
        d3Amount: row.d3Amount || 0,
        d3Type: row.d3Type || 'Debit',
        d4Amount: row.d4Amount || 0,
        d4Type: row.d4Type || 'Debit',
        d5Amount: row.d5Amount || 0,
        d5Type: row.d5Type || 'Debit',
        // Calculated fields
        totalDr: row.totalDr || 0,
        totalCr: row.totalCr || 0,
        netAmt: row.netAmt || 0
      })),
      totals: calculateGrandTotals()
    };

    console.log('Submitting Voucher:', voucherData);
    
    // Show loading state
    setIsSubmitting(true);

    try {
      // API call to save voucher
      const response = await api.post('http://localhost:7000/vouchers', voucherData);
      
      console.log('Voucher saved successfully:', response.data);
      
      // Show success message
      alert(`Voucher ${voucherNumber} submitted successfully!`);
      
      // Reset form or navigate
      // Option 1: Reset form for new entry
      resetForm();
      
      // Option 2: Navigate to voucher list or print page
      // navigate('/vouchers/list');
      
    } catch (error) {
      console.error('Error saving voucher:', error);
      
      // Show error message
      alert(error.response?.data?.message || 'Failed to submit voucher. Please try again.');
      
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form to initial state
  const resetForm = () => {
    // Generate new voucher number
    const nextNum = parseInt(voucherNumber.split('-')[1]) + 1;
    setVoucherNumber(`VCH-${nextNum}`);
    
    // Reset rows
    setDivisionType('single');
    setNumberOfDivisions(3);
    initializeRows();
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

        {/* Controls Header - Simplified */}
        <div className="flex justify-between items-center px-4 py-2 bg-blue-100 border-b border-gray-300">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">MT.No:</span>
              <input
                type="text"
                value={voucherNumber}
                onChange={(e) => setVoucherNumber(e.target.value)}
                className="px-2 py-1 text-sm border border-gray-300 rounded w-32 focus:outline-none focus:border-blue-500"
                placeholder="Voucher No"
              />
            </div>

            {/* Division Type Selection - Clean and Simple */}
            <div className="flex items-center gap-4 ml-4">
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold">Division Type:</span>
                <label className="flex items-center gap-1 text-sm">
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
                <label className="flex items-center gap-1 text-sm">
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

              {/* Number of Divisions for Multiple Mode */}
              {divisionType === 'multiple' && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">Divisions:</span>
                  <select
                    value={numberOfDivisions}
                    onChange={(e) => setNumberOfDivisions(parseInt(e.target.value))}
                    className="px-2 py-1 text-sm border border-gray-300 rounded w-16 focus:outline-none focus:border-blue-500"
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
            <span className="text-sm font-semibold">Date & Time:</span>
            <span className="text-sm bg-white px-3 py-1 border border-gray-300 rounded">
              {currentDateTime}
            </span>
          </div>
        </div>

        {/* Transaction Table Component */}
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
        />
      </div>
    </div>
  );
};

export default VoucherTransactionPage;