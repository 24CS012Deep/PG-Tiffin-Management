import { useEffect, useState } from "react";
import API from "../../utils/api";
import { FiDollarSign, FiCheckCircle, FiTrash2 } from "react-icons/fi";

const Billing = () => {
  const [billings, setBillings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchBillings();
  }, []);

  const fetchBillings = async () => {
    try {
      setLoading(true);
      const res = await API.get("/admin/billings");
      setBillings(res.data);
      setError("");
    } catch (err) {
      console.error("Failed to fetch billings:", err);
      setError("Failed to load billings");
    } finally {
      setLoading(false);
    }
  };

  const generateBills = async () => {
    try {
      setGenerating(true);
      const currentMonth = new Date().toISOString().slice(0, 7);
      await API.post("/admin/billings/generate", {
        month: currentMonth,
        type: "tiffin"
      });
      fetchBillings();
      alert("Bills generated successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to generate bills");
    } finally {
      setGenerating(false);
    }
  };

  const updateBillingStatus = async (id, status, paymentMethod = "") => {
    try {
      await API.put(`/admin/billings/${id}/status`, {
        status,
        paymentMethod,
        transactionId: `TXN${Date.now()}`
      });
      fetchBillings();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update billing");
    }
  };

  const deleteBilling = async (id) => {
    if (window.confirm("Are you sure you want to delete this bill?")) {
      try {
        await API.delete(`/admin/billings/${id}`);
        fetchBillings();
      } catch (err) {
        alert(err.response?.data?.message || "Failed to delete billing");
      }
    }
  };

  const generateTxtBill = (billing) => {
    const date = new Date().toLocaleDateString();
    const content = `
SWADBOX BILL
============
Date: ${date}
Bill ID: ${billing._id}

Customer: ${billing.user?.name}
Email: ${billing.user?.email}
Role: ${billing.user?.role}

Month: ${billing.month}
Type: ${billing.type}
Amount: ₹${billing.amount}
Status: ${billing.status}
${billing.paidAt ? `Paid On: ${new Date(billing.paidAt).toLocaleDateString()}` : ''}

Thank you for choosing SwadBox!
    `;

    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Bill_${billing.user?.name}_${billing.month}.txt`;
    link.click();
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'paid': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'overdue': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Monthly Billing</h2>
        <button
          onClick={generateBills}
          disabled={generating}
          className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition flex items-center gap-2 disabled:opacity-50"
        >
          <FiDollarSign />
          {generating ? "Generating..." : "Generate Bills"}
        </button>
      </div>

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
              <th className="pb-3">Role</th>
              <th className="pb-3">Month</th>
              <th className="pb-3">Type</th>
              <th className="pb-3">Amount</th>
              <th className="pb-3">Status</th>
              <th className="pb-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {billings.length > 0 ? (
              billings.map((billing) => (
                <tr key={billing._id} className="border-b last:border-0">
                  <td className="py-3">{billing.user?.name}</td>
                  <td className="py-3">{billing.user?.role}</td>
                  <td className="py-3">{billing.month}</td>
                  <td className="py-3">{billing.type}</td>
                  <td className="py-3 font-medium">₹{billing.amount}</td>
                  <td className="py-3">
                    <select
                      value={billing.status}
                      onChange={(e) => updateBillingStatus(billing._id, e.target.value)}
                      className={`px-2 py-1 rounded text-xs border ${getStatusColor(billing.status)}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="overdue">Overdue</option>
                    </select>
                  </td>
                  <td className="py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => generateTxtBill(billing)}
                        className="text-blue-500 hover:text-blue-600 text-sm"
                        title="Download Bill"
                      >
                        📄
                      </button>
                      <button
                        onClick={() => deleteBilling(billing._id)}
                        className="text-red-500 hover:text-red-600"
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
                  No bills found. Click "Generate Bills" to create monthly bills.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Billing;