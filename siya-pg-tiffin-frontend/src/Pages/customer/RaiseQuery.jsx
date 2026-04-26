import { useState, useEffect } from "react";
import API from "../../utils/api";
import { FiMessageSquare, FiSend, FiClock, FiCheckCircle, FiAlertCircle, FiLifeBuoy, FiTag } from "react-icons/fi";
import { MdOutlineSupportAgent } from "react-icons/md";

const RaiseQuery = () => {
  const [formData, setFormData] = useState({
    question: "",
    category: "general",
    priority: "medium",
  });
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchQueries();
  }, []);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const fetchQueries = async () => {
    try {
      setFetchLoading(true);
      const res = await API.get("/customer/queries");
      setQueries(res.data);
    } catch (err) {
      console.error("Failed to fetch queries:", err);
    } finally {
      setFetchLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await API.post("/customer/queries", formData);
      setSuccess("Your query has been submitted successfully! The admin will review it shortly.");
      setFormData({ question: "", category: "general", priority: "medium" });
      fetchQueries();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit query");
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    return status === "open"
      ? { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500", label: "Open" }
      : { bg: "bg-gray-50", text: "text-gray-600", border: "border-gray-200", dot: "bg-gray-400", label: "Closed" };
  };

  const getPriorityConfig = (priority) => {
    switch (priority) {
      case "high":
        return { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", label: "High" };
      case "medium":
        return { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", label: "Medium" };
      case "low":
        return { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", label: "Low" };
      default:
        return { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200", label: priority };
    }
  };

  return (
    <div className="min-h-screen pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3 text-gray-800">
            <span className="bg-gradient-to-r from-orange-400 to-orange-600 text-white p-2 rounded-xl shadow-lg">
              <FiLifeBuoy />
            </span>
            Support & Queries
          </h1>
          <p className="text-gray-500 text-sm mt-1">Submit a support ticket or view your previous queries.</p>
        </div>
      </div>

      {/* Alerts */}
      {success && (
        <div className="bg-emerald-50 border-l-4 border-emerald-500 text-emerald-700 px-5 py-3 rounded-r-xl mb-6 flex items-center gap-3">
          <FiCheckCircle className="text-lg flex-shrink-0" />
          <span className="text-sm font-medium">{success}</span>
        </div>
      )}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-5 py-3 rounded-r-xl mb-6 flex items-center gap-3">
          <FiAlertCircle className="text-lg flex-shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Submit Query Form */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="h-1.5 w-full bg-gradient-to-r from-orange-400 via-orange-500 to-amber-500"></div>
            <div className="p-6 md:p-8">
              <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                <MdOutlineSupportAgent className="text-orange-500" /> Submit a New Query
              </h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                    Describe the Issue <span className="text-orange-500">*</span>
                  </label>
                  <textarea
                    name="question"
                    value={formData.question}
                    onChange={handleChange}
                    required
                    rows="5"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all resize-none text-gray-800 placeholder-gray-400 font-medium"
                    placeholder="E.g., My tiffin delivery was late today..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide items-center gap-2">
                      <FiTag className="text-gray-400" /> Category
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-3 focus:ring-2 focus:ring-orange-500 outline-none appearance-none cursor-pointer text-gray-800 font-semibold"
                    >
                      <option value="general">General</option>
                      <option value="food">Food / Quality</option>
                      <option value="billing">Billing</option>
                      <option value="delivery">Delivery</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide items-center gap-2">
                      <FiClock className="text-gray-400" /> Priority
                    </label>
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleChange}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-3 focus:ring-2 focus:ring-orange-500 outline-none appearance-none cursor-pointer text-gray-800 font-semibold"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High (Urgent)</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full md:w-auto bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-3.5 rounded-xl hover:from-orange-600 hover:to-orange-700 transition flex items-center justify-center gap-3 shadow-lg shadow-orange-200 disabled:opacity-50 font-bold"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>Submit Ticket <FiSend /></>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Previous Queries */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-6">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="font-bold text-gray-800 flex items-center gap-2">
                <FiClock className="text-orange-500" /> Previous Queries
              </h2>
              <span className="bg-orange-50 text-orange-600 text-xs font-bold px-2 py-1 rounded-full">
                {queries.length}
              </span>
            </div>

            <div className="max-h-[500px] overflow-y-auto">
              {fetchLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                </div>
              ) : queries.length === 0 ? (
                <div className="py-12 text-center px-6">
                  <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <MdOutlineSupportAgent className="text-xl text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-sm font-medium">No queries yet</p>
                  <p className="text-gray-400 text-xs mt-1">Submit your first support ticket above</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {queries.map((query) => {
                    const statusConfig = getStatusConfig(query.status);
                    const priorityConfig = getPriorityConfig(query.priority);
                    return (
                      <div key={query._id} className="p-5 hover:bg-orange-50/30 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`}></span>
                            {statusConfig.label}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${priorityConfig.bg} ${priorityConfig.text} ${priorityConfig.border}`}>
                            {priorityConfig.label}
                          </span>
                        </div>
                        <p className="text-gray-800 text-sm font-medium mb-2 line-clamp-2">{query.question}</p>
                        {query.answer && (
                          <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl mt-2">
                            <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                              <FiCheckCircle className="text-emerald-500" /> Admin Response
                            </p>
                            <p className="text-xs text-gray-700 leading-relaxed">{query.answer}</p>
                          </div>
                        )}
                        <p className="text-[10px] text-gray-400 mt-2">
                          {new Date(query.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RaiseQuery;
