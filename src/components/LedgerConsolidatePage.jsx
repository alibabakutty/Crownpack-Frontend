import { useEffect, useState } from 'react'; 
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Select from 'react-select';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const LedgerConsolidatePage = () => {
  const [ledgerOptions, setLedgerOptions] = useState([]);
  const [subGroupOptions, setSubGroupOptions] = useState([]);
  const [mainGroupOptions, setMainGroupOptions] = useState([]);
  const [consolidatedData, setConsolidatedData] = useState([]);
  const [rows, setRows] = useState([{ 
    id: 1, 
    selectedLedger: null,
    selectedSubGroup: null,
    selectedMainGroup: null,
    selectedStatus: { value: 'inactive', label: 'Inactive' }
  }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nextRowId, setNextRowId] = useState(2);
  
  const navigate = useNavigate();

  // Status options
  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' }
  ];

  // Fetch consolidated data to check which ledgers are already active
  useEffect(() => {
    const fetchConsolidatedData = async () => {
      try {
        const response = await api.get('/connect_consolidates');
        if (Array.isArray(response.data)) {
          setConsolidatedData(response.data);
        }
      } catch (error) {
        console.error('Error fetching consolidated data:', error);
      }
    };
    fetchConsolidatedData();
  }, []);

  useEffect(() => {
    const fetchLedgers = async () => {
      try {
        const response = await api.get('/ledgers');
        if (Array.isArray(response.data)) {
          // Get active ledger codes from consolidated data
          const activeLedgerCodes = consolidatedData
            .filter(item => item.status === 'active')
            .map(item => item.ledger_code);

          // Filter out ledgers that are already active in consolidation
          const availableLedgers = response.data.filter(ledger => 
            !activeLedgerCodes.includes(ledger.ledger_code)
          );

          const formattedLedgers = availableLedgers.map(ledger => ({
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
  }, [consolidatedData]); // Re-run when consolidatedData changes

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

  // Handle status change - add new row when status changes to active
  const handleStatusChange = (selectedStatusOption, rowId) => {
    setRows(prevRows => 
      prevRows.map(row => 
        row.id === rowId 
          ? { ...row, selectedStatus: selectedStatusOption }
          : row
      )
    );

    // If status is changed to active, add a new empty row
    if (selectedStatusOption.value === 'active') {
      addNewRow();
    }
  };

  const handleLedgerChange = (selectedLedgerOption, rowId) => {
    setRows(prevRows => 
      prevRows.map(row => 
        row.id === rowId 
          ? { ...row, selectedLedger: selectedLedgerOption }
          : row
      )
    );
  };

  const handleSubGroupChange = (selectedSubGroupOption, rowId) => {
    setRows(prevRows => 
      prevRows.map(row => 
        row.id === rowId 
          ? { ...row, selectedSubGroup: selectedSubGroupOption }
          : row
      )
    );
  };

  const handleMainGroupChange = (selectedMainGroupOption, rowId) => {
    setRows(prevRows => 
      prevRows.map(row => 
        row.id === rowId 
          ? { ...row, selectedMainGroup: selectedMainGroupOption }
          : row
      )
    );
  };

  // Add new row function with empty values
  const addNewRow = () => {
    const newRowId = nextRowId;
    setRows(prevRows => [...prevRows, { 
      id: newRowId,
      selectedLedger: null,
      selectedSubGroup: null,
      selectedMainGroup: null,
      selectedStatus: { value: 'inactive', label: 'Inactive' }
    }]);
    setNextRowId(prevId => prevId + 1);
  };

  const handleBack = () => {
    navigate(-1);
  };

  // Function to merge ledger with groups
  const mergeLedgerWithGroups = async (ledgerCode, subGroupCode, mainGroupCode) => {
    try {
      const response = await api.post('/consolidated/merge', {
        ledger_code: ledgerCode,
        sub_group_code: subGroupCode,
        main_group_code: mainGroupCode
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  // Function to demerge ledger
  const demergeLedger = async (ledgerCode) => {
    try {
      const response = await api.post(`/consolidated/demerge/${ledgerCode}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  // Submit consolidation data to backend
  const handleSubmit = async () => {
    // Filter valid rows (rows with ledger selected)
    const validRows = rows.filter(row => row.selectedLedger);

    // Check if there are any valid rows to submit
    if (validRows.length === 0) {
      toast.error('Please select at least one ledger to submit', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    // Validate valid rows have either sub group or main group
    for (let i = 0; i < validRows.length; i++) {
      const row = validRows[i];
      
      if (!row.selectedSubGroup && !row.selectedMainGroup) {
        toast.error(`Row with ledger "${row.selectedLedger.ledger_name}": Please select either a Sub Group or Main Group`, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        return;
      }
    }

    // Check if any selected ledger is already active in consolidation
    const activeLedgerCodes = consolidatedData
      .filter(item => item.status === 'active')
      .map(item => item.ledger_code);

    const duplicateLedgers = validRows.filter(row => 
      activeLedgerCodes.includes(row.selectedLedger.ledger_code)
    );

    if (duplicateLedgers.length > 0) {
      const ledgerNames = duplicateLedgers.map(row => row.selectedLedger.ledger_name).join(', ');
      toast.error(`The following ledgers are already active in consolidation: ${ledgerNames}. Please refresh the page to see updated available ledgers.`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    // Simple confirmation dialog
    const isConfirmed = window.confirm(`Do you wish to submit ${validRows.length} consolidation record(s)? ${rows.length - validRows.length} empty record(s) will be skipped.`);
    
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
      // Submit only valid rows
      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < validRows.length; i++) {
        const row = validRows[i];
        try {
          const consolidationData = {
            serial_no: i + 1, // Sequential for submitted rows only
            ledger_code: row.selectedLedger.ledger_code,
            sub_group_code: row.selectedSubGroup ? row.selectedSubGroup.sub_group_code : null,
            main_group_code: row.selectedMainGroup ? row.selectedMainGroup.main_group_code : null,
            status: row.selectedStatus.value
          };

          console.log('Submitting consolidation data:', consolidationData);

          // Create the consolidation record
          const response = await api.post('/consolidated', consolidationData);
          
          if (response.data) {
            // If status is active, merge the ledger with groups
            if (row.selectedStatus.value === 'active') {
              await mergeLedgerWithGroups(
                row.selectedLedger.ledger_code,
                row.selectedSubGroup ? row.selectedSubGroup.sub_group_code : null,
                row.selectedMainGroup ? row.selectedMainGroup.main_group_code : null
              );
            } else {
              // If status is inactive, demerge the ledger
              await demergeLedger(row.selectedLedger.ledger_code);
            }
            successCount++;
          }
        } catch (error) {
          console.error(`Error submitting row ${i + 1}:`, error);
          errorCount++;
          // Continue with next row even if one fails
        }
      }

      if (errorCount === 0) {
        toast.success(`${successCount} consolidation record(s) created successfully! ${rows.length - validRows.length} empty record(s) were skipped.`, {
          position: "top-right",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });

        // Refresh consolidated data after successful submission
        try {
          const response = await api.get('/connect_consolidates');
          if (Array.isArray(response.data)) {
            setConsolidatedData(response.data);
          }
        } catch (error) {
          console.error('Error refreshing consolidated data:', error);
        }
      } else if (successCount > 0) {
        toast.warning(`${successCount} record(s) submitted successfully, ${errorCount} record(s) failed. ${rows.length - validRows.length} empty record(s) were skipped.`, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } else {
        toast.error(`All ${errorCount} record(s) failed to submit.`, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
      
      // Reset form only if all submissions were successful
      if (errorCount === 0) {
        setRows([{ 
          id: 1, 
          selectedLedger: null,
          selectedSubGroup: null,
          selectedMainGroup: null,
          selectedStatus: { value: 'inactive', label: 'Inactive' }
        }]);
        setNextRowId(2);
      }
      
    } catch (error) {
      console.error('Error in submission process:', error);
      toast.error(`❌ Submission process error: ${error.response?.data?.error || error.message}`, {
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

  // Custom styles for react-select with wider menu for longer labels
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
      minWidth: '300px', // Wider to accommodate longer labels
      width: 'auto',
    }),
    menuList: (provided) => ({
      ...provided,
      minWidth: '300px',
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

  // Custom component to display only the code in the select field when selected
  const formatOptionLabel = (option, { context }) => {
    if (option.__isNew__) {
      return option.label;
    }
    
    if (context === 'value') {
      // When displayed in the select box (after selection), show only the code
      return option.value;
    }
    
    // When displayed in the dropdown options, show the full label
    return (
      <div className="whitespace-nowrap">
        <span className="font-medium">{option.value}</span>
        <span className="text-gray-600 ml-2">- {option.ledger_name || option.sub_group_name || option.main_group_name}</span>
        {option.debit_credit && (
          <span className="text-gray-500 ml-2">- {option.debit_credit}</span>
        )}
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

        <div className="h-[calc(100vh-120px)] overflow-auto">
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
              {rows.map((row, index) => (
                <tr key={row.id}>
                  <td>
                    <input
                      type="text"
                      value={index + 1}
                      className="w-10 pl-0.5 font-medium capitalize text-[12px] focus:bg-yellow-200 focus:outline-none focus:border-blue-500 focus:border border border-transparent text-center bg-gray-100"
                      autoComplete="off"
                      readOnly
                    />
                  </td>
                  
                  {/* Ledger Code */}
                  <td>
                    <Select 
                      options={ledgerOptions} 
                      value={row.selectedLedger} 
                      onChange={(option) => handleLedgerChange(option, row.id)} 
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
                      value={row.selectedLedger ? row.selectedLedger.ledger_name : ''}
                      placeholder={row.selectedLedger ? '' : 'Ledger Name'}
                    />
                  </td>
                  
                  {/* Sub Group Code */}
                  <td>
                    <Select 
                      options={subGroupOptions} 
                      value={row.selectedSubGroup} 
                      onChange={(option) => handleSubGroupChange(option, row.id)} 
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
                      value={row.selectedSubGroup ? row.selectedSubGroup.sub_group_name : ''}
                      placeholder={row.selectedSubGroup ? '' : 'Sub Group Name'}
                    />
                  </td>
                  
                  {/* Main Group Code */}
                  <td>
                    <Select 
                      options={mainGroupOptions} 
                      value={row.selectedMainGroup} 
                      onChange={(option) => handleMainGroupChange(option, row.id)} 
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
                      value={row.selectedMainGroup ? row.selectedMainGroup.main_group_name : ''}
                      placeholder={row.selectedMainGroup ? '' : 'Main Group Name'}
                    />
                  </td>
                  
                  {/* Status */}
                  <td>
                    <Select 
                      options={statusOptions} 
                      value={row.selectedStatus} 
                      onChange={(option) => handleStatusChange(option, row.id)} 
                      styles={statusStyles} 
                      placeholder="Status" 
                      isSearchable={false}
                      className='w-20 text-[12px]'
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Static Submit Button */}
        <div className='absolute bottom-4 right-4'>
          <button 
            type='button' 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`px-4 py-2 rounded cursor-pointer ${
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