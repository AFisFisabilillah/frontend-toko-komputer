import React, { useState, useEffect } from 'react';
import {
    Table,
    Button,
    Space,
    Input,
    Card,
    Row,
    Col,
    Popconfirm,
    message,
    Tooltip,
    Avatar,
    Modal,
    Pagination,
    Tag,
    Badge
} from 'antd';
import {
    SearchOutlined,
    EditOutlined,
    DeleteOutlined,
    UserAddOutlined,
    UserOutlined,
    PhoneOutlined,
    CalendarOutlined,
    EyeOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../adapters/axiosInstance';
import CreateAdminModal from '../components/CreateAdminModal';
import EditAdminModal from '../components/EditAdminModal';
import AdminDetailModal from '../components/AdminDetailModal';

const { Search } = Input;

const Admins = () => {
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    });
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [selectedAdmin, setSelectedAdmin] = useState(null);
    const navigate = useNavigate();

    const fetchAdmins = async (params = {}) => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams({
                page: params.page || pagination.current,
                per_page: params.per_page || pagination.pageSize,
                ...(searchText && { search: searchText }),
            }).toString();

            const response = await axiosInstance.get(`/admin?${queryParams}`);
            setAdmins(response.data.data);
            setPagination({
                ...pagination,
                current: response.data.meta.current_page,
                total: response.data.meta.total,
                pageSize: response.data.meta.per_page
            });
        } catch (error) {
            message.error('Failed to fetch admins');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdmins();
    }, []);

    const handleSearch = () => {
        fetchAdmins({ page: 1 });
    };

    const handleCreateSuccess = () => {
        setCreateModalVisible(false);
        fetchAdmins({ page: 1 });
    };

    const handleEditSuccess = () => {
        setEditModalVisible(false);
        setSelectedAdmin(null);
        fetchAdmins();
    };

    const handleDelete = async (id) => {
        try {
            await axiosInstance.delete(`/admin/${id}`);
            message.success('Admin deleted successfully');
            fetchAdmins();
        } catch (error) {
            message.error('Failed to delete admin');
        }
    };

    const showEditModal = (admin) => {
        setSelectedAdmin(admin);
        setEditModalVisible(true);
    };

    const showDetailModal = (admin) => {
        setSelectedAdmin(admin);
        setDetailModalVisible(true);
    };

    const columns = [
        {
            title: 'Admin',
            key: 'admin',
            render: (record) => (
                <div className="flex items-center">
                    <Avatar
                        src={record.profile}
                        icon={<UserOutlined />}
                        size="large"
                        className="mr-3"
                    />
                    <div>
                        <div className="font-medium text-gray-900">{record.fullname}</div>
                        <div className="text-sm text-gray-500">@{record.username}</div>
                    </div>
                </div>
            ),
        },
        {
            title: 'Phone',
            dataIndex: 'phone',
            key: 'phone',
            width: 150,
            render: (phone) => (
                <div className="flex items-center">
                    <PhoneOutlined className="mr-2 text-gray-400" />
                    {phone}
                </div>
            ),
        },
        {
            title: 'Created Date',
            dataIndex: 'created_at',
            key: 'created_at',
            width: 150,
            render: (date) => (
                <div className="flex items-center">
                    <CalendarOutlined className="mr-2 text-gray-400" />
                    {new Date(date).toLocaleDateString('id-ID')}
                </div>
            ),
        },
        {
            title: 'Status',
            key: 'status',
            width: 100,
            render: () => (
                <Tag color="green">Active</Tag>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 150,
            fixed: 'right',
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="View Details">
                        <Button
                            type="text"
                            icon={<EyeOutlined />}
                            onClick={() => showDetailModal(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Edit">
                        <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => showEditModal(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Delete">
                        <Popconfirm
                            title="Delete Admin"
                            description="Are you sure to delete this admin?"
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
                            <h1 className="text-2xl font-bold text-gray-800">Admin Management</h1>
                            <p className="text-gray-600">Manage system administrators</p>
                        </Col>
                        <Col>
                            <Space>
                                <Button
                                    type="primary"
                                    icon={<UserAddOutlined />}
                                    onClick={() => setCreateModalVisible(true)}
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    Add Admin
                                </Button>
                            </Space>
                        </Col>
                    </Row>
                </div>

                {/* Search */}
                <div className="mb-6">
                    <Row gutter={16} align="bottom">
                        <Col xs={24} md={8}>
                            <Search
                                placeholder="Search admins..."
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                onSearch={handleSearch}
                                enterButton={<SearchOutlined />}
                                size="large"
                                allowClear
                            />
                        </Col>
                    </Row>
                </div>

                {/* Admins Table */}
                <Table
                    columns={columns}
                    dataSource={admins}
                    rowKey="id"
                    loading={loading}
                    pagination={false}
                    scroll={{ x: 800 }}
                />

                {/* Custom Pagination */}
                <div className="mt-4 flex justify-end">
                    <Pagination
                        current={pagination.current}
                        pageSize={pagination.pageSize}
                        total={pagination.total}
                        onChange={(page, pageSize) =>
                            fetchAdmins({ page, per_page: pageSize })
                        }
                        showSizeChanger
                        showQuickJumper
                        showTotal={(total, range) =>
                            `${range[0]}-${range[1]} of ${total} admins`
                        }
                    />
                </div>
            </Card>

            {/* Create Admin Modal */}
            <CreateAdminModal
                visible={createModalVisible}
                onCancel={() => setCreateModalVisible(false)}
                onSuccess={handleCreateSuccess}
            />

            {/* Edit Admin Modal */}
            {selectedAdmin && (
                <EditAdminModal
                    visible={editModalVisible}
                    admin={selectedAdmin}
                    onCancel={() => {
                        setEditModalVisible(false);
                        setSelectedAdmin(null);
                    }}
                    onSuccess={handleEditSuccess}
                />
            )}

            {/* Admin Detail Modal */}
            {selectedAdmin && (
                <AdminDetailModal
                    visible={detailModalVisible}
                    admin={selectedAdmin}
                    onCancel={() => {
                        setDetailModalVisible(false);
                        setSelectedAdmin(null);
                    }}
                    onEdit={() => {
                        setDetailModalVisible(false);
                        showEditModal(selectedAdmin);
                    }}
                />
            )}
        </div>
    );
};

export default Admins;