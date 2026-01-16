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
    Pagination
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

const ServicesTrash = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    });
    const navigate = useNavigate();

    const statusColors = {
        received: 'blue',
        process: 'orange',
        done: 'green',
        taken: 'purple',
        cancelled: 'red'
    };

    const fetchTrashedServices = async (params = {}) => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams({
                page: params.page || pagination.current,
                per_page: params.per_page || pagination.pageSize,
            }).toString();

            const response = await axiosInstance.get(`/services/trashed?${queryParams}`);
            setServices(response.data.data);
            setPagination({
                ...pagination,
                current: response.data.meta.current_page,
                total: response.data.meta.total,
                pageSize: response.data.meta.per_page
            });
        } catch (error) {
            message.error('Failed to fetch trashed services');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTrashedServices();
    }, []);

    const handleRestore = async (id) => {
        try {
            await axiosInstance.post(`/services/${id}/restore`);
            message.success('Service restored successfully');
            fetchTrashedServices();
        } catch (error) {
            message.error('Failed to restore service');
        }
    };

    const handleForceDelete = async (id) => {
        try {
            await axiosInstance.delete(`/services/${id}/force`);
            message.success('Service permanently deleted');
            fetchTrashedServices();
        } catch (error) {
            message.error('Failed to delete service');
        }
    };

    const columns = [
        {
            title: 'Service Code',
            dataIndex: 'service_code',
            key: 'service_code',
            render: (code) => (
                <span className="font-mono font-semibold">{code}</span>
            ),
        },
        {
            title: 'Customer',
            key: 'customer',
            render: (record) => (
                <div>
                    <div className="font-medium">{record.customer_name}</div>
                    <div className="text-sm text-gray-500">{record.customer_phone}</div>
                </div>
            ),
        },
        {
            title: 'Laptop',
            key: 'laptop',
            render: (record) => (
                <div>
                    <div>{record.laptop_brand}</div>
                    <div className="text-sm text-gray-500">{record.laptop_model}</div>
                </div>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={statusColors[status] || 'default'}>{status}</Tag>
            ),
        },
        {
            title: 'Total Cost',
            dataIndex: 'total_cost',
            key: 'total_cost',
            render: (cost) => `Rp ${cost.toLocaleString('id-ID')}`,
        },
        {
            title: 'Deleted At',
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
                    <Space direction="vertical" size="small">
                        <Space>
                            <Button
                                type="text"
                                icon={<ArrowLeftOutlined />}
                                onClick={() => navigate('/services')}
                            >
                                Back to Services
                            </Button>
                            <h1 className="text-2xl font-bold text-gray-800">Service Trash</h1>
                        </Space>
                        <p className="text-gray-600">Manage deleted services</p>
                    </Space>
                </div>

                {services.length === 0 ? (
                    <Empty
                        description="No services in trash"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        className="py-12"
                    />
                ) : (
                    <>
                        <Table
                            columns={columns}
                            dataSource={services}
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
                                    fetchTrashedServices({ page, per_page: pageSize })
                                }
                                showSizeChanger
                                showQuickJumper
                                showTotal={(total, range) =>
                                    `${range[0]}-${range[1]} of ${total} services`
                                }
                            />
                        </div>
                    </>
                )}
            </Card>
        </div>
    );
};

export default ServicesTrash;