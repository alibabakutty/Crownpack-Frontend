import React, { useRef, useState } from 'react';
import Select from 'react-select';
import { formatToNaira } from './utils/voucherUtils';

const VoucherTable = ({
  rows,
  divisionType,
  numberOfDivisions,
  onAddRow,
  onRemoveRow,
  onInputChange,
  onLedgerChange,
  ledgerOptions,
}) => {
  const [focusedInput, setFocusedInput] = useState(null);
  const inputRef = useRef({});

  const getTotalCols = () => {
    return divisionType === 'single' ? 3 : numberOfDivisions * 2 + 1;
  };

  const handleKeyDown = (e, rowIndex, colIndex) => {
    const totalCols = getTotalCols();
    const totalRows = rows.length;

    // ENTER → NEXT CELL
    if (e.key === "Enter") {
      e.preventDefault();
      let nextRow = rowIndex;
      let nextCol = colIndex + 1;

      if (nextCol < totalCols) {
        moveToCell(nextRow, nextCol);
      } else {
        nextRow = rowIndex + 1;
        nextCol = 0;
        if (nextRow < totalRows) {
          moveToCell(nextRow, nextCol);
        } else {
          onAddRow();
          setTimeout(() => moveToCell(totalRows, 0), 150);
        }
      }
    }

    // BACKSPACE → PREVIOUS CELL
    if (e.key === "Backspace") {
      const isInput = e.target.tagName === "INPUT";
      const isSelect = e.target.tagName === "SELECT";

      const selectionStart = e.target.selectionStart;
      const selectionEnd = e.target.selectionEnd;

      if (isSelect || (isInput && selectionStart === 0 && selectionEnd === 0)) {
        let prevRow = rowIndex;
        let prevCol = colIndex - 1;

        if (prevCol >= 0) {
          e.preventDefault();
          moveToCell(prevRow, prevCol);
        } else if (rowIndex > 0) {
          e.preventDefault();
          moveToCell(rowIndex - 1, totalCols - 1);
        }
      }
    }
  };

  const moveToCell = (rowIndex, colIndex) => {
    const refKey = `${rowIndex}-${colIndex}`;
    const element = inputRef.current[refKey];

    if (!element) return;

    if (element.focus && !element.tagName) {
      element.focus();
    }

    setTimeout(() => {
      if (element.tagName === "INPUT") {
        element.focus();
        element.setSelectionRange(0, 0);
      } else if (element.tagName === "SELECT" || element.focus) {
        element.focus();
      }
    }, 10);
  };

  // UPDATED: More compact styles for react-select
  const customStyles = {
    control: (base, state) => ({
      ...base,
      border: 'none',
      borderRadius: '0',
      minHeight: '16px',
      height: '16px',
      fontSize: '12px',
      backgroundColor: state.isFocused ? '#fef9c4' : 'transparent',
      boxShadow: 'none',
      width: '100%',
      '&:hover': { border: 'none', boxShadow: 'none' },
      '&:focus': { border: 'none', boxShadow: 'none' }
    }),
    option: (base, state) => ({
      ...base,
      fontSize: '12px',
      fontWeight: '600',
      padding: '1px 4px',
      backgroundColor: state.isFocused ? '#dbeafe' : 'white',
      color: 'black',
      borderBottom: '1px solid #e5e7eb',
      minHeight: '14px',
    }),
    menu: base => ({
      ...base,
      fontSize: '12px',
      zIndex: 9999,
      width: '350px'
    }),
    valueContainer: base => ({
      ...base,
      padding: '0 2px',
      height: '16px',
      border: 'none'
    }),
    singleValue: base => ({
      ...base,
      fontSize: '12px',
      fontWeight: '600',
      margin: 0,
    }),
    input: base => ({
      ...base,
      fontSize: '12px',
      margin: 0,
      padding: 0,
    }),
    dropdownIndicator: () => ({ display: 'none' }),
    indicatorSeparator: () => ({ display: 'none' }),
  };

  // UPDATED: Reduced column widths
  const columnWidths = {
    sno: '30px', // Reduced from 35px
    ledger: '200px', // Reduced from 220px
    amount: '90px', // Reduced from 110px
    type: '38px', // Reduced from 45px
    total: '75px', // Reduced from 90px
    action: '30px' // Reduced from 35px
  };

  const handleAmountFocus = (e, cellKey) => {
    setFocusedInput(cellKey);
    const input = e.target;
    setTimeout(() => {
      input.setSelectionRange(0, 0);
    }, 0);
  };

  const renderRowCells = (row, rowIndex) => {
    const cells = [];
    // UPDATED: Reduced padding
    const cellClass = "p-0 border border-slate-400"; // Removed p-0.5, now p-0
    // UPDATED: Reduced height and padding
    // Inside renderRowCells
    const inputClass = "w-full px-0.5 py-0 focus:bg-yellow-100 outline-none border-none focus:ring-0 appearance-none bg-transparent text-[10px] font-semibold";

    let colIndex = 0;

    // S.No
    cells.push(
      <td key="sno" className={`${cellClass} text-center bg-gray-50 text-[12px]`} style={{ height: '16px' }}>
        {rowIndex + 1}
      </td>
    );

    // Ledger (col 0)
    const ledgerIdx = colIndex;
    cells.push(
      <td key="ledger" className={cellClass} style={{ height: '16px' }}>
        <Select
          ref={(el) => (inputRef.current[`${rowIndex}-${ledgerIdx}`] = el)}
          options={ledgerOptions}
          value={ledgerOptions.find(opt => opt.value === row.ledgerCode) || null}
          onChange={(opt) => {
            onLedgerChange(row.id, opt);
            setTimeout(() => {
              moveToCell(rowIndex, ledgerIdx + 1);
            }, 50);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Backspace') {
              // Access the internal input to check if it's empty
              const inputValue = e.target.value;

              // If the search input is empty, navigate to the previous cell
              if (!inputValue) {
                e.preventDefault();

                // Use your logic to determine the previous cell
                if (rowIndex > 0) {
                  // Go to the last column of the previous row
                  const totalCols = getTotalCols();
                  moveToCell(rowIndex - 1, totalCols - 1);
                }
                // If you are in the first row, col 0, do nothing or handle accordingly
              }
            }
          }}
          styles={customStyles}
          isSearchable
          openMenuOnFocus={true}
          menuPortalTarget={document.body}
        />
      </td>
    );
    colIndex++;

    if (divisionType === 'single') {
      // Amount (col 1)
      const amtIdx = colIndex;
      cells.push(
        <td key="amt" className={cellClass} style={{ height: '16px' }}>
          <input
            ref={(el) => (inputRef.current[`${rowIndex}-${amtIdx}`] = el)}
            type="text"
            className={`${inputClass} text-right text-[12px]`}
            value={focusedInput === `${rowIndex}-${amtIdx}`
              ? row.amount
              : formatToNaira(row.amount)}
            onFocus={(e) => handleAmountFocus(e, `${rowIndex}-${amtIdx}`)}
            onBlur={(e) => {
              setFocusedInput(null);
              onInputChange(row.id, 'amount', parseFloat(e.target.value) || 0);
            }}
            onChange={(e) => onInputChange(row.id, 'amount', e.target.value)}
            onKeyDown={e => handleKeyDown(e, rowIndex, amtIdx)}
            style={{ height: '16px' }}
          />
        </td>
      );
      colIndex++;

      // Type (col 2)
      const typIdx = colIndex;
      cells.push(
        <td key="typ" className={cellClass} style={{ height: '16px' }}>
          <select
            ref={(el) => (inputRef.current[`${rowIndex}-${typIdx}`] = el)}
            className={`${inputClass} cursor-pointer ${row.type === 'Credit' ? 'text-red-500 text-right text-[12px]' : 'text-left text-[12px]'}`}
            value={row.type || 'Debit'}
            onChange={e => onInputChange(row.id, 'type', e.target.value)}
            onKeyDown={e => handleKeyDown(e, rowIndex, typIdx)}
            style={{ height: '16px' }}
          >
            <option value="Debit">Dr</option>
            <option value="Credit">Cr</option>
          </select>
        </td>
      );
      colIndex++;
    } else {
      // Multiple division loop
      for (let i = 1; i <= numberOfDivisions; i++) {
        const dAmtIdx = colIndex;
        const amountKey = `d${i}Amount`;
        const typeKey = `d${i}Type`;
        const isCredit = row[typeKey] === 'Credit';

        // Amount Cell
        cells.push(
          <td key={`da${i}`} className={cellClass} style={{ height: '16px' }}>
            <input
              ref={(el) => (inputRef.current[`${rowIndex}-${dAmtIdx}`] = el)}
              type="text"
              className={`${inputClass} text-right text-[12px] ${isCredit ? 'text-red-500' : ''}`}
              value={focusedInput === `${rowIndex}-${dAmtIdx}`
                ? row[amountKey]
                : formatToNaira(row[amountKey])}
              onFocus={(e) => {
                setFocusedInput(`${rowIndex}-${dAmtIdx}`);
                const inputElement = e.target;
                setTimeout(() => {
                  inputElement.setSelectionRange(0, 0);
                }, 0);
              }}
              onBlur={(e) => {
                setFocusedInput(null);
                onInputChange(row.id, amountKey, parseFloat(e.target.value) || 0);
              }}
              onChange={(e) => onInputChange(row.id, amountKey, e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, rowIndex, dAmtIdx)}
              onWheel={(e) => e.target.blur()}
              style={{ height: '16px' }}
            />
          </td>
        );
        colIndex++;

        // Type Cell
        const dTypIdx = colIndex;
        cells.push(
          <td key={`dt${i}`} className={cellClass} style={{ height: '16px' }}>
            <select
              ref={(el) => (inputRef.current[`${rowIndex}-${dTypIdx}`] = el)}
              className={`${inputClass} ${isCredit ? 'text-red-500 text-right text-[12px]' : 'text-left text-[12px]'}`}
              value={row[typeKey] || 'Debit'}
              onChange={e => onInputChange(row.id, typeKey, e.target.value)}
              onKeyDown={e => handleKeyDown(e, rowIndex, dTypIdx)}
            style={{ height: '16px' }}
            >
              <option value="Debit">Dr</option>
              <option value="Credit">Cr</option>
            </select>
          </td>
        );
        colIndex++;
      }
    }

    // Totals & Actions
    cells.push(
      <td key="td" className={`${cellClass} text-[12px] text-right bg-gray-50 font-semibold`} style={{ height: '16px' }}>
        {formatToNaira(row.totalDr)}
      </td>
    );
    cells.push(
      <td key="tc" className={`${cellClass} text-[12px] text-right bg-gray-50 font-semibold`} style={{ height: '16px' }}>
        {formatToNaira(row.totalCr)}
      </td>
    );
    // cells.push(
    //   <td key="na" className={`${cellClass} text-[10px] text-right bg-gray-50 font-semibold`} style={{ height: '16px' }}>
    //     {formatNumber(row.netAmt)}
    //   </td>
    // );
    cells.push(
      <td key="at" className={`${cellClass} text-center`} style={{ height: '16px' }}>
        <button
          onClick={() => (rowIndex === rows.length - 1 ? onAddRow() : onRemoveRow(row.id))}
          className={`rounded text-white text-[9px] ${rowIndex === rows.length - 1 ? 'bg-blue-500' : 'bg-red-400'}`}
          style={{ width: '14px', height: '14px', lineHeight: '14px', padding: 0 }}
        >
          {rowIndex === rows.length - 1 ? '+' : '-'}
        </button>
      </td>
    );

    return cells;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse border border-slate-400" style={{ tableLayout: 'fixed' }}>
        {/* UPDATED: Reduced header heights */}
        <thead className="sticky top-0 bg-violet-200 z-10">
          <tr style={{ height: '20px' }}>
            <th className="p-0 border border-slate-400 text-[12px] font-semibold" style={{ width: columnWidths.sno, height: '20px' }}>S.No</th>
            <th className="p-0 border border-slate-400 text-[12px] font-semibold" style={{ width: columnWidths.ledger, height: '20px' }}>Ledger</th>
            {divisionType === 'single' ? (
              <>
                <th className="p-0 border border-slate-400 text-[12px] font-semibold" style={{ width: columnWidths.amount, height: '20px' }}>Amt</th>
                <th className="p-0 border border-slate-400 text-[12px] font-semibold" style={{ width: columnWidths.type, height: '20px' }}>Dr/Cr</th>
              </>
            ) : (
              [...Array(numberOfDivisions)].map((_, i) => (
                <React.Fragment key={i}>
                  <th className="p-0 border border-slate-400 text-[12px] font-semibold" style={{ width: '75px', height: '20px' }}>D{i + 1}</th>
                  <th className="p-0 border border-slate-400 text-[12px] font-semibold" style={{ width: '35px', height: '20px' }}>Dr/Cr</th>
                </React.Fragment>
              ))
            )}
            <th className="p-0 border border-slate-400 text-[12px] font-semibold" style={{ width: columnWidths.total, height: '20px' }}>Dr</th>
            <th className="p-0 border border-slate-400 text-[12px] font-semibold" style={{ width: columnWidths.total, height: '20px' }}>Cr</th>
            {/* <th className="p-0 border border-slate-400 text-[9px] font-semibold" style={{ width: columnWidths.total, height: '20px' }}>Net</th> */}
            <th className="p-0 border border-slate-400 text-[12px] font-semibold" style={{ width: columnWidths.action, height: '20px' }}>Act</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={row.id} style={{ height: '16px' }}>
              {renderRowCells(row, idx)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VoucherTable;