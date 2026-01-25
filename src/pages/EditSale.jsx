import React, { useState, useEffect } from 'react';
import {
    Form,
    Input,
    Button,
    Card,
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
    InputNumber,
    Statistic,
    Skeleton,
    Alert
} from 'antd';
import {
    ArrowLeftOutlined,
    SaveOutlined,
    PlusOutlined,
    DeleteOutlined,
    SearchOutlined,
    ShoppingCartOutlined,
    CalculatorOutlined,
    UserOutlined,
    CreditCardOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../adapters/axiosInstance';

const { Title, Text } = Typography;
const { Option } = Select;

const EditSale = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [products, setProducts] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [searchModalVisible, setSearchModalVisible] = useState(false);
    const [productSearch, setProductSearch] = useState('');
    const [productLoading, setProductLoading] = useState(false);
    const [allProducts, setAllProducts] = useState([]);
    const [saleDetails, setSaleDetails] = useState(null);
    const navigate = useNavigate();
    const { id } = useParams();

    useEffect(() => {
        fetchSale();
        fetchProducts();
    }, [id]);

    const fetchSale = async () => {
        try {
            setFetching(true);
            const response = await axiosInstance.get(`/sales/${id}`);
            const sale = response.data.data;

            setSaleDetails(sale);
            form.setFieldsValue({
                customer_name: sale.customer_name || '',
                payment_method: sale.payment_method,
            });

            // Convert products from sale to selected products format
            if (sale.products && sale.products.length > 0) {
                const formattedProducts = sale.products.map(product => ({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    sku: `PROD-${product.id}`, // This should come from API
                    stok: 99, // This should come from API
                    qty: product.qty
                }));
                setSelectedProducts(formattedProducts);
            }
        } catch (error) {
            message.error('Failed to fetch sale details');
            navigate('/sales');
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
        if (product.stok <= 0) {
            message.warning(`Product "${product.name}" is out of stock`);
            return;
        }

        const existingIndex = selectedProducts.findIndex(p => p.id === product.id);

        if (existingIndex >= 0) {
            const updatedProducts = [...selectedProducts];
            const currentQty = updatedProducts[existingIndex].qty;

            if (currentQty >= product.stok) {
                message.warning(`Cannot add more. Only ${product.stok - currentQty} items left in stock`);
                return;
            }

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

    const handleRemoveProduct = (id) => {
        setSelectedProducts(selectedProducts.filter(p => p.id !== id));
    };

    const handleUpdateQuantity = (id, qty) => {
        if (qty < 1) {
            handleRemoveProduct(id);
            return;
        }

        const product = selectedProducts.find(p => p.id === id);
        if (product && qty > product.stok) {
            message.warning(`Cannot exceed available stock of ${product.stok}`);
            return;
        }

        setSelectedProducts(selectedProducts.map(p =>
            p.id === id ? { ...p, qty } : p
        ));
    };

    const calculateSubtotal = (price, qty) => {
        return price * qty;
    };

    const calculateTotal = () => {
        return selectedProducts.reduce((total, product) => {
            return total + (product.price * product.qty);
        }, 0);
    };

    const handleSubmit = async (values) => {
        if (selectedProducts.length === 0) {
            message.error('Please add at least one product');
            return;
        }

        try {
            setLoading(true);

            const payload = {
                customer_name: values.customer_name || '',
                payment_method: values.payment_method,
                products: selectedProducts.map(product => ({
                    product_id: product.id,
                    qty: product.qty
                }))
            };

            const response = await axiosInstance.patch(`/sales/${id}`, payload);

            message.success('Sale updated successfully!');
            navigate(`/sales/${id}`);
        } catch (error) {
            message.error(error.response?.data?.message || 'Failed to update sale');
        } finally {
            setLoading(false);
        }
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
            title: 'Stock',
            dataIndex: 'stok',
            key: 'stok',
            width: 80,
            render: (stock) => (
                <Tag color={stock > 10 ? 'green' : stock > 0 ? 'orange' : 'red'}>{stock}</Tag>
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
          Rp {calculateSubtotal(record.price, record.qty).toLocaleString('id-ID')}
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
                            onClick={() => navigate(`/sales/${id}`)}
                            className="p-0"
                        >
                            Back to Sale Details
                        </Button>
                        <Title level={2} className="!mb-0">Edit Sale</Title>
                        <p className="text-gray-600">
                            Editing Invoice: <span className="font-mono font-semibold">{saleDetails?.invoice_number}</span>
                        </p>
                    </Space>
                </div>

                {saleDetails && (
                    <Alert
                        message={
                            <Space>
                                <span>Original Total:</span>
                                <span className="font-semibold">
                  Rp {saleDetails.total_price.toLocaleString('id-ID')}
                </span>
                            </Space>
                        }
                        type="info"
                        showIcon
                        className="mb-6"
                    />
                )}

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
                                                tooltip="Leave empty for walk-in customer"
                                            >
                                                <Input
                                                    placeholder="Walk-in Customer (Optional)"
                                                    prefix={<UserOutlined className="text-gray-400" />}
                                                    size="large"
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} md={12}>
                                            <Form.Item
                                                label="Payment Method"
                                                name="payment_method"
                                                rules={[{ required: true, message: 'Please select payment method' }]}
                                            >
                                                <Select
                                                    placeholder="Select payment method"
                                                    size="large"
                                                >
                                                    <Option value="cash">Cash</Option>
                                                    <Option value="transfer">Bank Transfer</Option>
                                                    <Option value="qris">QRIS</Option>
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                </Card>

                                <Card title="Products" className="shadow-sm">
                                    <div className="mb-4">
                                        <Button
                                            type="dashed"
                                            icon={<PlusOutlined />}
                                            onClick={() => setSearchModalVisible(true)}
                                            className="w-full"
                                            size="large"
                                        >
                                            <ShoppingCartOutlined className="mr-2" />
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
                                        <div className="text-center py-12">
                                            <ShoppingCartOutlined className="text-4xl text-gray-300 mb-4" />
                                            <Title level={5} className="text-gray-400">No Products Added</Title>
                                            <Text type="secondary">Click "Add Product" to start adding items</Text>
                                        </div>
                                    )}
                                </Card>
                            </div>
                        </Col>

                        <Col xs={24} lg={8}>
                            <div className="space-y-6">
                                <Card title="Order Summary" className="shadow-sm">
                                    <div className="space-y-4">
                                        {selectedProducts.map(product => (
                                            <div key={product.id} className="flex justify-between text-sm border-b pb-2">
                                                <div>
                                                    <div className="font-medium">{product.name}</div>
                                                    <div className="text-gray-500">
                                                        {product.qty} × Rp {product.price.toLocaleString('id-ID')}
                                                    </div>
                                                </div>
                                                <div className="font-semibold">
                                                    Rp {calculateSubtotal(product.price, product.qty).toLocaleString('id-ID')}
                                                </div>
                                            </div>
                                        ))}

                                        <Divider className="my-2" />

                                        <div className="flex justify-between text-lg font-bold">
                                            <span>New Total</span>
                                            <span className="text-blue-600">
                        Rp {calculateTotal().toLocaleString('id-ID')}
                      </span>
                                        </div>

                                        {saleDetails && (
                                            <>
                                                <Divider className="my-2" />
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-500">Previous Total</span>
                                                    <span className="text-gray-500">
                            Rp {saleDetails.total_price.toLocaleString('id-ID')}
                          </span>
                                                </div>
                                                <div className="flex justify-between text-sm font-semibold">
                                                    <span>Difference</span>
                                                    <span className={
                                                        calculateTotal() > saleDetails.total_price ? 'text-green-600' :
                                                            calculateTotal() < saleDetails.total_price ? 'text-red-600' : 'text-gray-600'
                                                    }>
                            {calculateTotal() > saleDetails.total_price ? '+' : ''}
                                                        Rp {(calculateTotal() - saleDetails.total_price).toLocaleString('id-ID')}
                          </span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </Card>

                                <Card title="Quick Stats" className="shadow-sm">
                                    <div className="space-y-3">
                                        <Statistic
                                            title="Total Items"
                                            value={selectedProducts.reduce((sum, p) => sum + p.qty, 0)}
                                            prefix={<ShoppingCartOutlined />}
                                        />
                                        <Statistic
                                            title="Unique Products"
                                            value={selectedProducts.length}
                                            prefix={<CalculatorOutlined />}
                                        />
                                        <Statistic
                                            title="Average Price"
                                            value={selectedProducts.length > 0 ?
                                                calculateTotal() / selectedProducts.reduce((sum, p) => sum + p.qty, 0) : 0
                                            }
                                            prefix="Rp"
                                            formatter={(value) => Math.round(value).toLocaleString('id-ID')}
                                        />
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
                                            disabled={selectedProducts.length === 0}
                                            className="w-full bg-blue-600 hover:bg-blue-700"
                                        >
                                            {loading ? 'Updating...' : 'Update Sale'}
                                        </Button>
                                        <Button
                                            size="large"
                                            onClick={() => navigate(`/sales/${id}`)}
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
                        placeholder="Search products by name or SKU..."
                        value={productSearch}
                        onChange={(e) => {
                            setProductSearch(e.target.value);
                            fetchProducts(e.target.value);
                        }}
                        prefix={<SearchOutlined />}
                        size="large"
                        allowClear
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

export default EditSale;