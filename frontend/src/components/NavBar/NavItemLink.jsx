import styled, { keyframes } from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const hoverBackground = keyframes`
  from {
    background: initial;
  }
  to {
    background: var(--bg-secondary);
  }
`;

const StyledNavItemLink = styled.a`
  display: flex;
  align-items: center;
  height: 5rem;
  color: var(--text-primary);
  text-decoration: none;
  filter: grayscale(70%) opacity(0.7);
  transition: var(--transition-speed);

  :hover {
    filter: grayscale(0%) opacity(1);
    color: var(--text-secondary);
    animation: 400ms ${hoverBackground} ease-out forwards;
    animation-delay: 400ms; // Adjust this to match the time it takes for the navbar to expand
  }

  @media only screen and (max-width: 600px) {
    justify-content: center;
  }

  svg {
    width: 2rem;
    min-width: 2rem;
  }

  .link-text {
    animation: 1000ms ${fadeIn} ease-out forwards;
    animation-delay: 200ms; // Adjust this to match the time it takes for the navbar to expand
    opacity: 0;
  }
`;

const NavItemLink = ({ svgPaths, linkText }) => {
  const navigate = useNavigate();
  const handleClick = (linkText) => {
    if (linkText === "Nasa") navigate("/");
    if (linkText === "Cloud") navigate("/cloud");
    if (linkText === "Scraper") navigate("/scraper");
    if (linkText === "CSV") navigate("/uploads");
  };


  return (
    <StyledNavItemLink
      onClick={() => handleClick(linkText)}
      href="#"
      className="nav-link"
    >
      <FontAwesomeIcon icon={svgPaths} />
      <span className="link-text">{linkText}</span>
    </StyledNavItemLink>
  );
};

export default NavItemLink;
