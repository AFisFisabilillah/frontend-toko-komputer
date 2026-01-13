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
    Divider
} from 'antd';
import {
    ArrowLeftOutlined,
    EditOutlined,
    DeleteOutlined,
    ShoppingOutlined,
    TagOutlined,
    DollarOutlined,
    StockOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from "../adapters/axiosInstance.js";

const { Title, Text } = Typography;

const ProductDetail = () => {
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const navigate = useNavigate();
    const { id } = useParams();

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const fetchProduct = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(`/products/${id}`);
            setProduct(response.data.data);
        } catch (error) {
            message.error('Failed to fetch product details');
            navigate('/products');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            await axiosInstance.delete(`/products/${id}`);
            message.success('Product deleted successfully');
            navigate('/products');
        } catch (error) {
            message.error('Failed to delete product');
        }
    };

    if (loading || !product) {
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
                            onClick={() => navigate('/products')}
                            className="p-0"
                        >
                            Back to Products
                        </Button>
                        <Space>
                            <Title level={2} className="!mb-0">{product.name}</Title>
                            <Tag color="blue">{product.brand}</Tag>
                        </Space>
                        <Text type="secondary">SKU: {product.sku}</Text>
                    </Space>
                </div>

                <Row gutter={24}>
                    <Col xs={24} lg={16}>
                        <Card className="shadow-lg mb-6">
                            <Title level={4} className="mb-4">Product Images</Title>
                            {product.images && product.images.length > 0 ? (
                                <Image.PreviewGroup>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {product.images.map((image, index) => (
                                            <Image
                                                key={index}
                                                src={image}
                                                alt={`${product.name} ${index + 1}`}
                                                className="w-full h-48 object-cover rounded-lg cursor-pointer"
                                            />
                                        ))}
                                    </div>
                                </Image.PreviewGroup>
                            ) : (
                                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                                    <ShoppingOutlined className="text-4xl text-gray-300 mb-4" />
                                    <Title level={5} className="text-gray-400">No Images</Title>
                                    <Text type="secondary">This product has no images</Text>
                                </div>
                            )}
                        </Card>

                        <Card className="shadow-lg">
                            <Title level={4} className="mb-4">Description</Title>
                            <div className="p-4 bg-gray-50 rounded-lg">
                                {product.description || (
                                    <Text type="secondary">No description provided</Text>
                                )}
                            </div>
                        </Card>
                    </Col>

                    <Col xs={24} lg={8}>
                        <Card className="shadow-lg mb-6">
                            <Title level={4} className="mb-6">Product Information</Title>
                            <Descriptions column={1} size="middle">
                                <Descriptions.Item label={<><TagOutlined /> SKU</>}>
                                    <Text strong>{product.sku}</Text>
                                </Descriptions.Item>
                                <Descriptions.Item label={<><ShoppingOutlined /> Name</>}>
                                    <Text strong>{product.name}</Text>
                                </Descriptions.Item>
                                <Descriptions.Item label={<><TagOutlined /> Brand</>}>
                                    <Tag color="blue">{product.brand}</Tag>
                                </Descriptions.Item>
                                <Descriptions.Item label={<><DollarOutlined /> Price</>}>
                                    <Title level={5} className="!mt-0 !mb-0 text-green-600">
                                        Rp {product.price.toLocaleString('id-ID')}
                                    </Title>
                                </Descriptions.Item>
                                <Descriptions.Item label={<><StockOutlined /> Stock</>}>
                                    <Tag color={product.stok > 10 ? 'green' : product.stok > 0 ? 'orange' : 'red'}>
                                        {product.stok} units
                                    </Tag>
                                </Descriptions.Item>
                                <Descriptions.Item label="Created At">
                                    {new Date(product.created_at).toLocaleString('id-ID')}
                                </Descriptions.Item>
                                <Descriptions.Item label="Last Updated">
                                    {new Date(product.updated_at).toLocaleString('id-ID')}
                                </Descriptions.Item>
                            </Descriptions>
                        </Card>

                        <Card className="shadow-lg">
                            <Title level={4} className="mb-4">Actions</Title>
                            <Space direction="vertical" className="w-full">
                                <Button
                                    type="primary"
                                    icon={<EditOutlined />}
                                    size="large"
                                    onClick={() => navigate(`/products/${id}/edit`)}
                                    className="w-full"
                                >
                                    Edit Product
                                </Button>
                                <Button
                                    danger
                                    icon={<DeleteOutlined />}
                                    size="large"
                                    onClick={() => setDeleteModalVisible(true)}
                                    className="w-full"
                                >
                                    Delete Product
                                </Button>
                            </Space>
                        </Card>
                    </Col>
                </Row>

                <Modal
                    title="Delete Product"
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
                            Delete
                        </Button>,
                    ]}
                >
                    <p>Are you sure you want to delete this product?</p>
                    <p className="text-red-500 font-semibold">This action cannot be undone.</p>
                </Modal>
            </div>
        </div>
    );
};

export default ProductDetail;