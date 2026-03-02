import React from 'react';
import DatePicker from 'react-datepicker';
import { parseISO, format, isAfter } from 'date-fns';

import "react-datepicker/dist/react-datepicker.css";

const DateRangePicker = ({ formData, setFormData }) => {
  
  const handleDateChange = (field, date) => {
    // Jika date null (dihapus), simpan null. Jika ada, format ke string.
    const newDateValue = date ? format(date, 'yyyy-MM-dd') : null;
    let updatedData = { ...formData, [field]: newDateValue };

    // Logika sinkronisasi jika Tanggal Mulai melewati Tanggal Selesai
    if (field === 'tanggalMulai' && formData.tanggalSelesai && date) {
      if (isAfter(date, parseISO(formData.tanggalSelesai))) {
        updatedData.tanggalSelesai = newDateValue;
      }
    }

    // Jika Tanggal Mulai dihapus, biasanya Tanggal Selesai juga harus ikut dihapus 
    // agar validasi minDate tidak error.
    if (field === 'tanggalMulai' && !date) {
      updatedData.tanggalSelesai = null;
    }

    setFormData(updatedData);
  };

  const inputStyle = "w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-primary transition-all";

  return (
    <div className="grid grid-cols-2 gap-3">
      {/* TANGGAL MULAI */}
      <div>
        <label className="text-[11px] mb-3 font-bold text-secondary uppercase block mb-1">
          Tgl Mulai
        </label>
        <DatePicker
          selected={formData.tanggalMulai ? parseISO(formData.tanggalMulai) : null}
          onChange={(date) => handleDateChange('tanggalMulai', date)}
          dateFormat="dd/MM/yyyy"
          placeholderText="Pilih tanggal"
          className={inputStyle}
          minDate={new Date()}
          isClearable // Menambahkan tombol silang (X) untuk hapus
          shouldCloseOnSelect={true}
          autoComplete="off"
        />
      </div>

      {/* TANGGAL SELESAI */}
      <div>
        <label className="text-[11px] font-bold text-secondary mb-3 uppercase block mb-1">
          Tgl Selesai
        </label>
        <DatePicker
          selected={formData.tanggalSelesai ? parseISO(formData.tanggalSelesai) : null}
          onChange={(date) => handleDateChange('tanggalSelesai', date)}
          dateFormat="dd/MM/yyyy"
          placeholderText="Pilih tanggal"
          className={inputStyle}
          minDate={formData.tanggalMulai ? parseISO(formData.tanggalMulai) : new Date()}
          isClearable // Menambahkan tombol silang (X) untuk hapus
          shouldCloseOnSelect={true}
          autoComplete="off"
          disabled={!formData.tanggalMulai}
        />
        {!formData.tanggalMulai && (
          <span className="text-[10px] text-red-500 mt-1 block">Pilih tgl mulai dahulu</span>
        )}
      </div>
    </div>
  );
};

export default DateRangePicker;