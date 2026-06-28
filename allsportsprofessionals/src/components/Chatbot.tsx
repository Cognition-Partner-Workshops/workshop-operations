"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaCommentDots,
  FaTimes,
  FaPaperPlane,
  FaRobot,
  FaUser,
} from "react-icons/fa";

interface Message {
  id: number;
  text: string;
  sender: "bot" | "user";
  timestamp: Date;
}

const quickReplies = [
  "What sports do you offer?",
  "Tell me about fees",
  "Book a free trial",
  "Where are you located?",
  "Tell me about the founder",
];

function getBotResponse(userMessage: string): string {
  const msg = userMessage.toLowerCase();

  if (
    msg.includes("sport") ||
    msg.includes("offer") ||
    msg.includes("program") ||
    msg.includes("course")
  ) {
    return "We offer professional coaching in 4 sports:\n\n1. Badminton - Led by National Champion Rahul Joshi\n2. Swimming - Certified instructors, all ages\n3. Basketball - Fundamentals to competitive play\n4. Martial Arts - Multiple disciplines\n\nWhich sport interests you? I can share more details!";
  }

  if (
    msg.includes("fee") ||
    msg.includes("price") ||
    msg.includes("cost") ||
    msg.includes("charge")
  ) {
    return "Our fee structure is designed to be affordable and flexible! We offer:\n\n- Monthly plans\n- Quarterly packages (best value)\n- Annual memberships\n- Family discounts\n\nFor exact pricing, please fill out our contact form or call us. We also offer a FREE trial class so you can experience our coaching first!";
  }

  if (
    msg.includes("trial") ||
    msg.includes("free") ||
    msg.includes("demo") ||
    msg.includes("try")
  ) {
    return "Yes! We offer a FREE trial class for all sports. Simply:\n\n1. Choose your preferred sport\n2. Fill out the contact form on our website\n3. Select 'Free Trial Class' as inquiry type\n4. We'll call you to schedule!\n\nNo commitment required. Come experience our world-class coaching firsthand!";
  }

  if (
    msg.includes("location") ||
    msg.includes("address") ||
    msg.includes("where") ||
    msg.includes("reach") ||
    msg.includes("map")
  ) {
    return "We're located at:\n\nOne Indiabulls Centre, Thane, Maharashtra 400601\n\nHow to reach us:\n- By Train: 5 min from Thane Railway Station\n- By Bus: Multiple BEST & TMT routes nearby\n- By Car: Easy access via Eastern Express Highway\n\nVisit our Location section for Google Maps directions!";
  }

  if (
    msg.includes("founder") ||
    msg.includes("rahul") ||
    msg.includes("joshi") ||
    msg.includes("coach") ||
    msg.includes("champion")
  ) {
    return "Rahul Joshi is the founder of AllSportsProfessionals and a National Level Badminton Champion!\n\nHis journey:\n- Started playing badminton at age 8 in Thane\n- Won multiple state-level championships\n- Achieved National Level Champion status\n- Founded AllSportsProfessionals to train the next generation\n\nHe personally coaches badminton and mentors athletes across all sports!";
  }

  if (
    msg.includes("time") ||
    msg.includes("timing") ||
    msg.includes("hour") ||
    msg.includes("schedule") ||
    msg.includes("batch")
  ) {
    return "Our general timings:\n\n- Monday to Saturday: 6:00 AM - 9:00 PM\n- Sunday: 7:00 AM - 6:00 PM\n\nWe have multiple batches throughout the day for flexibility. Morning, afternoon, and evening slots are available for all sports. Contact us to find a batch that fits your schedule!";
  }

  if (
    msg.includes("age") ||
    msg.includes("kid") ||
    msg.includes("child") ||
    msg.includes("adult") ||
    msg.includes("senior")
  ) {
    return "We welcome athletes of ALL ages!\n\n- Kids: 4+ years (swimming), 6+ years (other sports)\n- Teenagers: Competitive & recreational programs\n- Adults: Fitness, recreation & competitive training\n- Seniors: Wellness-focused programs\n\nEach sport has age-appropriate batches with specialized coaching. Which age group are you looking for?";
  }

  if (msg.includes("hello") || msg.includes("hi") || msg.includes("hey")) {
    return "Hello! Welcome to AllSportsProfessionals! I'm here to help you with any questions about our sports academy. What would you like to know about?";
  }

  if (msg.includes("thank") || msg.includes("thanks")) {
    return "You're welcome! If you have any more questions, feel free to ask. We'd love to see you at our academy! You can also fill out our contact form or call us directly.";
  }

  if (msg.includes("badminton")) {
    return "Our Badminton program is our flagship, led by National Champion Rahul Joshi himself!\n\nHighlights:\n- Personal coaching from a National Champion\n- Advanced footwork & racquet technique\n- Match strategy & mental conditioning\n- Tournament preparation\n- Video analysis & performance tracking\n\nAvailable for ages 6+ through seniors. Want to book a free trial?";
  }

  if (msg.includes("swim")) {
    return "Our Swimming program features certified professional coaches and state-of-the-art facilities!\n\nPrograms available:\n- Learn-to-swim (all ages)\n- Competitive stroke training\n- Water safety & survival skills\n- Fitness swimming\n- Small batch sizes for personal attention\n\nTimings: Mon-Sat 6AM-8PM, Sun 7AM-5PM";
  }

  if (msg.includes("basketball")) {
    return "Our Basketball program builds complete players!\n\nTraining includes:\n- Fundamental skills & ball handling\n- Offensive & defensive strategies\n- Physical conditioning & agility\n- Team play & communication\n- 3v3 and 5v5 competitive leagues\n- Youth development pathway\n\nProfessional coaches guide you from basics to competitive play!";
  }

  if (msg.includes("martial") || msg.includes("karate") || msg.includes("kung")) {
    return "Our Martial Arts program transforms mind and body!\n\nWhat we offer:\n- Multiple martial arts disciplines\n- Self-defense techniques\n- Belt grading & progression system\n- Mental discipline & focus training\n- Flexibility & strength conditioning\n- Separate batches for kids, teens & adults\n\nBuild confidence, respect, and physical mastery!";
  }

  return "Thanks for your message! I can help you with:\n\n- Sports programs we offer\n- Fee structure & pricing\n- Booking a free trial class\n- Academy location & timings\n- About our founder Rahul Joshi\n- Age-specific programs\n\nWhat would you like to know more about?";
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hi there! Welcome to AllSportsProfessionals! I'm your virtual assistant. How can I help you today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Date.now(),
      text: text.trim(),
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const botResponse = getBotResponse(text);
      const botMsg: Message = {
        id: Date.now() + 1,
        text: botResponse,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 800 + Math.random() * 700);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100%-2rem)] sm:w-[380px] max-h-[500px] rounded-2xl overflow-hidden shadow-2xl shadow-primary-500/20 border border-white/10"
            style={{ background: "rgba(10, 10, 15, 0.95)", backdropFilter: "blur(20px)" }}
          >
            <div className="bg-gradient-to-r from-primary-600 to-accent-600 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                  <FaRobot className="text-white text-sm" />
                </div>
                <div>
                  <h4 className="text-white font-semibold text-sm">
                    ASP Assistant
                  </h4>
                  <p className="text-white/70 text-xs">Always here to help</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/80 hover:bg-white/20 transition-colors"
                aria-label="Close chat"
              >
                <FaTimes className="text-xs" />
              </button>
            </div>

            <div className="h-[320px] overflow-y-auto p-4 space-y-3 scrollbar-thin">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2 ${
                    msg.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.sender === "bot" && (
                    <div className="w-7 h-7 rounded-full bg-primary-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                      <FaRobot className="text-primary-400 text-[10px]" />
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                      msg.sender === "user"
                        ? "bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-br-md"
                        : "bg-white/5 text-gray-300 border border-white/5 rounded-bl-md"
                    }`}
                  >
                    {msg.text}
                  </div>
                  {msg.sender === "user" && (
                    <div className="w-7 h-7 rounded-full bg-accent-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                      <FaUser className="text-accent-400 text-[10px]" />
                    </div>
                  )}
                </motion.div>
              ))}

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-2 items-center"
                >
                  <div className="w-7 h-7 rounded-full bg-primary-500/20 flex items-center justify-center flex-shrink-0">
                    <FaRobot className="text-primary-400 text-[10px]" />
                  </div>
                  <div className="bg-white/5 border border-white/5 px-4 py-3 rounded-2xl rounded-bl-md flex gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {messages.length <= 2 && (
              <div className="px-4 pb-2">
                <p className="text-gray-600 text-[10px] uppercase tracking-wider mb-2 font-semibold">
                  Quick questions
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {quickReplies.map((reply) => (
                    <button
                      key={reply}
                      onClick={() => sendMessage(reply)}
                      className="px-3 py-1.5 rounded-full text-xs bg-white/5 text-gray-400 hover:bg-primary-500/10 hover:text-primary-300 border border-white/5 transition-all"
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="p-3 border-t border-white/5 flex gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-primary-500/30"
              />
              <motion.button
                type="submit"
                disabled={!input.trim()}
                className="w-10 h-10 rounded-xl bg-gradient-to-r from-primary-600 to-accent-600 flex items-center justify-center text-white disabled:opacity-30 disabled:cursor-not-allowed"
                whileHover={input.trim() ? { scale: 1.1 } : {}}
                whileTap={input.trim() ? { scale: 0.9 } : {}}
              >
                <FaPaperPlane className="text-xs" />
              </motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-4 sm:right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-primary-600 to-accent-600 flex items-center justify-center text-white shadow-xl shadow-primary-500/30 hover:shadow-primary-500/50 transition-shadow"
        whileHover={{ scale: 1.1, y: -2 }}
        whileTap={{ scale: 0.9 }}
        aria-label="Open chat"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <FaTimes className="text-lg" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
            >
              <FaCommentDots className="text-lg" />
            </motion.div>
          )}
        </AnimatePresence>

        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 border-2 border-[#0a0a0f] animate-pulse" />
        )}
      </motion.button>
    </>
  );
}
