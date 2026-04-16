import { LogIn } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

const LoginButton = () => {
  const navigate = useNavigate();
  return (
    <StyledWrapper>
      <button onClick={() => navigate("/login")} className="cursor-pointer items-center gap-3 flex w-full justify-center">
        <LogIn size={20} strokeWidth={2.5} />
        <span>Masuk</span>
      </button>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  button {
    padding: 12px 28px;
    border: unset;
    border-radius: 15px; 
    color: #ffffff; 
    z-index: 1;
    background: var(--color-primary, #1E293B); 
    position: relative;
    font-weight: 800; 
    font-size: 15px;
    transition: all 250ms ease;
    overflow: hidden;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); 
  }

  button::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 0;
    border-radius: 15px;
    /* PERBAIKAN: Menggunakan putih transparan agar efek sapuan terlihat jelas di background gelap */
    background-color: rgba(255, 255, 255, 0.2); 
    z-index: -1;
    transition: all 250ms ease;
  }

  button:hover {
    transform: translateY(-2px); 
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.15);
  }

  button:hover::before {
    width: 100%;
  }

  button:active {
    transform: translateY(0); 
  }
`;

export default LoginButton;