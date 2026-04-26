import { useEffect, useState } from "react";
import API from "../../utils/api";
import {
  FiTrendingUp,
  FiTrendingDown,
  FiUsers,
  FiUser,
  FiShield,
  FiDollarSign,
  FiShoppingBag,
  FiHome,
  FiPackage,
  FiCheckCircle,
  FiXCircle,
  FiAlertTriangle,
  FiStar,
  FiRefreshCw,
  FiArrowUpRight,
  FiArrowDownRight,
} from "react-icons/fi";
import { TbReportAnalytics } from "react-icons/tb";
import { MdOutlineSupportAgent } from "react-icons/md";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const Reports = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await API.get("/admin/reports");
      setData(res.data);
    } catch (err) {
      console.error("Failed to fetch report data:", err);
      setError("Failed to load reports data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const downloadPdfReport = () => {
    const doc = new jsPDF();
    const timestamp = new Date().toLocaleString("en-IN");
    
    // Header - Modern Gradient Style
    doc.setFillColor(249, 115, 22); // Orange-500
    doc.rect(0, 0, 210, 45, "F");
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("SIYA PG MANAGEMENT", 105, 20, { align: "center" });
    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.text("BUSINESS PERFORMANCE REPORT", 105, 30, { align: "center" });
    
    // Sub-header Info
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(9);
    doc.text(`Generated on: ${timestamp}`, 20, 55);
    doc.text(`Report Type: ${activeTab.toUpperCase()} ANALYSIS`, 190, 55, { align: "right" });
    
    // Section Title
    doc.setTextColor(31, 41, 55);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(`${activeTab.toUpperCase()} SUMMARY`, 20, 70);
    doc.setDrawColor(249, 115, 22);
    doc.setLineWidth(1);
    doc.line(20, 73, 50, 73);
    
    const tableData = [];
    const fmt = (val) => `INR ${(val || 0).toLocaleString("en-IN")}`;

    if (activeTab === "overview") {
      tableData.push(["Total Revenue", fmt(data.revenue?.total)]);
      tableData.push(["Monthly Revenue", fmt(data.revenue?.thisMonth)]);
      tableData.push(["Total Orders", data.orders?.total?.toString()]);
      tableData.push(["Total Users", data.users?.total?.toString()]);
      tableData.push(["Room Occupancy", `${data.rooms?.occupancyRate}%`]);
    } else if (activeTab === "revenue") {
      tableData.push(["Total Revenue", fmt(data.revenue?.total)]);
      tableData.push(["Monthly Growth", `${data.revenue?.growth}%`]);
      tableData.push(["Target Progress", `${Math.min(Math.round((data.revenue?.thisMonth/data.revenue?.target)*100),100)}%`]);
    } else if (activeTab === "orders") {
      tableData.push(["Total Orders", data.orders?.total?.toString()]);
      tableData.push(["Completed Orders", data.orders?.completed?.toString()]);
      tableData.push(["Average Order Value", fmt(data.orders?.avgValue)]);
    }
    
    autoTable(doc, {
      startY: 80,
      head: [["Performance Metric", "Statistical Value"]],
      body: tableData.length > 0 ? tableData : [["No data available", "-"]],
      theme: "striped",
      headStyles: { 
        fillColor: [31, 41, 55], 
        textColor: [255, 255, 255],
        fontSize: 11,
        fontStyle: "bold",
        halign: "left"
      },
      bodyStyles: {
        fontSize: 10,
        textColor: [55, 65, 81],
        cellPadding: 6
      },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 100 },
        1: { halign: "right" }
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251]
      }
    });
    
    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(156, 163, 175);
      doc.text("SwadBox PG Management System - Confidential Business Report", 105, 285, { align: "center" });
      doc.text(`Page ${i} of ${pageCount}`, 190, 285, { align: "right" });
    }
    
    doc.save(`SiyaPG_Report_${activeTab}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // ── Helpers ──────────────────────────────────────────────
  const formatCurrency = (val) =>
    `₹${(val || 0).toLocaleString("en-IN")}`;

  const GrowthBadge = ({ value }) => {
    if (value === undefined || value === null) return null;
    const isPositive = value >= 0;
    return (
      <span
        className={`inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full ${
          isPositive
            ? "bg-emerald-100 text-emerald-700"
            : "bg-red-100 text-red-700"
        }`}
      >
        {isPositive ? <FiArrowUpRight className="text-[10px]" /> : <FiArrowDownRight className="text-[10px]" />}
        {Math.abs(value)}%
      </span>
    );
  };

  const ProgressRing = ({ percentage, size = 80, stroke = 8, color = "#f97316" }) => {
    const radius = (size - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;
    return (
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#f3f4f6"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000"
        />
      </svg>
    );
  };

  const BarChart = ({ items, maxVal }) => {
    const max = maxVal || Math.max(...items.map((i) => i.value), 1);
    return (
      <div className="space-y-3">
        {items.map((item, idx) => (
          <div key={idx}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600 font-medium">{item.label}</span>
              <span className="font-semibold text-gray-800">{item.display || item.value}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full transition-all duration-1000 ${item.color || "bg-orange-500"}`}
                style={{ width: `${Math.max((item.value / max) * 100, 2)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Section tabs
  const tabs = [
    { id: "overview", label: "Overview", icon: <TbReportAnalytics /> },
    { id: "revenue", label: "Revenue", icon: <FiDollarSign /> },
    { id: "orders", label: "Orders", icon: <FiShoppingBag /> },
    { id: "occupancy", label: "Rooms & PG", icon: <FiHome /> },
    { id: "users", label: "Users", icon: <FiUsers /> },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading reports...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <FiAlertTriangle className="text-4xl text-red-400" />
        <p className="text-gray-600">{error}</p>
        <button
          onClick={fetchReportData}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition text-sm"
        >
          <FiRefreshCw /> Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
            <span className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-2.5 rounded-xl shadow-lg shadow-orange-200">
              <TbReportAnalytics className="text-xl" />
            </span>
            Reports & Analytics
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Comprehensive overview of your business performance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={downloadPdfReport}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-gray-800 rounded-xl hover:bg-gray-900 transition-all shadow-md"
          >
            <FiPackage /> Download PDF
          </button>
          <button
            onClick={fetchReportData}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-orange-600 bg-orange-50 rounded-xl hover:bg-orange-100 transition-all"
          >
            <FiRefreshCw /> Refresh
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6">
        <div className="flex overflow-x-auto border-b border-gray-100">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[120px] px-4 py-3.5 text-sm font-medium flex items-center justify-center gap-2 transition-all relative whitespace-nowrap ${
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
      </div>

      {/* ═══════════════ OVERVIEW TAB ═══════════════ */}
      {activeTab === "overview" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Hero Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: "Total Revenue",
                value: formatCurrency(data.revenue?.total),
                sub: `This month: ${formatCurrency(data.revenue?.thisMonth)}`,
                growth: data.revenue?.growth,
                icon: <FiDollarSign />,
                bg: "bg-orange-50",
                border: "border-orange-200",
                text: "text-orange-600",
                iconBg: "bg-orange-100",
              },
              {
                label: "Total Orders",
                value: data.orders?.total,
                sub: `Live: ${data.orders?.live} | Completed: ${data.orders?.completed}`,
                growth: data.orders?.growth,
                icon: <FiShoppingBag />,
                bg: "bg-blue-50",
                border: "border-blue-200",
                text: "text-blue-600",
                iconBg: "bg-blue-100",
              },
              {
                label: "Total Users",
                value: data.users?.total,
                sub: `New this month: ${data.users?.newThisMonth}`,
                growth: data.users?.growth,
                icon: <FiUsers />,
                bg: "bg-emerald-50",
                border: "border-emerald-200",
                text: "text-emerald-600",
                iconBg: "bg-emerald-100",
              },
              {
                label: "Room Occupancy",
                value: `${data.rooms?.occupancyRate}%`,
                sub: `${data.rooms?.occupiedBeds}/${data.rooms?.totalCapacity} beds`,
                icon: <FiHome />,
                bg: "bg-violet-50",
                border: "border-violet-200",
                text: "text-violet-600",
                iconBg: "bg-violet-100",
              },
            ].map((card, idx) => (
              <div
                key={idx}
                className={`${card.bg} border ${card.border} rounded-2xl p-5 transition-all hover:shadow-lg hover:-translate-y-1`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`${card.iconBg} ${card.text} p-2 rounded-lg`}>
                    {card.icon}
                  </div>
                  {card.growth !== undefined && <GrowthBadge value={card.growth} />}
                </div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                  {card.label}
                </p>
                <p className={`text-2xl font-bold mt-1 ${card.text}`}>{card.value}</p>
                <p className="text-xs text-gray-400 mt-1">{card.sub}</p>
              </div>
            ))}
          </div>

          {/* 7-Day Order Trend */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FiTrendingUp className="text-orange-500" /> Last 7 Days — Order Trend
            </h3>
            <div className="flex items-end gap-2 h-48">
              {data.charts?.dailyOrders?.map((day, idx) => {
                const maxOrders = Math.max(...data.charts.dailyOrders.map((d) => d.orders), 1);
                const heightPct = (day.orders / maxOrders) * 100;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs font-semibold text-gray-700">
                      {day.orders}
                    </span>
                    <div className="w-full flex items-end" style={{ height: "140px" }}>
                      <div
                        className="w-full bg-gradient-to-t from-orange-500 to-orange-300 rounded-t-lg transition-all duration-700 hover:from-orange-600 hover:to-orange-400"
                        style={{
                          height: `${Math.max(heightPct, 5)}%`,
                          minHeight: "4px",
                        }}
                        title={`${day.date}: ${day.orders} orders, ${formatCurrency(day.revenue)}`}
                      />
                    </div>
                    <span className="text-[10px] text-gray-400 font-medium text-center leading-tight">
                      {day.date.split(",")[0]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Two Column: Billing + Queries */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Billing Overview */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FiDollarSign className="text-orange-500" /> Billing Collection
              </h3>
              <div className="flex items-center gap-6 mb-5">
                <div className="relative">
                  <ProgressRing percentage={data.billing?.collectionRate || 0} color="#16a34a" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-gray-800">
                      {data.billing?.collectionRate}%
                    </span>
                  </div>
                </div>
                <div className="space-y-2 flex-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Paid</span>
                    <span className="font-semibold text-emerald-600">
                      {formatCurrency(data.billing?.totalPaid)} ({data.billing?.paidCount})
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Pending</span>
                    <span className="font-semibold text-amber-600">
                      {formatCurrency(data.billing?.totalPending)} ({data.billing?.pendingCount})
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Query Resolution */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <MdOutlineSupportAgent className="text-orange-500" /> Query Resolution
              </h3>
              <div className="flex items-center gap-6 mb-5">
                <div className="relative">
                  <ProgressRing percentage={data.queries?.resolutionRate || 0} color="#2563eb" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-gray-800">
                      {data.queries?.resolutionRate}%
                    </span>
                  </div>
                </div>
                <div className="space-y-2 flex-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Open</span>
                    <span className="font-semibold text-amber-600">{data.queries?.open}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Resolved</span>
                    <span className="font-semibold text-emerald-600">{data.queries?.closed}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">High Priority</span>
                    <span className="font-semibold text-red-600">{data.queries?.highPriority}</span>
                  </div>
                </div>
              </div>
              <BarChart
                items={[
                  { label: "Room", value: data.queries?.categories?.room || 0, color: "bg-violet-500" },
                  { label: "Food", value: data.queries?.categories?.food || 0, color: "bg-orange-500" },
                  { label: "Billing", value: data.queries?.categories?.billing || 0, color: "bg-blue-500" },
                  { label: "General", value: data.queries?.categories?.general || 0, color: "bg-gray-400" },
                ]}
              />
            </div>
          </div>

          {/* Top Customers */}
          {data.topCustomers?.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FiStar className="text-orange-500" /> Top Customers
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {data.topCustomers.map((c, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-md transition-all"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-sm shadow">
                      {idx + 1}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-800 text-sm truncate">{c.name}</p>
                      <p className="text-xs text-orange-500 font-medium">
                        {formatCurrency(c.totalSpent)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════ REVENUE TAB ═══════════════ */}
      {activeTab === "revenue" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Revenue Hero */}
          <div className="bg-gradient-to-r from-orange-500 via-orange-500 to-amber-500 rounded-2xl p-6 text-white shadow-xl shadow-orange-200">
            <p className="text-orange-100 text-xs font-medium uppercase tracking-wider">
              Total Revenue (All Time)
            </p>
            <h2 className="text-4xl font-bold mt-2">
              {formatCurrency(data.revenue?.total)}
            </h2>
            <div className="flex gap-6 mt-4">
              <div>
                <p className="text-orange-200 text-xs">This Month</p>
                <p className="text-xl font-semibold">
                  {formatCurrency(data.revenue?.thisMonth)}
                </p>
              </div>
              <div>
                <p className="text-orange-200 text-xs">Last Month</p>
                <p className="text-xl font-semibold">
                  {formatCurrency(data.revenue?.lastMonth)}
                </p>
              </div>
              <div>
                <p className="text-orange-200 text-xs">Growth</p>
                <p className="text-xl font-semibold flex items-center gap-1">
                  {data.revenue?.growth >= 0 ? (
                    <FiTrendingUp />
                  ) : (
                    <FiTrendingDown />
                  )}
                  {data.revenue?.growth}%
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Target */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Monthly Revenue Target</h3>
              <div className="relative mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-500">Progress</span>
                  <span className="font-semibold">
                    {Math.min(
                      Math.round(
                        ((data.revenue?.thisMonth || 0) / (data.revenue?.target || 1)) * 100
                      ),
                      100
                    )}
                    %
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-4">
                  <div
                    className="bg-gradient-to-r from-orange-400 to-orange-600 h-4 rounded-full transition-all duration-1000 relative"
                    style={{
                      width: `${Math.min(
                        ((data.revenue?.thisMonth || 0) / (data.revenue?.target || 1)) * 100,
                        100
                      )}%`,
                    }}
                  >
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow border-2 border-orange-500" />
                  </div>
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>₹0</span>
                  <span>Target: {formatCurrency(data.revenue?.target)}</span>
                </div>
              </div>
            </div>

            {/* Revenue Breakdown */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Revenue Sources</h3>
              <BarChart
                items={[
                  {
                    label: "Tiffin Orders",
                    value: data.revenue?.thisMonth || 0,
                    display: formatCurrency(data.revenue?.thisMonth),
                    color: "bg-orange-500",
                  },
                  {
                    label: "Room Rent (Monthly)",
                    value: data.rooms?.monthlyRoomRevenue || 0,
                    display: formatCurrency(data.rooms?.monthlyRoomRevenue),
                    color: "bg-violet-500",
                  },
                ]}
              />
              <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between">
                <span className="text-sm text-gray-500 font-medium">Combined Est. Monthly</span>
                <span className="text-lg font-bold text-gray-800">
                  {formatCurrency(
                    (data.revenue?.thisMonth || 0) + (data.rooms?.monthlyRoomRevenue || 0)
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Daily Revenue Trend */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FiTrendingUp className="text-orange-500" /> Daily Revenue (Last 7 Days)
            </h3>
            <div className="flex items-end gap-3 h-48">
              {data.charts?.dailyOrders?.map((day, idx) => {
                const maxRev = Math.max(...data.charts.dailyOrders.map((d) => d.revenue), 1);
                const heightPct = (day.revenue / maxRev) * 100;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] font-semibold text-gray-600">
                      {formatCurrency(day.revenue)}
                    </span>
                    <div className="w-full flex items-end" style={{ height: "130px" }}>
                      <div
                        className="w-full bg-gradient-to-t from-emerald-500 to-emerald-300 rounded-t-lg transition-all duration-700"
                        style={{ height: `${Math.max(heightPct, 5)}%`, minHeight: "4px" }}
                      />
                    </div>
                    <span className="text-[10px] text-gray-400 font-medium">
                      {day.date.split(",")[0]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════ ORDERS TAB ═══════════════ */}
      {activeTab === "orders" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Order Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { label: "Total", value: data.orders?.total, icon: <FiShoppingBag />, bg: "bg-gray-50", text: "text-gray-700" },
              { label: "Live", value: data.orders?.live, icon: <FiPackage />, bg: "bg-blue-50", text: "text-blue-600" },
              { label: "Completed", value: data.orders?.completed, icon: <FiCheckCircle />, bg: "bg-emerald-50", text: "text-emerald-600" },
              { label: "Cancelled", value: data.orders?.cancelled, icon: <FiXCircle />, bg: "bg-red-50", text: "text-red-600" },
              { label: "Avg Value", value: formatCurrency(data.orders?.avgValue), icon: <FiDollarSign />, bg: "bg-amber-50", text: "text-amber-600" },
            ].map((c, idx) => (
              <div key={idx} className={`${c.bg} rounded-2xl p-4 border border-gray-100 hover:shadow-md transition-all`}>
                <div className={`${c.text} mb-2`}>{c.icon}</div>
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">{c.label}</p>
                <p className={`text-xl font-bold mt-1 ${c.text}`}>{c.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Payment Status */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Payment Status Distribution</h3>
              <BarChart
                items={[
                  { label: "Paid", value: data.orders?.payment?.paid || 0, color: "bg-emerald-500" },
                  { label: "Pending", value: data.orders?.payment?.pending || 0, color: "bg-amber-500" },
                  { label: "Failed", value: data.orders?.payment?.failed || 0, color: "bg-red-500" },
                ]}
              />
            </div>

            {/* Delivery Time */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Delivery Time Preferences</h3>
              <BarChart
                items={[
                  { label: "Breakfast", value: data.orders?.delivery?.breakfast || 0, color: "bg-yellow-400" },
                  { label: "Lunch", value: data.orders?.delivery?.lunch || 0, color: "bg-orange-500" },
                  { label: "Dinner", value: data.orders?.delivery?.dinner || 0, color: "bg-indigo-500" },
                  { label: "Both", value: data.orders?.delivery?.both || 0, color: "bg-violet-500" },
                ]}
              />
            </div>
          </div>

          {/* Recent Orders Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Recent Orders</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left font-semibold text-gray-600 text-xs uppercase tracking-wider">#</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600 text-xs uppercase tracking-wider">Customer</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600 text-xs uppercase tracking-wider">Plan</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600 text-xs uppercase tracking-wider">Amount</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600 text-xs uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600 text-xs uppercase tracking-wider">Payment</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600 text-xs uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.recentOrders?.map((o, idx) => (
                    <tr key={idx} className="hover:bg-orange-50/30 transition-colors">
                      <td className="px-4 py-3 text-gray-400 font-mono text-xs">{idx + 1}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{o.customerName}</td>
                      <td className="px-4 py-3 text-gray-700">{o.planName}</td>
                      <td className="px-4 py-3 font-semibold">{formatCurrency(o.amount)}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            o.status === "completed"
                              ? "bg-emerald-100 text-emerald-700"
                              : o.status === "cancelled"
                              ? "bg-red-100 text-red-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {o.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            o.paymentStatus === "paid"
                              ? "bg-emerald-100 text-emerald-700"
                              : o.paymentStatus === "failed"
                              ? "bg-red-100 text-red-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {o.paymentStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {new Date(o.date).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                    </tr>
                  ))}
                  {(!data.recentOrders || data.recentOrders.length === 0) && (
                    <tr>
                      <td colSpan="7" className="px-4 py-8 text-center text-gray-400">
                        No orders found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════ ROOMS & PG TAB ═══════════════ */}
      {activeTab === "occupancy" && (
        <div className="space-y-6 animate-fadeIn">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total Rooms", value: data.rooms?.total, icon: <FiHome />, bg: "bg-violet-50", text: "text-violet-600" },
              { label: "Available", value: data.rooms?.available, icon: <FiCheckCircle />, bg: "bg-emerald-50", text: "text-emerald-600" },
              { label: "Full", value: data.rooms?.full, icon: <FiXCircle />, bg: "bg-red-50", text: "text-red-600" },
              { label: "Monthly Rent Revenue", value: formatCurrency(data.rooms?.monthlyRoomRevenue), icon: <FiDollarSign />, bg: "bg-amber-50", text: "text-amber-600" },
            ].map((c, idx) => (
              <div key={idx} className={`${c.bg} rounded-2xl p-5 border border-gray-100 hover:shadow-md transition-all`}>
                <div className={`${c.text} mb-2`}>{c.icon}</div>
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">{c.label}</p>
                <p className={`text-xl font-bold mt-1 ${c.text}`}>{c.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Occupancy Gauge */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center">
              <h3 className="font-semibold text-gray-800 mb-6 self-start">Bed Occupancy Rate</h3>
              <div className="relative mb-4">
                <ProgressRing
                  percentage={data.rooms?.occupancyRate || 0}
                  size={140}
                  stroke={12}
                  color={
                    data.rooms?.occupancyRate >= 80
                      ? "#16a34a"
                      : data.rooms?.occupancyRate >= 50
                      ? "#f97316"
                      : "#dc2626"
                  }
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-gray-800">
                    {data.rooms?.occupancyRate}%
                  </span>
                  <span className="text-xs text-gray-400">Occupied</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 w-full mt-4">
                <div className="text-center p-3 bg-gray-50 rounded-xl">
                  <p className="text-2xl font-bold text-gray-800">{data.rooms?.occupiedBeds}</p>
                  <p className="text-xs text-gray-400">Occupied Beds</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-xl">
                  <p className="text-2xl font-bold text-gray-800">
                    {(data.rooms?.totalCapacity || 0) - (data.rooms?.occupiedBeds || 0)}
                  </p>
                  <p className="text-xs text-gray-400">Vacant Beds</p>
                </div>
              </div>
            </div>

            {/* Tiffin Plans */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-800 mb-4">
                Popular Tiffin Plans ({data.tiffin?.activePlans} active)
              </h3>
              {data.tiffin?.topPlans?.length > 0 ? (
                <div className="space-y-4">
                  {data.tiffin.topPlans.map((plan, idx) => {
                    const fillPct = plan.maxCustomers > 0
                      ? (plan.customers / plan.maxCustomers) * 100
                      : 0;
                    return (
                      <div key={idx} className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="bg-orange-100 text-orange-600 text-xs font-bold px-2 py-0.5 rounded-full">
                              #{idx + 1}
                            </span>
                            <span className="font-semibold text-gray-800 text-sm">{plan.name}</span>
                          </div>
                          <span className="text-sm font-medium text-orange-500">
                            {formatCurrency(plan.price)}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>{plan.customers}/{plan.maxCustomers} customers</span>
                          <span className="capitalize">{plan.type}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-orange-500 h-1.5 rounded-full transition-all duration-700"
                            style={{ width: `${fillPct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-400 text-sm text-center py-8">No active plans</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════ USERS TAB ═══════════════ */}
      {activeTab === "users" && (
        <div className="space-y-6 animate-fadeIn">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total Users", value: data.users?.total, icon: <FiUsers />, bg: "bg-gray-50", text: "text-gray-700" },
              { label: "Students", value: data.users?.students, icon: <FiUsers />, bg: "bg-emerald-50", text: "text-emerald-600" },
              { label: "Customers", value: data.users?.customers, icon: <FiUsers />, bg: "bg-blue-50", text: "text-blue-600" },
              { label: "Blocked", value: data.users?.blocked, icon: <FiAlertTriangle />, bg: "bg-red-50", text: "text-red-600" },
            ].map((c, idx) => (
              <div key={idx} className={`${c.bg} rounded-2xl p-5 border border-gray-100 hover:shadow-md transition-all`}>
                <div className={`${c.text} mb-2`}>{c.icon}</div>
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">{c.label}</p>
                <p className={`text-2xl font-bold mt-1 ${c.text}`}>{c.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Distribution */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-800 mb-4">User Role Distribution</h3>
              <div className="space-y-4">
                {[
                  {
                    label: "Students",
                    value: data.users?.students || 0,
                    pct: data.users?.total > 0 ? ((data.users.students / data.users.total) * 100).toFixed(1) : 0,
                    color: "bg-emerald-500",
                    icon: <FiUsers className="mr-1 inline text-emerald-500" />,
                  },
                  {
                    label: "Customers",
                    value: data.users?.customers || 0,
                    pct: data.users?.total > 0 ? ((data.users.customers / data.users.total) * 100).toFixed(1) : 0,
                    color: "bg-blue-500",
                    icon: <FiUser className="mr-1 inline text-blue-500" />,
                  },
                  {
                    label: "Admins",
                    value: data.users?.admins || 0,
                    pct: data.users?.total > 0 ? ((data.users.admins / data.users.total) * 100).toFixed(1) : 0,
                    color: "bg-orange-500",
                    icon: <FiShield className="mr-1 inline text-orange-500" />,
                  },
                ].map((role, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 font-medium">
                        {role.icon} {role.label}
                      </span>
                      <span className="font-semibold">
                        {role.value} ({role.pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3">
                      <div
                        className={`${role.color} h-3 rounded-full transition-all duration-1000`}
                        style={{ width: `${role.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* User Growth */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-800 mb-4">User Growth</h3>
              <div className="space-y-5">
                <div className="flex items-center gap-4 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                  <div className="bg-emerald-100 text-emerald-600 p-3 rounded-lg">
                    <FiTrendingUp className="text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">New Users This Month</p>
                    <p className="text-2xl font-bold text-emerald-600 flex items-center gap-2">
                      {data.users?.newThisMonth}
                      <GrowthBadge value={data.users?.growth} />
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-xs text-gray-400 uppercase tracking-wide">Active Users</p>
                    <p className="text-2xl font-bold text-gray-800 mt-1">
                      {(data.users?.total || 0) - (data.users?.blocked || 0)}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-xs text-gray-400 uppercase tracking-wide">Blocked</p>
                    <p className="text-2xl font-bold text-red-500 mt-1">{data.users?.blocked}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;