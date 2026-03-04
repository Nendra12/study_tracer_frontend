import { Outlet } from "react-router-dom";
import SideBar from "../components/admin/SideBar";
import Header from "../components/admin/Header";
import { useState, useEffect } from "react";

export default function AdminLayout() {
  const [sidebar, setSidebar] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebar(false);
      } else {
        setSidebar(true);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const user = JSON.parse(localStorage.getItem('user'))

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-gray-50">
      {/* Sidebar tetap di kiri */}
      <SideBar active={sidebar} setActive={setSidebar} />

      {/* Area Utama: Header + Content */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        <Header toggleSidebar={() => setSidebar(!sidebar)} user={user.admin_profile.nama}/>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto pt-20 custom-scrollbar">
          <section className="p-4 md:p-8">
            <Outlet />
          </section>
        </main>


      </div>

    </div>
  );
}
