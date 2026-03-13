import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import { formatToNaira } from '../voucher/utils/voucherUtils';
import Decimal from 'decimal.js';

const moduleConfig = {
    voucher: {
        title: 'Voucher Transaction',
        apiEndpoint: '/vouchers',
        searchPlaceholder: 'Search by Voucher Number...',
        itemName: 'Vouchers',
        fields: { number: 'voucher_number', date: 'voucher_date', division: 'division_type' },
    }
};

const FetchMultipleTrialBalance = () => {
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

    // FETCH DATA
    useEffect(() => {

        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await api.get(currentModule.apiEndpoint);
                const rows = response?.data?.data || [];

                // Log to debug the structure of your response
                console.log("API RESPONSE:", rows);

                const multipleRows = rows.filter(
                    row => row.division_type?.toLowerCase() === 'multiple'
                );

                setData(multipleRows);
                setFilteredData(multipleRows);
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

    const handleItemClick = item => {
        navigate(`/voucher-transaction-report/${item.voucher_number}`);
    };

    const totals = useMemo(() => {
        return filteredData.reduce((acc, item) => {
            const toDec = (val) => new Decimal(val || 0);

            return {
                d1Dr: acc.d1Dr.plus(item.d1Type === 'Debit' ? toDec(item.d1Amount) : 0),
                d1Cr: acc.d1Cr.plus(item.d1Type === 'Credit' ? toDec(item.d1Amount) : 0),
                d2Dr: acc.d2Dr.plus(item.d2Type === 'Debit' ? toDec(item.d2Amount) : 0),
                d2Cr: acc.d2Cr.plus(item.d2Type === 'Credit' ? toDec(item.d2Amount) : 0),
                d3Dr: acc.d3Dr.plus(item.d3Type === 'Debit' ? toDec(item.d3Amount) : 0),
                d3Cr: acc.d3Cr.plus(item.d3Type === 'Credit' ? toDec(item.d3Amount) : 0),
                d4Dr: acc.d4Dr.plus(item.d4Type === 'Debit' ? toDec(item.d4Amount) : 0),
                d4Cr: acc.d4Cr.plus(item.d4Type === 'Credit' ? toDec(item.d4Amount) : 0),
                d5Dr: acc.d5Dr.plus(item.d5Type === 'Debit' ? toDec(item.d5Amount) : 0),
                d5Cr: acc.d5Cr.plus(item.d5Type === 'Credit' ? toDec(item.d5Amount) : 0),
                totalDr: acc.totalDr.plus(toDec(item.totalDr)),
                totalCr: acc.totalCr.plus(toDec(item.totalCr)),
                netDr: acc.netDr.plus(item.netAmt > 0 ? toDec(item.netAmt) : 0),
                netCr: acc.netCr.plus(item.netAmt < 0 ? toDec(item.netAmt).abs() : 0),
            };
        }, {
            d1Dr: new Decimal(0), d1Cr: new Decimal(0),
            d2Dr: new Decimal(0), d2Cr: new Decimal(0),
            d3Dr: new Decimal(0), d3Cr: new Decimal(0),
            d4Dr: new Decimal(0), d4Cr: new Decimal(0),
            d5Dr: new Decimal(0), d5Cr: new Decimal(0),
            totalDr: new Decimal(0), totalCr: new Decimal(0),
            netDr: new Decimal(0), netCr: new Decimal(0)
        });
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

                    <div className='w-[35%] text-center border-r-[0.5px] border-gray-400 truncate text-left pl-0.5'>
                        {item.ledger_name || ''}
                    </div>

                    <div className='w-[16%] border-r-[0.5px] border-gray-400 text-right pr-0.5'>
                        {item.d1Type === 'Debit' ? formatToNaira(item.d1Amount) : ''}
                    </div>
                    <div className='w-[16%] border-r-[0.5px] border-gray-400 text-right pr-0.5 text-red-500'>
                        {item.d1Type === 'Credit' ? formatToNaira(item.d1Amount) : ''}
                    </div>
                    <div className='w-[16%] border-r-[0.5px] border-gray-400 text-right pr-0.5'>
                        {item.d2Type === 'Debit' ? formatToNaira(item.d2Amount) : ''}
                    </div>
                    <div className='w-[16%] border-r-[0.5px] border-gray-400 text-right pr-0.5 text-red-500'>
                        {item.d2Type === 'Credit' ? formatToNaira(item.d2Amount) : ''}
                    </div>
                    <div className='w-[16%] border-r-[0.5px] border-gray-400 text-right pr-0.5'>
                        {item.d3Type === 'Debit' ? formatToNaira(item.d3Amount) : ''}
                    </div>
                    <div className='w-[16%] border-r-[0.5px] border-gray-400 text-right pr-0.5 text-red-500'>
                        {item.d3Type === 'Credit' ? formatToNaira(item.d3Amount) : ''}
                    </div>
                    <div className='w-[16%] border-r-[0.5px] border-gray-400 text-right pr-0.5'>
                        {item.d4Type === 'Debit' ? formatToNaira(item.d4Amount) : ''}
                    </div>
                    <div className='w-[16%] border-r-[0.5px] border-gray-400 text-right pr-0.5 text-red-500'>
                        {item.d4Type === 'Credit' ? formatToNaira(item.d4Amount) : ''}
                    </div>
                    <div className='w-[16%] border-r-[0.5px] border-gray-400 text-right pr-0.5'>
                        {item.d5Type === 'Debit' ? formatToNaira(item.d5Amount) : ''}
                    </div>
                    <div className='w-[16%] border-r-[0.5px] border-gray-400 text-right pr-0.5 text-red-500'>
                        {item.d5Type === 'Credit' ? formatToNaira(item.d5Amount) : ''}
                    </div>
                    <div className='w-[18%] border-r-[0.5px] border-gray-400 text-right pr-0.5'>
                        {formatToNaira(item.totalDr)}
                    </div>
                    <div className='w-[18%] border-r-[0.5px] border-gray-400 text-right pr-0.5 text-red-500'>
                        {formatToNaira(item.totalCr)}
                    </div>
                    <div className='w-[18%] border-r-[0.5px] border-gray-400 text-right pr-0.5'>
                        {item.netAmt > 0 ? formatToNaira(item.netAmt) : ''}
                    </div>
                    <div className='w-[18%] border-r-[0.5px] border-gray-400 text-right pr-0.5 text-red-500'>
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

                    <div className="w-[1365px] border border-black bg-yellow-50 border-b-0 grid grid-cols-3 flex items-center py-1.5 px-2">
                        <div className='flex justify-start'>
                            <button
                                onClick={() => navigate(-1)}
                                className=" flex items-center gap-1 px-2 py-0.5 bg-green-800 text-white rounded hover:bg-green-700 text-xs"
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
                                Trial Balance Reports - Multiple
                            </p>
                        </div>
                    </div>

                    <div className="w-[1365px] border-[0.5px] border-gray-400 bg-amber-50 overflow-x-auto">
                        <div className='min-w-[2750px]'>
                            <h2 className="bg-green-800 text-white text-center text-[13px]">
                                List of Trial Balance Reports - Multiple
                            </h2>

                            <div className="flex text-[12px] font-semibold border-b-[0.5px] border-gray-400">

                                <div className='w-[35%] text-center border-r-[0.5px] border-gray-400'>Ledger</div>

                                <div className='w-[16%] text-center border-r-[0.5px] border-gray-400'>
                                    D1 (Dr)
                                </div>
                                <div className='w-[16%] text-center  border-r-[0.5px] border-gray-400'>
                                    D1 (Cr)
                                </div>
                                <div className='w-[16%] text-center  border-r-[0.5px] border-gray-400'>
                                    D2 (Dr)
                                </div>
                                <div className='w-[16%] text-center  border-r-[0.5px] border-gray-400'>
                                    D2 (Cr)
                                </div>
                                <div className='w-[16%] text-center  border-r-[0.5px] border-gray-400'>
                                    D3 (Dr)
                                </div>
                                <div className='w-[16%] text-center  border-r-[0.5px] border-gray-400'>
                                    D3 (Cr)
                                </div>
                                <div className='w-[16%] text-center  border-r-[0.5px] border-gray-400'>
                                    D4 (Dr)
                                </div>
                                <div className='w-[16%] text-center  border-r-[0.5px] border-gray-400'>
                                    D4 (Cr)
                                </div>
                                <div className='w-[16%] text-center  border-r-[0.5px] border-gray-400'>
                                    D5 (Dr)
                                </div>
                                <div className='w-[16%] text-center  border-r-[0.5px] border-gray-400'>
                                    D5 (Cr)
                                </div>
                                <div className='w-[18%] text-center  border-r-[0.5px] border-gray-400'>
                                    Total (Dr)
                                </div>
                                <div className='w-[18%] text-center  border-r-[0.5px] border-gray-400'>
                                    Total (Cr)
                                </div>
                                <div className='w-[18%] text-center border-r-[0.5px] border-gray-400'>
                                    Net (Dr)
                                </div>
                                <div className='w-[18%] text-center  border-r-[0.5px] border-gray-400'>
                                    Net (Cr)
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

                    <div className="flex text-[10px] font-bold bg-yellow-100 w-full">
                        <div className='w-[28%] text-right pr-0.5 border border-gray-500'>{formatToNaira(totals.d1Dr.toNumber())}</div>
                        <div className='w-[28%] text-right pr-0.5 border border-gray-500 text-red-500'>{formatToNaira(totals.d1Cr.toNumber())}</div>
                        <div className='w-[28%] text-right pr-0.5 border border-gray-500'>{formatToNaira(totals.d2Dr.toNumber())}</div>
                        <div className='w-[28%] text-right pr-0.5 border border-gray-500 text-red-500'>{formatToNaira(totals.d2Cr.toNumber())}</div>
                        <div className='w-[28%] text-right pr-0.5 border border-gray-500'>{formatToNaira(totals.d3Dr.toNumber())}</div>
                        <div className='w-[28%] text-right pr-0.5 border border-gray-500 text-red-500'>{formatToNaira(totals.d3Cr.toNumber())}</div>
                        <div className='w-[28%] text-right pr-0.5 border border-gray-500'>{formatToNaira(totals.d4Dr.toNumber())}</div>
                        <div className='w-[28%] text-right pr-0.5 border border-gray-500 text-red-500'>{formatToNaira(totals.d4Cr.toNumber())}</div>
                        <div className='w-[28%] text-right pr-0.5 border border-gray-500'>{formatToNaira(totals.d5Dr.toNumber())}</div>
                        <div className='w-[28%] text-right pr-0.5 border border-gray-500 text-red-500'>{formatToNaira(totals.d5Cr.toNumber())}</div>
                        <div className='w-[28%] text-right pr-0.5 border border-gray-500'>{formatToNaira(totals.totalDr.toNumber())}</div>
                        <div className='w-[28%] text-right pr-0.5 border border-gray-500 text-red-500'>{formatToNaira(totals.totalCr.toNumber())}</div>
                        <div className='w-[35%] text-right pr-0.5 border border-gray-500'>{formatToNaira(totals.netDr.toNumber())}</div>
                        <div className='w-[35%] text-right pr-0.5 border border-gray-500 text-red-500'>{formatToNaira(totals.netCr.toNumber())}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FetchMultipleTrialBalance;