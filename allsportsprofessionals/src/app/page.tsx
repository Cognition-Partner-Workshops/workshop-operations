import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Sports from "@/components/Sports";
import Blog from "@/components/Blog";
import Location from "@/components/Location";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import Chatbot from "@/components/Chatbot";

export default function Home() {
  return (
    <main className="relative">
      <Navbar />
      <Hero />
      <About />
      <Sports />
      <Blog />
      <Location />
      <Contact />
      <Footer />
      <Chatbot />
    </main>
  );
}
