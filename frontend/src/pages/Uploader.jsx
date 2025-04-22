import { useState, useCallback } from "react";
import { Upload, Button, Table, Alert, Card, Spin, message } from "antd";
import { InboxOutlined, ClearOutlined } from "@ant-design/icons";
import Papa from "papaparse";
import styled from "styled-components";

const { Dragger } = Upload;

const UploadContainer = styled.div`
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
`;

const StyledCard = styled(Card)`
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  margin-top: 2rem;

  .ant-card-head {
    background-color: #fafafa;
  }
`;

const PreviewSection = styled.div`
  margin-top: 2rem;
`;

const UploadPage = () => {
  const [parsedData, setParsedData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileParse = (file) => {
    setLoading(true);
    setError(null);
    
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          setError('Error parsing CSV file. Please check the format.');
          message.error('CSV parsing error');
          return;
        }
        
        if (results.data.length === 0) {
          setError('CSV file is empty or improperly formatted');
          message.error('Empty CSV file');
          return;
        }

        // Generate table columns from headers
        const firstRow = results.data[0];
        const generatedColumns = Object.keys(firstRow).map(key => ({
          title: key.toUpperCase().replace(/_/g, ' '),
          dataIndex: key,
          key: key,
        }));

        setColumns(generatedColumns);
        setParsedData(results.data);
        message.success('CSV file uploaded successfully');
        setLoading(false);
      },
      error: (error) => {
        setError(error.message);
        message.error('File read error');
        setLoading(false);
      }
    });
  };

  const beforeUpload = (file) => {
    const isCSV = file.type === 'text/csv' || file.name.endsWith('.csv');
    if (!isCSV) {
      message.error('You can only upload CSV files!');
    }
    
    if (isCSV) {
      handleFileParse(file);
    }
    
    return false; // Prevent automatic upload
  };

  const clearData = useCallback(() => {
    setParsedData([]);
    setColumns([]);
    setError(null);
    message.info('Uploaded data cleared');
  }, []);

  return (
    <UploadContainer>
      <StyledCard
        title="CSV Data Upload"
        extra={
          parsedData.length > 0 && (
            <Button 
              icon={<ClearOutlined />}
              onClick={clearData}
              danger
            >
              Clear Data
            </Button>
          )
        }
      >
        <Dragger
          name="file"
          multiple={false}
          accept=".csv"
          beforeUpload={beforeUpload}
          showUploadList={false}
          disabled={loading}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
          </p>
          <p className="ant-upload-text">
            Click or drag CSV file to this area to upload
          </p>
          <p className="ant-upload-hint">
            Support for single file upload. Maximum file size: 10MB
          </p>
        </Dragger>

        {error && (
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            style={{ marginTop: '1rem' }}
          />
        )}

        {loading && (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <Spin tip="Parsing CSV..." size="large" />
          </div>
        )}

        {parsedData.length > 0 && (
          <PreviewSection>
            <h3>Preview Data ({parsedData.length} rows)</h3>
            <Table
              columns={columns}
              dataSource={parsedData}
              scroll={{ x: true }}
              pagination={{ pageSize: 5 }}
              rowKey={(record, index) => index}
              bordered
              size="small"
            />
          </PreviewSection>
        )}
      </StyledCard>

      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <h4>CSV Format Requirements</h4>
        <p>
          Ensure your CSV file follows these guidelines:
          <ul>
            <li>First row should contain headers</li>
            <li>Use UTF-8 encoding</li>
            <li>Use commas as delimiters</li>
            <li>Date formats: YYYY-MM-DD or ISO 8601</li>
          </ul>
        </p>
      </div>
    </UploadContainer>
  );
};

export default UploadPage;