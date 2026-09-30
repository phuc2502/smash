import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopNavbar from "./TopNavbar";
import DemoRoleSwitcher from "../demo/DemoRoleSwitcher";

export default function AppLayout() {
  return (
    <div className="flex min-h-screen bg-[#f3f6fb] text-slate-900 antialiased selection:bg-mint-100 selection:text-mint-900">
      <Sidebar />
      <div className="flex-1 flex flex-col md:ml-64 transition-all duration-300">
        <TopNavbar />
        <main className="flex-1 p-6 md:p-8 lg:p-10 pt-32 md:pt-40 lg:pt-44 min-h-screen overflow-x-hidden bg-[#f6f8fb]">
          <Outlet />
        </main>
      </div>
      <DemoRoleSwitcher />
    </div>
  );
}
