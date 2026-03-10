import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import MainPage from './components/MainPage'
import ViewFetchMaster from './components/ViewFetchMaster'
import ImportExcelPage from './components/ImportExcelPage'
import LedgerConsolidatePage from './components/LedgerConsolidatePage'
import LedgerConsolidationReport from './components/LedgerConsolidationReport'
import VoucherTransactionPage from './components/voucher/VoucherTransactionPage'
import DivisionMaster from './components/DivisionMaster'
import FetchVoucherTransactions from './components/fetch-reports/FetchVoucherTransactions'
import FetchSingleTrialBalance from './components/fetch-reports/FetchSingleTrialBalance'
import FetchMultipleTrialBalance from './components/fetch-reports/FetchMultipleTrialBalance'
import FetchTrialBalanceByLedger from './components/fetch-reports/FetchTrialBalanceByLedger'
import SecondaryFetchLedger from './components/fetch-reports/SecondaryFetchLedger'

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
            <Route path='/voucher-transaction-single' element={
              <VoucherTransactionPage />
            } />
            <Route path='/voucher-transaction-multiple' element={
              <VoucherTransactionPage />
            } />
            <Route path='/division-master' element={
              <DivisionMaster />
            }
            />
            <Route path='/fetch-voucher-transaction' element={
              <FetchVoucherTransactions />
            } />
            <Route path='/voucher-transaction-report/:voucherNumberParam' element={
              <VoucherTransactionPage />
            } />
            <Route path='/fetch-single-trial-balance' element={
              <FetchSingleTrialBalance />
            } />
            <Route path='/fetch-multiple-trial-balance' element={
              <FetchMultipleTrialBalance />
            } />
            <Route path='/fetch-trial-balance-by-ledger' element={
              <FetchTrialBalanceByLedger />
            } />
            <Route
              path="/secondary-fetch-ledger/:ledger"
              element={<SecondaryFetchLedger />}
            />
            <Route path='vouchers/ledger/:ledger' element={
              <VoucherTransactionPage />
            } />
          </Routes>
          
        </BrowserRouter>
      </div>
    </>
  )
}

export default App
