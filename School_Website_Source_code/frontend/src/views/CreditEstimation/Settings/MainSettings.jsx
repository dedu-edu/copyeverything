import useApi from "@src/utility/hooks/useApi";
import { useEffect, useState, useContext } from "react";
import useToast from "@hooks/useToast";
import { UncontrolledTooltip } from "reactstrap";
import { AlertOctagon } from "react-feather";
import SchoolContext from "@context/SchoolContext"

const MainSettings = () => {
    const settingsApi = useApi(true).credit.settings;
    const [data, setData] = useState([]);
    const [editedData, setEditedData] = useState({});
    const [isDirty, setIsDirty] = useState(false);
    // const [selectedSchool, setSelectedSchool] = useState("");
    const { school_id } = useContext(SchoolContext)

    const addToast = useToast()

    async function fetchData() {
        const { success, data } = await settingsApi.get();
        if (success) setData(data);
    }

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        setEditedData(prev => {
            const updated = {};
            for (const [key, val] of Object.entries(prev)) {
                updated[key] = { ...val, sub_org: school_id };
            }
            return updated;
        });
    }, [school_id]);

    function handleInputChange(teacher_rank_type, type, value) {
        const key = `${teacher_rank_type}-${type}`;
        setEditedData(prev => ({
            ...prev,
            [key]: {
                teacher_rank_type,
                type,
                ratio: value === "" ? "" : parseFloat(value),
                sub_org: school_id,
            }
        }));
        setIsDirty(true);
    }

    async function handleSave() {
        const payloads = Object.values(editedData);
        if (payloads.length === 0) return;

        const results = {
            success: [],
            warning: [],
            error: [],
        };

        for (const payload of payloads) {
            const res = await settingsApi.put(payload);
            if (!res) continue;

            if (res.success) {
                const msg = res.info || res.data || "Амжилттай хадгалагдлаа";
                results.success.push(msg);
            } else {
                const msg = res.error || "Алдаа гарлаа.";
                results.error.push(msg);
            }
        }

        results.success = [...new Set(results.success)];
        results.error = [...new Set(results.error)];

        let type = "success";
        let text = "";

        if (results.error.length && results.success.length) {
            type = "warning";
            text = `Зарим зүйл амжилттай, зарим нь алдаатай.\n\n ${results.success.join(
                ", "
            )}\n ${results.error.join(", ")}`;
        } else if (results.error.length) {
            type = "error";
            text = `Хадгалах үед алдаа гарлаа:\n ${results.error.join(", ")}`;
        } else {
            text = `${results.success.join(", ") || "Амжилттай хадгалагдлаа"}`;
        }

        addToast({ type, text });

        await fetchData();
        setEditedData({});
        setIsDirty(false);

    }

    const teacherRanks = [
        { id: 1, name: "Дадлагажигч багш" },
        { id: 2, name: "Багш" },
        { id: 3, name: "Ахлах багш" },
        { id: 4, name: "Дэд проффессор" },
        { id: 5, name: "Проффессор" },
        { id: 6, name: "Дамжааны захирагч багш" },
        { id: 7, name: "Эрхлэгч" },
    ];

    const timeTypes = [
        { id: 1, name: "A цаг" },
        { id: 2, name: "Б цаг" },
        { id: 3, name: "В цаг" },
        { id: 4, name: "Г цаг" }
    ];

    return (
        <div className="mt-4">
            <div className="d-flex justify-content-between align-items-center mb-2">
                {isDirty && (
                    <button className="btn btn-success btn-sm ms-2" onClick={handleSave}>
                        Хадгалах
                    </button>
                )}
            </div>
            <div className="table-responsive">
                <table className="table table-bordered text-center align-middle">
                    <thead>
                        <tr>
                            <th rowSpan="2">Д/д</th>
                            <th rowSpan="2">Багшийн албан тушаал</th>
                            <th colSpan="4">Ажлын чиглэл</th>
                            <th rowSpan="2">Нийт багц</th>
                        </tr>
                        <tr>
                            <th>Сургалт</th>
                            <th>Эрдэм шинжилгээ, судалгааны ажил</th>
                            <th>Сургуулийн, олон нийтийн үйлчилгээ</th>
                            <th>Багшийн хөгжил</th>
                        </tr>
                        <tr>
                            <th></th>
                            <th></th>
                            <th>A цаг</th>
                            <th>Б цаг</th>
                            <th>В цаг</th>
                            <th>Г цаг</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {teacherRanks.map((rank, index) => {
                            const row = timeTypes.map(t => {
                                const key = `${rank.id}-${t.id}`;
                                const existing = data.find(
                                    d => d.teacher_rank_type === rank.id && d.type === t.id
                                );
                                const edited = editedData[key];
                                const value = edited
                                    ? edited.ratio
                                    : existing
                                        ? existing.ratio
                                        : "";

                                return (
                                    <td key={key}>
                                        <input
                                            type="number"
                                            step="0.1"
                                            className="form-control text-center"
                                            style={{ width: "80px", margin: "auto" }}
                                            value={value}
                                            placeholder="-"
                                            onChange={(e) =>
                                                handleInputChange(rank.id, t.id, e.target.value)
                                            }
                                        />
                                    </td>
                                );
                            });

                            const total = data
                                .filter(d => d.teacher_rank_type === rank.id)
                                .reduce((sum, d) => sum + (parseFloat(d.ratio) || 0), 0);

                            return (
                                <tr key={rank.id}>
                                    <td>{index + 1}</td>
                                    <td className="text-start">{rank.name}</td>
                                    {row}
                                    <td>{total > 0 ? total.toFixed(1) : ""}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MainSettings;
