import React from 'react';
import { Button, Tooltip, message } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';

const ProductTemplate = () => {
    const handleDownloadTemplate = () => {
        const templateData = [
            {
                name: 'Product Name',
                brand: 'Brand Name',
                price: 100000,
                stok: 10,
                description: 'Optional description'
            },
            {
                name: 'Another Product',
                brand: 'Another Brand',
                price: 200000,
                stok: 5,
                description: ''
            }
        ];

        const worksheet = XLSX.utils.json_to_sheet(templateData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');

        // Auto-size columns
        const wscols = [
            { wch: 15 }, // SKU
            { wch: 30 }, // Name
            { wch: 20 }, // Brand
            { wch: 15 }, // Price
            { wch: 10 }, // Stock
            { wch: 40 }, // Description
        ];
        worksheet['!cols'] = wscols;

        XLSX.writeFile(workbook, 'product_import_template.xlsx');
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

export default ProductTemplate;