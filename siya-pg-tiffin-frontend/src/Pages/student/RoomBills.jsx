import { useEffect, useState } from "react";
import API from "../../utils/api";
import {
  FiDownload, FiCheckCircle, FiAlertCircle, FiClock,
  FiChevronDown, FiChevronUp, FiHome, FiRefreshCw, FiInfo, FiShoppingBag, FiCamera
} from "react-icons/fi";
import { MdReceiptLong, MdOutlineRestaurantMenu } from "react-icons/md";

const RoomBills = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [typeFilter, setTypeFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("all");
  
  // Payment Modal State
  const [showPayment, setShowPayment] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentTitle, setPaymentTitle] = useState("");
  const [paymentIds, setPaymentIds] = useState([]); // List of bill IDs being paid

  const fetchRecords = async () => {
    try {
      setLoading(true);
      setError("");
      // Fetching from standard generic billings now, as we moved away from meal-records for monthly aggregation
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
    setPaymentTitle(`Pay ${bill.type} Bill for ${bill.month}`);
    setPaymentIds([bill._id]);
    setShowPayment(true);
  };

  const handlePayMonthClick = (group) => {
    const unpaidBills = group.bills.filter(b => b.status !== "paid");
    const amount = unpaidBills.reduce((acc, b) => acc + b.amount, 0);
    setPaymentAmount(amount);
    setPaymentTitle(`Pay All Dues for ${group.month}`);
    setPaymentIds(unpaidBills.map(b => b._id));
    setShowPayment(true);
  };

  const handlePayAllClick = () => {
    const unpaidBills = records.filter(b => b.status !== "paid");
    setPaymentAmount(totalUnpaid);
    setPaymentTitle("Pay All Outstanding Dues");
    setPaymentIds(unpaidBills.map(b => b._id));
    setShowPayment(true);
  };

  const closePaymentModal = () => {
    setShowPayment(false);
    setPaymentAmount(0);
    setPaymentIds([]);
  };

  const downloadBill = (group) => {
    const lines = group.bills.map(b => {
      return `  ${(b.type.toUpperCase() + "          ").slice(0, 15)} | ₹${b.amount} | ${b.status.toUpperCase()}`;
    }).join("\n");

    const content = `
╔══════════════════════════════════════════════╗
║           SIYA PG – MONTHLY BILL             ║
╚══════════════════════════════════════════════╝

Billing Month: ${group.month}
Generated On : ${new Date().toLocaleDateString("en-IN")}

──────────────────────────────────────────────
  BILL BREAKDOWN
──────────────────────────────────────────────
  Type            | Amount | Status
----------------------------------------------
${lines}

──────────────────────────────────────────────
  SUMMARY
──────────────────────────────────────────────
GRAND TOTAL  : ₹${group.totalAmount}
Status       : ${group.paymentStatus.toUpperCase()}

══════════════════════════════════════════════
  Thank you for staying at Siya PG!
══════════════════════════════════════════════
    `;
    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Bill_${group.month}.txt`;
    link.click();
  };

  const statusConfig = {
    paid: { label: "PAID", icon: <FiCheckCircle />, cls: "bg-emerald-100 text-emerald-700 border-emerald-300" },
    overdue: { label: "OVERDUE", icon: <FiAlertCircle />, cls: "bg-red-100 text-red-700 border-red-300" },
    pending: { label: "UNPAID", icon: <FiClock />, cls: "bg-amber-100 text-amber-700 border-amber-300" }
  };

  // Group bills by month
  const groupedBills = {};
  records.forEach(bill => {
    if (!groupedBills[bill.month]) {
      groupedBills[bill.month] = {
        month: bill.month,
        bills: [],
        totalAmount: 0,
        paymentStatus: 'paid'
      };
    }
    groupedBills[bill.month].bills.push(bill);
    groupedBills[bill.month].totalAmount += bill.amount;
    
    // Overall month status logic
    if (bill.status === 'overdue') groupedBills[bill.month].paymentStatus = 'overdue';
    else if (bill.status === 'pending' && groupedBills[bill.month].paymentStatus !== 'overdue') {
      groupedBills[bill.month].paymentStatus = 'pending';
    }
  });

  // Extract unique months for filter
  const availableMonths = Object.keys(groupedBills).sort((a, b) => b.localeCompare(a));

  let groupedList = Object.values(groupedBills).sort((a, b) => b.month.localeCompare(a.month));

  // Apply Filters
  if (monthFilter !== "all") {
    groupedList = groupedList.filter(g => g.month === monthFilter);
  }
  
  if (typeFilter !== "all") {
    groupedList = groupedList.map(g => {
      const filteredBills = g.bills.filter(b => b.type === typeFilter);
      if (filteredBills.length === 0) return null;
      return {
        ...g,
        bills: filteredBills,
        totalAmount: filteredBills.reduce((sum, b) => sum + b.amount, 0)
      };
    }).filter(Boolean);
  }

  return (
    <div className="min-h-screen pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold flex items-center gap-3 text-gray-800 tracking-tight">
            <span className="bg-gradient-to-r from-orange-400 to-amber-500 w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-200">
              <MdReceiptLong className="text-xl" />
            </span>
            Monthly Bills
          </h1>
          <p className="text-gray-500 text-sm mt-2 ml-1">
            View your combined room rent and food consumption charges.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchRecords}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-orange-600 bg-orange-50 rounded-xl hover:bg-orange-100 transition-all"
          >
            <FiRefreshCw /> Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-8 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Month</label>
          <select 
            value={monthFilter} 
            onChange={(e) => setMonthFilter(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-xl px-4 py-2.5 outline-none focus:border-orange-500 transition-colors"
          >
            <option value="all">All Months</option>
            {availableMonths.map(m => (
              <option key={m} value={m}>{new Date(m + "-01").toLocaleString("en-IN", { month: "long", year: "numeric" })}</option>
            ))}
          </select>
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Bill Type</label>
          <select 
            value={typeFilter} 
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-xl px-4 py-2.5 outline-none focus:border-orange-500 transition-colors"
          >
            <option value="all">All Types</option>
            <option value="room">Room Rent Only</option>
            <option value="tiffin">Tiffin Only</option>
            <option value="monthly">Combined Only</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-5 py-4 rounded-xl mb-6 font-medium">
          {error}
        </div>
      )}

      {/* Pending Dues Banner */}
      {totalUnpaid > 0 && (
        <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl p-6 mb-8 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xl shadow-orange-200/50">
          <div>
            <p className="text-orange-100 text-sm font-semibold uppercase tracking-widest mb-1">
              Total Pending Dues
            </p>
            <p className="text-4xl font-black">₹{totalUnpaid.toLocaleString("en-IN")}</p>
          </div>
          <button
            onClick={handlePayAllClick}
            className="w-full sm:w-auto bg-white text-orange-600 font-bold px-6 py-3 rounded-xl hover:bg-orange-50 transition-colors whitespace-nowrap shadow-md"
          >
            Pay All Dues
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
        </div>
      ) : groupedList.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-sm border border-dashed border-gray-300 p-16 text-center">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <MdReceiptLong className="text-5xl text-gray-300" />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-gray-800">No bills generated yet</h2>
          <p className="text-gray-500 max-w-sm mx-auto">
            Your monthly bills for room and food will appear here once the admin generates them.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {groupedList.map(group => {
            const isExpanded = expandedId === group.month;
            const status = statusConfig[group.paymentStatus] || statusConfig.pending;

            return (
              <div key={group.month} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-md">
                {/* Main Card Header */}
                <div 
                  className="p-5 sm:p-6 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
                  onClick={() => setExpandedId(isExpanded ? null : group.month)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-xl font-black text-gray-500 flex-shrink-0 uppercase">
                      {new Date(group.month + "-01").toLocaleString("en-IN", { month: "short" })}
                    </div>
                    <div>
                      <div className="flex items-center gap-3 flex-wrap mb-1">
                        <h3 className="text-lg font-black text-gray-800">
                          {new Date(group.month + "-01").toLocaleString("en-IN", { month: "long", year: "numeric" })}
                        </h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border flex items-center gap-1 ${status.cls}`}>
                          {status.icon} {status.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-500 flex-wrap">
                        {group.bills.map(b => (
                          <span key={b._id} className="flex items-center gap-1 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100 text-xs">
                            {b.type === 'room' ? <FiHome className="text-blue-500" /> : b.type === 'tiffin' ? <MdOutlineRestaurantMenu className="text-orange-500" /> : <FiShoppingBag className="text-indigo-500" />}
                            {b.type.charAt(0).toUpperCase() + b.type.slice(1)}: ₹{b.amount}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-gray-100">
                    <div className="text-left md:text-right">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Amount</p>
                      <p className="text-2xl font-black text-gray-800">₹{group.totalAmount.toLocaleString("en-IN")}</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                      {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                    </div>
                  </div>
                </div>

                {/* Expanded Breakdown */}
                {isExpanded && (
                  <div className="border-t border-gray-100 bg-gray-50/50 p-5 sm:p-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                      
                      {/* Individual Bills Table */}
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">Bill Breakdown</h4>
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                          <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase text-xs tracking-wider">
                              <tr>
                                <th className="px-4 py-3">Type / Details</th>
                                <th className="px-4 py-3 text-center">Status</th>
                                <th className="px-4 py-3 text-right">Amount</th>
                                <th className="px-4 py-3 text-right">Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 font-medium text-gray-600">
                              {group.bills.map(b => {
                                const bStatus = statusConfig[b.status] || statusConfig.pending;
                                return (
                                  <tr key={b._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3">
                                      <p className="font-bold text-gray-800 capitalize flex items-center gap-2">
                                        {b.type === 'room' ? <FiHome className="text-blue-500" /> : b.type === 'tiffin' ? <MdOutlineRestaurantMenu className="text-orange-500" /> : <FiShoppingBag className="text-indigo-500" />}
                                        {b.type}
                                      </p>
                                      <p className="text-xs text-gray-400 mt-0.5">{b.details}</p>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${bStatus.cls}`}>
                                        {bStatus.label}
                                      </span>
                                    </td>
                                    <td className="px-4 py-3 text-right text-gray-800 font-bold">₹{b.amount}</td>
                                    <td className="px-4 py-3 text-right">
                                      {b.status !== "paid" && (
                                        <button 
                                          onClick={() => handlePayClick(b)}
                                          className="text-xs bg-gray-900 text-white px-3 py-1.5 rounded-lg hover:bg-gray-800 font-bold"
                                        >
                                          Pay
                                        </button>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                            <tfoot className="bg-orange-50/50 border-t border-orange-100 font-bold">
                              <tr>
                                <td colSpan="2" className="px-4 py-3 text-right text-gray-600">Total Month Dues:</td>
                                <td className="px-4 py-3 text-right text-orange-600 text-base">₹{group.totalAmount}</td>
                                <td></td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      </div>

                      {/* Actions Box */}
                      <div className="w-full lg:w-64 flex flex-col gap-3">
                        <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-0 lg:mb-3 hidden lg:block">Month Actions</h4>
                        
                        {group.paymentStatus !== "paid" ? (
                          <button
                            onClick={(e) => { e.stopPropagation(); handlePayMonthClick(group); }}
                            className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold transition-all shadow-sm flex items-center justify-center gap-2"
                          >
                            <FiCamera /> Pay Pending Bills
                          </button>
                        ) : (
                          <div className="w-full py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-center flex items-center justify-center gap-2">
                            <FiCheckCircle /> Month Fully Paid
                          </div>
                        )}
                        
                        <button
                          onClick={(e) => { e.stopPropagation(); downloadBill(group); }}
                          className="w-full py-3 rounded-xl bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-600 font-bold transition-all flex items-center justify-center gap-2"
                        >
                          <FiDownload /> Download Report
                        </button>

                        <div className="mt-auto bg-blue-50 text-blue-700 p-3 rounded-xl text-xs flex items-start gap-2">
                          <FiInfo className="mt-0.5 flex-shrink-0" />
                          <span>Ensure you pay before the 5th of next month to avoid late fees.</span>
                        </div>
                      </div>

                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Payment Modal */}
      {showPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl transform transition-all relative">
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-6 text-center text-white">
              <h3 className="text-xl font-black mb-1">Scan to Pay</h3>
              <p className="text-orange-100 text-sm font-medium">{paymentTitle}</p>
            </div>
            
            <div className="p-8 text-center flex flex-col items-center">
              <div className="w-48 h-48 bg-gray-100 rounded-2xl mb-6 flex items-center justify-center border-4 border-dashed border-gray-200 relative overflow-hidden">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=siyapg@upi&pn=SiyaPG&am=${paymentAmount}&cu=INR`} 
                  alt="UPI QR Code" 
                  className="w-40 h-40 opacity-90"
                />
              </div>
              
              <div className="mb-6">
                <p className="text-sm text-gray-500 uppercase font-bold tracking-wider mb-1">Amount to Pay</p>
                <p className="text-4xl font-black text-gray-800 tracking-tight">
                  ₹{paymentAmount.toLocaleString("en-IN")}
                </p>
              </div>

              <div className="bg-orange-50 text-orange-700 text-xs p-3 rounded-xl mb-6 font-medium">
                After payment, show the screenshot to the Admin to mark your bill(s) as PAID.
              </div>

              <button
                onClick={closePaymentModal}
                className="w-full py-3.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold transition-all text-sm uppercase tracking-wider"
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