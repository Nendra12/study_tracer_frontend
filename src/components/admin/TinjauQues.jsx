import { X } from 'lucide-react';
import React, { useState } from 'react';

const TinjauQues = ({ isOpen, onClose, datas, pertanyaan }) => {
    const [selectedOption, setSelectedOption] = useState(null);

    // Contoh opsi lebih dari 4 (bisa Anda ganti/tambah untuk tes)
    const options = datas;

    if (!isOpen) return null;

    // Logika Penentuan Kolom Dinamis
    const getGridCols = (n) => {
        if (n <= 4) return 'grid-cols-1';
        if (n % 4 === 0) return 'md:grid-cols-4 grid-cols-2'; // 4 kolom di desktop, 2 di mobile
        if (n % 3 === 0) return 'md:grid-cols-3 grid-cols-1'; // 3 kolom di desktop
        return 'md:grid-cols-2 grid-cols-1'; // Default genap lainnya buat 2 kolom
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-6xl bg-white rounded- p-8 md:p-12 shadow-2xl rounded-xl animate-in fade-in zoom-in duration-300"
                onClick={(e) => e.stopPropagation()}
            >

                {/* Header */}
                <div className="flex items-start gap-4 mb-10">
                    <div className="flex-shrink-0 min-w-[32px] h-8 bg-[#f0f4f8] text-[#5e6c84] rounded-full flex items-center justify-center font-bold text-sm">
                        1
                    </div>
                    <h2 className="text-lg md:text-xl font-bold text-[#172b4d] leading-snug">
                        {pertanyaan}
                    </h2>
                </div>

                {/* Daftar Pilihan dengan Grid Dinamis */}
                <div className={`grid gap-4 ${getGridCols(options.length)}`}>
                    {options.map((option, index) => (
                        <div
                            key={index}
                            onClick={() => setSelectedOption(index)}
                            className={`
                group flex items-center p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200
                ${selectedOption === index
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'}
              `}
                        >
                            {/* Radio Circle */}
                            <div className={`
                w-5 h-5 rounded-full border-2 mr-3 flex-shrink-0 flex items-center justify-center transition-colors
                ${selectedOption === index
                                    ? 'border-blue-500 bg-blue-500'
                                    : 'border-gray-300 group-hover:border-gray-400'}
              `}>
                                {selectedOption === index && (
                                    <div className="w-2 h-2 bg-white rounded-full" />
                                )}
                            </div>

                            {/* Teks Opsi */}
                            <span className={`
                text-sm md:text-md font-medium leading-tight transition-colors
                ${selectedOption === index ? 'text-blue-700' : 'text-gray-600'}
              `}>
                                {option}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Tombol Close */}
                <button
                    onClick={onClose}
                    className="cursor-pointer absolute top-6 right-8 p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
                >
                    <X size={22} />
                </button>
            </div>
        </div>
    );
};

export default TinjauQues;