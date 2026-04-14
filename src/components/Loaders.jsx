import React from 'react';
import styled from 'styled-components';
import studyTracer from '../assets/studyTracer.svg';

const Loader = () => {
  return (
    <StyledWrapper>
      <div className="container">
        <div className="svg-wrapper">
          {/* Efek cahaya/aura di belakang logo */}
          <div className="glow-backdrop"></div>
          
          <div 
            className="logo-animated" 
            style={{ 
              maskImage: `url(${studyTracer})`, 
              WebkitMaskImage: `url(${studyTracer})` 
            }}
          >
            <div className="shimmer-effect"></div>
          </div>
        </div>

        <div className="loading-content">
          <div className="loading-bar"></div>
          <div className="loading-text">
            Memuat<span className="dot">.</span><span className="dot">.</span><span className="dot">.</span>
          </div>
        </div>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  /* Animasi muncul pertama kali (fade-in up) */
  animation: containerEntrance 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;

  .container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 30px; /* Jarak diperlebar sedikit agar bernapas */
  }

  .svg-wrapper {
    position: relative;
    width: 300px;
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* Aura cahaya di belakang logo */
  .glow-backdrop {
    position: absolute;
    width: 60%;
    height: 60%;
    background: #3c5759;
    filter: blur(40px);
    opacity: 0.4;
    border-radius: 50%;
    animation: glowPulse 3s ease-in-out infinite;
    z-index: 0;
  }

  .logo-animated {
    width: 100%;
    height: 100%;
    background-color: #3c5759;
    mask-repeat: no-repeat;
    mask-position: center;
    mask-size: contain;
    WebkitMaskRepeat: no-repeat;
    WebkitMaskPosition: center;
    WebkitMaskSize: contain;
    position: relative;
    overflow: hidden;
    z-index: 1;
    /* Diganti menjadi animasi mengambang yang lebih elegan */
    animation: float 3s ease-in-out infinite;
  }

  .shimmer-effect {
    position: absolute;
    top: 0;
    left: -150%; /* Diperjauh agar jeda kilap terasa pas */
    width: 60%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.8),
      transparent
    );
    /* Dimiringkan agar efek kacanya lebih realistis */
    transform: skewX(-25deg);
    animation: shine 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
  }

  .loading-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }

  .loading-bar {
    width: 150px; /* Sedikit diperpanjang */
    height: 6px; /* Sedikit ditebalkan */
    background: #e5e7eb; /* Warna abu-abu lebih terang */
    position: relative;
    overflow: hidden;
    border-radius: 10px;
  }

  .loading-bar::after {
    content: '';
    position: absolute;
    width: 30%;
    height: 100%;
    background: #3c5759;
    border-radius: 10px;
    /* Menambahkan bayangan bercahaya pada bar */
    box-shadow: 0 0 10px rgba(60, 87, 89, 0.5);
    animation: slide 1.5s infinite ease-in-out;
  }

  .loading-text {
    font-family: 'Inter', -apple-system, sans-serif;
    font-size: 13px;
    font-weight: 600;
    color: #6b7280;
    letter-spacing: 1px;
    text-transform: uppercase;
  }

  /* Animasi titik-titik pada teks memuat */
  .dot {
    animation: blink 1.4s infinite both;
  }
  .dot:nth-child(1) { animation-delay: 0.2s; }
  .dot:nth-child(2) { animation-delay: 0.4s; }
  .dot:nth-child(3) { animation-delay: 0.6s; }

  /* ================= KEYFRAMES ================= */
  
  @keyframes containerEntrance {
    0% { opacity: 0; transform: translateY(20px) scale(0.95); }
    100% { opacity: 1; transform: translateY(0) scale(1); }
  }

  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-8px); }
  }

  @keyframes glowPulse {
    0%, 100% { transform: scale(1); opacity: 0.3; }
    50% { transform: scale(1.3); opacity: 0.6; }
  }

  @keyframes shine {
    0% { left: -150%; }
    20%, 100% { left: 200%; } /* Menahan kilap sejenak sebelum diulang */
  }

  @keyframes slide {
    0% { transform: translateX(-150%); }
    100% { transform: translateX(350%); }
  }

  @keyframes blink {
    0% { opacity: 0.2; }
    20% { opacity: 1; }
    100% { opacity: 0.2; }
  }

  /* ================= DARK THEME ================= */
  @media (prefers-color-scheme: dark) {
    .logo-animated {
      background-color: #60a5fa;
    }
    .glow-backdrop {
      background: #60a5fa;
    }
    .loading-bar {
      background: #374151;
    }
    .loading-bar::after {
      background: #60a5fa;
      box-shadow: 0 0 10px rgba(96, 165, 250, 0.5);
    }
    .loading-text {
      color: #9ca3af;
    }
  }
`;

export default Loader;