import { Outlet } from "react-router-dom";
import StudentSidebar from "./StudentSidebar";
import Topbar from "./Topbar";

const StudentLayout = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      <StudentSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;