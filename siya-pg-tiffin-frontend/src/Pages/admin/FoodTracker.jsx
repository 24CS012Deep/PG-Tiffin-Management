import { useEffect, useState, useCallback } from "react";
import API from "../../utils/api";
import {
  FiUser, FiCalendar, FiSave, FiCheckCircle, FiAlertCircle,
  FiRefreshCw, FiLoader, FiChevronDown, FiDollarSign, FiHome
} from "react-icons/fi";
import {
  MdOutlineBreakfastDining, MdOutlineLunchDining, MdOutlineDinnerDining,
  MdReceiptLong, MdOutlineRestaurantMenu
} from "react-icons/md";

/* ── helpers ──────────────────────────────────────────────── */
const getDaysInMonth = (monthStr) => {
  if (!monthStr) return 30;
  const [y, m] = monthStr.split("-").map(Number);
  return new Date(y, m, 0).getDate();
};

const getCurrentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

const formatMonth = (m) => {
  if (!m) return "";
  const [y, mo] = m.split("-");
  return new Date(y, mo - 1).toLocaleString("en-IN", { month: "long", year: "numeric" });
};

const dayLabel = (day, monthStr) => {
  if (!monthStr) return day;
  const [y, m] = monthStr.split("-").map(Number);
  return new Date(y, m - 1, day).toLocaleDateString("en-IN", { weekday: "short", day: "numeric" });
};

/* ── component ────────────────────────────────────────────── */
const FoodTracker = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [month, setMonth] = useState(getCurrentMonth());
  const [mealPrices, setMealPrices] = useState({ breakfast: 20, lunch: 40, dinner: 40 });
  const [roomRent, setRoomRent] = useState(0);
  const [dailyRecords, setDailyRecords] = useState([]);
  const [recordId, setRecordId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("pending");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Fetch student list
  useEffect(() => {
    API.get("/admin/meals/students")
      .then(res => setStudents(res.data || []))
      .catch(() => setStudents([]));
  }, []);

  // Build empty day scaffold
  const buildEmptyDays = useCallback((monthStr) => {
    const days = getDaysInMonth(monthStr);
    return Array.from({ length: days }, (_, i) => ({
      day: i + 1,
      breakfast: false,
      lunch: false,
      dinner: false,
      dailyTotal: 0
    }));
  }, []);

  // Fetch record when student/month changes
  useEffect(() => {
    if (!selectedStudent) return;
    setLoading(true);
    setError(""); setSuccess("");
    API.get(`/admin/meals/${selectedStudent._id}/${month}`)
      .then(res => {
        const rec = res.data;
        setRoomRent(rec.roomRent || selectedStudent.rent || 0);
        setMealPrices(rec.mealPrices || { breakfast: 20, lunch: 40, dinner: 40 });
        setPaymentStatus(rec.paymentStatus || "pending");
        setRecordId(rec._id || null);

        // Merge saved records with full day scaffold
        const empty = buildEmptyDays(month);
        const saved = rec.dailyRecords || [];
        const merged = empty.map(e => {
          const s = saved.find(r => r.day === e.day);
          return s
            ? { day: s.day, breakfast: s.breakfast, lunch: s.lunch, dinner: s.dinner, dailyTotal: s.dailyTotal || 0 }
            : e;
        });
        setDailyRecords(merged);
      })
      .catch(() => {
        setDailyRecords(buildEmptyDays(month));
        setError("Could not load existing record.");
      })
      .finally(() => setLoading(false));
  }, [selectedStudent, month, buildEmptyDays]);

  // Recompute daily totals whenever prices change
  const recompute = useCallback((records, prices) =>
    records.map(r => ({
      ...r,
      dailyTotal:
        (r.breakfast ? prices.breakfast : 0) +
        (r.lunch     ? prices.lunch     : 0) +
        (r.dinner    ? prices.dinner    : 0)
    })),
  []);

  const toggleMeal = (day, meal) => {
    setDailyRecords(prev => {
      const updated = prev.map(r => {
        if (r.day !== day) return r;
        const next = { ...r, [meal]: !r[meal] };
        next.dailyTotal =
          (next.breakfast ? mealPrices.breakfast : 0) +
          (next.lunch     ? mealPrices.lunch     : 0) +
          (next.dinner    ? mealPrices.dinner    : 0);
        return next;
      });
      return updated;
    });
  };

  const updatePrice = (meal, val) => {
    const p = { ...mealPrices, [meal]: Number(val) || 0 };
    setMealPrices(p);
    setDailyRecords(prev => recompute(prev, p));
  };

  const foodCharges = dailyRecords.reduce((s, r) => s + (r.dailyTotal || 0), 0);
  const totalAmount = roomRent + foodCharges;
  const totalMealDays = dailyRecords.filter(r => r.breakfast || r.lunch || r.dinner).length;

  const handleSave = async () => {
    if (!selectedStudent) return;
    setSaving(true); setError(""); setSuccess("");
    try {
      const res = await API.post("/admin/meals/save", {
        studentId: selectedStudent._id,
        month,
        roomRent,
        mealPrices,
        dailyRecords
      });
      setRecordId(res.data.record._id);
      setSuccess("Meal record saved successfully!");
      setTimeout(() => setSuccess(""), 4000);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateBill = async () => {
    if (!selectedStudent) return;
    // Auto-save first
    await handleSave();
    setGenerating(true); setError(""); setSuccess("");
    try {
      await API.post("/admin/meals/generate-bill", {
        studentId: selectedStudent._id,
        month
      });
      setPaymentStatus("pending");
      setSuccess(`✅ Bill generated and email sent to ${selectedStudent.name}!`);
      setTimeout(() => setSuccess(""), 5000);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to generate bill.");
    } finally {
      setGenerating(false);
    }
  };

  const handleMarkPaid = async () => {
    if (!recordId) return alert("Save the record first.");
    setUpdatingStatus(true);
    try {
      await API.put(`/admin/meals/${recordId}/status`, { status: "paid", paymentMethod: "manual" });
      setPaymentStatus("paid");
      setSuccess("✅ Marked as PAID.");
      setTimeout(() => setSuccess(""), 4000);
    } catch {
      setError("Failed to update status.");
    } finally { setUpdatingStatus(false); }
  };

  const handleMarkOverdue = async () => {
    if (!recordId) return alert("Save the record first.");
    setUpdatingStatus(true);
    try {
      await API.put(`/admin/meals/${recordId}/status`, { status: "overdue" });
      setPaymentStatus("overdue");
      setSuccess("Marked as OVERDUE.");
      setTimeout(() => setSuccess(""), 4000);
    } catch {
      setError("Failed to update status.");
    } finally { setUpdatingStatus(false); }
  };

  const statusConfig = {
    paid:    { label: "PAID",    cls: "bg-emerald-100 text-emerald-700 border-emerald-300" },
    pending: { label: "PENDING", cls: "bg-amber-100 text-amber-700 border-amber-300" },
    overdue: { label: "OVERDUE", cls: "bg-red-100 text-red-700 border-red-300" }
  };

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3 text-gray-800">
          <span className="bg-gradient-to-r from-orange-400 to-orange-600 text-white p-2 rounded-xl shadow-lg">
            <MdOutlineRestaurantMenu />
          </span>
          Daily Food Tracker
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Track daily meal consumption per student and generate monthly bills.
        </p>
      </div>

      {/* Alerts */}
      {success && (
        <div className="bg-emerald-50 border-l-4 border-emerald-500 text-emerald-700 px-5 py-3 rounded-r-xl mb-5 flex items-center gap-3 animate-pulse">
          <FiCheckCircle className="flex-shrink-0" /> {success}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-5 py-3 rounded-r-xl mb-5 flex items-center gap-3">
          <FiAlertCircle className="flex-shrink-0" /> {error}
        </div>
      )}

      {/* Controls Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Student selector */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
            <FiUser className="text-orange-400" /> Student
          </label>
          <div className="relative">
            <select
              value={selectedStudent?._id || ""}
              onChange={e => {
                const s = students.find(s => s._id === e.target.value);
                setSelectedStudent(s || null);
                setRecordId(null);
              }}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-3 pr-8 text-sm font-semibold text-gray-700 appearance-none outline-none focus:ring-2 focus:ring-orange-400"
            >
              <option value="">— Select Student —</option>
              {students.map(s => (
                <option key={s._id} value={s._id}>
                  {s.name} (Room {s.roomNumber})
                </option>
              ))}
            </select>
            <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
          {selectedStudent && (
            <p className="text-xs text-gray-400 mt-2 font-medium">
              Rent: <span className="text-orange-500 font-bold">₹{selectedStudent.rent}</span>
            </p>
          )}
        </div>

        {/* Month selector */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
            <FiCalendar className="text-orange-400" /> Billing Month
          </label>
          <input
            type="month"
            value={month}
            onChange={e => setMonth(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 text-sm font-semibold text-gray-700 outline-none focus:ring-2 focus:ring-orange-400"
          />
          <p className="text-xs text-gray-400 mt-2 font-medium">
            {getDaysInMonth(month)} days in month
          </p>
        </div>

        {/* Meal Prices */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
            <FiDollarSign className="text-orange-400" /> Meal Prices (₹)
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { key: "breakfast", icon: <MdOutlineBreakfastDining />, label: "B/fast", color: "text-amber-500" },
              { key: "lunch",     icon: <MdOutlineLunchDining />,     label: "Lunch",  color: "text-orange-500" },
              { key: "dinner",    icon: <MdOutlineDinnerDining />,    label: "Dinner", color: "text-indigo-500" }
            ].map(({ key, icon, label, color }) => (
              <div key={key}>
                <label className={`text-[10px] font-bold uppercase flex items-center gap-0.5 mb-1 ${color}`}>
                  {icon} {label}
                </label>
                <input
                  type="number"
                  min="0"
                  value={mealPrices[key]}
                  onChange={e => updatePrice(key, e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg py-1.5 px-2 text-sm font-bold text-center outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {!selectedStudent ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-16 text-center">
          <FiUser className="text-5xl text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-700">Select a Student</h3>
          <p className="text-gray-400 text-sm mt-1">Choose a student above to start tracking daily meals.</p>
        </div>
      ) : loading ? (
        <div className="flex flex-col items-center justify-center h-64 gap-3">
          <FiLoader className="animate-spin text-4xl text-orange-500" />
          <p className="text-gray-500 font-medium">Loading meal records…</p>
        </div>
      ) : (
        <>
          {/* Summary bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Room Rent", value: `₹${roomRent.toLocaleString("en-IN")}`, icon: <FiHome />, color: "bg-blue-50 text-blue-700 border-blue-100" },
              { label: "Food Charges", value: `₹${foodCharges.toLocaleString("en-IN")}`, icon: <MdOutlineRestaurantMenu />, color: "bg-orange-50 text-orange-700 border-orange-100" },
              { label: "Total Amount", value: `₹${totalAmount.toLocaleString("en-IN")}`, icon: <MdReceiptLong />, color: "bg-indigo-50 text-indigo-700 border-indigo-100" },
              { label: "Meal Days", value: `${totalMealDays} days`, icon: <FiCalendar />, color: "bg-emerald-50 text-emerald-700 border-emerald-100" }
            ].map((s, i) => (
              <div key={i} className={`${s.color} border rounded-2xl p-4`}>
                <div className="flex items-center gap-2 mb-1 opacity-70 text-sm">{s.icon} {s.label}</div>
                <p className="text-2xl font-black">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Daily Records Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/60 flex items-center justify-between">
              <h3 className="font-bold text-gray-700 flex items-center gap-2">
                <MdOutlineRestaurantMenu className="text-orange-500" />
                Daily Meal Record — {formatMonth(month)}
              </h3>
              <div className="flex items-center gap-3 text-xs font-bold text-gray-400">
                <span className="flex items-center gap-1"><MdOutlineBreakfastDining className="text-amber-500" /> B = ₹{mealPrices.breakfast}</span>
                <span className="flex items-center gap-1"><MdOutlineLunchDining className="text-orange-500" /> L = ₹{mealPrices.lunch}</span>
                <span className="flex items-center gap-1"><MdOutlineDinnerDining className="text-indigo-500" /> D = ₹{mealPrices.dinner}</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-xs font-black uppercase tracking-wider text-gray-400 border-b border-gray-100">
                    <th className="px-6 py-3 text-left">Date</th>
                    <th className="px-4 py-3 text-center">
                      <span className="flex items-center justify-center gap-1 text-amber-500">
                        <MdOutlineBreakfastDining /> Breakfast
                      </span>
                    </th>
                    <th className="px-4 py-3 text-center">
                      <span className="flex items-center justify-center gap-1 text-orange-500">
                        <MdOutlineLunchDining /> Lunch
                      </span>
                    </th>
                    <th className="px-4 py-3 text-center">
                      <span className="flex items-center justify-center gap-1 text-indigo-500">
                        <MdOutlineDinnerDining /> Dinner
                      </span>
                    </th>
                    <th className="px-6 py-3 text-right">Day Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {dailyRecords.map(r => {
                    const isWeekend = (() => {
                      const [y, m] = month.split("-").map(Number);
                      const d = new Date(y, m - 1, r.day).getDay();
                      return d === 0 || d === 6;
                    })();
                    return (
                      <tr key={r.day} className={`hover:bg-orange-50/30 transition-colors ${isWeekend ? "bg-gray-50/50" : ""}`}>
                        <td className="px-6 py-3">
                          <span className="font-semibold text-gray-700">{dayLabel(r.day, month)}</span>
                          {isWeekend && <span className="ml-2 text-[10px] bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded font-bold">WE</span>}
                        </td>
                        {["breakfast", "lunch", "dinner"].map(meal => (
                          <td key={meal} className="px-4 py-3 text-center">
                            <button
                              onClick={() => toggleMeal(r.day, meal)}
                              className={`w-8 h-8 rounded-lg border-2 transition-all font-bold text-sm flex items-center justify-center mx-auto ${
                                r[meal]
                                  ? meal === "breakfast"
                                    ? "bg-amber-400 border-amber-400 text-white shadow-sm"
                                    : meal === "lunch"
                                    ? "bg-orange-500 border-orange-500 text-white shadow-sm"
                                    : "bg-indigo-500 border-indigo-500 text-white shadow-sm"
                                  : "bg-white border-gray-200 text-gray-300 hover:border-gray-400"
                              }`}
                            >
                              {r[meal] ? "✓" : "—"}
                            </button>
                          </td>
                        ))}
                        <td className="px-6 py-3 text-right">
                          <span className={`font-bold ${r.dailyTotal > 0 ? "text-orange-600" : "text-gray-300"}`}>
                            {r.dailyTotal > 0 ? `₹${r.dailyTotal}` : "—"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-orange-50 border-t-2 border-orange-100 font-bold">
                    <td className="px-6 py-4 text-gray-700">Monthly Totals</td>
                    <td className="px-4 py-4 text-center text-amber-600">
                      {dailyRecords.filter(r => r.breakfast).length}d
                    </td>
                    <td className="px-4 py-4 text-center text-orange-600">
                      {dailyRecords.filter(r => r.lunch).length}d
                    </td>
                    <td className="px-4 py-4 text-center text-indigo-600">
                      {dailyRecords.filter(r => r.dinner).length}d
                    </td>
                    <td className="px-6 py-4 text-right text-orange-600 text-lg">
                      ₹{foodCharges.toLocaleString("en-IN")}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Bill Summary + Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bill Summary */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                <MdReceiptLong className="text-orange-500" /> Bill Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600 text-sm font-medium flex items-center gap-2"><FiHome className="text-blue-400" /> Student</span>
                  <span className="font-bold text-gray-800">{selectedStudent.name}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600 text-sm font-medium">Room</span>
                  <span className="font-bold text-gray-800">Room {selectedStudent.roomNumber}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600 text-sm font-medium">Month</span>
                  <span className="font-bold text-gray-800">{formatMonth(month)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600 text-sm font-medium">Room Rent</span>
                  <span className="font-bold text-gray-800">₹{roomRent.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600 text-sm font-medium">Food Charges</span>
                  <span className="font-bold text-orange-600">₹{foodCharges.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between items-center py-3 bg-orange-50 -mx-1 px-4 rounded-xl mt-2">
                  <span className="font-black text-gray-800 text-lg">Grand Total</span>
                  <span className="font-black text-orange-600 text-2xl">₹{totalAmount.toLocaleString("en-IN")}</span>
                </div>
                {/* Payment Status */}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Payment Status</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-black uppercase border ${(statusConfig[paymentStatus] || statusConfig.pending).cls}`}>
                    {(statusConfig[paymentStatus] || statusConfig.pending).label}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4">
              <h3 className="font-bold text-gray-700 mb-2">Actions</h3>

              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-gray-800 hover:bg-gray-900 text-white font-bold transition-all shadow-sm disabled:opacity-50"
              >
                {saving ? <FiLoader className="animate-spin" /> : <FiSave />}
                {saving ? "Saving…" : "Save Meal Record"}
              </button>

              <button
                onClick={handleGenerateBill}
                disabled={generating || saving}
                className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold transition-all shadow-md shadow-orange-200 disabled:opacity-50"
              >
                {generating ? <FiLoader className="animate-spin" /> : <MdReceiptLong />}
                {generating ? "Generating…" : "Generate Monthly Bill"}
              </button>

              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Update Payment Status</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleMarkPaid}
                    disabled={updatingStatus || paymentStatus === "paid"}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold transition-all disabled:opacity-40"
                  >
                    <FiCheckCircle /> Mark PAID
                  </button>
                  <button
                    onClick={handleMarkOverdue}
                    disabled={updatingStatus || paymentStatus === "paid"}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold transition-all disabled:opacity-40"
                  >
                    <FiAlertCircle /> Mark OVERDUE
                  </button>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-3 text-xs text-gray-400 leading-relaxed">
                <p>• <strong>Save</strong> stores the daily meal data to the database.</p>
                <p>• <strong>Generate Bill</strong> finalises the bill and emails the student.</p>
                <p>• Use status buttons after the student pays.</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default FoodTracker;
