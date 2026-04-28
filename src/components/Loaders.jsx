import React from 'react';
import styled from 'styled-components';

const Loader = () => {
  // Pisahkan teks menjadi array huruf
  const text = "STUDY TRACER".split("");

  return (
    <StyledWrapper>
      {/* Container untuk Teks */}
      <div className="text-container">
        {text.map((char, index) => (
          <span 
            key={index} 
            className="letter"
            style={{ 
              animationDelay: `calc(var(--ANIMATION-DELAY-MULTIPLIER) * ${index})`,
              width: char === " " ? "0.5em" : "auto" 
            }}
          >
            {char}
          </span>
        ))}
      </div>

      {/* Container untuk animasi garis "Tracer" di bawah teks
      <div className="tracer-container">
        <div className="tracer-line"></div>
      </div> */}
      {/* <div className="Buttons w-[2px] md:w-5"  /> */}
      <div className="loader">
        <div className="dot dot-1" />
        <div className="dot dot-2" />
        <div className="dot dot-3" />
        <div className="dot dot-4" />
        <div className="dot dot-5" />
        <div className="dot dot-6" />
        <div className="dot dot-7" />
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  /* Menyusun teks dan bar agar berada di tengah dan berurutan atas-bawah */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 15px; /* Jarak antara teks dan garis loading */
  
  /* --- STYLING TEKS --- */
  .text-container {
    --ANIMATION-DELAY-MULTIPLIER: 70ms;
    padding: 0 10px;
    margin: 0;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    max-width: 100vw;
  }
  
  .letter {
    padding: 0;
    margin: 0;
    font-family: 'Arial Black', sans-serif;
    font-size: clamp(1.5rem, 6vw, 4rem);
    font-weight: bold;
    color: var(--color-primary);
    display: inline-block;
    
    transform: translateY(1.5em);
    animation: hideAndSeek 1s alternate infinite cubic-bezier(0.86, 0, 0.07, 1);
  }

  @keyframes hideAndSeek {
    0% {
      transform: translateY(1.5em);
    }
    100% {
      transform: translateY(0);
    }
  }

  .loader {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-pack: center;
    -ms-flex-pack: center;
    justify-content: center;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
    height: 100%;
  }

  .dot {
    display: inline-block;
    width: 10px;
    height: 10px;
    margin-right: 6px;
    border-radius: 50%;
    background-color: var(--color-primary);
    -webkit-animation: dot-pulse2 1.5s ease-in-out infinite;
    animation: dot-pulse2 1.5s ease-in-out infinite;
  }

  .dot-1 {
    -webkit-animation-delay: 0s;
    animation-delay: 0s;
  }

  .dot-2 {
    -webkit-animation-delay: 0.3s;
    animation-delay: 0.3s;
  }

  .dot-3 {
    -webkit-animation-delay: 0.6s;
    animation-delay: 0.6s;
  }

  .dot-4 {
    -webkit-animation-delay: 0.9s;
    animation-delay: 0.9s;
  }

  .dot-5 {
    -webkit-animation-delay: 1.2s;
    animation-delay: 1.2s;
  }

  .dot-6 {
    -webkit-animation-delay: 1.5s;
    animation-delay: 1.5s;
  }

  .dot-7 {
    -webkit-animation-delay: 1.8s;
    animation-delay: 1.8s;
  }

  @keyframes dot-pulse2 {
    0% {
      -webkit-transform: scale(0.5);
      transform: scale(0.5);
      opacity: 0.5;
    }

    50% {
      -webkit-transform: scale(1);
      transform: scale(1);
      opacity: 1;
    }

    100% {
      -webkit-transform: scale(0.5);
      transform: scale(0.5);
      opacity: 0.5;
    }
  }
`;

export default Loader;