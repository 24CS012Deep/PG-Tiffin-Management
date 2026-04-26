import { useEffect, useState } from "react";
import API from "../../utils/api";
import {
  FiDownload, FiCheckCircle, FiAlertCircle, FiClock,
  FiSearch, FiFilter, FiRefreshCw, FiUser, FiCalendar, FiShoppingBag, FiHome, FiCreditCard, FiTrash2, FiInfo, FiCamera, FiX
} from "react-icons/fi";
import { MdReceiptLong, MdOutlineRestaurantMenu } from "react-icons/md";

const RoomBills = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [view, setView] = useState("active"); // 'active' or 'history'
  
  // Payment Modal State
  const [showPayment, setShowPayment] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentTitle, setPaymentTitle] = useState("");

  const fetchRecords = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await API.get("/student/billings");
      setRecords(res.data || []);
    } catch (err) {
      setError("Failed to fetch bills. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const totalUnpaid = records
    .filter(r => r.status !== "paid")
    .reduce((sum, r) => sum + (r.amount || 0), 0);

  const handlePayClick = (bill) => {
    setPaymentAmount(bill.amount);
    setPaymentTitle(`${bill.type.toUpperCase()} Bill - ${bill.month}`);
    setShowPayment(true);
  };

  const downloadBill = (billing) => {
    const content = `
--------------------------------------------
              SIYA PG - BILL RECEIPT
--------------------------------------------

Date Generated: ${new Date().toLocaleDateString("en-IN")}
Bill ID: ${billing._id}

--------------------------------------------
  BILLING DETAILS
--------------------------------------------
Month:   ${billing.month}
Type:    ${billing.type?.toUpperCase()}
Amount:  ₹${billing.amount?.toLocaleString("en-IN")}
Status:  ${billing.status?.toUpperCase()}
${billing.paidAt ? `Paid On: ${new Date(billing.paidAt).toLocaleDateString("en-IN")}` : ""}

--------------------------------------------
  Thank you for choosing Siya PG!
--------------------------------------------
    `;
    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Bill_${billing.month}_${billing.type}.txt`;
    link.click();
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case "paid":
        return { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", icon: <FiCheckCircle className="text-[10px]" />, label: "Paid" };
      case "pending":
      case "unpaid":
        return { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", icon: <FiClock className="text-[10px]" />, label: "Pending" };
      case "overdue":
        return { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", icon: <FiAlertCircle className="text-[10px]" />, label: "Overdue" };
      default:
        return { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200", label: status };
    }
  };

  const getTypeConfig = (type) => {
    switch (type) {
      case "tiffin":
        return { bg: "bg-orange-100", text: "text-orange-700", label: <span className="flex items-center gap-1"><FiShoppingBag /> Tiffin</span> };
      case "monthly":
        return { bg: "bg-indigo-100", text: "text-indigo-700", label: <span className="flex items-center gap-1"><FiHome /><FiShoppingBag /> Combined</span> };
      case "room":
        return { bg: "bg-violet-100", text: "text-violet-700", label: <span className="flex items-center gap-1"><FiHome /> Room</span> };
      default:
        return { bg: "bg-gray-100", text: "text-gray-700", label: type || "Other" };
    }
  };

  // Filtering
  const filteredRecords = records
    .filter(r => {
      if (view === "active") return r.status !== "paid";
      return r.status === "paid";
    })
    .filter(r => !typeFilter || r.type === typeFilter)
    .filter(r => !searchTerm || r.month.toLowerCase().includes(searchTerm.toLowerCase()) || r.details?.toLowerCase().includes(searchTerm.toLowerCase()));

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const getInitials = (name) => {
    if (!name) return "?";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        <p className="mt-4 text-gray-500 font-bold uppercase tracking-widest text-xs">Loading Bills...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-10 max-w-6xl mx-auto px-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-3xl font-black flex items-center gap-4 text-gray-800 tracking-tight">
              <span className="bg-gradient-to-r from-orange-400 to-orange-600 text-white p-3 rounded-[1.2rem] shadow-xl shadow-orange-100">
                <MdReceiptLong />
              </span>
              My Billing Statements
            </h2>
            <p className="text-gray-400 text-sm mt-3 font-medium ml-1">
              Track your rent and food charges with full transparency.
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* View Toggle */}
            <div className="bg-white p-1 rounded-2xl border border-gray-100 flex shadow-sm h-fit">
              <button 
                onClick={() => setView("active")}
                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                  view === "active" ? "bg-slate-900 text-white shadow-lg" : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <FiClock size={14} /> Active
              </button>
              <button 
                onClick={() => setView("history")}
                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                  view === "history" ? "bg-slate-900 text-white shadow-lg" : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <FiCheckCircle size={14} /> History
              </button>
            </div>

            <button
              onClick={fetchRecords}
              className="flex items-center gap-2 px-5 py-3 text-sm font-bold text-orange-600 bg-orange-50 rounded-2xl hover:bg-orange-100 transition-all shadow-sm"
            >
              <FiRefreshCw /> Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Pending Dues Banner (Only in Active View) */}
      {totalUnpaid > 0 && view === "active" && (
        <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-3xl p-8 mb-8 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-8 shadow-2xl shadow-orange-200/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <p className="text-orange-100 text-sm font-black uppercase tracking-widest mb-2 opacity-80 flex items-center gap-2">
              <FiAlertCircle /> Total Outstanding
            </p>
            <p className="text-5xl font-black tracking-tighter">₹{totalUnpaid.toLocaleString("en-IN")}</p>
          </div>
          <button
            onClick={() => {
              setPaymentAmount(totalUnpaid);
              setPaymentTitle("Total Outstanding Dues");
              setShowPayment(true);
            }}
            className="w-full md:w-auto relative z-10 bg-white text-orange-600 font-black px-10 py-4 rounded-2xl hover:bg-orange-50 transition-all shadow-lg active:scale-95 text-sm uppercase tracking-widest"
          >
            Pay All Dues
          </button>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-xl mb-8 font-bold flex items-center gap-3">
          <FiAlertCircle /> {error}
        </div>
      )}

      {/* Filters & Search (Admin Style) */}
      <div className="bg-white p-5 rounded-[1.5rem] shadow-sm border border-gray-100 mb-8">
        <div className="flex flex-col sm:flex-row gap-5">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by month or details..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-orange-500 transition-all text-sm font-medium outline-none"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <FiX />
              </button>
            )}
          </div>
          <div className="flex gap-4">
            <div className="relative min-w-[160px]">
              <FiFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full pl-11 pr-8 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-orange-500 text-sm font-bold outline-none appearance-none cursor-pointer"
              >
                <option value="">All Types</option>
                <option value="tiffin">Tiffin Only</option>
                <option value="room">Room Only</option>
                <option value="monthly">Combined</option>
              </select>
            </div>
            <button
              onClick={() => { setSearchTerm(""); setTypeFilter(""); }}
              className="text-orange-500 hover:text-orange-600 font-black text-xs uppercase tracking-widest flex items-center gap-2 px-4 hover:bg-orange-50 rounded-xl transition-all"
            >
              <FiRefreshCw /> Reset
            </button>
          </div>
        </div>
      </div>

      {/* Premium Table (Admin Style) */}
      <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-100 border border-gray-50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-gray-400 text-[10px] uppercase font-black tracking-[0.2em] border-b border-gray-100">
                <th className="px-8 py-6">User Details</th>
                <th className="px-6 py-6">Month</th>
                <th className="px-6 py-6">Bill Type</th>
                <th className="px-6 py-6">Amount</th>
                <th className="px-6 py-6">Payment Status</th>
                <th className="px-8 py-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredRecords.length > 0 ? (
                filteredRecords.map((billing) => {
                  const status = getStatusConfig(billing.status);
                  const type = getTypeConfig(billing.type);

                  return (
                    <tr key={billing._id} className="hover:bg-orange-50/20 transition-all group">
                      {/* User Column (Initials Style) */}
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-orange-100 flex-shrink-0 group-hover:scale-110 transition-transform">
                            {getInitials(user.name)}
                          </div>
                          <div>
                            <p className="font-black text-slate-800 text-sm tracking-tight">{user.name || "Student"}</p>
                            <p className="text-gray-400 text-xs font-medium">{user.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Month */}
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-2.5 text-slate-700 text-sm font-bold">
                          <FiCalendar className="text-orange-500" />
                          {billing.month}
                        </div>
                      </td>

                      {/* Type (Pill) */}
                      <td className="px-6 py-6">
                        <span className={`inline-flex items-center px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider ${type.bg} ${type.text} shadow-sm`}>
                          {type.label}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="px-6 py-6">
                        <span className="text-orange-600 font-black text-xl tracking-tight">
                          ₹{billing.amount?.toLocaleString("en-IN")}
                        </span>
                      </td>

                      {/* Status (Pill) */}
                      <td className="px-6 py-6">
                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 font-black uppercase text-[10px] tracking-widest shadow-sm ${status.bg} ${status.text} ${status.border}`}>
                          {status.icon} {status.label}
                        </div>
                        {billing.paidAt && (
                          <p className="text-[10px] text-gray-400 mt-2 font-bold ml-1">
                            Paid {new Date(billing.paidAt).toLocaleDateString("en-IN")}
                          </p>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-8 py-6">
                        <div className="flex items-center justify-center gap-3">
                          {billing.status !== "paid" && (
                            <button
                              onClick={() => handlePayClick(billing)}
                              className="p-3 bg-slate-900 text-white rounded-xl hover:bg-orange-500 transition-all shadow-lg shadow-slate-100 active:scale-95"
                              title="Pay Bill"
                            >
                              <FiCreditCard />
                            </button>
                          )}
                          <button
                            onClick={() => downloadBill(billing)}
                            className="p-3 bg-white border-2 border-gray-100 text-gray-500 rounded-xl hover:border-orange-500 hover:text-orange-600 transition-all group/dl"
                            title="Download Receipt"
                          >
                            <FiDownload className="group-hover/dl:translate-y-0.5 transition-transform" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-300">
                      <MdReceiptLong className="text-7xl mb-4 opacity-20" />
                      <p className="text-xl font-black text-slate-400">{view === "active" ? "Clear Ledger" : "No History"}</p>
                      <p className="text-sm font-medium mt-1">
                        {searchTerm || typeFilter ? "No matching records found." : "Your billing statements will appear here."}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Modal (UPI Scanner) */}
      {showPayment && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] w-full max-w-sm overflow-hidden shadow-2xl transform animate-in zoom-in-95 duration-300 relative">
            <div className="bg-gradient-to-br from-orange-500 to-amber-500 p-10 text-center text-white relative">
              <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
              <h3 className="text-3xl font-black mb-1">Scan & Pay</h3>
              <p className="text-orange-100 text-xs font-black uppercase tracking-widest opacity-90">{paymentTitle}</p>
            </div>
            
            <div className="p-10 text-center flex flex-col items-center">
              <div className="w-60 h-60 bg-gray-50 rounded-[2.5rem] mb-8 flex items-center justify-center border-4 border-dashed border-gray-100 p-5 shadow-inner">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=siyapg@upi&pn=SiyaPG&am=${paymentAmount}&cu=INR`} 
                  alt="QR" 
                  className="w-full h-full mix-blend-multiply"
                />
              </div>
              
              <div className="mb-8">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Grand Total</p>
                <p className="text-5xl font-black text-slate-800 tracking-tight">₹{paymentAmount.toLocaleString("en-IN")}</p>
              </div>

              <div className="bg-amber-50/50 border border-amber-100 text-amber-700 text-[10px] font-black uppercase tracking-widest p-5 rounded-2xl mb-8 leading-loose text-center">
                <FiInfo className="mx-auto mb-2 text-lg" />
                Once paid, capture a screenshot and present it to the Admin for verification.
              </div>

              <button
                onClick={() => setShowPayment(false)}
                className="w-full py-5 rounded-2xl bg-slate-900 text-white font-black transition-all text-xs uppercase tracking-widest active:scale-95 shadow-xl shadow-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomBills;
