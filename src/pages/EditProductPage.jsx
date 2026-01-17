import React, { useState, useEffect } from 'react';
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
    Divider,
    Skeleton,
    Image
} from 'antd';
import {
    UploadOutlined,
    ArrowLeftOutlined,
    SaveOutlined,
    DeleteOutlined,
    EyeOutlined, PlusOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from "../adapters/axiosInstance.js";

const { TextArea } = Input;
const { Title } = Typography;
const normFile = (e) => {
    if (Array.isArray(e)) {
        return e;
    }
    return e?.fileList;
};

const EditProduct = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [fileList, setFileList] = useState([]);
    const [existingImages, setExistingImages] = useState([]);
    const navigate = useNavigate();
    const { id } = useParams();

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const fetchProduct = async () => {
        try {
            setFetching(true);
            const response = await axiosInstance.get(`/products/${id}`);
            const product = response.data.data;

            form.setFieldsValue({
                sku: product.sku,
                name: product.name,
                brand: product.brand,
                price: product.price,
                stok: product.stok,
                description: product.description,
            });

            setExistingImages(product.images || []);
        } catch (error) {
            message.error('Failed to fetch product');
            navigate('/products');
        } finally {
            setFetching(false);
        }
    };

    const handleSubmit = async (values) => {
        try {
            setLoading(true);

            const formData = new FormData();
            Object.keys(values).forEach(key => {
                if (key !== 'images') {
                    formData.append(key, values[key]);
                }
            });

            // Append new images
            values['images']?.forEach((file,index) => {
                if (file.originFileObj) {
                    formData.append(`images[${index}]`, file.originFileObj);
                }
            });

            const response = await axiosInstance.post(`/products/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            message.success('Product updated successfully!');
            navigate('/products');
        } catch (error) {
            message.error(error.response?.data?.message || 'Failed to update product');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveImage = (imageToRemove) => {
        setExistingImages(prev => prev.filter(img => img !== imageToRemove));
        message.info('Image will be removed when you save changes');
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

    if (fetching) {
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
                        <Title level={2} className="!mb-0">Edit Product</Title>
                        <p className="text-gray-600">Update product information</p>
                    </Space>
                </div>

                <Card className="shadow-lg">
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleSubmit}
                    >
                        <Row gutter={24}>
                            <Col xs={24} lg={16}>
                                <div className="space-y-6">
                                    <Row gutter={16}>
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

                                    <Row gutter={16}>
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
                                        <Col xs={24} md={6}>
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
                                <div className="space-y-6">
                                    <Card title="Existing Images" className="h-full">
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                {existingImages.map((image, index) => (
                                                    <div key={index} className="relative group">
                                                        <Image
                                                            src={image}
                                                            alt={`Product ${index + 1}`}
                                                            className="w-full h-32 object-cover rounded-lg"
                                                            preview={{
                                                                mask: <EyeOutlined />,
                                                            }}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                            {existingImages.length === 0 && (
                                                <div className="text-center text-gray-500 py-8">
                                                    No images available
                                                </div>
                                            )}
                                        </div>
                                    </Card>

                                    <Card title="Add New Images">
                                        <div className="space-y-4">
                                            <Form.Item
                                                name="images"
                                                valuePropName="fileList"
                                                getValueFromEvent={normFile}

                                            >
                                                <Upload {...uploadProps}>
                                                    {fileList.length >= 5 ? null : (
                                                        <div>
                                                            <PlusOutlined />
                                                            <div style={{ marginTop: 8 }}>Upload</div>
                                                        </div>
                                                    )}
                                                </Upload>
                                            </Form.Item>
                                            <div className="text-sm text-gray-500">
                                                <p>• Upload up to 8 images</p>
                                                <p>• New images will replace existing ones</p>
                                                <p>• Supported: JPG, JPEG, PNG</p>
                                            </div>
                                        </div>
                                    </Card>
                                </div>
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
                                Update Product
                            </Button>
                        </div>
                    </Form>
                </Card>
            </div>
        </div>
    );
};

export default EditProduct;