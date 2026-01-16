import React, { useState, useEffect } from 'react';
import {
    Form,
    Input,
    InputNumber,
    Button,
    Card,
    Upload,
    message,
    Row,
    Col,
    Typography,
    Space,
    Divider,
    Select,
    Table,
    Tag,
    Modal,
    Skeleton,
    Image
} from 'antd';
import {
    UploadOutlined,
    ArrowLeftOutlined,
    SaveOutlined,
    PlusOutlined,
    DeleteOutlined,
    SearchOutlined,
    EyeOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../adapters/axiosInstance';

const { TextArea } = Input;
const { Option } = Select;
const { Title } = Typography;

const EditService = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [fileList, setFileList] = useState([]);
    const [existingImages, setExistingImages] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [searchModalVisible, setSearchModalVisible] = useState(false);
    const [productSearch, setProductSearch] = useState('');
    const [productLoading, setProductLoading] = useState(false);
    const [allProducts, setAllProducts] = useState([]);
    const navigate = useNavigate();
    const { id } = useParams();

    useEffect(() => {
        fetchService();
        fetchProducts();
    }, [id]);

    const fetchService = async () => {
        try {
            setFetching(true);
            const response = await axiosInstance.get(`/services/${id}`);
            const service = response.data.data;

            form.setFieldsValue({
                customer_name: service.customer_name,
                customer_phone: service.customer_phone,
                laptop_brand: service.laptop_brand,
                laptop_model: service.laptop_model,
                complaint: service.complaint,
                service_cost: service.service_cost,
                status: service.status,
            });

            setExistingImages(service.images || []);
            setSelectedProducts(
                service.products?.map(product => ({
                    ...product,
                    qty: 1 // You might need to adjust this based on your API response
                })) || []
            );
        } catch (error) {
            message.error('Failed to fetch service details');
            navigate('/services');
        } finally {
            setFetching(false);
        }
    };

    const fetchProducts = async (search = '') => {
        try {
            setProductLoading(true);
            const queryParams = new URLSearchParams({
                per_page: 20,
                ...(search && { search })
            }).toString();

            const response = await axiosInstance.get(`/products?${queryParams}`);
            setAllProducts(response.data.data);
        } catch (error) {
            message.error('Failed to fetch products');
        } finally {
            setProductLoading(false);
        }
    };

    const handleAddProduct = (product) => {
        const existingIndex = selectedProducts.findIndex(p => p.id === product.id);

        if (existingIndex >= 0) {
            const updatedProducts = [...selectedProducts];
            updatedProducts[existingIndex] = {
                ...updatedProducts[existingIndex],
                qty: updatedProducts[existingIndex].qty + 1
            };
            setSelectedProducts(updatedProducts);
        } else {
            setSelectedProducts([
                ...selectedProducts,
                {
                    ...product,
                    qty: 1
                }
            ]);
        }

        setSearchModalVisible(false);
        setProductSearch('');
    };

    const handleRemoveProduct = (productId) => {
        setSelectedProducts(selectedProducts.filter(p => p.id !== productId));
    };

    const handleUpdateQuantity = (id, qty) => {
        if (qty < 1) {
            handleRemoveProduct(id);
            return;
        }

        setSelectedProducts(selectedProducts.map(p =>
            p.id === id ? { ...p, qty } : p
        ));
    };

    const handleRemoveExistingImage = (imageToRemove) => {
        setExistingImages(prev => prev.filter(img => img !== imageToRemove));
        message.info('Image will be removed when you save changes');
    };

    const calculateTotal = () => {
        const serviceCost = form.getFieldValue('service_cost') || 0;
        const productsTotal = selectedProducts.reduce((total, product) => {
            return total + (product.price * product.qty);
        }, 0);
        return serviceCost + productsTotal;
    };

    const handleSubmit = async (values) => {
        try {
            setLoading(true);

            const formData = new FormData();

            // Append basic fields
            Object.keys(values).forEach(key => {
                if (key !== 'images') {
                    formData.append(key, values[key]);
                }
            });

            // Append products
            selectedProducts.forEach((product, index) => {
                formData.append(`products[${index}][product_id]`, product.id);
                formData.append(`products[${index}][qty]`, product.qty);
            });

            // Append new images
            fileList.forEach(file => {
                if (file.originFileObj) {
                    formData.append('images[]', file.originFileObj);
                }
            });

            const response = await axiosInstance.post(`/services/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            message.success('Service updated successfully!');
            navigate('/services');
        } catch (error) {
            message.error(error.response?.data?.message || 'Failed to update service');
        } finally {
            setLoading(false);
        }
    };

    const uploadProps = {
        onRemove: (file) => {
            const index = fileList.indexOf(file);
            const newFileList = fileList.slice();
            newFileList.splice(index, 1);
            setFileList(newFileList);
        },
        beforeUpload: (file) => {
            const isImage = file.type.startsWith('image/');
            if (!isImage) {
                message.error('You can only upload image files!');
                return false;
            }

            const isLt2M = file.size / 1024 / 1024 < 2;
            if (!isLt2M) {
                message.error('Image must be smaller than 2MB!');
                return false;
            }

            setFileList([...fileList, file]);
            return false;
        },
        fileList,
        multiple: true,
        listType: "picture-card",
        accept: 'image/*',
        showUploadList: {
            showPreviewIcon: true,
            showRemoveIcon: true,
        },
    };

    const statusOptions = [
        { value: 'received', label: 'Received' },
        { value: 'process', label: 'In Process' },
        { value: 'done', label: 'Completed' },
        { value: 'taken', label: 'Taken' },
        { value: 'cancelled', label: 'Cancelled' },
    ];

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
                        <div className="text-xs text-gray-500">{record.sku}</div>
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
            title: 'Stock',
            dataIndex: 'stok',
            key: 'stok',
            width: 80,
            render: (stock) => (
                <Tag color={stock > 0 ? 'green' : 'red'}>{stock}</Tag>
            ),
        },
        {
            title: 'Action',
            key: 'action',
            width: 80,
            render: (_, record) => (
                <Button
                    type="primary"
                    size="small"
                    onClick={() => handleAddProduct(record)}
                    disabled={record.stok <= 0}
                >
                    Add
                </Button>
            ),
        },
    ];

    const selectedProductColumns = [
        {
            title: 'Product',
            key: 'product',
            render: (record) => (
                <div>
                    <div className="font-medium">{record.name}</div>
                    <div className="text-sm text-gray-500">SKU: {record.sku}</div>
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
            key: 'qty',
            width: 120,
            render: (_, record) => (
                <InputNumber
                    min={1}
                    max={record.stok}
                    value={record.qty}
                    onChange={(value) => handleUpdateQuantity(record.id, value)}
                    size="small"
                />
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
        {
            title: 'Action',
            key: 'action',
            width: 80,
            render: (_, record) => (
                <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleRemoveProduct(record.id)}
                />
            ),
        },
    ];

    if (fetching) {
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
            <div className="max-w-7xl mx-auto">
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
                        <Title level={2} className="!mb-0">Edit Service</Title>
                        <p className="text-gray-600">Update service information</p>
                    </Space>
                </div>

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >
                    <Row gutter={24}>
                        <Col xs={24} lg={16}>
                            <div className="space-y-6">
                                <Card title="Customer Information" className="shadow-sm">
                                    <Row gutter={16}>
                                        <Col xs={24} md={12}>
                                            <Form.Item
                                                label="Customer Name"
                                                name="customer_name"
                                                rules={[{ required: true, message: 'Please enter customer name' }]}
                                            >
                                                <Input placeholder="Enter customer name" size="large" />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} md={12}>
                                            <Form.Item
                                                label="Phone Number"
                                                name="customer_phone"
                                                rules={[
                                                    { required: true, message: 'Please enter phone number' },
                                                    { pattern: /^[0-9+]+$/, message: 'Only numbers and + allowed' }
                                                ]}
                                            >
                                                <Input placeholder="e.g., 081234567890" size="large" />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                </Card>

                                <Card title="Laptop Information" className="shadow-sm">
                                    <Row gutter={16}>
                                        <Col xs={24} md={12}>
                                            <Form.Item
                                                label="Brand"
                                                name="laptop_brand"
                                                rules={[{ required: true, message: 'Please enter laptop brand' }]}
                                            >
                                                <Input placeholder="e.g., ASUS, Lenovo, Dell" size="large" />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} md={12}>
                                            <Form.Item
                                                label="Model"
                                                name="laptop_model"
                                                rules={[{ required: true, message: 'Please enter laptop model' }]}
                                            >
                                                <Input placeholder="e.g., TUF FX505, ThinkPad X1" size="large" />
                                            </Form.Item>
                                        </Col>
                                    </Row>

                                    <Form.Item
                                        label="Complaint"
                                        name="complaint"
                                        rules={[{ required: true, message: 'Please enter complaint description' }]}
                                    >
                                        <TextArea
                                            rows={3}
                                            placeholder="Describe the problem..."
                                            maxLength={1000}
                                            showCount
                                        />
                                    </Form.Item>
                                </Card>

                                <Card title="Status & Service Cost" className="shadow-sm">
                                    <Row gutter={16}>
                                        <Col xs={24} md={12}>
                                            <Form.Item
                                                label="Status"
                                                name="status"
                                                rules={[{ required: true, message: 'Please select status' }]}
                                            >
                                                <Select
                                                    placeholder="Select status"
                                                    size="large"
                                                    options={statusOptions}
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} md={12}>
                                            <Form.Item
                                                label="Service Cost"
                                                name="service_cost"
                                                rules={[{ required: true, message: 'Please enter service cost' }]}
                                            >
                                                <InputNumber
                                                    placeholder="0"
                                                    size="large"
                                                    min={0}
                                                    formatter={value => `Rp ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                    parser={value => value.replace(/Rp\s?|(,*)/g, '')}
                                                    className="w-full"
                                                />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                </Card>

                                <Card title="Products Used" className="shadow-sm">
                                    <div className="mb-4">
                                        <Button
                                            type="dashed"
                                            icon={<PlusOutlined />}
                                            onClick={() => setSearchModalVisible(true)}
                                            className="w-full"
                                        >
                                            Add Product
                                        </Button>
                                    </div>

                                    {selectedProducts.length > 0 ? (
                                        <Table
                                            columns={selectedProductColumns}
                                            dataSource={selectedProducts}
                                            rowKey="id"
                                            pagination={false}
                                            size="small"
                                            className="mb-4"
                                        />
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            No products added yet
                                        </div>
                                    )}
                                </Card>
                            </div>
                        </Col>

                        <Col xs={24} lg={8}>
                            <div className="space-y-6">
                                <Card title="Existing Images" className="shadow-sm">
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            {existingImages.map((image, index) => (
                                                <div key={index} className="relative group">
                                                    <Image
                                                        src={image}
                                                        alt={`Service ${index + 1}`}
                                                        className="w-full h-32 object-cover rounded-lg"
                                                        preview={{
                                                            mask: <EyeOutlined />,
                                                        }}
                                                    />
                                                    <Button
                                                        type="text"
                                                        danger
                                                        icon={<DeleteOutlined />}
                                                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        onClick={() => handleRemoveExistingImage(image)}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                        {existingImages.length === 0 && (
                                            <div className="text-center text-gray-500 py-8">
                                                No images available
                                            </div>
                                        )}
                                    </div>
                                </Card>

                                <Card title="Add New Images" className="shadow-sm">
                                    <div className="space-y-4">
                                        <Upload {...uploadProps}>
                                            {fileList.length >= 5 ? null : (
                                                <div>
                                                    <UploadOutlined />
                                                    <div style={{ marginTop: 8 }}>Upload</div>
                                                </div>
                                            )}
                                        </Upload>
                                        <div className="text-sm text-gray-500">
                                            <p>• Upload up to 5 images</p>
                                            <p>• New images will be added to existing ones</p>
                                            <p>• Supported: JPG, JPEG, PNG</p>
                                        </div>
                                    </div>
                                </Card>

                                <Card title="Cost Summary" className="shadow-sm">
                                    <div className="space-y-3">
                                        {selectedProducts.map(product => (
                                            <div key={product.id} className="flex justify-between text-sm">
                                                <span className="text-gray-600 truncate">{product.name} × {product.qty}</span>
                                                <span>Rp {(product.price * product.qty).toLocaleString('id-ID')}</span>
                                            </div>
                                        ))}

                                        <Divider className="my-2" />

                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Service Cost</span>
                                            <span>Rp {(form.getFieldValue('service_cost') || 0).toLocaleString('id-ID')}</span>
                                        </div>

                                        <Divider className="my-2" />

                                        <div className="flex justify-between text-lg font-bold">
                                            <span>Total Cost</span>
                                            <span className="text-blue-600">
                        Rp {calculateTotal().toLocaleString('id-ID')}
                      </span>
                                        </div>
                                    </div>
                                </Card>

                                <Card className="shadow-sm">
                                    <Space direction="vertical" className="w-full">
                                        <Button
                                            type="primary"
                                            htmlType="submit"
                                            size="large"
                                            loading={loading}
                                            icon={<SaveOutlined />}
                                            className="w-full bg-blue-600 hover:bg-blue-700"
                                        >
                                            Update Service
                                        </Button>
                                        <Button
                                            size="large"
                                            onClick={() => navigate('/services')}
                                            className="w-full"
                                        >
                                            Cancel
                                        </Button>
                                    </Space>
                                </Card>
                            </div>
                        </Col>
                    </Row>
                </Form>
            </div>

            {/* Product Search Modal */}
            <Modal
                title="Add Products"
                open={searchModalVisible}
                onCancel={() => {
                    setSearchModalVisible(false);
                    setProductSearch('');
                }}
                footer={null}
                width={800}
            >
                <div className="mb-4">
                    <Input
                        placeholder="Search products..."
                        value={productSearch}
                        onChange={(e) => {
                            setProductSearch(e.target.value);
                            fetchProducts(e.target.value);
                        }}
                        prefix={<SearchOutlined />}
                        size="large"
                    />
                </div>

                <Table
                    columns={productColumns}
                    dataSource={allProducts}
                    rowKey="id"
                    loading={productLoading}
                    pagination={{ pageSize: 5 }}
                    scroll={{ y: 300 }}
                />
            </Modal>
        </div>
    );
};

export default EditService;