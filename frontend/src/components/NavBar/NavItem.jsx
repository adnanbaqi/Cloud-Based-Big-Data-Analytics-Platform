import React from "react";
import NavItemLink from "./NavItemLink";
import styled from "styled-components";

const StyledNavItem = styled.li`
  width: 100%;
  margin-bottom: 1rem;
  margin-right: 0px;
  text-align: center;
  font-size: 1.5rem;
  letter-spacing: 0.3ch;
`;

const NavItem = ({ linkText, svgPaths }) => {
  return (
    <StyledNavItem>
      <NavItemLink linkText={linkText} svgPaths={svgPaths} />
    </StyledNavItem>
  );
};

export default NavItem;
