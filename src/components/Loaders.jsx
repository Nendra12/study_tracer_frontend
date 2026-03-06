import React from 'react';
import styled from 'styled-components';
import studyTracer from '../assets/studyTracer.svg';

const Loader = () => {
  return (
    <StyledWrapper>
      <div className="container">
        <div className="svg-wrapper">
          {/* Menggunakan mask-image agar SVG kamu bertindak sebagai pemotong warna */}
          <div className="logo-animated" style={{ maskImage: `url(${studyTracer})`, WebkitMaskImage: `url(${studyTracer})` }}>
            <div className="shimmer-effect"></div>
          </div>
        </div>
        <div className="loading-bar"></div>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 20px;
  }

  .svg-wrapper {
    position: relative;
    width: 300px; /* Sesuaikan dengan lebar asli logo kamu */
    height: 80px;  /* Sesuaikan dengan tinggi asli logo kamu */
    display: flex;
    align-items: center;
    justify-content: center;
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
    animation: pulse 2s ease-in-out infinite;
  }

  /* Efek cahaya lewat (Shimmer) di dalam teks */
  .shimmer-effect {
    position: absolute;
    top: 0;
    left: -100%;
    width: 50%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.6),
      transparent
    );
    animation: shine 1.5s infinite;
  }

  .loading-bar {
    width: 120px;
    height: 3px;
    background: #9ca3af;
    position: relative;
    overflow: hidden;
    border-radius: 10px;
  }

  .loading-bar::after {
    content: '';
    position: absolute;
    width: 40%;
    height: 100%;
    background: #3c5759;
    animation: slide 1.5s infinite ease-in-out;
  }

  /* Animations */
  @keyframes shine {
    to {
      left: 150%;
    }
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.7; transform: scale(0.98); }
  }

  @keyframes slide {
    0% { transform: translateX(-150%); }
    100% { transform: translateX(250%); }
  }

  /* Dark Theme */
  @media (prefers-color-scheme: dark) {
    .logo-animated {
      background-color: #60a5fa;
    }
    .loading-bar::after {
      background: #60a5fa;
    }
  }
`;

export default Loader;