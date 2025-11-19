import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import MainPage from './components/MainPage'
import ViewFetchMaster from './components/ViewFetchMaster'
import ImportExcelPage from './components/ImportExcelPage'
import LedgerConsolidatePage from './components/LedgerConsolidatePage'

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
          </Routes>
        </BrowserRouter>
      </div>
    </>
  )
}

export default App
