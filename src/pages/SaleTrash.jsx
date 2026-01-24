import React, { useState, useEffect } from 'react';
import {
    Table,
    Button,
    Space,
    Card,
    message,
    Popconfirm,
    Tag,
    Empty,
    Pagination,
    Row,
    Col,
    Typography
} from 'antd';
import {
    ArrowLeftOutlined,
    DeleteOutlined,
    RedoOutlined,
    EyeOutlined,
    HistoryOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../adapters/axiosInstance';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const SalesTrash = () => {
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    });
    const navigate = useNavigate();

    const paymentMethodColors = {
        cash: 'green',
        transfer: 'blue',
        qris: 'purple',
        debit_card: 'orange',
        credit_card: 'red'
    };

    const fetchTrashedSales = async (params = {}) => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams({
                page: params.page || pagination.current,
                per_page: params.per_page || pagination.pageSize,
            }).toString();

            const response = await axiosInstance.get(`/sales/trash?${queryParams}`);
            setSales(response.data.data);
            setPagination({
                ...pagination,
                current: response.data.meta.current_page,
                total: response.data.meta.total,
                pageSize: response.data.meta.per_page
            });
        } catch (error) {
            message.error('Failed to fetch trashed sales');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTrashedSales();
    }, []);

    const handleRestore = async (id) => {
        try {
            await axiosInstance.post(`/sales/restore/${id}`);
            message.success('Sale restored successfully');
            fetchTrashedSales();
        } catch (error) {
            message.error('Failed to restore sale');
        }
    };

    const handleForceDelete = async (id) => {
        try {
            await axiosInstance.delete(`/sales/force/${id}`);
            message.success('Sale permanently deleted');
            fetchTrashedSales();
        } catch (error) {
            message.error('Failed to delete sale');
        }
    };

    const columns = [
        {
            title: 'Invoice',
            dataIndex: 'invoice_number',
            key: 'invoice_number',
            render: (invoice) => (
                <span className="font-mono font-semibold">{invoice}</span>
            ),
        },
        {
            title: 'Customer',
            dataIndex: 'customer_name',
            key: 'customer_name',
            render: (name) => name || <span className="text-gray-400">Walk-in</span>,
        },
        {
            title: 'Total',
            dataIndex: 'total_price',
            key: 'total_price',
            render: (price) => `Rp ${price.toLocaleString('id-ID')}`,
        },
        {
            title: 'Payment',
            dataIndex: 'payment_method',
            key: 'payment_method',
            render: (method) => (
                <Tag color={paymentMethodColors[method] || 'default'}>{method}</Tag>
            ),
        },
        {
            title: 'Deleted Date',
            dataIndex: 'deleted_at',
            key: 'deleted_at',
            render: (date) => date ? dayjs(date).format('DD MMM YYYY') : '-',
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 200,
            render: (_, record) => (
                <Space>
                    <Button
                        type="primary"
                        icon={<RedoOutlined />}
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
                        okType="danger"
                    >
                        <Button danger icon={<DeleteOutlined />}>
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
                <div className="mb-6">
                    <Row gutter={16} align="middle">
                        <Col>
                            <Button
                                type="text"
                                icon={<ArrowLeftOutlined />}
                                onClick={() => navigate('/sales')}
                            >
                                Back to Sales
                            </Button>
                        </Col>
                        <Col>
                            <Title level={3} className="!mb-0">Sales Trash</Title>
                            <Text type="secondary">Manage deleted sales</Text>
                        </Col>
                    </Row>
                </div>

                {sales.length === 0 ? (
                    <Empty
                        description="No sales in trash"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        className="py-12"
                    />
                ) : (
                    <>
                        <Table
                            columns={columns}
                            dataSource={sales}
                            rowKey="id"
                            loading={loading}
                            pagination={false}
                            scroll={{ x: 800 }}
                        />

                        <div className="mt-4 flex justify-end">
                            <Pagination
                                current={pagination.current}
                                pageSize={pagination.pageSize}
                                total={pagination.total}
                                onChange={(page, pageSize) =>
                                    fetchTrashedSales({ page, per_page: pageSize })
                                }
                                showSizeChanger
                                showQuickJumper
                                showTotal={(total, range) =>
                                    `${range[0]}-${range[1]} of ${total} sales`
                                }
                            />
                        </div>
                    </>
                )}
            </Card>
        </div>
    );
};

export default SalesTrash;