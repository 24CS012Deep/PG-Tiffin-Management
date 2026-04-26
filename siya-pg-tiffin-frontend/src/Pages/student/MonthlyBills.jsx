import { useEffect, useState } from "react";
import API from "../../utils/api";
import {
  FiPrinter, FiCheckCircle, FiAlertCircle, FiClock,
  FiRefreshCw, FiCalendar, FiInfo
} from "react-icons/fi";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { MdReceiptLong } from "react-icons/md";

const MonthlyBills = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [view, setView] = useState("active"); // 'active' or 'history'
  
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





  const formatMonth = (monthStr) => {
    if (!monthStr) return "N/A";
    if (monthStr.includes(" ")) return monthStr;
    const [year, month] = monthStr.split("-");
    if (year && month) {
      const date = new Date(year, parseInt(month) - 1);
      return date.toLocaleString("en-IN", { month: "long", year: "numeric" });
    }
    return monthStr;
  };

  const handleDownloadPDF = (bill) => {
    const doc = new jsPDF();
    const date = new Date().toLocaleDateString("en-IN", { dateStyle: "full" });
    const userName = bill.user?.name || "STUDENT";
    const userEmail = bill.user?.email || "N/A";
    
    // Header
    doc.setFillColor(31, 41, 55); 
    doc.rect(0, 0, 210, 50, "F");
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(26);
    doc.setFont("helvetica", "bold");
    doc.text("SIYA PG", 20, 30);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("PREMIUM ACCOMMODATION & TIFFIN SERVICES", 20, 38);
    
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("MONTHLY INVOICE", 190, 35, { align: "right" });
    
    // Info Section
    doc.setTextColor(31, 41, 55);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("BILL TO:", 20, 65);
    doc.setFont("helvetica", "normal");
    doc.text(userName.toUpperCase(), 20, 72);
    doc.text(userEmail, 20, 77);
    
    doc.setFont("helvetica", "bold");
    doc.text("INVOICE DETAILS:", 130, 65);
    doc.setFont("helvetica", "normal");
    doc.text(`Invoice #: ${bill._id.substring(0, 8)}`, 130, 72);
    doc.text(`Period: ${formatMonth(bill.month)}`, 130, 77);
    doc.text(`Status: ${bill.status?.toUpperCase()}`, 130, 82);
    
    // Main Table Construction
    const tableBody = [];
    if (bill.breakdown) {
      if (bill.breakdown.roomRent > 0) {
        tableBody.push(["Room Accommodation Rent", "Monthly", `INR ${bill.breakdown.roomRent.toLocaleString("en-IN")}`]);
      }
      if (bill.breakdown.foodCharges > 0) {
        const counts = bill.breakdown.mealCounts || {};
        const mealSummary = `Breakfast: ${counts.breakfast || 0}, Lunch: ${counts.lunch || 0}, Dinner: ${counts.dinner || 0}`;
        tableBody.push(["Tiffin & Meal Charges", mealSummary, `INR ${bill.breakdown.foodCharges.toLocaleString("en-IN")}`]);
      }
    } else {
      tableBody.push([
        bill.type?.toUpperCase() === "MONTHLY" ? "TIFFIN + ROOM (Consolidated)" : bill.type?.toUpperCase(),
        formatMonth(bill.month),
        `INR ${bill.amount?.toLocaleString("en-IN")}`
      ]);
    }
    
    autoTable(doc, {
      startY: 95,
      head: [["Service Description", "Details / Period", "Subtotal"]],
      body: tableBody,
      theme: "grid",
      headStyles: { fillColor: [249, 115, 22], textColor: [255, 255, 255] },
      bodyStyles: { fontSize: 10, cellPadding: 6 },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 70 },
        2: { halign: "right", fontStyle: "bold", cellWidth: 40 }
      }
    });

    let finalY = doc.lastAutoTable.finalY + 15;

    // Detailed Daily Breakdown (If available)
    if (bill.breakdown?.dailyRecords && bill.breakdown.dailyRecords.length > 0) {
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("DAILY MEAL CONSUMPTION LOG", 20, finalY);
      
      const mealData = bill.breakdown.dailyRecords.map(r => [
        `Day ${r.day}`,
        r.breakfast ? "Y" : "-",
        r.lunch ? "Y" : "-",
        r.dinner ? "Y" : "-",
        `INR ${r.dailyTotal}`
      ]);

      autoTable(doc, {
        startY: finalY + 5,
        head: [["Day", "Brkfst", "Lunch", "Dinner", "Daily Amt"]],
        body: mealData,
        theme: "striped",
        headStyles: { fillColor: [75, 85, 99], fontSize: 8 },
        bodyStyles: { fontSize: 8, cellPadding: 3 },
        margin: { left: 20, right: 20 }
      });
      finalY = doc.lastAutoTable.finalY + 15;
    }
    
    // Total
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(249, 115, 22);
    doc.text(`Grand Total: INR ${bill.amount?.toLocaleString("en-IN")}`, 190, finalY, { align: "right" });
    
    // Footer
    doc.setDrawColor(229, 231, 235);
    doc.line(20, 275, 190, 275);
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175);
    doc.text("Thank you for choosing Siya PG. This is a computer generated invoice.", 105, 282, { align: "center" });
    
    doc.save(`Invoice_${bill.month}.pdf`);
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case "paid":
        return { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", icon: <FiCheckCircle className="text-[10px]" />, label: "Paid" };
      case "pending":
      case "unpaid":
      case "overdue":
        return { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", icon: <FiClock className="text-[10px]" />, label: "Pending" };
      default:
        return { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200", label: status };
    }
  };

  const getTypeConfig = (type) => {
    switch (type) {
      case "tiffin":
      case "monthly":
      case "room":
        return { bg: "bg-orange-100", text: "text-orange-700", label: "Tiffin + Room" };
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
    .filter(r => r.type === "tiffin" || r.type === "room" || r.type === "monthly");

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



      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-xl mb-8 font-bold flex items-center gap-3">
          <FiAlertCircle /> {error}
        </div>
      )}



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
                          {formatMonth(billing.month)}
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

                          <button
                            onClick={() => handleDownloadPDF(billing)}
                            className="p-3 bg-white border-2 border-gray-100 text-gray-500 rounded-xl hover:border-orange-500 hover:text-orange-600 transition-all group/dl"
                            title="Download PDF Receipt"
                          >
                            <FiPrinter className="group-hover/dl:scale-110 transition-transform" />
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
                        {view === "active" ? "No active bills found." : "No payment history found."}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>


    </div>
  );
};

export default MonthlyBills;
