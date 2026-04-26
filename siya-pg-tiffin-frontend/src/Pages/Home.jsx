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
  faArrowRight,
  faStar,
  faCheckCircle,
  faPhone,
} from "@fortawesome/free-solid-svg-icons";
import Navbar from "../components/Navbar";
import API from "../utils/api";

const texts = ["SwadBox", "સ્વાદબોક્સ", "स्वादबॉक्स"];

export default function Home() {
  const [displayText, setDisplayText] = useState("");
  const [textIndex, setTextIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Real database stats
  const [stats, setStats] = useState({
    students: "0",
    customers: "0",
    rooms: "0",
    vacancy: "7"
  });

  // Typewriter effect
  useEffect(() => {
    const currentText = texts[textIndex];
    let timer;

    if (!isDeleting && charIndex < currentText.length) {
      timer = setTimeout(() => {
        setDisplayText(currentText.substring(0, charIndex + 1));
        setCharIndex(charIndex + 1);
      }, 150);
    } else if (isDeleting && charIndex > 0) {
      timer = setTimeout(() => {
        setDisplayText(currentText.substring(0, charIndex - 1));
        setCharIndex(charIndex - 1);
      }, 100);
    } else if (!isDeleting && charIndex === currentText.length) {
      timer = setTimeout(() => setIsDeleting(true), 2000);
    } else if (isDeleting && charIndex === 0) {
      setIsDeleting(false);
      setTextIndex((prev) => (prev + 1) % texts.length);
    }

    return () => clearTimeout(timer);
  }, [charIndex, isDeleting, textIndex]);

  // Fetch Public Stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await API.get("/public/stats");
        if (res.data.success) {
          setStats(res.data.stats);
        }
      } catch (err) {
        console.error("Failed to fetch public stats:", err);
      }
    };
    fetchStats();
  }, []);

  const services = [
    {
      id: 1,
      title: "Premium Daily Food",
      desc: "Fresh, hygienic home-style meals prepared daily with love.",
      icon: faUtensils,
    },
    {
      id: 2,
      title: "PG Accommodations",
      desc: "Comfortable, fully-furnished rooms with modern amenities.",
      icon: faHouse,
    },
    {
      id: 3,
      title: "Flexible Tiffin Plans",
      desc: "Customize your meals with our daily or monthly subscriptions.",
      icon: faBoxOpen,
    },
    {
      id: 4,
      title: "Transparent Billing",
      desc: "Simple and transparent digital billing system.",
      icon: faReceipt,
    },
    {
      id: 5,
      title: "Lightning Fast Delivery",
      desc: "Hot food delivered right to your doorstep on time.",
      icon: faTruckFast,
    },
    {
      id: 6,
      title: "24/7 Priority Support",
      desc: "Dedicated support team to handle all your queries instantly.",
      icon: faHeadset,
    },
  ];

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-orange-50/30 overflow-hidden font-sans">
        {/* Hero Section */}
        <section className="relative h-screen flex items-center justify-center px-6 overflow-hidden pt-16">
          <div className="absolute inset-0 w-full h-full">
            <img
              src="/images/Homepage.png"
              alt="Food background"
              className="w-full h-full object-cover object-center scale-105 animate-[pulse_20s_ease-in-out_infinite_alternate]"
              onError={(e) => {
                e.target.src = "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=2000&auto=format&fit=crop";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-orange-950/80 via-gray-900/70 to-orange-950/90 z-10 backdrop-blur-[2px]"></div>
          </div>

          <div className="relative z-20 flex flex-col items-center justify-center text-center max-w-5xl mx-auto w-full mt-10">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-white tracking-tight mb-6 leading-tight flex flex-col items-center">
              <span>Experience</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500 h-[1.2em] min-w-[300px] flex items-center justify-center drop-shadow-lg">
                {displayText}<span className="animate-pulse text-white font-light">|</span>
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-orange-100 font-medium mb-12 max-w-2xl animate-fade-in-up animation-delay-200">
              The ultimate destination for healthy home-cooked meals & comfortable student living.
            </p>

            <div className="flex flex-col sm:flex-row gap-5 justify-center w-full max-w-md mx-auto animate-fade-in-up animation-delay-400">
              <Link to="/pg-gallery" className="group w-full relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-300 bg-orange-500 rounded-xl hover:bg-orange-600 hover:shadow-[0_0_20px_rgba(249,115,22,0.5)] hover:-translate-y-1 overflow-hidden">
                <span className="absolute w-0 h-0 transition-all duration-500 ease-out bg-white rounded-full group-hover:w-56 group-hover:h-56 opacity-10"></span>
                <span className="relative flex items-center gap-2">Visit Our PG <FontAwesomeIcon icon={faArrowRight} className="group-hover:translate-x-1 transition-transform" /></span>
              </Link>
              <Link to="/todays-menu" className="w-full inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-300 bg-white/10 border border-orange-500/50 backdrop-blur-sm rounded-xl hover:bg-orange-500/20 hover:border-orange-500 hover:-translate-y-1">
                View Today's Menu
              </Link>
            </div>
          </div>
        </section>

        {/* Features / Why Choose Us Section */}
        <section className="py-24 px-6 bg-white relative">
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-16">
              <span className="bg-orange-100 text-orange-600 px-5 py-2 rounded-full text-sm font-black tracking-widest uppercase mb-4 inline-block shadow-sm">Why Choose Us</span>
              <h3 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6">Redefining Student Living</h3>
              <p className="text-lg text-gray-500 max-w-2xl mx-auto">We combine the comfort of home with modern amenities to provide you the best living and dining experience.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { title: "Home Style Food", desc: "No artificial colors or excessive oil. Just pure, healthy meals like mother makes.", icon: faUtensils },
                { title: "Hygiene First", desc: "Strict hygiene protocols maintained in totally clean kitchens and living areas.", icon: faCheckCircle },
                { title: "Top Rated", desc: "Trusted by hundreds of students and professionals across the city.", icon: faStar }
              ].map((feature, idx) => (
                <div key={idx} className="bg-white rounded-2xl p-8 hover:bg-orange-50 border border-gray-100 hover:border-orange-200 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group">
                  <div className="w-16 h-16 bg-orange-100 rounded-2xl shadow-inner flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform group-hover:bg-orange-500">
                    <FontAwesomeIcon icon={feature.icon} className="text-3xl text-orange-500 group-hover:text-white transition-colors" />
                  </div>
                  <h4 className="text-xl font-black text-gray-900 mb-3 group-hover:text-orange-600 transition-colors">{feature.title}</h4>
                  <p className="text-gray-600 leading-relaxed font-medium">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Dynamic Database Statistics Banner */}
        <section className="py-20 px-6 bg-gradient-to-r from-orange-400 to-orange-500 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/5 mix-blend-overlay"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="max-w-6xl mx-auto relative z-10 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 divide-x-0 md:divide-x divide-white/20">
            {[
              { number: stats.students, label: "Total Students" },
              { number: stats.vacancy, label: "Student Vacancy" },
              { number: stats.rooms, label: "PG Rooms" },
              { number: stats.customers, label: "Active Customers" }
            ].map((stat, idx) => (
              <div key={idx} className="text-center px-4">
                <h3 className="text-4xl md:text-6xl font-black text-white mb-2 drop-shadow-md">{stat.number}</h3>
                <p className="text-orange-100 font-bold uppercase tracking-wider text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Services Section */}
        <section className="py-24 bg-gray-50 relative pb-32">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <span className="bg-orange-100 text-orange-600 px-5 py-2 rounded-full text-sm font-black tracking-widest uppercase mb-4 inline-block shadow-sm">Our Services</span>
              <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4">
                Everything You Need
              </h2>
              <div className="w-24 h-1.5 bg-orange-500 mx-auto rounded-full mb-6"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="bg-white p-8 rounded-3xl border border-gray-100 shadow-md hover:shadow-[0_15px_40px_rgba(249,115,22,0.15)] transition-all duration-300 md:hover:-translate-y-2 group"
                >
                  <div className={`w-20 h-20 mb-6 rounded-2xl flex items-center justify-center bg-orange-50 text-orange-500 shadow-inner transform group-hover:scale-110 group-hover:bg-orange-500 group-hover:text-white transition-all duration-300`}>
                    <FontAwesomeIcon icon={service.icon} className="text-3xl" />
                  </div>

                  <h3 className="text-2xl font-black mb-3 text-gray-900 group-hover:text-orange-500 transition-colors">{service.title}</h3>
                  <p className="text-gray-600 leading-relaxed font-medium">{service.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}