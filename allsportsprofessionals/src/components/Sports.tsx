"use client";

import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import Image from "next/image";
import {
  FaTableTennis,
  FaSwimmer,
  FaBasketballBall,
  FaFistRaised,
  FaCheck,
  FaClock,
  FaUserTie,
} from "react-icons/fa";

const sports = [
  {
    id: "badminton",
    name: "Badminton",
    icon: FaTableTennis,
    color: "from-amber-500 to-orange-600",
    bgGlow: "bg-amber-500/10",
    borderColor: "border-amber-500/20",
    textColor: "text-amber-400",
    image: "/images/sport-badminton.jpg",
    tagline: "Train Like a National Champion",
    description:
      "Learn from the best. Our badminton program is led by National Champion Rahul Joshi himself, offering unparalleled coaching from beginner to competitive level. Experience world-class footwork drills, strategic gameplay, and tournament preparation.",
    features: [
      "Personal coaching by National Champion Rahul Joshi",
      "Advanced footwork & racquet technique",
      "Match strategy & mental conditioning",
      "Tournament preparation & competition exposure",
      "Video analysis & performance tracking",
      "Age groups: 6+ years to seniors",
    ],
    schedule: "Mon-Sat: 6AM-9PM | Sun: 7AM-6PM",
    coach: "Rahul Joshi (National Champion)",
  },
  {
    id: "swimming",
    name: "Swimming",
    icon: FaSwimmer,
    color: "from-cyan-500 to-blue-600",
    bgGlow: "bg-cyan-500/10",
    borderColor: "border-cyan-500/20",
    textColor: "text-cyan-400",
    image: "/images/sport-swimming.jpg",
    tagline: "Dive Into Excellence",
    description:
      "Our state-of-the-art swimming program offers professional coaching for all levels. From learn-to-swim for young children to competitive stroke refinement, our certified coaches ensure safety, technique, and confidence in the water.",
    features: [
      "Learn-to-swim programs for all ages",
      "Competitive stroke technique training",
      "Water safety & survival skills",
      "Endurance & fitness swimming",
      "Certified professional coaches",
      "Small batch sizes for personal attention",
    ],
    schedule: "Mon-Sat: 6AM-8PM | Sun: 7AM-5PM",
    coach: "Certified Swimming Instructors",
  },
  {
    id: "basketball",
    name: "Basketball",
    icon: FaBasketballBall,
    color: "from-red-500 to-rose-600",
    bgGlow: "bg-red-500/10",
    borderColor: "border-red-500/20",
    textColor: "text-red-400",
    image: "/images/sport-basketball.jpg",
    tagline: "Rise Above the Rest",
    description:
      "Elevate your game on our professional courts. Our basketball program focuses on fundamental skills, tactical intelligence, and physical conditioning. From dribblers to dunkers, we build complete players ready for any competition.",
    features: [
      "Fundamental skills & ball handling",
      "Offensive & defensive strategies",
      "Physical conditioning & agility training",
      "Team play & communication",
      "3v3 and 5v5 competitive leagues",
      "Youth development pathway",
    ],
    schedule: "Mon-Sat: 6AM-9PM | Sun: 7AM-6PM",
    coach: "Professional Basketball Coaches",
  },
  {
    id: "martial",
    name: "Martial Arts",
    icon: FaFistRaised,
    color: "from-violet-500 to-purple-600",
    bgGlow: "bg-violet-500/10",
    borderColor: "border-violet-500/20",
    textColor: "text-violet-400",
    image: "/images/sport-martial.jpg",
    tagline: "Master Your Mind & Body",
    description:
      "Discover the ancient art of self-discipline and self-defense. Our martial arts program blends traditional techniques with modern training methods, building confidence, respect, and physical mastery in every practitioner.",
    features: [
      "Multiple martial arts disciplines",
      "Self-defense techniques",
      "Belt grading & progression system",
      "Mental discipline & focus training",
      "Flexibility & strength conditioning",
      "Kids, teens & adult batches",
    ],
    schedule: "Mon-Sat: 7AM-8PM | Sun: 8AM-5PM",
    coach: "Certified Martial Arts Instructors",
  },
];

export default function Sports() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const [activeSport, setActiveSport] = useState("badminton");

  const active = sports.find((s) => s.id === activeSport) ?? sports[0];

  return (
    <section id="sports" className="relative section-padding" ref={sectionRef}>
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f] via-accent-950/5 to-[#0a0a0f]" />

      <div className="relative z-10 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full glass text-sm text-accent-300 font-medium mb-4">
            Our Sports
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Four Disciplines,
            <br />
            <span className="gradient-text">One Passion for Excellence</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            World-class coaching across four exciting sports, each with
            dedicated facilities and professional trainers.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-12"
        >
          {sports.map((sport) => (
            <motion.button
              key={sport.id}
              onClick={() => setActiveSport(sport.id)}
              className={`relative flex flex-col items-center gap-3 p-4 sm:p-6 rounded-2xl transition-all duration-400 overflow-hidden ${
                activeSport === sport.id
                  ? `${sport.borderColor} border-2 shadow-lg`
                  : "glass-card hover:bg-white/5"
              }`}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.97 }}
            >
              {activeSport === sport.id && (
                <div className="absolute inset-0">
                  <Image
                    src={sport.image}
                    alt={sport.name}
                    fill
                    className="object-cover opacity-30"
                    sizes="(max-width: 640px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30" />
                </div>
              )}
              <div
                className={`relative z-10 w-12 h-12 rounded-xl flex items-center justify-center ${
                  activeSport === sport.id
                    ? `bg-gradient-to-br ${sport.color}`
                    : "bg-white/5"
                } transition-all duration-300`}
              >
                <sport.icon
                  className={`text-xl ${
                    activeSport === sport.id ? "text-white" : "text-gray-400"
                  }`}
                />
              </div>
              <span
                className={`relative z-10 text-sm font-semibold ${
                  activeSport === sport.id ? "text-white" : "text-gray-400"
                }`}
              >
                {sport.name}
              </span>
              {activeSport === sport.id && (
                <motion.div
                  layoutId="sportIndicator"
                  className={`absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-gradient-to-r ${sport.color} rounded-full z-10`}
                />
              )}
            </motion.button>
          ))}
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="glass-card rounded-3xl overflow-hidden"
          >
            <div className="grid lg:grid-cols-2 gap-0">
              <div className="relative min-h-[300px] lg:min-h-[500px]">
                <Image
                  src={active.image}
                  alt={`${active.name} at AllSportsProfessionals`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/30 hidden lg:block" />

                <div className="absolute bottom-0 left-0 right-0 p-8 lg:p-12">
                  <div
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r ${active.color} text-white text-xs font-medium mb-4 w-fit`}
                  >
                    <active.icon className="text-sm" />
                    {active.name}
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                    {active.tagline}
                  </h3>
                  <p className="text-gray-300 leading-relaxed mb-6 max-w-md">
                    {active.description}
                  </p>

                  <div className="flex flex-wrap gap-4 mb-6">
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <FaClock className={active.textColor} />
                      {active.schedule.split("|")[0]}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <FaUserTie className={active.textColor} />
                      {active.coach.length > 30
                        ? active.coach.substring(0, 30) + "..."
                        : active.coach}
                    </div>
                  </div>

                  <motion.a
                    href="#contact"
                    className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r ${active.color} text-white font-semibold shadow-lg transition-all duration-300 w-fit`}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Enroll Now
                  </motion.a>
                </div>
              </div>

              <div className="p-8 lg:p-12 border-t lg:border-t-0 lg:border-l border-white/5">
                <h4 className="text-lg font-semibold text-white mb-6">
                  What You&apos;ll Learn
                </h4>
                <ul className="space-y-4">
                  {active.features.map((feature) => (
                    <motion.li
                      key={feature}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-start gap-3"
                    >
                      <div
                        className={`w-5 h-5 rounded-md bg-gradient-to-br ${active.color} flex items-center justify-center flex-shrink-0 mt-0.5`}
                      >
                        <FaCheck className="text-white text-[10px]" />
                      </div>
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </motion.li>
                  ))}
                </ul>

                <div className="mt-8 p-4 rounded-xl bg-white/3 border border-white/5">
                  <div className="flex items-center gap-2 mb-2">
                    <FaClock className="text-gray-500 text-sm" />
                    <span className="text-gray-500 text-xs uppercase tracking-wider font-semibold">
                      Full Schedule
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm">{active.schedule}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
