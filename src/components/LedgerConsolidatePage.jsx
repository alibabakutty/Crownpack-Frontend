import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Select from 'react-select';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const LedgerConsolidatePage = () => {
  const [ledgerOptions, setLedgerOptions] = useState([]);
  const [subGroupOptions, setSubGroupOptions] = useState([]);
  const [mainGroupOptions, setMainGroupOptions] = useState([]);
  const [selectedLedger, setSelectedLedger] = useState(null);
  const [selectedSubGroup, setSelectedSubGroup] = useState(null);
  const [selectedMainGroup, setSelectedMainGroup] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState({ value: 'inactive', label: 'Inactive' });
  const [serialNumber, setSerialNumber] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const ledgerSelectRef = useRef(null);
  const subGroupSelectRef = useRef(null);
  const mainGroupSelectRef = useRef(null);
  const statusSelectRef = useRef(null);
  const navigate = useNavigate();

  // Fetch the next serial number from backend
  useEffect(() => {
    const fetchNextSerialNumber = async () => {
      try {
        const response = await api.get('/connect_consolidates');
        if (Array.isArray(response.data)) {
          const maxSerialNo = response.data.reduce((max, item) => 
            Math.max(max, item.serial_no || 0), 0
          );
          setSerialNumber(maxSerialNo + 1);
        }
      } catch (error) {
        console.error('Error fetching serial number:', error);
        setSerialNumber(1);
      }
    };
    fetchNextSerialNumber();
  }, []);

  // Status options
  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' }
  ];

  useEffect(() => {
    const fetchLedgers = async () => {
      try {
        const response = await api.get('/ledgers');
        if (Array.isArray(response.data)) {
          const formattedLedgers = response.data.map(ledger => ({
            value: ledger.ledger_code,
            label: `${ledger.ledger_code} - ${ledger.ledger_name}`,
            ledger_code: ledger.ledger_code,
            ledger_name: ledger.ledger_name,
            ...ledger
          }));
          setLedgerOptions(formattedLedgers);
        }
      } catch (error) {
        console.error('Error fetching ledgers:', error);
      }
    };
    fetchLedgers();
  }, []);

  useEffect(() => {
    const fetchSubGroups = async () => {
      try {
        const response = await api.get('/sub_groups');
        if (Array.isArray(response.data)) {
          const formattedSubGroups = response.data.map(subgroup => ({
            value: subgroup.sub_group_code,
            label: `${subgroup.sub_group_code} - ${subgroup.sub_group_name}`,
            sub_group_code: subgroup.sub_group_code,
            sub_group_name: subgroup.sub_group_name,
            ...subgroup,
          }));
          setSubGroupOptions(formattedSubGroups);
        }
      } catch (error) {
        console.error('Error fetching sub groups:', error);
      }
    };
    fetchSubGroups();
  }, []);

  useEffect(() => {
    const fetchMainGroups = async () => {
      try {
        const response = await api.get('/main_groups');
        if (Array.isArray(response.data)) {
          const formattedMainGroups = response.data.map(mainGroup => ({
            value: mainGroup.main_group_code,
            label: `${mainGroup.main_group_code} - ${mainGroup.main_group_name}`,
            main_group_code: mainGroup.main_group_code,
            main_group_name: mainGroup.main_group_name,
            ...mainGroup
          }));
          setMainGroupOptions(formattedMainGroups);
        }
      } catch (error) {
        console.error("Error fetching main groups:", error);
      }
    };
    fetchMainGroups();
  }, []);

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

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [navigate]);

  const handleLedgerChange = (selectedLedgerOption) => {
    setSelectedLedger(selectedLedgerOption);
    console.log('Selected Ledger:', selectedLedgerOption);
  };

  const handleSubGroupChange = (selectedSubGroupOption) => {
    setSelectedSubGroup(selectedSubGroupOption);
    console.log('Selected Sub Group:', selectedSubGroupOption);
  };

  const handleMainGroupChange = (selectedMainGroupOption) => {
    setSelectedMainGroup(selectedMainGroupOption);
    console.log('Selected Main Group:', selectedMainGroupOption);
  };

  const handleStatusChange = (selectedStatusOption) => {
    setSelectedStatus(selectedStatusOption);
    console.log('Selected Status:', selectedStatusOption);
  };

  const handleBack = () => {
    navigate(-1);
  };

  // Submit consolidation data to backend
  const handleSubmit = async () => {
    // Validation
    if (!selectedLedger) {
      toast.error('Please select a ledger', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    if (!selectedSubGroup && !selectedMainGroup) {
      toast.error('Please select either a Sub Group or Main Group', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    // Simple confirmation dialog
    const isConfirmed = window.confirm('Do you wish to submit this consolidation record?');
    
    if (!isConfirmed) {
      toast.info('Submission cancelled', {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const consolidationData = {
        serial_no: serialNumber,
        ledger_code: selectedLedger.ledger_code,
        sub_group_code: selectedSubGroup ? selectedSubGroup.sub_group_code : null,
        main_group_code: selectedMainGroup ? selectedMainGroup.main_group_code : null,
        status: selectedStatus.value
      };

      console.log('Submitting consolidation data:', consolidationData);

      const response = await api.post('/consolidated', consolidationData);
      
      if (response.data) {
        toast.success('Consolidation created successfully!', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        
        // Reset form
        setSelectedLedger(null);
        setSelectedSubGroup(null);
        setSelectedMainGroup(null);
        setSelectedStatus({ value: 'inactive', label: 'InActive' });
        
        // Increment serial number for next entry
        // setSerialNumber(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error creating consolidation record:', error);
      toast.error(`❌ Error creating consolidation record: ${error.response?.data?.error || error.message}`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Custom styles for react-select
  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      border: 'none',
      boxShadow: 'none',
      backgroundColor: state.isFocused ? '#fef9c3' : 'transparent',
      minHeight: '25px',
      fontSize: '12px',
      fontFamily: 'inherit',
      cursor: 'text',
      minWidth: '120px',
    }),
    valueContainer: (provided) => ({
      ...provided,
      padding: '0px 4px',
    }),
    input: (provided) => ({
      ...provided,
      margin: '0px',
      padding: '0px',
    }),
    singleValue: (provided) => ({
      ...provided,
      fontSize: '12px',
      fontWeight: '500',
    }),
    dropdownIndicator: () => ({
      display: 'none',
    }),
    indicatorSeparator: () => ({
      display: 'none',
    }),
    menu: (provided) => ({
      ...provided,
      fontSize: '12px',
      zIndex: 20,
      minWidth: '200px',
      width: 'auto',
    }),
    menuList: (provided) => ({
      ...provided,
      minWidth: '200px',
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused ? '#3b82f6' : 'white',
      color: state.isFocused ? 'white' : 'black',
      fontSize: '12px',
      padding: '4px 8px',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    }),
  };

  // Custom styles for status dropdown
  const statusStyles = {
    control: (provided, state) => ({
      ...provided,
      border: 'none',
      boxShadow: 'none',
      backgroundColor: state.isFocused ? '#fef9c3' : 'transparent',
      minHeight: '25px',
      fontSize: '12px',
      fontFamily: 'inherit',
      cursor: 'text',
      minWidth: '70px',
      width: '70px',
    }),
    valueContainer: (provided) => ({
      ...provided,
      padding: '0px 2px',
    }),
    input: (provided) => ({
      ...provided,
      margin: '0px',
      padding: '0px',
    }),
    singleValue: (provided) => ({
      ...provided,
      fontSize: '12px',
      fontWeight: '500',
    }),
    dropdownIndicator: () => ({
      display: 'none',
    }),
    indicatorSeparator: () => ({
      display: 'none',
    }),
    menu: (provided) => ({
      ...provided,
      fontSize: '12px',
      zIndex: 20,
      minWidth: '70px',
      width: '70px',
    }),
    menuList: (provided) => ({
      ...provided,
      minWidth: '70px',
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused ? '#3b82f6' : 'white',
      color: state.isFocused ? 'white' : 'black',
      fontSize: '12px',
      padding: '4px 6px',
      minHeight: '25px',
    }),
  };

  // Custom component to display only the code in the select field
  const formatOptionLabel = (option, { context }) => {
    if (option.__isNew__) {
      return option.label;
    }
    
    if (context === 'value') {
      return option.value;
    }
    
    return (
      <div className="whitespace-nowrap">
        <span className="font-medium">{option.value}</span>
        <span className="text-gray-600 ml-2">- {option.ledger_name || option.sub_group_name || option.main_group_name}</span>
      </div>
    );
  };

  return (
    <div className="flex font-amasis">
      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      
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

        <table className="w-full border border-slate-400">
          <thead>
            <tr className='text-[15px] border-t border-b bg-violet-200'>
              <th>S.No</th>
              <th className='text-left pl-1'>Ledger Code</th>
              <th className='text-left pl-1'>Ledger Name</th>
              <th className='text-left pl-1'>Sub Group Code</th>
              <th className='text-left pl-1'>Sub Group Name</th>
              <th className='text-left pl-1'>Main Group Code</th>
              <th className='text-left pl-1'>Main Group Name</th>
              <th className='text-left pl-1'>Link-Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <input
                  type="text"
                  value={serialNumber}
                  className="w-10 pl-0.5 font-medium capitalize text-[12px] focus:bg-yellow-200 focus:outline-none focus:border-blue-500 focus:border border border-transparent text-center bg-gray-100"
                  autoComplete="off"
                  readOnly
                />
              </td>
              
              {/* Ledger Code */}
              <td>
                <Select 
                  ref={ledgerSelectRef}
                  options={ledgerOptions} 
                  value={selectedLedger} 
                  onChange={handleLedgerChange} 
                  styles={customStyles} 
                  placeholder="Select Code" 
                  isSearchable 
                  className='w-32 text-[12px]'
                  formatOptionLabel={formatOptionLabel}
                  getOptionValue={(option) => option.value}
                />
              </td>
              
              {/* Ledger Name */}
              <td>
                <input
                  type="text"
                  className="w-60 pl-0.5 font-medium capitalize text-[12px] focus:bg-yellow-200 focus:outline-none focus:border-blue-500 focus:border border border-transparent -mr-6"
                  autoComplete="off"
                  readOnly
                  value={selectedLedger ? selectedLedger.ledger_name : ''}
                  placeholder={selectedLedger ? '' : 'Ledger Name'}
                />
              </td>
              
              {/* Sub Group Code */}
              <td>
                <Select 
                  ref={subGroupSelectRef}
                  options={subGroupOptions} 
                  value={selectedSubGroup} 
                  onChange={handleSubGroupChange} 
                  styles={customStyles} 
                  placeholder="Select Code" 
                  isSearchable 
                  className='w-32 text-[12px]'
                  formatOptionLabel={formatOptionLabel}
                  getOptionValue={(option) => option.value}
                />
              </td>
              
              {/* Sub Group Name */}
              <td>
                <input
                  type="text"
                  className="w-40 pl-0.5 font-medium capitalize text-[12px] focus:bg-yellow-200 focus:outline-none focus:border-blue-500 focus:border border border-transparent"
                  autoComplete="off"
                  readOnly
                  value={selectedSubGroup ? selectedSubGroup.sub_group_name : ''}
                  placeholder={selectedSubGroup ? '' : 'Sub Group Name'}
                />
              </td>
              
              {/* Main Group Code */}
              <td>
                <Select 
                  ref={mainGroupSelectRef}
                  options={mainGroupOptions} 
                  value={selectedMainGroup} 
                  onChange={handleMainGroupChange} 
                  styles={customStyles} 
                  placeholder="Select Code" 
                  isSearchable 
                  className='w-32 text-[12px]'
                  formatOptionLabel={formatOptionLabel}
                  getOptionValue={(option) => option.value}
                />
              </td>
              
              {/* Main Group Name */}
              <td>
                <input
                  type="text"
                  className="w-40 pl-0.5 font-medium capitalize text-[12px] focus:bg-yellow-200 focus:outline-none focus:border-blue-500 focus:border border border-transparent"
                  autoComplete="off"
                  readOnly
                  value={selectedMainGroup ? selectedMainGroup.main_group_name : ''}
                  placeholder={selectedMainGroup ? '' : 'Main Group Name'}
                />
              </td>
              
              {/* Status */}
              <td>
                <Select 
                  ref={statusSelectRef}
                  options={statusOptions} 
                  value={selectedStatus} 
                  onChange={handleStatusChange} 
                  styles={statusStyles} 
                  placeholder="Status" 
                  isSearchable={false}
                  className='w-20 text-[12px]'
                />
              </td>
            </tr>
          </tbody>
        </table>

        <div className='mt-[81vh] ml-[93vw]'>
          <button 
            type='button' 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`px-2 py-1 rounded cursor-pointer ${
              isSubmitting 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-yellow-300 hover:bg-yellow-400'
            }`}
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LedgerConsolidatePage;