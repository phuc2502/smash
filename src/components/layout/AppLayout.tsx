import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopNavbar from "./TopNavbar";

export default function AppLayout() {
  return (
    <div className="flex min-h-screen bg-[#f7f9fb] font-sans selection:bg-mint-100 selection:text-mint-700">
      <Sidebar />
      <div className="flex-1 flex flex-col md:ml-64 transition-all duration-300">
        <TopNavbar />
        <main className="flex-1 p-6 md:p-8 lg:p-10 pt-32 md:pt-40 lg:pt-44 min-h-screen overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
