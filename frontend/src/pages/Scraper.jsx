import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Card, Button, Spin, Empty, Image } from "antd";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const LineChartWrapper = styled(Card)`
  display: grid; // Change flex to grid
  grid-template-rows: auto 1fr; // Define grid areas
  gap: 1rem; // Space between grid rows

  .ant-card-head {
    grid-row: 1; // Title in the first row
  }

  .ant-card-body {
    grid-row: 2; // Content in the second row
    display: flex;
    align-items: center;
    justify-content: center;
  }
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
`;

const CenteredCard = styled(Card)`
  display: grid; // Change flex to grid
  grid-template-rows: auto 1fr; // Define grid areas
  gap: 0.2rem; // Space between grid rows

  .ant-card-head {
    grid-row: 1; // Title in the first row
  }

  .ant-card-body {
    grid-row: 2; // Content in the second row
    display: flex;
    align-items: center;
    justify-content: center;
  }
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
`;

const GridWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
`;

const StyledImage = styled(Image)`
  max-width: 25vw;
  max-height: 30vh;
  border-radius: 50%;
`;

const TwoImageCard = styled(Card)`
  display: flex;
  flex-direction: column;
  /* align-items: center; */
  justify-content: center;

  .ant-card-body {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
  }

  .switch-button {
    position: absolute;
    right: 10px;
    top: 10px;
  }

  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
`;

const StyledHeader = styled.header`
  text-align: center;
  padding: 1rem;
  font-size: 2.5rem;
  color: #001529;
  background: #f0f2f5;
  margin-bottom: 1rem;
`;

const TopAlignedCard = styled(Card)`
  display: grid; // Change flex to grid
  grid-template-rows: auto 1fr; // Define grid areas
  gap: 0.2rem; // Space between grid rows

  .ant-card-head {
    grid-row: 1; // Title in the first row
  }

  .ant-card-body {
    grid-row: 2; // Content in the second row
    display: flex;
    align-items: center;
    justify-content: center;
  }
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
`;

const CenteredCardImage = styled(Image)`
  max-width: 30vw;
  min-height: 30vh;
  border-radius: 3rem;
`;

const Scraper = () => {
  const [graphData, setGraphData] = useState([]);
  const [activeImage, setActiveImage] = useState("sunspot-regions.jpg");
  const [loading, setLoading] = useState(true);
  const [oldImages, setOldImages] = useState([{}]);
  const [images, setImages] = useState({
    "spaceweathersun.jpg": {
      src: "",
      loading: true,
      error: false,
      fallback: false,
    },
    "solarflares.jpg": {
      src: "",
      loading: true,
      error: false,
      fallback: false,
    },
    "sunspot-regions.jpg": {
      src: "",
      loading: true,
      error: false,
      fallback: false,
    },
    "theskylivesun.jpg": {
      src: "",
      loading: true,
      error: false,
      fallback: false,
    },
    "coronal-mass.jpg": {
      src: "",
      loading: true,
      error: false,
      fallback: false,
    },
    "far-side.jpg": { src: "", loading: true, error: false, fallback: false },
  });

  useEffect(() => {
    fetch("http://localhost:5001/api/scraper/all-images-and-aria-labels")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch images");
        }
        return res.json();
      })
      .then((data) => {
        setImages((prevState) => ({
          ...prevState,
          "spaceweathersun.jpg": {
            src: data.result.images["spaceweathersun.jpg"],
            loading: false,
            error: false,
            fallback: false,
          },
          "solarflares.jpg": {
            src: data.result.images["solarflares.jpg"],
            loading: false,
            error: false,
            fallback: false,
          },
          "sunspot-regions.jpg": {
            src: data.result.images["sunspot-regions.jpg"],
            loading: false,
            error: false,
            fallback: false,
          },
          "theskylivesun.jpg": {
            src: data.result.images["theskylivesun.jpg"],
            loading: false,
            error: false,
            fallback: false,
          },
          "coronal-mass.jpg": {
            src: data.result.images["coronal-mass.jpg"],
            loading: false,
            error: false,
            fallback: false,
          },
          "far-side.jpg": {
            src: data.result.images["far-side.jpg"],
            loading: false,
            error: false,
            fallback: false,
          },
        }));
        setGraphData(data.result.graphData);
        setOldImages(data.oldResult.images);
        setLoading(false);
      })
      .catch((error) => {
        console.error(
          "There has been a problem with your fetch operation:",
          error
        );
        setImages((prevState) => ({
          ...prevState,
          "spaceweathersun.jpg": {
            src: "",
            loading: false,
            error: true,
            fallback: false,
          },
          "solarflares.jpg": {
            src: "",
            loading: false,
            error: true,
            fallback: false,
          },
          "sunspot-regions.jpg": {
            src: "",
            loading: false,
            error: true,
            fallback: false,
          },
          "theskylivesun.jpg": {
            src: "",
            loading: false,
            error: true,
            fallback: false,
          },
          "coronal-mass.jpg": {
            src: "",
            loading: false,
            error: true,
            fallback: false,
          },
          "far-side.jpg": {
            src: "",
            loading: false,
            error: true,
            fallback: false,
          },
        }));
      });
  }, []);

  const switchImage = () => {
    setActiveImage(
      activeImage === "sunspot-regions.jpg"
        ? "theskylivesun.jpg"
        : "sunspot-regions.jpg"
    );
  };

  return (
    <>
      <StyledHeader>Space Weather Dashboard</StyledHeader>
      <GridWrapper>
        <CenteredCard title="Space Weather Sun">
          {images["spaceweathersun.jpg"].loading ? (
            <Spin spinning={images["spaceweathersun.jpg"].loading} />
          ) : images["spaceweathersun.jpg"].error &&
            oldImages["spaceweathersun.jpg"] ? (
            <StyledImage
              alt="spaceweathersun"
              src={`data:image/jpeg;base64,${oldImages["spaceweathersun.jpg"]}`}
            />
          ) : !images["spaceweathersun.jpg"].error ? (
            <StyledImage
              alt="spaceweathersun"
              src={`data:image/jpeg;base64,${images["spaceweathersun.jpg"].src}`}
            />
          ) : (
            <Empty description="Could not load image." />
          )}
        </CenteredCard>

        <CenteredCard title="Solar Flares">
          {images["solarflares.jpg"].loading ? (
            <Spin spinning={images["solarflares.jpg"].loading} />
          ) : images["solarflares.jpg"].error &&
            oldImages["solarflares.jpg"] ? (
            <StyledImage
              alt="solarflares"
              src={`data:image/jpeg;base64,${oldImages["solarflares.jpg"]}`}
            />
          ) : !images["solarflares.jpg"].error ? (
            <StyledImage
              alt="solarflares"
              src={`data:image/jpeg;base64,${images["solarflares.jpg"].src}`}
              fallback={""} // Provide an empty string as fallback
              onError={() =>
                setImages((prevState) => ({
                  ...prevState,
                  "solarflares.jpg": {
                    ...prevState["solarflares.jpg"],
                    error: true,
                  },
                }))
              }
            />
          ) : (
            <Empty description="Could not load image." />
          )}
        </CenteredCard>

        <TwoImageCard
          title={
            activeImage === "sunspot-regions.jpg"
              ? "Sunspot Regions"
              : "The Sky Live Sun"
          }
        >
          <Button className="switch-button" onClick={switchImage}>
            Switch Image
          </Button>
          {images[activeImage].loading ? (
            <Spin spinning={images[activeImage].loading} />
          ) : images[activeImage].error && oldImages[activeImage] ? (
            <StyledImage
              alt="sunspot/skylive"
              src={`data:image/jpeg;base64,${oldImages[activeImage]}`}
            />
          ) : !images[activeImage].error ? (
            <StyledImage
              alt="sunspot/skylive"
              src={`data:image/jpeg;base64,${images[activeImage].src}`}
            />
          ) : (
            <Empty description="Could not load image." />
          )}
        </TwoImageCard>

        <CenteredCard title="Coronal Mass">
          {images["coronal-mass.jpg"].loading ? (
            <Spin spinning={images["coronal-mass.jpg"].loading} />
          ) : images["coronal-mass.jpg"].error &&
            oldImages["coronal-mass.jpg"] ? (
            <StyledImage
              alt="coronal-mass"
              src={`data:image/jpeg;base64,${oldImages["coronal-mass.jpg"]}`}
            />
          ) : !images["coronal-mass.jpg"].error ? (
            <StyledImage
              alt="coronal-mass"
              src={`data:image/jpeg;base64,${images["coronal-mass.jpg"].src}`}
            />
          ) : (
            <Empty description="Could not load image." />
          )}
        </CenteredCard>

        <LineChartWrapper title="Solar Xray graph">
          <Spin spinning={loading}>
            <LineChart
              width={600}
              height={320}
              data={graphData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" padding={{ right: 30 }} />
              <YAxis dataKey="MeV" domain={[0.0000012, 0.000009]} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="MeV"
                stroke="#ec7967"
                strokeWidth={2}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </Spin>
        </LineChartWrapper>

        <TopAlignedCard title="Far Side">
          {images["far-side.jpg"].loading ? (
            <Spin spinning={images["far-side.jpg"].loading} />
          ) : images["far-side.jpg"].error && oldImages["far-side.jpg"] ? (
            <CenteredCardImage
              alt="far-side"
              src={`data:image/jpeg;base64,${oldImages["far-side.jpg"]}`}
            />
          ) : !images["far-side.jpg"].error ? (
            <CenteredCardImage
              alt="far-side"
              src={`data:image/jpeg;base64,${images["far-side.jpg"].src}`}
            />
          ) : (
            <Empty description="Could not load image." />
          )}
        </TopAlignedCard>
      </GridWrapper>
    </>
  );
};

export default Scraper;
