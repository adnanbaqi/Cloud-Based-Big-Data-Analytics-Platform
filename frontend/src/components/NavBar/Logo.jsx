// import "./Logo.css";
import styled from "styled-components";
import NavLink from "./NavLink";

const StyledLogo = styled.li`
  width: 100%;
  margin-bottom: 1rem;
  text-align: center;
  font-size: 1.5rem;
  letter-spacing: 0.3ch;
`;

const Logo = () => {
  return (
    <StyledLogo>
      <NavLink />
    </StyledLogo>
  );
};

export default Logo;
