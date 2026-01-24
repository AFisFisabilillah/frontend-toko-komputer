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
    ShoppingCartOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../adapters/axiosInstance';
import * as XLSX from 'xlsx';

const { Title, Text } = Typography;
const { Step } = Steps;

const ImportSale = () => {
    const [file, setFile] = useState(null);
    const [previewData, setPreviewData] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [validationErrors, setValidationErrors] = useState([]);
    const [previewModalVisible, setPreviewModalVisible] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const navigate = useNavigate();

    const requiredFields = ['customer_name', 'payment_method'];
    const paymentMethods = ['cash', 'transfer', 'qris'];

    const validateData = (data) => {
        const errors = [];

        data.forEach((row, index) => {
            // Check required fields
            requiredFields.forEach(field => {
                if (field === 'customer_name') {
                    // customer_name is optional, skip validation
                    return;
                }

                if (!row[field] || row[field].toString().trim() === '') {
                    errors.push({
                        row: index + 2,
                        field,
                        message: `${field} is required`
                    });
                }
            });

            // Validate payment method
            if (row.payment_method && !paymentMethods.includes(row.payment_method.toLowerCase())) {
                errors.push({
                    row: index + 2,
                    field: 'payment_method',
                    message: `Payment method must be one of: ${paymentMethods.join(', ')}`
                });
            }

            // Validate products JSON
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

                const formattedData = jsonData.map((row, index) => {
                    let products = [];
                    return {
                        key: index,
                        customer_name: row.customer_name || row.customer || row['Customer Name'] || '',
                        payment_method: (row.payment_method || row.payment || row['Payment Method'] || 'cash').toLowerCase(),
                        products: products,
                        total_price: row.total_price,
                        ...row
                    };
                });

                const errors = validateData(formattedData);
                setValidationErrors(errors);
                setPreviewData(formattedData);

                if (errors.length === 0) {
                    message.success(`Found ${formattedData.length} valid sale records`);
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

            const response = await axiosInstance.post('/sales/import', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            message.success(response.data.message || 'Sales imported successfully!');
            setCurrentStep(2);
        } catch (error) {
            message.error(error.response?.data?.message || 'Failed to import sales');
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

    const paymentMethodLabels = {
        cash: 'Cash',
        transfer: 'Transfer',
        qris: 'qris',
    };

    const columns = [
        {
            title: 'Customer',
            key: 'customer_name',
            width: 150,
            render: (record) => (
                <div>
                    <div className="font-medium truncate">{record.customer_name || 'Walk-in'}</div>
                </div>
            ),
        },
        {
            title: 'Payment',
            dataIndex: 'payment_method',
            key: 'payment_method',
            width: 100,
            render: (method) => (
                <Tag color="blue">{paymentMethodLabels[method] || method}</Tag>
            ),
        },
        {
            title: 'Total',
            dataIndex: 'total_price',
            key: 'total_price',
            width: 120,
            render: (price) => (
                <span>Rp {price?.toLocaleString('id-ID')}</span>
            ),
        },
        {
            title: 'Preview',
            key: 'preview',
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
                            onClick={() => navigate('/sales')}
                            className="p-0"
                        >
                            Back to Sales
                        </Button>
                        <Title level={2} className="!mb-0">Import Sales</Title>
                        <Text type="secondary">Import sales transactions from Excel or CSV file</Text>
                    </Space>
                </div>

                <Card className="shadow-lg">
                    <div className="mb-8">
                        <Steps current={currentStep}>
                            <Step title="Upload File" description="Select Excel/CSV file" />
                            <Step title="Preview & Validate" description="Review sales data" />
                            <Step title="Import Complete" description="Sales imported" />
                        </Steps>
                    </div>

                    {currentStep === 0 && (
                        <div className="text-center py-12">
                            <FileExcelOutlined className="text-6xl text-green-500 mb-6" />
                            <Title level={4} className="mb-4">Upload Sales File</Title>
                            <Text type="secondary" className="mb-8 block">
                                Upload Excel (.xlsx, .xls) or CSV file containing sales data
                            </Text>

                            <Upload {...uploadProps}>
                                <Button
                                    type="primary"
                                    size="large"
                                    icon={<UploadOutlined />}
                                    className="bg-green-600 hover:bg-green-700"
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
                                                <li>products (JSON array of products)</li>
                                                <li>payment_method (cash, transfer, qris, debit_card, credit_card)</li>
                                            </ul>
                                            <p className="mt-2">Optional columns:</p>
                                            <ul className="list-disc pl-4 space-y-1">
                                                <li>customer_name</li>
                                            </ul>
                                            <p className="mt-2">Products JSON format:</p>
                                            <pre className="bg-gray-100 p-2 rounded text-xs mt-2">
                        [{"{"}"product_id": 1, "qty": 2{"}"}]
                      </pre>
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
                                <Title level={4} className="mb-2">Sales Preview</Title>
                                <Text type="secondary">
                                    Review the sales data before importing. Total records: {previewData.length}
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
                                    title="Total Sales"
                                    value={previewData.length}
                                    prefix={<FileExcelOutlined />}
                                />
                                <Statistic
                                    title="Valid Sales"
                                    value={previewData.length - validationErrors.length}
                                    prefix={<CheckCircleOutlined />}
                                    valueStyle={{ color: '#3f8600' }}
                                />
                                <Statistic
                                    title="Total Revenue"
                                    value={previewData.reduce((sum, row) => sum + (row.total_price || 0), 0)}
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
                                            <Button onClick={() => navigate('/sales')}>
                                                Cancel
                                            </Button>
                                            <Button
                                                type="primary"
                                                onClick={handleImport}
                                                loading={uploading}
                                                icon={<CloudUploadOutlined />}
                                                disabled={validationErrors.length > 0}
                                                className="bg-green-600 hover:bg-green-700"
                                            >
                                                {uploading ? 'Importing...' : 'Import Sales'}
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
                                {previewData.length} sales have been imported successfully
                            </Text>

                            <Space>
                                <Button onClick={handleReset}>
                                    Import More
                                </Button>
                                <Button
                                    type="primary"
                                    onClick={() => navigate('/sales')}
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    View Sales
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
                title="Sale Details Preview"
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
                                <span className="font-medium">{selectedRow.customer_name || 'Walk-in Customer'}</span>
                            </Descriptions.Item>
                            <Descriptions.Item label="Payment Method">
                                <Tag color="blue">{paymentMethodLabels[selectedRow.payment_method] || selectedRow.payment_method}</Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Total Price">
                <span className="font-semibold">
                  Rp {selectedRow.total_price.toLocaleString('id-ID')}
                </span>
                            </Descriptions.Item>
                        </Descriptions>

                        {selectedRow.products && selectedRow.products.length > 0 && (
                            <>
                                <Divider />
                                <Title level={5}>Products</Title>
                                <Table
                                    columns={[
                                        { title: 'Product ID', dataIndex: 'product_id', key: 'product_id' },
                                        { title: 'Quantity', dataIndex: 'qty', key: 'qty', width: 60 },
                                        {
                                            title: 'Price',
                                            key: 'price',
                                            render: (_, product) => `Rp ${(product.price || 0).toLocaleString('id-ID')}`
                                        }
                                    ]}
                                    dataSource={selectedRow.products}
                                    rowKey="product_id"
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

export default ImportSale;