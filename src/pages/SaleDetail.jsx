import React, { useState, useEffect } from 'react';
import {
    Card,
    Button,
    Row,
    Col,
    Typography,
    Space,
    Tag,
    Descriptions,
    Skeleton,
    message,
    Modal,
    Divider,
    Table,
    Badge,
    Alert,
    Statistic
} from 'antd';
import {
    ArrowLeftOutlined,
    EditOutlined,
    DeleteOutlined,
    PrinterOutlined,
    CopyOutlined,
    DownloadOutlined,
    FileTextOutlined,
    DollarOutlined,
    UserOutlined,
    CalendarOutlined,
    ShoppingCartOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../adapters/axiosInstance';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const SaleDetail = () => {
    const [sale, setSale] = useState(null);
    const [loading, setLoading] = useState(true);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const navigate = useNavigate();
    const { id } = useParams();

    const paymentMethodColors = {
        cash: 'green',
        transfer: 'blue',
        qris: 'purple',
        debit_card: 'orange',
        credit_card: 'red'
    };

    const paymentMethodLabels = {
        cash: 'Cash',
        transfer: 'Bank Transfer',
        qris: 'QRIS',
        debit_card: 'Debit Card',
        credit_card: 'Credit Card'
    };

    useEffect(() => {
        fetchSale();
    }, [id]);

    const fetchSale = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(`/sales/${id}`);
            setSale(response.data.data);
        } catch (error) {
            message.error('Failed to fetch sale details');
            navigate('/sales');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            await axiosInstance.delete(`/sales/${id}`);
            message.success('Sale moved to trash');
            navigate('/sales');
        } catch (error) {
            message.error('Failed to delete sale');
        }
    };

    const handlePrint = () => {
        // Implement print functionality
        message.info('Print receipt functionality coming soon');
    };

    const handleCopyInvoice = () => {
        if (sale?.invoice_number) {
            navigator.clipboard.writeText(sale.invoice_number);
            message.success('Invoice number copied to clipboard');
        }
    };

    const productColumns = [
        {
            title: 'Product',
            key: 'product',
            render: (record) => (
                <div>
                    <div className="font-medium">{record.name}</div>
                    <div className="text-sm text-gray-500">ID: {record.id}</div>
                </div>
            ),
        },
        {
            title: 'Price',
            dataIndex: 'price',
            key: 'price',
            width: 120,
            render: (price) => `Rp ${price.toLocaleString('id-ID')}`,
        },
        {
            title: 'Quantity',
            dataIndex: 'qty',
            key: 'qty',
            width: 80,
            render: (qty) => (
                <Tag color="blue">{qty}</Tag>
            ),
        },
        {
            title: 'Subtotal',
            key: 'subtotal',
            width: 150,
            render: (_, record) => (
                <span className="font-semibold">
          Rp {(record.price * record.qty).toLocaleString('id-ID')}
        </span>
            ),
        },
    ];

    if (loading || !sale) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <Card className="shadow-lg">
                    <Skeleton active paragraph={{ rows: 10 }} />
                </Card>
            </div>
        );
    }

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
                        <Space>
                            <Title level={2} className="!mb-0">Sale Details</Title>
                            <Badge status="success" text="Completed" />
                        </Space>
                        <Text type="secondary">Invoice: {sale.invoice_number}</Text>
                    </Space>
                </div>

                <Row gutter={24}>
                    <Col xs={24} lg={16}>
                        <div className="space-y-6">
                            <Card title="Invoice Information" className="shadow-sm">
                                <Descriptions column={2} size="middle">
                                    <Descriptions.Item label="Invoice Number" span={2}>
                                        <Space>
                                            <Text strong className="font-mono">{sale.invoice_number}</Text>
                                            <Button
                                                type="text"
                                                icon={<CopyOutlined />}
                                                onClick={handleCopyInvoice}
                                                size="small"
                                            />
                                        </Space>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Customer Name">
                                        {sale.customer_name || (
                                            <Text type="secondary">Walk-in Customer</Text>
                                        )}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Payment Method">
                                        <Tag color={paymentMethodColors[sale.payment_method]}>
                                            {paymentMethodLabels[sale.payment_method] || sale.payment_method}
                                        </Tag>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Transaction Date">
                                        {dayjs(sale.created_at).format('DD MMMM YYYY HH:mm')}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Invoice Age">
                                        {dayjs().diff(dayjs(sale.created_at), 'day')} days ago
                                    </Descriptions.Item>
                                </Descriptions>
                            </Card>

                            <Card title="Products" className="shadow-sm">
                                <Table
                                    columns={productColumns}
                                    dataSource={sale.products || []}
                                    rowKey="id"
                                    pagination={false}
                                    size="middle"
                                    summary={() => (
                                        <Table.Summary>
                                            <Table.Summary.Row>
                                                <Table.Summary.Cell index={0} colSpan={3}>
                                                    <Text strong className="text-right">Total Amount:</Text>
                                                </Table.Summary.Cell>
                                                <Table.Summary.Cell index={3}>
                                                    <Title level={4} className="!m-0 text-blue-600">
                                                        Rp {sale.total_price.toLocaleString('id-ID')}
                                                    </Title>
                                                </Table.Summary.Cell>
                                            </Table.Summary.Row>
                                        </Table.Summary>
                                    )}
                                />
                            </Card>
                        </div>
                    </Col>

                    <Col xs={24} lg={8}>
                        <div className="space-y-6">
                            <Card title="Quick Stats" className="shadow-sm">
                                <div className="space-y-4">
                                    <Statistic
                                        title="Total Items"
                                        value={sale.products?.reduce((sum, p) => sum + p.qty, 0) || 0}
                                        prefix={<ShoppingCartOutlined />}
                                    />
                                    <Statistic
                                        title="Unique Products"
                                        value={sale.products?.length || 0}
                                        prefix={<FileTextOutlined />}
                                    />
                                    <Statistic
                                        title="Average Price per Item"
                                        value={sale.products?.length > 0 ?
                                            sale.total_price / sale.products.reduce((sum, p) => sum + p.qty, 0) : 0
                                        }
                                        prefix="Rp"
                                        formatter={(value) => Math.round(value).toLocaleString('id-ID')}
                                    />
                                </div>
                            </Card>

                            <Card title="Actions" className="shadow-sm">
                                <Space direction="vertical" className="w-full">
                                    <Button
                                        type="primary"
                                        icon={<EditOutlined />}
                                        size="large"
                                        onClick={() => navigate(`/sales/${id}/edit`)}
                                        className="w-full bg-blue-600 hover:bg-blue-700"
                                    >
                                        Edit Sale
                                    </Button>
                                    <Button
                                        icon={<PrinterOutlined />}
                                        size="large"
                                        onClick={handlePrint}
                                        className="w-full"
                                    >
                                        Print Receipt
                                    </Button>
                                    <Button
                                        icon={<DownloadOutlined />}
                                        size="large"
                                        className="w-full"
                                    >
                                        Download Invoice
                                    </Button>
                                    <Button
                                        danger
                                        icon={<DeleteOutlined />}
                                        size="large"
                                        onClick={() => setDeleteModalVisible(true)}
                                        className="w-full"
                                    >
                                        Delete Sale
                                    </Button>
                                </Space>
                            </Card>

                            <Card title="Transaction Summary" className="shadow-sm">
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <Text>Subtotal</Text>
                                        <Text>Rp {sale.total_price.toLocaleString('id-ID')}</Text>
                                    </div>
                                    <div className="flex justify-between">
                                        <Text>Tax (0%)</Text>
                                        <Text>Rp 0</Text>
                                    </div>
                                    <Divider className="my-2" />
                                    <div className="flex justify-between text-lg font-bold">
                                        <Text>Total</Text>
                                        <Text className="text-blue-600">
                                            Rp {sale.total_price.toLocaleString('id-ID')}
                                        </Text>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </Col>
                </Row>
            </div>

            <Modal
                title="Delete Sale"
                open={deleteModalVisible}
                onCancel={() => setDeleteModalVisible(false)}
                footer={[
                    <Button key="cancel" onClick={() => setDeleteModalVisible(false)}>
                        Cancel
                    </Button>,
                    <Button
                        key="delete"
                        type="primary"
                        danger
                        onClick={handleDelete}
                    >
                        Move to Trash
                    </Button>,
                ]}
            >
                <p>Are you sure you want to delete this sale?</p>
                <p className="text-red-500 font-semibold">
                    Invoice {sale.invoice_number} will be moved to trash.
                </p>
            </Modal>
        </div>
    );
};

export default SaleDetail;