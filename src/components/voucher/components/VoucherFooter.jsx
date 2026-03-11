import React from 'react';
import { formatToNaira } from '../utils/voucherUtils';

const VoucherFooter = ({
  mode,
  divisionType,
  numberOfDivisions,
  grandTotals,
  divisionTotals,
  isSubmitting,
  onSubmit,
  columnWidths = { total: '120px' }
}) => {
  const divisionWidths = [140, 140, 140, 140, 140, 140];

  return (
    <div className="sticky bottom-0 bg-white border-t border-slate-400 shadow-sm">
      <table className="w-full border border-slate-400 table-fixed">
        <tfoot>
          <tr className="text-[12px] bg-yellow-100">
            <td className="p-1 border border-slate-400">
              {(mode === "create" || mode === "update") && (
                <button
                  onClick={onSubmit}
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
              {formatToNaira(grandTotals.grandTotalDr)}
            </td>
            <td className="p-1 border border-slate-400 text-right font-bold" style={{ width: columnWidths.total }}>
              {formatToNaira(grandTotals.grandTotalCr)}
            </td>
            <td className="w-[28px] border border-slate-400 text-right font-bold"></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default VoucherFooter;