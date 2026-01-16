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
    Select,
    Dropdown,
    Modal,
    Pagination,
    Statistic,
    Badge
} from 'antd';
import {
    SearchOutlined,
    EditOutlined,
    DeleteOutlined,
    EyeOutlined,
    PlusOutlined,
    DownloadOutlined,
    FilterOutlined,
    ReloadOutlined,
    MoreOutlined,
    HistoryOutlined
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../adapters/axiosInstance';
import dayjs from 'dayjs';

const { Search } = Input;
const { Option } = Select;

const Services = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [minCost, setMinCost] = useState('');
    const [maxCost, setMaxCost] = useState('');
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    });
    const [filtersVisible, setFiltersVisible] = useState(false);
    const [exportLoading, setExportLoading] = useState(false);
    const navigate = useNavigate();

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

    const fetchServices = async (params = {}) => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams({
                page: params.page || pagination.current,
                per_page: params.per_page || pagination.pageSize,
                ...(searchText && { search: searchText }),
                ...(statusFilter && { status: statusFilter }),
                ...(minCost && { min_cost: minCost }),
                ...(maxCost && { max_cost: maxCost }),
            }).toString();

            const response = await axiosInstance.get(`/services?${queryParams}`);
            setServices(response.data.data);
            setPagination({
                ...pagination,
                current: response.data.meta.current_page,
                total: response.data.meta.total,
                pageSize: response.data.meta.per_page
            });
        } catch (error) {
            message.error('Failed to fetch services');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchServices();
    }, []);

    const handleSearch = () => {
        fetchServices({ page: 1 });
    };

    const handleReset = () => {
        setSearchText('');
        setStatusFilter('');
        setMinCost('');
        setMaxCost('');
        fetchServices({ page: 1 });
    };

    const handleDelete = async (id) => {
        try {
            await axiosInstance.delete(`/services/${id}`);
            message.success('Service moved to trash');
            fetchServices();
        } catch (error) {
            message.error('Failed to delete service');
        }
    };

    const handleExport = async () => {
        try {
            setExportLoading(true);
            const response = await axiosInstance.get('/services/export', {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `services_${dayjs().format('YYYY-MM-DD_HH-mm')}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();

            message.success('Export successful');
        } catch (error) {
            message.error('Failed to export services');
        } finally {
            setExportLoading(false);
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            const formData = new FormData();
            formData.append('status', status);

            await axiosInstance.patch(`/services/change-status/${id}`, {
                status:status
            });

            message.success('Status updated successfully');
            fetchServices();
        } catch (error) {
            console.log(error);
            message.error('Failed to update status');
        }
    };

    const columns = [
        {
            title: 'Service Code',
            dataIndex: 'service_code',
            key: 'service_code',
            width: 140,
            render: (code) => (
                <span className="font-mono font-semibold text-blue-600">{code}</span>
            ),
        },
        {
            title: 'Customer',
            key: 'customer',
            render: (record) => (
                <div>
                    <div className="font-medium text-gray-900">{record.customer_name}</div>
                    <div className="text-sm text-gray-500">{record.customer_phone}</div>
                </div>
            ),
        },
        {
            title: 'Laptop',
            key: 'laptop',
            render: (record) => (
                <div>
                    <div className="font-medium">{record.laptop_brand}</div>
                    <div className="text-sm text-gray-500">{record.laptop_model}</div>
                </div>
            ),
        },
        {
            title: 'Cost',
            dataIndex: 'total_cost',
            key: 'total_cost',
            width: 150,
            sorter: (a, b) => a.total_cost - b.total_cost,
            render: (cost) => (
                <span className="font-semibold">
          Rp {cost.toLocaleString('id-ID')}
        </span>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            filters: Object.entries(statusLabels).map(([value, label]) => ({
                text: label,
                value: value
            })),
            onFilter: (value, record) => record.status === value,
            render: (status) => (
                <Tag color={statusColors[status] || 'default'} className="capitalize">
                    {statusLabels[status] || status}
                </Tag>
            ),
        },
        {
            title: 'Created Date',
            dataIndex: 'created_at',
            key: 'created_at',
            width: 120,
            render: (date) => dayjs(date).format('DD/MM/YY'),
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 150,
            fixed: 'right',
            render: (_, record) => {
                const menuItems = [
                    {
                        key: 'view',
                        label: 'View Details',
                        icon: <EyeOutlined />,
                        onClick: () => navigate(`/services/${record.id}`)
                    },
                    {
                        key: 'edit',
                        label: 'Edit',
                        icon: <EditOutlined />,
                        onClick: () => navigate(`/services/${record.id}/edit`)
                    },
                    ...(record.status && record.status !== 'cancelled' ? Object.entries(statusLabels)
                        .filter(([status]) => status !== record.status)
                        .map(([status, label]) => ({
                            key: `status_${status}`,
                            label: `Mark as ${label}`,
                            onClick: () => handleStatusUpdate(record.id, status)
                        })) : []),
                    {
                        key: 'delete',
                        label: 'Delete',
                        icon: <DeleteOutlined />,
                        danger: true,
                        onClick: () => handleDelete(record.id)
                    }
                ].filter(item => item);

                return (
                    <Space size="small">
                        <Dropdown
                            menu={{ items: menuItems }}
                            trigger={['click']}
                            placement="bottomRight"
                        >
                            <Button type="text" icon={<MoreOutlined />} />
                        </Dropdown>
                        <Tooltip title="Quick View">
                            <Button
                                type="text"
                                icon={<EyeOutlined />}
                                onClick={() => navigate(`/services/${record.id}`)}
                            />
                        </Tooltip>
                    </Space>
                );
            },
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <Card className="shadow-lg">
                <div className="mb-6">
                    <Row gutter={16} align="middle" justify="space-between">
                        <Col>
                            <h1 className="text-2xl font-bold text-gray-800">Service Management</h1>
                            <p className="text-gray-600">Manage all laptop service requests</p>
                        </Col>
                        <Col>
                            <Space>
                                <Button
                                    icon={<DownloadOutlined />}
                                    loading={exportLoading}
                                    onClick={handleExport}
                                >
                                    Export
                                </Button>
                                <Button
                                    icon={<HistoryOutlined />}
                                    onClick={() => navigate('/services/trashed')}
                                >
                                    Trash
                                </Button>
                                <Button
                                    type="primary"
                                    icon={<PlusOutlined />}
                                    onClick={() => navigate('/services/create')}
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    New Service
                                </Button>
                            </Space>
                        </Col>
                    </Row>
                </div>

                {/* Stats */}
                <div className="mb-6">
                    <Row gutter={16}>
                        {Object.entries(statusLabels).map(([status, label]) => {
                            const count = services.filter(s => s.status === status).length;
                            return (
                                <Col xs={12} sm={6} key={status}>
                                    <Card size="small" className="text-center">
                                        <Statistic
                                            title={label}
                                            value={count}
                                            valueStyle={{ color: statusColors[status] }}
                                        />
                                    </Card>
                                </Col>
                            );
                        })}
                    </Row>
                </div>

                {/* Filters */}
                <div className="mb-6">
                    <Row gutter={16} align="bottom">
                        <Col xs={24} md={8}>
                            <Search
                                placeholder="Search services..."
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                onSearch={handleSearch}
                                enterButton={<SearchOutlined />}
                                size="large"
                                allowClear
                            />
                        </Col>
                        <Col xs={24} md={6}>
                            <Select
                                placeholder="Filter by Status"
                                value={statusFilter || undefined}
                                onChange={setStatusFilter}
                                style={{ width: '100%' }}
                                size="large"
                                allowClear
                            >
                                {Object.entries(statusLabels).map(([value, label]) => (
                                    <Option key={value} value={value}>{label}</Option>
                                ))}
                            </Select>
                        </Col>
                        <Col>
                            <Button
                                type="text"
                                icon={<FilterOutlined />}
                                onClick={() => setFiltersVisible(!filtersVisible)}
                            >
                                More Filters
                            </Button>
                        </Col>
                        <Col>
                            <Button onClick={handleReset} icon={<ReloadOutlined />}>
                                Reset
                            </Button>
                        </Col>
                    </Row>

                    {filtersVisible && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                            <Row gutter={16} align="bottom">
                                <Col xs={12} md={4}>
                                    <Input
                                        placeholder="Min Cost"
                                        value={minCost}
                                        onChange={(e) => setMinCost(e.target.value)}
                                        prefix="Rp"
                                        type="number"
                                        size="large"
                                    />
                                </Col>
                                <Col xs={12} md={4}>
                                    <Input
                                        placeholder="Max Cost"
                                        value={maxCost}
                                        onChange={(e) => setMaxCost(e.target.value)}
                                        prefix="Rp"
                                        type="number"
                                        size="large"
                                    />
                                </Col>
                                <Col xs={24} md={16} className="flex items-end">
                                    <Button type="primary" onClick={handleSearch}>
                                        Apply Filters
                                    </Button>
                                </Col>
                            </Row>
                        </div>
                    )}
                </div>

                {/* Services Table */}
                <Table
                    columns={columns}
                    dataSource={services}
                    rowKey="id"
                    loading={loading}
                    pagination={false}
                    scroll={{ x: 1000 }}
                    rowClassName={(record) => record.status === 'cancelled' ? 'opacity-60' : ''}
                />

                {/* Custom Pagination */}
                <div className="mt-4 flex justify-end">
                    <Pagination
                        current={pagination.current}
                        pageSize={pagination.pageSize}
                        total={pagination.total}
                        onChange={(page, pageSize) =>
                            fetchServices({ page, per_page: pageSize })
                        }
                        showSizeChanger
                        showQuickJumper
                        showTotal={(total, range) =>
                            `${range[0]}-${range[1]} of ${total} services`
                        }
                    />
                </div>
            </Card>
        </div>
    );
};

export default Services;