import { useState } from "react";
import Navbar from "../components/Navbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMapMarkerAlt,
  faPhone,
  faEnvelope,
  faClock,
} from "@fortawesome/free-solid-svg-icons";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Thank you for contacting us! We'll get back to you soon.");
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#fdf8f2] pt-16 md:pt-20">
        <div className="bg-orange-500 text-white py-8 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-2 sm:mb-4">Contact Us</h1>
            <p className="text-sm sm:text-base md:text-xl text-orange-100 max-w-2xl mx-auto px-2">
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>
        </div>

      
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            <div className="lg:col-span-1 space-y-4 sm:space-y-6">
              <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 text-center hover:shadow-xl transition">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="text-2xl sm:text-3xl text-orange-500" />
                </div>
                <h3 className="text-base sm:text-xl font-semibold mb-2">Visit Us</h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  123, ABC Street<br />2,CHANGA<br />
                  City - Anand<br />
                  Gujrat, India
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 text-center hover:shadow-xl transition">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <FontAwesomeIcon icon={faPhone} className="text-2xl sm:text-3xl text-orange-500" />
                </div>
                <h3 className="text-base sm:text-xl font-semibold mb-2">Call Us</h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  +91 99043 72800<br />
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 text-center hover:shadow-xl transition">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <FontAwesomeIcon icon={faEnvelope} className="text-2xl sm:text-3xl text-orange-500" />
                </div>
                <h3 className="text-base sm:text-xl font-semibold mb-2">Email Us</h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  info@swadbox.com<br />
                  support@swadbox.com
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 text-center hover:shadow-xl transition">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <FontAwesomeIcon icon={faClock} className="text-2xl sm:text-3xl text-orange-500" />
                </div>
                <h3 className="text-base sm:text-xl font-semibold mb-2">Visit time</h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  Monday - Saturday<br />
                  9:00 AM - 8:00 PM<br />
                  Sunday: Closed
                </p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 md:p-8">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 text-orange-500">Send us a Message</h2>
                
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                  <div>
                    <label className="block text-xs sm:text-sm text-gray-700 font-medium mb-1 sm:mb-2">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm text-gray-700 font-medium mb-1 sm:mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                      placeholder="Enter your email"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm text-gray-700 font-medium mb-1 sm:mb-2">
                      Message *
                    </label>
                    <textarea
                      required
                      rows="4"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                      placeholder="Write your message here..."
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-orange-500 text-white py-2 sm:py-4 rounded-lg font-semibold text-sm sm:text-base md:text-lg hover:bg-orange-600 transition duration-300"
                  >
                    Send Message
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>  );
}