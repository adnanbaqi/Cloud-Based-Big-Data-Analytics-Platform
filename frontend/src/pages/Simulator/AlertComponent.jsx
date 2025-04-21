import React, { useEffect, useState } from "react";
import { TransitionGroup, CSSTransition } from "react-transition-group";
import { io } from "socket.io-client";
import styled from "styled-components";
import { Card } from "antd";
import Alert2Component from "./Alert2Component";
import FirstAlert from "./FirstAlert";

const StyledCard = styled(Card)`
  height: 34vh;
  border-bottom: 1px solid #00000020;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
  overflow-y: hidden;
  .ant-card-body {
    /* padding: 0; */
    height: 100%;
    overflow-y: auto;
  }
`;
const socket = io("http://localhost:3000");

const AlertComponent = () => {
  const [alerts, setAlerts] = useState(
    () => JSON.parse(localStorage.getItem("alerts")) || []
  );

  useEffect(() => {
    socket.on("alert", (alert) => {
      setAlerts((prevAlerts) => {
        const newAlerts = [JSON.parse(alert), ...prevAlerts];
        localStorage.setItem("alerts", JSON.stringify(newAlerts));
        return newAlerts;
      });
    });
    return () => socket.disconnect();
  }, []);

  const onCloseFnc = (index) => {
    setAlerts((prevAlerts) => {
      const newAlerts = [...prevAlerts];
      newAlerts.splice(index, 1);
      localStorage.setItem("alerts", JSON.stringify(newAlerts));
      return newAlerts;
    });
  };

  return (
    <StyledCard title={"Alerts"}>
      <TransitionGroup>
        {alerts.map((alert, index) =>
          index === 0 ? (
            <CSSTransition
              key={`${alert.eventTS}_${alert.title}_${alert.urgency}_${alert.eventType}`}
              timeout={500}
              classNames="item"
            >
              <FirstAlert
                message={`${alert.eventType}`}
                description={`Source: ${alert.eventSource}, Urgency :${alert.urgency}`}
                type={alert.urgency >= 3 ? "error" : "warning"}
                index={index}
                onCloseFnc={onCloseFnc}
              />
            </CSSTransition>
          ) : (
            <CSSTransition
              key={`${alert.eventTS}_${alert.title}_${alert.urgency}_${alert.eventType}`}
              timeout={500}
              classNames="item"
            >
              <Alert2Component
                message={`${alert.eventType}`}
                description={`Source: ${alert.eventSource}, Urgency :${alert.urgency}`}
                type={alert.urgency >= 3 ? "error" : "warning"}
                index={index}
                onCloseFnc={onCloseFnc}
              />
            </CSSTransition>
          )
        )}
      </TransitionGroup>
    </StyledCard>
  );
};

export default AlertComponent;
