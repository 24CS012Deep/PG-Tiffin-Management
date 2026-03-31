import { useEffect, useState } from "react";
import API from "../../utils/api";
import { FiDollarSign, FiDownload, FiCheckCircle, FiClock, FiAlertCircle, FiFileText, FiCalendar, FiShoppingBag, FiHome } from "react-icons/fi";
import { MdReceiptLong } from "react-icons/md";

const MyBills = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      setLoading(true);
      const res = await API.get("/customer/billings");
      const sorted = res.data.sort((a, b) => {
        if (a.status !== b.status) return a.status === "pending" || a.status === "overdue" ? -1 : 1;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      setBills(sorted);
      setError("");
    } catch (err) {
      console.error("Failed to fetch bills:", err);
      setError("Failed to load bills");
    } finally {
      setLoading(false);
    }
  };

  const downloadBill = (bill) => {
    const content = `
════════════════════════════════════════════
              SIYA PG - BILL RECEIPT
════════════════════════════════════════════

Date Generated: ${new Date().toLocaleDateString("en-IN", { dateStyle: "full" })}
Bill ID: ${bill._id}

────────────────────────────────────────────
  BILLING DETAILS
────────────────────────────────────────────
Month:   ${bill.month}
Type:    ${bill.type?.toUpperCase()}
Amount:  ₹${bill.amount}
Status:  ${bill.status?.toUpperCase()}
${bill.paidAt ? `Paid On: ${new Date(bill.paidAt).toLocaleDateString("en-IN", { dateStyle: "long" })}` : ""}

════════════════════════════════════════════
  Thank you for choosing Siya PG!
════════════════════════════════════════════
    `;
    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Bill_${bill.type}_${bill.month}.txt`;
    link.click();
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case "paid":
        return { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", icon: <FiCheckCircle />, label: "Paid" };
      case "pending":
        return { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", icon: <FiClock />, label: "Pending" };
      case "overdue":
        return { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", icon: <FiAlertCircle />, label: "Overdue" };
      default:
        return { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200", icon: null, label: status };
    }
  };

  const getTypeConfig = (type) => {
    switch (type) {
      case "tiffin":
        return { bg: "bg-orange-100", text: "text-orange-700", label: <><FiShoppingBag className="inline mr-1" /> Tiffin</>, icon: <FiShoppingBag /> };
      case "room":
        return { bg: "bg-violet-100", text: "text-violet-700", label: <><FiHome className="inline mr-1" /> Room</>, icon: <FiHome /> };
      default:
        return { bg: "bg-gray-100", text: "text-gray-700", label: type || "Other" };
    }
  };

  const totalPending = bills.filter((b) => b.status === "pending").reduce((sum, b) => sum + (b.amount || 0), 0);
  const totalPaid = bills.filter((b) => b.status === "paid").reduce((sum, b) => sum + (b.amount || 0), 0);
  const totalOverdue = bills.filter((b) => b.status === "overdue").reduce((sum, b) => sum + (b.amount || 0), 0);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        <p className="mt-4 text-gray-500">Loading your bills...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3 text-gray-800">
            <span className="bg-gradient-to-r from-orange-400 to-orange-600 text-white p-2 rounded-xl shadow-lg">
              <MdReceiptLong />
            </span>
            My Bills
          </h1>
          <p className="text-gray-500 text-sm mt-1">View and download your billing invoices.</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-5 py-3 rounded-r-xl mb-6 flex items-center gap-3">
          <FiAlertCircle className="text-lg flex-shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Bills", value: bills.length, icon: <MdReceiptLong />, bg: "bg-gray-50", border: "border-gray-200", textColor: "text-gray-700", iconBg: "bg-gray-100" },
          { label: "Paid", value: `₹${totalPaid.toLocaleString("en-IN")}`, icon: <FiCheckCircle />, bg: "bg-emerald-50", border: "border-emerald-200", textColor: "text-emerald-600", iconBg: "bg-emerald-100" },
          { label: "Pending", value: `₹${totalPending.toLocaleString("en-IN")}`, icon: <FiClock />, bg: "bg-amber-50", border: "border-amber-200", textColor: "text-amber-600", iconBg: "bg-amber-100" },
          { label: "Overdue", value: `₹${totalOverdue.toLocaleString("en-IN")}`, icon: <FiAlertCircle />, bg: "bg-red-50", border: "border-red-200", textColor: "text-red-600", iconBg: "bg-red-100" },
        ].map((stat, idx) => (
          <div key={idx} className={`${stat.bg} border ${stat.border} rounded-2xl p-4 hover:shadow-lg hover:-translate-y-0.5 transition-all`}>
            <div className={`${stat.iconBg} ${stat.textColor} p-2 rounded-lg w-max mb-2`}>{stat.icon}</div>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">{stat.label}</p>
            <p className={`text-lg font-bold mt-0.5 ${stat.textColor}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Bills List */}
      {bills.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-dashed border-gray-300 p-16 text-center">
          <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <MdReceiptLong className="text-3xl text-orange-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">No Bills Yet</h2>
          <p className="text-gray-500 text-sm">You don't have any bills yet. They'll appear here once generated.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Billing Cycle</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {bills.map((bill) => {
                  const statusConfig = getStatusConfig(bill.status);
                  const typeConfig = getTypeConfig(bill.type);
                  return (
                    <tr key={bill._id} className="hover:bg-orange-50/30 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <FiCalendar className="text-gray-400 text-xs" />
                          <div>
                            <p className="font-bold text-gray-800">{bill.month}</p>
                            {bill.paidAt && <p className="text-xs text-gray-400 mt-0.5">Paid {new Date(bill.paidAt).toLocaleDateString("en-IN")}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${typeConfig.bg} ${typeConfig.text}`}>
                          {typeConfig.label}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-orange-600 font-bold text-base">₹{bill.amount?.toLocaleString("en-IN")}</span>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
                          {statusConfig.icon}
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button
                          onClick={() => downloadBill(bill)}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-gray-600 font-semibold text-xs uppercase tracking-wider hover:border-orange-500 hover:bg-orange-50 hover:text-orange-600 transition-all"
                        >
                          <FiDownload /> Invoice
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-gray-100">
            {bills.map((bill) => {
              const statusConfig = getStatusConfig(bill.status);
              const typeConfig = getTypeConfig(bill.type);
              return (
                <div key={bill._id} className="p-5 relative">
                  <div className="absolute right-5 top-5">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
                      {statusConfig.icon}
                      {statusConfig.label}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{bill.month}</p>
                  <div className="text-xl font-black text-gray-800 mb-1 flex items-center gap-2">
                    ₹{bill.amount?.toLocaleString("en-IN")}
                    <span className={`text-xs px-2 py-0.5 rounded-full ${typeConfig.bg} ${typeConfig.text}`}>{typeConfig.label}</span>
                  </div>
                  <button
                    onClick={() => downloadBill(bill)}
                    className="mt-3 w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm bg-gray-50 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 transition-colors"
                  >
                    <FiDownload /> Download Invoice
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBills;