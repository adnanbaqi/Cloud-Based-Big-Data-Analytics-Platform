import React, { useEffect, useState } from "react";
import { DatePicker, message, Spin, Card } from "antd";
import moment from "moment";
import AsteroidTable from "./AsteroidTable";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, RadialBarChart, RadialBar, Cell } from 'recharts';
import styled from "styled-components";


const { RangePicker } = DatePicker;
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

const FlexContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 16px;
`;

const DateSearch = () => {
  const [dates, setDates] = useState([moment(), moment()]);
  const [dataToDisplay, setDataToDisplay] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [sizeData, setSizeData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const searchKey = "SEARCH_" + dates[0].toISOString().split("T")[0] + dates[1].toISOString().split("T")[0];

  const prepareChartData = (data) => {
    let chartData = {};

    data.forEach((item) => {
      const date = item.close_approach_data[0].close_approach_date;
      if (chartData[date]) {
        item.is_potentially_hazardous_asteroid ? chartData[date].hazardous += 1 : chartData[date].safe += 1;
      } else {
        chartData[date] = item.is_potentially_hazardous_asteroid ? { hazardous: 1, safe: 0 } : { hazardous: 0, safe: 1 };
      }
    });

    return Object.keys(chartData).map((key) => ({
      name: key,
      ...chartData[key]
    }));
  };

  const prepareSizeData = (data) => {
    let sizeData = {
      small: 0,
      medium: 0,
      large: 0,
      enormous: 0
    };

    data.forEach((item) => {
      const diameter = item.estimated_diameter.meters.estimated_diameter_max;
      if (diameter < 100) {
        sizeData.small++;
      } else if (diameter < 500) {
        sizeData.medium++;
      } else if (diameter < 1000) {
        sizeData.large++;
      } else {
        sizeData.enormous++;
      }
    });

    return Object.keys(sizeData).map((key) => ({
      name: key,
      value: sizeData[key]
    }));
  };

  useEffect(() => {
    const fetchDate = async () => {
      setLoading(true);

      let storedData = localStorage.getItem(searchKey);
      if (storedData) {
        let parsedData = JSON.parse(storedData);
        setDataToDisplay(parsedData);
        setChartData(prepareChartData(parsedData));
        setSizeData(prepareSizeData(parsedData));
        setLoading(false);
        return;
      }

      const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          start_date: dates[0].toISOString().split("T")[0],
          end_date: dates[1].toISOString().split("T")[0],
        }),
      };

      const response = await fetch(
        "http://localhost:9080/nasa-api/asteroids",
        requestOptions
      );
      const data = await response.json();

      let merged_data = [];
      for (const dataForDate of Object.values(data.near_earth_objects)) {
        merged_data.push(...dataForDate);
      }

      merged_data = merged_data.sort(
        (a, b) =>
          new Date(a.close_approach_data[0].close_approach_date) -
          new Date(b.close_approach_data[0].close_approach_date)
      );

      setDataToDisplay(merged_data);
      setChartData(prepareChartData(merged_data));
      setSizeData(prepareSizeData(merged_data));

      const searchKeys = Object.keys(localStorage).filter(key => key.startsWith("SEARCH_"));
      while (searchKeys.length > 10) {
        localStorage.removeItem(searchKeys.shift());
      }

      localStorage.setItem(searchKey, JSON.stringify(merged_data));

      setLoading(false);
    };

    if (
      dates.length === 2 &&
      Math.abs(dates[0] - dates[1]) <= 7 * 24 * 60 * 60 * 1000
    ) {
      setError(null);
      fetchDate();
    } else {
      setError("The selected date range should not exceed 7 days.");
    }
  }, [dates]);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Spin tip="Loading..." size="large" />
      </div>
    );
  }

  return (
    <div style={{ cursor: "pointer" }}>
      <FlexContainer>
        <>
          <RangePicker
            format="YYYY-MM-DD"
            onChange={(dates, dateStrings) => {
              if (dates) {
                const diffInDays = moment(dates[1]).diff(
                  moment(dates[0]),
                  "days"
                );
                if (diffInDays <= 7) {
                  setDates(dates);
                  setError(null);
                } else {
                  message.error(
                    "The selected date range should not exceed 7 days."
                  );
                  setError("The selected date range should not exceed 7 days.");
                }
              } else {
                setDates([]);
              }
            }}
          />
          {error && <div style={{ color: "red" }}>{error}</div>}
        </>
      </FlexContainer>
      <div>
        <AsteroidTable asteroids={dataToDisplay} />
        <div style={{ display: 'flex', justifyContent: 'space-evenly' }}>
          <Card title="Safe and hazardous events">
            <BarChart
              width={window.innerWidth / 2 * 0.8}
              height={400}
              data={chartData}
              barSize={30}
              margin={{
                top: 5, right: 30, left: 20, bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="safe" stackId="a" fill="#4AAB79" />
              <Bar dataKey="hazardous" stackId="a" fill="#C91B13" />
            </BarChart>
          </Card>
          <Card title="Distribution by sizes">
            <RadialBarChart
              width={window.innerWidth / 2 * 0.8}
              height={400}
              cx="50%"
              cy="50%"
              innerRadius="30%"
              outerRadius="100%"
              barSize={20}
              data={sizeData}
              startAngle={0}
              endAngle={340}
            >
              <RadialBar
                minAngle={15}
                label={{ position: "", fill: '#fff' }}
                background
                clockWise
                dataKey='value'
              >
                {
                  // This will assign each bar a different color from the COLORS array.
                  sizeData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)
                }
              </RadialBar>
              <Legend
                iconSize={10}
                width={120}
                height={140}
                layout='vertical'
                verticalAlign='middle'
                wrapperStyle={{ top: 0, right: 0, left: 30, bottom: 0 }}
              />
            </RadialBarChart>
          </Card>

        </div>
      </div>
    </div>
  );
};

export default DateSearch;
