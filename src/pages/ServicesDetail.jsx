import React, { useState, useEffect } from 'react';
import {
    Card,
    Button,
    Row,
    Col,
    Typography,
    Space,
    Tag,
    Image,
    Descriptions,
    Skeleton,
    message,
    Modal,
    Divider,
    Table,
    Badge,
    Timeline
} from 'antd';
import {
    ArrowLeftOutlined,
    EditOutlined,
    DeleteOutlined,
    PrinterOutlined,
    PhoneOutlined,
    LaptopOutlined,
    DollarOutlined,
    HistoryOutlined,
    CustomerServiceOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../adapters/axiosInstance';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const ServiceDetail = () => {
    const [service, setService] = useState(null);
    const [loading, setLoading] = useState(true);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const navigate = useNavigate();
    const { id } = useParams();

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

    useEffect(() => {
        fetchService();
    }, [id]);

    const fetchService = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(`/services/${id}`);
            setService(response.data.data);
        } catch (error) {
            message.error('Failed to fetch service details');
            navigate('/services');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            await axiosInstance.delete(`/services/${id}`);
            message.success('Service moved to trash');
            navigate('/services');
        } catch (error) {
            message.error('Failed to delete service');
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const productColumns = [
        {
            title: 'Product',
            key: 'product',
            render: (record) => (
                <div className="flex items-center">
                    {record.images && record.images[0] ? (
                        <img
                            src={record.images[0]}
                            alt={record.name}
                            className="w-10 h-10 object-cover rounded mr-3"
                        />
                    ) : (
                        <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center mr-3">
                            <span className="text-xs text-gray-400">No Image</span>
                        </div>
                    )}
                    <div>
                        <div className="font-medium">{record.name}</div>
                        <div className="text-xs text-gray-500">SKU: {record.sku}</div>
                    </div>
                </div>
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
            width: 120,
            render: (price) => `Rp ${price.toLocaleString('id-ID')}`,
        },
        {
            title: 'Qty',
            dataIndex: 'qty',
            key: 'qty',
            width: 80,
            render: (_, record) => (
                <Tag>{record.qty || 1}</Tag>
            ),
        },
        {
            title: 'Subtotal',
            key: 'subtotal',
            width: 150,
            render: (_, record) => (
                <span className="font-semibold">
          Rp {((record.price || 0) * (record.qty || 1)).toLocaleString('id-ID')}
        </span>
            ),
        },
    ];

    const timelineItems = [
        {
            color: 'green',
            children: (
                <div>
                    <p className="font-medium">Service Created</p>
                    <p className="text-gray-500 text-sm">
                        {service && dayjs(service.created_at).format('DD MMM YYYY HH:mm')}
                    </p>
                </div>
            ),
        },
        {
            color: service?.status === 'received' ? 'blue' : 'gray',
            children: (
                <div>
                    <p className="font-medium">Received</p>
                    <p className="text-gray-500 text-sm">
                        {service?.status === 'received' ? 'Current status' : 'Pending'}
                    </p>
                </div>
            ),
        },
        {
            color: service?.status === 'process' ? 'orange' : 'gray',
            children: (
                <div>
                    <p className="font-medium">In Process</p>
                    <p className="text-gray-500 text-sm">
                        {service?.status === 'process' ? 'Currently processing' : 'Pending'}
                    </p>
                </div>
            ),
        },
        {
            color: service?.status === 'done' ? 'green' : 'gray',
            children: (
                <div>
                    <p className="font-medium">Completed</p>
                    <p className="text-gray-500 text-sm">
                        {service?.status === 'done' ? 'Ready for pickup' : 'Pending'}
                    </p>
                </div>
            ),
        },
        {
            color: service?.status === 'taken' ? 'purple' : 'gray',
            children: (
                <div>
                    <p className="font-medium">Taken</p>
                    <p className="text-gray-500 text-sm">
                        {service?.status === 'taken' ? 'Customer has taken' : 'Pending'}
                    </p>
                </div>
            ),
        },
    ];

    if (loading || !service) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <Card className="shadow-lg">
                    <Skeleton active paragraph={{ rows: 10 }} />
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6 print:p-0">
            <div className="max-w-7xl mx-auto">
                <div className="mb-6 print:hidden">
                    <Space direction="vertical" size="small">
                        <Button
                            type="text"
                            icon={<ArrowLeftOutlined />}
                            onClick={() => navigate('/services')}
                            className="p-0"
                        >
                            Back to Services
                        </Button>
                        <Space>
                            <Title level={2} className="!mb-0">Service #{service.service_code}</Title>
                            <Badge
                                color={statusColors[service.status]}
                                text={statusLabels[service.status]}
                            />
                        </Space>
                        <Text type="secondary">
                            Created on {dayjs(service.created_at).format('DD MMMM YYYY')}
                        </Text>
                    </Space>
                </div>

                <Row gutter={24}>
                    <Col xs={24} lg={16}>
                        <div className="space-y-6">
                            <Card title="Customer Information" className="shadow-sm print:shadow-none">
                                <Row gutter={16}>
                                    <Col xs={24} md={12}>
                                        <div className="space-y-2">
                                            <div className="flex items-center space-x-2">
                                                <CustomerServiceOutlined className="text-gray-400" />
                                                <span className="font-medium">Customer Name</span>
                                            </div>
                                            <p className="text-lg font-semibold">{service.customer_name}</p>
                                        </div>
                                    </Col>
                                    <Col xs={24} md={12}>
                                        <div className="space-y-2">
                                            <div className="flex items-center space-x-2">
                                                <PhoneOutlined className="text-gray-400" />
                                                <span className="font-medium">Phone Number</span>
                                            </div>
                                            <p className="text-lg font-semibold">{service.customer_phone}</p>
                                        </div>
                                    </Col>
                                </Row>
                            </Card>

                            <Card title="Laptop Information" className="shadow-sm print:shadow-none">
                                <Row gutter={16}>
                                    <Col xs={24} md={12}>
                                        <div className="space-y-2">
                                            <div className="flex items-center space-x-2">
                                                <LaptopOutlined className="text-gray-400" />
                                                <span className="font-medium">Brand</span>
                                            </div>
                                            <p className="text-lg font-semibold">{service.laptop_brand}</p>
                                        </div>
                                    </Col>
                                    <Col xs={24} md={12}>
                                        <div className="space-y-2">
                                            <div className="flex items-center space-x-2">
                                                <LaptopOutlined className="text-gray-400" />
                                                <span className="font-medium">Model</span>
                                            </div>
                                            <p className="text-lg font-semibold">{service.laptop_model}</p>
                                        </div>
                                    </Col>
                                </Row>

                                <Divider />

                                <div className="space-y-2">
                                    <span className="font-medium">Complaint Description</span>
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <p className="whitespace-pre-wrap">{service.complaint}</p>
                                    </div>
                                </div>
                            </Card>

                            {service.products && service.products.length > 0 && (
                                <Card title="Products Used" className="shadow-sm print:shadow-none">
                                    <Table
                                        columns={productColumns}
                                        dataSource={service.products}
                                        rowKey="id"
                                        pagination={false}
                                        size="middle"
                                    />
                                </Card>
                            )}

                            <Card title="Service Images" className="shadow-sm print:shadow-none">
                                {service.images && service.images.length > 0 ? (
                                    <Image.PreviewGroup>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            {service.images.map((image, index) => {
                                                console.log(image)
                                               return <Image
                                                    key={index}
                                                    src={image}
                                                    alt={`Service ${index + 1}`}
                                                    className="w-full h-48 object-cover rounded-lg cursor-pointer"
                                                />
                                            })}
                                        </div>
                                    </Image.PreviewGroup>
                                ) : (
                                    <div className="text-center py-12 border-2 border-dashed rounded-lg">
                                        <LaptopOutlined className="text-4xl text-gray-300 mb-4" />
                                        <Title level={5} className="text-gray-400">No Images</Title>
                                        <Text type="secondary">This service has no images</Text>
                                    </div>
                                )}
                            </Card>
                        </div>
                    </Col>

                    <Col xs={24} lg={8}>
                        <div className="space-y-6">
                            <Card title="Service Timeline" className="shadow-sm print:shadow-none">
                                <Timeline items={timelineItems} />
                            </Card>

                            <Card title="Cost Breakdown" className="shadow-sm print:shadow-none">
                                <div className="space-y-3">
                                    {service.products?.map((product, index) => (
                                        <div key={product.id} className="flex justify-between text-sm">
                      <span className="text-gray-600 truncate">
                        {product.name} × {product.qty || 1}
                      </span>
                                            <span>
                        Rp {((product.price || 0) * (product.qty || 1)).toLocaleString('id-ID')}
                      </span>
                                        </div>
                                    ))}

                                    {service.products && service.products.length > 0 && (
                                        <Divider className="my-2" />
                                    )}

                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Service Cost</span>
                                        <span>Rp {service.service_cost.toLocaleString('id-ID')}</span>
                                    </div>

                                    <Divider className="my-2" />

                                    <div className="flex justify-between text-lg font-bold">
                                        <span>Total Cost</span>
                                        <span className="text-blue-600">
                      Rp {service.total_cost.toLocaleString('id-ID')}
                    </span>
                                    </div>
                                </div>
                            </Card>

                            <Card title="Service Details" className="shadow-sm print:shadow-none">
                                <Descriptions column={1} size="small">
                                    <Descriptions.Item label="Service Code">
                                        <Tag color="blue" className="font-mono">{service.service_code}</Tag>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Status">
                                        <Badge
                                            color={statusColors[service.status]}
                                            text={statusLabels[service.status]}
                                        />
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Created Date">
                                        {dayjs(service.created_at).format('DD MMM YYYY HH:mm')}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Last Updated">
                                        {dayjs(service.updated_at).format('DD MMM YYYY HH:mm')}
                                    </Descriptions.Item>
                                </Descriptions>
                            </Card>

                            <Card className="shadow-sm print:hidden">
                                <Space direction="vertical" className="w-full">
                                    <Button
                                        type="primary"
                                        icon={<EditOutlined />}
                                        size="large"
                                        onClick={() => navigate(`/services/${id}/edit`)}
                                        className="w-full"
                                    >
                                        Edit Service
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
                                        danger
                                        icon={<DeleteOutlined />}
                                        size="large"
                                        onClick={() => setDeleteModalVisible(true)}
                                        className="w-full"
                                    >
                                        Delete Service
                                    </Button>
                                </Space>
                            </Card>
                        </div>
                    </Col>
                </Row>
            </div>

            <Modal
                title="Delete Service"
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
                <p>Are you sure you want to delete this service?</p>
                <p className="text-red-500 font-semibold">
                    Service #{service.service_code} will be moved to trash.
                </p>
            </Modal>
        </div>
    );
};

export default ServiceDetail;