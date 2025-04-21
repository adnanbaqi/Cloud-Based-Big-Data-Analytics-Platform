import { useState, useEffect } from "react";
import axios from "axios";
import { DatePicker, Card, Spin, Table, Select, Tooltip } from "antd";
import moment from "moment";
const { RangePicker } = DatePicker;
const { Option } = Select;

const InformationByDate = () => {
  const [dates, setDates] = useState([moment(), moment()]);
  const [data, setData] = useState(null);
  const [spinning, setSpinning] = useState(true);
  const [pageSize, setPageSize] = useState(4); // set default page size

  useEffect(() => {
    const fetchDateRangeData = async () => {
      const url = `http://localhost:9080/elastic-api/searchByDateRange?startDate=${dates[0]
        .startOf("day")
        .valueOf()}&endDate=${dates[1].endOf("day").valueOf()}`;

      try {
        const res = await axios.get(url);
        setData(
          res.data.hits.hits.map((hit, index) => ({
            ...hit._source,
            _id: index, // Here we use the array index as a unique id. Use only if you're sure your data order won't change.
          }))
        );
        setSpinning(false);
      } catch (error) {
        console.error("Error fetching data", error);
      }
    };

    fetchDateRangeData();
  }, [dates]); // Include dates in dependency array

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

  // Define columns for Table
  const columns = [
    {
      title: "Event Source",
      dataIndex: "eventSource",
      render: (text) => <TruncatedText text={text} />,
    },
    {
      title: "Event Type",
      dataIndex: "eventType",
      render: (text) => <TruncatedText text={text} />,
    },
    {
      title: "Urgency",
      dataIndex: "urgency",
      sorter: (a, b) => a.urgency - b.urgency, // for sorting
      sortDirections: ["descend", "ascend"], // allows both ascending and descending sort
      render: (text) => <TruncatedText text={text} />,
    },
    {
      title: "Event TS",
      dataIndex: "eventTS",
      render: (text) => (
        <TruncatedText text={new Date(text).toLocaleString()} />
      ),
    },
    {
      title: "Title",
      dataIndex: "title",
      render: (text) => <TruncatedText text={text} />,
    },
    {
      title: "RA Value",
      dataIndex: "ra",
      render: (ra) => (
        <TruncatedText text={`pm: ${ra.ra_pm}, val: ${ra.ra_val}`} />
      ),
    },
    {
      title: "DEC Value",
      dataIndex: "dec",
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
      </div>

      <Spin spinning={spinning} size="large">
        {data && (
          <>
            <Card title="Information By Date">
              <Table
                dataSource={data}
                columns={columns}
                rowKey={(row) => row._id}
                pagination={{ pageSize }}
              />
            </Card>
          </>
        )}
      </Spin>
    </div>
  );
};

export default InformationByDate;
