import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const DivisionMaster = () => {
    const navigate = useNavigate();

    const [divisions, setDivisions] = useState([
        { id: null, division_name: "" },
        { id: null, division_name: "" },
        { id: null, division_name: "" },
        { id: null, division_name: "" },
        { id: null, division_name: "" },
    ]);

    // ✅ Fetch existing divisions (Update Mode)
    useEffect(() => {
        fetch("http://localhost:7000/divisions")
            .then(res => res.json())
            .then(data => {
                if (data.length > 0) {
                    const filled = data.map(d => ({
                        id: d.id,
                        division_name: d.division_name
                    }));

                    // Always keep minimum 5 rows
                    while (filled.length < 5) {
                        filled.push({ id: null, division_name: "" });
                    }

                    setDivisions(filled);
                }
            })
            .catch(err => console.error(err));
    }, []);

    const handleChange = (index, value) => {
        const updated = [...divisions];
        updated[index].division_name = value;
        setDivisions(updated);
    };

    const handleSubmit = async () => {
        try {
            const filledDivisions = divisions
                .filter(d => d.division_name.trim() !== "");

            if (filledDivisions.length === 0) {
                alert("Please enter at least one division");
                return;
            }

            const isUpdate = filledDivisions.some(d => d.id !== null);

            const method = isUpdate ? "PUT" : "POST";

            const bodyData = isUpdate
                ? { divisions: filledDivisions }
                : { divisions: filledDivisions.map(d => d.division_name) };

            const response = await fetch("http://localhost:7000/divisions", {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(bodyData),
            });

            const data = await response.json();
            console.log(data);

            alert(
                isUpdate
                    ? "Divisions updated successfully!"
                    : "Divisions inserted successfully!"
            );

        } catch (error) {
            console.error("Error:", error);
        }
    };

    return (
        <div className="flex font-amasis">
            <div className="w-full h-screen flex">

                {/* LEFT SIDE */}
                <div className="w-[30%] bg-gradient-to-t from-[#ccc] to-cyan-400 p-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-white bg-white/20 px-3 py-2 rounded-lg"
                    >
                        Back
                    </button>
                </div>

                {/* RIGHT SIDE */}
                <div className="w-[70%] bg-gradient-to-t from-[#ccc] to-cyan-400 flex justify-center">

                    <div className="w-[955px] bg-amber-50 border border-gray-600 p-4 flex flex-col justify-between">

                        <div>
                            <h2 className="bg-green-800 text-white text-center text-[13px] py-1">
                                Divisions CDA
                            </h2>

                            <div className="mt-6 space-y-4">
                                {divisions.map((division, index) => (
                                    <div key={index} className="flex items-center gap-4">
                                        <label className="w-32 text-sm font-medium">
                                            Division {index + 1} :
                                        </label>
                                        <input
                                            type="text"
                                            value={division.division_name}
                                            onChange={(e) =>
                                                handleChange(index, e.target.value)
                                            }
                                            className="w-64 h-7 px-2 text-sm border border-gray-500 focus:outline-none focus:border-blue-500 focus:bg-yellow-100"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-center mt-8">
                            <button
                                onClick={handleSubmit}
                                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                            >
                                Save
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default DivisionMaster;