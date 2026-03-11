import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import VoucherTable from '../components/VoucherTable';
import VoucherHeader from '../components/VoucherHeader';
import VoucherControls from '../components/VoucherControls';
import VoucherFooter from '../components/VoucherFooter';
import { useVoucherMode } from '../hooks/useVoucherMode';
import { useVoucherData } from '../hooks/useVoucherData';
import { useVoucherCalculations } from '../hooks/useVoucherCalculations';
import { useDateTime } from '../hooks/useDateTime';
import { voucherService } from '../services/voucherService';
import FetchElements from '../components/FetchElements';

const VoucherTransactionPage = () => {
  const navigate = useNavigate();
  const { mode, voucherNumberParam, ledger, path } = useVoucherMode();
  const currentDateTime = useDateTime();
  const { ledgerOptions } = FetchElements();
  const [divisionType, setDivisionType] = useState('single');
  const [numberOfDivisions, setNumberOfDivisions] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    voucherNumber,
    rows,
    setRows,
    voucherList,
    currentVoucherIndex,
    searchLedger,
    loading,
    fetchedDivisionType,
    handlePreviousVoucher,
    handleNextVoucher,
    addNewRow,
    removeRow,
    handleLedgerChange,
    resetForm,
    initializeRows
  } = useVoucherData(mode, divisionType, voucherNumberParam, ledger);

  const {
    handleInputChange,
    grandTotals,
    divisionTotals
  } = useVoucherCalculations(rows, setRows, divisionType, numberOfDivisions);

  // Log when fetchedDivisionType changes
  useEffect(() => {
    console.log("🟡 fetchedDivisionType in component:", fetchedDivisionType);
    console.log("🟡 Current divisionType state:", divisionType);
    console.log("🟡 Current mode:", mode);
  }, [fetchedDivisionType, divisionType, mode]);

  // Log when divisionType state changes
  useEffect(() => {
    console.log("🔵 divisionType state changed to:", divisionType);
  }, [divisionType]);

  // SINGLE useEffect for division type management
  useEffect(() => {
    console.log("🟢 Division type useEffect - Mode:", mode, "fetchedDivisionType:", fetchedDivisionType);
    
    if (mode === 'create') {
      // For create mode, use path
      if (path.includes('/voucher-transaction-single')) {
        console.log("🟢 Setting divisionType to single from path");
        setDivisionType('single');
      }
      if (path.includes('/voucher-transaction-multiple')) {
        console.log("🟢 Setting divisionType to multiple from path");
        setDivisionType('multiple');
      }
    } else {
      // For update/view/ledger modes, use fetched division type when available
      if (fetchedDivisionType) {
        console.log("🟢 Setting divisionType to fetched:", fetchedDivisionType);
        setDivisionType(fetchedDivisionType);
      }
    }
  }, [mode, path, fetchedDivisionType]);

  // Initialize rows when division type changes in create mode ONLY
  useEffect(() => {
    console.log("🔴 Initialize rows useEffect - mode:", mode, "divisionType:", divisionType);
    if (mode === 'create') {
      console.log("🔴 Initializing rows for create mode");
      initializeRows(divisionType, numberOfDivisions);
    }
  }, [divisionType, numberOfDivisions, mode, initializeRows]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        navigate(-1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  // Handle create voucher
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
      const data = await voucherService.createVoucher(voucherData);
      
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

  // Handle update voucher
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
      const data = await voucherService.updateVoucher(voucherNumber, voucherData);
      
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

  const handleAddRow = () => addNewRow(divisionType, numberOfDivisions);
  const handleRemoveRow = (rowId) => removeRow(rowId);
  const handleLedgerSelect = (rowId, option) => handleLedgerChange(rowId, option);
  const handleFieldChange = (rowId, field, value) => handleInputChange(rowId, field, value);

  const pageTitle = mode !== 'create' 
    ? (mode === 'update' 
        ? ` - View/Edit Voucher ${voucherNumberParam}` 
        : ` - All Transactions containing Ledger: ${searchLedger}`)
    : '';

  const columnWidths = {
    sno: '40px',
    ledger: '220px',
    amount: '120px',
    type: '70px',
    total: '120px',
    action: '70px',
  };

  if (loading) {
    return <div className="text-center p-4">Loading...</div>;
  }

  return (
    <div className="flex font-amasis">
      <div className="w-full h-screen border border-gray-600 bg-amber-50 flex flex-col">
        <VoucherHeader 
          mode={mode}
          title={`Voucher Transaction${pageTitle}`}
        />

        <VoucherControls
          voucherNumber={voucherNumber}
          divisionType={divisionType}
          currentDateTime={currentDateTime}
          mode={mode}
          showNavigation={mode === "ledger" && voucherList.length > 1}
          navigationProps={{
            currentIndex: currentVoucherIndex,
            totalCount: voucherList.length,
            onPrevious: handlePreviousVoucher,
            onNext: handleNextVoucher,
            voucherNumber: voucherNumber
          }}
        />

        <div className="flex-1 overflow-auto">
          <VoucherTable
            key={`${divisionType}-${voucherNumber}`}
            rows={rows}
            divisionType={divisionType}
            numberOfDivisions={numberOfDivisions}
            onAddRow={handleAddRow}
            onRemoveRow={handleRemoveRow}
            onInputChange={handleFieldChange}
            onLedgerChange={handleLedgerSelect}
            ledgerOptions={ledgerOptions}
            grandTotalDr={grandTotals.grandTotalDr}
            grandTotalCr={grandTotals.grandTotalCr}
            grandNetAmt={grandTotals.grandNetAmt}
            isSubmitting={isSubmitting}
            hideFooter={true}
            isReadOnly={mode === 'view' || mode === "ledger"}
            searchLedger={searchLedger}
          />
        </div>

        <VoucherFooter
          mode={mode}
          divisionType={divisionType}
          numberOfDivisions={numberOfDivisions}
          grandTotals={grandTotals}
          divisionTotals={divisionTotals}
          isSubmitting={isSubmitting}
          onSubmit={mode === 'create' ? handleCreateVoucher : handleUpdateVoucher}
          columnWidths={columnWidths}
        />
      </div>
    </div>
  );
};

export default VoucherTransactionPage;