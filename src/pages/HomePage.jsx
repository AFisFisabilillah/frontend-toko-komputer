import React, { useState, useEffect } from 'react';
import {
    Row,
    Col,
    Card,
    Statistic,
    Progress,
    Table,
    Tag,
    Timeline,
    Avatar,
    Badge,
    Button,
    Space,
    Typography,
    Select,
    DatePicker,
    Divider,
    List,
    Tooltip,
    Spin,
    Empty
} from 'antd';
import {
    ShoppingOutlined,
    LaptopOutlined,
    TeamOutlined,
    DollarOutlined,
    ArrowUpOutlined,
    ArrowDownOutlined,
    LineChartOutlined,
    PieChartOutlined,
    CalendarOutlined,
    EyeOutlined,
    DownloadOutlined,
    ReloadOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    ExclamationCircleOutlined,
    UserOutlined,
    DatabaseOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../adapters/axiosInstance';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const HomePage = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [timeRange, setTimeRange] = useState('');
    const [dateRange, setDateRange] = useState(null);
    const navigate = useNavigate();

    // Warna untuk chart
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
    const statusColors = {
        received: '#1890ff',
        process: '#fa8c16',
        done: '#52c41a',
        taken: '#722ed1',
        cancelled: '#ff4d4f'
    };

    // Fetch data dari API
    useEffect(() => {
        fetchDashboardData();
    }, [timeRange, dateRange]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            const params = new URLSearchParams();
            if(timeRange){
                params.append('range', timeRange);

            }

            if (dateRange && dateRange[0] && dateRange[1]) {
                params.append('start_date', dateRange[0].format('YYYY-MM-DD'));
                params.append('end_date', dateRange[1].format('YYYY-MM-DD'));
            }

            const response = await axiosInstance.get(`/dashboard?${params.toString()}`);
            setStats(response.data.dashboard);
            console.log(response.data.dashboard)
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            // Fallback ke data kosong jika API error
            setStats({
                overview: { totalProducts: 0, totalServices: 0, totalAdmins: 0, totalRevenue: 0 },
                recentActivities: [],
                serviceStats: { total: 0, byStatus: {} },
                productStats: { total: 0, lowStock: 0, outOfStock: 0, topSelling: [] },
                revenueData: { monthly: [], categories: [] }
            });
        } finally {
            setLoading(false);
        }
    };

    // Format currency
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(value);
    };

    // Format persentase
    const formatPercent = (value) => {
        return `${value.toFixed(1)}%`;
    };

    // Hitung persentase perubahan
    const calculateChange = () => {
        if (!stats || !stats.revenueData.monthly || stats.revenueData.monthly.length < 2) {
            return { value: 0, trend: 'stable' };
        }

        const current = stats.revenueData.monthly[stats.revenueData.monthly.length - 1]?.revenue || 0;
        const previous = stats.revenueData.monthly[stats.revenueData.monthly.length - 2]?.revenue || 1;

        const change = ((current - previous) / previous) * 100;

        return {
            value: Math.abs(change),
            trend: change > 0 ? 'up' : change < 0 ? 'down' : 'stable'
        };
    };

    // Statistic cards
    const statisticCards = stats ? [
        {
            title: 'Total Products',
            value: stats.overview.totalProducts,
            icon: <ShoppingOutlined />,
            color: '#1890ff',
            change: '+12%', // Ini bisa dihitung dari data historis jika ada
            trend: 'up',
            path: '/products'
        },
        {
            title: 'Total Services',
            value: stats.overview.totalServices,
            icon: <LaptopOutlined />,
            color: '#52c41a',
            change: '+8%',
            trend: 'up',
            path: '/services'
        },
        {
            title: 'Total Admins',
            value: stats.overview.totalAdmins,
            icon: <TeamOutlined />,
            color: '#722ed1',
            change: '+2',
            trend: 'up',
            path: '/admins'
        },
        {
            title: 'Total Revenue',
            value: formatCurrency(stats.overview.totalRevenue),
            icon: <DollarOutlined />,
            color: '#fa8c16',
            change: calculateChange().trend === 'up' ? `+${calculateChange().value.toFixed(1)}%` :
                calculateChange().trend === 'down' ? `-${calculateChange().value.toFixed(1)}%` : '0%',
            trend: calculateChange().trend,
            path: '/services'
        }
    ] : [];

    // Service status data untuk chart
    const serviceStatusData = stats ? Object.entries(stats.serviceStats.byStatus).map(([status, count]) => ({
        name: status.charAt(0).toUpperCase() + status.slice(1),
        value: count,
        color: statusColors[status]
    })) : [];

    // Revenue categories data untuk chart
    const revenueCategoriesData = stats ? stats.revenueData.categories.map((cat, index) => ({
        name: cat.category,
        value: cat.value,
        color: COLORS[index % COLORS.length]
    })) : [];

    // Top selling products columns
    const topSellingColumns = [
        {
            title: 'Product',
            dataIndex: 'name',
            key: 'name',
            render: (text) => (
                <div className="flex items-center">
                    <Avatar
                        size="small"
                        className="mr-2"
                        style={{ backgroundColor: COLORS[Math.floor(Math.random() * COLORS.length)] }}
                    >
                        {text.charAt(0)}
                    </Avatar>
                    <span className="font-medium">{text}</span>
                </div>
            ),
        },
        {
            title: 'Sold',
            dataIndex: 'sold',
            key: 'sold',
            render: (value) => (
                <Tag color="green">{value} units</Tag>
            ),
        },
        {
            title: 'Status',
            key: 'status',
            render: () => (
                <Tag color="green">Active</Tag>
            ),
        },
    ];

    // Recent activities timeline items
    const activityItems = stats ? stats.recentActivities.map((activity) => {
        let icon;
        let color;

        switch (activity.type) {
            case 'service':
                icon = <LaptopOutlined />;
                color = '#1890ff';
                break;
            case 'product':
                icon = <ShoppingOutlined />;
                color = '#52c41a';
                break;
            case 'admin':
                icon = <TeamOutlined />;
                color = '#722ed1';
                break;
            default:
                icon = <CheckCircleOutlined />;
                color = '#1890ff';
        }

        return {
            color,
            dot: <Avatar size="small" icon={icon} style={{ backgroundColor: color }} />,
            children: (
                <div className="ml-4">
                    <div className="flex justify-between">
                        <Text strong>{activity.title}</Text>
                        <Text type="secondary" className="text-xs">{activity.time}</Text>
                    </div>
                    {activity.description && (
                        <Text type="secondary" className="text-sm">{activity.description}</Text>
                    )}
                    <Tag
                        color={statusColors[activity.status] || 'default'}
                        className="mt-1"
                    >
                        {activity.status}
                    </Tag>
                </div>
            ),
        };
    }) : [];

    // Handle date range change
    const handleDateRangeChange = (dates) => {
        setDateRange(dates);
        if (dates && dates[0] && dates[1]) {
            setTimeRange('custom');
        }
    };

    // Handle time range change
    const handleTimeRangeChange = (value) => {
        setTimeRange(value);
        if (value !== 'custom') {
            setDateRange(null);
        }
    };

    if (loading && !stats) {
        return (
            <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
                <Spin size="large" tip="Loading dashboard data..." />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <Row justify="space-between" align="middle" gutter={[16, 16]}>
                        <Col xs={24} md={12}>
                            <Title level={2} className="!mb-2">Dashboard Overview</Title>
                            <Text type="secondary">
                                {timeRange === 'today' ? "Today's Statistics" :
                                    timeRange === 'this_month' ? "This Month's Statistics" :
                                        timeRange === 'this_year' ? "This Year's Statistics" :
                                            dateRange ? `Statistics from ${dateRange[0]?.format('DD MMM YYYY')} to ${dateRange[1]?.format('DD MMM YYYY')}` :
                                                "Real-time Statistics"}
                            </Text>
                        </Col>
                        <Col xs={24} md={12} className="text-right">
                            <Space wrap>
                                <Select
                                    value={timeRange}
                                    onChange={handleTimeRangeChange}
                                    style={{ width: 140 }}
                                    size="large"
                                >
                                    <Option value="today">Today</Option>
                                    <Option value="this_month">This Month</Option>
                                    <Option value="this_year">This Year</Option>
                                    <Option value="custom">Custom Range</Option>
                                </Select>

                                {timeRange === 'custom' && (
                                    <RangePicker
                                        size="large"
                                        value={dateRange}
                                        onChange={handleDateRangeChange}
                                        suffixIcon={<CalendarOutlined />}
                                    />
                                )}

                                <Button
                                    icon={<ReloadOutlined />}
                                    onClick={fetchDashboardData}
                                    loading={loading}
                                >
                                    Refresh
                                </Button>
                            </Space>
                        </Col>
                    </Row>
                </div>

                {/* Statistic Cards */}
                <Row gutter={[16, 16]} className="mb-6">
                    {statisticCards.map((card, index) => (
                        <Col xs={24} sm={12} lg={6} key={index}>
                            <Card
                                className="shadow-sm hover:shadow-md transition-shadow cursor-pointer dashboard-stat-card"
                                onClick={() => navigate(card.path)}
                                loading={loading}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <Text type="secondary" className="text-sm">{card.title}</Text>
                                        <Title level={3} className="!my-2 !text-2xl">{card.value}</Title>
                                        <div className="flex items-center">
                                            {card.trend === 'up' ? (
                                                <ArrowUpOutlined className="text-green-500 mr-1" />
                                            ) : card.trend === 'down' ? (
                                                <ArrowDownOutlined className="text-red-500 mr-1" />
                                            ) : null}
                                            <Text type={card.trend === 'up' ? 'success' : card.trend === 'down' ? 'danger' : 'secondary'}>
                                                {card.change} from last period
                                            </Text>
                                        </div>
                                    </div>
                                    <div
                                        className="p-3 rounded-lg"
                                        style={{ backgroundColor: `${card.color}15` }}
                                    >
                                        <div
                                            className="text-2xl"
                                            style={{ color: card.color }}
                                        >
                                            {card.icon}
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </Col>
                    ))}
                </Row>

                {/* Charts Section */}
                <Row gutter={[16, 16]} className="mb-6">
                    {/* Revenue Chart */}
                    <Col xs={24} lg={16}>
                        <Card
                            title={
                                <Space>
                                    <LineChartOutlined />
                                    <span>Revenue Overview</span>
                                </Space>
                            }
                            className="shadow-sm h-full"
                            extra={
                                <Button type="link" icon={<DownloadOutlined />}>
                                    Export
                                </Button>
                            }
                            loading={loading}
                        >
                            {stats && stats.revenueData.monthly.length > 0 ? (
                                <div className="chart-container" style={{ height: 300 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart
                                            data={stats.revenueData.monthly}
                                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                            <XAxis dataKey="month" stroke="#666" />
                                            <YAxis
                                                stroke="#666"
                                                tickFormatter={(value) => `Rp${value > 1000000 ? `${(value / 1000000).toFixed(0)}M` : `${(value / 1000).toFixed(0)}K`}`}
                                            />
                                            <RechartsTooltip
                                                formatter={(value) => [formatCurrency(value), 'Revenue']}
                                                labelFormatter={(label) => `Month: ${label}`}
                                            />
                                            <Legend />
                                            <Line
                                                type="monotone"
                                                dataKey="revenue"
                                                name="Revenue"
                                                stroke="#1890ff"
                                                strokeWidth={3}
                                                dot={{ r: 4 }}
                                                activeDot={{ r: 6 }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <Empty
                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                    description="No revenue data available"
                                    className="py-12"
                                />
                            )}
                        </Card>
                    </Col>

                    {/* Service Status Distribution */}
                    <Col xs={24} lg={8}>
                        <Card
                            title={
                                <Space>
                                    <PieChartOutlined />
                                    <span>Service Status Distribution</span>
                                </Space>
                            }
                            className="shadow-sm h-full"
                            loading={loading}
                        >
                            {serviceStatusData.length > 0 ? (
                                <>
                                    <div className="chart-container" style={{ height: 250 }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={serviceStatusData}
                                                    cx="50%"
                                                    cy="50%"
                                                    labelLine={false}
                                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                                    outerRadius={70}
                                                    fill="#8884d8"
                                                    dataKey="value"
                                                >
                                                    {serviceStatusData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <RechartsTooltip formatter={(value) => [`${value} services`, 'Count']} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>

                                    <div className="mt-4 grid grid-cols-2 gap-2">
                                        {serviceStatusData.map((item, index) => (
                                            <div key={index} className="flex items-center">
                                                <div
                                                    className="w-3 h-3 rounded-full mr-2"
                                                    style={{ backgroundColor: item.color }}
                                                />
                                                <Text className="text-sm">{item.name}</Text>
                                                <Text strong className="ml-auto">{item.value}</Text>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <Empty
                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                    description="No service data available"
                                    className="py-8"
                                />
                            )}
                        </Card>
                    </Col>
                </Row>

                {/* Bottom Section */}
                <Row gutter={[16, 16]}>
                    {/* Top Selling Products */}
                    <Col xs={24} lg={12}>
                        <Card
                            title={
                                <Space>
                                    <ShoppingOutlined />
                                    <span>Top Selling Products</span>
                                </Space>
                            }
                            className="shadow-sm h-full"
                            extra={
                                <Button type="link" onClick={() => navigate('/products')}>
                                    View All
                                </Button>
                            }
                            loading={loading}
                        >
                            {stats && stats.productStats.topSelling.length > 0 ? (
                                <>
                                    <Table
                                        columns={topSellingColumns}
                                        dataSource={stats.productStats.topSelling}
                                        rowKey="name"
                                        pagination={false}
                                        size="small"
                                    />

                                    <Divider />

                                    <Row gutter={16}>
                                        <Col span={12}>
                                            <Card size="small" className="text-center">
                                                <Statistic
                                                    title="Low Stock"
                                                    value={stats.productStats.lowStock}
                                                    valueStyle={{ color: '#fa8c16' }}
                                                    prefix={<ExclamationCircleOutlined />}
                                                />
                                            </Card>
                                        </Col>
                                        <Col span={12}>
                                            <Card size="small" className="text-center">
                                                <Statistic
                                                    title="Out of Stock"
                                                    value={stats.productStats.outOfStock}
                                                    valueStyle={{ color: '#ff4d4f' }}
                                                    prefix={<ExclamationCircleOutlined />}
                                                />
                                            </Card>
                                        </Col>
                                    </Row>
                                </>
                            ) : (
                                <Empty
                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                    description="No product sales data available"
                                    className="py-8"
                                />
                            )}
                        </Card>
                    </Col>

                    {/* Recent Activities */}
                    <Col xs={24} lg={12}>
                        <Card
                            title={
                                <Space>
                                    <ClockCircleOutlined />
                                    <span>Recent Activities</span>
                                </Space>
                            }
                            className="shadow-sm h-full"
                            extra={
                                <Button type="link" onClick={() => navigate('/services')}>
                                    View All
                                </Button>
                            }
                            loading={loading}
                        >
                            {activityItems.length > 0 ? (
                                <>
                                    <Timeline
                                        items={activityItems}
                                        className="mt-4"
                                    />

                                    <Divider />

                                    <div className="text-center">
                                        <Button
                                            type="primary"
                                            onClick={() => navigate('/services/create')}
                                            className="bg-blue-600 hover:bg-blue-700"
                                        >
                                            <LaptopOutlined className="mr-2" />
                                            Create New Service
                                        </Button>
                                        <Button
                                            className="ml-3"
                                            onClick={() => navigate('/products/create')}
                                        >
                                            <ShoppingOutlined className="mr-2" />
                                            Add New Product
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                <Empty
                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                    description="No recent activities"
                                    className="py-8"
                                />
                            )}
                        </Card>
                    </Col>
                </Row>

                {/* Quick Stats & Revenue Categories */}
                <Row gutter={[16, 16]} className="mt-6">
                    <Col xs={24} lg={16}>
                        <Card title="Service Status Overview" className="shadow-sm" loading={loading}>
                            {stats && Object.keys(stats.serviceStats.byStatus).length > 0 ? (
                                <Row gutter={[16, 16]}>
                                    {Object.entries(stats.serviceStats.byStatus).map(([status, count]) => (
                                        <Col xs={12} sm={4} key={status}>
                                            <div className="text-center">
                                                <Badge
                                                    count={count}
                                                    style={{
                                                        backgroundColor: statusColors[status],
                                                        fontSize: '14px'
                                                    }}
                                                    className="mb-2"
                                                />
                                                <div className="text-sm font-medium capitalize">{status}</div>
                                                <div className="text-xs text-gray-500">
                                                    {stats.serviceStats.total > 0 ?
                                                        `${((count / stats.serviceStats.total) * 100).toFixed(1)}% of total` :
                                                        '0% of total'
                                                    }
                                                </div>
                                            </div>
                                        </Col>
                                    ))}
                                    <Col xs={12} sm={4}>
                                        <div className="text-center">
                                            <Progress
                                                type="circle"
                                                percent={stats.serviceStats.total > 0 ?
                                                    Math.round((stats.serviceStats.byStatus.done / stats.serviceStats.total) * 100) : 0
                                                }
                                                width={60}
                                                strokeColor="#52c41a"
                                                className="mb-2"
                                            />
                                            <div className="text-sm font-medium">Completion Rate</div>
                                        </div>
                                    </Col>
                                </Row>
                            ) : (
                                <Empty
                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                    description="No service status data"
                                    className="py-8"
                                />
                            )}
                        </Card>
                    </Col>

                    <Col xs={24} lg={8}>
                        <Card
                            title="Revenue Categories"
                            className="shadow-sm"
                            loading={loading}
                        >
                            {revenueCategoriesData.length > 0 ? (
                                <>
                                    <div className="chart-container" style={{ height: 200 }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={revenueCategoriesData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={40}
                                                    outerRadius={70}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                                >
                                                    {revenueCategoriesData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <RechartsTooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>

                                    <div className="mt-4 text-center">
                                        <Text type="secondary">Revenue distribution by category</Text>
                                    </div>
                                </>
                            ) : (
                                <Empty
                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                    description="No revenue category data"
                                    className="py-8"
                                />
                            )}
                        </Card>
                    </Col>
                </Row>

                {/* Quick Actions */}
                <Card className="mt-6 shadow-sm">
                    <Title level={4} className="!mb-4">Quick Actions</Title>
                    <Row gutter={[16, 16]}>
                        <Col xs={12} md={6}>
                            <Card
                                hoverable
                                className="text-center"
                                onClick={() => navigate('/services/create')}
                            >
                                <LaptopOutlined className="text-3xl text-blue-500 mb-3" />
                                <div className="font-medium">New Service</div>
                                <Text type="secondary" className="text-sm">Create service request</Text>
                            </Card>
                        </Col>
                        <Col xs={12} md={6}>
                            <Card
                                hoverable
                                className="text-center"
                                onClick={() => navigate('/products/create')}
                            >
                                <ShoppingOutlined className="text-3xl text-green-500 mb-3" />
                                <div className="font-medium">Add Product</div>
                                <Text type="secondary" className="text-sm">Add new product</Text>
                            </Card>
                        </Col>
                        <Col xs={12} md={6}>
                            <Card
                                hoverable
                                className="text-center"
                                onClick={() => navigate('/admins')}
                            >
                                <TeamOutlined className="text-3xl text-purple-500 mb-3" />
                                <div className="font-medium">Manage Admins</div>
                                <Text type="secondary" className="text-sm">View all admins</Text>
                            </Card>
                        </Col>
                        <Col xs={12} md={6}>
                            <Card
                                hoverable
                                className="text-center"
                                onClick={() => navigate('/services/import')}
                            >
                                <DatabaseOutlined className="text-3xl text-orange-500 mb-3" />
                                <div className="font-medium">Bulk Import</div>
                                <Text type="secondary" className="text-sm">Import services/products</Text>
                            </Card>
                        </Col>
                    </Row>
                </Card>

                {/* Data Source Info */}
                <div className="mt-6 text-center">
                    <Text type="secondary" className="text-sm">
                        Data last updated: {dayjs().format('DD MMMM YYYY HH:mm:ss')}
                    </Text>
                </div>
            </div>
        </div>
    );
};

export default HomePage;