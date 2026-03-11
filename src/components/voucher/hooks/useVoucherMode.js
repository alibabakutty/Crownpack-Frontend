import { useLocation, useParams } from 'react-router-dom';

export const useVoucherMode = () => {
  const location = useLocation();
  const { voucherNumberParam, ledger } = useParams();
  const path = location.pathname;

  const isCreatePage = 
    path.includes('/voucher-transaction-single') || 
    path.includes('/voucher-transaction-multiple');

  const isUpdatePage = path.includes('/fetch-voucher-update');

  const isLedgerPage = 
    path.includes('/vouchers/ledger') || 
    path.includes('/secondary-fetch-ledger');

  const mode = isCreatePage ? "create" : isUpdatePage ? "update" : isLedgerPage ? "ledger" : "view";

  return {
    mode,
    isCreatePage,
    isUpdatePage,
    isLedgerPage,
    voucherNumberParam,
    ledger: ledger ? decodeURIComponent(ledger) : null,
    path
  };
};