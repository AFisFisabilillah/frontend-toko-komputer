import React, { useState, useEffect, useRef } from 'react';
import {
    Card,
    Button,
    Row,
    Col,
    Typography,
    Space,
    Tag,
    Descriptions,
    Skeleton,
    message,
    Modal,
    Divider,
    Table,
    Badge,
    Alert,
    Statistic,
    Dropdown,
    Menu,
    Popover
} from 'antd';
import {
    ArrowLeftOutlined,
    EditOutlined,
    DeleteOutlined,
    PrinterOutlined,
    CopyOutlined,
    DownloadOutlined,
    FileTextOutlined,
    DollarOutlined,
    UserOutlined,
    CalendarOutlined,
    ShoppingCartOutlined,
    FilePdfOutlined,
    FileExcelOutlined,
    FileImageOutlined,
    MoreOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../adapters/axiosInstance';
import dayjs from 'dayjs';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

const { Title, Text } = Typography;

const SaleDetail = () => {
    const [sale, setSale] = useState(null);
    const [loading, setLoading] = useState(true);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const navigate = useNavigate();
    const { id } = useParams();
    const invoiceRef = useRef();

    const paymentMethodColors = {
        cash: 'green',
        transfer: 'blue',
        qris: 'purple',
        debit_card: 'orange',
        credit_card: 'red'
    };

    const paymentMethodLabels = {
        cash: 'Cash',
        transfer: 'Bank Transfer',
        qris: 'QRIS',
        debit_card: 'Debit Card',
        credit_card: 'Credit Card'
    };

    useEffect(() => {
        fetchSale();
    }, [id]);

    const fetchSale = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(`/sales/${id}`);
            setSale(response.data.data);
        } catch (error) {
            message.error('Failed to fetch sale details');
            navigate('/sales');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            await axiosInstance.delete(`/sales/${id}`);
            message.success('Sale moved to trash');
            navigate('/sales');
        } catch (error) {
            message.error('Failed to delete sale');
        }
    };

    const handlePrint = () => {
        const printContent = document.getElementById('invoice-print');
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Invoice ${sale.invoice_number}</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        .header { text-align: center; margin-bottom: 30px; }
                        .company-name { font-size: 24px; font-weight: bold; }
                        .invoice-title { font-size: 20px; margin: 10px 0; }
                        .info-section { margin: 20px 0; }
                        .info-row { display: flex; justify-content: space-between; margin: 5px 0; }
                        .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                        .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        .table th { background-color: #f4f4f4; }
                        .total-section { text-align: right; margin-top: 30px; }
                        .footer { margin-top: 50px; text-align: center; color: #666; }
                        @media print {
                            .no-print { display: none; }
                        }
                    </style>
                </head>
                <body>
                    ${printContent.innerHTML}
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
    };

    const handleCopyInvoice = () => {
        if (sale?.invoice_number) {
            navigator.clipboard.writeText(sale.invoice_number);
            message.success('Invoice number copied to clipboard');
        }
    };

    const downloadPDF = async () => {
        try {
            setDownloading(true);
            const element = invoiceRef.current;
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff'
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgWidth = 190;
            const pageHeight = pdf.internal.pageSize.height;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            let position = 10;

            pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            pdf.save(`invoice_${sale.invoice_number}.pdf`);
            message.success('PDF invoice downloaded');
        } catch (error) {
            message.error('Failed to generate PDF');
            console.error(error);
        } finally {
            setDownloading(false);
        }
    };

    const downloadExcel = () => {
        try {
            const worksheetData = [
                ['INVOICE DETAILS'],
                ['Invoice Number:', sale.invoice_number],
                ['Customer Name:', sale.customer_name || 'Walk-in Customer'],
                ['Transaction Date:', dayjs(sale.created_at).format('DD MMMM YYYY HH:mm')],
                ['Payment Method:', paymentMethodLabels[sale.payment_method] || sale.payment_method],
                [''],
                ['PRODUCTS'],
                ['Product Name', 'Product ID', 'Price', 'Quantity', 'Subtotal']
            ];

            sale.products.forEach(product => {
                worksheetData.push([
                    product.name,
                    product.id,
                    product.price,
                    product.qty,
                    product.price * product.qty
                ]);
            });

            worksheetData.push(['']);
            worksheetData.push(['Total Amount:', '', '', '', sale.total_price]);

            const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Invoice');

            XLSX.writeFile(workbook, `invoice_${sale.invoice_number}.xlsx`);
            message.success('Excel invoice downloaded');
        } catch (error) {
            message.error('Failed to generate Excel file');
            console.error(error);
        }
    };

    const downloadText = () => {
        try {
            let textContent = `INVOICE DETAILS\n`;
            textContent += `================\n`;
            textContent += `Invoice Number: ${sale.invoice_number}\n`;
            textContent += `Customer: ${sale.customer_name || 'Walk-in Customer'}\n`;
            textContent += `Date: ${dayjs(sale.created_at).format('DD MMMM YYYY HH:mm')}\n`;
            textContent += `Payment Method: ${paymentMethodLabels[sale.payment_method] || sale.payment_method}\n\n`;
            textContent += `PRODUCTS\n`;
            textContent += `================\n`;

            sale.products.forEach((product, index) => {
                textContent += `${index + 1}. ${product.name}\n`;
                textContent += `   Price: Rp ${product.price.toLocaleString('id-ID')}\n`;
                textContent += `   Quantity: ${product.qty}\n`;
                textContent += `   Subtotal: Rp ${(product.price * product.qty).toLocaleString('id-ID')}\n\n`;
            });

            textContent += `================\n`;
            textContent += `TOTAL: Rp ${sale.total_price.toLocaleString('id-ID')}\n`;
            textContent += `================\n`;
            textContent += `Generated on: ${dayjs().format('DD MMMM YYYY HH:mm:ss')}\n`;

            const blob = new Blob([textContent], { type: 'text/plain' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `invoice_${sale.invoice_number}.txt`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            message.success('Text invoice downloaded');
        } catch (error) {
            message.error('Failed to generate text file');
            console.error(error);
        }
    };

    const downloadMenu = (
        <Menu
            items={[
                {
                    key: 'pdf',
                    label: 'Download as PDF',
                    icon: <FilePdfOutlined />,
                    onClick: downloadPDF
                },
                {
                    key: 'excel',
                    label: 'Download as Excel',
                    icon: <FileExcelOutlined />,
                    onClick: downloadExcel
                },
                {
                    key: 'text',
                    label: 'Download as Text',
                    icon: <FileTextOutlined />,
                    onClick: downloadText
                },
                {
                    type: 'divider'
                },
                {
                    key: 'print',
                    label: 'Print Invoice',
                    icon: <PrinterOutlined />,
                    onClick: handlePrint
                }
            ]}
        />
    );

    const productColumns = [
        {
            title: 'Product',
            key: 'product',
            render: (record) => (
                <div>
                    <div className="font-medium">{record.name}</div>
                    <div className="text-sm text-gray-500">ID: {record.id}</div>
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
            dataIndex: 'qty',
            key: 'qty',
            width: 80,
            render: (qty) => (
                <Tag color="blue">{qty}</Tag>
            ),
        },
        {
            title: 'Subtotal',
            key: 'subtotal',
            width: 150,
            render: (_, record) => (
                <span className="font-semibold">
                    Rp {(record.price * record.qty).toLocaleString('id-ID')}
                </span>
            ),
        },
    ];

    if (loading || !sale) {
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
            <div className="max-w-6xl mx-auto">
                {/* Invoice Print Template (hidden for normal view) */}
                <div id="invoice-print" ref={invoiceRef} className="hidden">
                    <div className="p-8">
                        <div className="header">
                            <div className="company-name">Ahtaufix</div>
                            <div className="invoice-title">INVOICE</div>
                            <div>Jl. Pangkalan 6, RT.02/RW.06, Ciketing Udik, Kec. Bantar Gebang, Kota Bks, Jawa Barat 17153 </div>
                            <div>Phone 1: 0878-7122-2647</div>
                            <div>Phone 2: 0857-7316-6574</div>

                        </div>

                        <Divider />

                        <div className="info-section">
                            <div className="info-row">
                                <div>
                                    <strong>Invoice Number:</strong> {sale.invoice_number}
                                </div>
                                <div>
                                    <strong>Date:</strong> {dayjs(sale.created_at).format('DD MMMM YYYY')}
                                </div>
                            </div>
                            <div className="info-row">
                                <div>
                                    <strong>Customer:</strong> {sale.customer_name || 'Walk-in Customer'}
                                </div>
                                <div>
                                    <strong>Time:</strong> {dayjs(sale.created_at).format('HH:mm')}
                                </div>
                            </div>
                        </div>

                        <table className="table">
                            <thead>
                            <tr>
                                <th>No</th>
                                <th>Product Name</th>
                                <th>Price</th>
                                <th>Qty</th>
                                <th>Subtotal</th>
                            </tr>
                            </thead>
                            <tbody>
                            {sale.products?.map((product, index) => (
                                <tr key={product.id}>
                                    <td>{index + 1}</td>
                                    <td>{product.name}</td>
                                    <td>Rp {product.price.toLocaleString('id-ID')}</td>
                                    <td>{product.qty}</td>
                                    <td>Rp {(product.price * product.qty).toLocaleString('id-ID')}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>

                        <div className="total-section">
                            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                                TOTAL: Rp {sale.total_price.toLocaleString('id-ID')}
                            </div>
                            <div style={{ marginTop: '10px' }}>
                                Payment Method: {paymentMethodLabels[sale.payment_method] || sale.payment_method}
                            </div>
                        </div>

                        <div className="footer">
                            <div>Thank you for your purchase!</div>
                            <div>This is a computer-generated invoice, no signature required.</div>
                        </div>
                    </div>
                </div>

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
                        <Space>
                            <Title level={2} className="!mb-0">Sale Details</Title>
                            <Badge status="success" text="Completed" />
                        </Space>
                        <Text type="secondary">Invoice: {sale.invoice_number}</Text>
                    </Space>
                </div>

                <Row gutter={24}>
                    <Col xs={24} lg={16}>
                        <div className="space-y-6">
                            <Card title="Invoice Information" className="shadow-sm">
                                <Descriptions column={2} size="middle">
                                    <Descriptions.Item label="Invoice Number" span={2}>
                                        <Space>
                                            <Text strong className="font-mono">{sale.invoice_number}</Text>
                                            <Button
                                                type="text"
                                                icon={<CopyOutlined />}
                                                onClick={handleCopyInvoice}
                                                size="small"
                                            />
                                        </Space>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Customer Name">
                                        {sale.customer_name || (
                                            <Text type="secondary">Walk-in Customer</Text>
                                        )}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Payment Method">
                                        <Tag color={paymentMethodColors[sale.payment_method]}>
                                            {paymentMethodLabels[sale.payment_method] || sale.payment_method}
                                        </Tag>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Transaction Date">
                                        {dayjs(sale.created_at).format('DD MMMM YYYY HH:mm')}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Invoice Age">
                                        {dayjs().diff(dayjs(sale.created_at), 'day')} days ago
                                    </Descriptions.Item>
                                </Descriptions>
                            </Card>

                            <Card title="Products" className="shadow-sm">
                                <Table
                                    columns={productColumns}
                                    dataSource={sale.products || []}
                                    rowKey="id"
                                    pagination={false}
                                    size="middle"
                                    summary={() => (
                                        <Table.Summary>
                                            <Table.Summary.Row>
                                                <Table.Summary.Cell index={0} colSpan={3}>
                                                    <Text strong className="text-right">Total Amount:</Text>
                                                </Table.Summary.Cell>
                                                <Table.Summary.Cell index={3}>
                                                    <Title level={4} className="!m-0 text-blue-600">
                                                        Rp {sale.total_price.toLocaleString('id-ID')}
                                                    </Title>
                                                </Table.Summary.Cell>
                                            </Table.Summary.Row>
                                        </Table.Summary>
                                    )}
                                />
                            </Card>
                        </div>
                    </Col>

                    <Col xs={24} lg={8}>
                        <div className="space-y-6">
                            <Card title="Quick Stats" className="shadow-sm">
                                <div className="space-y-4">
                                    <Statistic
                                        title="Total Items"
                                        value={sale.products?.reduce((sum, p) => sum + p.qty, 0) || 0}
                                        prefix={<ShoppingCartOutlined />}
                                    />
                                    <Statistic
                                        title="Unique Products"
                                        value={sale.products?.length || 0}
                                        prefix={<FileTextOutlined />}
                                    />
                                    <Statistic
                                        title="Average Price per Item"
                                        value={sale.products?.length > 0 ?
                                            sale.total_price / sale.products.reduce((sum, p) => sum + p.qty, 0) : 0
                                        }
                                        prefix="Rp"
                                        formatter={(value) => Math.round(value).toLocaleString('id-ID')}
                                    />
                                </div>
                            </Card>

                            <Card title="Actions" className="shadow-sm">
                                <Space direction="vertical" className="w-full">
                                    <Button
                                        type="primary"
                                        icon={<EditOutlined />}
                                        size="large"
                                        onClick={() => navigate(`/sales/${id}/edit`)}
                                        className="w-full bg-blue-600 hover:bg-blue-700"
                                    >
                                        Edit Sale
                                    </Button>


                                    <Button
                                        icon={<PrinterOutlined />}
                                        size="large"
                                        onClick={handlePrint}
                                        className="w-full"
                                    >
                                        Print Invoice
                                    </Button>

                                    <Button
                                        danger
                                        icon={<DeleteOutlined />}
                                        size="large"
                                        onClick={() => setDeleteModalVisible(true)}
                                        className="w-full"
                                    >
                                        Delete Sale
                                    </Button>
                                </Space>
                            </Card>

                            <Card title="Transaction Summary" className="shadow-sm">
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <Text>Subtotal</Text>
                                        <Text>Rp {sale.total_price.toLocaleString('id-ID')}</Text>
                                    </div>
                                    <div className="flex justify-between">
                                        <Text>Tax (0%)</Text>
                                        <Text>Rp 0</Text>
                                    </div>
                                    <Divider className="my-2" />
                                    <div className="flex justify-between text-lg font-bold">
                                        <Text>Total</Text>
                                        <Text className="text-blue-600">
                                            Rp {sale.total_price.toLocaleString('id-ID')}
                                        </Text>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </Col>
                </Row>
            </div>

            <Modal
                title="Delete Sale"
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
                        onClick={handleDelete}
                    >
                        Move to Trash
                    </Button>,
                ]}
            >
                <p>Are you sure you want to delete this sale?</p>
                <p className="text-red-500 font-semibold">
                    Invoice {sale.invoice_number} will be moved to trash.
                </p>
            </Modal>
        </div>
    );
};

export default SaleDetail;