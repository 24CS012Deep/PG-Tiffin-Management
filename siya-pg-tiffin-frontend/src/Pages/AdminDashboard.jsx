import { useState } from "react";
import { 
  LayoutDashboard, Bed, Users, Utensils, CreditCard, 
  MessageSquare, BarChart3, ShieldCheck, Settings, 
  LogOut, Plus, Search, Filter, CheckCircle, XCircle 
} from "lucide-react";

export default function AdminDashboard() {
  const [activeModule, setActiveModule] = useState("dashboard");

  // Sidebar Links Configuration
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={20}/> },
    { id: "rooms", label: "PG Rooms", icon: <Bed size={20}/> },
    { id: "users", label: "User Management", icon: <Users size={20}/> },
    { id: "tiffin", label: "Tiffin Plans", icon: <Utensils size={20}/> },
    { id: "billing", label: "Billing & Payments", icon: <CreditCard size={20}/> },
    { id: "inquiries", label: "Inquiries", icon: <MessageSquare size={20}/> },
    { id: "reports", label: "Reports & Analytics", icon: <BarChart3 size={20}/> },
    { id: "logs", label: "Activity Logs", icon: <ShieldCheck size={20}/> },
    { id: "settings", label: "Settings", icon: <Settings size={20}/> },
  ];

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* --- SIDEBAR --- */}
      <aside className="w-64 bg-white text-gray-800 flex flex-col sticky top-0 h-screen shadow-xl">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-orange-500 tracking-tight">SwadBox</h1>
          <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Management Suite</p>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveModule(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeModule === item.id 
                ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20" 
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
              }`}
            >
              {item.icon}
              <span className="font-medium text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:text-red-500 transition">
            <LogOut size={20}/> <span className="font-medium text-sm">Logout</span>
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
          <h2 className="text-lg font-bold text-slate-800 capitalize">
            {activeModule.replace("-", " ")}
          </h2>
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <input type="text" placeholder="Search anything..." className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm w-64 text-black focus:ring-2 focus:ring-orange-500" />
            </div>
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold border-2 border-white shadow-sm">
              AD
            </div>
          </div>
        </header>

        <div className="p-8">
          {activeModule === "dashboard" && <DashboardOverview />}
          {activeModule === "rooms" && <RoomManagement />}
          {activeModule === "users" && <UserManagement />}
          {activeModule === "tiffin" && <TiffinManagement />}
          {activeModule === "billing" && <BillingManagement />}
          {activeModule === "inquiries" && <InquiriesManagement />}
        </div>
      </main>
    </div>
  );
}

// --- SUB-COMPONENTS (MODULES) ---

function DashboardOverview() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Users" value="124" detail="+12 this month" icon={<Users className="text-blue-500"/>} />
        <StatCard title="Room Occupancy" value="18/20" detail="2 Vacant Rooms" icon={<Bed className="text-orange-500"/>} />
        <StatCard title="Active Tiffins" value="86" detail="14 Monthly Plans" icon={<Utensils className="text-green-500"/>} />
        <StatCard title="Monthly Revenue" value="₹1,42,000" detail="Target: 1.5L" icon={<CreditCard className="text-purple-500"/>} />
      </div>
      
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="font-bold text-slate-800 mb-4">Quick Insights</h3>
        <div className="h-48 flex items-center justify-center border-2 border-dashed border-slate-100 rounded-xl text-slate-400">
          Occupancy Trend Chart Placeholder
        </div>
      </div>
    </div>
  );
}

function RoomManagement() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-slate-500">Manage your PG inventory and room pricing.</p>
        <button className="bg-orange-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-bold shadow-lg shadow-orange-500/30">
          <Plus size={18}/> New Room
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {["Room 101", "Room 102", "Room 103"].map((room) => (
          <div key={room} className="bg-white p-5 rounded-xl border border-slate-200 hover:border-orange-500 transition-all cursor-pointer group">
            <div className="flex justify-between mb-4">
              <span className="font-bold text-lg">{room}</span>
              <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-[10px] font-bold uppercase">Occupied</span>
            </div>
            <div className="space-y-2 text-sm text-slate-600">
              <p>Type: Double Sharing</p>
              <p>Rent: ₹8,500/mo</p>
              <div className="flex gap-2 pt-2">
                <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px]">AC</span>
                <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px]">Attached Bath</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function UserManagement() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="p-4 border-b flex justify-between items-center bg-slate-50">
        <h3 className="font-bold">Resident Directory</h3>
        <Filter size={18} className="text-slate-400 cursor-pointer" />
      </div>
      <table className="w-full text-left">
        <thead className="text-xs text-slate-500 uppercase bg-slate-50">
          <tr>
            <th className="px-6 py-3 font-semibold">Name</th>
            <th className="px-6 py-3 font-semibold">Room</th>
            <th className="px-6 py-3 font-semibold">Tiffin Status</th>
            <th className="px-6 py-3 font-semibold text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          <tr className="hover:bg-slate-50">
            <td className="px-6 py-4 font-medium">Rahul Sharma</td>
            <td className="px-6 py-4 text-slate-600 font-bold">101-B</td>
            <td className="px-6 py-4"><span className="text-green-600 flex items-center gap-1 font-medium"><CheckCircle size={14}/> Active Thali</span></td>
            <td className="px-6 py-4 text-right text-orange-600 cursor-pointer font-medium hover:underline">Manage</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// ... Additional placeholder components for Tiffin, Billing, etc.
function TiffinManagement() { return <div className="p-10 text-center border-4 border-dashed rounded-3xl text-slate-300 font-bold text-2xl">Menu & Plan Management Module</div> }
function BillingManagement() { return <div className="p-10 text-center border-4 border-dashed rounded-3xl text-slate-300 font-bold text-2xl">Invoicing & Payment History Module</div> }
function InquiriesManagement() { return <div className="p-10 text-center border-4 border-dashed rounded-3xl text-slate-300 font-bold text-2xl">User Requests & Feedback Module</div> }

// Reusable Stat Card
function StatCard({ title, value, detail, icon }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-slate-500 text-sm font-medium">{title}</p>
          <h4 className="text-2xl font-black text-slate-900 mt-1">{value}</h4>
          <p className="text-[10px] text-slate-400 mt-1 font-bold">{detail}</p>
        </div>
        <div className="p-3 bg-slate-50 rounded-xl group-hover:bg-orange-50 transition-colors">
          {icon}
        </div>
      </div>
    </div>
  );
}
