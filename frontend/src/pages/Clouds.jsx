import { useEffect, useState } from "react";
import { Button, Card, Statistic, Switch, Spin, Badge, Select, Tag } from "antd";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import CountUp from "react-countup";
import { CloudOutlined, WarningOutlined, LineChartOutlined, BellOutlined, ReloadOutlined } from "@ant-design/icons";
import styled from "styled-components";
import Papa from "papaparse";

const { Option } = Select;

// Styled Components
const StyledHeader = styled.header`
  text-align: center;
  padding: 1.5rem;
  font-size: 2.5rem;
  color: #001529;
  background: linear-gradient(135deg, #f0f2f5 0%, #e6f7ff 100%);
  margin-bottom: 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const Container = styled.div`
  display: grid;
  grid-template-rows: auto auto;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  padding: 1.5rem;
  background: #f8f9fa;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.08);
`;

const StatisticRow = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ContentRow = styled.div`
  display: grid;
  grid-template-columns: 7fr 5fr;
  gap: 1.5rem;
  margin-top: 2vh;
  
  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
`;

const AlertContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  height: 100%;
`;

const ChartContainer = styled.div`
  background-color: #ffffff;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  height: fit-content;
`;

const DataSourceInfo = styled.div`
  background-color: #f6ffed;
  border: 1px solid #b7eb8f;
  border-radius: 6px;
  padding: 12px;
  margin-top: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const StyledCard = styled(Card)`
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-radius: 8px;

  .ant-card-head {
    background-color: #fafafa;
  }

  .card-title {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .card-controls {
    display: flex;
    align-items: center;
    gap: 12px;
  }
`;

const StyledStatistic = styled(Statistic)`
  background: #ffffff;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s, box-shadow 0.3s;
  display: flex;
  flex-direction: column;
  height: 100%;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }

  .ant-statistic-title {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 1rem;
    font-size: 1rem;
    color: #8c8c8c;
  }

  .ant-statistic-content {
    margin-top: auto;
    color: #1890ff;
  }
`;

const AlertCard = styled(Card)`
  margin-bottom: 1rem;
  border-left: ${props => `4px solid ${props.color}`};

  .alert-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  .alert-time {
    font-size: 0.8rem;
    color: #8c8c8c;
  }

  .alert-details {
    margin-top: 8px;
    color: #595959;
  }
`;

const InformationSection = styled.div`
  margin-top: 2rem;
  padding: 1.5rem;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
`;

const LoadingOverlay = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-bottom: 1rem;
`;

// Helper function for formatting numbers
const formatter = (value) => <CountUp end={value} separator="," />;

// Define colors for pie chart
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

// Format timestamp
const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleString();
};

// Map severity to color
const getSeverityColor = (severity) => {
  const colors = {
    1: "#52c41a", // Success - low severity
    2: "#faad14", // Warning - medium
    3: "#fa8c16", // Warning - higher
    4: "#f5222d", // Error - high
    5: "#a8071a"  // Error - critical
  };
  return colors[severity] || "#1890ff";
};

// Map severity to text
const getSeverityText = (severity) => {
  const texts = {
    1: "Low",
    2: "Medium",
    3: "High",
    4: "Critical",
    5: "Extreme"
  };
  return texts[severity] || "Unknown";
};

const CloudDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalEvents: 0, dangerousEvents: 0, last24HoursEvents: 0, last7DaysEvents: 0 });
  const [observatoryData, setObservatoryData] = useState([]);
  const [pieChartData, setPieChartData] = useState([]);
  const [alertEvents, setAlertEvents] = useState([]);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [dataSource, setDataSource] = useState("elastic");
  const [timeRange, setTimeRange] = useState("7d");

  // Mock function to fetch data from CSV
  const fetchDataFromCSV = async () => {
    try {
      setLoading(true);
      // In a real application, you'd fetch the CSV from a URL
      // Here we'll use a constant string to simulate the CSV data
      const csvData = `timestamp,event_type,severity,observatory,coordinates,details
2025-04-01T12:30:45Z,solar_flare,3,Solar Dynamics Observatory,"N23W45","Class X2.1 flare"
2025-04-02T08:15:22Z,gamma_ray_burst,4,Fermi Space Telescope,"RA 12h 30m 45s Dec +23° 45' 12\"","Duration: 145s"
2025-04-03T19:42:10Z,asteroid_approach,2,Pan-STARRS,"RA 8h 12m 31s Dec -15° 08' 22\"","2.4 lunar distances"
2025-04-05T02:37:55Z,cosmic_ray,1,Pierre Auger Observatory,"S35W64","Ultra-high energy: 3.2×10^19 eV"
2025-04-06T14:22:18Z,solar_flare,2,SOHO,"S12W22","Class M5.7 flare"
2025-04-07T03:51:40Z,gamma_ray_burst,5,Swift Telescope,"RA 18h 42m 03s Dec +38° 12' 09\"","Duration: 235s"
2025-04-08T22:05:33Z,asteroid_approach,3,ATLAS,"RA 21h 15m 47s Dec -02° 36' 15\"","1.2 lunar distances"
2025-04-10T10:17:29Z,cosmic_ray,2,IceCube Neutrino Observatory,"N12E18","Energy: 8.7×10^18 eV"
2025-04-11T16:48:52Z,solar_flare,4,DKIST,"N32W15","Class X5.8 flare"
2025-04-12T05:23:19Z,neutron_star_merger,5,LIGO/Virgo,"RA 05h 22m 40s Dec +19° 31' 21\"","Gravitational wave detection"`;

      const parsedData = Papa.parse(csvData, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true
      });

      // Calculate statistics
      const calculatedStats = {
        totalEvents: parsedData.data.length,
        dangerousEvents: parsedData.data.filter(event => event.severity >= 4).length,
        last24HoursEvents: 3, // Mock value
        last7DaysEvents: parsedData.data.length
      };

      // Group data by observatory for the bar chart
      const observatoryStats = {};
      parsedData.data.forEach(event => {
        if (!observatoryStats[event.observatory]) {
          observatoryStats[event.observatory] = {
            totalEvents: 0,
            dangerousEvents: 0
          };
        }
        observatoryStats[event.observatory].totalEvents += 1;
        if (event.severity >= 4) {
          observatoryStats[event.observatory].dangerousEvents += 1;
        }
      });

      // Convert to array format for recharts
      const observatoryChartData = Object.keys(observatoryStats).map(observatory => ({
        ObservatoryName: observatory,
        NumberOfEvents: observatoryStats[observatory].totalEvents,
        NumberOfDangerousEvents: observatoryStats[observatory].dangerousEvents
      }));

      // Group by event type for pie chart
      const eventTypeCount = {};
      parsedData.data.forEach(event => {
        if (!eventTypeCount[event.event_type]) {
          eventTypeCount[event.event_type] = 0;
        }
        eventTypeCount[event.event_type] += 1;
      });

      const pieData = Object.keys(eventTypeCount).map(type => ({
        name: type.replace('_', ' ').toUpperCase(),
        value: eventTypeCount[type]
      }));

      // Get latest high severity events for alerts
      const alerts = parsedData.data
        .filter(event => event.severity >= 3)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 3);

      setStats(calculatedStats);
      setObservatoryData(observatoryChartData);
      setPieChartData(pieData);
      setAlertEvents(alerts);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data from CSV:", error);
      setLoading(false);
    }
  };

  // Mock function to fetch data from Elastic Cloud
  const fetchFromElastic = async () => {
    setLoading(true);
    // Simulate API delay
    setTimeout(() => {
      fetchDataFromCSV();
    }, 800);
  };

  // Mock function to fetch data from GCP
  const fetchFromGCP = async () => {
    setLoading(true);
    // Simulate API delay with slightly different data
    setTimeout(() => {
      fetchDataFromCSV().then(() => {
        // Add some variation to stats for GCP source
        setStats(prev => ({
          ...prev,
          totalEvents: Math.floor(prev.totalEvents * 1.1),
          last24HoursEvents: Math.floor(prev.last24HoursEvents * 1.2)
        }));
      });
    }, 800);
  };

  const refreshData = () => {
    if (dataSource === "elastic") {
      fetchFromElastic();
    } else {
      fetchFromGCP();
    }
  };

  // Initial data fetch
  useEffect(() => {
    refreshData();

    // Set up auto-refresh
    let intervalId;
    if (autoRefresh) {
      intervalId = setInterval(() => {
        refreshData();
      }, 30000); // Refresh every 30 seconds
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [dataSource, autoRefresh, timeRange]);

  const handleSourceChange = (value) => {
    setDataSource(value);
  };

  const handleTimeRangeChange = (value) => {
    setTimeRange(value);
  };

  const toggleAutoRefresh = (checked) => {
    setAutoRefresh(checked);
  };

  // Component for alerts
  const AlertComponent = () => (
    <StyledCard 
      title={
        <div className="card-title">
          <BellOutlined style={{ color: "#fa8c16" }} /> 
          Recent Alerts
        </div>
      }
    >
      {loading ? (
        <LoadingOverlay>
          <Spin />
        </LoadingOverlay>
      ) : alertEvents.length > 0 ? (
        alertEvents.map((event, index) => (
          <AlertCard 
            key={index} 
            size="small" 
            color={getSeverityColor(event.severity)}
          >
            <div className="alert-header">
              <Tag color={getSeverityColor(event.severity)}>
                {getSeverityText(event.severity)}
              </Tag>
              <span className="alert-time">{formatTime(event.timestamp)}</span>
            </div>
            <strong>{event.event_type.replace('_', ' ').toUpperCase()}</strong> detected by {event.observatory}
            <div className="alert-details">
              <div>Location: {event.coordinates}</div>
              <div>Details: {event.details}</div>
            </div>
          </AlertCard>
        ))
      ) : (
        <p>No alerts to display</p>
      )}
    </StyledCard>
  );

  // Component for pie chart
  const PieChartComponent = () => (
    <StyledCard 
      title={
        <div className="card-title">
          <LineChartOutlined style={{ color: "#1890ff" }} /> 
          Event Type Distribution
        </div>
      }
      extra={
        <div className="card-controls">
          <Button 
            icon={<ReloadOutlined />} 
            size="small" 
            onClick={refreshData}
            loading={loading}
          />
        </div>
      }
    >
      {loading ? (
        <LoadingOverlay>
          <Spin />
        </LoadingOverlay>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieChartData}
              cx="50%"
              cy="50%"
              labelLine={true}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {pieChartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [value, 'Events']} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}
    </StyledCard>
  );

  return (
    <div>
      <StyledHeader>
        Cloud Based CSV Dashboard
      </StyledHeader>

      <Container>
        <ButtonGroup>
          <Select 
            defaultValue="elastic" 
            style={{ width: 150 }} 
            onChange={handleSourceChange}
            disabled={loading}
          >
            <Option value="elastic">Elastic Cloud</Option>
            <Option value="gcp">Google Cloud</Option>
          </Select>
          
          <Select 
            defaultValue="7d" 
            style={{ width: 120 }} 
            onChange={handleTimeRangeChange}
            disabled={loading}
          >
            <Option value="24h">Last 24 Hours</Option>
            <Option value="7d">Last 7 Days</Option>
            <Option value="30d">Last 30 Days</Option>
          </Select>
          
          <Button 
            type="primary" 
            icon={<ReloadOutlined />} 
            onClick={refreshData}
            loading={loading}
          >
            Refresh
          </Button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Auto Refresh</span>
            <Switch 
              defaultChecked 
              onChange={toggleAutoRefresh} 
              disabled={loading}
            />
          </div>
        </ButtonGroup>

        <StatisticRow>
          <StyledStatistic
            title={<><CloudOutlined /> Total Events</>}
            value={stats.totalEvents}
            formatter={formatter}
          />
          <StyledStatistic
            title={<><WarningOutlined style={{ color: "#f5222d" }} /> Dangerous Events</>}
            value={stats.dangerousEvents}
            formatter={formatter}
          />
          <StyledStatistic
            title={<>Last 24 Hours</>}
            value={stats.last24HoursEvents}
            formatter={formatter}
          />
          <StyledStatistic
            title={<>Last 7 Days</>}
            value={stats.last7DaysEvents}
            formatter={formatter}
          />
        </StatisticRow>

        <ContentRow>
          <ChartContainer>
            <StyledCard 
              title={
                <div className="card-title">
                  <LineChartOutlined style={{ color: "#1890ff" }} /> 
                  Events Per Observatory
                </div>
              }
            >
              {loading ? (
                <LoadingOverlay>
                  <Spin />
                </LoadingOverlay>
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart
                    data={observatoryData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 100,
                    }}
                  >
                    <XAxis 
                      dataKey="ObservatoryName" 
                      angle={-45} 
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="NumberOfEvents" name="Total Events" fill="#1890ff" />
                    <Bar dataKey="NumberOfDangerousEvents" name="Dangerous Events" fill="#f5222d" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </StyledCard>
          </ChartContainer>

          <AlertContainer>
            <AlertComponent />
            <PieChartComponent />
          </AlertContainer>
        </ContentRow>

        <DataSourceInfo>
          <div>
            <strong>Data Source:</strong> {dataSource === "elastic" ? "Elastic Cloud" : "Google Cloud Platform"} | 
            <strong> Time Range:</strong> {timeRange === "24h" ? "Last 24 Hours" : timeRange === "7d" ? "Last 7 Days" : "Last 30 Days"}
          </div>
          <div>
            <Tag color="green">CSV Source: cosmic_events_data.csv</Tag>
          </div>
        </DataSourceInfo>

        <InformationSection>
          <h2>About Cosmic Events Monitoring</h2>
          <p>
            This dashboard displays real-time data from various observatories monitoring cosmic events around the globe. 
            The data is collected and processed through cloud platforms (Elastic Cloud and Google Cloud Platform) 
            and visualized here for analysis.
          </p>
          <p>
            <strong>Event Types:</strong>
            <ul>
              <li><strong>Solar Flares:</strong> Sudden flashes of increased brightness on the Sun.</li>
              <li><strong>Gamma Ray Bursts:</strong> Extremely energetic explosions in distant galaxies.</li>
              <li><strong>Asteroid Approaches:</strong> Near-Earth objects passing within a certain distance.</li>
              <li><strong>Cosmic Rays:</strong> High-energy radiation from outside the Solar System.</li>
              <li><strong>Neutron Star Mergers:</strong> Cataclysmic events detected via gravitational waves.</li>
            </ul>
          </p>
          <p>
            <strong>Severity Levels:</strong>
            <ul>
              <li><Tag color="#52c41a">Low (1)</Tag>: Normal cosmic activity, no threat.</li>
              <li><Tag color="#faad14">Medium (2)</Tag>: Notable event, routine monitoring.</li>
              <li><Tag color="#fa8c16">High (3)</Tag>: Significant event, increased monitoring.</li>
              <li><Tag color="#f5222d">Critical (4)</Tag>: Major event, potential research impact.</li>
              <li><Tag color="#a8071a">Extreme (5)</Tag>: Rare and powerful event, global significance.</li>
            </ul>
          </p>
        </InformationSection>
      </Container>
    </div>
  );
};

export default CloudDashboard;