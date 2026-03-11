import React from 'react';

const VoucherNavigation = ({
  currentIndex,
  totalCount,
  onPrevious,
  onNext,
  voucherNumber
}) => {
  if (totalCount <= 1) return null;

  return (
    <div className="flex items-center gap-2 ml-10 bg-blue-100 px-2 py-1 rounded">
      <button
        onClick={onPrevious}
        disabled={currentIndex === 0}
        className="px-2 py-0.5 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 text-xs"
      >
        ← Previous
      </button>
      <span className="text-xs font-semibold">
        Voucher {currentIndex + 1} of {totalCount} - {voucherNumber}
      </span>
      <button
        onClick={onNext}
        disabled={currentIndex === totalCount - 1}
        className="px-2 py-0.5 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 text-xs"
      >
        Next →
      </button>
    </div>
  );
};

export default VoucherNavigation;