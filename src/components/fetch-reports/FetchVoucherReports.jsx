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

const FetchVoucherReports = () => {
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

    // GROUP VOUCHERS
    const groupVouchers = (rows) => {
        const grouped = {};

        rows.forEach(row => {
            const voucher = row.voucher_number;

            if (!grouped[voucher]) {
                grouped[voucher] = {
                    voucher_number: voucher,
                    voucher_date: row.voucher_date,
                    division_type: row.division_type,
                    main_group_name: row.main_group_name,

                    d1Dr: 0, d1Cr: 0,
                    d2Dr: 0, d2Cr: 0,
                    d3Dr: 0, d3Cr: 0,
                    d4Dr: 0, d4Cr: 0,
                    d5Dr: 0, d5Cr: 0,

                    totalDr: 0,
                    totalCr: 0,

                    netDr: 0,
                    netCr: 0
                };
            }

            const g = grouped[voucher];

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

        // Calculate net
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

        return Object.values(grouped);
    };

    // FETCH DATA
    useEffect(() => {

        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await api.get(currentModule.apiEndpoint);
                const rows = response?.data?.data || [];

                // Log to debug the structure of your response
                console.log("API RESPONSE:", rows);

                const grouped = groupVouchers(rows);

                setData(grouped);
                setFilteredData(grouped);
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
            item.voucher_date?.includes(lowerTerm) ||
            item.division_type?.toLowerCase().includes(lowerTerm) ||
            item.main_group_name?.toLowerCase().includes(lowerTerm) ||
            String(item.totalDr).includes(lowerTerm) ||
            String(item.totalCr).includes(lowerTerm) ||
            String(item.netDr).includes(lowerTerm) ||
            String(item.netCr).includes(lowerTerm)
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

    const totals = filteredData.reduce((acc, curr) => {
        acc.totalDr += Number(curr.totalDr || 0);
        acc.totalCr += Number(curr.totalCr || 0);
        acc.netDr += Number(curr.netDr || 0);
        acc.netCr += Number(curr.netCr || 0);
        return acc;
    }, { totalDr: 0, totalCr: 0, netDr: 0, netCr: 0 });

    const renderListItem = (item, index) => {
        const isSelected = index === selectedIndex;

        return (
            <li
                key={index}
                className={`border-b border-gray-400 ${isSelected
                    ? 'bg-green-100'
                    : 'hover:bg-blue-50'
                    } cursor-pointer`}
                onClick={() => handleItemClick(item)}
            >
                <div className="flex text-[12px]">
                    <div className='w-[15%] border-l border-r border-gray-400 pl-0.5'>{item.voucher_number}</div>

                    <div className='w-[7%] text-center border-r border-gray-400'>
                        {item.voucher_date ? item.voucher_date.split('-').reverse().join('-') : ''}
                    </div>

                    <div className='w-[7%] border-r border-gray-400 text-center capitalize'>
                        {item.division_type || ''}
                    </div>

                    <div className='w-[16%] border-r border-gray-400 pl-0.5 capitalize'>
                        {item.main_group_name || ''}
                    </div>

                    <div className="text-right w-[15%] border-r border-gray-400 pr-0.5">
                        {formatToNaira(item.totalDr)}
                    </div>

                    <div className="text-right w-[15%] border-r border-gray-400 pr-0.5">
                        {formatToNaira(item.totalCr)}
                    </div>

                    <div className="text-right w-[15%] border-r border-gray-400 pr-0.5">
                        {formatToNaira(item.netDr)}
                    </div>

                    <div className="text-right w-[15%] border-r border-gray-400 pr-0.5">
                        {formatToNaira(item.netCr)}
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
                        {/* Column 1: Left */}
                        <div className="flex justify-start">
                            <button
                                onClick={() => navigate(-1)}
                                className="flex items-center gap-1 px-3 py-1 bg-green-800 text-white rounded hover:bg-green-700 text-xs"
                            >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Back
                            </button>
                        </div>

                        {/* Column 2: Center */}
                        <div className="flex justify-center">
                            <input
                                ref={searchInputRef}
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                placeholder="Search..."
                                className="w-full max-w-[550px] h-6 text-sm border border-gray-400 pl-2 rounded"
                            />
                        </div>

                        {/* Column 3: Right */}
                        <div className="flex justify-end">
                            <p className="text-[13px] font-bold underline">
                                Voucher Transaction Reports - Display
                            </p>
                        </div>
                    </div>

                    <div className="w-[1360px] border border-gray-600 bg-amber-50">

                        <h2 className="bg-green-800 text-white text-center text-[13px]">
                            List of Voucher Transactions - Display
                        </h2>

                        <div className="flex text-[12px] font-semibold border-b border-gray-400">
                            <div className='w-[15%] text-center border-r border-gray-400'>VCH-No.</div>
                            <div className='w-[7%] text-center border-r border-gray-400'>VCH-Date</div>
                            <div className='w-[7%] text-center border-r border-gray-400'>Type</div>
                            <div className='w-[16%] text-center border-r border-gray-400'>Main Group Name</div>
                            <div className='w-[15%] text-center border-r border-gray-400'>Total Dr</div>
                            <div className='w-[15%] text-center border-r border-gray-400'>Total Cr</div>
                            <div className='w-[15%] text-center border-r border-gray-400'>Net Dr</div>
                            <div className='w-[15%] text-center'>Net Cr</div>
                        </div>

                        <div
                            className="h-[83.5vh] overflow-y-auto"
                            ref={listRef}
                        >
                            <ul>
                                {filteredData.map(
                                    renderListItem
                                )}
                            </ul>
                        </div>

                        {/* Grand Total Footer */}
                        <div className='flex text-[12px] font-bold bg-gray-300 border-t border-gray-600'>
                            <div className='w-[45%] border-r border-gray-500 pl-2'>GRAND TOTAL</div>
                            <div className='text-right w-[15%] border-r border-gray-500 pr-0.5'>
                                {formatToNaira(totals.totalDr)}
                            </div>
                            <div className='text-right w-[15%] border-r border-gray-500 pr-0.5'>
                                {formatToNaira(totals.totalCr)}
                            </div>
                            <div className='text-right w-[15%] border-r border-gray-500 pr-0.5'>
                                {formatToNaira(totals.netDr)}
                            </div>
                            <div className='text-right w-[15%] pr-0.5'>
                                {formatToNaira(totals.netCr)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FetchVoucherReports;