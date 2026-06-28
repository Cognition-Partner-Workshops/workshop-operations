"use client";

import { motion } from "framer-motion";
import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaYoutube,
  FaWhatsapp,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaArrowUp,
} from "react-icons/fa";

const socialLinks = [
  { icon: FaFacebookF, href: "#", label: "Facebook" },
  { icon: FaInstagram, href: "#", label: "Instagram" },
  { icon: FaTwitter, href: "#", label: "Twitter" },
  { icon: FaYoutube, href: "#", label: "YouTube" },
  { icon: FaWhatsapp, href: "#", label: "WhatsApp" },
];

const quickLinks = [
  { name: "Home", href: "#home" },
  { name: "About Us", href: "#about" },
  { name: "Sports", href: "#sports" },
  { name: "Location", href: "#location" },
  { name: "Contact", href: "#contact" },
];

const sportsLinks = [
  { name: "Badminton", href: "#sports" },
  { name: "Swimming", href: "#sports" },
  { name: "Basketball", href: "#sports" },
  { name: "Martial Arts", href: "#sports" },
];

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative border-t border-white/5">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f] to-primary-950/20" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center font-bold text-white text-lg">
                A
              </div>
              <span className="text-lg font-bold text-white">
                All<span className="gradient-text">Sports</span>Professionals
              </span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              Thane&apos;s premier multi-sport academy founded by National
              Champion Rahul Joshi. Training champions in Badminton, Swimming,
              Basketball & Martial Arts.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-gray-500 hover:text-white hover:bg-primary-500/20 transition-all duration-300"
                  whileHover={{ y: -3, scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <social.icon className="text-sm" />
                </motion.a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-500 hover:text-primary-400 text-sm transition-colors duration-300"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Our Sports</h4>
            <ul className="space-y-2">
              {sportsLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-500 hover:text-primary-400 text-sm transition-colors duration-300"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Contact Info</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-gray-500 text-sm">
                <FaMapMarkerAlt className="text-primary-400 mt-0.5 flex-shrink-0" />
                One Indiabulls Centre, Thane, Maharashtra 400601
              </li>
              <li>
                <a
                  href="tel:+91XXXXXXXXXX"
                  className="flex items-center gap-3 text-gray-500 hover:text-primary-400 text-sm transition-colors"
                >
                  <FaPhone className="text-primary-400" />
                  +91-XXXXXXXXXX
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@allsportsprofessionals.com"
                  className="flex items-center gap-3 text-gray-500 hover:text-primary-400 text-sm transition-colors"
                >
                  <FaEnvelope className="text-primary-400" />
                  info@allsportsprofessionals.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-600 text-sm">
            &copy; {new Date().getFullYear()} AllSportsProfessionals. All rights
            reserved.
          </p>

          <motion.button
            onClick={scrollToTop}
            className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-500 hover:text-white hover:bg-primary-500/20 transition-all duration-300"
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Scroll to top"
          >
            <FaArrowUp />
          </motion.button>
        </div>
      </div>
    </footer>
  );
}
