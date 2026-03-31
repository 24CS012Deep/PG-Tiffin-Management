import { useEffect, useState } from "react";
import API from "../../utils/api";
import { FiHome, FiUsers, FiBox, FiCheckCircle, FiInfo, FiWind, FiSun } from "react-icons/fi";
import { MdOutlineBed } from "react-icons/md";

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
      const res = await API.get("/student/my-room");
      setRoom(res.data);
      setError("");
    } catch (err) {
      console.error("Failed to fetch room:", err);
      setError("Failed to load room details");
    } finally {
      setLoading(false);
    }
  };

  const getRandomAvatarStyle = (index) => {
    const gradients = [
      'from-blue-400 to-indigo-500',
      'from-emerald-400 to-teal-500',
      'from-orange-400 to-rose-500',
      'from-purple-400 to-violet-500'
    ];
    return gradients[index % gradients.length];
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
      <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded shadow-sm mb-6">
        {error}
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen pb-10">
        <h1 className="text-2xl md:text-3xl font-bold mb-8 text-gray-800">My Appartment</h1>
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center max-w-2xl mx-auto mt-10">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiHome className="text-4xl text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold mb-3 text-gray-800">No Room Assigned</h2>
          <p className="text-gray-500 text-base max-w-md mx-auto">You have not been assigned to a PG room yet. Once the admin allocates a room to your profile, the details will securely appear here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-3 text-gray-800">
            <span className="bg-gradient-to-r from-orange-400 to-orange-600 text-white p-2 rounded-xl shadow-lg">
              <FiHome />
            </span>
            My PG Room
          </h2>
          <p className="text-gray-500 text-sm mt-1">Details about your living accommodation and roommates.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Main Room Card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
             <div className="h-32 bg-gradient-to-r from-slate-800 to-slate-700 relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
             </div>
             
             <div className="px-6 pb-8 pt-0 relative">
                {/* Room Avatar */}
                <div className="w-24 h-24 bg-white rounded-2xl shadow-xl border-4 border-white flex items-center justify-center text-3xl font-black text-orange-500 -mt-12 mb-4">
                  {room.roomNumber}
                </div>
                
                <h3 className="text-2xl font-bold text-gray-800 mb-6">
                   Room Details <span className="text-sm font-medium text-gray-400 ml-2">Floor {room.floor}</span>
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <p className="text-gray-500 text-xs uppercase font-bold tracking-wider mb-1">Capacity</p>
                    <p className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                       <FiUsers className="text-orange-500" /> {room.capacity}
                    </p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                    <p className="text-orange-600/70 text-xs uppercase font-bold tracking-wider mb-1">Monthly Rent</p>
                    <p className="text-xl font-bold text-orange-600">
                       ₹{room.rent}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <p className="text-gray-500 text-xs uppercase font-bold tracking-wider mb-1">Type</p>
                    <p className="text-lg font-semibold text-gray-800 flex items-center gap-2 capitalize">
                       {room.roomType === 'ac' ? <><FiWind className="text-blue-500"/> AC</> : <><FiSun className="text-amber-500"/> Non-AC</>}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <p className="text-gray-500 text-xs uppercase font-bold tracking-wider mb-1">Bed Type</p>
                    <p className="text-lg font-semibold text-gray-800 flex items-center gap-2 capitalize">
                       <MdOutlineBed className="text-indigo-500" /> {room.bedType || 'Standard'}
                    </p>
                  </div>
                </div>
             </div>
          </div>

          {/* Details Card */}
          {room.details && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
               <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                 <FiInfo className="text-blue-500" /> Additional Details
               </h4>
               <p className="text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
                 {room.details}
               </p>
            </div>
          )}
        </div>

        {/* Right Col: Roommates */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 self-start sticky top-6">
           <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
              <h4 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <FiUsers className="text-orange-500" /> Your Roommates
              </h4>
              <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full text-xs font-bold">
                {room.students?.length || 0} / {room.capacity}
              </span>
           </div>
           
           {room.students?.length > 0 ? (
             <div className="space-y-4">
               {room.students.map((student, idx) => {
                 const isCurrentUser = student._id === JSON.parse(localStorage.getItem('user'))?._id;
                 return (
                   <div key={student._id} className={`flex items-center gap-4 p-3 rounded-xl transition-all ${isCurrentUser ? 'bg-orange-50 border border-orange-100' : 'hover:bg-gray-50 border border-transparent'}`}>
                     <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getRandomAvatarStyle(idx)} shadow-sm flex items-center justify-center text-white font-bold text-lg flex-shrink-0`}>
                       {student.name.charAt(0).toUpperCase()}
                     </div>
                     <div>
                       <p className="font-semibold text-gray-800 flex items-center gap-2">
                         {student.name}
                         {isCurrentUser && <span className="bg-orange-100 text-orange-600 text-[10px] uppercase font-black px-2 py-0.5 rounded flex items-center gap-1">You</span>}
                       </p>
                       <p className="text-xs text-gray-500">{student.email}</p>
                     </div>
                   </div>
                 );
               })}
             </div>
           ) : (
             <div className="text-center py-8">
               <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                 <FiUsers className="text-gray-400 text-xl" />
               </div>
               <p className="text-gray-500 text-sm font-medium">You have this room all to yourself for now!</p>
             </div>
           )}

           {/* Vacancy Indicator */}
           {room.capacity > (room.students?.length || 0) && (
             <div className="mt-6 bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-center">
                <p className="text-emerald-700 text-sm font-medium">
                  There are {room.capacity - (room.students?.length || 0)} vacant beds available in this room.
                </p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default MyRoom;