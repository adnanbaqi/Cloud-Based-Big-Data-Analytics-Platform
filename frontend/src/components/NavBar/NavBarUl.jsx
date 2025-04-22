import styled from "styled-components";
import Logo from "./Logo";
import NavItem from "./NavItem";
import { faCloud, faGlobe, faSatellite, faUpload } from "@fortawesome/free-solid-svg-icons";

const StyledNavBarUl = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;

  @media only screen and (max-width: 600px) {
    flex-direction: row;
  }
`;

const NavBarUl = () => {
  return (
    <StyledNavBarUl>
      <Logo />

      <NavItem
        linkText={"Nasa"}
        svgPaths={faSatellite}
      />
      <NavItem
        linkText={"Cloud"}
        svgPaths={faCloud}
      />
      <NavItem
        linkText={"Scraper"}
        svgPaths={faGlobe}
      />

      <NavItem
        linkText={"CSV"}
        svgPaths={faUpload}
      />
    </StyledNavBarUl>
  );
};

export default NavBarUl;
