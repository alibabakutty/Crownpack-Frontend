import VoucherNavigation from './VoucherNavigation';

const months = [
  "Jan","Feb","Mar","Apr","May","Jun",
  "Jul","Aug","Sep","Oct","Nov","Dec"
];

const VoucherControls = ({
  voucherNumber,
  divisionType,
  currentDateTime,
  mode,
  month,
  year,
  onMonthChange,
  onYearChange,
  showNavigation,
  navigationProps
}) => {
  return (
    <div className="flex justify-between items-center px-4 py-1 bg-blue-100 border-b border-gray-300">
      
      {/* LEFT SECTION */}
      <div className="flex items-center gap-4">

        {/* Voucher Number */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold">MT.No:</span>
          <input
            type="text"
            value={voucherNumber}
            readOnly
            className="px-2 py-1 text-xs font-semibold border border-gray-300 rounded w-36 bg-gray-100"
          />
        </div>

        {/* Division Type */}
        <div className="flex items-center gap-3 ml-4">
          <span className="text-xs font-semibold">Division Type:</span>
          <span className="text-xs font-semibold bg-white px-3 py-1 border border-gray-300 rounded">
            {divisionType === 'single' ? 'Single' : 'Multiple'}
          </span>
        </div>

        {/* Navigation */}
        {showNavigation && <VoucherNavigation {...navigationProps} />}
      </div>


      {/* RIGHT SECTION */}
      <div className="flex items-center gap-4">

        {/* Month */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold">Month:</span>
          <select
            value={month}
            onChange={(e) => onMonthChange(e.target.value)}
            className="px-2 py-1 text-xs border border-gray-300 rounded bg-white"
          >
            {months.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        {/* Year */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold">Year:</span>
          <input
            type="number"
            value={year}
            onChange={(e) => onYearChange(e.target.value)}
            className="px-2 py-1 text-xs border border-gray-300 rounded w-20"
            placeholder="YYYY"
          />
        </div>

        {/* Date & Time */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold">Date & Time:</span>
          <span className="text-xs font-semibold bg-white px-3 py-1 border border-gray-300 rounded">
            {currentDateTime}
          </span>
        </div>

      </div>

    </div>
  );
};

export default VoucherControls;