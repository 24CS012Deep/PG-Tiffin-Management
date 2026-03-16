import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUtensils,
  faHouse,
  faTruckFast,
  faReceipt,
  faHeadset,
  faBoxOpen,
} from "@fortawesome/free-solid-svg-icons";
import Navbar from "../components/Navbar";

const texts = ["SwadBox", "સ્વાદબોક્સ", "स्वादबॉक्स", "સ્વાદબોક્સ"];

export default function Home() {
  const [displayText, setDisplayText] = useState("");
  const [textIndex, setTextIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [activeService, setActiveService] = useState(null);

  useEffect(() => {
    if (charIndex < texts[textIndex].length) {
      const timer = setTimeout(() => {
        setDisplayText((prev) => prev + texts[textIndex][charIndex]);
        setCharIndex(charIndex + 1);
      }, 120);
      return () => clearTimeout(timer);
    } else {
      const pause = setTimeout(() => {
        setDisplayText("");
        setCharIndex(0);
        setTextIndex((prev) => (prev + 1) % texts.length);
      }, 1200);
      return () => clearTimeout(pause);
    }
  }, [charIndex, textIndex]);

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-[#fdf8f2] text-gray-800">
        {/* Hero Section */}
        <section className="relative h-screen flex items-center justify-center px-6 overflow-hidden">
          <img
            src="/images/Homepage.png"
            alt="Food background"
            className="absolute inset-0 w-full h-full object-cover blur-sm opacity-80"
          />

          <div className="absolute inset-0 bg-black/50"></div>

          <div className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto">
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-extrabold text-white tracking-wide mb-6">
              {displayText}
              <span className="animate-pulse text-orange-400">|</span>
            </h1>

            <div className="grid gap-3 mb-8">
              <p className="text-xl md:text-2xl text-orange-200 font-medium">
                Welcome to{" "}
                <span className="text-white font-semibold">
                  Siya PG & Tiffin Service
                </span>
              </p>

              <p className="text-base md:text-lg text-orange-200">
                Healthy PG Food & Smart PG Management
              </p>
            </div>

            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/pg-gallery">
                <button className="bg-white/90 border-2 border-orange-300 text-orange-600 px-8 py-3 rounded-lg hover:bg-orange-100 transition-all duration-300 font-medium">
                  Visit Our PG
                </button>
              </Link>
              <Link to="/signup">
                <button className="bg-white/90 border-2 border-orange-300 text-orange-600 px-8 py-3 rounded-lg hover:bg-orange-100 transition-all duration-300 font-medium">
                  View Today's Menu
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 px-6 bg-[#fdf8f2]">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-semibold text-center mb-4">
              Your All-in-One Living Solution
            </h2>
            <p className="text-orange-500 text-center mb-12 max-w-2xl mx-auto text-lg">
              Comfortable stays and healthy home-cooked meals, all under one roof.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
              <div className="bg-white p-8 rounded-2xl shadow-lg text-center border border-orange-200 hover:shadow-xl transition-shadow">
                <h3 className="text-4xl font-bold text-orange-500 mb-2">4+</h3>
                <p className="text-gray-700 font-medium text-lg">Total PG Students</p>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-lg text-center border border-orange-200 hover:shadow-xl transition-shadow">
                <h3 className="text-4xl font-bold text-orange-500 mb-2">10+</h3>
                <p className="text-gray-700 font-medium text-lg">Total Tiffin Customers</p>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-semibold text-center mb-4 text-orange-500">
              View Our Services
            </h2>
            <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
              Explore our comprehensive range of services designed for your comfort
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  id: 1,
                  title: "Daily Food",
                  desc: "Fresh, hygienic home-style meals every day.",
                  icon: faUtensils,
                },
                {
                  id: 2,
                  title: "PG Availability",
                  desc: "Real-time room availability with easy booking.",
                  icon: faHouse,
                },
                {
                  id: 3,
                  title: "Order Tiffin",
                  desc: "Place daily or monthly tiffin orders easily.",
                  icon: faBoxOpen,
                },
                {
                  id: 4,
                  title: "Monthly Billing",
                  desc: "Simple, transparent digital billing system.",
                  icon: faReceipt,
                },
                {
                  id: 5,
                  title: "Fast Delivery",
                  desc: "On-time food delivery to customer.",
                  icon: faTruckFast,
                },
                {
                  id: 6,
                  title: "Feedback & Support",
                  desc: "If you have any query, submit your feedback form.",
                  icon: faHeadset,
                },
              ].map((service) => (
                <div
                  key={service.id}
                  onClick={() => setActiveService(service.id)}
                  className={`
                    p-8 rounded-2xl text-center border-2 transition-all duration-300 cursor-pointer
                    ${
                      activeService === service.id
                        ? "bg-orange-500 border-orange-600 text-white scale-105 shadow-xl"
                        : "bg-orange-50 border-orange-200 text-gray-800 hover:shadow-lg hover:border-orange-300"
                    }
                  `}
                >
                  <div
                    className={`
                      w-20 h-20 mx-auto mb-4 rounded-xl flex items-center justify-center transition
                      ${activeService === service.id ? "bg-orange-600" : "bg-orange-100"}
                    `}
                  >
                    <FontAwesomeIcon 
                      icon={service.icon} 
                      className={`text-3xl ${
                        activeService === service.id ? "text-white" : "text-orange-500"
                      }`}
                    />
                  </div>

                  <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                  <p className="text-sm leading-relaxed">{service.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}