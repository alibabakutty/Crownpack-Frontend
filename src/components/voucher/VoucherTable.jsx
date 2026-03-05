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
  // Custom styles for react-select - COMPRESSED HEIGHT
  const customStyles = {
    control: (base, state) => ({
      ...base,
      border: '1px solid transparent',
      borderRadius: '0',
      minHeight: '18px',
      height: '18px',
      fontSize: '11px',
      backgroundColor: state.isFocused ? '#fef9c3' : 'white',
      boxShadow: 'none',
      width: '250px',
      '&:hover': {
        border: '1px solid #3b82f6',
      },
    }),
    option: (base, state) => ({
      ...base,
      fontSize: '11px',
      fontWeight: '600',
      padding: '1px 4px',
      minHeight: '18px',
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
      fontSize: '11px',
      zIndex: 9999,
      width: '350px',
    }),
    menuList: (base) => ({
      ...base,
      maxHeight: '440px',   // 👈 increase dropdown height
      paddingTop: 0,
      paddingBottom: 0,
    }),
    singleValue: base => ({
      ...base,
      fontSize: '11px',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      maxWidth: '230px',
    }),
    input: base => ({
      ...base,
      fontSize: '11px',
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
      fontSize: '11px',
      color: '#999',
    }),
    valueContainer: base => ({
      ...base,
      padding: '0 4px',
      height: '18px',
    }),
  };

  // Column width configuration
  const columnWidths = {
    sno: '35px',
    ledger: '220px',
    amount: '110px',
    type: '32px',
    total: '90px',
    action: '32px',
  };

  // Dynamic column widths for multiple divisions
  const getDivisionColumnWidth = () => ({
    amount: '90px',
    type: '32px',
  });

  // Format number with commas AND always show 2 decimals
  const formatNumber = num => {
    if (!num || isNaN(num)) return '0.00';
    return parseFloat(num).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Generate table headers based on division type
  const renderHeaders = () => {
    const headerClass = "text-[11px] font-medium p-0.5 border border-slate-400";

    if (divisionType === 'single') {
      return (
        <tr className="bg-violet-200">
          <th className={`${headerClass} text-center font-semibold`} style={{ width: columnWidths.sno }}>S.No</th>
          <th className={`${headerClass} text-center font-semibold`} style={{ width: columnWidths.ledger }}>Ledger</th>
          <th className={`${headerClass} text-center font-semibold`} style={{ width: columnWidths.amount }}>Amt</th>
          <th className={`${headerClass} text-center font-semibold`} style={{ width: columnWidths.type }}>Dr/Cr</th>
          <th className={`${headerClass} text-center font-semibold`} style={{ width: columnWidths.total }}>Dr</th>
          <th className={`${headerClass} text-center font-semibold`} style={{ width: columnWidths.total }}>Cr</th>
          <th className={`${headerClass} text-center font-semibold`} style={{ width: columnWidths.total }}>Net</th>
          <th className={`${headerClass} text-center font-semibold`} style={{ width: columnWidths.action }}>Act</th>
        </tr>
      );
    } else {
      const divWidth = getDivisionColumnWidth();
      return (
        <tr className="bg-violet-200">
          <th className={`${headerClass} text-center font-semibold`} style={{ width: columnWidths.sno }}>S.No</th>
          <th className={`${headerClass} text-center font-semibold`} style={{ width: columnWidths.ledger }}>Ledger</th>
          {[...Array(numberOfDivisions)].map((_, i) => (
            <React.Fragment key={i}>
              <th className={`${headerClass} text-center font-semibold`} style={{ width: divWidth.amount }}>
                D{i + 1}
              </th>
              <th className={`${headerClass} text-center font-semibold`} style={{ width: divWidth.type }}>
                Dr/Cr
              </th>
            </React.Fragment>
          ))}
          <th className={`${headerClass} text-center font-semibold`} style={{ width: columnWidths.total }}>Total (Dr)</th>
          <th className={`${headerClass} text-center font-semibold`} style={{ width: columnWidths.total }}>Total (Cr)</th>
          <th className={`${headerClass} text-center font-semibold`} style={{ width: columnWidths.total }}>Net</th>
          <th className={`${headerClass} text-center font-semibold`} style={{ width: columnWidths.action }}>Act</th>
        </tr>
      );
    }
  };

  // Handle amount change with decimal formatting on blur
  const handleAmountChange = (rowId, field, value) => {
    // Allow user to type freely
    onInputChange(rowId, field, value);
  };

  const handleAmountBlur = (rowId, field, value) => {
    // Format to 2 decimals when input loses focus
    if (value) {
      const numValue = parseFloat(value) || 0;
      onInputChange(rowId, field, numValue.toFixed(2));
    } else {
      onInputChange(rowId, field, '0.00');
    }
  };

 const getTypeStyle = (type) => {
  if (type === "Credit") {
    return "text-right text-red-600";
  }
  return "text-left text-black";
};

  // Render a row cell based on column key
  const renderCell = (row, index) => {
    const cells = [];
    const cellClass = "p-0.5 border border-slate-400";
    const inputClass = "w-full p-0.5 focus:bg-yellow-200 focus:outline-none focus:border-blue-500 focus:border border border-transparent text-[11px] font-semibold";

    // S.No
    cells.push(
      <td key="sno" className={`${cellClass} text-center bg-gray-100 text-[11px] font-semibold`} style={{ width: columnWidths.sno }}>
        {index + 1}
      </td>
    );

    // Ledger Select
    cells.push(
      <td key="ledger" className={cellClass} style={{ width: columnWidths.ledger }}>
        <Select
          options={ledgerOptions}
          value={ledgerOptions.find(opt => opt.value === row.ledgerCode) || null}
          onChange={(selectedOption) => onLedgerChange(row.id, selectedOption)}
          styles={customStyles}
          placeholder="Select..."
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
      // Amount with decimal formatting
      cells.push(
        <td key="amount" className={cellClass} style={{ width: columnWidths.amount }}>
          <input
            type="number"
            value={row.amount || ''}
            onChange={e => handleAmountChange(row.id, 'amount', e.target.value)}
            onBlur={e => handleAmountBlur(row.id, 'amount', e.target.value)}
            className={`${inputClass} text-right`}
            placeholder="0.00"
            step="0.01"
            style={{
              MozAppearance: 'textfield',
              appearance: 'textfield',
              WebkitAppearance: 'none',
              width: '100%',
              height: '18px'
            }}
            onWheel={e => e.target.blur()}
          />
        </td>
      );

      // Dr/Cr Type
      cells.push(
        <td key="type" className={cellClass} style={{ width: columnWidths.type }}>
          <select
            value={row.type || 'Debit'}
            onChange={e => onInputChange(row.id, 'type', e.target.value)}
            className={`${inputClass} text-center font-semibold ${getTypeStyle(row.type)}`}
            style={{ width: '100%', height: '18px', padding: '1px' }}
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
        // Amount field with decimal formatting
        cells.push(
          <td key={`d${i}Amount`} className={cellClass} style={{ width: divWidth.amount }}>
            <input
              type="number"
              value={row[`d${i}Amount`] || ''}
              onChange={e => handleAmountChange(row.id, `d${i}Amount`, e.target.value)}
              onBlur={e => handleAmountBlur(row.id, `d${i}Amount`, e.target.value)}
              className={`${inputClass} text-right`}
              placeholder="0.00"
              step="0.01"
              style={{
                MozAppearance: 'textfield',
                appearance: 'textfield',
                WebkitAppearance: 'none',
                width: '100%',
                height: '18px'
              }}
              onWheel={e => e.target.blur()}
            />
          </td>
        );

        // Type field
        cells.push(
          <td key={`d${i}Type`} className={cellClass} style={{ width: divWidth.type }}>
            <select
              value={row[`d${i}Type`] || 'Debit'}
              onChange={e => onInputChange(row.id, `d${i}Type`, e.target.value)}
              className={`${inputClass} font-semibold ${getTypeStyle(row[`d${i}Type`])}`}
              style={{ width: '100%', height: '18px', padding: '1px' }}
            >
              <option value="Debit">Dr</option>
              <option value="Credit">Cr</option>
            </select>
          </td>
        );
      }
    }

    // Total Dr - already formatted with 2 decimals
    cells.push(
      <td key="totalDr" className={`${cellClass} text-right bg-gray-50 text-[11px] font-semibold`} style={{ width: columnWidths.total }}>
        {formatNumber(row.totalDr)}
      </td>
    );

    // Total Cr - already formatted with 2 decimals
    cells.push(
      <td key="totalCr" className={`${cellClass} text-right bg-gray-50 text-[11px] font-semibold`} style={{ width: columnWidths.total }}>
        {formatNumber(row.totalCr)}
      </td>
    );

    // Net Amt - already formatted with 2 decimals
    cells.push(
      <td key="netAmt" className={`${cellClass} text-right bg-gray-50 text-[11px] font-semibold`} style={{ width: columnWidths.total }}>
        {formatNumber(row.netAmt)}
      </td>
    );

    // Action
    cells.push(
      <td key="action" className={`${cellClass} text-center`} style={{ width: columnWidths.action }}>
        {index === rows.length - 1 ? (
          <button
            onClick={onAddRow}
            className="w-full bg-blue-500 text-white rounded hover:bg-blue-600 text-[11px] font-bold"
            style={{ height: '16px', lineHeight: '16px', padding: 0 }}
          >
            +
          </button>
        ) : (
          rows.length > 1 && (
            <button
              onClick={() => onRemoveRow(row.id)}
              className="w-full bg-red-500 text-white rounded hover:bg-red-600 text-[11px] font-bold"
              style={{ height: '16px', lineHeight: '16px', padding: 0 }}
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
      <div className="w-full">
        <table className="w-full border border-slate-400 table-fixed" style={{ borderCollapse: 'collapse' }}>
          <thead className='sticky top-0 bg-violet-200 z-10'>
            {renderHeaders()}
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.id} className="text-[11px] font-semibold">
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