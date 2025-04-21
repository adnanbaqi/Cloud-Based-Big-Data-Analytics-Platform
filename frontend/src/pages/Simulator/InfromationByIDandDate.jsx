import { useState, useEffect } from "react";
import axios from "axios";
import { DatePicker, Spin, Button, Input, Space, Card, Tooltip, Table } from "antd"; // import Spin from antd
import moment from "moment";
const { RangePicker } = DatePicker;

const InfromationByIDandDate = () => {
  const [dates, setDates] = useState([moment(), moment()]);
  const [ID, setID] = useState("");
  const [data, setData] = useState(null);
  const [spinning, setSpinning] = useState(true);

  const handleSubmit = async () => {
    // Replace this with your actual server endpoint and date range parameters
    const url = `http://localhost:9080/elastic-api/searchByIdAndDate?id=${ID}&startDate=${dates[0].startOf(
      "day"
    )}&endDate=${dates[1].endOf("day")}`;

    try {
      const res = await axios.get(url);
      setData(res.data.hits.hits);
      setSpinning(false);
    } catch (error) {
      console.error("Error fetching data", error);
    }
  };

  // also send a request for today's data on mount and observatoryName change
  useEffect(() => {
    const fetchDateRangeData = async () => {
      // Replace this with your actual server endpoint and date range parameters
      const url = `http://localhost:9080/elastic-api/searchByIdAndDate?id=A7Vn&startDate=${dates[0].startOf(
        "day"
      )}&endDate=${dates[1].endOf("day")}`;

      try {
        const res = await axios.get(url);
        setData(res.data.hits.hits);
        setSpinning(false);
      } catch (error) {
        console.error("Error fetching data", error);
      }
    };

    fetchDateRangeData();
  }, [ID, dates]); // Empty dependency array to run only once on mount

  const TruncatedText = ({ text }) => {
    const [isTruncated, setIsTruncated] = useState(true);
    const displayText =
      isTruncated && typeof text === "string" ? text.slice(0, 9) : text;

    const handleCopy = async (txt) => {
      try {
        await navigator.clipboard.writeText(txt);
        console.log("Copied to clipboard!");
      } catch (err) {
        console.log("Failed to copy text: ", err);
      }
    };

    return (
      <Tooltip title={text}>
        <span
          onClick={() => {
            setIsTruncated(!isTruncated);
            handleCopy(text);
          }}
        >
          {displayText}
        </span>
      </Tooltip>
    );
  };

  const columns = [
    {
      title: "Title",
      dataIndex: ["_source", "title"],
      key: "title",
      render: (text) => <TruncatedText text={text} />,
    },
    {
      title: "Event Type",
      dataIndex: ["_source", "eventType"],
      key: "eventType",
      render: (text) => <TruncatedText text={text} />,
    },
    {
      title: "Event Source",
      dataIndex: ["_source", "eventSource"],
      key: "eventSource",
      render: (text) => <TruncatedText text={text} />,
    },
    {
      title: "Urgency",
      dataIndex: ["_source", "urgency"],
      key: "urgency",
      render: (text) => <TruncatedText text={text} />,
    },
    {
      title: "Event Time",
      dataIndex: ["_source", "eventTS"],
      key: "eventTS",
      render: (text) => (
        <TruncatedText text={new Date(text).toLocaleString()} />
      ),
    },
    {
      title: "RA",
      dataIndex: ["_source", "ra"],
      key: "ra",
      render: (ra) => (
        <TruncatedText text={`pm: ${ra.ra_pm}, val: ${ra.ra_val}`} />
      ),
    },
    {
      title: "DEC",
      dataIndex: ["_source", "dec"],
      key: "dec",
      render: (dec) => (
        <TruncatedText text={`pm: ${dec.dec_pm}, val: ${dec.dec_val}`} />
      ),
    },
  ];

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignContent: "center",
        }}
      >
        <RangePicker
          format="YYYY-MM-DD"
          onChange={(dates, dateStrings) => {
            if (dates) {
              setDates(dates);
            } else {
              setDates([]);
            }
          }}
        />
        <Space.Compact style={{ width: "30%" }}>
          <Input
            defaultValue=""
            placeholder="ID Name"
            value={ID}
            onChange={(e) => {
              console.log(e.target.value);
              setID(e.target.value);
            }}
          />
          <Button
            onClick={() => handleSubmit()}
            style={{ backgroundColor: "#1677ff", color: "white" }}
          >
            Submit
          </Button>
        </Space.Compact>
      </div>
      {data && (
        <Spin spinning={spinning}>
          <Card
            title="Information By ID and Date"
            style={{ marginTop: "10px" }}
          >
            <Table
              dataSource={data}
              columns={columns}
              rowKey="_id"
              pagination={{ pageSize: 4 }}
            />
          </Card>
        </Spin>
      )}
    </div>
  );
};

export default InfromationByIDandDate;
