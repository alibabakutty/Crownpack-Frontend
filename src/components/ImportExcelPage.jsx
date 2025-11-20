import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ImportExcelPage = () => {
  const navigate = useNavigate();
  const [selectedTable, setSelectedTable] = useState('');
  const [file, setFile] = useState(null);
  const [importStatus, setImportStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const tables = [
    { value: 'main-groups', label: 'Main Groups', color: 'blue' },
    { value: 'sub-groups', label: 'Sub Groups', color: 'purple' },
    { value: 'ledgers', label: 'Ledgers', color: 'green' },
    { value: 'divisions', label: 'Divisions', color: 'indigo' },
  ];

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

  const handleFileSelect = e => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (
        selectedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        selectedFile.type === 'application/vnd.ms-excel'
      ) {
        setFile(selectedFile);
        setImportStatus('');
      } else {
        setImportStatus('❌ Please select a valid Excel file (.xlsx, .xls)');
      }
    }
  };

  const handleImport = async () => {
    if (!selectedTable) {
      setImportStatus('❌ Please select a table to import');
      return;
    }

    if (!file) {
      setImportStatus('❌ Please select a file to import');
      return;
    }

    setIsLoading(true);
    setImportStatus('🔄 Importing... Please wait...');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`http://localhost:5000/import/${selectedTable}`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setImportStatus(
          `✅ ${result.message} - Success: ${result.successCount}, Errors: ${result.errorCount}`,
        );
        if (result.errors && result.errors.length > 0) {
          setImportStatus(prev => prev + ` - First error: ${result.errors[0]}`);
        }
        setFile(null);
        document.getElementById('file-input').value = '';
      } else {
        setImportStatus(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      setImportStatus('❌ Network error: Could not connect to server');
    } finally {
      setIsLoading(false);
    }
  };

  const getTableColor = tableValue => {
    const table = tables.find(t => t.value === tableValue);
    return table ? table.color : 'gray';
  };

  return (
    <div className="flex font-amasis">
      <div className="w-full h-screen flex">
        {/* Left Panel - Controls */}
        <div className="w-1/2 bg-linear-to-t to-cyan-400 from-[#ccc] p-6">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
            <div className="flex">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-blue-700 hover:text-white transition-colors bg-blue-100 hover:bg-blue-600 px-3 py-2 rounded-lg backdrop-blur-sm mb-6 border border-blue-300 hover:border-blue-600"
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
              <h2 className="text-2xl font-bold text-gray-800 mb-6 ml-16">Import Excel Data</h2>
            </div>

            {/* Table Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Table to Import
              </label>
              <div className="grid grid-cols-2 gap-3">
                {tables.map(table => (
                  <button
                    key={table.value}
                    onClick={() => {
                      setSelectedTable(table.value);
                      setImportStatus('');
                      setFile(null);
                      document.getElementById('file-input').value = '';
                    }}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                      selectedTable === table.value
                        ? `border-${table.color}-500 bg-${table.color}-50 text-${table.color}-700`
                        : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    {table.label}
                  </button>
                ))}
              </div>
            </div>

            {/* File Upload */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Excel File
              </label>
              <input
                id="file-input"
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileSelect}
                className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
              />
              {file && <p className="mt-2 text-sm text-green-600">✅ Selected: {file.name}</p>}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mb-6">
              <button
                onClick={handleImport}
                disabled={isLoading || !selectedTable || !file}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg transition-colors font-medium"
              >
                {isLoading ? '🔄 Importing...' : '📤 Import Data'}
              </button>

            </div>

            {/* Status Message */}
            {importStatus && (
              <div
                className={`p-3 rounded-lg ${
                  importStatus.includes('✅')
                    ? 'bg-green-100 text-green-800'
                    : importStatus.includes('❌')
                    ? 'bg-red-100 text-red-800'
                    : 'bg-blue-100 text-blue-800'
                }`}
              >
                {importStatus}
              </div>
            )}

          </div>
        </div>

        {/* Right Panel - Preview/Info */}
        <div className="w-1/2 bg-linear-to-t to-cyan-400 from-[#ccc] flex justify-center flex-col items-center p-6">
          <div className="w-full max-w-2xl h-full border border-gray-300 bg-white rounded-2xl shadow-lg">
            <h2 className="px-4 py-3 bg-green-800 text-white text-lg font-medium rounded-t-2xl">
              Import Excel Data
            </h2>

            <div className="p-6 h-[calc(100%-80px)] overflow-y-auto">
              {selectedTable ? (
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">
                    Importing to:{' '}
                    <span className={`text-${getTableColor(selectedTable)}-600`}>
                      {tables.find(t => t.value === selectedTable)?.label}
                    </span>
                  </h3>

                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <h4 className="font-medium text-gray-700 mb-2">Expected Columns (in order):</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      {selectedTable === 'main-groups' && (
                        <>
                          <div>
                            • <strong>Column A:</strong> main_group_code (required, unique)
                          </div>
                          <div>
                            • <strong>Column B:</strong> main_group_name (required, unique)
                          </div>
                          <div>
                            • <strong>Column C:</strong> tally_report (optional)
                          </div>
                          <div>
                            • <strong>Column D:</strong> sub_report (optional)
                          </div>
                          <div>
                            • <strong>Column E:</strong> debit_credit (optional)
                          </div>
                          <div>
                            • <strong>Column F:</strong> trial_balance (optional)
                          </div>
                          <div>
                            • <strong>Column G:</strong> status (optional, default: Active)
                          </div>
                        </>
                      )}
                      {selectedTable === 'sub-groups' && (
                        <>
                          <div>
                            • <strong>Column A:</strong> sub_group_code (optional)
                          </div>
                          <div>
                            • <strong>Column B:</strong> sub_group_name (required, unique)
                          </div>
                          <div>
                            • <strong>Column C:</strong> tally_report (optional)
                          </div>
                          <div>
                            • <strong>Column D:</strong> sub_report (optional)
                          </div>
                          <div>
                            • <strong>Column E:</strong> debit_credit (optional)
                          </div>
                          <div>
                            • <strong>Column F:</strong> trial_balance (optional)
                          </div>
                          <div>
                            • <strong>Column G:</strong> status (optional, default: Active)
                          </div>
                        </>
                      )}
                      {selectedTable === 'ledgers' && (
                        <>
                          <div>
                            • <strong>Column A:</strong> ledger_code (optional)
                          </div>
                          <div>
                            • <strong>Column B:</strong> ledger_name (required, unique)
                          </div>
                           <div>
                            • <strong>Column C:</strong> tally_report (optional)
                          </div>
                           <div>
                            • <strong>Column D:</strong> debit_credit (optional)
                          </div>
                           <div>
                            • <strong>Column E:</strong> trial_balance (optional)
                          </div>
                          <div>
                            • <strong>Column F:</strong> status (optional, default: Active)
                          </div>
                          <div>
                            • <strong>Column G:</strong> link_status (optional)
                          </div>
                        </>
                      )}
                      {selectedTable === 'divisions' && (
                        <>
                          <div>
                            • <strong>Column A:</strong> division_code (optional)
                          </div>
                          <div>
                            • <strong>Column B:</strong> division_name (required, unique)
                          </div>
                          <div>
                            • <strong>Column C:</strong> report (optional)
                          </div>
                          <div>
                            • <strong>Column D:</strong> status (optional, default: Active)
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-700 mb-2">💡 Tips:</h4>
                    <ul className="text-sm text-blue-600 list-disc list-inside space-y-1">
                      <li>Keep column order exactly as shown above</li>
                      <li>First row should be headers (will be skipped)</li>
                      <li>Unique fields must not have duplicates</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500 text-lg">Select a table to see import details</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportExcelPage;
