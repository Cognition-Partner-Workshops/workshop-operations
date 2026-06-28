"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import {
  FaPaperPlane,
  FaCheckCircle,
  FaExclamationCircle,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaTableTennis,
  FaComment,
} from "react-icons/fa";

interface FormData {
  name: string;
  email: string;
  phone: string;
  sport: string;
  message: string;
  type: string;
}

const sportOptions = [
  { value: "", label: "Select a sport" },
  { value: "badminton", label: "Badminton" },
  { value: "swimming", label: "Swimming" },
  { value: "basketball", label: "Basketball" },
  { value: "martial-arts", label: "Martial Arts" },
  { value: "multiple", label: "Multiple Sports" },
];

const inquiryTypes = [
  { value: "enrollment", label: "New Enrollment" },
  { value: "trial", label: "Free Trial Class" },
  { value: "feedback", label: "Feedback" },
  { value: "general", label: "General Inquiry" },
  { value: "partnership", label: "Partnership" },
];

export default function Contact() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    setSubmitStatus("loading");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setSubmitStatus("success");
        reset();
        setTimeout(() => setSubmitStatus("idle"), 5000);
      } else {
        setSubmitStatus("error");
        setTimeout(() => setSubmitStatus("idle"), 5000);
      }
    } catch {
      setSubmitStatus("error");
      setTimeout(() => setSubmitStatus("idle"), 5000);
    }
  };

  return (
    <section
      id="contact"
      className="relative section-padding"
      ref={sectionRef}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f] via-accent-950/5 to-[#0a0a0f]" />

      <div className="relative z-10 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full glass text-sm text-accent-300 font-medium mb-4">
            Get in Touch
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Ready to Begin Your
            <br />
            <span className="gradient-text">Sports Journey?</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Reach out for enrollment, book a free trial class, or share your
            feedback. We&apos;d love to hear from you!
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-8 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-3"
          >
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="glass-card rounded-3xl p-6 sm:p-8 lg:p-10"
            >
              <div className="grid sm:grid-cols-2 gap-5 mb-5">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                    <FaUser className="text-primary-400 text-xs" />
                    Full Name *
                  </label>
                  <input
                    {...register("name", {
                      required: "Name is required",
                      minLength: { value: 2, message: "Min 2 characters" },
                    })}
                    type="text"
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/30 transition-all duration-300 text-sm"
                  />
                  {errors.name && (
                    <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                      <FaExclamationCircle />
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                    <FaEnvelope className="text-primary-400 text-xs" />
                    Email Address *
                  </label>
                  <input
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address",
                      },
                    })}
                    type="email"
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/30 transition-all duration-300 text-sm"
                  />
                  {errors.email && (
                    <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                      <FaExclamationCircle />
                      {errors.email.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5 mb-5">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                    <FaPhone className="text-primary-400 text-xs" />
                    Phone Number *
                  </label>
                  <input
                    {...register("phone", {
                      required: "Phone is required",
                      pattern: {
                        value: /^[+]?[0-9]{10,13}$/,
                        message: "Invalid phone number",
                      },
                    })}
                    type="tel"
                    placeholder="+91 XXXXXXXXXX"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/30 transition-all duration-300 text-sm"
                  />
                  {errors.phone && (
                    <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                      <FaExclamationCircle />
                      {errors.phone.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                    <FaTableTennis className="text-primary-400 text-xs" />
                    Sport Interest *
                  </label>
                  <select
                    {...register("sport", {
                      required: "Please select a sport",
                    })}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/30 transition-all duration-300 text-sm appearance-none"
                  >
                    {sportOptions.map((opt) => (
                      <option
                        key={opt.value}
                        value={opt.value}
                        className="bg-gray-900"
                      >
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  {errors.sport && (
                    <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                      <FaExclamationCircle />
                      {errors.sport.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="mb-5">
                <label className="text-sm font-medium text-gray-300 mb-2 block">
                  Inquiry Type *
                </label>
                <div className="flex flex-wrap gap-2">
                  {inquiryTypes.map((type) => (
                    <label key={type.value} className="cursor-pointer">
                      <input
                        {...register("type", {
                          required: "Select inquiry type",
                        })}
                        type="radio"
                        value={type.value}
                        className="peer sr-only"
                      />
                      <span className="inline-block px-4 py-2 rounded-lg text-sm border border-white/10 text-gray-400 peer-checked:border-primary-500/50 peer-checked:bg-primary-500/10 peer-checked:text-primary-300 transition-all duration-300 hover:bg-white/5">
                        {type.label}
                      </span>
                    </label>
                  ))}
                </div>
                {errors.type && (
                  <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                    <FaExclamationCircle />
                    {errors.type.message}
                  </p>
                )}
              </div>

              <div className="mb-6">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                  <FaComment className="text-primary-400 text-xs" />
                  Message
                </label>
                <textarea
                  {...register("message")}
                  rows={4}
                  placeholder="Tell us about your goals, experience level, or any questions..."
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/30 transition-all duration-300 text-sm resize-none"
                />
              </div>

              <motion.button
                type="submit"
                disabled={submitStatus === "loading"}
                className="w-full flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-primary-600 to-accent-600 text-white font-semibold shadow-lg shadow-primary-500/25 hover:from-primary-500 hover:to-accent-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={
                  submitStatus !== "loading" ? { scale: 1.02, y: -2 } : {}
                }
                whileTap={submitStatus !== "loading" ? { scale: 0.98 } : {}}
              >
                {submitStatus === "loading" ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending...
                  </>
                ) : submitStatus === "success" ? (
                  <>
                    <FaCheckCircle />
                    Sent Successfully!
                  </>
                ) : submitStatus === "error" ? (
                  <>
                    <FaExclamationCircle />
                    Failed - Try Again
                  </>
                ) : (
                  <>
                    <FaPaperPlane />
                    Send Inquiry
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="lg:col-span-2 space-y-4"
          >
            <div className="glass-card rounded-2xl p-6">
              <h4 className="text-white font-semibold text-lg mb-3">
                Why Join Us?
              </h4>
              <ul className="space-y-3">
                {[
                  "Free trial class available",
                  "Flexible batch timings",
                  "National champion-led coaching",
                  "State-of-the-art facilities",
                  "Affordable fee structure",
                  "Personalized training plans",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-3 text-gray-300 text-sm"
                  >
                    <FaCheckCircle className="text-primary-400 text-xs flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass-card rounded-2xl p-6">
              <h4 className="text-white font-semibold text-lg mb-3">
                Quick Connect
              </h4>
              <div className="space-y-3">
                <a
                  href="tel:+91XXXXXXXXXX"
                  className="flex items-center gap-3 text-gray-300 hover:text-primary-400 transition-colors text-sm"
                >
                  <FaPhone className="text-primary-400" />
                  +91-XXXXXXXXXX
                </a>
                <a
                  href="mailto:info@allsportsprofessionals.com"
                  className="flex items-center gap-3 text-gray-300 hover:text-primary-400 transition-colors text-sm"
                >
                  <FaEnvelope className="text-primary-400" />
                  info@allsportsprofessionals.com
                </a>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6 bg-gradient-to-br from-primary-500/10 to-accent-500/10">
              <h4 className="text-white font-semibold text-lg mb-2">
                Book a Free Trial
              </h4>
              <p className="text-gray-400 text-sm mb-4">
                Experience our world-class coaching first-hand. Try any sport
                absolutely free!
              </p>
              <motion.a
                href="#contact"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition-all"
                whileHover={{ scale: 1.05 }}
              >
                Book Now
              </motion.a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
