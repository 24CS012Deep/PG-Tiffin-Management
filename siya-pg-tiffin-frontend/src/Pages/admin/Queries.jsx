import { useEffect, useState } from "react";
import API from "../../utils/api";
import { FiCheckCircle, FiTrash2, FiMessageSquare, FiClock, FiSearch, FiX } from "react-icons/fi";
import { MdOutlineSupportAgent } from "react-icons/md";

const Queries = () => {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAnswerModal, setShowAnswerModal] = useState(false);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [answer, setAnswer] = useState("");
  const [filter, setFilter] = useState("all"); // 'all', 'open', 'closed'
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchQueries();
  }, []);

  const fetchQueries = async () => {
    try {
      setLoading(true);
      const res = await API.get("/admin/queries");
      // Sort: open first, then by date newest
      const sorted = res.data.sort((a, b) => {
        if (a.status !== b.status) return a.status === 'open' ? -1 : 1;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      setQueries(sorted);
      setError("");
    } catch (err) {
      console.error("Failed to fetch queries:", err);
      setError("Failed to load user queries.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = async (e) => {
    e.preventDefault();
    if (!answer.trim()) return;
    
    try {
      await API.put(`/admin/queries/${selectedQuery._id}/answer`, { answer });
      setShowAnswerModal(false);
      setAnswer("");
      fetchQueries();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit answer");
    }
  };

  const deleteQuery = async (id) => {
    if (window.confirm("Are you sure you want to permanently delete this query?")) {
      try {
        await API.delete(`/admin/queries/${id}`);
        fetchQueries();
      } catch (err) {
        alert(err.response?.data?.message || "Failed to delete query");
      }
    }
  };

  const getPriorityBadge = (priority) => {
    switch(priority) {
      case 'high': 
        return <span className="bg-red-50 text-red-600 border border-red-200 px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>High</span>;
      case 'medium': 
        return <span className="bg-amber-50 text-amber-600 border border-amber-200 px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>Medium</span>;
      case 'low': 
        return <span className="bg-emerald-50 text-emerald-600 border border-emerald-200 px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>Low</span>;
      default: 
        return <span className="bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full text-xs font-semibold">Unknown</span>;
    }
  };

  const getStatusBadge = (status) => {
    return status === 'open' 
      ? <span className="text-amber-600 bg-amber-50 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1"><FiClock /> Pending</span>
      : <span className="text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1"><FiCheckCircle /> Resolved</span>;
  };

  const getCategoryColor = (cat) => {
    const categories = {
      'room': 'bg-violet-100 text-violet-700',
      'food': 'bg-orange-100 text-orange-700',
      'billing': 'bg-blue-100 text-blue-700',
      'general': 'bg-gray-100 text-gray-700'
    };
    return categories[cat] || categories['general'];
  };

  const filteredQueries = queries
    .filter(q => filter === 'all' || q.status === filter)
    .filter(q => 
        searchTerm === "" || 
        q.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
        q.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-3 text-gray-800">
            <span className="bg-gradient-to-r from-orange-400 to-orange-600 text-white p-2 rounded-xl shadow-lg">
              <MdOutlineSupportAgent />
            </span>
            Support Tickets
          </h2>
          <p className="text-gray-500 text-sm mt-1">Manage and resolve student and customer inquiries.</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded shadow-sm mb-6">
          {error}
        </div>
      )}

      {/* Control Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search tickets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-lg focus:ring-2 focus:ring-orange-500 transition-all text-sm outline-none"
          />
        </div>
        <div className="flex bg-gray-50 rounded-lg p-1">
          {['all', 'open', 'closed'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all capitalize ${
                filter === f 
                ? 'bg-white text-orange-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Tickets List */}
      <div className="grid gap-4">
        {filteredQueries.length > 0 ? (
          filteredQueries.map((query) => (
            <div 
              key={query._id} 
              className={`bg-white rounded-xl shadow-sm border transition-all hover:shadow-md ${
                query.status === 'open' ? 'border-l-4 border-l-orange-500 border-y-gray-100 border-r-gray-100' : 'border-gray-100 opacity-80'
              }`}
            >
              <div className="p-5 flex flex-col md:flex-row gap-5">
                {/* User & Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3 text-sm">
                    <span className="font-semibold text-gray-800 bg-gray-100 px-2.5 py-1 rounded-md">
                      {query.user?.name || "Unknown User"}
                    </span>
                    <span className="text-gray-400 font-medium">
                      {new Date(query.createdAt).toLocaleDateString()}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${getCategoryColor(query.category)}`}>
                      {query.category}
                    </span>
                    {getPriorityBadge(query.priority)}
                  </div>
                  
                  <p className="text-gray-800 text-base font-medium">{query.question}</p>
                  
                  {query.status === 'closed' && query.answer && (
                    <div className="mt-4 bg-gray-50 border border-gray-100 rounded-xl p-4 flex gap-3">
                      <div className="mt-0.5 text-emerald-500"><FiCheckCircle className="text-lg" /></div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">Response</p>
                        <p className="text-gray-700 text-sm">{query.answer}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex md:flex-col justify-between items-end gap-3 min-w-[120px]">
                  {getStatusBadge(query.status)}
                  
                  <div className="flex gap-2 w-full justify-end">
                    {query.status === 'open' && (
                      <button
                        onClick={() => {
                          setSelectedQuery(query);
                          setShowAnswerModal(true);
                        }}
                        className="flex items-center justify-center gap-2 bg-gradient-to-r from-orange-400 to-orange-500 text-white px-4 py-2 rounded-lg hover:to-orange-600 transition-all font-medium text-sm shadow-sm"
                      >
                        <FiMessageSquare /> Reply
                      </button>
                    )}
                    <button
                      onClick={() => deleteQuery(query._id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all border border-transparent hover:border-red-100"
                      title="Delete Ticket"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
             <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <FiMessageSquare className="text-2xl text-gray-300" />
             </div>
             <p className="text-lg font-medium text-gray-800">No tickets found</p>
             <p className="text-sm text-gray-500 mt-1">Check back later or adjust your filters.</p>
          </div>
        )}
      </div>

      {/* Answer Modal */}
      {showAnswerModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-5 text-white flex justify-between items-center">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <MdOutlineSupportAgent /> Reply to Ticket
              </h3>
              <button
                type="button"
                onClick={() => { setShowAnswerModal(false); setAnswer(""); }}
                className="text-white/70 hover:text-white hover:bg-white/20 p-1.5 rounded-lg transition-all"
              >
                <FiX size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAnswer} className="flex flex-col flex-1 min-h-0">
              <div className="p-6 overflow-y-auto">
                <div className="mb-6 bg-orange-50/50 p-4 rounded-xl border border-orange-100">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-gray-800">{selectedQuery?.user?.name}</span>
                    <span className="text-gray-400 text-xs">{new Date(selectedQuery?.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    "{selectedQuery?.question}"
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                    Your Resolution
                  </label>
                  <textarea
                    placeholder="Type your answer here. This will be sent to the user and mark the ticket as resolved..."
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none text-gray-700 block"
                    rows="6"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 p-6 pt-0 mt-auto">
                <button
                  type="button"
                  onClick={() => {
                    setShowAnswerModal(false);
                    setAnswer("");
                  }}
                  className="w-1/3 bg-gray-100 text-gray-700 px-4 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-2/3 bg-orange-500 text-white px-4 py-3 rounded-xl font-medium hover:bg-orange-600 transition-colors shadow-lg shadow-orange-200 flex items-center justify-center gap-2"
                >
                  <FiCheckCircle /> Resolve & Send Reply
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Queries;