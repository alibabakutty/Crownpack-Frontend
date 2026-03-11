import { useNavigate } from 'react-router-dom';

const VoucherHeader = ({ mode, title, showBackButton = true }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div>
      {showBackButton && (
        <div className="absolute flex items-center gap-2">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-white hover:text-gray-200 transition-colors bg-green-800 hover:bg-green-700 rounded-lg backdrop-blur-sm mt-1 ml-1 cursor-pointer p-1"
            title="Go back (Esc)"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </button>
        </div>
      )}

      <h2 className="px-1 py-0.3 bg-green-800 text-white text-center text-[13px] pl-3">
        {title}
      </h2>
    </div>
  );
};

export default VoucherHeader;