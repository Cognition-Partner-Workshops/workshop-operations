"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  FaMapMarkerAlt,
  FaClock,
  FaPhone,
  FaEnvelope,
  FaDirections,
  FaTrain,
  FaBus,
  FaCar,
} from "react-icons/fa";

const contactInfo = [
  {
    icon: FaMapMarkerAlt,
    label: "Address",
    value: "One Indiabulls Centre, Thane, Maharashtra 400601",
    color: "text-primary-400",
  },
  {
    icon: FaClock,
    label: "Hours",
    value: "Mon-Sat: 6AM-9PM | Sun: 7AM-6PM",
    color: "text-accent-400",
  },
  {
    icon: FaPhone,
    label: "Phone",
    value: "+91-XXXXXXXXXX",
    color: "text-sport-badminton",
  },
  {
    icon: FaEnvelope,
    label: "Email",
    value: "info@allsportsprofessionals.com",
    color: "text-sport-swimming",
  },
];

const howToReach = [
  {
    icon: FaTrain,
    mode: "By Train",
    detail: "Thane Railway Station - 5 min drive",
  },
  {
    icon: FaBus,
    mode: "By Bus",
    detail: "Multiple BEST & TMT bus routes nearby",
  },
  {
    icon: FaCar,
    mode: "By Car",
    detail: "Easy access via Eastern Express Highway",
  },
];

export default function Location() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section
      id="location"
      className="relative section-padding"
      ref={sectionRef}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f] via-primary-950/10 to-[#0a0a0f]" />

      <div className="relative z-10 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full glass text-sm text-primary-300 font-medium mb-4">
            Visit Us
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Our Home at
            <br />
            <span className="gradient-text">One Indiabulls, Thane</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Strategically located in the heart of Thane for easy accessibility.
            State-of-the-art facilities designed for championship training.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-3"
          >
            <div className="glass-card rounded-3xl overflow-hidden h-full">
              <div className="relative w-full h-[300px] sm:h-[400px] lg:h-full min-h-[300px]">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3767.3!2d72.97!3d19.19!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7b9c1e4a4b4b1%3A0x4f4f4f4f4f4f4f4f!2sOne%20Indiabulls%20Centre%2C%20Thane!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="AllSportsProfessionals Location - One Indiabulls, Thane"
                  className="absolute inset-0"
                />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="lg:col-span-2 space-y-4"
          >
            {contactInfo.map((info, i) => (
              <motion.div
                key={info.label}
                initial={{ opacity: 0, y: 15 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="glass-card rounded-2xl p-5 flex items-start gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                  <info.icon className={`${info.color} text-lg`} />
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold mb-1">
                    {info.label}
                  </p>
                  <p className="text-gray-200 text-sm">{info.value}</p>
                </div>
              </motion.div>
            ))}

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.9 }}
              className="glass-card rounded-2xl p-5"
            >
              <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                <FaDirections className="text-primary-400" />
                How to Reach
              </h4>
              <div className="space-y-3">
                {howToReach.map((item) => (
                  <div key={item.mode} className="flex items-center gap-3">
                    <item.icon className="text-gray-500 text-sm" />
                    <div>
                      <span className="text-white text-sm font-medium">
                        {item.mode}:
                      </span>{" "}
                      <span className="text-gray-400 text-sm">
                        {item.detail}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.a
              href="https://maps.google.com/?q=One+Indiabulls+Centre+Thane"
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 15 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 1 }}
              className="flex items-center justify-center gap-2 w-full px-6 py-3.5 rounded-xl bg-gradient-to-r from-primary-600 to-accent-600 text-white font-semibold shadow-lg hover:from-primary-500 hover:to-accent-500 transition-all duration-300"
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
            >
              <FaDirections />
              Get Directions
            </motion.a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
