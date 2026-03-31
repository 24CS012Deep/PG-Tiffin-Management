import { useEffect, useState } from "react";
import API from "../../utils/api";
import { 
  FiEdit2, FiTrash2, FiUserPlus, FiUserMinus, FiUsers, FiHome, FiDollarSign 
} from "react-icons/fi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSnowflake,
  faWind,
  faBed,
  faCouch,
  faToilet,
  faWifi,
  faBook,
  faFire,
  faDoorOpen,
  faTree,
  faCheckCircle,
  faPlusCircle,
  faUserGraduate,
  faUser,
  faEnvelope,
  faTag,
  faLayerGroup,
  faStar,
  faStarHalfAlt,
  faStar as faStarFull
} from "@fortawesome/free-solid-svg-icons";

const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [formData, setFormData] = useState({
    roomNumber: "",
    capacity: 2,
    rent: 5000,
    floor: 1,
    details: "",
    bedType: "single", // single, double, triple
    roomType: "non-ac",
    balcony: false,
  });

  const bedTypeOptions = [
    { value: "single", label: "Single Bed", icon: faBed },
    { value: "double", label: "Double Bed", icon: faBed },
    { value: "triple", label: "Triple Bed", icon: faBed },
  ];

  useEffect(() => {
    fetchRooms();
    fetchStudents();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const res = await API.get("/admin/rooms");
      setRooms(res.data);
      setError("");
    } catch (err) {
      console.error("Failed to fetch rooms:", err);
      setError("Failed to load rooms");
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await API.get("/admin/users");
      const studentList = res.data.users.filter(user => user.role === "student");
      setStudents(studentList);
    } catch (err) {
      console.error("Failed to fetch students:", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ 
      ...formData, 
      [name]: type === "checkbox" ? checked : value 
    });
  };

  const handleAmenityChange = (amenity) => {
    if (formData.amenities.includes(amenity)) {
      setFormData({
        ...formData,
        amenities: formData.amenities.filter(a => a !== amenity)
      });
    } else {
      setFormData({
        ...formData,
        amenities: [...formData.amenities, amenity]
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRoom) {
        await API.put(`/admin/rooms/${editingRoom._id}`, formData);
      } else {
        await API.post("/admin/rooms", formData);
      }
      setShowModal(false);
      resetForm();
      fetchRooms();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save room");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this room?")) {
      try {
        await API.delete(`/admin/rooms/${id}`);
        fetchRooms();
      } catch (err) {
        alert(err.response?.data?.message || "Failed to delete room");
      }
    }
  };

  const handleAssignStudent = async () => {
    if (!selectedStudent) {
      alert("Please select a student");
      return;
    }
    if (!selectedRoom || !selectedRoom._id) {
      alert("Room information missing. Please try again.");
      return;
    }
    try {
      const payload = {
        roomId: selectedRoom._id,
        studentId: selectedStudent
      };
      console.log("Assigning student with payload:", payload);
      console.log("Room capacity:", selectedRoom.capacity, "Current occupancy:", selectedRoom.students?.length || 0);
      
      const response = await API.post("/admin/rooms/assign", payload);
      console.log("Assignment successful:", response.data);
      
      setShowAssignModal(false);
      setSelectedStudent("");
      fetchRooms();
      fetchStudents();
      alert("Student assigned successfully!");
    } catch (err) {
      console.error("Assignment error:", err);
      const errorMessage = err.response?.data?.message || err.message || "Failed to assign student";
      console.log("Error details:", {
        status: err.response?.status,
        message: errorMessage,
        data: err.response?.data
      });
      alert(errorMessage);
    }
  };

  const handleRemoveStudent = async (roomId, studentId) => {
    if (window.confirm("Remove this student from room?")) {
      try {
        await API.post("/admin/rooms/remove", { roomId, studentId });
        fetchRooms();
        fetchStudents();
      } catch (err) {
        alert(err.response?.data?.message || "Failed to remove student");
      }
    }
  };

  const resetForm = () => {
    setFormData({
      roomNumber: "",
      capacity: 2,
      rent: 5000,
      floor: 1,
      details: "",
      amenities: [],
      bedType: "single",
      roomType: "non-ac",
      furnished: "semi",
      attachedBathroom: true,
      balcony: false,
    });
    setEditingRoom(null);
  };

  const openEditModal = (room) => {
    setEditingRoom(room);
    setFormData({
      roomNumber: room.roomNumber,
      capacity: room.capacity,
      rent: room.rent,
      floor: room.floor,
      details: room.details || "",
      amenities: room.amenities || [],
      bedType: room.bedType || "single",
      roomType: room.roomType || "non-ac",
      furnished: room.furnished || "semi",
      attachedBathroom: room.attachedBathroom !== undefined ? room.attachedBathroom : true,
      balcony: room.balcony || false,
    });
    setShowModal(true);
  };

  const openAssignModal = (room) => {
    setSelectedRoom(room);
    setShowAssignModal(true);
  };

  // Helper function to get bed type icon
  const getBedTypeIcon = (type) => {
    switch(type) {
      case 'single': return <FontAwesomeIcon icon={faBed} className="text-orange-500" />;
      case 'double': return (
        <span className="flex">
          <FontAwesomeIcon icon={faBed} className="text-orange-500" />
          <FontAwesomeIcon icon={faBed} className="text-orange-500 ml-1" />
        </span>
      );
      case 'triple': return (
        <span className="flex">
          <FontAwesomeIcon icon={faBed} className="text-orange-500" />
          <FontAwesomeIcon icon={faBed} className="text-orange-500 ml-1" />
          <FontAwesomeIcon icon={faBed} className="text-orange-500 ml-1" />
        </span>
      );
      default: return <FontAwesomeIcon icon={faBed} className="text-orange-500" />;
    }
  };

  // Helper function to get amenity icon
  const getAmenityIcon = (amenity) => {
    switch(amenity) {
      case 'AC': return faSnowflake;
      case 'WiFi': return faWifi;
      case 'Attached Bathroom': return faToilet;
      case 'Study Table': return faBook;
      case 'Wardrobe': return faTag; // Using faTag as alternative
      case 'Geyser': return faFire;
      default: return faTag;
    }
  };

  // Helper function to get occupancy status color
  const getOccupancyColor = (occupied, capacity) => {
    const percentage = (occupied / capacity) * 100;
    if (percentage === 0) return 'text-orange-600 bg-orange-100';
    if (percentage < 100) return 'text-amber-600 bg-amber-100';
    return 'text-red-500 bg-red-100';
  };

  // Helper function to get room type badge
  const getRoomTypeBadge = (type) => {
    return type === 'ac' 
      ? 'bg-blue-100 text-blue-700' 
      : 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="px-2 sm:px-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold flex items-center gap-3 text-gray-800">
            <span className="bg-gradient-to-r from-orange-400 to-orange-600 text-white p-2 rounded-xl shadow-lg">
              <FiHome />
            </span>
            PG Rooms Management
          </h2>
          <p className="text-gray-500 text-sm mt-1">Manage rooms, assign students, and track occupancy.</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2.5 rounded-lg hover:from-orange-600 hover:to-orange-700 transition flex items-center gap-2 text-sm font-medium shadow-lg shadow-orange-200"
        >
          <FiHome /> Add New Room
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded mb-4 sm:mb-6 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {rooms.map((room) => {
          const occupiedCount = room.students?.length || 0;
          const occupancyColor = getOccupancyColor(occupiedCount, room.capacity);
          
          return (
            <div key={room._id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition overflow-hidden">
              {/* Room Header with Color Coding based on occupancy */}
              <div className={`h-2 ${
                occupiedCount === 0 ? 'bg-orange-500' :
                occupiedCount < room.capacity ? 'bg-amber-500' : 'bg-red-500'
              }`}></div>
              
              <div className="p-4 sm:p-6">
                {/* Room Number and Actions */}
                <div className="flex justify-between items-start mb-3 sm:mb-4 gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-800 truncate">Room {room.roomNumber}</h3>
                    <p className="text-xs sm:text-sm text-gray-500 flex items-center gap-1">
                      <FontAwesomeIcon icon={faLayerGroup} className="text-orange-500 flex-shrink-0" />
                      <span>Floor {room.floor}</span>
                    </p>
                  </div>
                  <div className="flex gap-1 sm:gap-2 flex-shrink-0">
                    <button
                      onClick={() => openEditModal(room)}
                      className="text-orange-500 hover:text-orange-600 p-1.5 sm:p-2 hover:bg-orange-50 rounded-lg transition text-sm sm:text-base"
                      title="Edit Room"
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      onClick={() => handleDelete(room._id)}
                      className="text-red-500 hover:text-red-600 p-1.5 sm:p-2 hover:bg-red-50 rounded-lg transition text-sm sm:text-base"
                      title="Delete Room"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>

                {/* Room Type and Bed Type Badges */}
                <div className="flex flex-wrap gap-2 mb-3 sm:mb-4">
                  <span className="bg-orange-50 text-orange-700 border border-orange-100 px-2 sm:px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                    <FontAwesomeIcon icon={faWind} className="text-xs text-orange-500" /> 
                    Non-AC
                  </span>
                  <span className="bg-amber-50 text-amber-700 border border-amber-100 px-2 sm:px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                    {getBedTypeIcon(room.bedType)} 
                    <span className="hidden sm:inline">{room.bedType?.charAt(0).toUpperCase() + room.bedType?.slice(1)} Bed</span>
                    <span className="sm:hidden">{room.bedType?.charAt(0).toUpperCase()}</span>
                  </span>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className="bg-gray-50 p-2 sm:p-3 rounded-lg">
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <FiUsers className="text-orange-500 text-xs sm:text-base" />
                      <span className="text-xs">Capacity</span>
                    </div>
                    <p className="text-base sm:text-lg font-bold flex items-center gap-1">
                      {room.capacity} <span className="text-xs sm:text-sm">{room.capacity > 1 ? 'Beds' : 'Bed'}</span>
                    </p>
                  </div>
                  <div className="bg-gray-50 p-2 sm:p-3 rounded-lg">
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <FiDollarSign className="text-orange-500 text-xs sm:text-base" />
                      <span className="text-xs">Rent</span>
                    </div>
                    <p className="text-base sm:text-lg font-bold">₹{room.rent}</p>
                  </div>
                </div>

                {/* Occupancy Status */}
                <div className="mb-3 sm:mb-4">
                  <div className="flex justify-between items-center mb-2 gap-2">
                    <span className="text-xs sm:text-sm font-medium text-gray-700">Occupancy</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 flex-shrink-0 ${occupancyColor}`}>
                      <FontAwesomeIcon icon={faUserGraduate} className="text-xs" />
                      {occupiedCount}/{room.capacity}
                    </span>
                  </div>
                  <div className="w-full bg-orange-100 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        occupiedCount === 0 ? 'bg-orange-500' :
                        occupiedCount < room.capacity ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${(occupiedCount / room.capacity) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Additional Features */}
                <div className="flex flex-wrap gap-2 mb-3 sm:mb-4 text-xs sm:text-sm">
                  {room.balcony && (
                    <span className="text-orange-600 bg-orange-50 px-2 py-1 rounded-md border border-orange-100 flex items-center gap-1 whitespace-nowrap">
                      <FontAwesomeIcon icon={faCheckCircle} /> Balcony
                    </span>
                  )}
                </div>

                {/* Students List */}
                <div className="border-t border-orange-100 pt-3 sm:pt-4">
                  <p className="text-xs sm:text-sm font-bold text-gray-800 mb-2 flex items-center gap-1">
                    <FontAwesomeIcon icon={faUserGraduate} className="text-orange-500 text-xs" /> Current Students:
                  </p>
                  <ul className="space-y-1 sm:space-y-2 max-h-32 sm:max-h-48 overflow-y-auto">
                    {room.students?.length === 0 ? (
                      <li className="text-orange-600 text-xs sm:text-sm bg-orange-50 border border-orange-100 p-2 rounded-lg text-center flex items-center justify-center gap-1 font-medium">
                        <FontAwesomeIcon icon={faDoorOpen} /> Available
                      </li>
                    ) : (
                      room.students?.map((student) => (
                        <li key={student._id} className="flex justify-between items-start bg-gray-50 p-2 rounded-lg gap-2">
                          <div className="flex items-start gap-2 flex-1 min-w-0">
                            <FontAwesomeIcon icon={faUser} className="text-orange-500 mt-0.5 text-xs flex-shrink-0" />
                            <div className="min-w-0">
                              <span className="font-medium text-xs sm:text-sm block truncate">{student.name}</span>
                              <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                                <FontAwesomeIcon icon={faEnvelope} className="text-xs flex-shrink-0" />
                                <span className="truncate">{student.email}</span>
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveStudent(room._id, student._id)}
                            className="text-red-500 hover:text-red-600 p-1 hover:bg-red-50 rounded transition flex-shrink-0"
                            title="Remove Student"
                          >
                            <FiUserMinus className="text-sm" />
                          </button>
                        </li>
                      ))
                    )}
                  </ul>
                </div>

                {/* Assign Button */}
                {room.students?.length < room.capacity && (
                  <button
                    onClick={() => openAssignModal(room)}
                    className="mt-3 sm:mt-4 w-full border border-orange-500 text-orange-500 bg-white px-3 sm:px-4 py-2 rounded-lg hover:bg-orange-50 transition flex items-center justify-center gap-2 text-xs sm:text-sm font-bold"
                  >
                    <FiUserPlus /> Assign Student
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add/Edit Room Modal - Updated with new fields */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white p-4 sm:p-6 rounded-xl max-w-2xl w-full my-8">
            <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-orange-500 flex items-center gap-2">
              {editingRoom ? (
                <>
                  <FiEdit2 /> Edit Room
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faPlusCircle} /> Add New Room
                </>
              )}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 max-h-96 sm:max-h-none overflow-y-auto sm:overflow-y-visible">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                {/* Basic Information */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Room Number *</label>
                  <input
                    type="text"
                    name="roomNumber"
                    value={formData.roomNumber}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg px-3 sm:px-4 py-2 focus:ring-2 focus:ring-orange-500 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Floor *</label>
                  <input
                    type="number"
                    name="floor"
                    value={formData.floor}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg px-3 sm:px-4 py-2 focus:ring-2 focus:ring-orange-500 text-sm"
                    required
                  />
                </div>

                {/* Capacity and Rent */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Capacity *</label>
                  <select
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg px-3 sm:px-4 py-2 focus:ring-2 focus:ring-orange-500 text-sm"
                    required
                  >
                    <option value={1}>1 Person</option>
                    <option value={2}>2 People</option>
                    <option value={3}>3 People</option>
                    <option value={4}>4 People</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Rent (₹) *</label>
                  <input
                    type="number"
                    name="rent"
                    value={formData.rent}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg px-3 sm:px-4 py-2 focus:ring-2 focus:ring-orange-500 text-sm"
                    required
                  />
                </div>

                {/* Room Type */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Room Type *</label>
                  <select
                    name="roomType"
                    value={formData.roomType}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg px-3 sm:px-4 py-2 focus:ring-2 focus:ring-orange-500 text-sm"
                  >
                    <option value="non-ac">Non-AC Room (Standard)</option>
                  </select>
                </div>

                {/* Bed Type */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Bed Type *</label>
                  <select
                    name="bedType"
                    value={formData.bedType}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg px-3 sm:px-4 py-2 focus:ring-2 focus:ring-orange-500 text-sm"
                  >
                    {bedTypeOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Checkboxes */}
                <div className="md:col-span-2">
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-6">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="balcony"
                        checked={formData.balcony}
                        onChange={handleInputChange}
                        className="rounded text-orange-500 focus:ring-orange-500 w-4 h-4"
                      />
                      <span className="text-xs sm:text-sm flex items-center gap-1">
                        <FontAwesomeIcon icon={faTree} className="text-xs" /> Balcony
                      </span>
                    </label>
                  </div>
                </div>

                {/* Details */}
                <div className="md:col-span-2">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Additional Details</label>
                  <textarea
                    name="details"
                    value={formData.details}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg px-3 sm:px-4 py-2 focus:ring-2 focus:ring-orange-500 text-sm"
                    rows="2"
                    placeholder="Any additional information about the room..."
                  />
                </div>
              </div>

              <div className="flex gap-2 sm:gap-3 pt-3 sm:pt-4">
                <button
                  type="submit"
                  className="bg-orange-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-orange-600 flex-1 font-medium text-sm sm:text-base"
                >
                  {editingRoom ? "Update Room" : "Save Room"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="bg-gray-300 text-gray-700 px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-gray-400 font-medium text-sm sm:text-base"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Student Modal - Enhanced */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-4 sm:p-6 rounded-xl max-w-md w-full border-t-8 border-orange-500">
            <h3 className="text-lg sm:text-2xl font-bold mb-2 sm:mb-4 text-gray-900 flex items-center gap-2">
              <span className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <FontAwesomeIcon icon={faUserGraduate} className="text-orange-500" /> 
              </span>
              Assign Student
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 flex items-center gap-1">
              <FontAwesomeIcon icon={faDoorOpen} className="text-orange-500 text-xs" />
              Assign to Room <span className="font-bold text-orange-500 mx-1">{selectedRoom?.roomNumber}</span>
            </p>
            <div className="space-y-3 sm:space-y-4">
              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="w-full border rounded-lg px-3 sm:px-4 py-2 sm:py-3 focus:ring-2 focus:ring-orange-500 text-sm font-medium"
              >
                <option value="">Select a student</option>
                {students
                  .filter(s => !s.roomNumber)
                  .map(student => (
                    <option key={student._id} value={student._id}>
                      {student.name} - {student.email}
                    </option>
                  ))}
              </select>

              <div className="flex gap-2 sm:gap-3">
                <button
                  onClick={handleAssignStudent}
                  className="bg-orange-500 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-orange-600 flex-1 font-bold flex items-center justify-center gap-2 text-xs sm:text-sm"
                >
                  <FiUserPlus /> Assign
                </button>
                <button
                  onClick={() => {
                    setShowAssignModal(false);
                    setSelectedStudent("");
                  }}
                  className="bg-gray-300 text-gray-700 px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-400 font-medium text-xs sm:text-sm"
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

export default Rooms;
