import { useEffect, useState } from "react";
import API from "../../utils/api";
import { 
  FiUsers, FiSearch, FiUser, FiMail, FiPhone, FiCalendar, FiFilter, 
  FiX, FiChevronLeft, FiChevronRight, FiUserPlus, FiRefreshCw, FiShield,
  FiUserX, FiUserCheck, FiEye, FiMapPin
} from "react-icons/fi";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Get current logged-in user
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const isAdmin = currentUser?.role === "admin";
  
  const [addForm, setAddForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "admin",
    phone: "",
    address: "",
    roomNumber: ""
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await API.get("/admin/users");
      setUsers(res.data.users);
      setError("");
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!isAdmin) return;
    try {
      await API.post("/auth/register", addForm);
      setShowAddModal(false);
      fetchUsers();
      setAddForm({
        name: "",
        email: "",
        password: "",
        role: "admin",
        phone: "",
        address: "",
        roomNumber: ""
      });
      alert("User added successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add user");
    }
  };

  const handleBlockToggle = async (user) => {
    if (!isAdmin) return;
    const action = user.isBlocked ? "unblock" : "block";
    if (window.confirm(`Are you sure you want to ${action} ${user.name}?`)) {
      try {
        await API.put(`/admin/users/${user._id}`, {
          ...user,
          isBlocked: !user.isBlocked
        });
        fetchUsers();
        alert(`User ${action}ed successfully!`);
      } catch (err) {
        alert(err.response?.data?.message || `Failed to ${action} user`);
      }
    }
  };

  const handleViewStats = (user) => {
    setSelectedUser(user);
    setShowStatsModal(true);
  };

  const filteredUsers = users
    .filter((user) => (roleFilter ? user.role === roleFilter : true))
    .filter((user) => (statusFilter ? (statusFilter === "active" ? !user.isBlocked : user.isBlocked) : true))
    .filter((user) => 
      searchTerm ? 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.phone && user.phone.includes(searchTerm))
      : true
    );

  const getInitials = (name) => {
    return name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();
  };

  const getRoleIcon = (role) => {
    switch(role) {
      case 'admin': return <FiShield className="text-indigo-500" />;
      default: return <FiUser className="text-blue-500" />;
    }
  };

  const getRoleBadgeClass = (role) => {
    switch(role) {
      case 'admin': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'student': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default: return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        <p className="mt-4 text-gray-500">Loading users...</p>
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
                <FiUsers />
              </span>
              User Management
            </h2>
          </div>
          
          {/* Only Admin (Super Admin) can add users */}
          {isAdmin && (
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition flex items-center gap-2 text-sm font-medium shadow-lg shadow-orange-200"
            >
              <FiUserPlus /> Add New User
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded shadow-sm mb-6">
          {error}
        </div>
      )}

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-lg focus:ring-2 focus:ring-orange-500 transition-all text-sm"
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
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="pl-9 pr-4 py-2 bg-gray-50 border-none rounded-lg focus:ring-2 focus:ring-orange-500 text-sm outline-none appearance-none"
              >
                <option value="">All Roles</option>
                <option value="admin">Admins</option>
                <option value="student">Students</option>
                <option value="customer">Customers</option>
              </select>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-gray-50 border-none rounded-lg focus:ring-2 focus:ring-orange-500 text-sm outline-none"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="blocked">Blocked</option>
            </select>
            <button
              onClick={() => {
                setRoleFilter("");
                setStatusFilter("");
                setSearchTerm("");
              }}
              className="text-orange-500 hover:text-orange-600 text-sm flex items-center gap-1"
            >
              <FiRefreshCw /> Reset
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentUsers.length > 0 ? (
                currentUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-orange-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white font-bold shadow-sm flex-shrink-0">
                          {getInitials(user.name)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{user.name}</p>
                          <p className="text-gray-400 text-xs flex items-center gap-1">
                            <FiMail className="text-[10px]" /> {user.email}
                          </p>
                          {user.address && (
                            <a 
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(user.address)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] text-orange-500 hover:text-orange-600 font-bold flex items-center gap-1 mt-1 transition-colors"
                            >
                              <FiMapPin className="text-[10px]" /> Map View
                            </a>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {user.phone ? (
                        <div className="flex items-center gap-1 text-gray-600 text-sm">
                          <FiPhone className="text-gray-400" /> {user.phone}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">No phone</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${getRoleBadgeClass(user.role)}`}>
                        {getRoleIcon(user.role)}
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                        user.isBlocked ? 'bg-red-50 text-red-700 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${user.isBlocked ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
                        {user.isBlocked ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">
                      <div className="flex items-center gap-1">
                        <FiCalendar className="text-[10px]" />
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        {/* View Details - Visible to everyone */}
                        <button
                          onClick={() => handleViewStats(user)}
                          className="p-2 text-gray-500 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <FiEye />
                        </button>
                        
                        {/* Block/Unblock - Only Super Admin */}
                        {isAdmin && (
                          <button
                            onClick={() => handleBlockToggle(user)}
                            className={`p-2 rounded-lg transition-colors ${
                              user.isBlocked 
                                ? 'text-emerald-600 hover:bg-emerald-50' 
                                : 'text-amber-600 hover:bg-amber-50'
                            }`}
                            title={user.isBlocked ? "Unblock User" : "Block User"}
                          >
                            {user.isBlocked ? <FiUserCheck /> : <FiUserX />}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <FiUsers className="text-4xl mb-3 text-gray-300" />
                      <p className="text-base font-medium text-gray-800">No users found</p>
                      <p className="text-sm">Try adjusting your search or filters.</p>
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
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredUsers.length)} of {filteredUsers.length} users
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiChevronLeft />
              </button>
              <span className="px-4 py-2 text-sm font-medium text-orange-600 bg-orange-50 rounded-lg">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiChevronRight />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add User Modal - Orange Theme, Only Admin Role Option */}
      {showAddModal && isAdmin && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-5 text-white">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <FiUserPlus /> Add New User
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="absolute top-5 right-5 text-white hover:text-orange-200"
              >
                <FiX />
              </button>
            </div>
            <form onSubmit={handleAddUser} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={addForm.name}
                  onChange={(e) => setAddForm({...addForm, name: e.target.value})}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={addForm.email}
                  onChange={(e) => setAddForm({...addForm, email: e.target.value})}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                <input
                  type="password"
                  value={addForm.password}
                  onChange={(e) => setAddForm({...addForm, password: e.target.value})}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                  required
                />
                <p className="text-xs text-gray-400 mt-1">Minimum 6 characters</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={addForm.phone}
                    onChange={(e) => setAddForm({...addForm, phone: e.target.value})}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                    placeholder="e.g. 9876543210"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Internal Role</label>
                  <select
                    value={addForm.role}
                    onChange={(e) => setAddForm({...addForm, role: e.target.value})}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none bg-orange-50 font-bold text-orange-700"
                  >
                    <option value="admin">Admin / Sub-Admin</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Permanent Address</label>
                <textarea
                  value={addForm.address}
                  onChange={(e) => setAddForm({...addForm, address: e.target.value})}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none resize-none"
                  rows="2"
                  placeholder="Street, City, State, ZIP"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 px-4 py-2.5 rounded-xl font-medium hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-orange-500 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-orange-600"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Details Modal - Orange Theme */}
      {showStatsModal && selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-5 text-white">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <FiUsers /> User Details
              </h3>
              <button
                onClick={() => setShowStatsModal(false)}
                className="absolute top-5 right-5 text-white hover:text-orange-200"
              >
                <FiX />
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                  {getInitials(selectedUser.name)}
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-800">{selectedUser.name}</h4>
                  <p className="text-gray-500">{selectedUser.email}</p>
                  {selectedUser.phone && <p className="text-gray-500 text-sm">{selectedUser.phone}</p>}
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Role</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getRoleBadgeClass(selectedUser.role)}`}>
                    {selectedUser.role}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${selectedUser.isBlocked ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
                    {selectedUser.isBlocked ? 'Blocked' : 'Active'}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Joined</span>
                  <span className="text-gray-700">{new Date(selectedUser.createdAt).toLocaleDateString()}</span>
                </div>
                {selectedUser.address && (
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">Address</span>
                    <span className="text-gray-700 text-right">{selectedUser.address}</span>
                  </div>
                )}
                {selectedUser.deliveryPreference && (
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">Preference</span>
                    <span className="text-gray-700 font-semibold capitalize">{selectedUser.deliveryPreference}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
