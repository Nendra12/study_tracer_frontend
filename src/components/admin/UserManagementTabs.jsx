import React from 'react';

const UserManagementTabs = ({ tabs, activeTab, setActiveTab, pendingCount }) => (
  <div className="flex bg-slate-50 p-1 rounded-xl w-full md:w-auto overflow-x-auto no-scrollbar border border-slate-100">
    {tabs.map((tab) => (
      <button
        key={tab.label}
        onClick={() => setActiveTab(tab.label)}
        className={`cursor-pointer px-6 py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap
          ${activeTab === tab.label
            ? 'bg-white text-primary shadow-sm ring-1 ring-slate-200'
            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
      >
        {tab.label}
        {tab.label === 'Menunggu' && pendingCount > 0 && (
          <span className="ml-1.5 bg-orange-500 text-white text-[9px] px-1.5 py-0.5 rounded-full">{pendingCount}</span>
        )}
      </button>
    ))}
  </div>
);

export default UserManagementTabs;
