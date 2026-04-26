import { useEffect, useState } from "react";
import API from "../../utils/api";
import {
  FiCheckCircle,
  FiTrash2,
  FiSearch,
  FiFilter,
  FiRefreshCw,
  FiClock,
  FiAlertTriangle,
  FiFileText,
  FiMail,
  FiDownload,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiLoader,
  FiUser,
  FiCalendar,
  FiShoppingBag,
  FiHome,
  FiPrinter
} from "react-icons/fi";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { MdReceiptLong } from "react-icons/md";

const Billing = () => {
  const [billings, setBillings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sendingEmail, setSendingEmail] = useState(null);

  // NEW: Generate Bills state
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [periodType, setPeriodType] = useState("single"); // single, last, range
  const [singleMonth, setSingleMonth] = useState("");
  const [fromMonth, setFromMonth] = useState("");
  const [toMonth, setToMonth] = useState("");
  const [studentSelection, setStudentSelection] = useState("all"); // all, specific
  const [generateType, setGenerateType] = useState("monthly");
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchBillings();
  }, []);

  // Auto-dismiss success messages
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const fetchBillings = async () => {
    try {
      setLoading(true);
      const res = await API.get("/admin/billings");
      setBillings(res.data);
      setError("");
    } catch (err) {
      console.error("Failed to fetch billings:", err);
      setError("Failed to load billings");
    } finally {
      setLoading(false);
    }
  };

  const updateBillingStatus = async (id, status, paymentMethod = "") => {
    try {
      await API.put(`/admin/billings/${id}/status`, {
        status,
        paymentMethod,
        transactionId: `TXN${Date.now()}`,
      });
      fetchBillings();
      setSuccess(
        `Bill marked as ${status}${status === "paid" ? " — payment confirmation email sent!" : status === "overdue" ? " — overdue reminder email sent!" : ""}`
      );
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update billing");
    }
  };

  const deleteBilling = async (id) => {
    if (window.confirm("Are you sure you want to delete this bill?")) {
      try {
        await API.delete(`/admin/billings/${id}`);
        fetchBillings();
        setSuccess("Bill deleted successfully!");
      } catch (err) {
        alert(err.response?.data?.message || "Failed to delete billing");
      }
    }
  };

  const sendBillEmail = async (billing) => {
    setSendingEmail(billing._id);
    try {
      await API.post(`/admin/billings/${billing._id}/send-email`);
      setSuccess(`Bill email sent to ${billing.user?.name || "user"}!`);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send email");
    } finally {
      setSendingEmail(null);
    }
  };

  const handleGenerateBills = async (e) => {
    e.preventDefault();
    if (periodType === "single" && !singleMonth) return alert("Please select a month");
    if (periodType === "range" && (!fromMonth || !toMonth)) return alert("Please select from and to months");

    try {
      setGenerating(true);
      const payload = {
        periodType,
        singleMonth,
        fromMonth,
        toMonth,
        type: generateType,
        studentSelection,
        specificStudents: [] // Assuming all for now unless integrated with a multi-select
      };

      const res = await API.post("/admin/billings/generate", payload);

      setSuccess(res.data.message || `Successfully generated ${res.data.count || 0} bills`);
      setShowGenerateModal(false);

      // Reset filters to show new bills
      setStatusFilter("");
      setTypeFilter("");
      setSearchTerm("");
      setCurrentPage(1);

      fetchBillings();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to generate bills");
    } finally {
      setGenerating(false);
    }
  };

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

  const generatePdfBill = (billing) => {
    const doc = new jsPDF();
    const date = new Date().toLocaleDateString("en-IN", { dateStyle: "full" });
    const userName = billing.user?.name || "CLIENT";
    const userEmail = billing.user?.email || "N/A";
    
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
    doc.text(billing.type === "tiffin" ? "ORDER RECEIPT" : "MONTHLY INVOICE", 190, 35, { align: "right" });
    
    // Info Section
    doc.setTextColor(31, 41, 55);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("BILL TO:", 20, 65);
    doc.setFont("helvetica", "normal");
    doc.text(userName.toUpperCase(), 20, 72);
    doc.text(userEmail, 20, 77);
    
    if (billing.breakdown?.customerOrder?.address) {
      doc.setFont("helvetica", "bold");
      doc.text("DELIVERY ADDRESS:", 20, 87);
      doc.setFont("helvetica", "normal");
      const addr = billing.breakdown.customerOrder.address;
      const splitAddress = doc.splitTextToSize(addr, 80);
      doc.text(splitAddress, 20, 92);
    }
    
    doc.setFont("helvetica", "bold");
    doc.text("INVOICE DETAILS:", 130, 65);
    doc.setFont("helvetica", "normal");
    doc.text(`Invoice #: ${billing._id.substring(0, 8)}`, 130, 72);
    doc.text(`Period: ${formatMonth(billing.month)}`, 130, 77);
    doc.text(`Status: ${billing.status?.toUpperCase()}`, 130, 82);
    
    // Main Table Construction
    const tableBody = [];
    if (billing.breakdown?.customerOrder) {
      const order = billing.breakdown.customerOrder;
      tableBody.push([
        `Tiffin Order - ${order.planNumber || 'Plan'}`,
        `Items: ${order.items}\nQuantity: ${order.quantity}`,
        `INR ${billing.amount?.toLocaleString("en-IN")}`
      ]);
    } else if (billing.breakdown) {
      if (billing.breakdown.roomRent > 0) {
        tableBody.push(["Room Accommodation Rent", "Monthly", `INR ${billing.breakdown.roomRent.toLocaleString("en-IN")}`]);
      }
      if (billing.breakdown.foodCharges > 0) {
        const counts = billing.breakdown.mealCounts || {};
        const mealSummary = `Breakfast: ${counts.breakfast || 0}, Lunch: ${counts.lunch || 0}, Dinner: ${counts.dinner || 0}`;
        tableBody.push(["Tiffin & Meal Charges", mealSummary, `INR ${billing.breakdown.foodCharges.toLocaleString("en-IN")}`]);
      }
    } else {
      tableBody.push([
        billing.type?.toUpperCase() === "MONTHLY" ? "TIFFIN + ROOM (Consolidated)" : billing.type?.toUpperCase(),
        billing.details || billing.month,
        `INR ${billing.amount?.toLocaleString("en-IN")}`
      ]);
    }
    
    autoTable(doc, {
      startY: 110,
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
    if (billing.breakdown?.dailyRecords && billing.breakdown.dailyRecords.length > 0) {
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("DAILY MEAL CONSUMPTION LOG", 20, finalY);
      
      const mealData = billing.breakdown.dailyRecords.map(r => [
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
    doc.text(`Grand Total: INR ${billing.amount?.toLocaleString("en-IN")}`, 190, finalY, { align: "right" });
    
    // Footer
    doc.setDrawColor(229, 231, 235);
    doc.line(20, 275, 190, 275);
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175);
    doc.text("Thank you for choosing Siya PG. For queries, contact +91 XXXXX XXXXX.", 105, 282, { align: "center" });
    
    doc.save(`Bill_${userName}_${billing.month}.pdf`);
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case "paid":
        return {
          bg: "bg-emerald-50",
          text: "text-emerald-700",
          border: "border-emerald-200",
          dot: "bg-emerald-500",
          icon: <FiCheckCircle className="text-xs" />,
          label: "Paid",
        };
      case "pending":
      case "unpaid":
        return {
          bg: "bg-amber-50",
          text: "text-amber-700",
          border: "border-amber-200",
          dot: "bg-amber-500",
          icon: <FiClock className="text-xs" />,
          label: "Pending",
        };
      default:
        return {
          bg: "bg-gray-50",
          text: "text-gray-700",
          border: "border-gray-200",
          dot: "bg-gray-500",
          icon: null,
          label: status,
        };
    }
  };

  const getTypeConfig = (type) => {
    switch (type) {
      case "tiffin":
        return {
          bg: "bg-orange-100",
          text: "text-orange-700",
          label: <span className="flex items-center gap-1"><FiShoppingBag /> Tiffin</span>,
        };
      case "monthly":
        return {
          bg: "bg-orange-100",
          text: "text-orange-700",
          label: <span className="flex items-center gap-1"><FiHome /><FiShoppingBag /> Tiffin + Room</span>,
        };
      case "room":
        return { bg: "bg-violet-100", text: "text-violet-700", label: <span className="flex items-center gap-1"><FiHome /> Room</span> };
      case "mess":
        return { bg: "bg-blue-100", text: "text-blue-700", label: <span className="flex items-center gap-1"><FiShoppingBag /> Mess</span> };
      default:
        return {
          bg: "bg-gray-100",
          text: "text-gray-700",
          label: type || "Other",
        };
    }
  };

  // Summary stats
  const totalBills = billings.length;
  const totalAmount = billings.reduce((acc, b) => acc + (b.amount || 0), 0);
  const paidAmount = billings
    .filter((b) => b.status === "paid")
    .reduce((acc, b) => acc + (b.amount || 0), 0);
  const pendingAmount = billings
    .filter((b) => b.status === "pending" || b.status === "unpaid" || b.status === "overdue")
    .reduce((acc, b) => acc + (b.amount || 0), 0);

  // Filtering
  const filteredBillings = billings
    .filter((b) => {
      if (statusFilter === "paid") return b.status === "paid";
      if (!statusFilter) return b.status !== "paid"; // 'Active' view excludes 'Paid'
      return b.status === statusFilter;
    })
    .filter((b) => (typeFilter ? b.type === typeFilter : true))
    .filter(
      (b) =>
        searchTerm === "" ||
        b.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.month?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBillings = filteredBillings.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredBillings.length / itemsPerPage);

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        <p className="mt-4 text-gray-500">Loading billing records...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-3 text-gray-800">
              <span className="bg-gradient-to-r from-orange-400 to-orange-600 text-white p-2 rounded-xl shadow-lg">
                <MdReceiptLong />
              </span>
              Monthly Billing
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Track and manage all billing records, payments, and
              accounts.
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* View Toggle */}
            <div className="bg-white p-1 rounded-2xl border border-gray-100 flex shadow-sm h-fit">
              <button
                onClick={() => setStatusFilter("")}
                className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${!statusFilter || statusFilter !== "paid" ? "bg-slate-900 text-white shadow-md" : "text-slate-400 hover:text-slate-600"
                  }`}
              >
                <FiClock size={14} /> Active
              </button>
              <button
                onClick={() => setStatusFilter("paid")}
                className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${statusFilter === "paid" ? "bg-slate-900 text-white shadow-md" : "text-slate-400 hover:text-slate-600"
                  }`}
              >
                <FiCheckCircle size={14} /> History
              </button>
            </div>

            <button
              onClick={() => setShowGenerateModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-white bg-orange-500 rounded-xl hover:bg-orange-600 transition-all shadow-md shadow-orange-200 hover:-translate-y-0.5"
            >
              <MdReceiptLong /> Generate Bills
            </button>
            <button
              onClick={fetchBillings}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-orange-600 bg-orange-50 rounded-xl hover:bg-orange-100 transition-all"
            >
              <FiRefreshCw /> Refresh
            </button>
            <button
              onClick={async () => {
                if (window.confirm("Are you sure? This will delete all PAID bills older than 30 days.")) {
                  try {
                    const res = await API.post("/admin/billings/reset-history");
                    setSuccess(res.data.message);
                    fetchBillings();
                  } catch (err) {
                    setError("Failed to reset history");
                  }
                }
              }}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-all"
            >
              <FiTrash2 /> Reset History
            </button>
          </div>
        </div>
      </div>

      {/* Success / Error Alerts */}
      {success && (
        <div className="bg-emerald-50 border-l-4 border-emerald-500 text-emerald-700 px-5 py-3 rounded-r-xl mb-6 flex items-center gap-3 animate-fadeIn">
          <FiCheckCircle className="text-lg flex-shrink-0" />
          <span className="text-sm font-medium">{success}</span>
        </div>
      )}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-5 py-3 rounded-r-xl mb-6 flex items-center gap-3">
          <FiAlertTriangle className="text-lg flex-shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {[
          {
            label: "Total Bills",
            value: totalBills,
            icon: <FiFileText />,
            bg: "bg-gray-50",
            border: "border-gray-200",
            text: "text-gray-700",
            iconBg: "bg-gray-100",
          },
          {
            label: "Total Amount",
            value: `₹${totalAmount.toLocaleString("en-IN")}`,
            icon: <MdReceiptLong />,
            bg: "bg-orange-50",
            border: "border-orange-200",
            text: "text-orange-600",
            iconBg: "bg-orange-100",
          },
          {
            label: "Paid",
            value: `₹${paidAmount.toLocaleString("en-IN")}`,
            icon: <FiCheckCircle />,
            bg: "bg-emerald-50",
            border: "border-emerald-200",
            text: "text-emerald-600",
            iconBg: "bg-emerald-100",
          },
          {
            label: "Pending",
            value: `₹${pendingAmount.toLocaleString("en-IN")}`,
            icon: <FiClock />,
            bg: "bg-amber-50",
            border: "border-amber-200",
            text: "text-amber-600",
            iconBg: "bg-amber-100",
          },

        ].map((stat, idx) => (
          <div
            key={idx}
            className={`${stat.bg} border ${stat.border} rounded-2xl p-4 transition-all hover:shadow-lg hover:-translate-y-0.5`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`${stat.iconBg} ${stat.text} p-2 rounded-lg`}>
                {stat.icon}
              </div>
            </div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
              {stat.label}
            </p>
            <p className={`text-lg font-bold mt-0.5 ${stat.text}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email or month..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-lg focus:ring-2 focus:ring-orange-500 transition-all text-sm outline-none"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <FiX />
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-9 pr-4 py-2 bg-gray-50 border-none rounded-lg focus:ring-2 focus:ring-orange-500 text-sm outline-none appearance-none"
              >
                <option value="">All Status</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 bg-gray-50 border-none rounded-lg focus:ring-2 focus:ring-orange-500 text-sm outline-none"
            >
              <option value="">All Types</option>
              <option value="tiffin">Tiffin Only</option>
              <option value="monthly">Tiffin + Room</option>
            </select>
            <button
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("");
                setTypeFilter("");
                setCurrentPage(1);
              }}
              className="text-orange-500 hover:text-orange-600 text-sm flex items-center gap-1"
            >
              <FiRefreshCw /> Reset
            </button>
          </div>
        </div>
      </div>

      {/* Billing Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Month</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentBillings.length > 0 ? (
                currentBillings.map((billing) => {
                  const statusConfig = getStatusConfig(billing.status);
                  const typeConfig = getTypeConfig(billing.type);

                  return (
                    <tr
                      key={billing._id}
                      className="hover:bg-orange-50/30 transition-colors"
                    >
                      {/* User */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white font-bold text-xs shadow-sm flex-shrink-0">
                            {getInitials(billing.user?.name)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800 text-sm">
                              {billing.user?.name || "Unknown"}
                            </p>
                            <p className="text-gray-400 text-xs">
                              {billing.user?.email || ""}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 capitalize">
                          <FiUser className="text-[10px]" />
                          {billing.user?.role || "N/A"}
                        </span>
                      </td>

                      {/* Month */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-gray-700 text-sm font-medium">
                          <FiCalendar className="text-gray-400 text-xs" />
                          {billing.month}
                        </div>
                      </td>

                      {/* Type */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${typeConfig.bg} ${typeConfig.text}`}
                        >
                          {typeConfig.label}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="px-6 py-4">
                        <span className="text-orange-600 font-bold text-base">
                          ₹{billing.amount?.toLocaleString("en-IN")}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <div
                          className={`inline-flex items-center px-2 py-0.5 rounded border focus-within:ring-2 focus-within:ring-orange-500 ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
                        >
                          <select
                            value={billing.status}
                            onChange={(e) =>
                              updateBillingStatus(billing._id, e.target.value)
                            }
                            className="bg-transparent border-none text-xs font-bold uppercase tracking-wider pl-1 pr-6 py-1 appearance-none focus:outline-none cursor-pointer"
                            style={{
                              backgroundImage:
                                'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22currentColor%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")',
                              backgroundRepeat: "no-repeat",
                              backgroundPosition: "right 6px center",
                              backgroundSize: "8px auto",
                            }}
                          >
                            <option value="pending">Pending</option>
                            <option value="paid">Paid</option>
                          </select>
                        </div>
                        {billing.paidAt && (
                          <p className="text-[10px] text-gray-400 mt-1">
                            Paid:{" "}
                            {new Date(billing.paidAt).toLocaleDateString(
                              "en-IN"
                            )}
                          </p>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-1">
                          {/* Send Email */}
                          <button
                            onClick={() => sendBillEmail(billing)}
                            disabled={sendingEmail === billing._id}
                            className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Send Bill Email"
                          >
                            {sendingEmail === billing._id ? (
                              <FiLoader className="animate-spin" />
                            ) : (
                              <FiMail />
                            )}
                          </button>

                          {/* Download */}
                          <button
                            onClick={() => generatePdfBill(billing)}
                            className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Download PDF Bill"
                          >
                            <FiPrinter />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => deleteBilling(billing._id)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Bill"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mb-4">
                        <MdReceiptLong className="text-2xl text-orange-400" />
                      </div>
                      <p className="text-base font-medium text-gray-800">
                        No billing records found
                      </p>
                      <p className="text-sm mt-1">
                        {searchTerm || statusFilter || typeFilter
                          ? "Try adjusting your search or filters."
                          : 'Click "Generate Bills" to create monthly bills.'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50">
            <p className="text-sm text-gray-500">
              Showing {indexOfFirstItem + 1} to{" "}
              {Math.min(indexOfLastItem, filteredBillings.length)} of{" "}
              {filteredBillings.length} records
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiChevronLeft />
              </button>
              <span className="px-4 py-2 text-sm font-medium text-orange-600 bg-orange-50 rounded-lg">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiChevronRight />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Generate Bills Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden relative border border-gray-100">
            <div className="px-8 py-5 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-orange-50 to-amber-50">
              <h3 className="text-xl font-black text-gray-800 flex items-center gap-3">
                <span className="p-2 bg-orange-500 text-white rounded-lg shadow-md">
                  <MdReceiptLong />
                </span>
                Generate Bills
              </h3>
              <button
                onClick={() => setShowGenerateModal(false)}
                className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-xl transition-colors"
              >
                <FiX className="text-xl" />
              </button>
            </div>

            <form onSubmit={handleGenerateBills} className="p-8">
              <div className="space-y-6">
                {/* 1. Select Billing Period Type */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <FiCalendar className="text-orange-500" /> 1. Billing Period
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[{ id: 'last', label: 'Last Month' }, { id: 'single', label: 'Single Month' }, { id: 'range', label: 'Date Range' }].map(t => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setPeriodType(t.id)}
                        className={`py-3 px-4 rounded-xl border-2 font-bold text-sm transition-all text-center ${periodType === t.id
                          ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-sm'
                          : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                          }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Date Selection based on Type */}
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  {periodType === 'last' && (
                    <div className="flex items-center gap-3 text-orange-700 font-semibold text-sm">
                      <FiCheckCircle className="text-xl text-orange-500" />
                      Bills will be generated for the previous calendar month.
                    </div>
                  )}
                  {periodType === 'single' && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Select Month</label>
                      <input
                        type="month"
                        required
                        value={singleMonth}
                        onChange={(e) => setSingleMonth(e.target.value)}
                        className="w-full md:w-1/2 px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none text-sm font-medium"
                      />
                    </div>
                  )}
                  {periodType === 'range' && (
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">From Month</label>
                        <input
                          type="month"
                          required
                          value={fromMonth}
                          onChange={(e) => setFromMonth(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none text-sm font-medium"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">To Month</label>
                        <input
                          type="month"
                          required
                          value={toMonth}
                          onChange={(e) => setToMonth(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none text-sm font-medium"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Student Selection */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <FiUser className="text-orange-500" /> 2. Target Students
                  </label>
                  <div className="flex gap-3">
                    <label className="flex items-center gap-2 cursor-pointer p-3 border-2 border-gray-100 rounded-xl flex-1 hover:bg-gray-50 transition-colors">
                      <input
                        type="radio"
                        name="studentSel"
                        checked={studentSelection === "all"}
                        onChange={() => setStudentSelection("all")}
                        className="w-4 h-4 text-orange-500 focus:ring-orange-500"
                      />
                      <span className="font-semibold text-sm text-gray-700">All Active Students</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer p-3 border-2 border-gray-100 rounded-xl flex-1 hover:bg-gray-50 transition-colors opacity-60">
                      <input
                        type="radio"
                        name="studentSel"
                        disabled
                        className="w-4 h-4 text-orange-500 focus:ring-orange-500"
                      />
                      <span className="font-semibold text-sm text-gray-700">Specific Students (Coming soon)</span>
                    </label>
                  </div>
                </div>

                {/* 4. Bill Type */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <FiShoppingBag className="text-orange-500" /> 3. Bill Content
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setGenerateType('monthly')}
                      className={`py-3 px-4 rounded-xl border-2 font-bold text-sm flex flex-col items-center justify-center gap-1 transition-all ${generateType === 'monthly'
                        ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-sm'
                        : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                        }`}
                    >
                      <div className="flex gap-1"><FiHome /><FiShoppingBag /></div>
                      Tiffin + Room
                      <span className="text-[10px] font-normal uppercase tracking-wider">Rent + Food</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setGenerateType('tiffin')}
                      className={`py-3 px-4 rounded-xl border-2 font-bold text-sm flex flex-col items-center justify-center gap-1 transition-all ${generateType === 'tiffin'
                        ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-sm'
                        : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                        }`}
                    >
                      <FiShoppingBag className={generateType === 'tiffin' ? 'text-orange-500' : ''} />
                      Tiffin Only
                      <span className="text-[10px] font-normal uppercase tracking-wider">Food Meals</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="mt-8 pt-6 border-t border-gray-100 flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  className="flex-1 px-4 py-3.5 rounded-xl border-2 border-gray-200 text-gray-600 font-bold hover:bg-gray-50 hover:border-gray-300 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={generating || (periodType === 'single' && !singleMonth) || (periodType === 'range' && (!fromMonth || !toMonth))}
                  className="flex-[2] px-4 py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black transition-all shadow-lg shadow-orange-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
                >
                  {generating ? (
                    <><FiLoader className="animate-spin text-xl" /> Generating...</>
                  ) : (
                    'Generate Bills Now'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Billing;
