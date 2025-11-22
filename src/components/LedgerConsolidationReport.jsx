import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../services/api';

const LedgerConsolidationReport = () => {
  const { ledger_code } = useParams();
  const inputRef = useRef([]);
  const [consolidationData, setConsolidationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (inputRef.current[0]) {
      inputRef.current[0].focus();
      inputRef.current[0].setSelectionRange(0, 0);
    }
  },[]);

  useEffect(() => {
    const fetchConsolidationData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await api.get(`/consolidated/ledger/${ledger_code}`);

        console.log('Fetched consolidation data:', response.data);

        if (Array.isArray(response.data) && response.data.length > 0) {
          setConsolidationData(response.data[0]);
        } else {
          setError("No consolidation data found for this ledger.");
        }
      } catch (error) {
        console.error("Error fetching consolidation data:", error);
        setError('Failed to fetch consolidation data');
      } finally {
        setLoading(false);
      }
    }

    if (ledger_code) {
      fetchConsolidationData();
    }
  }, [ledger_code]);

  const handleKeyDownLedger = (e, index) => {
    const key = e.key;
    const { value, selectionStart } = e.target;

    if (key === 'Enter') {
      e.preventDefault();

      const nextField = index + 1;
      if (nextField < inputRef.current.length) {
        inputRef.current[nextField].focus();
        inputRef.current[nextField].setSelectionRange(0, 0);
      }
    } else if (key === 'Backspace') {
      if (selectionStart === 0 && index > 0) {
        e.preventDefault();

        const prevIndex = index - 1;
        inputRef.current[prevIndex].focus();
        inputRef.current[prevIndex].setSelectionRange(0, 0);
      } else if (selectionStart > 0) {
        const newValue = value.slice(0, selectionStart - 1) + value.slice(selectionStart);
        e.target.value = newValue;
        // If you have state management, update it here
        // dispatch({ name: e.target.name, value: newValue });
        e.target.setSelectionRange(selectionStart - 1, selectionStart - 1);
      }
    } else if (key === 'Escape') {
      navigate(-1);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <>
      <div className='flex bg-[#493D9E] h-screen'>
        <form action="" className='border border-slate-500 w-[30%] h-[40vh] bg-[#FBFBFB] ml-[70vw]'>
          <div className='flex text-[13px] mt-2 ml-2 leading-4'>
            <label htmlFor="ledgerCode" className='w-[30%]'>Ledger Code</label>
            <span>:</span>
            <input type="text" name='ledgerCode' value={consolidationData?.ledger_code || ''} ref={(input) => (inputRef.current[0] = input)} onKeyDown={(e) => handleKeyDownLedger(e, 0)} className='w-[200px] ml-2 pl-0.5 font-medium text-[13px] capitalize focus:bg-yellow-200 focus:outline-none focus:border-blue-500 border border-transparent focus:border' autoComplete='off' readOnly />
          </div>
          <div className='flex text-[13px] mt-1 ml-2 leading-4'>
            <label htmlFor="ledgerName" className='w-[30%]'>Ledger Name</label>
            <span>:</span>
            <input type="text" name='ledgerName' value={consolidationData?.ledger_name || ''} ref={(input) => (inputRef.current[1] = input)} onKeyDown={(e) => handleKeyDownLedger(e, 1)} className='w-[200px] ml-2 pl-0.5 font-medium text-[13px] capitalize focus:bg-yellow-200 focus:outline-none focus:border-blue-500 border border-transparent focus:border' autoComplete='off' readOnly/>
          </div>
          <div className='flex text-[13px] mt-1 ml-2 leading-4'>
            <label htmlFor="subGroupCode" className='w-[30%]'>Sub Group Code</label>
            <span>:</span>
            <input type="text" name='subGroupCode' ref={(input) => (inputRef.current[2] = input)} value={consolidationData?.sub_group_code || ''} onKeyDown={(e) => handleKeyDownLedger(e, 2)} className='w-[200px] ml-2 pl-0.5 font-medium text-[13px] capitalize focus:bg-yellow-200 focus:outline-none focus:border-blue-500 border border-transparent focus:border' autoComplete='off' readOnly/>
          </div>
          <div className='flex text-[13px] mt-1 ml-2 leading-4'>
            <label htmlFor="subGroupName" className='w-[30%]'>Sub Group Name</label>
            <span>:</span>
            <input type="text" name='subGroupName' ref={(input) => (inputRef.current[3] = input)} value={consolidationData?.sub_group_name || ''} onKeyDown={(e) => handleKeyDownLedger(e, 3)} className='w-[200px] ml-2 pl-0.5 font-medium text-[13px] capitalize focus:bg-yellow-200 focus:outline-none focus:border-blue-500 border border-transparent focus:border' autoComplete='off' readOnly/>
          </div>
          <div className='flex text-[13px] mt-1 ml-2 leading-4'>
            <label htmlFor="mainGroupCode" className='w-[30%]'>Main Group Code</label>
            <span>:</span>
            <input type="text" name='mainGroupCode' ref={(input) => (inputRef.current[4] = input)} value={consolidationData?.main_group_code || ''} onKeyDown={(e) => handleKeyDownLedger(e, 4)} className='w-[200px] ml-2 pl-0.5 font-medium text-[13px] capitalize focus:bg-yellow-200 focus:outline-none focus:border-blue-500 border border-transparent focus:border' autoComplete='off' readOnly/>
          </div>
          <div className='flex text-[13px] mt-1 ml-2 leading-4'>
            <label htmlFor="mainGroupName" className='w-[30%]'>Main Group Name</label>
            <span>:</span>
            <input type="text" name='mainGroupName' ref={(input) => (inputRef.current[5] = input)} value={consolidationData?.main_group_name} onKeyDown={(e) => handleKeyDownLedger(e, 5)} className='w-[200px] ml-2 pl-0.5 font-medium text-[13px] capitalize focus:bg-yellow-200 focus:outline-none focus:border-blue-500 border border-transparent focus:border' autoComplete='off' readOnly/>
          </div>
          <div className='flex text-[13px] mt-1 ml-2 leading-4'>
            <label htmlFor="tallyReport" className='w-[30%]'>Tally Report</label>
            <span>:</span>
            <input type="text" name='tallyReport' ref={(input) => (inputRef.current[6] = input)} value={consolidationData?.ledger_tally_report || ''} onKeyDown={(e) => handleKeyDownLedger(e, 6)} className='w-[200px] ml-2 pl-0.5 font-medium text-[13px] capitalize focus:bg-yellow-200 focus:outline-none focus:border-blue-500 border border-transparent focus:border' autoComplete='off' readOnly/>
          </div>
          <div className='flex text-[13px] mt-1 ml-2 leading-4'>
            <label htmlFor="debitOrCredit" className='w-[30%]'>Dr/Cr</label>
            <span>:</span>
            <input type="text" name='debitOrCredit' ref={(input) => (inputRef.current[7] = input)} value={consolidationData?.ledger_debit_credit || ''} onKeyDown={(e) => handleKeyDownLedger(e, 7)} className='w-[200px] ml-2 pl-0.5 font-medium text-[13px] capitalize focus:bg-yellow-200 focus:outline-none focus:border-blue-500 border border-transparent focus:border' autoComplete='off' readOnly/>
          </div>
          <div className='flex text-[13px] mt-1 ml-2 leading-4'>
            <label htmlFor="trialBalance" className='w-[30%]'>Trial Balance</label>
            <span>:</span>
            <input type="text" name='trialBalance' ref={(input) => (inputRef.current[8] = input)} value={consolidationData?.ledger_trial_balance || ''} onKeyDown={(e) => handleKeyDownLedger(e, 8)} className='w-[200px] ml-2 pl-0.5 font-medium text-[13px] capitalize focus:bg-yellow-200 focus:outline-none focus:border-blue-500 border border-transparent focus:border' autoComplete='off' readOnly/>
          </div>
          <div className='flex text-[13px] mt-1 ml-2 leading-4'>
            <label htmlFor="status" className='w-[30%]'>Status</label>
            <span>:</span>
            <input type="text" name='status' ref={(input) => (inputRef.current[9] = input)} value={consolidationData?.status || ''} onKeyDown={(e) => handleKeyDownLedger(e, 9)} className='w-[200px] ml-2 pl-0.5 font-medium text-[13px] capitalize focus:bg-yellow-200 focus:outline-none focus:border-blue-500 border border-transparent focus:border' autoComplete='off' readOnly/>
          </div>
        </form>
      </div>
    </>
  )
}

export default LedgerConsolidationReport