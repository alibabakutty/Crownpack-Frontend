import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import { formatToNaira } from '../voucher/utils/voucherUtils';

const SecondaryFetchLedger = () => {
    const { ledger } = useParams();
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
    const decodedLedger = decodeURIComponent(ledger);
    // Focus search
    useEffect(() => {
        if (searchInputRef.current) searchInputRef.current.focus();
    }, []);

    // FETCH DATA
    useEffect(() => {

        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await api.get(`vouchers/ledger/${ledger}`);
                const rows = response?.data?.data || [];
                console.log("API RESPONSE:", rows);

                // const ledgerGrouped = groupByLedger(rows);

                setData(rows);
                setFilteredData(rows);
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
    }, [ledger, hasFetched]);

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
        navigate(`/vouchers/ledger/${ledger}`)
    };

    const totals = useMemo(() => {
        return filteredData.reduce((acc, item) => ({
            d1Dr: acc.d1Dr + (item.d1Type === 'Debit' ? Number(item.d1Amount || 0) : 0),
            d1Cr: acc.d1Cr + (item.d1Type === 'Credit' ? Number(item.d1Amount || 0) : 0),
            d2Dr: acc.d2Dr + (item.d2Type === 'Debit' ? Number(item.d2Amount || 0) : 0),
            d2Cr: acc.d2Cr + (item.d2Type === 'Credit' ? Number(item.d2Amount || 0) : 0),
            d3Dr: acc.d3Dr + (item.d3Type === 'Debit' ? Number(item.d3Amount || 0) : 0),
            d3Cr: acc.d3Cr + (item.d3Type === 'Credit' ? Number(item.d3Amount || 0) : 0),
            d4Dr: acc.d4Dr + (item.d4Type === 'Debit' ? Number(item.d4Amount || 0) : 0),
            d4Cr: acc.d4Cr + (item.d4Type === 'Credit' ? Number(item.d4Amount || 0) : 0),
            d5Dr: acc.d5Dr + (item.d5Type === 'Debit' ? Number(item.d5Amount || 0) : 0),
            d5Cr: acc.d5Cr + (item.d5Type === 'Credit' ? Number(item.d5Amount || 0) : 0),
            totalDr: acc.totalDr + Number(item.totalDr || 0),
            totalCr: acc.totalCr + Number(item.totalCr || 0),

            netDr: acc.netDr + (item.netAmt > 0 ? Number(item.netAmt) : 0),
            netCr: acc.netCr + (item.netAmt < 0 ? Math.abs(Number(item.netAmt)) : 0),
        }), { d1Dr: 0, d1Cr: 0, d2Dr: 0, d2Cr: 0, d3Dr: 0, d3Cr: 0, d4Dr: 0, d4Cr: 0, d5Dr: 0, d5Cr: 0, totalDr: 0, totalCr: 0, netDr: 0, netCr: 0 });
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
                <div className="flex text-[12px] border-b border-gray-400">
                

                    <div className='w-[35%] text-center border-r border-gray-400 truncate text-left pl-0.5'>
                        {item.ledger_name || ''}
                    </div>
                    <div className='w-[16%] border-r border-gray-400 text-center pr-0.5 capitalize'>
                        {item.division_type}
                    </div>
                    <div className='w-[16%] border-r border-gray-400 text-right pr-0.5'>
                        {item.d1Type === 'Debit' ? formatToNaira(item.d1Amount) : ''}
                    </div>
                    <div className='w-[16%] border-r border-gray-400 text-right pr-0.5 text-red-500'>
                        {item.d1Type === 'Credit' ? formatToNaira(item.d1Amount) : ''}
                    </div>
                    <div className='w-[16%] border-r border-gray-400 text-right pr-0.5'>
                        {item.d2Type === 'Debit' ? formatToNaira(item.d2Amount) : ''}
                    </div>
                    <div className='w-[16%] border-r border-gray-400 text-right pr-0.5 text-red-500'>
                        {item.d2Type === 'Credit' ? formatToNaira(item.d2Amount) : ''}
                    </div>
                    <div className='w-[16%] border-r border-gray-400 text-right pr-0.5'>
                        {item.d3Type === 'Debit' ? formatToNaira(item.d3Amount) : ''}
                    </div>
                    <div className='w-[16%] border-r border-gray-400 text-right pr-0.5 text-red-500'>
                        {item.d3Type === 'Credit' ? formatToNaira(item.d3Amount) : ''}
                    </div>
                    <div className='w-[16%] border-r border-gray-400 text-right pr-0.5'>
                        {item.d4Type === 'Debit' ? formatToNaira(item.d4Amount) : ''}
                    </div>
                    <div className='w-[16%] border-r border-gray-400 text-right pr-0.5 text-red-500'>
                        {item.d4Type === 'Credit' ? formatToNaira(item.d4Amount) : ''}
                    </div>
                    <div className='w-[16%] border-r border-gray-400 text-right pr-0.5'>
                        {item.d5Type === 'Debit' ? formatToNaira(item.d5Amount) : ''}
                    </div>
                    <div className='w-[16%] border-r border-gray-400 text-right pr-0.5 text-red-500'>
                        {item.d5Type === 'Credit' ? formatToNaira(item.d5Amount) : ''}
                    </div>
                    <div className='w-[18%] border-r border-gray-400 text-right pr-0.5'>
                        {formatToNaira(item.totalDr)}
                    </div>
                    <div className='w-[18%] border-r border-gray-400 text-right pr-0.5 text-red-500'>
                        {formatToNaira(item.totalCr)}
                    </div>
                    <div className='w-[18%] border-r border-gray-400 text-right pr-0.5'>
                        {item.netAmt > 0 ? formatToNaira(item.netAmt) : ''}
                    </div>
                    <div className='w-[18%] border-r border-gray-400 text-right pr-0.5 text-red-500'>
                        {item.netAmt < 0 ? formatToNaira(Math.abs(item.netAmt)) : ''}
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

                    <div className="w-[1360px] border border-black bg-yellow-50 border-b-0 grid grid-cols-3 items-center py-2">

                        <div className='flex justify-start'>
                            <button
                                onClick={() => navigate(-1)}
                                className=" flex items-center gap-1 px-2 py-0.5 bg-green-800 text-white rounded hover:bg-green-700 text-xs ml-1"
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

                        <div className='flex justify-end pr-1'>
                            <p className="text-[13px] underline font-semibold">
                                Trial Balance - {decodedLedger}
                            </p>
                        </div>
                    </div>

                    <div className="w-[1360px] border border-gray-600 bg-amber-50 overflow-x-auto">

                        <div className='min-w-[1950px]'>
                            <h2 className="bg-green-800 text-white text-center text-[13px]">
                                List of Trial Balance Reports - Ledger
                            </h2>

                            <div className="flex text-[12px] font-semibold border-b border-gray-400">
                               
                                <div className='w-[34.8%] text-center border-r border-gray-400'>Ledger</div>
                                <div className='w-[16%] text-center border-r border-gray-400'>
                                    Division Type
                                </div>
                                <div className='w-[16%] text-center border-r border-gray-400'>
                                    D1 (Dr)
                                </div>
                                <div className='w-[16%] text-center border-r border-gray-400'>
                                    D1 (Cr)
                                </div>
                                <div className='w-[16%] text-center border-r border-gray-400'>
                                    D2 (Dr)
                                </div>
                                <div className='w-[16%] text-center border-r border-gray-400'>
                                    D2 (Cr)
                                </div>
                                <div className='w-[16%] text-center border-r border-gray-400'>
                                    D3 (Dr)
                                </div>
                                <div className='w-[16%] text-center border-r border-gray-400'>
                                    D3 (Cr)
                                </div>
                                <div className='w-[16%] text-center border-r border-gray-400'>
                                    D4 (Dr)
                                </div>
                                <div className='w-[16%] text-center border-r border-gray-r00'>
                                    D4 (Cr)
                                </div>
                                <div className='w-[16%] text-center border-r border-gray-400'>
                                    D5 (Dr)
                                </div>
                                <div className='w-[16%] text-center border-r border-gray-400'>
                                    D5 (Cr)
                                </div>
                                <div className='w-[18%] text-center border-r border-gray-400'>
                                    Total (Dr)
                                </div>
                                <div className='w-[18%] text-center border-r border-gray-400'>
                                    Total (Cr)
                                </div>
                                <div className='w-[18%] text-center border-r border-gray-400'>
                                    Net (Dr)
                                </div>
                                <div className='w-[18%] text-center border-r border-gray-400'>
                                    Net (Cr)
                                </div>
                            </div>

                            <div
                                className="h-[81vh]"
                                ref={listRef}
                            >
                                <ul>
                                    {filteredData.map(
                                        renderListItem
                                    )}
                                </ul>
                            </div>

                            {/* Grand Total Footer */}
                            <div className="flex text-[11px] font-bold bg-gray-200 border-t-[1.5px] border-gray-600 border-b-[1.5px]">
                                <div className='w-[35%] text-right pr-2 border-r-[0.5px] border-gray-400'>GRAND TOTAL</div>
                                <div className='w-[13%] border-r-[0.5px] border-gray-400 text-right pr-1'>{formatToNaira(totals.d1Dr)}</div>
                                <div className='w-[13%] border-r-[0.5px] border-gray-400 text-right pr-1'>{formatToNaira(totals.d1Cr)}</div>
                                <div className='w-[13%] border-r-[0.5px] border-gray-400 text-right pr-1'>{formatToNaira(totals.d2Dr)}</div>
                                <div className='w-[13%] border-r-[0.5px] border-gray-400 text-right pr-1'>{formatToNaira(totals.d2Cr)}</div>
                                <div className='w-[13%] border-r-[0.5px] border-gray-400 text-right pr-1'>{formatToNaira(totals.d3Dr)}</div>
                                <div className='w-[13%] border-r-[0.5px] border-gray-400 text-right pr-1'>{formatToNaira(totals.d3Cr)}</div>
                                <div className='w-[13%] border-r-[0.5px] border-gray-400 text-right pr-1'>{formatToNaira(totals.d4Dr)}</div>
                                <div className='w-[13%] border-r-[0.5px] border-gray-400 text-right pr-1'>{formatToNaira(totals.d4Cr)}</div>
                                <div className='w-[13%] border-r-[0.5px] border-gray-400 text-right pr-1'>{formatToNaira(totals.d5Dr)}</div>
                                <div className='w-[13%] border-r-[0.5px] border-gray-400 text-right pr-1'>{formatToNaira(totals.d5Cr)}</div>
                                <div className='w-[13%] border-r-[0.5px] border-gray-400 text-right pr-1'>{formatToNaira(totals.totalDr)}</div>
                                <div className='w-[13%] border-r-[0.5px] border-gray-400 text-right pr-1'>{formatToNaira(totals.totalCr)}</div>
                                <div className='w-[13%] text-right pr-1'>{formatToNaira(totals.netDr)}</div>
                                <div className='w-[13%] text-right pr-1 text-red-500'>{formatToNaira(totals.netCr)}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SecondaryFetchLedger;