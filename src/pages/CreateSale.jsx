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
    Alert,
    Empty
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
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../adapters/axiosInstance';
import {
    calculateProductTotals,
    calculateSaleTotals,
    formatCurrency,
    formatDiscountLabel,
    normalizeDiscountType,
    normalizeDiscountValue,
    toNumber
} from '../utils/saleCalculations';

const { Title, Text } = Typography;
const { Option } = Select;

const CreateSale = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [searchModalVisible, setSearchModalVisible] = useState(false);
    const [productSearch, setProductSearch] = useState('');
    const [productLoading, setProductLoading] = useState(false);
    const [allProducts, setAllProducts] = useState([]);
    const navigate = useNavigate();
    const transactionDiscountType = Form.useWatch('discount_type', form);
    const transactionDiscountValue = Form.useWatch('discount_value', form);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async (search = '') => {
        try {
            setProductLoading(true);
            const queryParams = new URLSearchParams({
                per_page: 20,
                ...(search && { search })
            }).toString();

            const response = await axiosInstance.get(`/products?${queryParams}`);
            setAllProducts(response.data.data);
        } catch {
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
                    qty: 1,
                    discount_type: null,
                    discount_value: null
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

    const handleUpdateProductDiscount = (id, field, value) => {
        setSelectedProducts(selectedProducts.map(product =>
            product.id === id ? { ...product, [field]: value } : product
        ));
    };

    const saleTotals = calculateSaleTotals(selectedProducts, transactionDiscountType, transactionDiscountValue);

    const validateProductDiscounts = () => {
        for (const product of selectedProducts) {
            const subtotalBeforeDiscount = toNumber(product.price) * toNumber(product.qty);
            const discountValue = toNumber(product.discount_value);

            if (discountValue > 0 && !product.discount_type) {
                message.error(`Please select discount type for ${product.name}`);
                return false;
            }

            if (product.discount_type === 'percent' && discountValue > 100) {
                message.error(`Percent discount for ${product.name} cannot exceed 100%`);
                return false;
            }

            if (product.discount_type === 'nominal' && discountValue > subtotalBeforeDiscount) {
                message.error(`Discount for ${product.name} cannot exceed item subtotal`);
                return false;
            }
        }

        return true;
    };

    const handleSubmit = async (values) => {
        if (selectedProducts.length === 0) {
            message.error('Please add at least one product');
            return;
        }

        if (!validateProductDiscounts()) {
            return;
        }

        const totals = calculateSaleTotals(selectedProducts, values.discount_type, values.discount_value);
        if (toNumber(values.discount_value) > 0 && !values.discount_type) {
            message.error('Please select transaction discount type');
            return;
        }

        if (values.discount_type === 'nominal' && toNumber(values.discount_value) > totals.subtotalAfterItemDiscount) {
            message.error('Transaction discount cannot exceed subtotal');
            return;
        }

        try {
            setLoading(true);

            const payload = {
                customer_name: values.customer_name || '',
                payment_method: values.payment_method,
                discount_type: normalizeDiscountType(values.discount_type, values.discount_value),
                discount_value: normalizeDiscountValue(values.discount_value),
                products: selectedProducts.map(product => ({
                    product_id: product.id,
                    qty: product.qty,
                    discount_type: normalizeDiscountType(product.discount_type, product.discount_value),
                    discount_value: normalizeDiscountValue(product.discount_value)
                }))
            };

            const response = await axiosInstance.post('/sales', payload);

            message.success('Sale created successfully!');

            // Reset form
            form.resetFields();
            setSelectedProducts([]);

            // Navigate to invoice detail
            navigate(`/sales/${response.data.data.id}`);
        } catch (error) {
            message.error(error.response?.data?.message || 'Failed to create sale');
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
            render: (price) => formatCurrency(price),
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
            render: (price) => formatCurrency(price),
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
            title: 'Discount Type',
            key: 'discount_type',
            width: 140,
            render: (_, record) => (
                <Select
                    allowClear
                    placeholder="Type"
                    value={record.discount_type || undefined}
                    onChange={(value) => handleUpdateProductDiscount(record.id, 'discount_type', value || null)}
                    size="small"
                    style={{ width: '100%' }}
                >
                    <Option value="nominal">Nominal</Option>
                    <Option value="percent">Percent</Option>
                </Select>
            ),
        },
        {
            title: 'Discount Value',
            key: 'discount_value',
            width: 140,
            render: (_, record) => (
                <InputNumber
                    min={0}
                    max={record.discount_type === 'percent' ? 100 : undefined}
                    value={record.discount_value}
                    onChange={(value) => handleUpdateProductDiscount(record.id, 'discount_value', value)}
                    prefix={record.discount_type === 'nominal' ? 'Rp' : undefined}
                    addonAfter={record.discount_type === 'percent' ? '%' : undefined}
                    size="small"
                    style={{ width: '100%' }}
                />
            ),
        },
        {
            title: 'Discount Amount',
            key: 'discount_amount',
            width: 150,
            render: (_, record) => formatCurrency(calculateProductTotals(record).discountAmount),
        },
        {
            title: 'Final Subtotal',
            key: 'subtotal',
            width: 150,
            render: (_, record) => (
                <span className="font-semibold">{formatCurrency(calculateProductTotals(record).subtotal)}</span>
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

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
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
                        <Title level={2} className="!mb-0">Create New Sale</Title>
                        <p className="text-gray-600">Create a new sales transaction</p>
                    </Space>
                </div>

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={{
                        payment_method: 'cash',
                        discount_type: null,
                        discount_value: null
                    }}
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

                                <Card title="Transaction Discount" className="shadow-sm">
                                    <Row gutter={16}>
                                        <Col xs={24} md={12}>
                                            <Form.Item
                                                label="Discount Type"
                                                name="discount_type"
                                                dependencies={['discount_value']}
                                                rules={[
                                                    ({ getFieldValue }) => ({
                                                        validator(_, value) {
                                                            if (toNumber(getFieldValue('discount_value')) > 0 && !value) {
                                                                return Promise.reject(new Error('Please select discount type'));
                                                            }

                                                            return Promise.resolve();
                                                        }
                                                    })
                                                ]}
                                            >
                                                <Select placeholder="No transaction discount" size="large" allowClear>
                                                    <Option value="nominal">Nominal</Option>
                                                    <Option value="percent">Percent</Option>
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} md={12}>
                                            <Form.Item
                                                label="Discount Value"
                                                name="discount_value"
                                                dependencies={['discount_type']}
                                                rules={[
                                                    ({ getFieldValue }) => ({
                                                        validator(_, value) {
                                                            const discountValue = toNumber(value);
                                                            const discountType = getFieldValue('discount_type');

                                                            if (discountValue <= 0) {
                                                                return Promise.resolve();
                                                            }

                                                            if (!discountType) {
                                                                return Promise.reject(new Error('Please select discount type'));
                                                            }

                                                            if (discountType === 'percent' && discountValue > 100) {
                                                                return Promise.reject(new Error('Percent discount cannot exceed 100'));
                                                            }

                                                            if (discountType === 'nominal' && discountValue > saleTotals.subtotalAfterItemDiscount) {
                                                                return Promise.reject(new Error('Discount cannot exceed subtotal'));
                                                            }

                                                            return Promise.resolve();
                                                        }
                                                    })
                                                ]}
                                            >
                                                <InputNumber
                                                    min={0}
                                                    max={transactionDiscountType === 'percent' ? 100 : undefined}
                                                    prefix={transactionDiscountType === 'nominal' ? 'Rp' : undefined}
                                                    addonAfter={transactionDiscountType === 'percent' ? '%' : undefined}
                                                    placeholder="0"
                                                    size="large"
                                                    style={{ width: '100%' }}
                                                />
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
                                            scroll={{ x: 1100 }}
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
                                                        {product.qty} x {formatCurrency(product.price)}
                                                    </div>
                                                    {calculateProductTotals(product).discountAmount > 0 && (
                                                        <div className="text-red-500">
                                                            Item discount: {formatDiscountLabel(product.discount_type, product.discount_value, calculateProductTotals(product).discountAmount)}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="font-semibold">
                                                    {formatCurrency(calculateProductTotals(product).subtotal)}
                                                </div>
                                            </div>
                                        ))}

                                        <Divider className="my-2" />

                                        <div className="flex justify-between">
                                            <span>Subtotal</span>
                                            <span>{formatCurrency(saleTotals.subtotalBeforeItemDiscount)}</span>
                                        </div>

                                        {saleTotals.itemDiscount > 0 && (
                                            <div className="flex justify-between text-red-600">
                                                <span>Item Discount</span>
                                                <span>-{formatCurrency(saleTotals.itemDiscount)}</span>
                                            </div>
                                        )}

                                        <div className="flex justify-between text-red-600">
                                            <span>Transaction Discount</span>
                                            <span>-{formatCurrency(saleTotals.transactionDiscount)}</span>
                                        </div>

                                        <div className="flex justify-between text-lg font-bold">
                                            <span>Total Amount</span>
                                            <span className="text-blue-600">
                        {formatCurrency(saleTotals.total)}
                      </span>
                                        </div>
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
                                                saleTotals.total / selectedProducts.reduce((sum, p) => sum + p.qty, 0) : 0
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
                                            {loading ? 'Processing...' : 'Complete Sale'}
                                        </Button>
                                        <Button
                                            size="large"
                                            onClick={() => navigate('/sales')}
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

export default CreateSale;
