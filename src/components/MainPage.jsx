import { Link } from 'react-router-dom';

const MainPage = () => {
  return (
    <div className="min-h-screen bg-linear-to-r from-emerald-50 via-teal-50 to-cyan-400 flex font-amasis">
      <div className="w-[200px] flex flex-col">
        {/* Card 1: Accounting Master */}
        <div className="bg-linear-to-r from-cyan-400 to-white border border-blue-100 rounded-2xl px-3 py-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-36 mt-5 mb-4">
          <h2 className="text-sm font-medium text-gray-800 mb-1">Accounting Master</h2>
          <div className="space-y-1">
            <Link
              to="/fetch-view-master/main-group"
              className="block text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 py-0.5 px-1 rounded-lg transition-all duration-200 text-right"
            >
              Main Group
            </Link>
            <Link
              to="/fetch-view-master/sub-group"
              className="block text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 py-0.5 px-1 rounded-lg transition-all duration-200 text-right"
            >
              Sub Group
            </Link>
            <Link
              to="/fetch-view-master/ledger"
              className="block text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 py-0.5 px-1 rounded-lg transition-all duration-200 text-right"
            >
              Ledger Name
            </Link>
            <Link
              to="/ledger-consolidate"
              className="block text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 py-0.5 px-1 rounded-lg transition-all duration-200 text-right"
            >
              Ledger Consolidate
            </Link>
          </div>
        </div>

        {/* Card 2: Division Master */}
        <div className="bg-linear-to-r from-cyan-400 to-white border border-purple-100 rounded-2xl py-2 px-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-20 mb-4">
          <h2 className="text-sm font-medium text-gray-800 mb-1">Division Master</h2>
          <div className="space-y-1">
            <Link
              to="/division-master"
              className="block text-xs text-purple-600 hover:text-purple-700 hover:bg-purple-50 py-0.5 px-1 rounded-lg transition-all duration-200 text-right"
            >
              Division Name
            </Link>
          </div>
        </div>

        {/* Card 3: Reports */}
        <div className="bg-linear-to-r from-cyan-400 to-white border border-indigo-100 rounded-2xl px-3 py-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-32 mb-4">
          <h2 className="text-sm font-medium text-gray-800 mb-1">Reports</h2>
          <div className="space-y-1">
            <Link
              to="/fetch-voucher-transaction"
              className="block text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 py-0.5 px-1 rounded-lg transition-all duration-200 text-right"
            >
              Voucher Reports
            </Link>
            <Link
              to="/fetch-single-trial-balance"
              className="block text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 py-0.5 px-1 rounded-lg transition-all duration-200 text-right"
            >
              Trial Balance Report - Single
            </Link>
            <Link
              to="/fetch-multiple-trial-balance"
              className="block text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 py-0.5 px-1 rounded-lg transition-all duration-200 text-right"
            >
              Trial Balance Report - Multiple
            </Link>
          </div>
        </div>

        {/* Card 4: Settings */}
        {/* <div className="bg-linear-to-br from-cyan-400 to-white border border-gray-100 rounded-2xl px-3 py-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-32 mb-4">
          <h2 className="text-xl font-medium text-gray-800 mb-1">Settings</h2>
          <div className="space-y-1">
            <Link
              to="/company-settings"
              className="block text-sm text-gray-600 hover:text-gray-700 hover:bg-gray-50 py-0.5 px-1 rounded-lg transition-all duration-200 text-right"
            >
              Company Settings
            </Link>
            <Link
              to="/user-management"
              className="block text-sm text-gray-600 hover:text-gray-700 hover:bg-gray-50 py-0.5 px-1 rounded-lg transition-all duration-200 text-right"
            >
              User Management
            </Link>
          </div>
        </div> */}
      </div>

      {/* Company Heading */}
      <div className="ml-[270px] mt-1">
        <div className="text-center mb-4">
          <h1 className="text-4xl font-medium text-gray-800 mb-1">CROWNPACK NIGERIA LIMITED</h1>
          <p className=" text-gray-600 max-w-2xl mx-auto">
            Complete Solution for Paper Manufacturing & Services
          </p>
        </div>
      </div>

      <div>
        {/* Import Excel Datas */}
      <div className="bg-linear-to-r from-cyan-400 to-white border border-indigo-100 rounded-2xl px-3 py-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-10 w-[200px] mb-4 ml-36 mt-5">
        <h2 className="text-xl font-medium text-gray-800 mb-1">
          <Link to="/import-excel-data" className='block text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 py-0.5 px-1 rounded-lg transition-all duration-200 text-center'>
            Import Excel Data
          </Link>
          </h2>
      </div>

      <div className="bg-linear-to-r from-cyan-400 to-white border border-indigo-100 rounded-2xl px-3 py-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-10 w-[200px] mb-4 ml-36 mt-5">
        <h2 className="text-xl font-medium text-gray-800 mb-1">
          <Link to="/voucher-transaction-single" className='block text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 py-0.5 px-1 rounded-lg transition-all duration-200 text-center'>
            Voucher Transaction - Single
          </Link>
          </h2>
      </div>

      <div className="bg-linear-to-r from-cyan-400 to-white border border-indigo-100 rounded-2xl px-3 py-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-10 w-[200px] mb-4 ml-36 mt-5">
        <h2 className="text-xl font-medium text-gray-800 mb-1">
          <Link to="/voucher-transaction-multiple" className='block text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 py-0.5 px-1 rounded-lg transition-all duration-200 text-center'>
            Voucher Transaction - Multiple
          </Link>
          </h2>
      </div>
      </div>
    </div>
  );
};

export default MainPage;
