import { useState, useRef } from "react";
import API from "../../utils/api";
import {
  FiCalendar,
  FiDownload,
  FiPrinter,
  FiFileText,
  FiUsers,
  FiDollarSign,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiChevronDown,
  FiChevronUp,
  FiTrendingUp,
  FiPackage,
  FiXCircle,
  FiSearch,
  FiLoader,
  FiFilter,
} from "react-icons/fi";

const GenerateBills = () => {
  const [preset, setPreset] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");
  const [expandedCustomer, setExpandedCustomer] = useState(null);
  const [activeTab, setActiveTab] = useState("summary");
  const [searchTerm, setSearchTerm] = useState("");
  const printRef = useRef(null);

  const presetOptions = [
    { value: "30", label: "Last 30 Days", icon: <FiCalendar className="text-orange-500" />, desc: "1 Month" },
    { value: "60", label: "Last 60 Days", icon: <FiCalendar className="text-orange-500" />, desc: "2 Months" },
    { value: "90", label: "Last 90 Days", icon: <FiCalendar className="text-orange-500" />, desc: "3 Months" },
  ];

  const handlePresetSelect = (value) => {
    setPreset(value);
    setStartDate("");
    setEndDate("");
  };

  const handleCustomDateChange = () => {
    setPreset("");
  };

  const handleGenerateReport = async () => {
    setError("");

    if (!preset && (!startDate || !endDate)) {
      setError("Please select a time period or enter custom date range");
      return;
    }

    try {
      setLoading(true);
      const payload = preset
        ? { preset }
        : { startDate, endDate };

      const res = await API.post("/admin/billings/generate-report", payload);
      setReport(res.data);
      setActiveTab("summary");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to generate bill report");
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const params = preset
        ? { preset }
        : { startDate, endDate };

      const queryString = new URLSearchParams(params).toString();
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${process.env.REACT_APP_API_URL || "http://localhost:5000/api"}/admin/billings/export-csv?${queryString}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) throw new Error("Export failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `SwadBox_Bill_Report.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError("Failed to export CSV: " + err.message);
    }
  };

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const win = window.open("", "", "width=1000,height=800");
    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>SwadBox Bill Report</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1f2937; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #f97316; padding-bottom: 20px; }
          .header h1 { color: #f97316; font-size: 28px; margin-bottom: 5px; }
          .header p { color: #6b7280; font-size: 14px; }
          .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 30px; }
          .stat-card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; text-align: center; }
          .stat-card .label { font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; }
          .stat-card .value { font-size: 22px; font-weight: 700; color: #1f2937; margin-top: 5px; }
          .stat-card .value.orange { color: #f97316; }
          .stat-card .value.green { color: #16a34a; }
          .stat-card .value.yellow { color: #ca8a04; }
          .stat-card .value.red { color: #dc2626; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
          th { background: #f97316; color: white; padding: 10px 8px; text-align: left; }
          td { padding: 8px; border-bottom: 1px solid #e5e7eb; }
          tr:nth-child(even) { background: #fef3e2; }
          .section-title { font-size: 18px; font-weight: 600; margin: 25px 0 10px; color: #1f2937; border-left: 4px solid #f97316; padding-left: 10px; }
          .footer { margin-top: 40px; text-align: center; color: #9ca3af; font-size: 12px; border-top: 1px solid #e5e7eb; padding-top: 15px; }
          .badge { padding: 2px 8px; border-radius: 10px; font-size: 10px; font-weight: 600; display: inline-block; }
          .badge-green { background: #dcfce7; color: #16a34a; }
          .badge-yellow { background: #fef9c3; color: #ca8a04; }
          .badge-red { background: #fee2e2; color: #dc2626; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📦 SwadBox - Bill Report</h1>
          <p>Generated on ${new Date().toLocaleDateString("en-IN", { dateStyle: "full" })}</p>
          <p>Period: ${report?.dateRange?.label} (${new Date(report?.dateRange?.start).toLocaleDateString("en-IN")} – ${new Date(report?.dateRange?.end).toLocaleDateString("en-IN")})</p>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="label">Total Bill Amount</div>
            <div class="value orange">₹${report?.summary?.totalBillAmount?.toLocaleString("en-IN")}</div>
          </div>
          <div class="stat-card">
            <div class="label">Paid Amount</div>
            <div class="value green">₹${report?.summary?.totalPaidAmount?.toLocaleString("en-IN")}</div>
          </div>
          <div class="stat-card">
            <div class="label">Pending Amount</div>
            <div class="value yellow">₹${report?.summary?.totalPendingAmount?.toLocaleString("en-IN")}</div>
          </div>
          <div class="stat-card">
            <div class="label">Total Orders</div>
            <div class="value">${report?.summary?.totalOrdersCount}</div>
          </div>
        </div>

        <div class="section-title">Transaction Details</div>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Customer</th>
              <th>Email</th>
              <th>Plan</th>
              <th>Date</th>
              <th>Qty</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Payment</th>
            </tr>
          </thead>
          <tbody>
            ${report?.transactions
              ?.map(
                (t, i) => `
              <tr>
                <td>${i + 1}</td>
                <td>${t.customerName}</td>
                <td>${t.customerEmail}</td>
                <td>${t.planName}</td>
                <td>${new Date(t.date).toLocaleDateString("en-IN")}</td>
                <td>${t.quantity}</td>
                <td>₹${t.totalAmount}</td>
                <td><span class="badge ${t.status === "completed" ? "badge-green" : t.status === "cancelled" ? "badge-red" : "badge-yellow"}">${t.status}</span></td>
                <td><span class="badge ${t.paymentStatus === "paid" ? "badge-green" : t.paymentStatus === "failed" ? "badge-red" : "badge-yellow"}">${t.paymentStatus}</span></td>
              </tr>
            `
              )
              .join("") || "<tr><td colspan='9' style='text-align:center;padding:20px;'>No transactions found</td></tr>"}
          </tbody>
        </table>

        <div class="footer">
          <p>SwadBox PG & Tiffin Management System &copy; ${new Date().getFullYear()}</p>
          <p>This is a computer-generated report and does not require a signature.</p>
        </div>
      </body>
      </html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => {
      win.print();
      win.close();
    }, 500);
  };

  const handleDownloadPDF = () => {
    // Use browser print-to-PDF functionality  
    handlePrint();
  };

  const getStatusBadge = (status) => {
    const styles = {
      paid: "bg-emerald-100 text-emerald-700 border border-emerald-200",
      completed: "bg-emerald-100 text-emerald-700 border border-emerald-200",
      pending: "bg-amber-100 text-amber-700 border border-amber-200",
      live: "bg-blue-100 text-blue-700 border border-blue-200",
      overdue: "bg-red-100 text-red-700 border border-red-200",
      cancelled: "bg-red-100 text-red-700 border border-red-200",
      failed: "bg-red-100 text-red-700 border border-red-200",
    };
    return `px-2.5 py-0.5 rounded-full text-xs font-semibold ${styles[status] || "bg-gray-100 text-gray-700"}`;
  };

  const filteredTransactions = report?.transactions?.filter(
    (t) =>
      t.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.planName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCustomers = report?.customerBreakdown?.filter(
    (c) =>
      c.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.customer?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen" ref={printRef}>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
              <span className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-2.5 rounded-xl shadow-lg shadow-orange-200">
                <FiFileText className="text-xl" />
              </span>
              Generate Bills
            </h1>
            <p className="text-gray-500 mt-1 text-sm">
              Generate & review consolidated billing reports for any time period
            </p>
          </div>
          {report && (
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-medium transition-all shadow-md shadow-emerald-200 hover:shadow-lg hover:-translate-y-0.5"
              >
                <FiDownload className="text-base" /> CSV
              </button>
              <button
                onClick={handleDownloadPDF}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-medium transition-all shadow-md shadow-blue-200 hover:shadow-lg hover:-translate-y-0.5"
              >
                <FiFileText className="text-base" /> PDF
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2.5 bg-violet-500 hover:bg-violet-600 text-white rounded-xl text-sm font-medium transition-all shadow-md shadow-violet-200 hover:shadow-lg hover:-translate-y-0.5"
              >
                <FiPrinter className="text-base" /> Print
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Filter Controls Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6 hover:shadow-md transition-shadow">
        <div className="flex items-center gap-2 mb-5">
          <FiFilter className="text-orange-500 text-lg" />
          <h2 className="font-semibold text-gray-800 text-lg">Select Time Period</h2>
        </div>

        {/* Preset Options */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {presetOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handlePresetSelect(opt.value)}
              className={`relative overflow-hidden group p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                preset === opt.value
                  ? "border-orange-500 bg-gradient-to-br from-orange-50 to-orange-100 shadow-lg shadow-orange-100"
                  : "border-gray-200 hover:border-orange-300 hover:bg-orange-50/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{opt.icon}</span>
                <div>
                  <p className={`font-semibold text-sm ${preset === opt.value ? "text-orange-700" : "text-gray-700"}`}>
                    {opt.label}
                  </p>
                  <p className={`text-xs mt-0.5 ${preset === opt.value ? "text-orange-500" : "text-gray-400"}`}>
                    {opt.desc}
                  </p>
                </div>
              </div>
              {preset === opt.value && (
                <div className="absolute top-2 right-2">
                  <FiCheckCircle className="text-orange-500 text-lg" />
                </div>
              )}
              <div
                className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r from-orange-400 to-orange-600 transition-all duration-500 ${
                  preset === opt.value ? "w-full" : "w-0 group-hover:w-full"
                }`}
              />
            </button>
          ))}
        </div>

        {/* OR Divider */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider bg-white px-3">or choose custom range</span>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
        </div>

        {/* Custom Date Range */}
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-600 mb-1.5">
              <FiCalendar className="inline mr-1 text-orange-500" />
              From Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                handleCustomDateChange();
              }}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-600 mb-1.5">
              <FiCalendar className="inline mr-1 text-orange-500" />
              To Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                handleCustomDateChange();
              }}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all"
            />
          </div>
          <button
            onClick={handleGenerateReport}
            disabled={loading}
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-2.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-orange-200 hover:shadow-xl hover:-translate-y-0.5 whitespace-nowrap"
          >
            {loading ? (
              <>
                <FiLoader className="animate-spin" /> Generating...
              </>
            ) : (
              <>
                <FiTrendingUp /> Generate Report
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-5 py-4 rounded-r-xl mb-6 flex items-center gap-3 animate-fadeIn">
          <FiAlertCircle className="text-xl flex-shrink-0" />
          <div>
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Report Results */}
      {report && (
        <div className="space-y-6 animate-fadeIn">
          {/* Date Range Banner */}
          <div className="bg-gradient-to-r from-orange-500 via-orange-500 to-amber-500 rounded-2xl p-5 text-white shadow-xl shadow-orange-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <p className="text-orange-100 text-xs font-medium uppercase tracking-wider">Report Period</p>
                <h3 className="text-xl font-bold mt-1">{report.dateRange.label}</h3>
                <p className="text-orange-100 text-sm mt-0.5">
                  {new Date(report.dateRange.start).toLocaleDateString("en-IN", { dateStyle: "long" })}
                  {" → "}
                  {new Date(report.dateRange.end).toLocaleDateString("en-IN", { dateStyle: "long" })}
                </p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 text-sm font-medium">
                {report.summary.uniqueCustomers} Customer{report.summary.uniqueCustomers !== 1 ? "s" : ""}
              </div>
            </div>
          </div>

          {/* Summary Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: "Total Bill Amount",
                value: `₹${report.summary.totalBillAmount?.toLocaleString("en-IN")}`,
                icon: <FiDollarSign />,
                color: "orange",
                bgCl: "bg-orange-50",
                textCl: "text-orange-600",
                borderCl: "border-orange-200",
                shadowCl: "shadow-orange-100",
              },
              {
                label: "Paid Amount",
                value: `₹${report.summary.totalPaidAmount?.toLocaleString("en-IN")}`,
                icon: <FiCheckCircle />,
                color: "green",
                bgCl: "bg-emerald-50",
                textCl: "text-emerald-600",
                borderCl: "border-emerald-200",
                shadowCl: "shadow-emerald-100",
              },
              {
                label: "Pending Amount",
                value: `₹${report.summary.totalPendingAmount?.toLocaleString("en-IN")}`,
                icon: <FiClock />,
                color: "yellow",
                bgCl: "bg-amber-50",
                textCl: "text-amber-600",
                borderCl: "border-amber-200",
                shadowCl: "shadow-amber-100",
              },
              {
                label: "Total Orders",
                value: report.summary.totalOrdersCount,
                icon: <FiPackage />,
                color: "blue",
                bgCl: "bg-blue-50",
                textCl: "text-blue-600",
                borderCl: "border-blue-200",
                shadowCl: "shadow-blue-100",
              },
            ].map((stat, idx) => (
              <div
                key={idx}
                className={`${stat.bgCl} border ${stat.borderCl} rounded-2xl p-5 transition-all hover:shadow-lg ${stat.shadowCl} hover:-translate-y-1`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className={`${stat.textCl} text-xl`}>{stat.icon}</span>
                </div>
                <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">{stat.label}</p>
                <p className={`text-2xl font-bold mt-1 ${stat.textCl}`}>{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Order Status Mini Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
              <div className="bg-blue-100 text-blue-600 p-2.5 rounded-lg">
                <FiPackage className="text-lg" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Live</p>
                <p className="text-lg font-bold text-gray-900">{report.summary.liveOrders}</p>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
              <div className="bg-emerald-100 text-emerald-600 p-2.5 rounded-lg">
                <FiCheckCircle className="text-lg" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Completed</p>
                <p className="text-lg font-bold text-gray-900">{report.summary.completedOrders}</p>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
              <div className="bg-red-100 text-red-600 p-2.5 rounded-lg">
                <FiXCircle className="text-lg" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Cancelled</p>
                <p className="text-lg font-bold text-gray-900">{report.summary.cancelledOrders}</p>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex border-b border-gray-100">
              {[
                { id: "summary", label: "Bill Summary", icon: <FiFileText /> },
                { id: "transactions", label: "Transactions", icon: <FiDollarSign /> },
                { id: "customers", label: "Customer Breakdown", icon: <FiUsers /> },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 px-4 py-3.5 text-sm font-medium flex items-center justify-center gap-2 transition-all relative ${
                    activeTab === tab.id
                      ? "text-orange-600 bg-orange-50/50"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {tab.icon} {tab.label}
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-400 to-orange-600" />
                  )}
                </button>
              ))}
            </div>

            {/* Search Bar for Transactions and Customers tabs */}
            {(activeTab === "transactions" || activeTab === "customers") && (
              <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                <div className="relative max-w-md">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name, email, or plan..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all"
                  />
                </div>
              </div>
            )}

            {/* Tab Content */}
            <div className="p-5">
              {/* Summary Tab */}
              {activeTab === "summary" && (
                <div className="space-y-6">
                  {/* Revenue Breakdown */}
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <FiTrendingUp className="text-orange-500" /> Revenue Breakdown
                    </h3>
                    <div className="space-y-3">
                      {[
                        {
                          label: "Paid Revenue",
                          value: report.summary.totalPaidAmount,
                          total: report.summary.totalBillAmount,
                          color: "bg-emerald-500",
                          bgColor: "bg-emerald-100",
                        },
                        {
                          label: "Pending Revenue",
                          value: report.summary.totalPendingAmount,
                          total: report.summary.totalBillAmount,
                          color: "bg-amber-500",
                          bgColor: "bg-amber-100",
                        },
                        {
                          label: "Failed Revenue",
                          value: report.summary.totalFailedAmount,
                          total: report.summary.totalBillAmount,
                          color: "bg-red-500",
                          bgColor: "bg-red-100",
                        },
                      ].map((item, idx) => {
                        const pct = item.total > 0 ? ((item.value / item.total) * 100).toFixed(1) : 0;
                        return (
                          <div key={idx}>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm text-gray-600">{item.label}</span>
                              <span className="text-sm font-semibold">
                                ₹{item.value?.toLocaleString("en-IN")} ({pct}%)
                              </span>
                            </div>
                            <div className={`w-full ${item.bgColor} rounded-full h-2.5`}>
                              <div
                                className={`${item.color} h-2.5 rounded-full transition-all duration-1000`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Billing Records */}
                  {report.billingRecords?.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <FiFileText className="text-orange-500" /> Billing Records
                      </h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="px-4 py-3 text-left font-semibold text-gray-600 text-xs uppercase tracking-wider">User</th>
                              <th className="px-4 py-3 text-left font-semibold text-gray-600 text-xs uppercase tracking-wider">Role</th>
                              <th className="px-4 py-3 text-left font-semibold text-gray-600 text-xs uppercase tracking-wider">Month</th>
                              <th className="px-4 py-3 text-left font-semibold text-gray-600 text-xs uppercase tracking-wider">Type</th>
                              <th className="px-4 py-3 text-left font-semibold text-gray-600 text-xs uppercase tracking-wider">Amount</th>
                              <th className="px-4 py-3 text-left font-semibold text-gray-600 text-xs uppercase tracking-wider">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {report.billingRecords.map((b, idx) => (
                              <tr key={idx} className="hover:bg-orange-50/30 transition-colors">
                                <td className="px-4 py-3">
                                  <p className="font-medium text-gray-900">{b.userName}</p>
                                  <p className="text-xs text-gray-400">{b.userEmail}</p>
                                </td>
                                <td className="px-4 py-3">
                                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs capitalize">{b.userRole}</span>
                                </td>
                                <td className="px-4 py-3 text-gray-700">{b.month}</td>
                                <td className="px-4 py-3">
                                  <span className="px-2 py-0.5 bg-orange-100 text-orange-600 rounded-full text-xs capitalize">{b.type}</span>
                                </td>
                                <td className="px-4 py-3 font-semibold text-gray-900">₹{b.amount?.toLocaleString("en-IN")}</td>
                                <td className="px-4 py-3">
                                  <span className={getStatusBadge(b.status)}>{b.status}</span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Transactions Tab */}
              {activeTab === "transactions" && (
                <div className="overflow-x-auto">
                  {filteredTransactions?.length > 0 ? (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-4 py-3 text-left font-semibold text-gray-600 text-xs uppercase tracking-wider">#</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-600 text-xs uppercase tracking-wider">Customer</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-600 text-xs uppercase tracking-wider">Plan</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-600 text-xs uppercase tracking-wider">Date</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-600 text-xs uppercase tracking-wider">Qty</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-600 text-xs uppercase tracking-wider">Amount</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-600 text-xs uppercase tracking-wider">Status</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-600 text-xs uppercase tracking-wider">Payment</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-600 text-xs uppercase tracking-wider">Delivery</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredTransactions.map((t, idx) => (
                          <tr key={idx} className="hover:bg-orange-50/30 transition-colors">
                            <td className="px-4 py-3 text-gray-400 font-mono text-xs">{idx + 1}</td>
                            <td className="px-4 py-3">
                              <p className="font-medium text-gray-900">{t.customerName}</p>
                              <p className="text-xs text-gray-400">{t.customerEmail}</p>
                            </td>
                            <td className="px-4 py-3 text-gray-700">{t.planName}</td>
                            <td className="px-4 py-3 text-gray-700">
                              {new Date(t.date).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                            </td>
                            <td className="px-4 py-3 text-gray-700">{t.quantity}</td>
                            <td className="px-4 py-3 font-semibold text-gray-900">₹{t.totalAmount?.toLocaleString("en-IN")}</td>
                            <td className="px-4 py-3">
                              <span className={getStatusBadge(t.status)}>{t.status}</span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={getStatusBadge(t.paymentStatus)}>{t.paymentStatus}</span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs capitalize">{t.deliveryTime}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="text-center py-16">
                      <FiPackage className="mx-auto text-4xl text-gray-300 mb-3" />
                      <p className="text-gray-500 font-medium">No transactions found</p>
                      <p className="text-gray-400 text-sm mt-1">
                        {searchTerm ? "Try a different search term" : "No orders in the selected period"}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Customer Breakdown Tab */}
              {activeTab === "customers" && (
                <div className="space-y-3">
                  {filteredCustomers?.length > 0 ? (
                    filteredCustomers.map((cust, idx) => (
                      <div
                        key={idx}
                        className="border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-all"
                      >
                        {/* Customer Header */}
                        <button
                          onClick={() =>
                            setExpandedCustomer(expandedCustomer === idx ? null : idx)
                          }
                          className="w-full p-4 flex items-center justify-between hover:bg-orange-50/30 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                              {cust.customer.name?.charAt(0)?.toUpperCase() || "?"}
                            </div>
                            <div className="text-left">
                              <p className="font-semibold text-gray-900">{cust.customer.name}</p>
                              <p className="text-xs text-gray-400">{cust.customer.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-right hidden sm:block">
                              <p className="text-xs text-gray-400">Orders</p>
                              <p className="font-semibold text-gray-700">{cust.orderCount}</p>
                            </div>
                            <div className="text-right hidden sm:block">
                              <p className="text-xs text-gray-400">Paid</p>
                              <p className="font-semibold text-emerald-600">₹{cust.paidAmount?.toLocaleString("en-IN")}</p>
                            </div>
                            <div className="text-right hidden sm:block">
                              <p className="text-xs text-gray-400">Pending</p>
                              <p className="font-semibold text-amber-600">₹{cust.pendingAmount?.toLocaleString("en-IN")}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-400">Total</p>
                              <p className="font-bold text-orange-600 text-lg">₹{cust.totalAmount?.toLocaleString("en-IN")}</p>
                            </div>
                            {expandedCustomer === idx ? (
                              <FiChevronUp className="text-gray-400" />
                            ) : (
                              <FiChevronDown className="text-gray-400" />
                            )}
                          </div>
                        </button>

                        {/* Expanded Order Details */}
                        {expandedCustomer === idx && (
                          <div className="border-t border-gray-100 bg-gray-50/50 p-4">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                              <div className="bg-white rounded-lg p-3 border border-gray-100">
                                <p className="text-xs text-gray-400">Phone</p>
                                <p className="font-medium text-sm">{cust.customer.phone || "N/A"}</p>
                              </div>
                              <div className="bg-white rounded-lg p-3 border border-gray-100">
                                <p className="text-xs text-gray-400">Role</p>
                                <p className="font-medium text-sm capitalize">{cust.customer.role}</p>
                              </div>
                              <div className="bg-white rounded-lg p-3 border border-gray-100">
                                <p className="text-xs text-gray-400">Room No.</p>
                                <p className="font-medium text-sm">{cust.customer.roomNumber || "N/A"}</p>
                              </div>
                              <div className="bg-white rounded-lg p-3 border border-gray-100">
                                <p className="text-xs text-gray-400">Address</p>
                                <p className="font-medium text-sm truncate">{cust.customer.address || "N/A"}</p>
                              </div>
                            </div>

                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="bg-white">
                                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Date</th>
                                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Plan</th>
                                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Qty</th>
                                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Amount</th>
                                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Status</th>
                                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Payment</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                  {cust.orders.map((order, oIdx) => (
                                    <tr key={oIdx} className="hover:bg-white transition-colors">
                                      <td className="px-3 py-2 text-gray-700">
                                        {new Date(order.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                                      </td>
                                      <td className="px-3 py-2 text-gray-700">{order.planName}</td>
                                      <td className="px-3 py-2 text-gray-700">{order.quantity}</td>
                                      <td className="px-3 py-2 font-semibold">₹{order.totalAmount}</td>
                                      <td className="px-3 py-2">
                                        <span className={getStatusBadge(order.status)}>{order.status}</span>
                                      </td>
                                      <td className="px-3 py-2">
                                        <span className={getStatusBadge(order.paymentStatus)}>{order.paymentStatus}</span>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-16">
                      <FiUsers className="mx-auto text-4xl text-gray-300 mb-3" />
                      <p className="text-gray-500 font-medium">No customers found</p>
                      <p className="text-gray-400 text-sm mt-1">
                        {searchTerm ? "Try a different search term" : "No customer data in the selected period"}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!report && !loading && !error && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <div className="bg-orange-100 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <FiFileText className="text-3xl text-orange-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">No Report Generated Yet</h3>
          <p className="text-gray-400 max-w-md mx-auto text-sm">
            Select a predefined time period or choose a custom date range above, then click{" "}
            <span className="font-semibold text-orange-500">"Generate Report"</span> to view consolidated billing data.
          </p>
          <div className="flex justify-center gap-8 mt-8">
            {[
              { icon: <FiTrendingUp className="text-3xl" />, text: "Bill Summary" },
              { icon: <FiFileText className="text-3xl" />, text: "Transaction List" },
              { icon: <FiUsers className="text-3xl" />, text: "Customer Breakdown" },
            ].map((item, idx) => (
              <div key={idx} className="text-center">
                <div className="text-3xl mb-2 text-orange-500">{item.icon}</div>
                <p className="text-xs text-gray-400">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GenerateBills;
