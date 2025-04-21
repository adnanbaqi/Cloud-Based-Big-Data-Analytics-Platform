// import "./NavBar.css";
import NavBarUl from "./NavBarUl";
import styled from "styled-components";

const StyledNavBar = styled.nav`
  position: fixed;
  background-color: var(--bg-primary);
  transition: width 600ms ease;
  padding-left: 0;
  z-index: 100;

  @media only screen and (max-width: 600px) {
    bottom: 0;
    width: 100vw;
    height: 5rem;
  }

  @media only screen and (min-width: 600px) {
    top: 0;
    width: 4rem;
    height: 100vh;

    :hover {
      width: 16rem;
    }
    :hover ul li:first-child svg {
      transform: rotate(-540deg);
      margin-left: 11rem;
    }

    :hover ul li svg {
      color: orange;
    }

    :hover ul li:first-child span {
      left: 0px;
      display: block;
    }

    ul li .link-text {
      display: none;
    }

    :hover ul li .link-text {
      color: orange;
      display: block;
      margin-left: 1rem;
    }
  }
`;

const NavBar = () => {
  return (
    <StyledNavBar className="navbar">
      <NavBarUl />
    </StyledNavBar>
  );
};

export default NavBar;
