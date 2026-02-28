import React from 'react';
import Select from 'react-select';

const VoucherTable = ({
  rows,
  onAddRow,
  onRemoveRow,
  onInputChange,
  onLedgerChange,
  ledgerOptions,
  grandTotalDr,
  grandTotalCr,
  grandNetAmt,
  onSubmit,
}) => {
  // Custom styles for react-select
  const customStyles = {
    control: (base, state) => ({
      ...base,
      border: '1px solid transparent',
      borderRadius: '0',
      minHeight: '30px',
      fontSize: '12px',
      backgroundColor: state.isFocused ? '#fef9c3' : 'white', // yellow-200 when focused
      boxShadow: 'none',
      '&:hover': {
        border: '1px solid #3b82f6', // blue-500
      },
    }),
    option: (base, state) => ({
      ...base,
      fontSize: '12px',
      backgroundColor: state.isFocused ? '#dbeafe' : 'white', // blue-100 when focused
      color: 'black',
    }),
    menu: base => ({
      ...base,
      fontSize: '12px',
      zIndex: 9999,
    }),
    singleValue: base => ({
      ...base,
      fontSize: '12px',
    }),
    input: base => ({
      ...base,
      fontSize: '12px',
      margin: '0',
      padding: '0',
    }),
    dropdownIndicator: base => ({
      ...base,
      padding: '4px',
    }),
    clearIndicator: base => ({
      ...base,
      padding: '4px',
    }),
  };

  // Format number with commas
  const formatNumber = num => {
    if (!num || isNaN(num)) return '';
    return parseFloat(num).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <>
      {/* Transaction Table */}
      <div className="h-[calc(100vh-138px)] overflow-auto">
        <table className="w-full border border-slate-400">
          <thead>
            <tr className="text-[13px] border-t border-b bg-violet-200">
              <th className="p-1 border border-slate-400">S.No</th>
              <th className="p-1 border border-slate-400 text-left">Ledger Code</th>
              <th className="p-1 border border-slate-400 text-left">Ledger Name</th>
              <th className="p-1 border border-slate-400 text-left">Division 1</th>
              <th className="p-1 border border-slate-400 text-left">Dr/Cr</th>
              <th className="p-1 border border-slate-400 text-left">Division 2</th>
              <th className="p-1 border border-slate-400 text-left">Dr/Cr</th>
              <th className="p-1 border border-slate-400 text-left">Division 3</th>
              <th className="p-1 border border-slate-400 text-left">Dr/Cr</th>
              <th className="p-1 border border-slate-400 text-left">Total Dr</th>
              <th className="p-1 border border-slate-400 text-left">TotalAmt Cr</th>
              <th className="p-1 border border-slate-400 text-left">Net Amt</th>
              <th className="p-1 border border-slate-400">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => {
              const selectedLeger = ledgerOptions.find(option => option.value === row.ledgerCode);

              return (
                <tr key={row.id} className="text-[12px]">
                  <td className="p-1 border border-slate-400 text-center bg-gray-100">
                    {index + 1}
                  </td>

                  {/* Ledger Code */}
                  <td className="p-1 border border-slate-400">
                    <Select
                      options={ledgerOptions}
                      value={selectedLeger}
                      onChange={(selectedOption) => onLedgerChange(row.id, selectedOption)}
                      styles={customStyles}
                      placeholder="Select Ledger"
                      isClearable
                      isSearchable
                      menuPortalTarget={document.body}
                      menuPosition='fixed'
                    />
                  </td>

                  {/* Ledger Name */}
                  <td className="p-1 border border-slate-400">
                    <input
                      type="text"
                      value={row.ledgerName}
                      readOnly
                      className="w-full p-1 focus:bg-yellow-200 focus:outline-none focus:border-blue-500 focus:border border border-transparent"
                      placeholder="Auto-filled from ledger selection"
                    />
                  </td>

                  {/* D1 Amount */}
                  <td className="p-1 border border-slate-400">
                    <input
                      type="number"
                      value={row.d1Amount}
                      onChange={e => onInputChange(row.id, 'd1Amount', e.target.value)}
                      className="w-full p-1 focus:bg-yellow-200 focus:outline-none focus:border-blue-500 focus:border border border-transparent text-right"
                      placeholder="0.00"
                      step="0.01"
                    />
                  </td>

                  {/* D1 Dr/Cr */}
                  <td className="p-1 border border-slate-400">
                    <select
                      value={row.d1Type}
                      onChange={e => onInputChange(row.id, 'd1Type', e.target.value)}
                      className="w-full p-1 focus:bg-yellow-200 focus:outline-none focus:border-blue-500 focus:border border border-transparent"
                    >
                      <option value="Debit">Dr</option>
                      <option value="Credit">Cr</option>
                    </select>
                  </td>

                  {/* D2 Amount */}
                  <td className="p-1 border border-slate-400">
                    <input
                      type="number"
                      value={row.d2Amount}
                      onChange={e => onInputChange(row.id, 'd2Amount', e.target.value)}
                      className="w-full p-1 focus:bg-yellow-200 focus:outline-none focus:border-blue-500 focus:border border border-transparent text-right"
                      placeholder="0.00"
                      step="0.01"
                    />
                  </td>

                  {/* D2 Dr/Cr */}
                  <td className="p-1 border border-slate-400">
                    <select
                      value={row.d2Type}
                      onChange={e => onInputChange(row.id, 'd2Type', e.target.value)}
                      className="w-full p-1 focus:bg-yellow-200 focus:outline-none focus:border-blue-500 focus:border border border-transparent"
                    >
                      <option value="Debit">Dr</option>
                      <option value="Credit">Cr</option>
                    </select>
                  </td>

                  {/* D3 Amount */}
                  <td className="p-1 border border-slate-400">
                    <input
                      type="number"
                      value={row.d3Amount}
                      onChange={e => onInputChange(row.id, 'd3Amount', e.target.value)}
                      className="w-full p-1 focus:bg-yellow-200 focus:outline-none focus:border-blue-500 focus:border border border-transparent text-right"
                      placeholder="0.00"
                      step="0.01"
                    />
                  </td>

                  {/* D3 Dr/Cr */}
                  <td className="p-1 border border-slate-400">
                    <select
                      value={row.d3Type}
                      onChange={e => onInputChange(row.id, 'd3Type', e.target.value)}
                      className="w-full p-1 focus:bg-yellow-200 focus:outline-none focus:border-blue-500 focus:border border border-transparent"
                    >
                      <option value="Debit">Dr</option>
                      <option value="Credit">Cr</option>
                    </select>
                  </td>

                  {/* Total Dr (Read-only) */}
                  <td className="p-1 border border-slate-400 text-right bg-gray-50">
                    {formatNumber(row.totalDr)}
                  </td>

                  {/* TotalAmt Cr (Read-only) */}
                  <td className="p-1 border border-slate-400 text-right bg-gray-50">
                    {formatNumber(row.totalCr)}
                  </td>

                  {/* Net Amt (Read-only) */}
                  <td className="p-1 border border-slate-400 text-right bg-gray-50">
                    {formatNumber(row.netAmt)}
                  </td>

                  {/* Action */}
                  <td className="p-1 border border-slate-400 text-center">
                    {rows.length > 1 && (
                      <button
                        onClick={() => onRemoveRow(row.id)}
                        className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                      >
                        Remove
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>

          {/* Grand Totals Row */}
          <tfoot>
            <tr className="text-[12px] bg-yellow-100 font-bold">
              <td colSpan="9" className="p-1 border border-slate-400 text-right">
                Grand Total:
              </td>
              <td className="p-1 border border-slate-400 text-right">
                {formatNumber(grandTotalDr)}
              </td>
              <td className="p-1 border border-slate-400 text-right">
                {formatNumber(grandTotalCr)}
              </td>
              <td className="p-1 border border-slate-400 text-right">
                {formatNumber(grandNetAmt)}
              </td>
              <td className="p-1 border border-slate-400"></td>
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
