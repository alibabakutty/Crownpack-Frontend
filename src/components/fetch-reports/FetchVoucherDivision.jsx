import React, { useEffect, useState, useCallback } from "react";
import api from "../../services/api"; // your axios instance

const VoucherList = () => {

  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(null);

  const formatAmount = (value) => {
    if (!value) return "";
    return Number(value).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {

    try {

      const response = await api.get("/vouchers");

      const rows = response?.data?.data || [];

      const transformed = [];

      rows.forEach((v) => {

        const divisions = [
          { key: "d1", amount: v.d1Amount, type: v.d1Type },
          { key: "d2", amount: v.d2Amount, type: v.d2Type },
          { key: "d3", amount: v.d3Amount, type: v.d3Type },
          { key: "d4", amount: v.d4Amount, type: v.d4Type },
          { key: "d5", amount: v.d5Amount, type: v.d5Type },
        ];

        divisions.forEach((d) => {

          if (!d.amount) return;

          transformed.push({
            vch_no: v.voucher_number,
            vch_date: v.voucher_date,
            ledger_name: v.ledger_name,
            division: `${d.key}${d.type === "Debit" ? "dr" : "cr"}`,
            amount: Number(d.amount),
          });

        });

      });

      setData(transformed);
      setFilteredData(transformed);

    } catch (error) {
      console.error("Fetch error:", error);
    }

  };

  const filterData = useCallback((list, term) => {

    if (!term) return list;

    const lower = term.toLowerCase();

    return list.filter((item) =>
      item.vch_no?.toLowerCase().includes(lower) ||
      item.ledger_name?.toLowerCase().includes(lower) ||
      item.division?.toLowerCase().includes(lower) ||
      item.vch_date?.includes(lower) ||
      String(item.amount).includes(lower)
    );

  }, []);

  useEffect(() => {

    const result = filterData(data, searchTerm);
    setFilteredData(result);

  }, [searchTerm, data, filterData]);

  const handleItemClick = (item, index) => {
    setSelectedIndex(index);
  };

  return (
    <div className="p-3">

      <input
        type="text"
        placeholder="Search..."
        className="border p-1 mb-2 w-full"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <ul>

        {filteredData.map((item, index) => {

          const isSelected = index === selectedIndex;

          return (

            <li
              key={index}
              className={`cursor-pointer ${
                isSelected ? "bg-yellow-100" : "hover:bg-blue-50"
              }`}
              onClick={() => handleItemClick(item, index)}
            >

              <div className="flex text-[12px]">

                <div className="w-[25%] border border-gray-500 pl-1">
                  {item.vch_no}
                </div>

                <div className="w-[15%] border border-gray-500 pl-1">
                  {item.vch_date?.split("-").reverse().join("-")}
                </div>

                <div className="w-[35%] border border-gray-500 pl-1">
                  {item.ledger_name}
                </div>

                <div className="w-[10%] border border-gray-500 text-center">
                  {item.division}
                </div>

                <div className="w-[15%] border border-gray-500 text-right pr-1">
                  {formatAmount(item.amount)}
                </div>

              </div>

            </li>

          );

        })}

      </ul>

    </div>
  );
};

export default VoucherList;