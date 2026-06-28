"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";
import { FaClock, FaUser, FaArrowRight, FaTag } from "react-icons/fa";

const blogPosts = [
  {
    id: 1,
    title: "5 Badminton Techniques Every Beginner Must Master",
    excerpt:
      "From the basic grip to the powerful smash, discover the five essential badminton techniques that form the foundation of every great player. Our National Champion coach Rahul Joshi breaks them down step by step.",
    image: "/images/sport-badminton.jpg",
    category: "Badminton",
    categoryColor: "bg-amber-500/20 text-amber-400",
    author: "Rahul Joshi",
    date: "June 25, 2026",
    readTime: "5 min read",
  },
  {
    id: 2,
    title: "Why Swimming is the Best Full-Body Workout for Kids",
    excerpt:
      "Swimming engages every muscle group while being gentle on growing joints. Learn why pediatric sports scientists recommend swimming as the ideal sport for children aged 4-12 and how it builds lifelong fitness habits.",
    image: "/images/sport-swimming.jpg",
    category: "Swimming",
    categoryColor: "bg-cyan-500/20 text-cyan-400",
    author: "ASP Team",
    date: "June 20, 2026",
    readTime: "4 min read",
  },
  {
    id: 3,
    title: "Basketball IQ: How to Read the Game Like a Pro",
    excerpt:
      "Great basketball players think two moves ahead. This guide covers court vision, defensive reading, and the mental frameworks that separate good players from great ones. Perfect for aspiring competitive players.",
    image: "/images/sport-basketball.jpg",
    category: "Basketball",
    categoryColor: "bg-red-500/20 text-red-400",
    author: "ASP Team",
    date: "June 15, 2026",
    readTime: "6 min read",
  },
  {
    id: 4,
    title: "Martial Arts for Self-Discipline: Beyond Physical Training",
    excerpt:
      "Martial arts training transforms more than just your body. Explore how regular practice builds mental resilience, emotional control, and the discipline that carries over to academics, career, and daily life.",
    image: "/images/sport-martial.jpg",
    category: "Martial Arts",
    categoryColor: "bg-violet-500/20 text-violet-400",
    author: "ASP Team",
    date: "June 10, 2026",
    readTime: "5 min read",
  },
  {
    id: 5,
    title: "The Champion's Morning Routine: How Rahul Joshi Starts His Day",
    excerpt:
      "A peek into the daily routine of National Champion Rahul Joshi. From 5 AM meditation to structured training blocks, discover the habits that fuel championship performance and how you can adapt them.",
    image: "/images/hero-banner.jpg",
    category: "Inspiration",
    categoryColor: "bg-primary-500/20 text-primary-400",
    author: "Rahul Joshi",
    date: "June 5, 2026",
    readTime: "7 min read",
  },
  {
    id: 6,
    title: "Nutrition Tips for Young Athletes: Fuel Your Performance",
    excerpt:
      "What you eat matters as much as how you train. Our sports nutrition guide covers pre-workout meals, hydration strategies, and recovery foods tailored specifically for young athletes across all sports.",
    image: "/images/blog-header.jpg",
    category: "Health & Fitness",
    categoryColor: "bg-green-500/20 text-green-400",
    author: "ASP Team",
    date: "June 1, 2026",
    readTime: "5 min read",
  },
];

export default function Blog() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section id="blog" className="relative section-padding" ref={sectionRef}>
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f] via-primary-950/5 to-[#0a0a0f]" />

      <div className="relative z-10 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full glass text-sm text-primary-300 font-medium mb-4">
            Our Blog
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Sports Insights &
            <br />
            <span className="gradient-text">Training Tips</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Expert articles from our coaches on technique, fitness, nutrition,
            and the champion mindset.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogPosts.map((post, i) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 * i }}
              className="glass-card rounded-2xl overflow-hidden group cursor-pointer"
            >
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute top-4 left-4">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${post.categoryColor}`}
                  >
                    <FaTag className="text-[9px]" />
                    {post.category}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-lg font-bold text-white mb-3 group-hover:text-primary-400 transition-colors line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-3">
                  {post.excerpt}
                </p>

                <div className="flex items-center justify-between text-xs text-gray-600">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <FaUser className="text-[10px]" />
                      {post.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <FaClock className="text-[10px]" />
                      {post.readTime}
                    </span>
                  </div>
                  <span>{post.date}</span>
                </div>

                <div className="mt-4 pt-4 border-t border-white/5">
                  <span className="inline-flex items-center gap-2 text-sm text-primary-400 font-medium group-hover:gap-3 transition-all">
                    Read More
                    <FaArrowRight className="text-xs" />
                  </span>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
