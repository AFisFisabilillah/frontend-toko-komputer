import React, { useState } from 'react';
import {
    Card,
    Button,
    Upload,
    message,
    Table,
    Tag,
    Row,
    Col,
    Typography,
    Space,
    Steps,
    Alert,
    Statistic,
    Divider,
    Modal,
    Descriptions
} from 'antd';
import {
    UploadOutlined,
    ArrowLeftOutlined,
    CheckCircleOutlined,
    FileExcelOutlined,
    EyeOutlined,
    CloudUploadOutlined,
    WarningOutlined,
    UserOutlined,
    LaptopOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../adapters/axiosInstance';
import * as XLSX from 'xlsx';
import ServiceTemplate from "../components/ServiceTemplate.jsx";

const { Title, Text } = Typography;
const { Step } = Steps;

const ImportService = () => {
    const [file, setFile] = useState(null);
    const [previewData, setPreviewData] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [validationErrors, setValidationErrors] = useState([]);
    const [previewModalVisible, setPreviewModalVisible] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const navigate = useNavigate();

    const requiredFields = [
        'customer_name',
        'customer_phone',
        'laptop_brand',
        'laptop_model',
        'complaint',
        'service_cost'
    ];

    const statusOptions = ['received', 'process', 'done', 'taken', 'cancelled'];

    const validateData = (data) => {
        const errors = [];

        data.forEach((row, index) => {
            // Check required fields
            requiredFields.forEach(field => {
                if (!row[field] || row[field].toString().trim() === '') {
                    errors.push({
                        row: index + 2,
                        field,
                        message: `${field.replace('_', ' ')} is required`
                    });
                }
            });

            // Validate data types
            if (row.service_cost && isNaN(parseFloat(row.service_cost))) {
                errors.push({
                    row: index + 2,
                    field: 'service_cost',
                    message: 'Service cost must be a number'
                });
            }

            if (row.customer_phone && !/^[0-9+]+$/.test(row.customer_phone.toString())) {
                errors.push({
                    row: index + 2,
                    field: 'customer_phone',
                    message: 'Phone number can only contain numbers and +'
                });
            }

            if (row.status && !statusOptions.includes(row.status.toLowerCase())) {
                errors.push({
                    row: index + 2,
                    field: 'status',
                    message: `Status must be one of: ${statusOptions.join(', ')}`
                });
            }


        });

        return errors;
    };

    const handleFileUpload = (file) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

                // Format data
                const formattedData = jsonData.map((row, index) => {
                    // Try to parse products JSON
                    let products = [];
                    if (row.products) {
                        try {
                            products = JSON.parse(row.products);
                        } catch (e) {
                            // Keep as empty array if invalid
                        }
                    }

                    return {
                        key: index,
                        customer_name: row.customer_name || row.customer || row['Customer Name'] || '',
                        customer_phone: row.customer_phone || row.phone || row['Phone Number'] || '',
                        laptop_brand: row.laptop_brand || row.brand || row['Laptop Brand'] || '',
                        laptop_model: row.laptop_model || row.model || row['Laptop Model'] || '',
                        complaint: row.complaint || row['Complaint'] || '',
                        service_cost: parseFloat(row.service_cost || row.cost || row['Service Cost'] || 0),
                        status: (row.status || row.Status || 'received').toLowerCase(),
                        products: products,
                        ...row
                    };
                });

                const errors = validateData(formattedData);
                setValidationErrors(errors);
                setPreviewData(formattedData);

                if (errors.length === 0) {
                    message.success(`Found ${formattedData.length} valid service records`);
                    setCurrentStep(1);
                } else {
                    message.warning(`Found ${errors.length} validation errors`);
                    setCurrentStep(1);
                }
            } catch (error) {
                message.error('Error reading file. Please check the format.');
                console.error(error);
            }
        };

        reader.onerror = () => {
            message.error('Error reading file');
        };

        reader.readAsArrayBuffer(file);
        return false;
    };

    const handleImport = async () => {
        if (!file) {
            message.error('Please select a file first');
            return;
        }

        if (validationErrors.length > 0) {
            message.error('Please fix validation errors before importing');
            return;
        }

        try {
            setUploading(true);

            const formData = new FormData();
            formData.append('file', file);

            const response = await axiosInstance.post('/services/import', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            message.success(response.data.message || 'Services imported successfully!');
            setCurrentStep(2);
        } catch (error) {
            console.log(error.response.data);
            message.error(error.response?.data?.message || 'Failed to import services');
        } finally {
            setUploading(false);
        }
    };

    const handleReset = () => {
        setFile(null);
        setPreviewData([]);
        setValidationErrors([]);
        setCurrentStep(0);
    };

    const uploadProps = {
        beforeUpload: (file) => {
            const allowedTypes = [
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'text/csv',
                'application/csv'
            ];

            const isExcelCsv = allowedTypes.includes(file.type);
            const isExtensionValid = ['.xls', '.xlsx', '.csv'].some(ext =>
                file.name.toLowerCase().endsWith(ext)
            );

            if (!isExcelCsv && !isExtensionValid) {
                message.error('You can only upload Excel or CSV files!');
                return false;
            }

            if (file.size / 1024 / 1024 > 5) {
                message.error('File must be smaller than 5MB!');
                return false;
            }

            setFile(file);
            handleFileUpload(file);
            return false;
        },
        showUploadList: false,
    };

    const statusColors = {
        received: 'blue',
        process: 'orange',
        done: 'green',
        taken: 'purple',
        cancelled: 'red'
    };

    const statusLabels = {
        received: 'Received',
        process: 'In Process',
        done: 'Completed',
        taken: 'Taken',
        cancelled: 'Cancelled'
    };

    const columns = [
        {
            title: 'Service code',
            key: 'service_code',
            width: 150,
            render: (record) => (
                <div>
                    <div className="font-medium truncate">{record.service_code}</div>
                </div>
            ),
        },
        {
            title: 'Customer',
            key: 'customer',
            width: 150,
            render: (record) => (
                <div>
                    <div className="font-medium truncate">{record.customer_name}</div>
                    <div className="text-xs text-gray-500">{record.customer_phone}</div>
                </div>
            ),
        },
        {
            title: 'Laptop',
            key: 'laptop',
            width: 150,
            render: (record) => (
                <div>
                    <div className="truncate">{record.laptop_brand}</div>
                    <div className="text-xs text-gray-500">{record.laptop_model}</div>
                </div>
            ),
        },
        {
            title: 'Complaint',
            dataIndex: 'complaint',
            key: 'complaint',
            width: 200,
            render: (text) => (
                <div className="truncate max-w-xs" title={text}>
                    {text}
                </div>
            ),
        },
        {
            title: 'Cost',
            dataIndex: 'service_cost',
            key: 'service_cost',
            width: 100,
            render: (cost) => (
                <span>Rp {cost.toLocaleString('id-ID')}</span>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: 100,
            render: (status) => (
                <Tag color={statusColors[status] || 'default'}>
                    {statusLabels[status] || status}
                </Tag>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 80,
            render: (_, record) => (
                <Button
                    type="link"
                    size="small"
                    onClick={() => setSelectedRow(record)}
                    icon={<EyeOutlined />}
                >
                    View
                </Button>
            ),
        },
    ];

    const errorColumns = [
        {
            title: 'Row',
            dataIndex: 'row',
            key: 'row',
            width: 80,
        },
        {
            title: 'Field',
            dataIndex: 'field',
            key: 'field',
            width: 120,
            render: (field) => (
                <Tag color="orange">{field.replace('_', ' ')}</Tag>
            ),
        },
        {
            title: 'Error Message',
            dataIndex: 'message',
            key: 'message',
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto">
                <div className="mb-6">
                    <Space direction="vertical" size="small">
                        <Button
                            type="text"
                            icon={<ArrowLeftOutlined />}
                            onClick={() => navigate('/services')}
                            className="p-0"
                        >
                            Back to Services
                        </Button>
                        <Title level={2} className="!mb-0">Import Services</Title>
                        <Text type="secondary">Import service requests from Excel or CSV file</Text>
                    </Space>
                </div>

                <Card className="shadow-lg">
                    <div className="mb-8">
                        <Steps current={currentStep}>
                            <Step title="Upload File" description="Select Excel/CSV file" />
                            <Step title="Preview & Validate" description="Review service data" />
                            <Step title="Import Complete" description="Services imported" />
                        </Steps>
                    </div>

                    {currentStep === 0 && (
                        <div className="text-center py-12">
                            <FileExcelOutlined className="text-6xl text-purple-500 mb-6" />
                            <Title level={4} className="mb-4">Upload Service File</Title>
                            <Text type="secondary" className="mb-8 block">
                                Upload Excel (.xlsx, .xls) or CSV file containing service data
                            </Text>

                            <Upload {...uploadProps}>
                                <Button
                                    type="primary"
                                    size="large"
                                    icon={<UploadOutlined />}
                                    className="bg-purple-600 hover:bg-purple-700"
                                >
                                    Click to Upload
                                </Button>
                            </Upload>

                            <div className="mt-8 text-left max-w-md mx-auto">
                                <Alert
                                    message="File Requirements"
                                    description={
                                        <div>
                                            <p className="mb-2">Required columns:</p>
                                            <ul className="list-disc pl-4 space-y-1">
                                                <li>customer_name</li>
                                                <li>customer_phone</li>
                                                <li>laptop_brand</li>
                                                <li>laptop_model</li>
                                                <li>complaint</li>
                                                <li>service_cost</li>
                                            </ul>
                                            <p className="mt-2">Optional columns:</p>
                                            <ul className="list-disc pl-4 space-y-1">
                                                <li>service_code (Will generate otomatis0</li>
                                                <li>status (received, process, done, taken, cancelled)</li>
                                            </ul>
                                            <ServiceTemplate/>
                                        </div>
                                    }
                                    type="info"
                                    showIcon
                                />
                            </div>
                        </div>
                    )}

                    {currentStep === 1 && (
                        <div className="space-y-6">
                            <div>
                                <Title level={4} className="mb-2">Service Preview</Title>
                                <Text type="secondary">
                                    Review the service data before importing. Total records: {previewData.length}
                                </Text>
                            </div>

                            {validationErrors.length > 0 && (
                                <Alert
                                    message={`Found ${validationErrors.length} validation errors`}
                                    description="Please fix the errors below before importing"
                                    type="warning"
                                    showIcon
                                    icon={<WarningOutlined />}
                                    action={
                                        <Button
                                            size="small"
                                            danger
                                            onClick={() => setPreviewModalVisible(true)}
                                            icon={<EyeOutlined />}
                                        >
                                            View All Errors
                                        </Button>
                                    }
                                />
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <Statistic
                                    title="Total Services"
                                    value={previewData.length}
                                    prefix={<FileExcelOutlined />}
                                />
                                <Statistic
                                    title="Valid Services"
                                    value={previewData.length - validationErrors.length}
                                    prefix={<CheckCircleOutlined />}
                                    valueStyle={{ color: '#3f8600' }}
                                />
                                <Statistic
                                    title="Total Service Cost"
                                    value={previewData.reduce((sum, row) => sum + (row.service_cost || 0), 0)}
                                    prefix="Rp"
                                    valueStyle={{ color: '#1890ff' }}
                                    formatter={(value) => value.toLocaleString('id-ID')}
                                />
                            </div>

                            {previewData.length > 0 && (
                                <>
                                    <div className="mb-4">
                                        <Table
                                            columns={columns}
                                            dataSource={previewData.slice(0, 10)}
                                            pagination={false}
                                            size="small"
                                            scroll={{ x: 1000 }}
                                            className="shadow-sm"
                                            onRow={(record) => ({
                                                onClick: () => setSelectedRow(record),
                                                className: 'cursor-pointer hover:bg-gray-50'
                                            })}
                                        />
                                        {previewData.length > 10 && (
                                            <div className="text-center mt-4">
                                                <Text type="secondary">
                                                    Showing first 10 of {previewData.length} records
                                                </Text>
                                            </div>
                                        )}
                                    </div>

                                    <Divider />

                                    <div className="flex justify-between">
                                        <Button onClick={handleReset}>Upload Different File</Button>
                                        <Space>
                                            <Button onClick={() => navigate('/services')}>
                                                Cancel
                                            </Button>
                                            <Button
                                                type="primary"
                                                onClick={handleImport}
                                                loading={uploading}
                                                icon={<CloudUploadOutlined />}
                                                disabled={validationErrors.length > 0}
                                                className="bg-purple-600 hover:bg-purple-700"
                                            >
                                                {uploading ? 'Importing...' : 'Import Services'}
                                            </Button>
                                        </Space>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div className="text-center py-12">
                            <CheckCircleOutlined className="text-6xl text-green-500 mb-6" />
                            <Title level={3} className="mb-4 text-green-600">
                                Import Successful!
                            </Title>
                            <Text type="secondary" className="mb-8 block">
                                {previewData.length} service requests have been imported successfully
                            </Text>

                            <Space>
                                <Button onClick={handleReset}>
                                    Import More
                                </Button>
                                <Button
                                    type="primary"
                                    onClick={() => navigate('/services')}
                                    className="bg-purple-600 hover:bg-purple-700"
                                >
                                    View Services
                                </Button>
                            </Space>
                        </div>
                    )}
                </Card>
            </div>

            {/* Error Details Modal */}
            <Modal
                title="Validation Errors"
                open={previewModalVisible}
                onCancel={() => setPreviewModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setPreviewModalVisible(false)}>
                        Close
                    </Button>
                ]}
                width={800}
            >
                <Alert
                    message="Please fix these errors in your Excel/CSV file and re-upload"
                    type="error"
                    showIcon
                    className="mb-4"
                />

                <Table
                    columns={errorColumns}
                    dataSource={validationErrors}
                    rowKey={(record) => `${record.row}-${record.field}`}
                    pagination={{ pageSize: 10 }}
                    size="small"
                    scroll={{ y: 300 }}
                />
            </Modal>

            {/* Row Details Modal */}
            <Modal
                title="Service Details"
                open={!!selectedRow}
                onCancel={() => setSelectedRow(null)}
                footer={[
                    <Button key="close" onClick={() => setSelectedRow(null)}>
                        Close
                    </Button>
                ]}
                width={600}
            >
                {selectedRow && (
                    <div className="space-y-4">
                        <Descriptions column={1} size="small">
                            <Descriptions.Item label="Customer Name">
                                <span className="font-medium">{selectedRow.customer_name}</span>
                            </Descriptions.Item>
                            <Descriptions.Item label="Phone Number">
                                {selectedRow.customer_phone}
                            </Descriptions.Item>
                            <Descriptions.Item label="Laptop">
                                <div>
                                    <div>Brand: {selectedRow.laptop_brand}</div>
                                    <div>Model: {selectedRow.laptop_model}</div>
                                </div>
                            </Descriptions.Item>
                            <Descriptions.Item label="Complaint">
                                <div className="p-2 bg-gray-50 rounded">
                                    {selectedRow.complaint}
                                </div>
                            </Descriptions.Item>
                            <Descriptions.Item label="Service Cost">
                <span className="font-semibold">
                  Rp {selectedRow.service_cost.toLocaleString('id-ID')}
                </span>
                            </Descriptions.Item>
                            <Descriptions.Item label="Status">
                                <Tag color={statusColors[selectedRow.status]}>
                                    {statusLabels[selectedRow.status] || selectedRow.status}
                                </Tag>
                            </Descriptions.Item>
                        </Descriptions>

                        {selectedRow.products && selectedRow.products.length > 0 && (
                            <>
                                <Divider />
                                <Title level={5}>Products</Title>
                                <Table
                                    columns={[
                                        { title: 'Product', dataIndex: 'name', key: 'name' },
                                        { title: 'Qty', dataIndex: 'qty', key: 'qty', width: 60 },
                                        {
                                            title: 'Price',
                                            key: 'price',
                                            render: (_, product) => `Rp ${(product.price || 0).toLocaleString('id-ID')}`
                                        }
                                    ]}
                                    dataSource={selectedRow.products}
                                    rowKey="id"
                                    pagination={false}
                                    size="small"
                                />
                            </>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default ImportService;