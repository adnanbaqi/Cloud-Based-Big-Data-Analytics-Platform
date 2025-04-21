import { useEffect, useState } from "react";
import { Card, Dropdown, Space } from "antd";
import { DownOutlined } from "@ant-design/icons";
import styled from "styled-components";
import PieChartDetailed from "./PieChartDetailed";

const StyledCard = styled(Card)`
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
`;

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 50dvw;
  height: 35dvw;
`;

const DropdownContainer = styled.div`
  display: flex;
  align-items: center;
`;

const DropdownWrapper = styled.span`
  border: solid 2px #1677ff;
  border-radius: 0.5rem;
  padding: 1rem;
`;

const PieChartComponent = (props) => {
  const getDataFromServer = async (fieldName) => {
    const response = await fetch(
      "http://localhost:9080/elastic-api/groupByField?" +
        new URLSearchParams({
          fieldName,
        })
    );
    const data = await response.json();
    setData(data);
  };

  const items = [
    {
      label: <p>Group By star title</p>,
      key: "title",
      onClick: () => {
        setFieldName("title");
      },
    },
    {
      label: <p>Group By Urgency</p>,
      key: "urgency",
      onClick: () => {
        setFieldName("urgency");
      },
    },
  ];

  const [fieldName, setFieldName] = useState("urgency");
  const [data, setData] = useState(null);

  useEffect(() => {
    // perform the fetch operation when the component mounts
    getDataFromServer(fieldName).catch((error) => {
      console.error(
        "There has been a problem with your fetch operation:",
        error
      );
    });
  }, [fieldName]);

  return (
    <StyledCard title="Exploer Pattern Of Data">
      <DropdownContainer>
        <DropdownWrapper>
          <Dropdown
            menu={{
              items,
            }}
          >
            <a onClick={(e) => e.preventDefault()}>
              <Space>
                Hover me
                <DownOutlined />
              </Space>
            </a>
          </Dropdown>
        </DropdownWrapper>
      </DropdownContainer>
      <Wrapper>
        <PieChartDetailed data={data} />
      </Wrapper>
    </StyledCard>
  );
};

export default PieChartComponent;
