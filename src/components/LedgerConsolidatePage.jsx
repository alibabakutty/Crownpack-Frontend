import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const LedgerConsolidatePage = () => {
  const navigate = useNavigate();

  // Keyboard navigation handler
  useEffect(() => {
    const handleKeyDown = e => {
      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          navigate(-1);
          break;

        default:
          break;
      }
    };

    // Add event listener
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [navigate]);

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="flex font-amasis">
      <div className="w-full h-screen border border-gray-600 bg-amber-50">
        <div className="">
          <div className="absolute">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-white hover:text-gray-200 transition-colors bg-white/20 hover:bg-white/30 rounded-lg backdrop-blur-sm mt-1 ml-1 cursor-pointer"
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

          <h2 className="px-1 py-0.3 bg-green-800 text-white text-center text-[13px] pl-3">
            Ledger Consolidation
          </h2>
        </div>

        {/* <div className="border border-b-slate-400 flex px-1 py-0.3 text-[16px]">
          <div className='w-[3%]'>S.No</div>
          <div className='w-[8%] ml-1'>Ledger Code</div>
          <div className='w-[30%] ml-1'>Ledger Name</div>
          <div className='w-[9%]'>Sub Group Code</div>
          <div className='w-[17%] ml-1 text-center'>Sub Group Name</div>
          <div className='w-[10%]'>Main Group Code</div>
          <div className='w-[17%] ml-1 text-center'>Main Group Name</div>
          <div className='w-[7%]'>Status</div>
        </div> */}
        <table className='w-full'>
          <thead>
            <tr>
              <th>S.No</th>
              <th>Ledger Code</th>
              <th>Ledger Name</th>
              <th>Sub Group Code</th>
              <th>Sub Group Name</th>
              <th>Main Group Code</th>
              <th>Main Group Name</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><input type="text" className='w-[100px]' /></td>
              <td><input type="text" className='w-[100px]' /></td>
              <td><input type="text" className='w-[100px]' /></td>
              <td><input type="text" className='w-[100px]' /></td>
              <td><input type="text" className='w-[100px]' /></td>
              <td><input type="text" className='w-[100px]' /></td>
              <td><input type="text" className='w-[100px]' /></td>
              <td><input type="text" className='w-[100px]' /></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LedgerConsolidatePage;
