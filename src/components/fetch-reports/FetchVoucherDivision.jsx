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

const FetchVoucherDivision = () => {
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

                const transformed = [];

                rows.forEach((v) => {
                    const divisions = [
                        { key: "d1", amount: v.d1Amount, type: v.d1Type },
                        { key: "d2", amount: v.d2Amount, type: v.d2Type },
                        { key: "d3", amount: v.d3Amount, type: v.d3Type },
                        { key: "d4", amount: v.d4Amount, type: v.d4Type },
                        { key: "d5", amount: v.d5Amount, type: v.d5Type }
                    ];

                    divisions.forEach((d, index) => {
                        if (v.division_type === "single" && index !== 0) return;

                        const amt = Number(d.amount || 0);
                        const type = d.type?.toLowerCase();
                        if (amt === 0) return;

                        transformed.push({
                            vch_no: v.voucher_number,
                            vch_date: v.voucher_date,
                            ledger_name: v.ledger_name,
                            division_type: v.division_type,
                            main_group_name: v.main_group_name,
                            division: d.key,
                            Vch_Amt_Dr: type === 'debit' ? amt : 0,
                            Vch_Amt_Cr: type === 'credit' ? amt : 0,
                        })
                    })
                })

                setData(transformed);
                setFilteredData(transformed);
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
            item.vch_no?.toLowerCase().includes(lowerTerm) ||
            item.ledger_name?.toLowerCase().includes(lowerTerm) ||
            item.vch_date?.includes(lowerTerm) ||
            item.division_type?.toLowerCase().includes(lowerTerm) ||
            item.division?.toLowerCase().includes(lowerTerm) ||
            String(item.Vch_Amt_Dr).includes(lowerTerm) ||
            String(item.Vch_Amt_Cr).includes(lowerTerm)

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
                        handleItemClick({});
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

    // const handleItemClick = item => {
    //     navigate(`/voucher-transaction-report/${item.voucher_number}`);
    // };

    const renderListItem = (item, index) => {
        const isSelected = index === selectedIndex;

        return (
            <li
                key={index}
                className={`py-0.3 cursor-pointer ${isSelected
                    ? 'bg-yellow-100'
                    : 'hover:bg-blue-50'
                    }`}
                onClick={() => { }}
            >
                <div className="flex text-[12px]">
                    <div className='w-[13%] border border-right border-gray-500 pl-0.5 truncate'>{item.vch_no}</div>

                    <div className='w-[8%] text-center border border-right border-gray-500 truncate text-center pl-0.5'>
                        {item.vch_date?.split("-").reverse().join("-")}
                    </div>

                    <div className='w-[25%] border border-right border-gray-500 capitalize pl-0.5 truncate'>
                        {item.ledger_name || ''}
                    </div>

                    <div className='w-[25%] border border-right border-gray-500 capitalize pl-0.5 truncate text-center'>
                        {item.main_group_name || ''}
                    </div>

                    <div className='w-[10%] border border-right border-gray-500 text-center pr-0.5 capitalize'>
                        {item.division_type}
                    </div>
                    <div className='w-[7%] border border-right border-gray-500 text-center pr-0.5 uppercase'>
                        {item.division}
                    </div>
                    <div className='w-[12%] border border-right border-gray-500 text-right pr-0.5'>
                        {item.Vch_Amt_Dr ? formatToNaira(item.Vch_Amt_Dr) : ""}
                    </div>
                    <div className='w-[12%] border border-right border-gray-500 text-right pr-0.5'>
                        {item.Vch_Amt_Cr ? formatToNaira(item.Vch_Amt_Cr) : ""}
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
                            Trial Balance Reports - Division
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

                        <div className='min-w-[1300px]'>
                            <h2 className="bg-green-800 text-white text-center text-[13px]">
                                List of Trial Balance Reports - Division
                            </h2>

                            <div className="flex text-[12px] font-semibold border-b">
                                <div className='w-[20%] text-center border border-gray-500'>VCH-No.</div>
                                <div className='w-[9%] text-center border border-gray-500'>VCH-Date</div>
                                <div className='w-[30%] text-center border border-gray-500'>Ledger</div>
                                <div className='w-[10%] text-center border border-gray-500'>Entry-Type</div>
                                <div className='w-[7%] text-center border border-gray-500'>Division</div>

                                <div className='w-[12%] text-center border border-gray-500'>Dr</div>
                                <div className='w-[12%] text-center border border-gray-500'>Cr</div>
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

export default FetchVoucherDivision;