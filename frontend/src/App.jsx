// import "./App.css";
import { Route, Routes } from "react-router-dom";
import Simulator from "./pages/Clouds";
import Nasa from "./pages/Nasa";
import Scraper from "./pages/Scraper";
import NavBar from "./components/NavBar/NavBar";
import styled from "styled-components";
import CloudDashboard from "./pages/Clouds";
import UploadPage from "./pages/Uploader";

const StyledMain = styled.main`
  margin-left: 4rem;
  padding: 1rem;
`;

const App = () => (
  <>
    <NavBar />
    <StyledMain>
      <Routes>
        <Route path="/Simulator" element={<Simulator />} exact />
        <Route path="/clouds" element={<CloudDashboard />} exact />
        <Route path="/" element={<Nasa />} />
        <Route path="/scraper" element={<Scraper />} />
        <Route path="/uploads" element={<UploadPage />} />
        <Route path="*" element={<Simulator />} />
      </Routes>
    </StyledMain>
  </>
);

export default App;
