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
    DatePicker,
    Select,
    Dropdown,
    Modal,
    Pagination,
    Badge,
    InputNumber,
    Checkbox, Typography
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
    HistoryOutlined,
    MoreOutlined,
    ShoppingCartOutlined,
    ImportOutlined,
    ExportOutlined,
    PrinterOutlined
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../adapters/axiosInstance';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';

const { Search } = Input;
const { RangePicker } = DatePicker;
const { Option } = Select;
const { Text } = Typography;

const Sales = () => {
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [sortField, setSortField] = useState('');
    const [sortOrder, setSortOrder] = useState('');
    const [dateRange, setDateRange] = useState(null);
    const [minTotal, setMinTotal] = useState('');
    const [maxTotal, setMaxTotal] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('');
    const [filtersVisible, setFiltersVisible] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    });
    const [exportLoading, setExportLoading] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const navigate = useNavigate();

    const paymentMethodColors = {
        cash: 'green',
        transfer: 'blue',
        qris: 'purple',
        debit_card: 'orange',
        credit_card: 'red'
    };

    const paymentMethodLabels = {
        cash: 'Cash',
        transfer: 'Transfer',
        qris: 'QRIS',
        debit_card: 'Debit Card',
        credit_card: 'Credit Card'
    };

    const fetchSales = async (params = {}) => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams({
                page: params.page || pagination.current,
                per_page: params.per_page || pagination.pageSize,
                ...(searchText && { search: searchText }),
                ...(sortField && { sort: sortField }),
                ...(sortOrder && { order: sortOrder }),
                ...(dateRange && dateRange[0] && { date_from: dateRange[0].format('YYYY-MM-DD') }),
                ...(dateRange && dateRange[1] && { date_to: dateRange[1].format('YYYY-MM-DD') }),
                ...(minTotal && { min_total: minTotal }),
                ...(maxTotal && { max_total: maxTotal }),
                ...(paymentMethod && { payment_method: paymentMethod }),
            }).toString();

            const response = await axiosInstance.get(`/sales?${queryParams}`);
            setSales(response.data.data);
            setPagination({
                ...pagination,
                current: response.data.meta.current_page,
                total: response.data.meta.total,
                pageSize: response.data.meta.per_page
            });
        } catch (error) {
            message.error('Failed to fetch sales');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSales();
    }, []);

    const handleSearch = () => {
        fetchSales({ page: 1 });
    };

    const handleReset = () => {
        setSearchText('');
        setSortField('');
        setSortOrder('');
        setDateRange(null);
        setMinTotal('');
        setMaxTotal('');
        setPaymentMethod('');
        setSelectedRows([]);
        fetchSales({ page: 1 });
    };

    const handleDelete = async (id) => {
        try {
            await axiosInstance.delete(`/sales/${id}`);
            message.success('Sale moved to trash');
            fetchSales();
        } catch (error) {
            message.error('Failed to delete sale');
        }
    };

    const handleBulkDelete = async () => {
        if (selectedRows.length === 0) {
            message.warning('Please select sales to delete');
            return;
        }

        try {
            await axiosInstance.delete('/sales/deletes', {
                data: { sales: selectedRows }
            });
            message.success(`${selectedRows.length} sales deleted successfully`);
            setSelectedRows([]);
            setDeleteModalVisible(false);
            fetchSales();
        } catch (error) {
            message.error('Failed to delete sales');
        }
    };

    const handleExport = async () => {
        try {
            setExportLoading(true);
            const response = await axiosInstance.get('/sales/export', {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `sales_${dayjs().format('YYYY-MM-DD_HH-mm')}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();

            message.success('Export successful');
        } catch (error) {
            message.error('Failed to export sales');
        } finally {
            setExportLoading(false);
        }
    };

    const handlePrintReceipt = (sale) => {
        // Implement print functionality
        message.info('Print receipt functionality coming soon');
    };

    const columns = [
        {
            title: 'Invoice',
            dataIndex: 'invoice_number',
            key: 'invoice_number',
            width: 200,
            render: (invoice) => (
                <span className="font-mono font-semibold text-blue-600">{invoice}</span>
            ),
            sorter: true,
        },
        {
            title: 'Customer',
            dataIndex: 'customer_name',
            key: 'customer_name',
            render: (name) => name || <span className="text-gray-400">Walk-in Customer</span>,
        },
        {
            title: 'Total',
            dataIndex: 'total_price',
            key: 'total_price',
            width: 150,
            sorter: true,
            render: (price) => (
                <span className="font-semibold">
          Rp {price.toLocaleString('id-ID')}
        </span>
            ),
        },
        {
            title: 'Payment',
            dataIndex: 'payment_method',
            key: 'payment_method',
            width: 120,
            render: (method) => (
                <Tag color={paymentMethodColors[method] || 'default'}>
                    {paymentMethodLabels[method] || method}
                </Tag>
            ),
        },
        {
            title: 'Date',
            dataIndex: 'created_at',
            key: 'created_at',
            width: 150,
            render: (date) => dayjs(date).format('DD/MM/YY HH:mm'),
            sorter: true,
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 180,
            render: (_, record) => {
                const menuItems = [
                    {
                        key: 'view',
                        label: 'View Details',
                        icon: <EyeOutlined />,
                        onClick: () => navigate(`/sales/${record.id}`)
                    },
                    {
                        key: 'edit',
                        label: 'Edit',
                        icon: <EditOutlined />,
                        onClick: () => navigate(`/sales/${record.id}/edit`)
                    },
                    {
                        key: 'print',
                        label: 'Print Receipt',
                        icon: <PrinterOutlined />,
                        onClick: () => handlePrintReceipt(record)
                    },
                    {
                        key: 'delete',
                        label: 'Delete',
                        icon: <DeleteOutlined />,
                        danger: true,
                        onClick: () => handleDelete(record.id)
                    }
                ];

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
                                onClick={() => navigate(`/sales/${record.id}`)}
                            />
                        </Tooltip>
                        <Tooltip title="Print Receipt">
                            <Button
                                type="text"
                                icon={<PrinterOutlined />}
                                onClick={() => handlePrintReceipt(record)}
                            />
                        </Tooltip>
                    </Space>
                );
            },
        },
    ];

    const rowSelection = {
        selectedRowKeys: selectedRows,
        onChange: (selectedRowKeys) => {
            setSelectedRows(selectedRowKeys);
        },
        getCheckboxProps: (record) => ({
            disabled: false,
            name: record.invoice_number,
        }),
    };

    const handleTableChange = (pagination, filters, sorter) => {
        if (sorter.field) {
            setSortField(sorter.field);
            setSortOrder(sorter.order === 'ascend' ? 'asc' : 'desc');
        }
        fetchSales({
            page: pagination.current,
            per_page: pagination.pageSize,
            sort: sorter.field,
            order: sorter.order === 'ascend' ? 'asc' : 'desc'
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <Card className="shadow-lg">
                <div className="mb-6">
                    <Row gutter={16} align="middle" justify="space-between">
                        <Col>
                            <h1 className="text-2xl font-bold text-gray-800">Sales Management</h1>
                            <p className="text-gray-600">Manage all sales transactions</p>
                        </Col>
                        <Col>
                            <Space wrap>
                                {selectedRows.length > 0 && (
                                    <Button
                                        danger
                                        icon={<DeleteOutlined />}
                                        onClick={() => setDeleteModalVisible(true)}
                                    >
                                        Delete Selected ({selectedRows.length})
                                    </Button>
                                )}
                                <Button
                                    icon={<ExportOutlined />}
                                    loading={exportLoading}
                                    onClick={handleExport}
                                >
                                    Export
                                </Button>
                                <Button
                                    icon={<ImportOutlined />}
                                    onClick={() => navigate('/sales/import')}
                                >
                                    Import
                                </Button>
                                <Button
                                    icon={<HistoryOutlined />}
                                    onClick={() => navigate('/sales/trash')}
                                >
                                    Trash
                                </Button>
                                <Button
                                    type="primary"
                                    icon={<PlusOutlined />}
                                    onClick={() => navigate('/sales/create')}
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    New Sale
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
                                placeholder="Search invoice or customer..."
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                onSearch={handleSearch}
                                enterButton={<SearchOutlined />}
                                size="large"
                                allowClear
                            />
                        </Col>
                        <Col xs={24} md={4}>
                            <Select
                                placeholder="Payment Method"
                                value={paymentMethod || undefined}
                                onChange={setPaymentMethod}
                                style={{ width: '100%' }}
                                size="large"
                                allowClear
                            >
                                {Object.entries(paymentMethodLabels).map(([value, label]) => (
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
                                <Col xs={24} md={8}>
                                    <RangePicker
                                        style={{ width: '100%' }}
                                        value={dateRange}
                                        onChange={setDateRange}
                                        size="large"
                                    />
                                </Col>
                                <Col xs={12} md={4}>
                                    <InputNumber
                                        placeholder="Min Total"
                                        value={minTotal}
                                        onChange={setMinTotal}
                                        prefix="Rp"
                                        style={{ width: '100%' }}
                                        size="large"
                                        min={0}
                                    />
                                </Col>
                                <Col xs={12} md={4}>
                                    <InputNumber
                                        placeholder="Max Total"
                                        value={maxTotal}
                                        onChange={setMaxTotal}
                                        prefix="Rp"
                                        style={{ width: '100%' }}
                                        size="large"
                                        min={0}
                                    />
                                </Col>
                                <Col xs={24} md={8} className="flex items-end">
                                    <Button type="primary" onClick={handleSearch}>
                                        Apply Filters
                                    </Button>
                                </Col>
                            </Row>
                        </div>
                    )}
                </div>

                {/* Sales Table */}
                <Table
                    columns={columns}
                    dataSource={sales}
                    rowKey="id"
                    loading={loading}
                    pagination={false}
                    scroll={{ x: 1000 }}
                    rowSelection={rowSelection}
                    onChange={handleTableChange}
                />

                {/* Custom Pagination */}
                <div className="mt-4 flex justify-between items-center">
                    <div>
                        <Text type="secondary">
                            Showing {sales.length} of {pagination.total} sales
                            {selectedRows.length > 0 && ` • ${selectedRows.length} selected`}
                        </Text>
                    </div>
                    <Pagination
                        current={pagination.current}
                        pageSize={pagination.pageSize}
                        total={pagination.total}
                        onChange={(page, pageSize) =>
                            fetchSales({ page, per_page: pageSize })
                        }
                        showSizeChanger
                        showQuickJumper
                        showTotal={(total, range) =>
                            `${range[0]}-${range[1]} of ${total} sales`
                        }
                    />
                </div>
            </Card>

            {/* Bulk Delete Modal */}
            <Modal
                title="Delete Selected Sales"
                open={deleteModalVisible}
                onCancel={() => setDeleteModalVisible(false)}
                footer={[
                    <Button key="cancel" onClick={() => setDeleteModalVisible(false)}>
                        Cancel
                    </Button>,
                    <Button
                        key="delete"
                        type="primary"
                        danger
                        onClick={handleBulkDelete}
                    >
                        Delete {selectedRows.length} Sales
                    </Button>,
                ]}
            >
                <p>Are you sure you want to delete {selectedRows.length} selected sales?</p>
                <p className="text-red-500 font-semibold">This action cannot be undone.</p>
            </Modal>
        </div>
    );
};

export default Sales;