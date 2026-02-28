import { useState } from "react";
import { useNavigate } from "react-router-dom";

const DivisionMaster = () => {
    const navigate = useNavigate();

    const [divisions, setDivisions] = useState({
        division1: "",
        division2: "",
        division3: "",
        division4: "",
        division5: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setDivisions((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = () => {
        console.log("Submitted Divisions:", divisions);
        // API call here
    };

    return (
        <div className="flex font-amasis">
            <div className="w-full h-screen flex">
                
                {/* LEFT SIDE */}
                <div className="w-[30%] bg-gradient-to-t from-[#ccc] to-cyan-400 p-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-white hover:text-gray-200 transition-colors bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg backdrop-blur-sm"
                    >
                        Back
                    </button>
                </div>

                {/* RIGHT SIDE */}
                <div className="w-[70%] bg-gradient-to-t from-[#ccc] to-cyan-400 flex justify-center">
                    
                    <div className="w-[955px] bg-amber-50 border border-gray-600 p-4 flex flex-col justify-between">

                        {/* Header */}
                        <div>
                            <h2 className="bg-green-800 text-white text-center text-[13px] py-1">
                                Divisions CDA
                            </h2>

                            {/* Division Rows */}
                            <div className="mt-6 space-y-4">
                                {Object.keys(divisions).map((key, index) => (
                                    <div key={key} className="flex items-center gap-4">
                                        <label className="w-32 text-sm font-medium">
                                            Division {index + 1} :
                                        </label>
                                        <input
                                            type="text"
                                            name={key}
                                            value={divisions[key]}
                                            onChange={handleChange}
                                            className="w-64 h-7 px-2 text-sm border border-gray-500 focus:outline-none focus:border-blue-500 focus:bg-yellow-100"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Submit Button at Bottom */}
                        <div className="flex justify-center mt-8">
                            <button
                                onClick={handleSubmit}
                                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                            >
                                Submit
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default DivisionMaster;