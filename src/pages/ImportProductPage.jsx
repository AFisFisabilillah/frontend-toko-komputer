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
    Modal
} from 'antd';
import {
    UploadOutlined,
    ArrowLeftOutlined,
    CheckCircleOutlined,
    FileExcelOutlined,
    EyeOutlined,
    CloudUploadOutlined,
    WarningOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../adapters/axiosInstance';
import * as XLSX from 'xlsx';

const { Title, Text } = Typography;
const { Step } = Steps;

const ImportProduct = () => {
    const [file, setFile] = useState(null);
    const [previewData, setPreviewData] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [validationErrors, setValidationErrors] = useState([]);
    const [previewModalVisible, setPreviewModalVisible] = useState(false);
    const navigate = useNavigate();

    const requiredFields = ['sku', 'name', 'brand', 'price', 'stok'];

    const validateData = (data) => {
        const errors = [];

        data.forEach((row, index) => {
            // Check required fields
            requiredFields.forEach(field => {
                if (!row[field] || row[field].toString().trim() === '') {
                    errors.push({
                        row: index + 2, // +2 because Excel rows start at 1 and header is row 1
                        field,
                        message: `${field} is required`
                    });
                }
            });

            // Validate data types
            if (row.price && isNaN(parseFloat(row.price))) {
                errors.push({
                    row: index + 2,
                    field: 'price',
                    message: 'Price must be a number'
                });
            }

            if (row.stok && isNaN(parseInt(row.stok))) {
                errors.push({
                    row: index + 2,
                    field: 'stok',
                    message: 'Stock must be a number'
                });
            }

            if (row.sku && row.sku.length > 50) {
                errors.push({
                    row: index + 2,
                    field: 'sku',
                    message: 'SKU cannot exceed 50 characters'
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

                // Validate and format data
                const formattedData = jsonData.map((row, index) => ({
                    key: index,
                    sku: row.sku || row.SKU || '',
                    name: row.name || row.Name || row.product_name || '',
                    brand: row.brand || row.Brand || '',
                    price: parseFloat(row.price || row.Price || 0),
                    stok: parseInt(row.stok || row.Stok || row.stock || row.Stock || 0),
                    description: row.description || row.Description || '',
                    ...row
                }));

                const errors = validateData(formattedData);
                setValidationErrors(errors);
                setPreviewData(formattedData);

                if (errors.length === 0) {
                    message.success(`Found ${formattedData.length} valid records`);
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
        return false; // Prevent automatic upload
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

            const response = await axiosInstance.post('/products/import', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            message.success(response.data.message || 'Products imported successfully!');
            setCurrentStep(2);
        } catch (error) {
            message.error(error.response?.data?.message || 'Failed to import products');
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

    const columns = [
        {
            title: 'SKU',
            dataIndex: 'sku',
            key: 'sku',
            width: 120,
            render: (sku) => (
                <span className="font-mono font-medium">{sku}</span>
            ),
        },
        {
            title: 'Product Name',
            dataIndex: 'name',
            key: 'name',
            render: (name) => (
                <span className="font-medium">{name}</span>
            ),
        },
        {
            title: 'Brand',
            dataIndex: 'brand',
            key: 'brand',
            width: 100,
        },
        {
            title: 'Price',
            dataIndex: 'price',
            key: 'price',
            width: 100,
            render: (price) => (
                <span>Rp {price.toLocaleString('id-ID')}</span>
            ),
        },
        {
            title: 'Stock',
            dataIndex: 'stok',
            key: 'stok',
            width: 80,
            render: (stok) => (
                <Tag color={stok > 0 ? 'green' : 'red'}>{stok}</Tag>
            ),
        },
        {
            title: 'Status',
            key: 'status',
            width: 100,
            render: (_, record, index) => {
                const errors = validationErrors.filter(err => err.row === index + 2);
                if (errors.length > 0) {
                    return <Tag color="error">Error</Tag>;
                }
                return <Tag color="success">Valid</Tag>;
            },
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
            width: 100,
            render: (field) => (
                <Tag color="orange">{field}</Tag>
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
                            onClick={() => navigate('/products')}
                            className="p-0"
                        >
                            Back to Products
                        </Button>
                        <Title level={2} className="!mb-0">Import Products</Title>
                        <Text type="secondary">Import products from Excel or CSV file</Text>
                    </Space>
                </div>

                <Card className="shadow-lg">
                    <div className="mb-8">
                        <Steps current={currentStep}>
                            <Step title="Upload File" description="Select Excel/CSV file" />
                            <Step title="Preview & Validate" description="Review data before import" />
                            <Step title="Import Complete" description="Products imported" />
                        </Steps>
                    </div>

                    {currentStep === 0 && (
                        <div className="text-center py-12">
                            <FileExcelOutlined className="text-6xl text-blue-500 mb-6" />
                            <Title level={4} className="mb-4">Upload Product File</Title>
                            <Text type="secondary" className="mb-8 block">
                                Upload Excel (.xlsx, .xls) or CSV file containing product data
                            </Text>

                            <Upload {...uploadProps}>
                                <Button
                                    type="primary"
                                    size="large"
                                    icon={<UploadOutlined />}
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    Click to Upload
                                </Button>
                            </Upload>

                            <div className="mt-8 text-left max-w-md mx-auto">
                                <Alert
                                    message="File Requirements"
                                    description={
                                        <ul className="list-disc pl-4 space-y-1">
                                            <li>Maximum file size: 5MB</li>
                                            <li>Supported formats: .xlsx, .xls, .csv</li>
                                            <li>Required columns: sku, name, brand, price, stok</li>
                                            <li>Optional column: description</li>
                                        </ul>
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
                                <Title level={4} className="mb-2">File Preview</Title>
                                <Text type="secondary">
                                    Review the data before importing. Total records: {previewData.length}
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
                                    title="Total Records"
                                    value={previewData.length}
                                    prefix={<FileExcelOutlined />}
                                />
                                <Statistic
                                    title="Valid Records"
                                    value={previewData.length - validationErrors.length}
                                    prefix={<CheckCircleOutlined />}
                                    valueStyle={{ color: '#3f8600' }}
                                />
                                <Statistic
                                    title="Error Records"
                                    value={validationErrors.length}
                                    valueStyle={{ color: validationErrors.length > 0 ? '#cf1322' : '#3f8600' }}
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
                                            scroll={{ x: 800 }}
                                            className="shadow-sm"
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
                                            <Button onClick={() => navigate('/products')}>
                                                Cancel
                                            </Button>
                                            <Button
                                                type="primary"
                                                onClick={handleImport}
                                                loading={uploading}
                                                icon={<CloudUploadOutlined />}
                                                disabled={validationErrors.length > 0}
                                                className="bg-blue-600 hover:bg-blue-700"
                                            >
                                                {uploading ? 'Importing...' : 'Import Products'}
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
                                {previewData.length} products have been imported successfully
                            </Text>

                            <Space>
                                <Button onClick={handleReset}>
                                    Import More
                                </Button>
                                <Button
                                    type="primary"
                                    onClick={() => navigate('/products')}
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    View Products
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
        </div>
    );
};

export default ImportProduct;