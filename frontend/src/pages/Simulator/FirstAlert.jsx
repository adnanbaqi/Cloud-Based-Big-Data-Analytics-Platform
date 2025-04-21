import React from "react";
import styled, { keyframes, css } from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faX,
  faCircleExclamation,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import "animate.css";

const AlertContainer = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  grid-gap: 1rem;
  align-items: center;
  background-color: ${(props) =>
    props.type === "error" ? "#FFF2F0" : "#FFFBE6"};
  border: ${(props) =>
    props.type === "error" ? "1px solid #FFCCC7" : "1px solid #FFE58F"};
  border-radius: 1rem;
  margin-bottom: 1rem;
  padding: 1rem;
  animation: flash 1s;
`;

const MessageContainer = styled.div`
  display: grid;
  grid-template-rows: auto auto;
  grid-gap: 0.5rem;
`;

const TitleContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
`;

const DescriptionContainer = styled.div`
  border-radius: 0.5rem;
  color: ${(props) => (props.type === "error" ? "#FF4D4F" : "#FFA940")};
  font-weight: 500;
`;

const FirstAlert = ({ message, description, type, index, onCloseFnc }) => {
  const handleClose = () => {
    onCloseFnc(index);
  };

  return (
    <AlertContainer type={type} className="animate__animated animate__bounceIn">
      {type === "error" ? (
        <FontAwesomeIcon
          icon={faCircleExclamation}
          style={{ color: "#FF4D4F" }}
          size="2xl"
        />
      ) : (
        <FontAwesomeIcon
          icon={faTriangleExclamation}
          style={{ color: "#FFA940" }}
          size="2xl"
        />
      )}
      <MessageContainer>
        <TitleContainer>
          <h3>{message}</h3>
          <FontAwesomeIcon
            icon={faX}
            style={{ cursor: "pointer" }}
            onClick={() => {
              handleClose(index);
            }}
          />
        </TitleContainer>
        <DescriptionContainer type={type}>{description}</DescriptionContainer>
      </MessageContainer>
    </AlertContainer>
  );
};

export default FirstAlert;
