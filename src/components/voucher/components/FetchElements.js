import { useEffect, useState } from 'react';
import api from '../../../services/api';

const FetchElements = () => {   
    const [ledgerOptions, setLedgerOptions] = useState([]);
    const [subGroupOptions, setSubGroupOptions] = useState([]);
    const [mainGroupOptions, setMainGroupOptions] = useState([]);
    const [divisionOptions, setDivisionOptions] = useState([]);
    const [loading, setLoading] = useState({
        ledgers: false,
        subgroups: false,
        maingroups: false,
        divisions: false
    });

    // Fetch divisions
    useEffect(() => {
        const fetchDivisions = async () => {
            setLoading(prev => ({ ...prev, divisions: true }));
            try {
                const response = await api.get('/divisions');
                const divisions = response?.data?.data || [];

                if (Array.isArray(divisions)) {
                    const formattedDivisions = divisions.map(division => ({
                        value: division.id,
                        label: division.division_name,
                        ...division
                    }));
                    setDivisionOptions(formattedDivisions);
                    console.log('Fetched Divisions:', response.data);
                }
            } catch (error) {
                console.error('Error fetching divisions:', error);
            } finally {
                setLoading(prev => ({ ...prev, divisions: false }));
            }
        };
        fetchDivisions();
    }, []);

    // Fetch ledgers
    useEffect(() => {
        const fetchLedgers = async () => {
            setLoading(prev => ({ ...prev, ledgers: true }));
            try {
                const response = await api.get('/ledgers');
                const ledgers = response?.data?.data || [];

                if (Array.isArray(ledgers)) {
                    const formattedLedgers = ledgers.map(ledger => ({
                        value: ledger.ledger_code,
                        // label: `${ledger.ledger_code} - ${ledger.ledger_name}`,
                        label: ledger.ledger_name,
                        ledger_code: ledger.ledger_code,
                        ledger_name: ledger.ledger_name,
                        ...ledger
                    }));
                    setLedgerOptions(formattedLedgers);
                    console.log('Fetching Ledgers:', response.data);
                }
            } catch (error) {
                console.error('Error fetching ledgers:', error);
            } finally {
                setLoading(prev => ({ ...prev, ledgers: false }));
            }
        };
        fetchLedgers();
    }, []);

    // Fetch sub groups
    useEffect(() => {
        const fetchSubGroups = async () => {
            setLoading(prev => ({ ...prev, subgroups: true }));
            try {
                const response = await api.get('/sub_groups');
                const subgroups = response?.data?.data || [];
                if (Array.isArray(subgroups)) {
                    const formattedSubGroups = subgroups.map(subgroup => ({
                        value: subgroup.sub_group_code,
                        label: `${subgroup.sub_group_code} - ${subgroup.sub_group_name}`,
                        sub_group_code: subgroup.sub_group_code,
                        sub_group_name: subgroup.sub_group_name,
                        ...subgroup,
                    }));
                    setSubGroupOptions(formattedSubGroups);
                    console.log('Fetched Sub Groups:', response.data);
                }
            } catch (error) {
                console.error('Error fetching sub groups:', error);
            } finally {
                setLoading(prev => ({ ...prev, subgroups: false }));
            }
        };
        fetchSubGroups();
    }, []);

    // Fetch main groups
    useEffect(() => {
        const fetchMainGroups = async () => {
            setLoading(prev => ({ ...prev, maingroups: true }));
            try {
                const response = await api.get('/main_groups');
                const maingroups = response?.data?.data || [];
                if (Array.isArray(maingroups)) {
                    const formattedMainGroups = maingroups.map(maingroup => ({
                        value: maingroup.main_group_code,
                        label: `${maingroup.main_group_code} - ${maingroup.main_group_name}`,
                        main_group_code: maingroup.main_group_code,
                        main_group_name: maingroup.main_group_name,
                        ...maingroup,
                    }));
                    setMainGroupOptions(formattedMainGroups);
                    console.log('Fetched main groups:', response.data);
                }
            } catch (error) {
                console.error('Error fetching main groups:', error);
            } finally {
                setLoading(prev => ({ ...prev, maingroups: false }));
            }
        };
        fetchMainGroups();
    }, []);

    return { 
        ledgerOptions, 
        subGroupOptions, 
        mainGroupOptions, 
        divisionOptions,
        loading 
    };
};

export default FetchElements;