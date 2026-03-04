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
      display: 'none'
    }),
    clearIndicator: base => ({
      ...base,
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

  // Column width configuration - REDUCED D/C COLUMN WIDTH
  const columnWidths = {
    sno: '40px',
    ledger: '260px',
    amount: '120px',
    type: '35px', // Reduced from 70px to 35px
    total: '100px',
    action: '35px',
  };

  // Dynamic column widths for multiple divisions - REDUCED D/C COLUMN WIDTH
  const getDivisionColumnWidth = () => ({
    amount: '100px',
    type: '35px', // Reduced from 60px to 35px
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
        <tr className="text-[12px] border-t border-b bg-violet-200">
          <th className="p-1 border border-slate-400" style={{ width: columnWidths.sno }}>S.No</th>
          <th className="p-1 border border-slate-400 text-center" style={{ width: columnWidths.ledger }}>Ledger</th>
          <th className="p-1 border border-slate-400 text-center" style={{ width: columnWidths.amount }}>Amount</th>
          <th className="p-1 border border-slate-400 text-center" style={{ width: columnWidths.type }}>D/C</th>
          <th className="p-1 border border-slate-400 text-center" style={{ width: columnWidths.total }}>Total Dr</th>
          <th className="p-1 border border-slate-400 text-center" style={{ width: columnWidths.total }}>Total Cr</th>
          <th className="p-1 border border-slate-400 text-center" style={{ width: columnWidths.total }}>Net Amt</th>
          <th className="p-1 border border-slate-400" style={{ width: columnWidths.action }}>Action</th>
        </tr>
      );
    } else {
      const divWidth = getDivisionColumnWidth();
      return (
        <tr className="text-[12px] border-t border-b bg-violet-200">
          <th className="p-1 border border-slate-400" style={{ width: columnWidths.sno }}>S.No</th>
          <th className="p-1 border border-slate-400 text-center" style={{ width: columnWidths.ledger }}>Ledger</th>
          {[...Array(numberOfDivisions)].map((_, i) => (
            <React.Fragment key={i}>
              <th className="p-1 border border-slate-400 text-center" style={{ width: divWidth.amount }}>
                Div {i + 1}
              </th>
              <th className="p-1 border border-slate-400 text-center" style={{ width: divWidth.type }}>
                D/C
              </th>
            </React.Fragment>
          ))}
          <th className="p-1 border border-slate-400 text-center" style={{ width: columnWidths.total }}>Total Dr</th>
          <th className="p-1 border border-slate-400 text-center" style={{ width: columnWidths.total }}>Total Cr</th>
          <th className="p-1 border border-slate-400 text-center" style={{ width: columnWidths.total }}>Net Amt</th>
          <th className="p-1 border border-slate-400" style={{ width: columnWidths.action }}>Act</th>
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

    // Ledger Select
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
          getOptionValue={(option) => option.value}
          formatOptionLabel={(option, { context }) => {
            if (context === 'menu') {
              return `${option.ledger_code} - ${option.ledger_name}`;
            }
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

      // Dr/Cr Type - with reduced width
      cells.push(
        <td key="type" className="p-1 border border-slate-400" style={{ width: columnWidths.type }}>
          <select
            value={row.type || 'Debit'}
            onChange={e => onInputChange(row.id, 'type', e.target.value)}
            className="w-full p-1 focus:bg-yellow-200 focus:outline-none focus:border-blue-500 focus:border border border-transparent text-center"
            style={{ width: '100%', padding: '4px 2px' }}
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

        // Type field - with reduced width and text centered
        cells.push(
          <td key={`d${i}Type`} className="p-1 border border-slate-400" style={{ width: divWidth.type }}>
            <select
              value={row[`d${i}Type`] || 'Debit'}
              onChange={e => onInputChange(row.id, `d${i}Type`, e.target.value)}
              className="w-full p-1 focus:bg-yellow-200 focus:outline-none focus:border-blue-500 focus:border border border-transparent text-center"
              style={{ width: '100%',padding: '4px 2px' }}
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
        {index === rows.length - 1 ? (
          <button
            onClick={onAddRow}
            className="px-1 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 w-full" style={{ minWidth: '25px' }}
          >
            +
          </button>
        ) : (
          rows.length > 1 && (
            <button
              onClick={() => onRemoveRow(row.id)}
              className="px-1 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 w-full" style={{ minWidth: '25px' }}
            >
              -
            </button>
          )
        )}
      </td>
    );

    return cells;
  };

  return (
    <>
      {/* Transaction Table */}
      <div className="h-[calc(100vh-110px)] overflow-auto">
        <table className="w-full border border-slate-400 table-fixed">
          <thead className='sticky top-0 bg-violet-200 z-10'>
            {renderHeaders()}
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.id} className="text-[12px]">
                {renderCell(row, index)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default VoucherTable;