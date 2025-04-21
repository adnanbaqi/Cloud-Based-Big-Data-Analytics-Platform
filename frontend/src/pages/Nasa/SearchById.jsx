import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table, Input, Button, Row, Spin } from "antd";
import styled from "styled-components";

const { Search } = Input;

const InfoContainer = styled.div`
  background-color: #f4f4f4;
  padding: 20px;
  border-radius: 15px;
`;

const AsteroidName = styled.h1`
  color: #0077b6;
  border-bottom: 2px solid #023e8a;
  padding-bottom: 10px;
`;

const InfoWrapper = styled.div`
  /* display: flex;
  justify-content: space-between; */
  font-size: 1.2em;
`;

const InfoTitle = styled.p`
  color: #000;
  font-weight: bold;
`;

const InfoDetail = styled.span`
  font-weight: normal;
`;

const HazardousDetail = styled(InfoDetail)`
  color: ${(props) => (props.isHazardous ? "#d00000" : "#52b788")};
`;

const LinkDetail = styled.a`
  color: #023e8a;
  text-decoration: none;
  font-weight: normal;
`;
const SearchById = () => {
  const [asteroidId, setAsteroidId] = useState(2385423);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false); // added loading state

  useEffect(() => {
    if (!asteroidId) return;

    const fetchData = async () => {
      setLoading(true); // start loading
      try {
        const response = await axios.get(
          `http://localhost:9080/nasa-api/asteroids/${asteroidId}`
        );
        setData(response.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false); // end loading
      }
    };

    fetchData();
  }, [asteroidId]);

  const handleSearchClick = () => {
    const value = document.getElementById("asteroidId").value;
    setAsteroidId(value);
  };

  const columns = [
    {
      title: "Close Approach Date",
      dataIndex: "close_approach_date",
      key: "close_approach_date",
    },
    {
      title: "Orbiting Body",
      dataIndex: "orbiting_body",
      key: "orbiting_body",
    },
    {
      title: "Relative Velocity (km/h)",
      dataIndex: "relative_velocity",
      key: "relative_velocity",
      render: (text) => text.kilometers_per_hour,
    },
    {
      title: "Miss Distance (km)",
      dataIndex: "miss_distance",
      key: "miss_distance",
      render: (text) => text.kilometers,
    },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Row>
          <div style={{ display: "flex" }}>
            <div>
              <Input id="asteroidId" placeholder="Enter asteroid id" />
            </div>
            <div>
              <Button onClick={handleSearchClick}>Search</Button>
            </div>
          </div>
        </Row>
      </div>

      <Spin spinning={loading}>
        <InfoContainer>
          <AsteroidName>{data?.name}</AsteroidName>
          <InfoWrapper>
            <InfoTitle>
              ID: <InfoDetail>{data?.id}</InfoDetail>
            </InfoTitle>
            <InfoTitle>
              Potentially Hazardous:
              <HazardousDetail
                isHazardous={data?.is_potentially_hazardous_asteroid}
              >
                {data?.is_potentially_hazardous_asteroid ? "Yes" : "No"}
              </HazardousDetail>
            </InfoTitle>
          </InfoWrapper>
          <InfoTitle>
            NASA JPL URL:
            <LinkDetail href={data?.nasa_jpl_url}>
              {data?.nasa_jpl_url}
            </LinkDetail>
          </InfoTitle>
        </InfoContainer>
        <Table
          columns={columns}
          dataSource={data?.close_approach_data}
          rowKey={(record) => record?.epoch_date_close_approach}
        />
      </Spin>
    </div>
  );
};

export default SearchById;
