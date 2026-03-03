import React from 'react';
import DatePicker from 'react-datepicker';
import { parseISO, format, isAfter, parse } from 'date-fns';

import "react-datepicker/dist/react-datepicker.css";

const DateRangePicker = ({ formData, setFormData, errors = {} }) => {

  const handleDateChange = (field, date) => {
    if (!date) {
      // Reset both date and time when date is cleared
      let updatedData = { ...formData, [field]: null };
      if (field === 'tanggalMulai') {
        updatedData.tanggalSelesai = null;
      }
      setFormData(updatedData);
      return;
    }

    // Jika ada waktu yang sudah diset sebelumnya, pertahankan
    const currentValue = formData[field];
    let time = '00:00:00';

    if (currentValue) {
      try {
        const parsed = parseISO(currentValue);
        time = format(parsed, 'HH:mm:ss');
      } catch (e) {
        time = '00:00:00';
      }
    }

    const newDateValue = format(date, `yyyy-MM-dd'T'${time}`);
    let updatedData = { ...formData, [field]: newDateValue };

    // Logika sinkronisasi jika Tanggal Mulai melewati Tanggal Selesai
    if (field === 'tanggalMulai' && formData.tanggalSelesai && date) {
      const selesaiDate = parseISO(formData.tanggalSelesai);
      if (isAfter(date, selesaiDate)) {
        updatedData.tanggalSelesai = newDateValue;
      }
    }

    setFormData(updatedData);
  };

  const handleTimeChange = (field, time) => {
    if (!formData[field] || !time) return;

    try {
      const currentDate = parseISO(formData[field]);
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      const newDateValue = `${dateStr}T${time}:00`;

      setFormData({ ...formData, [field]: newDateValue });
    } catch (e) {
      console.error('Error updating time:', e);
    }
  };

  const getTimeValue = (field) => {
    if (!formData[field]) return '';
    try {
      const parsed = parseISO(formData[field]);
      return format(parsed, 'HH:mm');
    } catch (e) {
      return '';
    }
  };

  const getInputStyle = (field) => {
    const hasError = errors[field];
    return `w-full px-3 py-2 bg-slate-50 border ${hasError ? 'border-red-400' : 'border-slate-200'} rounded-xl text-xs outline-none focus:border-primary transition-all`;
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      {/* TANGGAL MULAI */}
      <div className="space-y-2">
        <label className="text-[11px] mb-3 font-bold text-secondary uppercase block mb-1">
          Tgl Mulai
        </label>
        <DatePicker
          selected={formData.tanggalMulai ? parseISO(formData.tanggalMulai) : null}
          onChange={(date) => handleDateChange('tanggalMulai', date)}
          dateFormat="dd/MM/yyyy"
          placeholderText="Pilih tanggal"
          className={getInputStyle('tanggalMulai')}
          minDate={new Date()}
          isClearable
          shouldCloseOnSelect={true}
          autoComplete="off"
        />

        {/* Input Waktu - Muncul setelah tanggal dipilih */}
        {formData.tanggalMulai && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300">
            <label className="text-[10px] font-semibold text-slate-600 uppercase block mb-1.5">
              Jam Mulai
            </label>
            <input
              type="time"
              value={getTimeValue('tanggalMulai')}
              onChange={(e) => handleTimeChange('tanggalMulai', e.target.value)}
              className={getInputStyle('tanggalMulai')}
            />
          </div>
        )}
      </div>

      {/* TANGGAL SELESAI */}
      <div className="space-y-2">
        <label className="text-[11px] font-bold text-secondary mb-3 uppercase block mb-1">
          Tgl Selesai
        </label>
        <DatePicker
          selected={formData.tanggalSelesai ? parseISO(formData.tanggalSelesai) : null}
          onChange={(date) => handleDateChange('tanggalSelesai', date)}
          dateFormat="dd/MM/yyyy"
          placeholderText="Pilih tanggal"
          className={getInputStyle('tanggalSelesai')}
          minDate={formData.tanggalMulai ? parseISO(formData.tanggalMulai) : new Date()}
          isClearable
          shouldCloseOnSelect={true}
          autoComplete="off"
          disabled={!formData.tanggalMulai}
        />

        {/* Input Waktu - Muncul setelah tanggal dipilih */}
        {formData.tanggalSelesai && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300">
            <label className="text-[10px] font-semibold text-slate-600 uppercase block mb-1.5">
              Jam Selesai
            </label>
            <input
              type="time"
              value={getTimeValue('tanggalSelesai')}
              onChange={(e) => handleTimeChange('tanggalSelesai', e.target.value)}
              className={getInputStyle('tanggalSelesai')}
            />
          </div>
        )}

        {!formData.tanggalMulai && (
          <span className="text-[10px] text-red-500 mt-1 block">Pilih tgl mulai dahulu</span>
        )}
      </div>
    </div>
  );
};

export default DateRangePicker;