import React, { useState, useEffect } from 'react';
import {
    Table,
    Button,
    Space,
    Input,
    Card,
    Row,
    Col,
    Tag,
    Popconfirm,
    message,
    Tooltip,
    Modal,
    Pagination,
    Image,
} from 'antd';
const { confirm } = Modal;
import {
    SearchOutlined,
    EditOutlined,
    DeleteOutlined,
    EyeOutlined,
    PlusOutlined,
    ReloadOutlined,
    FilterOutlined, ExclamationCircleFilled
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from "../adapters/axiosInstance.js";

const { Search } = Input;

const Products = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    });
    const [filtersVisible, setFiltersVisible] = useState(false);
    const navigate = useNavigate();
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const fetchProducts = async (params = {}) => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams({
                page: params.page || pagination.current,
                per_page: params.per_page || pagination.pageSize,
                ...(searchText && { search: searchText }),
                ...(minPrice && { min_price: minPrice }),
                ...(maxPrice && { max_price: maxPrice }),
            }).toString();

            const response = await axiosInstance.get(`/products?${queryParams}`);
            setProducts(response.data.data);
            setPagination({
                ...pagination,
                current: response.data.meta.current_page,
                total: response.data.meta.total,
                pageSize: response.data.meta.per_page
            });
        } catch (error) {
            message.error('Failed to fetch products');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleSearch = () => {
        fetchProducts({ page: 1 });
    };

    const handleReset = () => {
        setSearchText('');
        setMinPrice('');
        setMaxPrice('');
        fetchProducts({ page: 1 });
    };

    const handleDelete = async (id) => {
        try {
            await axiosInstance.delete(`/products/${id}`);
            message.success('Product deleted successfully');
            fetchProducts();
        } catch (error) {
            message.error('Failed to delete product');
        }
    };

    const handleTableChange = (newPagination) => {
        fetchProducts({
            page: newPagination.current,
            per_page: newPagination.pageSize
        });
    };

    const showDeleteConfirm = () => {
        confirm({
            centered: true,
            title: "Peringatan",
            icon: <ExclamationCircleFilled />,
            content: 'Apakah Kamu ingin menghapus ' + selectedRowKeys.length +" data products",
            okText: "Delete",
            okButtonProps:{
                icon:<DeleteOutlined />
            },
            okType: 'danger',
            cancelText: 'Cancel',
            onOk(){
                return handleDeleteSelectProduct();
            },
            onCancel() {
                console.log('Cancel');
            },
        });
    };

    const onSelectChange = newSelectedRowKeys => {
        console.log('selectedRowKeys changed: ', newSelectedRowKeys);
        setSelectedRowKeys(newSelectedRowKeys);
    };
    const rowSelection = {
        selectedRowKeys,
        onChange: onSelectChange,
    };

    const handleDeleteSelectProduct= async ()=>{
        try {
            await axiosInstance.delete("/products/deletes", {
                data:{
                    products: selectedRowKeys
                }
            });
            message.success(`Berhasil Menghapus ${selectedRowKeys.length} data Products`);
            setSelectedRowKeys([]);
            fetchProducts();
        }catch(error){
            message.error(error.message);
            console.log(error)
        }
    }

    const columns = [
        {
            title: 'SKU',
            dataIndex: 'sku',
            key: 'sku',
            width: 120,
            sorter: (a, b) => a.sku.localeCompare(b.sku),
        },
        {
            title: 'Product',
            key: 'product',
            render: (record) => (
                <div className="flex items-center">
                    {record.images && record.images[0] ? (
                        <div
                            className="w-12 h-12 object-cover rounded-lg mr-3"
                        >
                            <Image  src={record.images[0]}
                                    alt={record.name} />
                        </div>
                    ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center mr-3">
                            <span className="text-gray-400">No Image</span>
                        </div>
                    )}
                    <div>
                        <div className="font-medium text-gray-900">{record.name}</div>
                        <div className="text-sm text-gray-500">{record.brand}</div>
                    </div>
                </div>
            ),
        },
        {
            title: 'Price',
            dataIndex: 'price',
            key: 'price',
            width: 150,
            sorter: (a, b) => a.price - b.price,
            render: (price) => (
                <span className="font-semibold">
          Rp {price.toLocaleString('id-ID')}
        </span>
            ),
        },
        {
            title: 'Stock',
            dataIndex: 'stok',
            key: 'stok',
            width: 100,
            sorter: (a, b) => a.stok - b.stok,
            render: (stock) => (
                <Tag color={stock > 10 ? 'green' : stock > 0 ? 'orange' : 'red'}>
                    {stock} pcs
                </Tag>
            ),
        },
        {
            title: 'Created At',
            dataIndex: 'created_at',
            key: 'created_at',
            width: 150,
            sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
            render: (date) => new Date(date).toLocaleDateString('id-ID'),
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 150,
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="View Details">
                        <Button
                            type="text"
                            icon={<EyeOutlined />}
                            onClick={() => navigate(`/products/${record.id}`)}
                        />
                    </Tooltip>
                    <Tooltip title="Edit">
                        <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => navigate(`/products/${record.id}/edit`)}
                        />
                    </Tooltip>
                    <Tooltip title="Delete">
                        <Popconfirm
                            title="Delete Product"
                            description="Are you sure to delete this product?"
                            onConfirm={() => handleDelete(record.id)}
                            okText="Yes"
                            cancelText="No"
                        >
                            <Button type="text" danger icon={<DeleteOutlined />} />
                        </Popconfirm>
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <Card className="shadow-lg">
                <div className="mb-6">
                    <Row gutter={16} align="middle" justify="space-between">
                        <Col>
                            <h1 className="text-2xl font-bold text-gray-800">Products</h1>
                            <p className="text-gray-600">Manage your products inventory</p>
                        </Col>
                        <Col>
                            <Space>
                                <Button
                                    type="primary"
                                    icon={<PlusOutlined />}
                                    onClick={() => navigate('/products/create')}
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    Add Product
                                </Button>
                                <Button
                                    icon={<ReloadOutlined />}
                                    onClick={() => navigate('/products/trashed')}
                                >
                                    Trash
                                </Button>
                            </Space>
                        </Col>
                    </Row>
                </div>

                {/* Filters */}
                <div className="mb-6">
                    <Row gutter={16} align="bottom">
                        <Col xs={24} md={8}>
                            <Search
                                placeholder="Search products..."
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                onSearch={handleSearch}
                                enterButton={<SearchOutlined />}
                                size="large"
                            />
                        </Col>
                        <Col>
                            <Button
                                type="text"
                                icon={<FilterOutlined />}
                                onClick={() => setFiltersVisible(!filtersVisible)}
                            >
                                Filters
                            </Button>
                        </Col>
                        <Col>
                            <Button onClick={handleReset}>Reset</Button>
                        </Col>
                        {selectedRowKeys.length !== 0  && <Col>
                            <Button
                                danger
                                icon={<DeleteOutlined />}
                                onClick={showDeleteConfirm}>Hapus</Button>
                        </Col> }

                    </Row>

                    {filtersVisible && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                            <Row gutter={16}>
                                <Col xs={12} md={6}>
                                    <Input
                                        placeholder="Min Price"
                                        value={minPrice}
                                        onChange={(e) => setMinPrice(e.target.value)}
                                        prefix="Rp"
                                        formatter={(value) =>
                                            value ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') : ''
                                        }
                                        type="number"
                                    />
                                </Col>
                                <Col xs={12} md={6}>
                                    <Input
                                        placeholder="Max Price"
                                        value={maxPrice}
                                        onChange={(e) => setMaxPrice(e.target.value)}
                                        prefix="Rp"
                                        formatter={(value) =>
                                            value ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') : ''
                                        }
                                        type="number"
                                    />
                                </Col>
                                <Col xs={24} md={12} className="flex items-end">
                                    <Button type="primary" onClick={handleSearch}>
                                        Apply Filters
                                    </Button>
                                </Col>
                            </Row>
                        </div>
                    )}
                </div>

                {/* Products Table */}
                <Table
                    rowSelection={rowSelection}
                    columns={columns}
                    dataSource={products}
                    rowKey="id"
                    loading={loading}
                    pagination={false}
                    onChange={handleTableChange}
                    scroll={{ x: 800 }}
                />

                {/* Custom Pagination */}
                <div className="mt-4 flex justify-end">
                    <Pagination
                        current={pagination.current}
                        pageSize={pagination.pageSize}
                        total={pagination.total}
                        onChange={(page, pageSize) => handleTableChange({ current: page, pageSize })}
                        showSizeChanger
                        showQuickJumper
                        showTotal={(total, range) =>
                            `${range[0]}-${range[1]} of ${total} items`
                        }
                    />
                </div>
            </Card>
        </div>
    );
};

export default Products;