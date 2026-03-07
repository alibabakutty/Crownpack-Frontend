import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import { formatToNaira } from './voucher/utils/voucherUtils';

const moduleConfig = {
    voucher: {
        title: 'Voucher Transaction',
        apiEndpoint: '/vouchers',
        searchPlaceholder: 'Search by Voucher Number...',
        itemName: 'Vouchers',
        fields: { number: 'voucher_number', date: 'voucher_data' },
    }
};

const FetchVoucherTransactions = () => {
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
            if (!grouped[row.voucher_number]) {
                grouped[row.voucher_number] = {
                    voucher_number: row.voucher_number,
                    voucher_date: row.voucher_date,
                    totalDr: 0,
                    totalCr: 0,
                    netAmt: 0,
                };
            }

            grouped[row.voucher_number].totalDr += Number(row.totalDr || 0);
            grouped[row.voucher_number].totalCr += Number(row.totalCr || 0);
            grouped[row.voucher_number].netAmt += Number(row.netAmt || 0);
        });

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
    }, [type, hasFetched]); // Removed currentModule dependency to prevent loop

    // FILTER
    const filterData = useCallback((list, term) => {
        if (!term) return list;

        return list.filter(item =>
            item.voucher_number
                .toLowerCase()
                .includes(term.toLowerCase())
        );
    }, []);

    useEffect(() => {
        const filtered = filterData(data, searchTerm);
        setFilteredData(filtered);
    }, [searchTerm, data, filterData]);

    // KEYBOARD NAVIGATION
    useEffect(() => {
        const handleKeyDown = e => {
            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
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
    }, [filteredData, selectedIndex]);

    const handleItemClick = item => {
        navigate(`/voucher-transaction-report/${item.voucher_number}`);
    };

    const renderListItem = (item, index) => {
        const isSelected = index === selectedIndex;

        return (
            <li
                key={index}
                className={`border-b px-2 py-1 cursor-pointer ${isSelected
                    ? 'bg-yellow-100'
                    : 'hover:bg-blue-50'
                    }`}
                onClick={() => handleItemClick(item)}
            >
                <div className="grid grid-cols-5 text-[12px]">
                    <div className='font-semibold'>{item.voucher_number}</div>

                    <div className='font-semibold pl-4'>
                        {item.voucher_date.split('-').reverse().join('-')}
                    </div>

                    <div className="text-right font-semibold">
                        {formatToNaira(item.totalDr)}
                    </div>

                    <div className="text-right font-semibold">
                        {formatToNaira(item.totalCr)}
                    </div>

                    <div className="text-right font-semibold">
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
        <div className="flex font-amasis">
            <div className="w-full h-screen flex">

                {/* LEFT PANEL */}
                <div className="w-[30%] bg-linear-to-t to-cyan-400 from-[#ccc]">
                    <button
                        onClick={() => navigate(-1)}
                        className="m-3 text-white cursor-pointer"
                    >
                        Back
                    </button>
                </div>

                {/* RIGHT PANEL */}
                <div className="w-[70%] flex flex-col items-center">

                    <div className="w-[955px] border border-black bg-yellow-50 border-b-0 flex flex-col items-center py-2">
                        <p className="text-[13px] underline">
                            Voucher Transaction Reports
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

                    <div className="w-[955px] border border-gray-600 bg-amber-50">

                        <h2 className="bg-green-800 text-white text-center text-[13px]">
                            List of Voucher Transactions
                        </h2>

                        <div className="flex justify-between px-3 text-[12px] font-semibold border-b">
                            <div>VCH-No.</div>
                            <div className='pr-6'>VCH-Date</div>
                            <div className=''>Total Debit</div>
                            <div>Total Credit</div>
                            <div>Net Amount</div>
                        </div>

                        <div
                            className="h-[70vh] overflow-y-auto"
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
    );
};

export default FetchVoucherTransactions;