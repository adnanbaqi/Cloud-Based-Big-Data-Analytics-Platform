import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import styled from 'styled-components';
import moment from 'moment';
import { Card } from 'antd';

const ChartContainer = styled.div`
  margin: 0 auto;
  padding: 0 20px;
`;

const NasaChart = () => {
    const [chartData, setChartData] = useState([]);
  
    const fetchDataForWeek = async (start_date, end_date) => {
      const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ start_date, end_date }),
      };
  
      const response = await fetch('http://localhost:9080/nasa-api/asteroids', requestOptions);
      const data = await response.json();
      let weekData = {};
  
      for (const [date, dataForDate] of Object.entries(data.near_earth_objects)) {
        weekData[date] = dataForDate.length;
      }
  
      return weekData;
    };
  
    useEffect(() => {
      const fetchData = async () => {
        let data = {};
  
        for (let i = 0; i < 4; i++) {
          const start_date = moment().subtract(i * 7, 'days').format('YYYY-MM-DD');
          const end_date = moment().subtract((i + 1) * 7 - 1, 'days').format('YYYY-MM-DD');
          const weekData = await fetchDataForWeek(start_date, end_date);
          data = { ...data, ...weekData };
        }
  
        const sortedData = Object.keys(data)
          .sort((a, b) => new Date(a) - new Date(b))
          .map(date => ({ date, 'Number of Events': data[date] }));
  
        localStorage.setItem('chartData', JSON.stringify(sortedData));
        localStorage.setItem('fetchTime', JSON.stringify(new Date().getTime()));
        setChartData(sortedData);
      };
  
      let storedData = localStorage.getItem('chartData');
      let fetchTime = JSON.parse(localStorage.getItem('fetchTime'));
  
      if (storedData && fetchTime && new Date().getTime() - fetchTime < 24 * 60 * 60 * 1000) {
        setChartData(JSON.parse(storedData));
      } else {
        fetchData();
      }
    }, []);  

  return (
    <Card title="Asteroids Near Earth Distribution Chart" style={{marginBottom:"2dvh"}}> 
    <LineChart
      width={window.innerWidth*0.9}
      height={400}
      data={chartData}
      margin={{
        top: 5, right: 30, left: 20, bottom: 5,
      }}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="date" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Line type="monotone" dataKey="Number of Events" stroke="#8884d8" activeDot={{ r: 8 }} />
    </LineChart>
    </Card>
  );
};

export default NasaChart;
