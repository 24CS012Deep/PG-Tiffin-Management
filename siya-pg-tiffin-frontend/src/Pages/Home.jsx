import { useEffect, useState } from "react";
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

      <div className="pt-20 min-h-screen bg-[#fdf8f2] text-gray-800">
        <section className="relative h-[80vh] flex items-center justify-center px-6 overflow-hidden">
          <img
            src="/images/Homepage.png"
            alt="Food background"
            className="absolute inset-0 w-full h-full object-cover blur-sm opacity-80 z-0"
          />

          <div className="absolute inset-0 bg-black/50 z-0"></div>

          <div className="relative z-10 flex flex-col items-center text-center">
            <h1 className="text-7xl md:text-8xl lg:text-9xl font-extrabold text-white tracking-wide mb-6">
              {displayText}
              <span className="animate-pulse text-orange-400">|</span>
            </h1>

            <div className="grid gap-3 mb-6">
              <p className="text-2xl md:text-3xl text-orange-200 font-medium">
                Welcome to{" "}
                <span className="text-white font-semibold">
                  Siya PG & Tiffin Service
                </span>
              </p>

              <p className="text-lg md:text-xl text-orange-200">
                Healthy PG Food & Smart PG Management
              </p>
            </div>

            <div className="flex flex-wrap gap-4 justify-center">
              <button className="bg-orange-50 border-orange-200 text-orange-600 px-10 py-3 rounded-lg  hover:bg-orange-300 transition">
                Visit Our PG
              </button>
              <button className="bg-orange-50 border-orange-200 text-orange-600 px-6 py-3 rounded-lg hover:bg-orange-300 transition">
                View Today’s Menu
              </button>
            </div>
          </div>
        </section>

        <section className="py-16 text-center">
          <h2 className="text-3xl font-semibold mb-4">
            Your All-in-One Living Solution
          </h2>
          <p className="text-orange-500 mb-8 max-w-2xl mx-auto">
            Comfortable stays and healthy home-cooked meals, all under one roof.
          </p>
          {/* MINI STATS BOXES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
            {/* PG Students */}
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg text-center border border-orange-200">
              <h3 className="text-3xl font-bold text-orange-500">4+</h3>
              <p className="text-gray-700 font-medium">Total PG Students</p>
            </div>

            {/* Tiffin Customers */}
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg text-center border border-orange-200">
              <h3 className="text-3xl font-bold text-orange-500">10+</h3>
              <p className="text-gray-700 font-medium">
                Total Tiffin Customers
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white py-16">
          <h2 className="text-2xl md:text-3xl font-semibold text-center mb-12 text-orange-500">
            View Our Services
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 max-w-6xl mx-auto px-6">
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
                title: "Feedback & Support System",
                desc: "If you have any query, submit your feedback form.",
                icon: faHeadset,
              },
            ].map((service) => (
              <div
                key={service.id}
                onClick={() => setActiveService(service.id)}
                className={`
          p-10 rounded-2xl text-center cursor-pointer border-2 transition-all duration-300
          ${
            activeService === service.id
              ? "bg-orange-500 border-orange-600 text-white scale-105 shadow-xl"
              : "bg-orange-50 border-orange-200 text-gray-800 hover:shadow-lg"
          }
        `}
              >
                <div
                  className={`
            w-24 h-20 mx-auto mb-6 rounded-xl flex items-center justify-center transition
            ${activeService === service.id ? "bg-orange-600" : "bg-orange-100"}
          `}
                >
                  <FontAwesomeIcon icon={service.icon} className="text-4xl" />
                </div>

                <h3 className="text-xl font-semibold mb-2">{service.title}</h3>

                <p className="text-sm">{service.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
