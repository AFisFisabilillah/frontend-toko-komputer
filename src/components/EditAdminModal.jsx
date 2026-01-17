import React, { useState, useEffect } from 'react';
import {
    Modal,
    Form,
    Input,
    Button,
    Upload,
    message,
    Avatar,
    Row,
    Col,
    Space,
    Typography,
    Alert
} from 'antd';
import {
    UploadOutlined,
    UserOutlined,
    LockOutlined,
    PhoneOutlined,
    EditOutlined
} from '@ant-design/icons';
import axiosInstance from '../adapters/axiosInstance';

const { Text } = Typography;


const EditAdminModal = ({ visible, admin, onCancel, onSuccess }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const [fetching, setFetching] = useState(false);

    useEffect(() => {
        if (admin && visible) {
            fetchAdminDetails();
        }
    }, [admin, visible]);

    const fetchAdminDetails = async () => {
        try {
            setFetching(true);
            const response = await axiosInstance.get(`/admin/${admin.id}`);
            const adminData = response.data.data;

            form.setFieldsValue({
                fullname: adminData.fullname,
                phone: adminData.phone,
            });

            setPreviewImage(adminData.profile);
        } catch (error) {
            message.error('Failed to fetch admin details');
        } finally {
            setFetching(false);
        }
    };

    const handleSubmit = async (values) => {
        try {
            setLoading(true);

            const formData = new FormData();

            Object.keys(values).forEach(key => {
                if (key !== 'profile') {
                    formData.append(key, values[key]);
                }
            });

            if (values.profile ) {
                formData.append(
                    "profile",
                    values.profile.file
                );
            }

            await axiosInstance.post('/admin/'+admin.id, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            message.success('Admin created successfully!');
            form.resetFields();
            setPreviewImage(null);
            onSuccess();
        } catch (error) {
            console.log(error);
            message.error(error.response?.data?.message || 'Failed to create admin');
        } finally {
            setLoading(false);
        }
    };

    const uploadProps = {
        beforeUpload: (file) => {
            const isImage = file.type.startsWith('image/');
            if (!isImage) {
                message.error('You can only upload image files!');
                return false;
            }

            const isLt2M = file.size / 1024 / 1024 < 2;
            if (!isLt2M) {
                message.error('Image must be smaller than 2MB!');
                return false;
            }


            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreviewImage(e.target.result);
            };
            reader.readAsDataURL(file);

            return false;
        },
        onRemove: () => {
            setPreviewImage(admin?.profile || null);
        },
        maxCount: 1,
        accept: 'image/*',
        listType: "picture-card",
        showUploadList: false,
    };

    const handleCancel = () => {
        form.resetFields();
        setPreviewImage(null);
        onCancel();
    };

    return (
        <Modal
            title={
                <Space>
                    <EditOutlined />
                    <span>Edit Admin</span>
                </Space>
            }
            open={visible}
            onCancel={handleCancel}
            footer={null}
            width={600}
            centered
            confirmLoading={fetching}
        >
            {admin && (
                <div className="mb-4">
                    <Alert
                        message={
                            <Space>
                                <span>Editing:</span>
                                <span className="font-semibold">{admin.fullname}</span>
                                <Text type="secondary">@{admin.username}</Text>
                            </Space>
                        }
                        type="info"
                        showIcon
                    />
                </div>
            )}

            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
            >
                <Row gutter={24}>
                    <Col xs={24} md={8}>
                        <div className="text-center mb-6">
                            <div className="mb-4">
                                <Avatar
                                    src={previewImage}
                                    icon={<UserOutlined />}
                                    size={120}
                                    className="border-4 border-gray-100 shadow-lg"
                                />
                            </div>

                            <Form.Item
                                name="profile"
                            >
                                <Upload {...uploadProps}>
                                    <Button icon={<UploadOutlined />}>
                                        Change Photo
                                    </Button>
                                </Upload>
                            </Form.Item>

                            <Text type="secondary" className="text-xs">
                                Recommended: Square image, max 2MB
                            </Text>
                        </div>
                    </Col>

                    <Col xs={24} md={16}>
                        <div className="space-y-4">
                            <Form.Item
                                label="Full Name"
                                name="fullname"
                                rules={[
                                    { required: true, message: 'Please enter full name' },
                                    { min: 3, message: 'Name must be at least 3 characters' }
                                ]}
                            >
                                <Input
                                    placeholder="Enter full name"
                                    prefix={<UserOutlined className="text-gray-400" />}
                                    size="large"
                                />
                            </Form.Item>

                            <Form.Item
                                label="New Password"
                                name="password"
                                rules={[
                                    { min: 6, message: 'Password must be at least 6 characters' }
                                ]}
                            >
                                <Input.Password
                                    placeholder="Leave blank to keep current password"
                                    prefix={<LockOutlined className="text-gray-400" />}
                                    size="large"
                                />
                            </Form.Item>

                            <Form.Item
                                label="Phone Number"
                                name="phone"
                                rules={[
                                    { required: true, message: 'Please enter phone number' },
                                    { pattern: /^[0-9+]+$/, message: 'Only numbers and + allowed' }
                                ]}
                            >
                                <Input
                                    placeholder="e.g., 081234567890"
                                    prefix={<PhoneOutlined className="text-gray-400" />}
                                    size="large"
                                />
                            </Form.Item>
                        </div>
                    </Col>
                </Row>

                <div className="mt-8 pt-6 border-t border-gray-200">
                    <div className="flex justify-end space-x-4">
                        <Button onClick={handleCancel} size="large">
                            Cancel
                        </Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            size="large"
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            Update Admin
                        </Button>
                    </div>
                </div>
            </Form>
        </Modal>
    );
};

export default EditAdminModal;