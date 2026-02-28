import { useEffect, useState } from 'react'
import api from '../../services/api'

const FetchElements = () => {   
    const [ledgerOptions, setLedgerOptions] = useState([]);
    const [subGroupOptions, setSubGroupOptions] = useState([]);
    const [mainGroupOptions, setMainGroupOptions] = useState([]);

    // fetch ledgers
    useEffect(() => {
        const fetchLedgers = async () => {
            try {
                const response = await api.get('/ledgers');
                if (Array.isArray(response.data)) {
                    const formattedLedgers = response.data.map(ledger => ({
                        value: ledger.ledger_code,
                        label: `${ledger.ledger_code} - ${ledger.ledger_name}`,
                        ledger_code: ledger.ledger_code,
                        ledger_name: ledger.ledger_name,
                        ...ledger
                    }));
                    setLedgerOptions(formattedLedgers);
                    console.log('Fetching Ledgers:', response.data);
                }
            } catch (error) {
                console.error('Error fetching ledgers:', error);
                
            }
        }
        fetchLedgers();
    }, []);

    useEffect(() => {
        const fetchSubGroups = async () => {
            try {
                const response = await api.get('/sub_groups');

                if (Array.isArray(response.data)) {
                    const formattedSubGroups = response.data.map(subgroup => ({
                        value: subgroup.sub_group_code,
                        label: `${subgroup.sub_group_code} - ${subgroup.sub_group_name}`,
                        sub_group_code: subgroup.sub_group_code,
                        sub_group_name: subgroup.sub_group_name,
                        ...subgroup,
                    }))
                    setSubGroupOptions(formattedSubGroups);
                    console.log('Fetched Sub Groups:', response.data);
                }
            } catch (error) {
                console.error('Error fetching sub groups:', error);
            }
        }
        fetchSubGroups();
    }, []);

    useEffect(() => {
        const fetchMainGroups = async () => {
            try {
                const response = await api.get('/main_groups');

                if (Array.isArray(response.data)) {
                    const formattedMainGroups = response.data.map(maingroup => ({
                        value: maingroup.main_group_code,
                        label: `${maingroup.main_group_code} - ${maingroup.main_group_name}`,
                        main_group_code: maingroup.main_group_code,
                        main_group_name: maingroup.main_group_name,
                        ...maingroup,
                    }))
                    setMainGroupOptions(formattedMainGroups);
                    console.log('Fetched main groups:', response.data);
                }
            } catch (error) {
                console.error('Fetched main groups:', error);
            }
        }
        fetchMainGroups();
    }, [])

    return { ledgerOptions, subGroupOptions, mainGroupOptions };
}

export default FetchElements