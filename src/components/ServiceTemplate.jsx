import React from 'react';
import { Button, Tooltip, message } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';

const ServiceTemplate = () => {
    const handleDownloadTemplate = () => {
        const templateData = [
            {
                customer_name: 'John Doe',
                customer_phone: '081234567890',
                laptop_brand: 'ASUS',
                laptop_model: 'TUF FX505',
                complaint: 'Laptop tidak bisa menyala',
                service_cost: 150000,
                status: 'received',
                products: JSON.stringify([
                    { product_id: 1, qty: 1 },
                    { product_id: 2, qty: 2 }
                ])
            }
        ];

        const worksheet = XLSX.utils.json_to_sheet(templateData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Services');

        // Auto-size columns
        const wscols = [
            { wch: 20 }, // customer_name
            { wch: 15 }, // customer_phone
            { wch: 15 }, // laptop_brand
            { wch: 15 }, // laptop_model
            { wch: 40 }, // complaint
            { wch: 15 }, // service_cost
            { wch: 15 }, // status
            { wch: 50 }, // products
        ];
        worksheet['!cols'] = wscols;

        XLSX.writeFile(workbook, 'service_import_template.xlsx');
        message.success('Template downloaded successfully');
    };

    return (
        <Tooltip title="Download Excel template">
            <Button
                type="link"
                icon={<DownloadOutlined />}
                onClick={handleDownloadTemplate}
            >
                Download Template
            </Button>
        </Tooltip>
    );
};

export default ServiceTemplate;