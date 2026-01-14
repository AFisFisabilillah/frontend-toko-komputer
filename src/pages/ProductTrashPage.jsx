import React, {useState, useEffect} from 'react';
import {
    Table,
    Button,
    Space,
    Card,
    message,
    Popconfirm,
    Tag,
    Empty, Modal
} from 'antd';
import {
    ArrowLeftOutlined,
    DeleteOutlined,
    RedoOutlined,
    EyeOutlined
} from '@ant-design/icons';
import {useNavigate} from 'react-router-dom';
import axiosInstance from "../adapters/axiosInstance.js";
import {useImmer} from "use-immer";

const ProductTrash = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [selectedRowKey, setSelectedRowKey] = useImmer([]);
    const fetchTrashedProducts = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/products/trashed');
            setProducts(response.data.data);
        } catch (error) {
            message.error('Failed to fetch trashed products');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTrashedProducts();
    }, []);

    const handleRestore = async (id) => {
        try {
            await axiosInstance.post(`/products/${id}/restore`);
            message.success('Product restored successfully');
            fetchTrashedProducts();
        } catch (error) {
            message.error('Failed to restore product');
        }
    };

    const handleForceDelete = async (id) => {
        try {
            await axiosInstance.delete(`/products/${id}/force`);
            message.success('Product permanently deleted');
            fetchTrashedProducts();
        } catch (error) {
            message.error('Failed to delete product');
        }
    };

    const handleRestoreSelected = async () => {
        try {
            await axiosInstance.post('/products/restore', {
                products: selectedRowKey
            })
            message.success(`Berhasil Restore ${selectedRowKey.length} Product`);
            fetchTrashedProducts();
            setSelectedRowKey([]);
        } catch (e) {
            message.error("Error restored producys");
            console.log(e)
        }
    }

    const forceDeleteProducts = async () => {
        try {
            await axiosInstance.delete('/products/force', {
                data:{
                    products: selectedRowKey
                }
            })
            message.success(`Berhasil Force delete ${selectedRowKey.length} Product`);
            fetchTrashedProducts();
            setSelectedRowKey([]);
        } catch (e) {
            message.error("Error Force Products");
            console.log(e)
        }
    }

    const handleSelectedRestore = async () => {
        Modal.confirm({
            centered: true,
            title: "Restore Products",
            content: `Apakah Kamu Mau Restore ${selectedRowKey.length} Product`,
            onOk: () => {
                return handleRestoreSelected();
            },
            okText: "Restore",
            okButtonProps: {
                icon: <RedoOutlined/>,
                type: "primary"
            },
            icon: <RedoOutlined/>,
        })
    }

    const handleSelectedForce = () => {
        Modal.confirm({
            centered: true,
            title: "Restore Products",
            content: `Apakah Kamu Mau Delete ${selectedRowKey.length} Product`,
            onOk: () => {
                return forceDeleteProducts();
            },
            okText: "Restore",
            okButtonProps: {
                icon: <DeleteOutlined/>,
                danger: true
            },
            icon: <DeleteOutlined/>,
        })
    }


    const columns = [
        {
            title: 'SKU',
            dataIndex: 'sku',
            key: 'sku',
        },
        {
            title: 'Product Name',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (
                <div>
                    <div className="font-medium">{text}</div>
                    <div className="text-sm text-gray-500">{record.brand}</div>
                </div>
            ),
        },
        {
            title: 'Price',
            dataIndex: 'price',
            key: 'price',
            render: (price) => `Rp ${price.toLocaleString('id-ID')}`,
        },
        {
            title: 'Deleted At',
            dataIndex: 'deleted_at',
            key: 'deleted_at',
            render: (date) => date ? new Date(date).toLocaleString('id-ID') : '-',
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button
                        type="primary"
                        icon={<RedoOutlined/>}
                        onClick={() => handleRestore(record.id)}
                    >
                        Restore
                    </Button>
                    <Popconfirm
                        title="Permanently Delete"
                        description="This action cannot be undone. Are you sure?"
                        onConfirm={() => handleForceDelete(record.id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button danger icon={<DeleteOutlined/>}>
                            Delete Permanently
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <Card className="shadow-lg">
                <div className="mb-2">
                    <div>
                        <Button
                            type="text"
                            icon={<ArrowLeftOutlined/>}
                            onClick={() => navigate('/products')}
                        >
                            Back to Products
                        </Button>
                        <div className={"ml-4"}>
                            <h1 className="text-2xl font-bold text-gray-800">Trash</h1>
                            <p className="text-gray-600">Manage deleted products</p>
                        </div>
                    </div>
                </div>
                <Space className={"mb-3"}>
                    {
                        selectedRowKey.length !== 0 && (<>
                            <Button
                                type="primary"
                                icon={<RedoOutlined/>}
                                onClick={handleSelectedRestore}
                            >
                                Restore
                            </Button>

                            <Button onClick={handleSelectedForce} danger icon={<DeleteOutlined/>}>
                                Delete
                            </Button>
                        </>)
                    }
                </Space>
                {products.length === 0 ? (
                    <Empty
                        description="No trashed products"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                ) : (
                    <Table
                        rowSelection={{
                            selectedRowKeys: selectedRowKey,
                            onChange: selectedRowKeys => {
                                setSelectedRowKey(selectedRowKeys);
                            }
                        }}
                        columns={columns}
                        dataSource={products}
                        rowKey="id"
                        loading={loading}
                        pagination={false}
                    />
                )}
            </Card>
        </div>
    );
};

export default ProductTrash;