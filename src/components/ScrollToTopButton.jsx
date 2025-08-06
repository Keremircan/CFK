import { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";

const ScrollToTopButton = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 300);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return visible ? (
    <button
      onClick={scrollToTop}
      className="fixed bottom-8 right-8 z-50 w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl shadow-2xl hover:shadow-glow-lg transform hover:scale-105 transition-all duration-300 flex items-center justify-center group"
      title="Yukarı Çık"
    >
      <ChevronUp className="w-5 h-5 group-hover:animate-bounce" />
    </button>
  ) : null;
};

export default ScrollToTopButton;
