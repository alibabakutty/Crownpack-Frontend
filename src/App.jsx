import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import MainPage from './components/MainPage'
import ViewFetchMaster from './components/ViewFetchMaster'
import ImportExcelPage from './components/ImportExcelPage'
import LedgerConsolidatePage from './components/LedgerConsolidatePage'
import LedgerConsolidationReport from './components/LedgerConsolidationReport'
import VoucherTransactionPage from './components/voucher/VoucherTransactionPage'
import DivisionMaster from './components/DivisionMaster'

function App() {
  

  return (
    <>
      <div>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path='/fetch-view-master/:type' element={
              <ViewFetchMaster />
            } />
            <Route path='/import-excel-data' element={
              <ImportExcelPage />
            } />
            <Route path='/ledger-consolidate' element={
              <LedgerConsolidatePage />
            } />
            <Route path='/consolidated/ledger/:ledger_code' element={
              <LedgerConsolidationReport />
            } />
            <Route path='/voucher-transaction' element={
              <VoucherTransactionPage />
            } />
            <Route path='/division-master' element={
              <DivisionMaster />
            }
            />
          </Routes>
        </BrowserRouter>
      </div>
    </>
  )
}

export default App
