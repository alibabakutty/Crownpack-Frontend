import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';

const ViewFetchMaster = () => {
  const { type } = useParams();
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasFetched, setHasFetched] = useState(false);
  const [consolidationStatus, setConsolidationStatus] = useState('inactive');
  const searchInputRef = useRef(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const listRef = useRef(null);

  // Configuration for different module types
  const moduleConfig = {
    'main-group': {
      title: 'Main Group Items',
      apiEndpoint: '/main_groups',
      searchPlaceholder: '',
      itemName: 'MainGroupNames',
      fields: {
        primary: 'main_group_name',
        code: 'main_group_code',
        report: 'report',
        status: 'status',
      },
    },
    'sub-group': {
      title: 'Sub Group Items',
      apiEndpoint: '/sub_groups',
      searchPlaceholder: '',
      itemName: 'SubGroupNames',
      fields: {
        primary: 'sub_group_name',
        code: 'sub_group_code',
        report: 'report',
        status: 'status',
      },
    },
    ledger: {
      title: 'Ledgers',
      // Dynamic API endpoint
      apiEndpoint: consolidationStatus === 'active' ? '/consolidated' : '/ledgers',
      searchPlaceholder: '',
      itemName: 'LedgerNames',
      fields: {
        primary: 'ledger_name',
        code: 'ledger_code',
        report: 'tally_report',
        status: 'status',
        link_status: 'link_status',
      },
    },
    division: {
      title: 'Divisions',
      apiEndpoint: '/divisions',
      searchPlaceholder: '',
      itemName: 'DivisionNames',
      fields: {
        primary: 'division_name',
        code: 'division_code',
        report: 'report',
        status: 'status',
      },
    },
  };

  const typeNames = {
    'main-group': 'Main Groups',
    'sub-group': 'Sub Groups',
    ledger: 'Ledgers',
    division: 'Divisions',
  };

  // Get current module configuration
  const currentModule = moduleConfig[type];

  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  // Keyboard navigation handler
  useEffect(() => {
    const handleKeyDown = e => {
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => {
            const newIndex = Math.max(0, prev - 1);
            scrollToItem(newIndex);
            return newIndex;
          });
          break;

        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => {
            const newIndex = Math.min(filteredData.length - 1, prev + 1);
            scrollToItem(newIndex);
            return newIndex;
          });
          break;

        case 'Escape':
          e.preventDefault();
          navigate(-1);
          break;

        case 'Enter':
          e.preventDefault();
          if (filteredData[selectedIndex]) {
            handleItemClick(filteredData[selectedIndex], selectedIndex);
          }
          break;

        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [filteredData, selectedIndex, navigate]);

  // Scroll to selected item
  const scrollToItem = index => {
    if (listRef.current) {
      const items = listRef.current.querySelectorAll('li');
      if (items[index]) {
        items[index].scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        });
      }
    }
  };

  // Reset selected index when data changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredData]);

  // Filter data function with useCallback to prevent unnecessary re-renders
  const filterData = useCallback(
    (dataToFilter, searchValue) => {
      if (!currentModule || !dataToFilter) return [];

      if (searchValue.trim() === '') {
        return dataToFilter;
      } else {
        return dataToFilter.filter(item => {
          return Object.values(currentModule.fields).some(field => {
            const value = item[field];
            return value && value.toString().toLowerCase().includes(searchValue.toLowerCase());
          });
        });
      }
    },
    [currentModule],
  );

  // Single useEffect for data fetching
  useEffect(() => {
    if (!type || !currentModule || hasFetched) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await api.get(currentModule.apiEndpoint);

        setData(response.data);
        setFilteredData(response.data);
        setHasFetched(true);
      } catch (error) {
        console.error(`Error fetching ${currentModule.title.toLowerCase()}:`, error);
        setError(`Failed to fetch ${currentModule.title.toLowerCase()}`);
        setData([]);
        setFilteredData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [type, currentModule, hasFetched, consolidationStatus]);

  // Filter data based on search term
  useEffect(() => {
    if (data.length > 0) {
      const filtered = filterData(data, searchTerm);
      setFilteredData(filtered);
    }
  }, [searchTerm, data, filterData]);

  const handleSearchChange = e => {
    setSearchTerm(e.target.value);
  };

  const formatType = str => {
    if (!str) return '';
    return str
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toUpperCase())
      .join(' ');
  };

  const handleMasterGroupClick = item => {
    navigate(`/master-group-view/${item.item_code}`);
  };

  const handleSubGroupClick = item => {
    navigate(`/sub-group-view/${item.customer_code}`);
  };

  const handleLedgerClick = item => {
    navigate(`/consolidated/ledger/${item.ledger_code}`);
  };

  const handleDivisionClick = item => {
    navigate(`/division-view/${item.id}`);
  };

  // Handle item click based on type
  const handleItemClick = (item, index) => {
    setSelectedIndex(index);

    switch (type) {
      case 'main-group':
        handleMasterGroupClick(item);
        break;
      case 'sub-group':
        handleSubGroupClick(item);
        break;
      case 'ledger':
        handleLedgerClick(item);
        break;
      case 'division':
        handleDivisionClick(item);
      default:
        break;
    }
  };

  // Toggle consolidation status
  const toggleConsolidationStatus = () => {
    setConsolidationStatus(prev => prev === 'active' ? 'inactive' : 'active');
    setHasFetched(false);
    setData([]);
    setFilteredData([]);
  };

  // Render consolidation toggle button
  const renderConsolidationToggle = () => {
    if (type === 'ledger') {
      return (
        <button
          onClick={toggleConsolidationStatus}
          disabled={loading}
          className={`ml-4 px-3 py-1 text-sm rounded ${
            consolidationStatus === 'active' 
              ? 'bg-green-500 text-white' 
              : 'bg-gray-300 text-gray-700'
          } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {consolidationStatus === 'active' ? 'Consolidated View' : 'Normal View'}
        </button>
      );
    }
    return null;
  };

  // Render list items based on type
  const renderListItem = (item, index) => {
    if (!currentModule) return null;

    const isSelected = index === selectedIndex;

    const getItemContent = () => {
      switch (type) {
        case 'main-group':
          return (
            <div className="grid grid-cols-7 items-center leading-4">
              <p className="text-[13px] text-gray-800 font-medium">{item.main_group_code}</p>
              <p className="text-[13px] text-gray-800 font-medium -ml-14">{item.main_group_name}</p>
              <p className="text-[13px] text-gray-600 ml-20 w-36">
                <span>{item.tally_report}</span>
              </p>
              <p className="text-[13px] text-gray-600 ml-[98px] w-36">
                <span>{item.sub_report}</span>
              </p>
              <p className="text-[13px] text-gray-600 w-10 ml-28">
                <span>{item.debit_credit}</span>
              </p>
              <p className="text-[13px] text-gray-600 w-30 ml-[85px]">
                <span>{item.trial_balance}</span>
              </p>
              {item.status && (
                <p className='w-16 ml-[73px] text-[13px]'>
                  <span className={`px-2`}>{item.status}</span>
                </p>
              )}
            </div>
          );

        case 'sub-group':
          return (
            <div className="grid grid-cols-7 items-center">
              <p className="text-[13px] text-gray-800 font-medium">{item.sub_group_code}</p>
              <p className="text-[13px] text-gray-800 font-medium -ml-14">{item.sub_group_name}</p>
              <p className="text-[13px] text-gray-600 ml-20 w-36">
                <span>{item.tally_report}</span>
              </p>
              <p className="text-[13px] text-gray-600 ml-[82px] w-36">
                <span>{item.sub_report}</span>
              </p>
              <p className="text-[13px] text-gray-600 w-10 ml-28">
                <span>{item.debit_credit}</span>
              </p>
              <p className="text-[13px] text-gray-600 w-30 ml-[85px]">
                <span>{item.trial_balance}</span>
              </p>
              {item.status && (
                <p className='w-16 ml-[73px] text-[13px]'>
                  <span className={`px-2`}>{item.status}</span>
                </p>
              )}
            </div>
          );

        case 'ledger':
          return (
            <div className="grid grid-cols-7 items-center">
              <p className="text-[13px] text-gray-800 font-medium">{item.ledger_code}</p>
              <p className="text-[13px] text-gray-600 -ml-[76px] w-[280px]">{item.ledger_name}</p>
              <p className="text-[13px] text-gray-600 w-36 ml-[104px]">
                <span>{item.tally_report}</span>
              </p>
              <p className="text-[13px] text-gray-600 w-16 ml-32">
                <span>{item.debit_credit}</span>
              </p>
              <p className="text-[13px] text-gray-600 w-20 ml-32">
                <span>{item.trial_balance}</span>
              </p>
              {item.status && (
                <p className='w-30 ml-[85px] text-[13px]'>
                  <span className={`px-2 ml-10`}>{item.status}</span>
                </p>
              )}

              {/* Add link_status here for ledger only */}
              {item.link_status && (
                <p className='w-16 ml-[73px]'>
                  <span className={`text-xs px-2 capitalize`}>{item.link_status}</span>
                </p>
              )}
            </div>
          );

        case 'division':
          return (
            <div className="grid grid-cols-4 items-center">
              <p className="text-[13px] text-gray-800 font-medium">{item.division_code}</p>
              <p className="text-[13px] text-gray-800 font-medium -ml-8">{item.division_name}</p>
              <p className="text-[13px] text-gray-600 text-right">
                <span>{item.report}</span>
              </p>
              {item.status && (
                <span className={`text-[13px] px-2 mr-1 rounded justify-self-end`}>{item.status}</span>
              )}
            </div>
          );

        default:
          return null;
      }
    };

    return (
      <li
        key={item.id || item.item_code || index}
        className={`border-b border-gray-300 px-1.5 py-1 transition-colors cursor-pointer ${
          isSelected ? 'bg-yellow-100 border-yellow-300' : 'hover:bg-blue-50'
        }`}
        onClick={() => handleItemClick(item, index)}
      >
        {getItemContent()}
      </li>
    );
  };

  // Main render with stable conditional rendering
  const renderContent = () => {
    if (loading && !hasFetched) {
      return (
        <div className="h-[70vh] flex items-center justify-center">
          <div className="text-gray-500">Loading {currentModule?.title.toLowerCase()}...</div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="h-[70vh] flex items-center justify-center">
          <div className="text-red-600 text-center">
            <p>Error: {error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    if (!currentModule) {
      return (
        <div className="h-[70vh] flex items-center justify-center">
          <div className="text-red-600">Invalid module type</div>
        </div>
      );
    }

    return (
      <div className="h-[78vh] overflow-y-auto" ref={listRef}>
        <div>
          {filteredData.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">
              {searchTerm ? 'No items match your search.' : `No ${currentModule.itemName} found.`}
            </div>
          ) : (
            <ul className="divide-y divide-gray-300">
              {filteredData.map((item, index) => renderListItem(item, index))}
            </ul>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex font-amasis">
      <div className="w-full h-screen flex">
        <div className="w-[30%] bg-linear-to-t to-cyan-400 from-[#ccc]">
          <div className="flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-white hover:text-gray-200 transition-colors bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg backdrop-blur-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              <span className="text-sm font-medium">Back</span>
            </button>
            {renderConsolidationToggle()}
          </div>
        </div>
        <div className="w-[70%] bg-linear-to-t to-cyan-400 from-[#ccc] flex justify-center flex-col items-center">
          <div className="w-[955px] h-16 flex flex-col justify-center items-center border border-black bg-yellow-50 border-b-0">
            <p className="text-[13px] font-medium underline underline-offset-4 decoration-gray-400 text-gray-700">
              {formatType(type)} Display
            </p>
            <input
              type="text"
              placeholder={currentModule?.searchPlaceholder || 'Search...'}
              value={searchTerm}
              ref={searchInputRef}
              onChange={handleSearchChange}
              className="w-[550px] ml-2 mt-2 h-5 capitalize font-medium pl-1 text-sm focus:bg-yellow-200 focus:border focus:border-blue-500 focus:outline-0 relative z-10"
              autoComplete="off"
            />
          </div>
          <div className="w-[955px] h-[89vh] border border-gray-600 bg-amber-50">
            <h2 className="px-1 py-0.3 bg-green-800 text-white text-center text-[13px] pl-3">
              List of {typeNames[type] || 'Items'}
            </h2>
            <div className="border border-b-slate-400 flex justify-between px-1 py-0.3 text-[16px]">
              <div>Code</div>
              <div className={` ${type === 'ledger' ? '-ml-60' : '-ml-44'}`}>Name</div>
              {type !== 'division' && (
                <div className={` ${type === 'ledger' ? '-mr-56' : '-mr-48'}`}>Tally Report</div>
              )}
              {type !== 'ledger' && (
                <div className={` ${type === 'ledger' ? '-mr-56' : '-mr-48'}`}>Sub Report</div>
              )}
              {type !== 'division' && (
                <div className={` ${type === 'ledger' ? '-mr-56' : '-mr-48'}`}>Debit/Credit</div>
              )}
              {type !== 'division' && (
                <div className={` ${type === 'ledger' ? '-mr-56' : '-mr-48'}`}>Trial Balance</div>
              )}
              <div className={`${type === 'ledger' ? '-mr-60' : 'mr-6'}`}>Status</div>
              {type === 'ledger' && <div>Link Status</div>}
            </div>
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewFetchMaster;