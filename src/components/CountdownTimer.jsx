import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const CountdownTimer = ({ durationInMinutes, examId }) => {
  const navigate = useNavigate();
  
  // Don't start timer if examId is not provided
  if (!examId) {
    return null;
  }
  
  const storageKey = `exam-timer-${examId}`;
  const durationInSeconds = durationInMinutes * 60;

  const getInitialTime = () => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      const { endTime } = JSON.parse(saved);
      const secondsLeft = Math.floor((new Date(endTime) - new Date()) / 1000);
      return secondsLeft > 0 ? secondsLeft : 0;
    } else {
      const endTime = new Date(Date.now() + durationInSeconds * 1000);
      localStorage.setItem(storageKey, JSON.stringify({ endTime }));
      return durationInSeconds;
    }
  };

  const [secondsLeft, setSecondsLeft] = useState(getInitialTime);

  useEffect(() => {
    if (secondsLeft <= 0) {
      alert("Süreniz doldu. Ana sayfaya yönlendiriliyorsunuz.");
      navigate("/");
      return;
    }

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          alert("Süreniz doldu. Ana sayfaya yönlendiriliyorsunuz.");
          navigate("/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [navigate]);

  const formatTime = () => {
    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  return (
    <div className="position-fixed" 
         style={{ 
           top: 100, 
           right: 20, 
           zIndex: 1000 
         }}>
      <div className="glass-effect px-4 py-3 shadow-lg">
        <div className="d-flex align-items-center">
          <i className="bi bi-clock text-warning me-2 fs-5"></i>
          <span className="fw-bold fs-5 text-white">{formatTime()}</span>
        </div>
      </div>
    </div>
  );
};

export default CountdownTimer;
