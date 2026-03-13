import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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

          netDr: 0,
          netCr: 0
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

    });

    // calculate net
    Object.values(grouped).forEach(g => {
      const net = g.totalDr - g.totalCr;

      if (net > 0) {
        g.netDr = net;
        g.netCr = 0;
      } else {
        g.netDr = 0;
        g.netCr = Math.abs(net);
      }
    })
    return Object.values(grouped).sort((a, b) =>
      a.ledger_name.localeCompare(b.ledger_name),
    )
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

  const totals = useMemo(() => {
    return filteredData.reduce((acc, item) => ({
      totalDr: acc.totalDr + Number(item.totalDr || 0),
      totalCr: acc.totalCr + Number(item.totalCr || 0),
      netDr: acc.netDr + Number(item.netDr || 0),
      netCr: acc.netCr + Number(item.netCr || 0),
    }), { totalDr: 0, totalCr: 0, netDr: 0, netCr: 0 });
  }, [filteredData]);

  const renderListItem = (item, index) => {
    const isSelected = index === selectedIndex;

    return (
      <li
        key={index}
        className={`py-0.3 cursor-pointer ${isSelected
          ? 'bg-green-100'
          : 'hover:bg-blue-50'
          }`}
        onClick={() => handleItemClick(item)}
      >
        <div className="flex text-[12px] border-b-[0.5px] border-gray-400">

          <div className=' w-[45%] text-center border-r-[0.5px] border-gray-400 truncate text-left pl-0.5'>
            {item.ledger_name || ''}
          </div>
          <div className=' w-[14%] border-r-[0.5px] border-gray-400 text-right pr-0.5'>
            {formatToNaira(item.totalDr)}
          </div>
          <div className=' w-[14%] border-r-[0.5px] border-gray-400 text-right pr-0.5 text-red-500'>
            {formatToNaira(item.totalCr)}
          </div>
          <div className=' w-[14%] border-r-[0.5px] border-gray-400 text-right pr-0.5'>
            {item.netDr ? formatToNaira(item.netDr) : ''}
          </div>
          <div className=' w-[14%] border-r-[0.5px] border-gray-400 text-right pr-0.5 text-red-500'>
            {item.netCr ? formatToNaira(item.netCr) : ''}
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
      <div className="w-full h-screen flex">
        {/* RIGHT PANEL */}
        <div className="w-full flex flex-col items-center">

          <div className="w-[1360px] border border-black bg-yellow-50 border-b-0 grid grid-cols-3 items-center py-1.5 px-2">

            <div className='flex justify-start'>
              <button
                onClick={() => navigate(-1)}
                className=" flex items-center gap-1 px-2 py-1 bg-green-800 text-white rounded hover:bg-green-700 text-xs"
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
            </div>

            <div className='flex justify-center'>
              <input
                ref={searchInputRef}
                value={searchTerm}
                onChange={e =>
                  setSearchTerm(e.target.value)
                }
                placeholder="Search voucher..."
                className="w-[550px] h-5 text-sm border pl-1"
              />
            </div>

            <div className='flex justify-end'>
              <p className="text-[13px] underline font-semibold">
                Trial Balance Reports - Ledger
              </p>
            </div>
          </div>

          <div className="w-[1360px] border border-gray-600 bg-amber-50 overflow-x-auto">

            <div className='min-w-[1350px]'>
              <h2 className="bg-green-800 text-white text-center text-[13px]">
                List of Trial Balance Reports - Ledger
              </h2>

              <div className="flex text-[12px] font-semibold border-b-[0.5px] border-gray-500">
                <div className='w-[45%] text-center border-r-[0.5px] border-gray-500'>Ledger</div>
                <div className='w-[14%] text-center border-r-[0.5px] border-gray-500'>
                  Total (Dr)
                </div>
                <div className='w-[14%] text-center border-r-[0.5px] border-gray-500'>
                  Total (Cr)
                </div>
                <div className='w-[14%] text-center border-r-[0.5px] border-gray-500'>
                  Net Amount (Dr)
                </div>
                <div className='w-[14%] text-center border-r-[0.5px] border-gray-500'>
                  Net Amount (Cr)
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

              <div className="flex text-[11px] font-bold bg-yellow-100 border-t-[1.5px] border-gray-600">
                <div className='w-[45%] text-right pr-2 border-r-[0.5px] border-gray-500'>Grand Total</div>
                <div className='w-[14%] text-right pr-1 border-r-[0.5px] border-gray-500'>{formatToNaira(totals.totalDr)}</div>
                <div className='w-[14%] text-right pr-1 border-r-[0.5px] border-gray-500 text-red-500'>{formatToNaira(totals.totalCr)}</div>
                <div className='w-[14%] text-right pr-1 border-r-[0.5px] border-gray-500'>{formatToNaira(totals.netDr)}</div>
                <div className='w-[14%] text-right pr-1 text-red-500'>{formatToNaira(totals.netCr)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FetchTrialBalanceByLedger;