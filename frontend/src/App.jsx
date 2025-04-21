// import "./App.css";
import { Route, Routes } from "react-router-dom";
import Simulator from "./pages/Simulator";
import Nasa from "./pages/Nasa";
import Scraper from "./pages/Scraper";
import NavBar from "./components/NavBar/NavBar";

import styled from "styled-components";

const StyledMain = styled.main`
  margin-left: 4rem;
  padding: 1rem;
`;

const App = () => (
  <>
    <NavBar />
    <StyledMain>
      <Routes>
        <Route path="/" element={<Simulator />} exact />
        <Route path="/nasa" element={<Nasa />} />
        <Route path="/scraper" element={<Scraper />} />
        <Route path="*" element={<Simulator />} />
      </Routes>
    </StyledMain>
  </>
);

export default App;
