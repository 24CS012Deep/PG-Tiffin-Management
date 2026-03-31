import { useEffect, useState } from "react";
import API from "../../utils/api";
import { FiDollarSign, FiDownload, FiCheckCircle, FiClock, FiAlertCircle, FiFileText } from "react-icons/fi";
import { MdReceiptLong } from "react-icons/md";

const RoomBills = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      setLoading(true);
      const res = await API.get("/student/billings");
      // Sort to show pending/overdue first, then by month
      const sorted = res.data.sort((a, b) => {
        if (a.status !== b.status) return a.status === 'pending' || a.status === 'overdue' ? -1 : 1;
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
SWADBOX PLATINUM INVOICE
=============================
Date Generated: ${new Date().toLocaleDateString('en-IN')}
Invoice ID:     ${bill._id}

BILLING PERIOD
-----------------------------
Month:  ${bill.month}
Type:   ${bill.type.toUpperCase()} Charges

SUMMARY
-----------------------------
Total Amount:   ₹${bill.amount}
Status:         ${bill.status.toUpperCase()}
${bill.paidAt ? `Paid On:        ${new Date(bill.paidAt).toLocaleDateString('en-IN')}` : 'Outstanding balance is due immediately.'}

Thank you for choosing SwadBox Premium Living!
    `;
    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Invoice_${bill.type}_${bill.month}.txt`;
    link.click();
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'paid': 
        return <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 w-max"><FiCheckCircle className="text-emerald-500"/> Paid</span>;
      case 'pending': 
        return <span className="bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 w-max"><FiClock className="text-amber-500"/> Pending</span>;
      case 'overdue': 
        return <span className="bg-red-50 text-red-700 border border-red-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 w-max"><FiAlertCircle className="text-red-500"/> Overdue</span>;
      default: 
        return <span className="bg-gray-100 text-gray-700 border border-gray-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider w-max">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-10 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold flex items-center gap-4 text-gray-800 tracking-tight">
            <span className="bg-gradient-to-r from-orange-400 to-amber-500 w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-200">
               <MdReceiptLong />
            </span>
            My Invoices
          </h1>
          <p className="text-gray-500 text-sm mt-2 ml-1 font-medium">View, download, and track your living and food expenses.</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-5 py-4 rounded-xl shadow-sm mb-8 font-medium">
          {error}
        </div>
      )}

      {bills.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-sm border border-dashed border-gray-300 p-16 text-center mt-10">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 relative">
             <MdReceiptLong className="text-5xl text-gray-300" />
             <div className="w-8 h-8 bg-green-100 text-green-500 rounded-full border-2 border-white absolute bottom-0 right-2 flex items-center justify-center shadow-sm">
                <FiCheckCircle className="text-sm" />
             </div>
          </div>
          <h2 className="text-2xl font-bold mb-3 text-gray-800">Clear Ledger</h2>
          <p className="text-gray-500 text-base max-w-sm mx-auto">You have no pending or past bills. Nice financial standing!</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
           {/* Desktop Table View */}
           <div className="hidden md:block overflow-x-auto">
             <table className="w-full text-left border-collapse">
               <thead>
                 <tr className="bg-gray-50/80 border-b border-gray-100 uppercase tracking-widest text-[#9ca3af] text-[10px] font-black">
                   <th className="px-8 py-5 rounded-tl-3xl leading-none">Billing Cycle</th>
                   <th className="px-6 py-5 leading-none">Charge Type</th>
                   <th className="px-6 py-5 leading-none">Total Amount</th>
                   <th className="px-6 py-5 leading-none">Payment Status</th>
                   <th className="px-8 py-5 text-right rounded-tr-3xl leading-none">Action</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-50">
                 {bills.map((bill) => (
                   <tr key={bill._id} className="hover:bg-orange-50/30 transition-colors group">
                     <td className="px-8 py-6">
                        <div className="font-bold text-gray-800 tracking-tight">{bill.month}</div>
                        {bill.paidAt && <div className="text-xs text-gray-400 mt-1">Paid {new Date(bill.paidAt).toLocaleDateString()}</div>}
                     </td>
                     
                     <td className="px-6 py-6 font-semibold uppercase text-xs tracking-wider text-gray-500">
                        <span className={`inline-block px-2 py-1 rounded-md ${bill.type === 'room' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                           {bill.type}
                        </span>
                     </td>
                     
                     <td className="px-6 py-6 font-black text-gray-800 tracking-tight">
                        ₹{bill.amount}
                     </td>
                     
                     <td className="px-6 py-6">
                        {getStatusBadge(bill.status)}
                     </td>
                     
                     <td className="px-8 py-6 text-right">
                        <button
                          onClick={() => downloadBill(bill)}
                          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 font-bold text-xs uppercase tracking-wider hover:border-orange-500 hover:bg-orange-50 hover:text-orange-600 transition-all group-hover:scale-105"
                        >
                          <FiDownload className="text-lg" /> Invoice
                        </button>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>

           {/* Mobile Card View */}
           <div className="md:hidden divide-y divide-gray-100">
             {bills.map((bill) => (
                <div key={bill._id} className="p-6 relative">
                  <div className="absolute right-6 top-6">{getStatusBadge(bill.status)}</div>
                  
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{bill.month}</div>
                  <div className="text-xl font-black text-gray-800 mb-4 capitalize flex items-center gap-2">
                     ₹{bill.amount} <span className="text-gray-300 font-light">&middot;</span> <span className={`text-sm ${bill.type === 'room' ? 'text-blue-500' : 'text-orange-500'}`}>{bill.type}</span>
                  </div>
                  
                  <button
                    onClick={() => downloadBill(bill)}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm bg-gray-50 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 transition-colors"
                  >
                    <FiDownload /> Download Invoice
                  </button>
                </div>
             ))}
           </div>
        </div>
      )}
    </div>
  );
};

export default RoomBills;