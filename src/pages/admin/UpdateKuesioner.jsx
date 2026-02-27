import React, { useEffect, useState } from "react";
import {
    Eye,
    Save,
    X,
    Plus,
    FileQuestionMark,
    ArrowLeft,
    Loader2,
    CheckCircle2,
    Archive,
} from "lucide-react";
import SmoothDropdown from "../../components/admin/SmoothDropdown";
import { Link, useNavigate, useParams } from "react-router-dom";
import { adminApi } from "../../api/admin";
import { masterDataApi } from "../../api/masterData";
import { alertError, alertSuccess } from "../../utilitis/alert";
import TinjauQues from "../../components/admin/TinjauQues";

export default function UpdateKuesioner() {
    const navigate = useNavigate();
    const { id } = useParams(); // ID pertanyaan dari route

    // State untuk kategori yang dipilih
    const [selectedCategory, setSelectedCategory] = useState("Bekerja");
    const [questionText, setQuestionText] = useState("");
    const [idQues, setIdQues] = useState(1);
    const [currentStatus, setCurrentStatus] = useState("publish");

    const [options, setOptions] = useState([
        "Bekerja Penuh Waktu",
        "Tidak Bekerja"
    ]);

    const [structureData, setstructureData] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [savingDraft, setSavingDraft] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [kuesionerId, setKuesionerId] = useState(null);

    // State untuk modal tambah judul
    const [showModal, setShowModal] = useState(false);
    const [newJudulPertanyaan, setNewJudulPertanyaan] = useState("");
    const [savingJudul, setSavingJudul] = useState(false);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                setLoading(true);

                // Fetch kuesioner structure dan status
                const [kuesionerRes, statusRes, pertanyaanRes] = await Promise.all([
                    adminApi.getKuesioner().catch(() => null),
                    masterDataApi.getStatus().catch(() => null),
                    adminApi.getPertanyaanAll().catch(() => null)
                ]);

                let statusData = [];

                if (statusRes?.data?.data && Array.isArray(statusRes.data.data)) {
                    statusData = statusRes.data.data;
                } else if (Array.isArray(statusRes?.data)) {
                    statusData = statusRes.data;
                }

                let stru = {};

                statusData.forEach((st) => {
                    stru[st.nama] = {};
                });

                kuesionerRes?.data?.data?.data?.forEach((dat) => {
                    const statusNama = dat?.status?.nama;
                    stru[statusNama] = [
                        dat.section_ques
                    ];
                });

                setstructureData(stru);

                // Fetch pertanyaan yang akan di-update
                let pertanyaanData = [];
                if (pertanyaanRes?.data?.data?.data) {
                    pertanyaanData = pertanyaanRes.data.data.data;
                } else if (pertanyaanRes?.data?.data && Array.isArray(pertanyaanRes.data.data)) {
                    pertanyaanData = pertanyaanRes.data.data;
                } else if (Array.isArray(pertanyaanRes?.data)) {
                    pertanyaanData = pertanyaanRes.data;
                }

                // Cari pertanyaan berdasarkan ID
                const questionToEdit = pertanyaanData.find(q => q.id === parseInt(id));

                if (questionToEdit) {
                    // Set form dengan data existing
                    setQuestionText(questionToEdit.isi_pertanyaan);
                    setIdQues(questionToEdit.id_sectionques);
                    setCurrentStatus(questionToEdit.status_pertanyaan || 'publish');

                    // Set opsi jawaban
                    if (questionToEdit.opsi && questionToEdit.opsi.length > 0) {
                        setOptions(questionToEdit.opsi.map(o => o.opsi));
                    } else {
                        setOptions(["Opsi 1", "Opsi 2"]);
                    }

                    // console.log("eek", questionToEdit.kuisoner.status)

                    // Set kategori berdasarkan status dari kuesioner
                    const statusName = questionToEdit.kuesioner?.status?.nama_status;
                    if (statusName) {
                        setSelectedCategory(statusName);
                    }




                    // Set kuesioner ID
                    const quesKuesionerId = questionToEdit.section?.id_kuesioner || questionToEdit.kuesioner?.id;
                    setKuesionerId(quesKuesionerId);
                } else {
                    setError("Pertanyaan tidak ditemukan");
                }

            } catch (error) {
                console.error("Failed to fetch data", error);
                setError("Gagal memuat data kuesioner");
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, [id]);


    const addOption = () => setOptions([...options, ""]);

    const handleOptionChange = (index, value) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const removeOption = (index) => {
        if (options.length > 2) {
            const newOptions = options.filter((_, i) => i !== index);
            setOptions(newOptions);
        }
    };

    let dataJudul = [];
    structureData[selectedCategory]?.[0]?.forEach((items) => {
        dataJudul.push(items.judul_pertanyaan);
    });

    const onSelect = (selectedTitle) => {
        // Cari ID berdasarkan judul yang diklik di dropdown
        const selectedItem = structureData[selectedCategory]?.[0]?.find(
            (item) => item.judul_pertanyaan === selectedTitle
        );

        if (selectedItem) {
            return selectedItem.id;
        }
    };

    const handleUpdateWithStatus = async (status) => {
        try {
            // Validasi
            if (!questionText.trim()) {
                await alertError("Pertanyaan wajib diisi!")
                return;
            }

            if (!idQues) {
                await alertError("Judul bagian wajib dipilih!")
                return;
            }

            // console.log("horee", idQues)
            if (!kuesionerId) {
                await alertError("Data kuesioner tidak lengkap!")
                return;
            }

            // Filter opsi yang tidak kosong
            const filteredOptions = options.filter(opt => opt.trim() !== "");

            if (filteredOptions.length === 0) {
                await alertError("Minimal harus ada 1 opsi jawaban!")
                return;
            }

            // Set loading state based on status
            if (status === "draft") {
                setSavingDraft(true);
            } else {
                setSaving(true);
            }
            setError(null);
            setSuccess(false);
            let dataBody = {
                "id_sectionques": idQues,
                "isi_pertanyaan": questionText,
                "status_pertanyaan": status, // 'publish' atau 'draft'
                "opsi": filteredOptions
            };

            console.log(dataBody)

            // Kirim ke API untuk update
            await adminApi.updatePertanyaan(kuesionerId, id, dataBody);

            // Success!
            setSuccess(true);
            const statusText = status === "publish" ? "dipublikasikan" : "disimpan sebagai draft";

            await alertSuccess(`Pertanyaan berhasil diupdate dan ${statusText}!`);

            navigate("/wb-admin/kuisoner");

        } catch (error) {
            console.error("Failed to update:", error);
            const errorMessage = error?.response?.data?.message ||
                error?.response?.data?.errors ||
                "Gagal mengupdate pertanyaan. Silakan coba lagi.";
            setError(typeof errorMessage === 'object' ? JSON.stringify(errorMessage) : errorMessage);
            await alertError("❌ " + (typeof errorMessage === 'object' ? JSON.stringify(errorMessage) : errorMessage));
        } finally {
            setSaving(false);
            setSavingDraft(false);
        }
    };

    const handleAddJudulPertanyaan = async () => {
        try {
            if (!newJudulPertanyaan.trim()) {
                await alertError("Judul pertanyaan wajib diisi!");
                return;
            }

            setSavingJudul(true);

            // Cari id_kuesioner berdasarkan selectedCategory
            let idKuesioner = null;
            const selectedSection = structureData[selectedCategory]?.[0]?.[0];
            if (selectedSection) {
                idKuesioner = selectedSection.id_kuesioner;
            } else {
                idKuesioner = 4
            }

            if (!idKuesioner) {
                await alertError("Kuesioner tidak ditemukan!");
                return;
            }

            const data = {
                id_kuesioner: idKuesioner,
                judul_pertanyaan: newJudulPertanyaan.trim()
            };

            const response = await adminApi.createSectionQues(data);

            await alertSuccess("Judul pertanyaan berhasil ditambahkan!");

            // Close modal and reset
            setShowModal(false);
            setNewJudulPertanyaan("");

            // Refresh data
            const [kuesionerRes, statusRes] = await Promise.all([
                adminApi.getKuesioner().catch(() => null),
                masterDataApi.getStatus().catch(() => null)
            ]);

            let statusData = [];
            if (statusRes?.data?.data && Array.isArray(statusRes.data.data)) {
                statusData = statusRes.data.data;
            } else if (Array.isArray(statusRes?.data)) {
                statusData = statusRes.data;
            }

            let stru = {};
            statusData.forEach((st) => {
                stru[st.nama] = {};
            });

            kuesionerRes?.data?.data?.data?.forEach((dat) => {
                const statusNama = dat?.status?.nama;
                stru[statusNama] = [dat.section_ques];
            });

            setstructureData(stru);

            // Set id ke section yang baru dibuat jika ada
            if (response?.data?.data?.id_sectionques) {
                setIdQues(response.data.data.id_sectionques);
            }

        } catch (error) {
            const errorMessage = error?.response?.data?.message ||
                "Gagal menambahkan judul pertanyaan. Silakan coba lagi.";
            await alertError(errorMessage);
        } finally {
            setSavingJudul(false);
        }
    };

    // Get current judul for display
    const getCurrentJudulPertanyaan = () => {
        const allSections = structureData[selectedCategory]?.[0] || [];
        // console.log(allSections)
        const currentSection = allSections.find(section => section.id === idQues);
        return currentSection?.judul_pertanyaan || "";
    };

    // console.log(getCurrentJudulPertanyaan())


    // console.log(selectedCategory)

    const [tinjau, setTinjau] = useState(false)
    const filteredOptions = options.filter(opt => opt.trim() !== "");
    // const handleTinjauBox = () => {
    //     setTinjau((prev) => !prev)
    // }

    return (
        <div className="p-6 bg-gray-50 min-h-screen font-sans text-slate-700">
            <TinjauQues isOpen={tinjau} onClose={() => setTinjau(prev => !prev)} datas={filteredOptions} pertanyaan={questionText} />
            {loading ? (
                <div className="flex items-center justify-center" style={{ minHeight: '400px' }}>
                    <div className="text-center">
                        <Loader2 className="animate-spin mx-auto mb-4 text-primary" size={48} />
                        <p className="text-slate-600 font-medium">Memuat data pertanyaan...</p>
                    </div>
                </div>
            ) : (
                <>
                    <div>
                        <Link
                            to="/wb-admin/kuisoner"
                            className="flex items-center gap-2 text-third hover:text-primary transition-colors mb-8 text-sm font-medium group"
                        >
                            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                            Kembali
                        </Link>
                    </div>

                    {error && (
                        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-600 text-sm">
                            ⚠️ {error}
                        </div>
                    )}

                    {success && (
                        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 text-green-600 text-sm flex items-center gap-2">
                            <CheckCircle2 size={18} />
                            <span>Pertanyaan berhasil diupdate!</span>
                        </div>
                    )}

                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
                        <div className="flex justify-between items-center mb-8">
                            <div className="flex items-center gap-2 text-[#3D5A5C] font-bold">
                                <FileQuestionMark size={20} />
                                <h2>Update Pertanyaan Kuesioner</h2>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest ${currentStatus === 'publish'
                                    ? 'bg-green-100 text-green-700'
                                    : currentStatus === 'draft'
                                        ? 'bg-orange-100 text-orange-700'
                                        : 'bg-slate-100 text-slate-500'
                                    }`}>
                                    Status: {currentStatus === 'publish' ? 'TERLIHAT' : currentStatus === 'draft' ? 'DRAF' : 'TERSEMBUNYI'}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-12 gap-12">
                            {/* Left Column: Form */}
                            <div className="col-span-8 space-y-6">
                                <div>
                                    {/* Dropdown Kategori */}
                                    <SmoothDropdown
                                        label="Kategori Status Karier"
                                        options={Object.keys(structureData)}
                                        placeholder="Pilih status karier"
                                        isRequired={true}
                                        value={selectedCategory}
                                        onSelect={(val) => setSelectedCategory(val)}
                                    />
                                </div>

                                <div>
                                    <label className="text-[11px] font-bold text-secondary uppercase">
                                        Pertanyaan <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        value={questionText}
                                        placeholder="Masukkan pertanyaan kuesioner..."
                                        rows={4}
                                        onChange={(e) => setQuestionText(e.target.value)}
                                        className="mt-2 w-full p-3 bg-white border border-fourth rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary resize-none"
                                    />
                                </div>

                                <div>
                                    <SmoothDropdown
                                        label="Judul Bagian Pertanyaan"
                                        options={dataJudul.length > 0 ? dataJudul : ["Umum"]}
                                        placeholder="Pilih judul bagian"
                                        isRequired={true}
                                        value={getCurrentJudulPertanyaan()}
                                        onSelect={(val) => setIdQues(onSelect(val))}
                                    />
                                </div>

                                <div className="bg-slate-50/50 border border-dashed border-gray-200 rounded-2xl p-6">
                                    <label className="block text-[10px] font-black text-slate-400 mb-4 uppercase tracking-[0.15em]">
                                        Opsi Jawaban
                                    </label>
                                    <div className="space-y-3">
                                        {options.map((option, idx) => (
                                            <div key={idx} className="flex items-center gap-3 group animate-in fade-in slide-in-from-top-1">
                                                <div className="w-5 h-5 border-2 border-slate-300 rounded-full shrink-0" />
                                                <input
                                                    type="text"
                                                    value={option}
                                                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                                                    placeholder={`Opsi ${idx + 1}`}
                                                    className="flex-1 bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm focus:border-[#3D5A5C] focus:outline-none transition-colors"
                                                />
                                                {options.length > 2 && (
                                                    <button
                                                        onClick={() => removeOption(idx)}
                                                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                    >
                                                        <X size={18} />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <button
                                        onClick={addOption}
                                        className="mt-6 flex items-center gap-2 text-[#3D5A5C] font-bold text-xs hover:bg-[#3D5A5C] hover:text-white px-3 py-2 rounded-lg border border-[#3D5A5C] transition-all"
                                    >
                                        <Plus size={16} /> Tambahkan Opsi
                                    </button>
                                </div>
                            </div>

                            {/* Right Column: Structure (Dinamis berdasarkan selectedCategory) */}
                            <div className="col-span-4 border-l border-gray-100 pl-8">
                                <h3 className="text-sm font-black text-slate-800 mb-6 uppercase tracking-wider">
                                    Structure: {selectedCategory}
                                </h3>
                                <div className="space-y-3">
                                    {/* Merender data berdasarkan kategori yang dipilih */}
                                    {(structureData[selectedCategory]?.[0] || []).map((item, index) => (
                                        <div
                                            key={item.id_sectionques || index}
                                            className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${idQues === item.id_sectionques
                                                ? "bg-slate-50 border-[#3D5A5C]/20 shadow-sm"
                                                : "bg-white border-gray-100 opacity-60"
                                                }`}
                                        >
                                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${idQues === item.id_sectionques ? "bg-[#3D5A5C] text-white" : "bg-slate-100 text-slate-400"
                                                }`}>
                                                {index + 1}
                                            </span>
                                            <span className={`text-sm font-bold ${idQues === item.id_sectionques ? "text-[#3D5A5C]" : "text-slate-500"}`}>
                                                {item.judul_pertanyaan}
                                            </span>
                                        </div>
                                    ))}

                                    <button
                                        onClick={() => setShowModal(true)}
                                        className="cursor-pointer w-full mt-4 flex items-center justify-center gap-2 p-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 font-bold text-xs hover:border-[#3D5A5C] hover:text-[#3D5A5C] transition-all group">
                                        <Plus size={16} className="group-hover:rotate-90 transition-transform" />
                                        Tambah Judul Pertanyaan
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100">
                            <div className="flex gap-3">
                                <button onClick={() => (setTinjau(prev => !prev))} className="cursor-pointer flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold shadow-sm hover:bg-gray-50 transition-all">
                                    <Eye size={18} /> Pratinjau
                                </button>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleUpdateWithStatus("draft")}
                                    disabled={saving || savingDraft}
                                    className="cursor-pointer flex items-center gap-2 px-6 py-2.5 bg-white border-2 border-orange-500 text-orange-600 rounded-xl text-sm font-bold shadow-sm hover:bg-orange-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {savingDraft ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            Menyimpan...
                                        </>
                                    ) : (
                                        <>
                                            <Archive size={18} /> Simpan Draft
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={() => handleUpdateWithStatus("publish")}
                                    disabled={saving || savingDraft}
                                    className="cursor-pointer flex items-center gap-2 px-8 py-2.5 bg-[#3D5A5C] text-white rounded-xl text-sm font-bold shadow-md hover:bg-[#2D4345] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {saving ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            Updating...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={18} /> Update & Publish
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Modal Tambah Judul Pertanyaan */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                        <h3 className="text-lg font-bold text-[#3D5A5C] mb-8 text-center">
                            Tambah Judul Pertanyaan
                        </h3>

                        <div className="mb-4">
                            <label className="text-md font-bold text-secondary mb-2 block">
                                Kategori Terpilih
                            </label>
                            <div className="bg-slate-50 px-4 py-2 rounded-lg text-sm font-medium text-slate-700">
                                {selectedCategory}
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="text-md font-bold text-secondary mb-2 block">
                                Judul Pertanyaan <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={newJudulPertanyaan}
                                onChange={(e) => setNewJudulPertanyaan(e.target.value)}
                                placeholder="Contoh: Informasi Perusahaan"
                                className="w-full p-3 bg-white border border-fourth rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary"
                                autoFocus
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setNewJudulPertanyaan("");
                                }}
                                disabled={savingJudul}
                                className="cursor-pointer flex-1 px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm font-bold text-slate-600 hover:bg-gray-50 transition-all disabled:opacity-50"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleAddJudulPertanyaan}
                                disabled={savingJudul}
                                className="cursor-pointer flex-1 px-4 py-2.5 bg-[#3D5A5C] text-white rounded-xl text-sm font-bold hover:bg-[#2D4345] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {savingJudul ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        Menyimpan...
                                    </>
                                ) : (
                                    <>
                                        <Plus size={16} />
                                        Tambah
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
