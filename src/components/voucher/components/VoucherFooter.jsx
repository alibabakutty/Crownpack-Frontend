import { formatToNaira } from "../utils/voucherUtils";

const VoucherFooter = ({
  mode,
  divisionType,
  numberOfDivisions,
  grandTotals,
  divisionTotals,
  isSubmitting,
  onSubmit,
  createdBy,
  setCreatedBy,
  verifiedBy,
  setVerifiedBy,
  approvedBy,
  setApprovedBy
}) => {

  const DIV_WIDTH = "140px";
  const INDEX_WIDTH = "50px";
  const LABEL_WIDTH = "220px";
  const SEP_WIDTH = "10px";

  // EXTRA WIDTH FOR TOTALS
  const TOTAL_WIDTH = "260px";

  const totalColumns =
    1 + 1 + (divisionType === "multiple" ? numberOfDivisions : 0) + 1 + 2;

  return (
    <tfoot>

      {/* GRAND TOTAL ROW */}
      <tr className="text-[11px] bg-yellow-100 leading-none">

        {/* Index */}
        <td
          style={{ width: INDEX_WIDTH }}
          className="border border-slate-400 p-[2px]"
        />

        {/* Label */}
        <td
          style={{ width: LABEL_WIDTH }}
          className="border border-slate-400 font-bold px-1 py-[2px]"
        >
          Grand Total
        </td>

        {/* Division Totals */}
        {divisionType === "multiple" &&
          Array.from({ length: numberOfDivisions }).map((_, i) => (
            <td
              key={i}
              style={{
                width: DIV_WIDTH,
                minWidth: DIV_WIDTH
              }}
              className="border border-slate-400 text-right font-bold px-1 py-[2px]"
            >
              {formatToNaira(divisionTotals[`d${i + 1}`])}
            </td>
          ))}

        {/* Separator */}
        <td
          style={{ width: SEP_WIDTH }}
          className="border border-slate-400"
        />

        {/* TOTAL DR */}
        <td
          style={{
            width: TOTAL_WIDTH,
            minWidth: TOTAL_WIDTH
          }}
          className="border border-slate-400 text-right font-bold px-1 py-[2px] bg-yellow-200"
        >
          {formatToNaira(grandTotals.grandTotalDr)}
        </td>

        {/* TOTAL CR */}
        <td
          style={{
            width: TOTAL_WIDTH,
            minWidth: TOTAL_WIDTH
          }}
          className="border border-slate-400 text-right font-bold text-red-500 px-1 py-[2px] bg-yellow-200"
        >
          {formatToNaira(grandTotals.grandTotalCr)}
        </td>
      </tr>

      {/* APPROVAL ROW */}
      <tr className="text-[11px]">

        <td colSpan={totalColumns} className="border border-slate-400 p-0">

          <div className="flex items-center w-full h-8">

            {/* Created */}
            <div
              className="flex items-center gap-1 px-2 border-r border-slate-300 h-full"
              style={{ width: `calc(${INDEX_WIDTH} + ${LABEL_WIDTH})` }}
            >
              <span className="font-bold">Created:</span>
              <input value={createdBy} onChange={(e) => setCreatedBy(e.target.value)} className="flex-1 border-b border-gray-300 outline-none bg-transparent text-[11px] h-4 capitalize" />
            </div>

            <div
              className="flex items-center gap-1 px-1 border-r border-slate-300 h-full w-[190px]"
              // style={{ width: `calc(${INDEX_WIDTH} + ${LABEL_WIDTH})` }}
            >
            </div>

            {/* Verified */}
            <div
              className="flex items-center gap-1 px-2 border-r border-slate-300 h-full"
              style={{ width: `calc(${DIV_WIDTH} * 2)` }}
            >
              <span className="font-bold">Verified:</span>
              <input value={verifiedBy} onChange={(e) => setVerifiedBy(e.target.value)} className="flex-1 border-b border-gray-300 outline-none bg-transparent text-[11px] h-4 capitalize" />
            </div>

            <div
              className="flex items-center gap-1 px-1 border-r border-slate-300 h-full w-[190px]"
              // style={{ width: `calc(${INDEX_WIDTH} + ${LABEL_WIDTH})` }}
            >
            </div>

            {/* Approved */}
            <div
              className="flex items-center gap-1 px-2 border-r border-slate-300 h-full"
              style={{ width: `calc(${DIV_WIDTH} * 2)` }}
            >
              <span className="font-bold">Approved:</span>
              <input value={approvedBy} onChange={(e) => setApprovedBy(e.target.value)} className="flex-1 border-b border-gray-300 outline-none bg-transparent text-[11px] h-4 capitalize" />
            </div>

            {/* Submit */}
            <div className="flex-1 flex items-center justify-center bg-gray-50 h-full px-2">
              <button
                onClick={onSubmit}
                disabled={isSubmitting}
                className="w-full h-6 bg-green-600 text-white rounded text-[10px] font-bold hover:bg-green-700 disabled:bg-gray-400"
              >
                {isSubmitting
                  ? "Saving..."
                  : mode === "create"
                    ? "SUBMIT"
                    : "UPDATE"}
              </button>
            </div>

          </div>

        </td>

      </tr>

    </tfoot>
  );
};

export default VoucherFooter;