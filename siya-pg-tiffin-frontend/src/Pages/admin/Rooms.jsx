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
    amenities: [],
    bedType: "single", // single, double, triple
    roomType: "non-ac", // ac, non-ac
    furnished: "semi", // fully, semi, unfurnished
    attachedBathroom: true,
    balcony: false,
  });

  const amenityOptions = ["AC", "Attached Bathroom", "Study Table", "Wardrobe", "Geyser", "WiFi"];
  const bedTypeOptions = [
    { value: "single", label: "Single Bed", icon: faBed },
    { value: "double", label: "Double Bed", icon: faBed },
    { value: "triple", label: "Triple Bed", icon: faBed },
  ];
  const roomTypeOptions = [
    { value: "ac", label: "AC Room", icon: faSnowflake },
    { value: "non-ac", label: "Non-AC Room", icon: faWind },
  ];
  const furnishedOptions = [
    { value: "fully", label: "Fully Furnished", icon: faStarFull },
    { value: "semi", label: "Semi Furnished", icon: faStarHalfAlt },
    { value: "unfurnished", label: "Unfurnished", icon: faStar },
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
    try {
      await API.post("/admin/rooms/assign", {
        roomId: selectedRoom._id,
        studentId: selectedStudent
      });
      setShowAssignModal(false);
      setSelectedStudent("");
      fetchRooms();
      fetchStudents();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to assign student");
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
    if (percentage === 0) return 'text-green-600 bg-green-100';
    if (percentage < 100) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
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
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">PG Rooms Management</h2>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition flex items-center gap-2"
        >
          <FiHome /> Add New Room
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map((room) => {
          const occupiedCount = room.students?.length || 0;
          const occupancyColor = getOccupancyColor(occupiedCount, room.capacity);
          
          return (
            <div key={room._id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition overflow-hidden">
              {/* Room Header with Color Coding based on occupancy */}
              <div className={`h-2 ${
                occupiedCount === 0 ? 'bg-green-500' :
                occupiedCount < room.capacity ? 'bg-yellow-500' : 'bg-red-500'
              }`}></div>
              
              <div className="p-6">
                {/* Room Number and Actions */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">Room {room.roomNumber}</h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <FontAwesomeIcon icon={faLayerGroup} className="text-orange-500" />
                      Floor {room.floor}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(room)}
                      className="text-blue-500 hover:text-blue-600 p-2 hover:bg-blue-50 rounded-lg transition"
                      title="Edit Room"
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      onClick={() => handleDelete(room._id)}
                      className="text-red-500 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition"
                      title="Delete Room"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>

                {/* Room Type and Bed Type Badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getRoomTypeBadge(room.roomType)}`}>
                    <FontAwesomeIcon icon={room.roomType === 'ac' ? faSnowflake : faWind} />
                    {room.roomType === 'ac' ? 'AC' : 'Non-AC'}
                  </span>
                  <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                    {getBedTypeIcon(room.bedType)} 
                    {room.bedType?.charAt(0).toUpperCase() + room.bedType?.slice(1)} Bed
                  </span>
                  <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                    <FontAwesomeIcon icon={
                      room.furnished === 'fully' ? faStarFull :
                      room.furnished === 'semi' ? faStarHalfAlt : faStar
                    } />
                    {room.furnished === 'fully' ? 'Fully' :
                     room.furnished === 'semi' ? 'Semi' : 'Un'} Furnished
                  </span>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <FiUsers className="text-orange-500" />
                      <span className="text-xs">Capacity</span>
                    </div>
                    <p className="text-lg font-bold flex items-center gap-1">
                      {room.capacity} {room.capacity > 1 ? 'Beds' : 'Bed'}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <FiDollarSign className="text-orange-500" />
                      <span className="text-xs">Rent</span>
                    </div>
                    <p className="text-lg font-bold">₹{room.rent}</p>
                  </div>
                </div>

                {/* Occupancy Status */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Occupancy Status</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${occupancyColor}`}>
                      <FontAwesomeIcon icon={faUserGraduate} />
                      {occupiedCount}/{room.capacity} Occupied
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full ${
                        occupiedCount === 0 ? 'bg-green-500' :
                        occupiedCount < room.capacity ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${(occupiedCount / room.capacity) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Amenities */}
                {room.amenities?.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Amenities:</p>
                    <div className="flex flex-wrap gap-1">
                      {room.amenities.map((a, i) => (
                        <span key={i} className="bg-orange-50 text-orange-700 text-xs px-2 py-1 rounded-full border border-orange-200 flex items-center gap-1">
                          <FontAwesomeIcon icon={getAmenityIcon(a)} className="text-xs" />
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Additional Features */}
                <div className="flex gap-3 mb-4 text-sm">
                  {room.attachedBathroom && (
                    <span className="text-green-600 flex items-center gap-1">
                      <FontAwesomeIcon icon={faCheckCircle} /> Attached Bathroom
                    </span>
                  )}
                  {room.balcony && (
                    <span className="text-green-600 flex items-center gap-1">
                      <FontAwesomeIcon icon={faCheckCircle} /> Balcony
                    </span>
                  )}
                </div>

                {/* Students List */}
                <div className="border-t pt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <FontAwesomeIcon icon={faUserGraduate} /> Current Students:
                  </p>
                  <ul className="space-y-2">
                    {room.students?.length === 0 ? (
                      <li className="text-green-600 text-sm bg-green-50 p-2 rounded-lg text-center flex items-center justify-center gap-1">
                        <FontAwesomeIcon icon={faDoorOpen} /> Room Available for Booking
                      </li>
                    ) : (
                      room.students?.map((student) => (
                        <li key={student._id} className="flex justify-between items-center bg-gray-50 p-2 rounded-lg">
                          <div className="flex items-start gap-2">
                            <FontAwesomeIcon icon={faUser} className="text-orange-500 mt-1" />
                            <div>
                              <span className="font-medium text-sm">{student.name}</span>
                              <p className="text-xs text-gray-500 flex items-center gap-1">
                                <FontAwesomeIcon icon={faEnvelope} className="text-xs" />
                                {student.email}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveStudent(room._id, student._id)}
                            className="text-red-500 hover:text-red-600 p-1 hover:bg-red-50 rounded transition"
                            title="Remove Student"
                          >
                            <FiUserMinus />
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
                    className="mt-4 w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition flex items-center justify-center gap-2 text-sm font-medium"
                  >
                    <FiUserPlus /> Assign New Student
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add/Edit Room Modal - Updated with new fields */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white p-6 rounded-xl max-w-2xl w-full my-8">
            <h3 className="text-2xl font-bold mb-6 text-orange-500 flex items-center gap-2">
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
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Basic Information */}
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Room Number *</label>
                  <input
                    type="text"
                    name="roomNumber"
                    value={formData.roomNumber}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Floor *</label>
                  <input
                    type="number"
                    name="floor"
                    value={formData.floor}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>

                {/* Capacity and Rent */}
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Capacity *</label>
                  <select
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500"
                    required
                  >
                    <option value={1}>1 Person</option>
                    <option value={2}>2 People</option>
                    <option value={3}>3 People</option>
                    <option value={4}>4 People</option>
                  </select>
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rent (₹) *</label>
                  <input
                    type="number"
                    name="rent"
                    value={formData.rent}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>

                {/* Room Type */}
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Room Type *</label>
                  <select
                    name="roomType"
                    value={formData.roomType}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500"
                  >
                    {roomTypeOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Bed Type */}
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bed Type *</label>
                  <select
                    name="bedType"
                    value={formData.bedType}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500"
                  >
                    {bedTypeOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Furnished Status */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Furnished Status *</label>
                  <select
                    name="furnished"
                    value={formData.furnished}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500"
                  >
                    {furnishedOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Checkboxes */}
                <div className="col-span-2">
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="attachedBathroom"
                        checked={formData.attachedBathroom}
                        onChange={handleInputChange}
                        className="rounded text-orange-500 focus:ring-orange-500"
                      />
                      <span className="text-sm flex items-center gap-1">
                        <FontAwesomeIcon icon={faToilet} /> Attached Bathroom
                      </span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="balcony"
                        checked={formData.balcony}
                        onChange={handleInputChange}
                        className="rounded text-orange-500 focus:ring-orange-500"
                      />
                      <span className="text-sm flex items-center gap-1">
                        <FontAwesomeIcon icon={faTree} /> Balcony
                      </span>
                    </label>
                  </div>
                </div>

                {/* Amenities */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {amenityOptions.map(amenity => (
                      <label key={amenity} className="flex items-center gap-2 p-2 border rounded-lg hover:bg-orange-50">
                        <input
                          type="checkbox"
                          checked={formData.amenities.includes(amenity)}
                          onChange={() => handleAmenityChange(amenity)}
                          className="rounded text-orange-500 focus:ring-orange-500"
                        />
                        <span className="text-sm flex items-center gap-1">
                          <FontAwesomeIcon icon={getAmenityIcon(amenity)} />
                          {amenity}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Details */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Additional Details</label>
                  <textarea
                    name="details"
                    value={formData.details}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500"
                    rows="3"
                    placeholder="Any additional information about the room..."
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 flex-1 font-medium"
                >
                  {editingRoom ? "Update Room" : "Save Room"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400 font-medium"
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl max-w-md w-full">
            <h3 className="text-2xl font-bold mb-4 text-green-600 flex items-center gap-2">
              <FontAwesomeIcon icon={faUserGraduate} /> Assign Student
            </h3>
            <p className="text-gray-600 mb-4 flex items-center gap-1">
              <FontAwesomeIcon icon={faDoorOpen} />
              Assign a student to Room <span className="font-bold text-orange-500 mx-1">{selectedRoom?.roomNumber}</span>
            </p>
            <div className="space-y-4">
              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500"
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

              <div className="flex gap-3">
                <button
                  onClick={handleAssignStudent}
                  className="bg-green-500 text-white px-4 py-3 rounded-lg hover:bg-green-600 flex-1 font-medium flex items-center justify-center gap-2"
                >
                  <FiUserPlus /> Assign Student
                </button>
                <button
                  onClick={() => {
                    setShowAssignModal(false);
                    setSelectedStudent("");
                  }}
                  className="bg-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-400 font-medium"
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