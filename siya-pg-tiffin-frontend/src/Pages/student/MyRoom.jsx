import { useEffect, useState } from "react";
import API from "../../utils/api";
import { FiHome, FiUsers } from "react-icons/fi";

const MyRoom = () => {
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchRoomDetails();
  }, []);

  const fetchRoomDetails = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem("user"));
      const res = await API.get("/student/rooms");
      const userRoom = res.data.find(room => 
        room.students?.some(s => s._id === user._id)
      );
      setRoom(userRoom);
      setError("");
    } catch (err) {
      console.error("Failed to fetch room:", err);
      setError("Failed to load room details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (!room) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center">
        <FiHome className="text-5xl text-yellow-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">No Room Assigned</h2>
        <p className="text-gray-600">You are not assigned to any room yet. Please contact the admin.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">My Room</h1>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-orange-500 px-6 py-4">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <FiHome /> Room {room.roomNumber}
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-gray-500 text-sm mb-1">Floor</p>
              <p className="text-lg font-medium">{room.floor}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm mb-1">Capacity</p>
              <p className="text-lg font-medium">{room.capacity} {room.capacity > 1 ? 'persons' : 'person'}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm mb-1">Monthly Rent</p>
              <p className="text-lg font-medium text-orange-600">₹{room.rent}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm mb-1">Room Type</p>
              <p className="text-lg font-medium">{room.roomType === 'ac' ? 'AC' : 'Non-AC'}</p>
            </div>
          </div>

          {room.amenities?.length > 0 && (
            <div className="mt-6">
              <p className="text-gray-500 text-sm mb-2">Amenities</p>
              <div className="flex flex-wrap gap-2">
                {room.amenities.map((a, i) => (
                  <span key={i} className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm">
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}

          {room.details && (
            <div className="mt-6">
              <p className="text-gray-500 text-sm mb-1">Additional Details</p>
              <p className="text-gray-700">{room.details}</p>
            </div>
          )}

          <div className="mt-6 border-t pt-6">
            <p className="text-gray-500 text-sm mb-3">Roommates</p>
            {room.students?.length > 0 ? (
              <ul className="space-y-2">
                {room.students.map((student) => (
                  <li key={student._id} className="flex items-center gap-2">
                    <FiUsers className="text-orange-500" />
                    <span>{student.name}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No other students assigned</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyRoom;