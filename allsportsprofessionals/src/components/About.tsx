"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  FaTrophy,
  FaStar,
  FaHandshake,
  FaGraduationCap,
  FaQuoteLeft,
} from "react-icons/fa";

const milestones = [
  {
    year: "Early Years",
    title: "A Champion is Born",
    description:
      "Rahul Joshi discovered his passion for badminton at the age of 8 in Thane, Maharashtra. With relentless dedication and hours of practice each day, he quickly rose through the junior ranks.",
  },
  {
    year: "Junior Career",
    title: "Dominating the Circuit",
    description:
      "Winning multiple state-level championships, Rahul established himself as one of India's most promising young badminton players, earning selection for national-level tournaments.",
  },
  {
    year: "National Glory",
    title: "National Level Champion",
    description:
      "Rahul achieved his dream of becoming a National Level Badminton Champion, competing against India's finest players and bringing pride to Maharashtra on the national stage.",
  },
  {
    year: "The Vision",
    title: "AllSportsProfessionals Founded",
    description:
      "Drawing from his championship experience, Rahul founded AllSportsProfessionals at One Indiabulls, Thane, with a mission to create world-class athletes across multiple sports disciplines.",
  },
];

const values = [
  {
    icon: FaTrophy,
    title: "Championship Mindset",
    description:
      "Training methodology developed from national-level competitive experience.",
  },
  {
    icon: FaStar,
    title: "Excellence in Every Sport",
    description:
      "Professional coaching across Badminton, Swimming, Basketball & Martial Arts.",
  },
  {
    icon: FaHandshake,
    title: "Personal Mentorship",
    description:
      "Rahul personally mentors athletes, sharing insights from his championship journey.",
  },
  {
    icon: FaGraduationCap,
    title: "Holistic Development",
    description:
      "Beyond technique: mental toughness, discipline, and sportsmanship.",
  },
];

export default function About() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section id="about" className="relative section-padding" ref={sectionRef}>
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f] via-primary-950/10 to-[#0a0a0f]" />

      <div className="relative z-10 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full glass text-sm text-primary-300 font-medium mb-4">
            Our Story
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            From National Champion to
            <br />
            <span className="gradient-text">Visionary Coach</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            The inspiring journey of Rahul Joshi, from the badminton courts of
            Maharashtra to founding Thane&apos;s premier multi-sport academy.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16 items-start mb-20">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="relative">
              <div className="glass-card rounded-3xl p-8 lg:p-10">
                <FaQuoteLeft className="text-primary-500/30 text-4xl mb-4" />
                <blockquote className="text-xl text-gray-300 italic leading-relaxed mb-6">
                  &ldquo;Every champion was once a beginner who refused to give
                  up. My journey from picking up a racquet for the first time to
                  standing on the national podium taught me that greatness is not
                  about talent alone &mdash; it&apos;s about relentless passion,
                  discipline, and the courage to push beyond your limits every
                  single day.&rdquo;
                </blockquote>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-xl">
                    RJ
                  </div>
                  <div>
                    <p className="text-white font-semibold text-lg">
                      Rahul Joshi
                    </p>
                    <p className="text-primary-400 text-sm">
                      Founder & National Level Badminton Champion
                    </p>
                  </div>
                </div>
              </div>

              <div className="absolute -top-4 -right-4 w-20 h-20 rounded-2xl bg-gradient-to-br from-sport-badminton/20 to-transparent blur-xl" />
              <div className="absolute -bottom-4 -left-4 w-24 h-24 rounded-2xl bg-gradient-to-br from-primary-500/20 to-transparent blur-xl" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="space-y-6"
          >
            {milestones.map((milestone, i) => (
              <motion.div
                key={milestone.title}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.5 + i * 0.15 }}
                className="flex gap-4 group"
              >
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 group-hover:scale-150 transition-transform duration-300" />
                  {i < milestones.length - 1 && (
                    <div className="w-px h-full bg-gradient-to-b from-primary-500/30 to-transparent" />
                  )}
                </div>
                <div className="pb-6">
                  <span className="text-xs font-semibold text-primary-400 uppercase tracking-wider">
                    {milestone.year}
                  </span>
                  <h3 className="text-lg font-bold text-white mt-1 mb-2">
                    {milestone.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {milestone.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6"
        >
          {values.map((value, i) => (
            <motion.div
              key={value.title}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.8 + i * 0.1 }}
              className="glass-card rounded-2xl p-6 text-center group"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <value.icon className="text-primary-400 text-xl" />
              </div>
              <h3 className="text-white font-semibold mb-2">{value.title}</h3>
              <p className="text-gray-500 text-sm">{value.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
