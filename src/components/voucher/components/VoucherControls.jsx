import VoucherNavigation from './VoucherNavigation';

const VoucherControls = ({
  voucherNumber,
  divisionType,
  currentDateTime,
  mode,
  showNavigation,
  navigationProps
}) => {
  return (
    <div className="flex justify-between items-center px-4 py-1 bg-blue-100 border-b border-gray-300">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold">MT.No:</span>
          <input
            type="text"
            value={voucherNumber}
            readOnly
            className="px-2 py-1 text-xs font-semibold border border-gray-300 rounded w-36 focus:outline-none focus:border-blue-500 bg-gray-100"
            placeholder="Voucher No"
          />
        </div>

        <div className="flex items-center gap-4 ml-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold">Division Type:</span>
            <span className="text-xs font-semibold bg-white px-3 py-1 border border-gray-300 rounded">
              {divisionType === 'single' ? 'Single' : 'Multiple'}
            </span>
          </div>
        </div>

        {showNavigation && <VoucherNavigation {...navigationProps} />}
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold">Date & Time:</span>
        <span className="text-xs font-semibold bg-white px-3 py-1 border border-gray-300 rounded">
          {currentDateTime}
        </span>
      </div>
    </div>
  );
};

export default VoucherControls;