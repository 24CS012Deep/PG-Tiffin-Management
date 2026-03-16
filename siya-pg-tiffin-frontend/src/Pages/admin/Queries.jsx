import { useEffect, useState } from "react";
import API from "../../utils/api";
import { FiCheckCircle, FiTrash2, FiMessageSquare } from "react-icons/fi";

const Queries = () => {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAnswerModal, setShowAnswerModal] = useState(false);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [answer, setAnswer] = useState("");

  useEffect(() => {
    fetchQueries();
  }, []);

  const fetchQueries = async () => {
    try {
      setLoading(true);
      const res = await API.get("/admin/queries");
      setQueries(res.data);
      setError("");
    } catch (err) {
      console.error("Failed to fetch queries:", err);
      setError("Failed to load queries");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = async () => {
    if (!answer.trim()) {
      alert("Please enter an answer");
      return;
    }
    try {
      await API.put(`/admin/queries/${selectedQuery._id}/answer`, { answer });
      setShowAnswerModal(false);
      setAnswer("");
      fetchQueries();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to answer query");
    }
  };

  const deleteQuery = async (id) => {
    if (window.confirm("Are you sure you want to delete this query?")) {
      try {
        await API.delete(`/admin/queries/${id}`);
        fetchQueries();
      } catch (err) {
        alert(err.response?.data?.message || "Failed to delete query");
      }
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusColor = (status) => {
    return status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">User Queries</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <div className="bg-white p-6 rounded-xl shadow overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="pb-3">User</th>
              <th className="pb-3">Question</th>
              <th className="pb-3">Category</th>
              <th className="pb-3">Priority</th>
              <th className="pb-3">Status</th>
              <th className="pb-3">Date</th>
              <th className="pb-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {queries.length > 0 ? (
              queries.map((query) => (
                <tr key={query._id} className="border-b last:border-0">
                  <td className="py-3">{query.user?.name}</td>
                  <td className="py-3 max-w-xs">
                    <div className="truncate">{query.question}</div>
                  </td>
                  <td className="py-3">{query.category}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(query.priority)}`}>
                      {query.priority}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(query.status)}`}>
                      {query.status}
                    </span>
                  </td>
                  <td className="py-3">{new Date(query.createdAt).toLocaleDateString()}</td>
                  <td className="py-3">
                    <div className="flex gap-2">
                      {query.status === 'open' && (
                        <button
                          onClick={() => {
                            setSelectedQuery(query);
                            setShowAnswerModal(true);
                          }}
                          className="text-green-500 hover:text-green-600"
                          title="Answer"
                        >
                          <FiMessageSquare />
                        </button>
                      )}
                      <button
                        onClick={() => deleteQuery(query._id)}
                        className="text-red-500 hover:text-red-600"
                        title="Delete"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center py-8 text-gray-500">
                  No queries found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Answer Modal */}
      {showAnswerModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Answer Query</h3>
            <div className="mb-4">
              <p className="font-medium">Question:</p>
              <p className="text-gray-600 mt-1">{selectedQuery?.question}</p>
            </div>
            <div className="space-y-4">
              <textarea
                placeholder="Enter your answer"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="w-full border rounded-lg px-4 py-2"
                rows="4"
              />

              <div className="flex gap-3">
                <button
                  onClick={handleAnswer}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex-1"
                >
                  Submit Answer
                </button>
                <button
                  onClick={() => {
                    setShowAnswerModal(false);
                    setAnswer("");
                  }}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Queries;