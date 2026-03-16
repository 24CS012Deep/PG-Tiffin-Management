import { useState, useEffect } from "react";
import API from "../../utils/api";
import { FiMessageSquare, FiSend, FiClock } from "react-icons/fi";

const RaiseQuery = () => {
  const [formData, setFormData] = useState({
    question: "",
    category: "general",
    priority: "medium"
  });
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchQueries();
  }, []);

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
      setSuccess("Your query has been submitted successfully!");
      setFormData({
        question: "",
        category: "general",
        priority: "medium"
      });
      fetchQueries(); // Refresh the list
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit query");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    return status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700';
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Support & Queries</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Submit Query Form */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-orange-500 px-6 py-4">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <FiMessageSquare /> Raise a Query
            </h2>
          </div>

          <div className="p-6">
            {success && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
                {success}
              </div>
            )}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Question *
                </label>
                <textarea
                  name="question"
                  value={formData.question}
                  onChange={handleChange}
                  required
                  rows="4"
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500"
                  placeholder="Type your question here..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="general">General</option>
                    <option value="food">Food</option>
                    <option value="billing">Billing</option>
                    <option value="delivery">Delivery</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? "Submitting..." : (
                  <>
                    <FiSend /> Submit Query
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Previous Queries */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gray-700 px-6 py-4">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <FiClock /> Your Previous Queries
            </h2>
          </div>

          <div className="p-6 max-h-96 overflow-y-auto">
            {fetchLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
              </div>
            ) : queries.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No queries yet</p>
            ) : (
              <div className="space-y-4">
                {queries.map((query) => (
                  <div key={query._id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(query.status)}`}>
                        {query.status}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(query.priority)}`}>
                        {query.priority}
                      </span>
                    </div>
                    <p className="text-gray-800 mb-2">{query.question}</p>
                    {query.answer && (
                      <div className="bg-orange-50 p-3 rounded-lg mt-2">
                        <p className="text-sm font-medium text-orange-700 mb-1">Response:</p>
                        <p className="text-sm text-gray-700">{query.answer}</p>
                      </div>
                    )}
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(query.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RaiseQuery;