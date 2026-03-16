import { useState } from "react";
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
} from "@fortawesome/free-solid-svg-icons";

const pgPhotos = [
  {
    id: 1,
    url: "/images/Room_1.png",
    title: "Room 1 (Triple Sharing)",
    category: "rooms",
    description: "Spacious triple sharing room with comfortable beds and study tables"
  },
  {
    id: 2,
    url: "/images/Room_1_2.png",
    title: "Room 1 Interior",
    category: "rooms",
    description: "Well-furnished room with ample natural light"
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
    title: "Room 2 Interior",
    category: "rooms",
    description: "Modern furnishings with study area"
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
  },
];

const amenities = [
  { icon: faWifi, name: "High-Speed WiFi" },
  { icon: faBed, name: "Comfortable Beds" },
  { icon: faShower, name: "Attached Washrooms" },
  { icon: faUtensils, name: "Home-Cooked Meals" },
  { icon: faSnowflake, name: "Air Conditioning" },
];

export default function PGGallery() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedImage, setSelectedImage] = useState(null);

  const categories = [
    { id: "all", name: "All Photos" },
    { id: "rooms", name: "Rooms" },
    { id: "facilities", name: "Facilities" },
    { id: "exterior", name: "Exterior" },
  ];

  const filteredPhotos = selectedCategory === "all" 
    ? pgPhotos 
    : pgPhotos.filter(photo => photo.category === selectedCategory);
  const getImageSrc = (url) => {
    try {
      return url;
    } catch (error) {
      return "/images/Homepage.png"; 
    }
  };

  return (
    <>
      <Navbar />
      
      <div className="min-h-screen bg-[#fdf8f2] pt-20">
        <div className="bg-orange-500 text-white py-12">
          <div className="max-w-7xl mx-auto px-6">
            <Link to="/" className="inline-flex items-center text-white mb-4 hover:text-orange-200 transition">
              <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
              Back to Home
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Siya PG Gallery</h1>
            <p className="text-xl text-orange-100">Take a virtual tour of our premium PG accommodation</p>
          </div>
        </div>

        
        <section className="py-12 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-semibold text-center mb-8">Our Premium Amenities</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              {amenities.map((amenity, index) => (
                <div key={index} className="text-center p-4 rounded-lg hover:bg-orange-50 transition">
                  <FontAwesomeIcon icon={amenity.icon} className="text-3xl text-orange-500 mb-2" />
                  <p className="text-gray-700 font-medium">{amenity.name}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

       
        <section className="py-12 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-wrap gap-4 justify-center mb-10">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                    selectedCategory === category.id
                      ? "bg-orange-500 text-white"
                      : "bg-orange-100 text-orange-600 hover:bg-orange-200"
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>

          
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPhotos.length > 0 ? (
                filteredPhotos.map((photo) => (
                  <div
                    key={photo.id}
                    onClick={() => setSelectedImage(photo)}
                    className="group relative overflow-hidden rounded-xl shadow-lg cursor-pointer"
                  >
                    <div className="aspect-w-16 aspect-h-12 bg-gray-200">
                      <img
                        src={getImageSrc(photo.url)}
                        alt={photo.title}
                        className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/images/Homepage.png"; 
                        }}
                      />
                    </div>
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <FontAwesomeIcon icon={faExpand} className="text-white text-3xl" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                      <h3 className="text-white font-semibold">{photo.title}</h3>
                      <p className="text-white text-sm opacity-90">{photo.description}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-500">No photos found in this category</p>
                </div>
              )}
            </div>

            {/* Contact Section */}
            <div className="mt-16 bg-orange-50 rounded-2xl p-8 text-center">
              <h2 className="text-2xl font-semibold mb-4">Interested in booking a room?</h2>
              <p className="text-gray-600 mb-6">Visit us for a physical tour or contact us for more details</p>
              <div className="flex flex-wrap gap-4 justify-center">
                <button className="bg-orange-500 text-white px-8 py-3 rounded-lg hover:bg-orange-600 transition font-medium">
                  Contact for Booking
                </button>
                <button className="bg-white border-2 border-orange-500 text-orange-600 px-8 py-3 rounded-lg hover:bg-orange-50 transition font-medium">
                  Schedule a Visit
                </button>
              </div>
              <p className="mt-4 text-gray-600">
                Call us: +91 99043 72800 | Street Name - Changa, City - Anand, 388421
              </p>
            </div>
          </div>
        </section>

        
        {selectedImage && (
          <div 
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 text-white hover:text-orange-500 transition z-50"
            >
              <FontAwesomeIcon icon={faTimes} className="text-3xl" />
            </button>
            <div className="max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
              <div className="bg-white rounded-xl overflow-hidden">
                <div className="relative h-96 bg-gray-900">
                  <img
                    src={getImageSrc(selectedImage.url)}
                    alt={selectedImage.title}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/images/Homepage.png";
                    }}
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-semibold mb-2">{selectedImage.title}</h3>
                  <p className="text-gray-600 mb-4">{selectedImage.description}</p>
                  <button 
                    onClick={() => setSelectedImage(null)}
                    className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}