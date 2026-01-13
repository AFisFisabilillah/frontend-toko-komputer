import React, { useState } from 'react';
import {
    Form,
    Input,
    InputNumber,
    Button,
    Card,
    Upload,
    message,
    Row,
    Col,
    Typography,
    Space,
    Divider
} from 'antd';
import {
    UploadOutlined,
    ArrowLeftOutlined,
    SaveOutlined,
    PlusOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axiosInstance from "../adapters/axiosInstance.js";

const { TextArea } = Input;
const { Title } = Typography;

const normFile = (e) => {
    if (Array.isArray(e)) {
        return e;
    }
    return e?.fileList;
};

const CreateProduct = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [fileList, setFileList] = useState([]);
    const navigate = useNavigate();

    const handleSubmit = async (values) => {
        try {
            setLoading(true);

            const formData = new FormData();
            Object.keys(values).forEach(key => {
                if (key !== 'images') {
                    formData.append(key, values[key]);
                }
            });

            values["images"].forEach((file,index) => {
                console.log("file",file.originFileObj);
                if (file.originFileObj) {
                    formData.append(`images[${index}]`, file.originFileObj);
                }
            });
            // console.log(formData);
            // return;
            const response = await axiosInstance.post('/products', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            message.success('Product created successfully!');
            navigate('/products');
        } catch (error) {
            message.error(error.response?.data?.message || 'Failed to create product');
        } finally {
            setLoading(false);
        }
    };

    const uploadProps = {
        onRemove: (file) => {
            const index = fileList.indexOf(file);
            const newFileList = fileList.slice();
            newFileList.splice(index, 1);
            setFileList(newFileList);
        },
        beforeUpload: (file) => {
            const isImage = file.type.startsWith('image/');
            if (!isImage) {
                message.error('You can only upload image files!');
                return false;
            }
            // console.log("file",file)
            setFileList([...fileList, file]);
            return false;
        },
        fileList,
        multiple: true,
        listType: "picture-card",
        accept: 'image/*',
        showUploadList: {
            showPreviewIcon: true,
            showRemoveIcon: true,
        },
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto">
                <div className="mb-6">
                    <Space direction="vertical" size="small">
                        <Button
                            type="text"
                            icon={<ArrowLeftOutlined />}
                            onClick={() => navigate('/products')}
                            className="p-0"
                        >
                            Back to Products
                        </Button>
                        <Title level={2} className="!mb-0">Create New Product</Title>
                        <p className="text-gray-600">Add a new product to your inventory</p>
                    </Space>
                </div>

                <Card className="shadow-lg">
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleSubmit}
                        initialValues={{
                            stok: 0,
                            price: 0
                        }}
                    >
                        <Row gutter={24}>
                            <Col xs={24} lg={16}>
                                <div className="space-y-6">
                                    <Row gutter={16}>
                                        <Col xs={24} md={12}>
                                            <Form.Item
                                                label="SKU"
                                                name="sku"
                                                rules={[
                                                    { required: true, message: 'Please enter SKU' },
                                                    { pattern: /^[A-Z0-9-]+$/, message: 'Only uppercase letters, numbers and dashes' }
                                                ]}
                                            >
                                                <Input
                                                    placeholder="e.g., SKU-1001"
                                                    size="large"
                                                    className="w-full"
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} md={12}>
                                            <Form.Item
                                                label="Product Name"
                                                name="name"
                                                rules={[{ required: true, message: 'Please enter product name' }]}
                                            >
                                                <Input
                                                    placeholder="e.g., Samsung SSD 1TB"
                                                    size="large"
                                                />
                                            </Form.Item>
                                        </Col>
                                    </Row>

                                    <Row gutter={40} >
                                        <Col xs={24} md={12}>
                                            <Form.Item
                                                label="Brand"
                                                name="brand"
                                                rules={[{ required: true, message: 'Please enter brand' }]}
                                            >
                                                <Input
                                                    placeholder="e.g., SAMSUNG"
                                                    size="large"
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={28} md={6}>
                                            <Form.Item
                                                label="Price"
                                                name="price"
                                                rules={[{ required: true, message: 'Please enter price' }]}
                                            >
                                                <InputNumber
                                                    placeholder="0"
                                                    size="large"
                                                    min={0}
                                                    formatter={value => `Rp ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                    parser={value => value.replace(/Rp\s?|(,*)/g, '')}
                                                    className="w-full"
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} md={6}>
                                            <Form.Item
                                                label="Stock"
                                                name="stok"
                                                rules={[{ required: true, message: 'Please enter stock' }]}
                                            >
                                                <InputNumber
                                                    placeholder="0"
                                                    size="large"
                                                    min={0}
                                                    className="w-full"
                                                />
                                            </Form.Item>
                                        </Col>
                                    </Row>

                                    <Form.Item
                                        label="Description"
                                        name="description"
                                    >
                                        <TextArea
                                            rows={4}
                                            placeholder="Enter product description..."
                                            maxLength={500}
                                            showCount
                                        />
                                    </Form.Item>
                                </div>
                            </Col>

                            <Col xs={24} lg={8}>
                                <Card title="Product Images" className="h-full">
                                    <div className="space-y-4">
                                        <Form.Item
                                            name="images"
                                            valuePropName="fileList"
                                            getValueFromEvent={normFile}
                                        >
                                            <Upload {...uploadProps}>
                                                {fileList.length >= 8 ? null : (
                                                    <div>
                                                        <PlusOutlined />
                                                        <div style={{ marginTop: 8 }}>Upload</div>
                                                    </div>
                                                )}
                                            </Upload>
                                        </Form.Item>
                                        <div className="text-sm text-gray-500">
                                            <p>• Upload up to 8 images</p>
                                            <p>• Supported: JPG, JPEG, PNG</p>
                                            <p>• Max size: 2MB per image</p>
                                        </div>
                                    </div>
                                </Card>
                            </Col>
                        </Row>

                        <Divider />

                        <div className="flex justify-end space-x-4">
                            <Button
                                size="large"
                                onClick={() => navigate('/products')}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                size="large"
                                loading={loading}
                                icon={<SaveOutlined />}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                Create Product
                            </Button>
                        </div>
                    </Form>
                </Card>
            </div>
        </div>
    );
};

export default CreateProduct;