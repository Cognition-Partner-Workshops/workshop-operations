"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { FaArrowRight, FaTrophy, FaUsers, FaMedal } from "react-icons/fa";

const Scene3D = dynamic(() => import("./Scene3D"), { ssr: false });

const stats = [
  { icon: FaTrophy, value: "15+", label: "National Titles" },
  { icon: FaUsers, value: "2000+", label: "Athletes Trained" },
  { icon: FaMedal, value: "4", label: "Sports Disciplines" },
];

export default function Hero() {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-primary-950/40 via-transparent to-[#0a0a0f]" />

      <Scene3D />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-6"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-primary-300 font-medium">
            <span className="w-2 h-2 rounded-full bg-primary-400 animate-pulse" />
            National Champion Led Academy
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6"
        >
          <span className="text-white">Unleash Your</span>
          <br />
          <span className="gradient-text">Athletic Potential</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Train with National Champion{" "}
          <span className="text-white font-semibold">Rahul Joshi</span> and our
          elite coaches in Badminton, Swimming, Basketball & Martial Arts at
          Thane&apos;s premier sports academy.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <motion.a
            href="#contact"
            className="group flex items-center gap-2 px-8 py-4 text-white font-semibold rounded-2xl bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-500 hover:to-accent-500 transition-all duration-300 shadow-xl shadow-primary-500/25"
            whileHover={{ scale: 1.05, y: -3 }}
            whileTap={{ scale: 0.95 }}
          >
            Start Your Journey
            <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
          </motion.a>
          <motion.a
            href="#sports"
            className="flex items-center gap-2 px-8 py-4 text-gray-300 font-semibold rounded-2xl glass hover:bg-white/10 transition-all duration-300"
            whileHover={{ scale: 1.05, y: -3 }}
            whileTap={{ scale: 0.95 }}
          >
            Explore Sports
          </motion.a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="grid grid-cols-3 gap-4 sm:gap-8 max-w-lg mx-auto"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1 + i * 0.15 }}
              className="text-center"
            >
              <stat.icon className="w-5 h-5 text-primary-400 mx-auto mb-2" />
              <p className="text-2xl sm:text-3xl font-bold text-white">
                {stat.value}
              </p>
              <p className="text-xs sm:text-sm text-gray-500">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-6 h-10 rounded-full border-2 border-gray-600 flex items-start justify-center p-1.5"
        >
          <motion.div className="w-1.5 h-1.5 rounded-full bg-primary-400" />
        </motion.div>
      </motion.div>
    </section>
  );
}
