import { useEffect, useState } from "react";
import Select from "react-select";
import api from "../services/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

const LedgerConsolidatePage = () => {

  const [ledgerOptions, setLedgerOptions] = useState([]);
  const [subGroupOptions, setSubGroupOptions] = useState([]);
  const [mainGroupOptions, setMainGroupOptions] = useState([]);
  const [consolidatedData, setConsolidatedData] = useState([]);

  const [rows, setRows] = useState([
    {
      id: 1,
      selectedLedger: null,
      selectedSubGroup: null,
      selectedMainGroup: null,
      selectedStatus: { value: "inactive", label: "Inactive" }
    }
  ]);

  const [nextRowId, setNextRowId] = useState(2);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" }
  ];



  // FETCH CONSOLIDATIONS
  useEffect(() => {

    const fetchConsolidations = async () => {

      try {

        const res = await api.get("/consolidated");

        const data = res.data?.data || res.data || [];

        setConsolidatedData(Array.isArray(data) ? data : []);

      } catch (err) {
        console.error(err);
        setConsolidatedData([]);
      }

    };

    fetchConsolidations();

  }, []);



  // FETCH LEDGERS
  useEffect(() => {

    const fetchLedgers = async () => {

      try {

        const res = await api.get("/ledgers");
        const ledgers = res.data.data || res.data;

        const activeCodes = consolidatedData
          .filter(i => i.status === "active")
          .map(i => i.ledger_code);

        const available = ledgers.filter(
          l => !activeCodes.includes(l.ledger_code)
        );

        setLedgerOptions(
          available.map(l => ({
            value: l.ledger_code,
            label: `${l.ledger_code} - ${l.ledger_name}`,
            ledger_code: l.ledger_code,
            ledger_name: l.ledger_name
          }))
        );

      } catch (err) {
        console.error(err);
      }

    };

    fetchLedgers();

  }, [consolidatedData]);



  // FETCH SUBGROUPS
  useEffect(() => {

    const fetchSubGroups = async () => {

      try {

        const res = await api.get("/sub_groups");
        const groups = res.data.data || res.data;

        setSubGroupOptions(
          groups.map(g => ({
            value: g.sub_group_code,
            label: `${g.sub_group_code} - ${g.sub_group_name}`,
            sub_group_code: g.sub_group_code,
            sub_group_name: g.sub_group_name
          }))
        );

      } catch (err) {
        console.error(err);
      }

    };

    fetchSubGroups();

  }, []);



  // FETCH MAIN GROUPS
  useEffect(() => {

    const fetchMainGroups = async () => {

      try {

        const res = await api.get("/main_groups");
        const groups = res.data.data || res.data;

        setMainGroupOptions(
          groups.map(g => ({
            value: g.main_group_code,
            label: `${g.main_group_code} - ${g.main_group_name}`,
            main_group_code: g.main_group_code,
            main_group_name: g.main_group_name
          }))
        );

      } catch (err) {
        console.error(err);
      }

    };

    fetchMainGroups();

  }, []);



  // ROW UPDATE HELPER
  const updateRow = (id, field, value) => {

    setRows(prev =>
      prev.map(r =>
        r.id === id ? { ...r, [field]: value } : r
      )
    );

  };



  // ROW HANDLERS
  const handleLedgerChange = (option, id) => {
    updateRow(id, "selectedLedger", option);
  };

  const handleSubGroupChange = (option, id) => {
    updateRow(id, "selectedSubGroup", option);
  };

  const handleMainGroupChange = (option, id) => {
    updateRow(id, "selectedMainGroup", option);
  };

  const handleStatusChange = (option, id) => {

    updateRow(id, "selectedStatus", option);

    if (option.value === "active") {
      addNewRow();
    }

  };



  // ADD ROW
  const addNewRow = () => {

    setRows(prev => [
      ...prev,
      {
        id: nextRowId,
        selectedLedger: null,
        selectedSubGroup: null,
        selectedMainGroup: null,
        selectedStatus: { value: "inactive", label: "Inactive" }
      }
    ]);

    setNextRowId(prev => prev + 1);

  };



  // API CALLS
  const mergeLedgerWithGroups = async (ledger, sub, main) => {

    return await api.post("/consolidated/merge", {
      ledger_code: ledger,
      sub_group_code: sub,
      main_group_code: main
    });

  };

  const demergeLedger = async (ledger) => {

    return await api.put(`/consolidated/demerge/${ledger}`);

  };



  // SUBMIT
  const handleSubmit = async () => {

    const validRows = rows.filter(r => r.selectedLedger);

    if (validRows.length === 0) {
      toast.error("Please select ledger");
      return;
    }

    setIsSubmitting(true);

    try {

      for (let row of validRows) {

        if (!row.selectedSubGroup && !row.selectedMainGroup) {

          toast.error("Select Sub Group or Main Group");
          setIsSubmitting(false);
          return;

        }

        if (row.selectedStatus.value === "active") {

          await mergeLedgerWithGroups(
            row.selectedLedger.ledger_code,
            row.selectedSubGroup?.sub_group_code || null,
            row.selectedMainGroup?.main_group_code || null
          );

        } else {

          await demergeLedger(row.selectedLedger.ledger_code);

        }

      }

      toast.success("Consolidation saved successfully");

      setRows([
        {
          id: 1,
          selectedLedger: null,
          selectedSubGroup: null,
          selectedMainGroup: null,
          selectedStatus: { value: "inactive", label: "Inactive" }
        }
      ]);

      setNextRowId(2);

    } catch (err) {

      console.error(err);
      toast.error("Error saving consolidation");

    } finally {

      setIsSubmitting(false);

    }

  };



  const selectStyles = {
    control: (p) => ({
      ...p,
      border: "none",
      boxShadow: "none",
      background: "transparent",
      minHeight: "24px",
      fontSize: "12px"
    }),
    dropdownIndicator: () => ({ display: "none" }),
    indicatorSeparator: () => ({ display: "none" }),
    menu: (p) => ({ ...p, zIndex: 20, fontSize: "12px" })
  };

const handleBack = () => {
    navigate(-1);
  };

  return (

    <div className="flex font-amasis">

      <ToastContainer />

      <div className="w-full h-screen border border-gray-600 bg-amber-50">

        <div className="absolute flex items-center gap-2">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-white hover:text-gray-200 transition-colors bg-green-800 hover:bg-green-700 rounded-lg backdrop-blur-sm mt-1 ml-1 cursor-pointer p-1"
            title="Go back (Esc)"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </button>
        </div>

        <h2 className="bg-green-800 text-white text-center text-[13px]">
          Ledger Consolidation
        </h2>

        <div className="h-[calc(100vh-120px)] overflow-auto">

          <table className="w-full border border-slate-400">

            <thead>

              <tr className="text-[15px] bg-violet-200">

                <th>S.No</th>
                <th>Ledger Code</th>
                <th></th>
                <th>Sub Group</th>
                <th>Main Group</th>
                <th>Status</th>

              </tr>

            </thead>

            <tbody>

              {rows.map((row, i) => (

                <tr key={row.id}>

                  <td className="text-center">{i + 1}</td>

                  <td className="w-40">

                    <Select
                      options={ledgerOptions}
                      value={row.selectedLedger}
                      onChange={(o) => handleLedgerChange(o, row.id)}
                      styles={selectStyles}
                    />

                  </td>

                  <td>

                    <input
                      value={row.selectedLedger?.ledger_name || ""}
                      readOnly
                      className="w-60 text-[12px] bg-transparent"
                    />

                  </td>

                  <td className="w-40">

                    <Select
                      options={subGroupOptions}
                      value={row.selectedSubGroup}
                      onChange={(o) => handleSubGroupChange(o, row.id)}
                      styles={selectStyles}
                    />

                  </td>

                  <td className="w-40">

                    <Select
                      options={mainGroupOptions}
                      value={row.selectedMainGroup}
                      onChange={(o) => handleMainGroupChange(o, row.id)}
                      styles={selectStyles}
                    />

                  </td>

                  <td className="w-28">

                    <Select
                      options={statusOptions}
                      value={row.selectedStatus}
                      onChange={(o) => handleStatusChange(o, row.id)}
                      styles={selectStyles}
                    />

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

        <div className="absolute bottom-4 right-4">

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-4 py-2 bg-yellow-300 rounded"
          >

            {isSubmitting ? "Submitting..." : "Submit"}

          </button>

        </div>

      </div>

    </div>

  );

};

export default LedgerConsolidatePage;