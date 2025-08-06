import React from "react";

const SoruNavigasyonu = ({ currentQuestion, setCurrentQuestion, totalQuestions, answers }) => {
  const containerStyle = {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(16px)',
    borderRadius: 'var(--radius-xl)',
    padding: '24px',
    boxShadow: 'var(--shadow-lg)',
    border: '1px solid rgba(255, 255, 255, 0.2)'
  };

  const buttonStyle = (isCurrent, isAnswered) => ({
    borderRadius: "var(--radius-lg)", 
    width: "44px", 
    height: "44px",
    fontSize: "13px",
    transition: "var(--transition-normal)",
    boxShadow: isCurrent ? "var(--shadow-md)" : "none",
    transform: "translateY(0)",
    cursor: "pointer",
    minWidth: "44px",
    maxWidth: "44px",
    flexShrink: 0,
    padding: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: isCurrent ? "transparent" : isAnswered ? "transparent" : "white",
    color: isCurrent ? "white" : isAnswered ? "white" : "#1f2937",
    margin: "2px"
  });

  const handleButtonHover = (e) => {
    e.target.style.transform = "translateY(-2px)";
    e.target.style.boxShadow = "var(--shadow-lg)";
  };

  const handleButtonLeave = (e, isCurrent) => {
    e.target.style.transform = "translateY(0)";
    e.target.style.boxShadow = isCurrent ? "var(--shadow-md)" : "none";
  };

  // Soruları 4'lü gruplara böl
  const chunkArray = (array, size) => {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  };

  const questionGroups = chunkArray([...Array(totalQuestions)], 4);

  return (
    <div className="soru-navigasyonu" style={containerStyle}>
      <div className="d-flex flex-column gap-2">
        <div className="text-center mb-4">
          <h6 className="fw-bold text-white mb-2">Soru Navigasyonu</h6>
          <small className="text-white-50">Soru {currentQuestion + 1} / {totalQuestions}</small>
        </div>
        
        <div className="d-flex flex-column gap-2">
          {questionGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="d-flex justify-content-center gap-1" style={{ gap: "12px", flexWrap: "nowrap", overflow: "hidden", padding: "4px" }}>
              {group.map((_, index) => {
                const actualIndex = groupIndex * 4 + index;
                const isAnswered = answers && answers[actualIndex + 1] !== undefined;
                const isCurrent = actualIndex === currentQuestion;
                
                return (
                  <button
                    key={actualIndex}
                    onClick={() => setCurrentQuestion(actualIndex)}
                    className={`fw-bold position-relative ${
                      isCurrent 
                        ? "btn-primary" 
                        : isAnswered 
                          ? "btn-success" 
                          : ""
                    }`}
                    style={buttonStyle(isCurrent, isAnswered)}
                    onMouseEnter={handleButtonHover}
                    onMouseLeave={(e) => handleButtonLeave(e, isCurrent)}
                  >
                    {actualIndex + 1}
                    {isAnswered && !isCurrent && (
                      <div className="position-absolute top-0 start-100 translate-middle">
                        <div className="bg-success rounded-circle" style={{ width: "6px", height: "6px" }}></div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
        
        <div className="mt-4 p-3 rounded glass-effect" 
             style={{ borderRadius: "var(--radius-lg)" }}>
          <div className="d-flex align-items-center gap-2 mb-2">
            <div className="rounded-circle" style={{ 
              width: "12px", 
              height: "12px",
              background: "linear-gradient(135deg, #8b5cf6, #ec4899)"
            }}></div>
            <small className="text-white-50">Mevcut</small>
          </div>
          <div className="d-flex align-items-center gap-2 mb-2">
            <div className="rounded-circle" style={{ 
              width: "12px", 
              height: "12px",
              background: "var(--success)"
            }}></div>
            <small className="text-white-50">Cevaplandı</small>
          </div>
          <div className="d-flex align-items-center gap-2">
            <div className="bg-white rounded-circle" style={{ width: "12px", height: "12px" }}></div>
            <small className="text-white-50">Cevaplanmadı</small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SoruNavigasyonu;
