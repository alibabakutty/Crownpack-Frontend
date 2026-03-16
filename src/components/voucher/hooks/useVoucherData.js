import { useState, useEffect, useCallback } from "react";
import { voucherService } from "../services/voucherService";
import {
  fetchVoucherNumberFromServer,
  generateClientSideVoucherNumber
} from "../utils/voucherUtils";

const months = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

export const useVoucherData = (
  mode,
  divisionType,
  voucherNumberParam,
  ledger
) => {

  const [voucherNumber, setVoucherNumber] = useState("");
  const [month, setMonth] = useState(months[new Date().getMonth()]);
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [rows, setRows] = useState([]);
  const [nextRowId, setNextRowId] = useState(1);
  const [voucherList, setVoucherList] = useState([]);
  const [currentVoucherIndex, setCurrentVoucherIndex] = useState(0);
  const [searchLedger, setSearchLedger] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchedDivisionType, setFetchedDivisionType] = useState(null);
  const [createdBy, setCreatedBy] = useState("");
  const [verifiedBy, setVerifiedBy] = useState("");
  const [approvedBy, setApprovedBy] = useState("");

  /* ------------------------------------------------------ */
  /* GENERATE NEXT VOUCHER NUMBER (CREATE MODE) */
  /* ------------------------------------------------------ */

  const updateVoucherNumber = useCallback(async () => {
    if (mode !== "create") return;

    try {
      const result = await fetchVoucherNumberFromServer(divisionType);

      if (result && result.voucherNumber) {
        setVoucherNumber(result.voucherNumber);
      } else {
        setVoucherNumber(generateClientSideVoucherNumber(divisionType));
      }
    } catch (error) {
      console.error("Voucher fetch failed:", error);
      setVoucherNumber(generateClientSideVoucherNumber(divisionType));
    }
  }, [divisionType, mode]);

  /* ------------------------------------------------------ */
  /* LOAD COMPLETE VOUCHER */
  /* ------------------------------------------------------ */

  const loadCompleteVoucher = useCallback(
    async voucherNum => {
      setLoading(true);

      try {
        const data = await voucherService.getVoucherByNumber(voucherNum);

        if (data.length > 0) {
          setVoucherNumber(data[0].voucher_number);
          setCreatedBy(data[0].created_by || "");
          setVerifiedBy(data[0].verified_by || "");
          setApprovedBy(data[0].approved_by || "");
          if (data[0].voucher_month) setMonth(data[0].voucher_month);
          if (data[0].voucher_year) setYear(data[0].voucher_year);

          const isMultiple = data.some(
            item =>
              parseFloat(item.d2Amount) > 0 ||
              parseFloat(item.d3Amount) > 0 ||
              parseFloat(item.d4Amount) > 0 ||
              parseFloat(item.d5Amount) > 0
          );

          const fetchedType = isMultiple ? "multiple" : "single";
          setFetchedDivisionType(fetchedType);

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
              netAmt: item.netAmt || "0.00",
              isSearchLedger: item.ledger_code === searchLedger
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
                d5Type: item.d5Type || "Debit"
              };
            }

            return {
              ...baseRow,
              amount: item.d1Amount || "",
              type: item.d1Type || "Debit"
            };
          });

          setRows(mappedRows);
          setNextRowId(mappedRows.length + 1);
        }
      } catch (error) {
        console.error("Error loading voucher:", error);
      } finally {
        setLoading(false);
      }
    },
    [searchLedger]
  );

  /* ------------------------------------------------------ */
  /* INITIALIZE ROWS */
  /* ------------------------------------------------------ */

  const initializeRows = useCallback((divisionType, numberOfDivisions) => {
    const baseRow = {
      id: 1,
      ledgerCode: "",
      ledgerName: "",
      ledgerData: null
    };

    if (divisionType === "single") {
      setRows([
        {
          ...baseRow,
          amount: "",
          type: "Debit",
          totalDr: "",
          totalCr: "",
          netAmt: ""
        }
      ]);
    } else {
      const row = { ...baseRow };

      for (let i = 1; i <= numberOfDivisions; i++) {
        row[`d${i}Amount`] = "";
        row[`d${i}Type`] = "Debit";
      }

      row.totalDr = "";
      row.totalCr = "";
      row.netAmt = "";

      setRows([row]);
    }

    setNextRowId(2);
  }, []);

  /* ------------------------------------------------------ */
  /* FETCH DATA BASED ON MODE */
  /* ------------------------------------------------------ */

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setFetchedDivisionType(null);

      try {
        if ((mode === "view" || mode === "update") && voucherNumberParam) {
          await loadCompleteVoucher(voucherNumberParam);
        }

        if (mode === "ledger" && ledger) {
          setSearchLedger(ledger);

          const data = await voucherService.getVouchersByLedger(ledger);

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
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [voucherNumberParam, ledger, mode, loadCompleteVoucher]);

  /* ------------------------------------------------------ */
  /* GENERATE VOUCHER NUMBER ON CREATE MODE */
  /* ------------------------------------------------------ */

  useEffect(() => {
    if (mode === "create") {
      updateVoucherNumber();
    }
  }, [mode, updateVoucherNumber]);

  /* ------------------------------------------------------ */
  /* NAVIGATION */
  /* ------------------------------------------------------ */

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

  /* ------------------------------------------------------ */
  /* ROW MANAGEMENT */
  /* ------------------------------------------------------ */

  const addNewRow = useCallback(
    (divisionType, numberOfDivisions) => {
      const newRowId = nextRowId;

      const baseRow = {
        id: newRowId,
        ledgerCode: "",
        ledgerName: "",
        ledgerData: null
      };

      if (divisionType === "single") {
        setRows(prev => [
          ...prev,
          {
            ...baseRow,
            amount: "",
            type: "Debit",
            totalDr: "",
            totalCr: "",
            netAmt: ""
          }
        ]);
      } else {
        const row = { ...baseRow };

        for (let i = 1; i <= numberOfDivisions; i++) {
          row[`d${i}Amount`] = "";
          row[`d${i}Type`] = "Debit";
        }

        row.totalDr = "";
        row.totalCr = "";
        row.netAmt = "";

        setRows(prev => [...prev, row]);
      }

      setNextRowId(prev => prev + 1);
    },
    [nextRowId]
  );

  const removeRow = useCallback(
    rowId => {
      if (rows.length > 1) {
        setRows(prev => prev.filter(row => row.id !== rowId));
      }
    },
    [rows.length]
  );

  const handleLedgerChange = useCallback((rowId, selectedOption) => {
    setRows(prev =>
      prev.map(row => {
        if (row.id === rowId) {
          return {
            ...row,
            ledgerCode: selectedOption ? selectedOption.value : "",
            ledgerName: selectedOption ? selectedOption.ledger_name : "",
            ledgerData: selectedOption || null
          };
        }

        return row;
      })
    );
  }, []);

  /* ------------------------------------------------------ */
  /* RESET FORM AFTER SAVE */
  /* ------------------------------------------------------ */

  const resetForm = useCallback(async () => {
    await updateVoucherNumber();
    initializeRows(divisionType, 5);
    setFetchedDivisionType(null);
    setCreatedBy("");
    setVerifiedBy("");
    setApprovedBy("");
  }, [divisionType, updateVoucherNumber, initializeRows]);

  /* ------------------------------------------------------ */

  return {
    voucherNumber,
    month,
    setMonth,
    year,
    setYear,
    createdBy,
    setCreatedBy,
    verifiedBy,
    setVerifiedBy,
    approvedBy,
    setApprovedBy,
    rows,
    setRows,
    nextRowId,
    voucherList,
    currentVoucherIndex,
    searchLedger,
    loading,
    fetchedDivisionType,
    updateVoucherNumber,
    loadCompleteVoucher,
    initializeRows,
    handlePreviousVoucher,
    handleNextVoucher,
    addNewRow,
    removeRow,
    handleLedgerChange,
    resetForm
  };
};