import { useState } from "react";
import API from "../../utils/api";
import { FiMessageSquare, FiSend } from "react-icons/fi";

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
      setSuccess("Your query has been submitted successfully!");
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
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Raise a Query</h1>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-orange-500 px-6 py-4">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <FiMessageSquare /> Submit Your Question
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
                rows="5"
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
                  <option value="room">Room</option>
                  <option value="food">Food</option>
                  <option value="billing">Billing</option>
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
    </div>
  );
};

export default RaiseQuery;