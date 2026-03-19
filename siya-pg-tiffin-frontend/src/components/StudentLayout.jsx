import { Outlet } from "react-router-dom";
import StudentSidebar from "./StudentSidebar";
import Topbar from "./Topbar";

const StudentLayout = () => {
  return (
    <div className="flex h-screen bg-gray-100 flex-col md:flex-row">
      <StudentSidebar />
      <div className="flex-1 flex flex-col overflow-hidden mt-16 md:mt-0">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;