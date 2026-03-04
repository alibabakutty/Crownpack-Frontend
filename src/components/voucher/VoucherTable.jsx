import React from 'react';
import Select from 'react-select';

const VoucherTable = ({
  rows,
  divisionType,
  numberOfDivisions,
  onAddRow,
  onRemoveRow,
  onInputChange,
  onLedgerChange,
  ledgerOptions,
  grandTotalDr,
  grandTotalCr,
  grandNetAmt,
  onSubmit,
  isSubmitting
}) => {
  // Custom styles for react-select
  const customStyles = {
    control: (base, state) => ({
      ...base,
      border: '1px solid transparent',
      borderRadius: '0',
      minHeight: '30px',
      fontSize: '12px',
      backgroundColor: state.isFocused ? '#fef9c3' : 'white',
      boxShadow: 'none',
      width: '250px', // Fixed width for dropdown
      '&:hover': {
        border: '1px solid #3b82f6',
      },
    }),
    option: (base, state) => ({
      ...base,
      fontSize: '12px',
      padding: '2px 5px',
      minHeight: '4px',
      backgroundColor: state.isFocused ? '#dbeafe' : 'white',
      color: 'black',
      borderBottom: '1px solid #e5e7eb',
      cursor: 'pointer',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    }),
    menu: base => ({
      ...base,
      fontSize: '12px',
      zIndex: 9999,
      width: '350px', // Wider menu to show full text
    }),
    singleValue: base => ({
      ...base,
      fontSize: '12px',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      maxWidth: '230px',
    }),
    input: base => ({
      ...base,
      fontSize: '12px',
      margin: '0',
      padding: '0',
    }),
    dropdownIndicator: base => ({
      ...base,
      // padding: '4px',
      display: 'none'
    }),
    clearIndicator: base => ({
      ...base,
      // padding: '4px',
      display: 'none'
    }),
    placeholder: base => ({
      ...base,
      fontSize: '12px',
      color: '#999',
    }),
    valueContainer: base => ({
      ...base,
      padding: '2px 8px',
    }),
  };

  // Column width configuration
  const columnWidths = {
    sno: '40px',
    ledger: '260px',      // Width for the Select dropdown
    amount: '120px',
    type: '70px',
    total: '100px',
    action: '70px',
  };

  // Dynamic column widths for multiple divisions
  const getDivisionColumnWidth = () => ({
    amount: '100px',
    type: '60px',
  });

  // Format number with commas
  const formatNumber = num => {
    if (!num || isNaN(num)) return '';
    return parseFloat(num).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Generate table headers based on division type
  const renderHeaders = () => {
    if (divisionType === 'single') {
      return (
        <tr className="text-[13px] border-t border-b bg-violet-200">
          <th className="p-1 border border-slate-400" style={{ width: columnWidths.sno }}>S.No</th>
          <th className="p-1 border border-slate-400 text-center" style={{ width: columnWidths.ledger }}>Ledger</th>
          <th className="p-1 border border-slate-400 text-center" style={{ width: columnWidths.amount }}>Amount</th>
          <th className="p-1 border border-slate-400 text-center" style={{ width: columnWidths.type }}>Dr/Cr</th>
          <th className="p-1 border border-slate-400 text-center" style={{ width: columnWidths.total }}>Total Dr</th>
          <th className="p-1 border border-slate-400 text-center" style={{ width: columnWidths.total }}>Total Cr</th>
          <th className="p-1 border border-slate-400 text-center" style={{ width: columnWidths.total }}>Net Amt</th>
          <th className="p-1 border border-slate-400" style={{ width: columnWidths.action }}>Action</th>
        </tr>
      );
    } else {
      const divWidth = getDivisionColumnWidth();
      return (
        <tr className="text-[13px] border-t border-b bg-violet-200">
          <th className="p-1 border border-slate-400" style={{ width: columnWidths.sno }}>S.No</th>
          <th className="p-1 border border-slate-400 text-center" style={{ width: columnWidths.ledger }}>Ledger</th>
          {[...Array(numberOfDivisions)].map((_, i) => (
            <React.Fragment key={i}>
              <th className="p-1 border border-slate-400 text-center" style={{ width: divWidth.amount }}>
                Div {i + 1}
              </th>
              <th className="p-1 border border-slate-400 text-center" style={{ width: divWidth.type }}>
                Dr/Cr
              </th>
            </React.Fragment>
          ))}
          <th className="p-1 border border-slate-400 text-center" style={{ width: columnWidths.total }}>Total Dr</th>
          <th className="p-1 border border-slate-400 text-center" style={{ width: columnWidths.total }}>Total Cr</th>
          <th className="p-1 border border-slate-400 text-center" style={{ width: columnWidths.total }}>Net Amt</th>
          <th className="p-1 border border-slate-400" style={{ width: columnWidths.action }}>Action</th>
        </tr>
      );
    }
  };

  // Render a row cell based on column key
  const renderCell = (row, index) => {
    const cells = [];

    // S.No
    cells.push(
      <td key="sno" className="p-1 border border-slate-400 text-center bg-gray-100" style={{ width: columnWidths.sno }}>
        {index + 1}
      </td>
    );

    // Ledger Select (combined code and name in one column)
    cells.push(
      <td key="ledger" className="p-1 border border-slate-400" style={{ width: columnWidths.ledger }}>
        <Select
          options={ledgerOptions}
          value={ledgerOptions.find(opt => opt.value === row.ledgerCode) || null}
          onChange={(selectedOption) => onLedgerChange(row.id, selectedOption)}
          styles={customStyles}
          placeholder="Search & select ledger..."
          isClearable
          isSearchable
          menuPortalTarget={document.body}
          menuPosition='fixed'
          // getOptionLabel={(option) => `${option.ledger_code} - ${option.ledger_name}`}
          getOptionValue={(option) => option.value}
          formatOptionLabel={(option, { context }) => {
            // When showing dropdown list
            if (context === 'menu') {
              return `${option.ledger_code} - ${option.ledger_name}`;
            }

            // When showing selected value in input
            return option.ledger_name;
          }}
        />
      </td>
    );

    if (divisionType === 'single') {
      // Amount
      cells.push(
        <td key="amount" className="p-1 border border-slate-400" style={{ width: columnWidths.amount }}>
          <input
            type="number"
            value={row.amount || ''}
            onChange={e => onInputChange(row.id, 'amount', e.target.value)}
            className="w-full p-1 focus:bg-yellow-200 focus:outline-none focus:border-blue-500 focus:border border border-transparent text-right"
            placeholder="0.00"
            step="0.01"
            style={{
              MozAppearance: 'textfield',
              appearance: 'textfield',
              WebkitAppearance: 'none',
              width: '100%'
            }}
            onWheel={e => e.target.blur()}
          />
        </td>
      );

      // Dr/Cr Type
      cells.push(
        <td key="type" className="p-1 border border-slate-400" style={{ width: columnWidths.type }}>
          <select
            value={row.type || 'Debit'}
            onChange={e => onInputChange(row.id, 'type', e.target.value)}
            className="w-full p-1 focus:bg-yellow-200 focus:outline-none focus:border-blue-500 focus:border border border-transparent"
            style={{ width: '100%' }}
          >
            <option value="Debit">Dr</option>
            <option value="Credit">Cr</option>
          </select>
        </td>
      );
    } else {
      // Multiple division fields
      const divWidth = getDivisionColumnWidth();
      for (let i = 1; i <= numberOfDivisions; i++) {
        // Amount field
        cells.push(
          <td key={`d${i}Amount`} className="p-1 border border-slate-400" style={{ width: divWidth.amount }}>
            <input
              type="number"
              value={row[`d${i}Amount`] || ''}
              onChange={e => onInputChange(row.id, `d${i}Amount`, e.target.value)}
              className="w-full p-1 focus:bg-yellow-200 focus:outline-none focus:border-blue-500 focus:border border border-transparent text-right"
              placeholder="0.00"
              step="0.01"
              style={{
                MozAppearance: 'textfield',
                appearance: 'textfield',
                WebkitAppearance: 'none',
                width: '100%'
              }}
              onWheel={e => e.target.blur()}
            />
          </td>
        );

        // Type field
        cells.push(
          <td key={`d${i}Type`} className="p-1 border border-slate-400" style={{ width: divWidth.type }}>
            <select
              value={row[`d${i}Type`] || 'Debit'}
              onChange={e => onInputChange(row.id, `d${i}Type`, e.target.value)}
              className="w-full p-1 focus:bg-yellow-200 focus:outline-none focus:border-blue-500 focus:border border border-transparent"
              style={{ width: '100%' }}
            >
              <option value="Debit">Dr</option>
              <option value="Credit">Cr</option>
            </select>
          </td>
        );
      }
    }

    // Total Dr
    cells.push(
      <td key="totalDr" className="p-1 border border-slate-400 text-right bg-gray-50" style={{ width: columnWidths.total }}>
        {formatNumber(row.totalDr)}
      </td>
    );

    // Total Cr
    cells.push(
      <td key="totalCr" className="p-1 border border-slate-400 text-right bg-gray-50" style={{ width: columnWidths.total }}>
        {formatNumber(row.totalCr)}
      </td>
    );

    // Net Amt
    cells.push(
      <td key="netAmt" className="p-1 border border-slate-400 text-right bg-gray-50" style={{ width: columnWidths.total }}>
        {formatNumber(row.netAmt)}
      </td>
    );

    // Action
    cells.push(
      <td key="action" className="p-1 border border-slate-400 text-center" style={{ width: columnWidths.action }}>
        {rows.length > 1 && (
          <button
            onClick={() => onRemoveRow(row.id)}
            className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
          >
            Remove
          </button>
        )}
      </td>
    );

    return cells;
  };

  return (
    <>
      {/* Transaction Table */}
      <div className="h-[calc(100vh-190px)] overflow-auto">
        <table className="w-full border border-slate-400 table-fixed">
          <thead>
            {renderHeaders()}
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.id} className="text-[12px]">
                {renderCell(row, index)}
              </tr>
            ))}
          </tbody>

          {/* Grand Totals Row */}
          <tfoot>
            <tr className="text-[12px] bg-yellow-100 font-bold">
              <td colSpan={divisionType === 'single' ? 3 : 2 + (numberOfDivisions * 2)}
                className="p-1 border border-slate-400 text-right">
                Grand Total:
              </td>
              <td className="p-1 border border-slate-400 text-right" style={{ width: columnWidths.total }}>
                {formatNumber(grandTotalDr)}
              </td>
              <td className="p-1 border border-slate-400 text-right" style={{ width: columnWidths.total }}>
                {formatNumber(grandTotalCr)}
              </td>
              <td className="p-1 border border-slate-400 text-right" style={{ width: columnWidths.total }}>
                {formatNumber(grandNetAmt)}
              </td>
              <td className="p-1 border border-slate-400" style={{ width: columnWidths.action }}></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center p-4 border-t border-gray-300">
        <button
          onClick={onAddRow}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
        >
          + Add Row
        </button>

        <div className="flex gap-2">
          <button
            onClick={onSubmit}
            disabled={isSubmitting}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
          >
            Submit Voucher
          </button>
        </div>
      </div>
    </>
  );
};

export default VoucherTable;