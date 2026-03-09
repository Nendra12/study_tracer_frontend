import { LogIn } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

const LoginButton = () => {
  const navigate = useNavigate();
  return (
    <StyledWrapper>
      <button onClick={() => navigate("/login")} className="cursor-pointer items-center gap-3 flex w-full justify-center">
        <LogIn size={19} className="font-bold"/>
        <span>Masuk</span>
      </button>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  button {
    padding: 12px 25px;
    border: unset;
    border-radius: 15px;
    color: #3c5759;
    z-index: 1;
    background: #f3f4f4;
    position: relative;
    font-weight: 1000;
    font-size: 14px;
    transition: all 250ms;
    overflow: hidden;
  }

  button::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 0;
    border-radius: 15px;
    background-color: #3c5759;
    z-index: -1;
    transition: all 250ms;
  }

  button:hover {
    color: white;
  }

  button:hover::before {
    width: 100%;
  }
`;

export default LoginButton;
