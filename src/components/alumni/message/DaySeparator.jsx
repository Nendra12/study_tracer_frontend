import React from 'react';

export default function DaySeparator({ label }) {
  if (!label) return null;
  return (
    <div className="text-center my-2">
      <span className="text-[10px] font-bold text-gray-400 bg-gray-100/80 backdrop-blur px-3 py-1 rounded-full">
        {label}
      </span>
    </div>
  );
}
