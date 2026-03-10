import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import { formatToNaira } from '../voucher/utils/voucherUtils';

const moduleConfig = {
  voucher: {
    title: 'Voucher Transaction',
    apiEndpoint: '/vouchers',
    searchPlaceholder: 'Search by Voucher Number...',
    itemName: 'Vouchers',
    fields: { number: 'voucher_number', date: 'voucher_date', division: 'division_type' },
  }
};

const FetchTrialBalanceByLedger = () => {
  const { type } = useParams();
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasFetched, setHasFetched] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const searchInputRef = useRef(null);
  const listRef = useRef(null);
  const navigate = useNavigate();

  const currentModule = moduleConfig[type || 'voucher'];

  // Focus search
  useEffect(() => {
    if (searchInputRef.current) searchInputRef.current.focus();
  }, []);

  const groupByLedger = (rows) => {
    const grouped = {};

    rows.forEach(row => {
      const ledger = row.ledger_name;

      if (!grouped[ledger]) {
        grouped[ledger] = {
          ledger_name: ledger,
          division_type: row.division_type,

          d1Dr: 0, d1Cr: 0,
          d2Dr: 0, d2Cr: 0,
          d3Dr: 0, d3Cr: 0,
          d4Dr: 0, d4Cr: 0,
          d5Dr: 0, d5Cr: 0,

          totalDr: 0,
          totalCr: 0,
          netAmt: 0
        }
      }

      const g = grouped[ledger];

      if (row.d1Type === "Debit") g.d1Dr += Number(row.d1Amount || 0);
      if (row.d1Type === "Credit") g.d1Cr += Number(row.d1Amount || 0);

      if (row.d2Type === "Debit") g.d2Dr += Number(row.d2Amount || 0);
      if (row.d2Type === "Credit") g.d2Cr += Number(row.d2Amount || 0);

      if (row.d3Type === "Debit") g.d3Dr += Number(row.d3Amount || 0);
      if (row.d3Type === "Credit") g.d3Cr += Number(row.d3Amount || 0);

      if (row.d4Type === "Debit") g.d4Dr += Number(row.d4Amount || 0);
      if (row.d4Type === "Credit") g.d4Cr += Number(row.d4Amount || 0);

      if (row.d5Type === "Debit") g.d5Dr += Number(row.d5Amount || 0);
      if (row.d5Type === "Credit") g.d5Cr += Number(row.d5Amount || 0);

      g.totalDr += Number(row.totalDr || 0);
      g.totalCr += Number(row.totalCr || 0);
      g.netAmt += Number(row.netAmt || 0);
    });
    return Object.values(grouped);
  }

  // FETCH DATA
  useEffect(() => {

    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await api.get(currentModule.apiEndpoint);
        const rows = response?.data?.data || [];
        console.log("API RESPONSE:", rows);

        const ledgerGrouped = groupByLedger(rows);

        setData(ledgerGrouped);
        setFilteredData(ledgerGrouped);
        setHasFetched(true); // <--- ADD THIS
      } catch (err) {
        console.error("Fetch Error:", err);
        setError("Failed to fetch vouchers");
      } finally {
        setLoading(false);
      }
    };

    if (!hasFetched) {
      fetchData();
    }
  }, [currentModule.apiEndpoint, hasFetched]);

  const filterData = useCallback((list, term) => {
    if (!term) return list;

    const lowerTerm = term.toLowerCase();

    return list.filter(item =>
      item.voucher_number?.toLowerCase().includes(lowerTerm) ||
      item.ledger_name?.toLowerCase().includes(lowerTerm) ||
      item.voucher_date?.includes(lowerTerm) ||
      item.division_type?.toLowerCase().includes(lowerTerm) ||
      String(item.d1Amount).includes(lowerTerm) ||
      String(item.d2Amount).includes(lowerTerm) ||
      String(item.d3Amount).includes(lowerTerm) ||
      String(item.d4Amount).includes(lowerTerm) ||
      String(item.d5Amount).includes(lowerTerm) ||
      String(item.totalDr).includes(lowerTerm) ||
      String(item.totalCr).includes(lowerTerm) ||
      String(item.netAmt).includes(lowerTerm)
    );
  }, []);

  useEffect(() => {
    const filtered = filterData(data, searchTerm);
    setFilteredData(filtered);
    setSelectedIndex(0); // reset selection
  }, [searchTerm, data, filterData]);

  useEffect(() => {
    const container = listRef.current;
    if (!container) return;

    const selectedItem = container.children[0]?.children[selectedIndex];

    if (selectedItem) {
      selectedItem.scrollIntoView({
        block: "nearest",
        behavior: "smooth"
      });
    }
  }, [selectedIndex]);

  // KEYBOARD NAVIGATION
  useEffect(() => {
    const handleKeyDown = e => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          if (filteredData.length === 0) return;
          setSelectedIndex(prev =>
            Math.min(prev + 1, filteredData.length - 1)
          );
          break;

        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => Math.max(prev - 1, 0));
          break;

        case 'Enter':
          if (filteredData[selectedIndex]) {
            handleItemClick(filteredData[selectedIndex]);
          }
          break;

        case 'Escape':
          navigate(-1);
          break;

        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredData, selectedIndex, navigate]);

  const handleItemClick = (item) => {

    const ledger = encodeURIComponent(item.ledger_name);

    navigate(`/secondary-fetch-ledger/${ledger}`)

  };

  const renderListItem = (item, index) => {
    const isSelected = index === selectedIndex;

    return (
      <li
        key={index}
        className={`border-b py-0.3 cursor-pointer ${isSelected
          ? 'bg-yellow-100'
          : 'hover:bg-blue-50'
          }`}
        onClick={() => handleItemClick(item)}
      >
        <div className="flex text-[12px]">
          {/* <div className='font-semibold w-[9%] border border-right border-gray-500 pl-0.5 truncate'>{item.voucher_number}</div> */}

          <div className='font-semibold w-[35%] text-center border border-right border-gray-500 truncate text-left pl-0.5'>
            {item.ledger_name || ''}
          </div>
          <div className='font-semibold w-[18%] border border-right border-gray-500 text-right pr-0.5'>
            {formatToNaira(item.totalDr)}
          </div>
          <div className='font-semibold w-[18%] border border-right border-gray-500 text-right pr-0.5'>
            {formatToNaira(item.totalCr)}
          </div>
          <div className='font-semibold w-[18%] border border-right border-gray-500 text-right pr-0.5'>
            {formatToNaira(item.netAmt)}
          </div>
        </div>
      </li>
    );
  };

  if (loading)
    return (
      <div className="p-4 text-center">
        Loading vouchers...
      </div>
    );

  if (error)
    return (
      <div className="p-4 text-red-500 text-center">
        {error}
      </div>
    );

  return (
    <div className="flex font-amasis relative">
      <button
        onClick={() => navigate(-1)}
        className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 bg-green-800 text-white rounded hover:bg-green-700 text-xs"
      >
        <svg
          className="w-3 h-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
        Back
      </button>
      <div className="w-full h-screen flex">
        {/* RIGHT PANEL */}
        <div className="w-full flex flex-col items-center">

          <div className="w-[1360px] border border-black bg-yellow-50 border-b-0 flex flex-col items-center py-2">
            <p className="text-[13px] underline font-semibold">
              Trial Balance Reports - Ledger
            </p>

            <input
              ref={searchInputRef}
              value={searchTerm}
              onChange={e =>
                setSearchTerm(e.target.value)
              }
              placeholder="Search voucher..."
              className="w-[550px] mt-2 h-5 text-sm border pl-1"
            />
          </div>

          <div className="w-[1360px] border border-gray-600 bg-amber-50 overflow-x-auto">

            <div className='min-w-[1350px]'>
              <h2 className="bg-green-800 text-white text-center text-[13px]">
                List of Trial Balance Reports - Ledger
              </h2>

              <div className="flex text-[12px] font-semibold border-b">
                {/* <div className='w-[9%] text-center border border-gray-500'>VCH-No.</div> */}
                <div className='w-[35%] text-center border border-gray-500'>Ledger</div>
                <div className='w-[18%] text-center border border-gray-500'>
                  Total (Dr)
                </div>
                <div className='w-[18%] text-center border border-gray-500'>
                  Total (Cr)
                </div>
                <div className='w-[18%] text-center border border-gray-500'>
                  Net Amount
                </div>
              </div>

              <div
                className="h-[82vh]"
                ref={listRef}
              >
                <ul>
                  {filteredData.map(
                    renderListItem
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FetchTrialBalanceByLedger;