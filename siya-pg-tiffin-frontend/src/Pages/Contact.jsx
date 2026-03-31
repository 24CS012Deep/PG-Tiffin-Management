import { useState } from "react";
import Navbar from "../components/Navbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMapMarkerAlt,
  faPhone,
  faEnvelope,
  faClock,
  faPaperPlane,
  faCheckCircle
} from "@fortawesome/free-solid-svg-icons";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: "", email: "", message: "" });
    }, 4000);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-orange-50/50 pt-16 md:pt-20 font-sans">
        
        {/* Dynamic Header */}
        <div className="bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 text-white py-12 md:py-20 relative overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/az-subtle.png')] opacity-20 mix-blend-overlay"></div>
          <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2"></div>
          
          <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
            <span className="bg-white/20 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-4 inline-block drop-shadow-sm border border-white/30 backdrop-blur-sm">Get In Touch</span>
            <h1 className="text-4xl md:text-6xl font-black mb-4 drop-shadow-md">Contact Us</h1>
            <p className="text-lg md:text-xl text-orange-50 max-w-2xl mx-auto font-medium">
              We're here to help and answer any question you might have. We look forward to hearing from you!
            </p>
          </div>
        </div>
      
        <div className="max-w-7xl mx-auto px-6 py-12 md:py-20 -mt-10 md:-mt-16 relative z-20">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            
            {/* Contact Information Cards */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgba(249,115,22,0.12)] p-8 hover:-translate-y-1 transition-transform duration-300 border border-orange-100 group">
                <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-orange-500 transition-colors shadow-inner">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="text-3xl text-orange-500 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Visit Us</h3>
                <p className="text-gray-600 font-medium leading-relaxed">
                  123, ABC Street<br />
                  2, CHANGA<br />
                  Anand, Gujarat, India - 388421
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
                <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgba(249,115,22,0.12)] p-8 hover:-translate-y-1 transition-transform duration-300 border border-orange-100 group">
                  <div className="flex items-center gap-5 mb-4">
                    <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-orange-500 transition-colors shadow-inner">
                      <FontAwesomeIcon icon={faPhone} className="text-xl text-orange-500 group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Call Us</h3>
                      <p className="text-gray-600 font-medium mt-1">+91 99043 72800</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgba(249,115,22,0.12)] p-8 hover:-translate-y-1 transition-transform duration-300 border border-orange-100 group">
                  <div className="flex items-center gap-5 mb-4">
                    <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-orange-500 transition-colors shadow-inner">
                      <FontAwesomeIcon icon={faEnvelope} className="text-xl text-orange-500 group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Email Us</h3>
                      <p className="text-gray-600 font-medium mt-1">support@swadbox.com</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form Container */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-3xl shadow-[0_15px_40px_rgba(249,115,22,0.15)] p-8 md:p-12 border-t-8 border-orange-500 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-bl-full -z-10"></div>
                
                {submitted ? (
                  <div className="h-full flex flex-col items-center justify-center text-center animate-fade-in py-16">
                    <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6">
                      <FontAwesomeIcon icon={faCheckCircle} className="text-5xl text-green-500" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Message Sent!</h2>
                    <p className="text-gray-500 font-medium max-w-sm">Thank you for reaching out to us. Our team will get back to you within 24 hours.</p>
                  </div>
                ) : (
                  <>
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Send us a Message</h2>
                    <p className="text-gray-500 font-medium mb-8">Fill out the form below and we will be in touch.</p>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">
                            Your Name <span className="text-orange-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-100 focus:border-orange-500 transition-all font-medium text-gray-800"
                            placeholder="John Doe"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">
                            Email Address <span className="text-orange-500">*</span>
                          </label>
                          <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-100 focus:border-orange-500 transition-all font-medium text-gray-800"
                            placeholder="john@example.com"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          Your Message <span className="text-orange-500">*</span>
                        </label>
                        <textarea
                          required
                          rows="5"
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-100 focus:border-orange-500 transition-all font-medium text-gray-800 resize-y"
                          placeholder="How can we help you?"
                        ></textarea>
                      </div>

                      <button
                        type="submit"
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-10 py-4 rounded-xl font-bold shadow-lg shadow-orange-200 hover:from-orange-600 hover:to-orange-700 hover:-translate-y-0.5 transition-all outline-none focus:ring-4 focus:ring-orange-200"
                      >
                        Send Message <FontAwesomeIcon icon={faPaperPlane} />
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </>
  );
}