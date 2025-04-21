import { useState } from "react";
import InformationByDate from "./InformationByDate";
import InformationByObservatoryandByDate from "./InformationByObservatoryandByDate";
import styled, { keyframes } from "styled-components";
import { Radio } from "antd";
import InfromationByIDandDate from "./InfromationByIDandDate";

const StyledInformationComponent = styled.div`
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
  margin-top: 4rem;
  margin-bottom: 8rem;
  min-height: 700px; // Set a minimum height, adjust as needed
`;

const StyledRadioGroup = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
`;

const StyledHeader = styled.h1`
  text-align: center;
  color: #000000;
  padding: 20px;
  margin-bottom: 40px;
`;

const InformationComponent = () => {
  const [activeComponent, setActiveComponent] = useState("InformationByDate");

  const optionsWithDisabled = [
    { label: "Search by Date", value: "InformationByDate" },
    {
      label: "Search by Event Source and Date",
      value: "InformationByObservatoryandByDate",
    },
    { label: "Search by ID and Date", value: "InformationByIDandDate" },
  ];

  const onChange = (e) => {
    setActiveComponent(e.target.value);
  };

  return (
    <StyledInformationComponent>
      <StyledHeader>Data Exploration </StyledHeader>

      <StyledRadioGroup>
        <Radio.Group
          options={optionsWithDisabled}
          onChange={onChange}
          value={activeComponent}
          optionType="button"
          buttonStyle="solid"
        />
      </StyledRadioGroup>
      {activeComponent === "InformationByIDandDate" && (
        <InfromationByIDandDate />
      )}
      {activeComponent === "InformationByObservatoryandByDate" && (
        <InformationByObservatoryandByDate />
      )}
      {activeComponent === "InformationByDate" && <InformationByDate />}
    </StyledInformationComponent>
  );
};

export default InformationComponent;
