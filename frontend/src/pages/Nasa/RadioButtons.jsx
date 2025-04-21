import "bootstrap/dist/css/bootstrap.min.css";
import { useState } from "react";
import Button from "react-bootstrap/Button";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import styled from "styled-components";

const StyledButtonGroup = styled.div`
  margin-bottom: 1rem;
  display: flex;
  justify-content: center;
`;

const RadioButtons = ({ radioButtons, setRadioButtons }) => {
  const [active, setActive] = useState({
    searchById: radioButtons.searchById ? "primary" : "secondary",
    browse: radioButtons.browse ? "primary" : "secondary",
    dateSearch: radioButtons.dateSearch ? "primary" : "secondary",
  });

  const handleSearchById = () => {
    setActive({
      searchById: "primary",
      browse: "secondary",
      dateSearch: "secondary",
    });

    setRadioButtons({
      searchById: true,
      browse: false,
      dateSearch: false,
    });
  };

  const handleBrowse = () => {
    setActive({
      searchById: "secondary",
      browse: "primary",
      dateSearch: "secondary",
    });

    setRadioButtons({
      searchById: false,
      browse: true,
      dateSearch: false,
    });
  };

  const handleDateSearch = () => {
    setActive({
      searchById: "secondary",
      browse: "secondary",
      dateSearch: "primary",
    });

    setRadioButtons({
      searchById: false,
      browse: false,
      dateSearch: true,
    });
  };

  return (
    <StyledButtonGroup>
      <ButtonGroup aria-label="Choose search">
        <Button
          variant={active.dateSearch}
          onClick={(e) => handleDateSearch(e)}
        >
          Time Period
        </Button>
        <Button variant={active.searchById} onClick={() => handleSearchById()}>
          By ID
        </Button>
        <Button variant={active.browse} onClick={() => handleBrowse()}>
          Browse
        </Button>
      </ButtonGroup>
    </StyledButtonGroup>
  );
};

export default RadioButtons;
