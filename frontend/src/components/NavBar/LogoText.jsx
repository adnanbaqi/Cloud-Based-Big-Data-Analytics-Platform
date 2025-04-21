// import './LogoText.css'
import styled from "styled-components";

const StyledLinkText = styled.span`

  font-weight: bold;
  text-transform: uppercase;
  margin-left: 1rem;
  display: inline;
  position: absolute;
  left: -999px;
  transition: var(--transition-speed);

  @media only screen and (max-width: 600px) {
    display: none;
  }
`;

const LogoText = () => {
  return <StyledLinkText>Big Data</StyledLinkText>;
};

export default LogoText;
