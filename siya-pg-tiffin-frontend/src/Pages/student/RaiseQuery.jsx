import { useState } from "react";
import API from "../../utils/api";
import { FiMessageSquare, FiSend, FiLifeBuoy, FiInfo, FiTag, FiClock, FiAlertCircle } from "react-icons/fi";

const RaiseQuery = () => {
  const [formData, setFormData] = useState({
    question: "",
    category: "general",
    priority: "medium"
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

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
      await API.post("/student/queries", formData);
      setSuccess("Your query has been submitted successfully! The admin will review it shortly.");
      setFormData({
        question: "",
        category: "general",
        priority: "medium"
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit query");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-10 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold flex items-center gap-4 text-gray-800 tracking-tight">
            <span className="bg-gradient-to-r from-orange-400 to-amber-500 w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-200">
               <FiLifeBuoy />
            </span>
            Help Center
          </h1>
          <p className="text-gray-500 text-sm mt-2 ml-1 font-medium">Raise a support ticket for room, food, or billing issues.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative">
        {/* Top Gradient Banner */}
        <div className="h-2 w-full bg-gradient-to-r from-orange-400 via-orange-500 to-amber-500"></div>
        
        <div className="p-8 md:p-10">
          {success && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-5 py-4 rounded-xl shadow-sm mb-8 flex items-start gap-3">
              <FiInfo className="text-emerald-500 text-xl flex-shrink-0 mt-0.5" /> 
              <span className="font-medium text-sm leading-relaxed">{success}</span>
            </div>
          )}
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl shadow-sm mb-8 flex items-start gap-3">
              <FiInfo className="text-red-500 text-xl flex-shrink-0 mt-0.5" /> 
              <span className="font-medium text-sm leading-relaxed">{error}</span>
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-10">
            {/* Form Section */}
            <form onSubmit={handleSubmit} className="flex-1 space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                  Describe the Issue <span className="text-orange-500">*</span>
                </label>
                <textarea
                  name="question"
                  value={formData.question}
                  onChange={handleChange}
                  required
                  rows="6"
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 focus:bg-white focus:ring-4 focus:ring-orange-100 focus:border-orange-500 outline-none transition-all resize-none shadow-sm text-gray-800 placeholder-gray-400 font-medium"
                  placeholder="E.g., The AC in Room 102 is making a strange noise."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide flex items-center gap-2">
                    <FiTag className="text-gray-400" /> Category
                  </label>
                  <div className="relative">
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3.5 focus:bg-white focus:ring-4 focus:ring-orange-100 focus:border-orange-500 outline-none transition-all appearance-none cursor-pointer shadow-sm text-gray-800 font-semibold"
                    >
                      <option value="general">General Inquiry</option>
                      <option value="room">Room / Maintenance</option>
                      <option value="food">Food / Mess</option>
                      <option value="billing">Billing / Invoices</option>
                    </select>
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                      <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide flex items-center gap-2">
                    <FiClock className="text-gray-400" /> Priority
                  </label>
                  <div className="relative">
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleChange}
                      className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3.5 focus:bg-white focus:ring-4 focus:ring-orange-100 focus:border-orange-500 outline-none transition-all appearance-none cursor-pointer shadow-sm text-gray-800 font-semibold"
                    >
                      <option value="low">Low (Standard)</option>
                      <option value="medium">Medium</option>
                      <option value="high">High (Urgent)</option>
                    </select>
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                      <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full md:w-auto bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-4 rounded-xl hover:from-orange-600 hover:to-orange-700 transition flex items-center justify-center gap-3 shadow-lg shadow-orange-200 disabled:opacity-50 font-bold text-lg"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      Submit Ticket <FiSend />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Help Info Sidebar */}
            <div className="w-full lg:w-72 mt-8 lg:mt-0 flex flex-col gap-4">
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-100/50 to-transparent rounded-bl-full pointer-events-none"></div>
                <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center text-xl mb-4 relative z-10">
                  <FiMessageSquare />
                </div>
                <h4 className="text-gray-800 font-bold mb-2">We're here to help</h4>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Most support tickets are resolved within 2-4 hours during business days.
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100/50 to-transparent rounded-bl-full pointer-events-none"></div>
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center text-xl mb-4 relative z-10">
                  <FiAlertCircle />
                </div>
                <h4 className="text-gray-800 font-bold mb-2">Urgent Issues?</h4>
                <p className="text-gray-500 text-sm leading-relaxed">
                  For extremely urgent maintenance emergencies, please contact the PG warden directly on their mobile.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RaiseQuery;