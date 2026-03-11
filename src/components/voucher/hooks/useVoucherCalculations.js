import { useMemo } from 'react';

export const useVoucherCalculations = (rows, setRows, divisionType, numberOfDivisions) => {
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

  // Handle input changes with calculations
  const handleInputChange = (rowId, field, value) => {
    // Now setRows is defined because we passed it in!
    setRows(prev => {
      return prev.map(row => {
        if (row.id === rowId) {
          const updatedRow = { ...row, [field]: value };

          if (divisionType === 'single') {
            return calculateSingleRowTotals(updatedRow);
          } else {
            return calculateMultipleRowTotals(updatedRow, numberOfDivisions);
          }
        }
        return row;
      });
    });
  };

  // Calculate grand totals
  const grandTotals = useMemo(() => {
    const grandTotalDr = rows.reduce((sum, row) => sum + (parseFloat(row.totalDr) || 0), 0);
    const grandTotalCr = rows.reduce((sum, row) => sum + (parseFloat(row.totalCr) || 0), 0);
    const grandNetAmt = grandTotalDr - grandTotalCr;

    return {
      grandTotalDr: grandTotalDr.toFixed(2),
      grandTotalCr: grandTotalCr.toFixed(2),
      grandNetAmt: grandNetAmt.toFixed(2),
    };
  }, [rows]);

  // Calculate division totals
  const divisionTotals = useMemo(() => {
    const totals = {};
    for (let i = 1; i <= numberOfDivisions; i++) {
      totals[`d${i}`] = rows.reduce(
        (sum, row) => sum + (parseFloat(row[`d${i}Amount`]) || 0),
        0
      ).toFixed(2);
    }
    return totals;
  }, [rows, numberOfDivisions]);

  return {
    handleInputChange,
    grandTotals,
    divisionTotals,
    calculateSingleRowTotals,
    calculateMultipleRowTotals
  };
};