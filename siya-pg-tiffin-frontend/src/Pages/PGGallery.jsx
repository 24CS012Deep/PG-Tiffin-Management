import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faWifi,
  faBed,
  faShower,
  faUtensils,
  faSnowflake,
  faArrowLeft,
  faExpand,
  faTimes,
  faPhone,
  faCalendarAlt,
  faEnvelope,
  faMapMarkerAlt,
  faClock,
  faSpinner,
  faCheckCircle
} from "@fortawesome/free-solid-svg-icons";
import API from "../utils/api";

const pgPhotos = [
  {
    id: 1,
    url: "/images/Room_1.png",
    title: "Room 1 (Triple Sharing)",
    category: "rooms",
    description: "Spacious triple sharing room with comfortable beds"
  },
  {
    id: 2,
    url: "/images/Room_1_2.png",
    title: "Room 1 (Triple Sharing)",
    category: "rooms",
    description: "Spacious triple sharing room with comfortable beds"
  },
  {
    id: 3,
    url: "/images/Room_2_1.png",
    title: "Room 2 (Double Sharing)",
    category: "rooms",
    description: "Comfortable double sharing room with attached balcony"
  },
  {
    id: 4,
    url: "/images/Room2.png",
    title: "Room 2 (Double Sharing)",
    category: "rooms",
    description: "Comfortable double sharing room with attached balcony"
  },
  {
    id: 5,
    url: "/images/Tarace.png",
    title: "Terrace Area",
    category: "exterior",
    description: "Beautiful terrace for relaxation and evening gatherings"
  },
  {
    id: 6,
    url: "/images/Washroom.png",
    title: "Modern Washroom",
    category: "facilities",
    description: "Clean and hygienic western-style bathrooms"
  }
];

const amenities = [
  { icon: faBed, name: "Comfortable Beds" },
  { icon: faShower, name: "Washrooms" },
  { icon: faUtensils, name: "Home-Cooked Meals" },
  { icon: faSnowflake, name: "Air Conditioning" },
];

export default function PGGallery() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedImage, setSelectedImage] = useState(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    time: "",
    message: ""
  });

  const categories = [
    { id: "all", name: "All Overview" },
    { id: "rooms", name: "Premium Rooms" },
    { id: "facilities", name: "Facilities" },
    { id: "exterior", name: "Exterior" },
  ];

  const filteredPhotos = selectedCategory === "all" 
    ? pgPhotos 
    : pgPhotos.filter(photo => photo.category === selectedCategory);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const submitForm = async (endpoint, payload, type) => {
    setLoading(true);
    setSuccess(false);
    
    try {
      const response = await API.post(endpoint, payload);
      
      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => {
          type === 'contact' ? setShowContactModal(false) : setShowScheduleModal(false);
          setSuccess(false);
          setFormData({ name: "", email: "", phone: "", date: "", time: "", message: "" });
        }, 3000);
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert("Failed to submit. Please try again later.");
    } finally {
      if(!success) setLoading(false);
    }
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    submitForm("/inquiry/contact", {
      name: formData.name, email: formData.email, phone: formData.phone, message: formData.message,
    }, 'contact');
  };

  const handleScheduleSubmit = (e) => {
    e.preventDefault();
    submitForm("/inquiry/schedule", {
      name: formData.name, email: formData.email, phone: formData.phone, date: formData.date, time: formData.time, message: formData.message,
    }, 'schedule');
  };

  const resetModal = () => {
    setShowContactModal(false);
    setShowScheduleModal(false);
    setSuccess(false);
    setFormData({ name: "", email: "", phone: "", date: "", time: "", message: "" });
  };

  return (
    <>
      <Navbar />
      
      <div className="min-h-screen bg-gray-50 pt-16 md:pt-20 font-sans">
        
        {/* Dynamic Header */}
        <div className="bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 text-white py-12 md:py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10 mix-blend-overlay"></div>
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3"></div>
          
          <div className="max-w-7xl mx-auto px-6 relative z-10 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="max-w-2xl">
              <Link to="/" className="inline-flex items-center text-orange-100 hover:text-white mb-6 font-bold tracking-wide transition group">
                <FontAwesomeIcon icon={faArrowLeft} className="mr-3 group-hover:-translate-x-1 transition-transform" />
                Return to Homepage
              </Link>
              <h1 className="text-5xl md:text-7xl font-extrabold mb-4 drop-shadow-md tracking-tight">Virtual Tour</h1>
              <p className="text-xl text-orange-100 font-medium">Explore our premium fully-furnished student accommodations.</p>
            </div>
            
            <div className="hidden md:flex gap-4">
               <button onClick={() => setShowScheduleModal(true)} className="bg-white text-orange-600 px-8 py-4 rounded-xl font-black shadow-xl hover:bg-orange-50 hover:scale-105 transition-all outline-none">
                 <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" /> Book Visit
               </button>
            </div>
          </div>
        </div>

        {/* Categories Nav */}
        <div className="bg-white border-b border-gray-200 sticky top-16 z-30 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 overflow-x-auto no-scrollbar">
            <div className="flex gap-2 py-4">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-8 py-3 rounded-xl font-bold transition-all duration-300 whitespace-nowrap ${
                    selectedCategory === category.id
                      ? "bg-orange-500 text-white shadow-[0_5px_15px_rgba(249,115,22,0.4)]"
                      : "bg-gray-50 text-gray-500 hover:bg-orange-100 hover:text-orange-600"
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Gallery Section */}
        <section className="py-16 md:py-24 px-6 relative z-20">
          <div className="max-w-7xl mx-auto">
            {/* Photo Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPhotos.length > 0 ? (
                filteredPhotos.map((photo) => (
                  <div
                    key={photo.id}
                    onClick={() => setSelectedImage(photo)}
                    className="group relative overflow-hidden rounded-3xl shadow-md border border-gray-100 hover:shadow-[0_20px_40px_rgba(249,115,22,0.15)] hover:-translate-y-2 transition-all duration-500 cursor-pointer bg-white"
                  >
                    <div className="aspect-[4/3] w-full overflow-hidden bg-gray-100 relative">
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent opacity-60 z-10 transition-opacity group-hover:opacity-40"></div>
                      <img
                        src={photo.url}
                        alt={photo.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/images/Homepage.png";
                        }}
                      />
                      <div className="absolute top-4 right-4 z-20 bg-white/20 backdrop-blur-md rounded-full w-10 h-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:rotate-45 duration-300">
                        <FontAwesomeIcon icon={faExpand} className="text-white" />
                      </div>
                    </div>
                    
                    <div className="absolute bottom-0 left-0 right-0 p-6 z-20 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                      <span className="bg-orange-500 text-white text-[10px] uppercase font-black tracking-widest px-3 py-1 rounded-full mb-3 inline-block shadow-sm">
                        {photo.category}
                      </span>
                      <h3 className="text-2xl font-bold text-white mb-1 drop-shadow-md">{photo.title}</h3>
                      <p className="text-white/80 font-medium text-sm line-clamp-1 drop-shadow-sm">{photo.description}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                  <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FontAwesomeIcon icon={faBed} className="text-3xl text-orange-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">No photos available</h3>
                  <p className="text-gray-500 font-medium">We are adding new photos to this category soon.</p>
                </div>
              )}
            </div>
            
            {/* Features Row */}
            <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8">
              {amenities.map((amenity, index) => (
                <div key={index} className="bg-white rounded-2xl p-6 text-center shadow-sm border border-orange-50 hover:shadow-md hover:border-orange-200 transition-all group">
                  <div className="w-14 h-14 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-orange-500 group-hover:scale-110 transition-all">
                    <FontAwesomeIcon icon={amenity.icon} className="text-2xl text-orange-500 group-hover:text-white transition-colors" />
                  </div>
                  <p className="text-gray-800 font-bold text-sm">{amenity.name}</p>
                </div>
              ))}
            </div>

            {/* Direct Contact CTA */}
            <div className="mt-12 bg-gray-900 rounded-[3rem] p-10 md:p-16 text-center shadow-2xl relative overflow-hidden">
               <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/az-subtle.png')] opacity-10"></div>
               <div className="absolute -top-24 -right-24 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl"></div>
               <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl"></div>
               
               <div className="relative z-10 max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
                 <div className="text-left">
                   <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4">Ready to move in?</h2>
                   <p className="text-gray-400 text-lg font-medium">Experience student living that feels exactly like home. Book your visit today.</p>
                 </div>
                 <div className="flex gap-4 w-full md:w-auto">
                   <a href="tel:+919904372800" className="flex-1 md:flex-none bg-orange-500 text-white px-8 py-4 rounded-xl font-bold shadow-[0_0_20px_rgba(249,115,22,0.4)] hover:bg-orange-600 transition-all flex flex-col items-center justify-center min-w-[200px]">
                     <span className="text-[10px] uppercase tracking-widest opacity-70 mb-1">Call Us Directly</span>
                     <span className="text-xl">+91 99043 72800</span>
                   </a>
                 </div>
               </div>
            </div>
            
          </div>
        </section>

        {/* Lightbox Modal */}
        {selectedImage && (
          <div className="fixed inset-0 bg-gray-900/95 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setSelectedImage(null)}>
            <button className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-orange-500 rounded-full text-white flex items-center justify-center transition-colors z-50" onClick={() => setSelectedImage(null)}>
              <FontAwesomeIcon icon={faTimes} className="text-2xl" />
            </button>
            <div className="max-w-6xl w-full" onClick={(e) => e.stopPropagation()}>
               <img src={selectedImage.url} alt={selectedImage.title} className="w-full h-auto max-h-[80vh] object-contain rounded-xl shadow-2xl" />
               <div className="text-center mt-6">
                 <h3 className="text-3xl font-bold text-white mb-2">{selectedImage.title}</h3>
                 <p className="text-gray-400 font-medium text-lg">{selectedImage.description}</p>
               </div>
            </div>
          </div>
        )}

        {/* Modal Template */}
        {(showContactModal || showScheduleModal) && (
          <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto overflow-hidden shadow-2xl border-t-8 border-orange-500 flex flex-col">
              
              <div className="px-8 py-6 flex justify-between items-center border-b border-gray-100 bg-gray-50/50">
                <h3 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <FontAwesomeIcon icon={showContactModal ? faPhone : faCalendarAlt} className="text-orange-500 text-xl" />
                  </div>
                  {showContactModal ? "Request Callback" : "Schedule Visit"}
                </h3>
                <button onClick={resetModal} className="w-10 h-10 flex items-center justify-center hover:bg-gray-200 text-gray-500 rounded-full transition-colors">
                  <FontAwesomeIcon icon={faTimes} className="text-xl" />
                </button>
              </div>

              {success ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-20 px-8">
                  <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6">
                    <FontAwesomeIcon icon={faCheckCircle} className="text-5xl text-green-500" />
                  </div>
                  <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Request Sent!</h2>
                  <p className="text-gray-500 font-medium">We've received your details. Our management team will contact you shortly.</p>
                </div>
              ) : (
                <form onSubmit={showContactModal ? handleContactSubmit : handleScheduleSubmit} className="p-8 space-y-5">
                  <div className="grid grid-cols-2 gap-5">
                    <div className="col-span-2">
                      <label className="block text-sm font-bold text-gray-700 mb-2">Full Name <span className="text-orange-500">*</span></label>
                      <input type="text" name="name" required value={formData.name} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-4 focus:ring-orange-100 focus:border-orange-500 outline-none transition-all font-medium" placeholder="E.g. Rahul Sharma" />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number <span className="text-orange-500">*</span></label>
                      <input type="tel" name="phone" required value={formData.phone} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-4 focus:ring-orange-100 focus:border-orange-500 outline-none transition-all font-medium" placeholder="+91 99999 99999" />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-sm font-bold text-gray-700 mb-2">Email Address <span className="text-orange-500">*</span></label>
                      <input type="email" name="email" required value={formData.email} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-4 focus:ring-orange-100 focus:border-orange-500 outline-none transition-all font-medium" placeholder="mail@example.com" />
                    </div>

                    {showScheduleModal && (
                      <>
                        <div className="col-span-2 sm:col-span-1">
                          <label className="block text-sm font-bold text-gray-700 mb-2">Date <span className="text-orange-500">*</span></label>
                          <input type="date" name="date" required value={formData.date} onChange={handleInputChange} min={new Date().toISOString().split('T')[0]} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-4 focus:ring-orange-100 focus:border-orange-500 outline-none font-medium" />
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                          <label className="block text-sm font-bold text-gray-700 mb-2">Time <span className="text-orange-500">*</span></label>
                          <select name="time" required value={formData.time} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-4 focus:ring-orange-100 focus:border-orange-500 outline-none font-medium">
                            <option value="">Select slot</option>
                            <option value="10:00 AM">10:00 AM</option>
                            <option value="12:00 PM">12:00 PM</option>
                            <option value="02:00 PM">02:00 PM</option>
                            <option value="04:00 PM">04:00 PM</option>
                            <option value="06:00 PM">06:00 PM</option>
                          </select>
                        </div>
                      </>
                    )}

                    <div className="col-span-2">
                      <label className="block text-sm font-bold text-gray-700 mb-2">Additional Note</label>
                      <textarea name="message" value={formData.message} onChange={handleInputChange} rows="2" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-4 focus:ring-orange-100 focus:border-orange-500 outline-none transition-all font-medium" placeholder="Any specific requirements?" />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <button type="submit" disabled={loading} className="w-full bg-orange-500 text-white py-4 rounded-xl hover:bg-orange-600 transition-all font-bold disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(249,115,22,0.3)]">
                      {loading ? <><FontAwesomeIcon icon={faSpinner} spin /> Processing...</> : showContactModal ? "Submit Request" : "Confirm Booking"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}