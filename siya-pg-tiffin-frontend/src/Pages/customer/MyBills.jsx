import { useEffect, useState } from "react";
import API from "../../utils/api";
import { FiDollarSign, FiDownload } from "react-icons/fi";

const MyBills = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      setLoading(true);
      const res = await API.get("/customer/billings");
      setBills(res.data);
      setError("");
    } catch (err) {
      console.error("Failed to fetch bills:", err);
      setError("Failed to load bills");
    } finally {
      setLoading(false);
    }
  };

  const downloadBill = (bill) => {
    const content = `
SWADBOX BILL
============
Date: ${new Date().toLocaleDateString()}
Bill ID: ${bill._id}

Customer: ${bill.user?.name}
Email: ${bill.user?.email}

Month: ${bill.month}
Type: ${bill.type}
Amount: ₹${bill.amount}
Status: ${bill.status}
${bill.paidAt ? `Paid On: ${new Date(bill.paidAt).toLocaleDateString()}` : ''}

Thank you for choosing SwadBox!
    `;
    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Bill_${bill.month}.txt`;
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

  const totalPending = bills.filter(b => b.status === 'pending').reduce((sum, b) => sum + b.amount, 0);
  const totalPaid = bills.filter(b => b.status === 'paid').reduce((sum, b) => sum + b.amount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">My Bills</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-gray-500 text-sm">Total Bills</p>
          <p className="text-3xl font-bold mt-2">{bills.length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-gray-500 text-sm">Total Paid</p>
          <p className="text-3xl font-bold text-green-600 mt-2">₹{totalPaid}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-gray-500 text-sm">Pending Amount</p>
          <p className="text-3xl font-bold text-yellow-600 mt-2">₹{totalPending}</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {bills.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <FiDollarSign className="text-5xl text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Bills Found</h2>
          <p className="text-gray-500">You don't have any bills yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {bills.map((bill) => (
                <tr key={bill._id}>
                  <td className="px-6 py-4 whitespace-nowrap">{bill.month}</td>
                  <td className="px-6 py-4 whitespace-nowrap capitalize">{bill.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">₹{bill.amount}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(bill.status)}`}>
                      {bill.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => downloadBill(bill)}
                      className="text-orange-500 hover:text-orange-600 flex items-center gap-1"
                    >
                      <FiDownload /> Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MyBills;