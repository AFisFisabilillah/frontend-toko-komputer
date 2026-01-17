import React from 'react';
import {
    Modal,
    Avatar,
    Descriptions,
    Button,
    Space,
    Typography,
    Tag,
    Divider
} from 'antd';
import {
    UserOutlined,
    PhoneOutlined,
    CalendarOutlined,
    EditOutlined,
    IdcardOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const AdminDetailModal = ({ visible, admin, onCancel, onEdit }) => {
    if (!admin) return null;

    return (
        <Modal
            title={
                <Space>
                    <IdcardOutlined />
                    <span>Admin Details</span>
                </Space>
            }
            open={visible}
            onCancel={onCancel}
            footer={null}
            width={500}
            centered
        >
            <div className="text-center mb-6">
                <Avatar
                    src={admin.profile}
                    icon={<UserOutlined />}
                    size={100}
                    className="border-4 border-gray-100 shadow-lg mb-4"
                />
                <Title level={3} className="!mb-1">
                    {admin.fullname}
                </Title>
                <Text type="secondary" className="text-lg">
                    @{admin.username}
                </Text>
                <div className="mt-2">
                    <Tag color="green">Active</Tag>
                </div>
            </div>

            <Divider />

            <Descriptions column={1} size="middle" className="mb-6">
                <Descriptions.Item label={
                    <Space>
                        <UserOutlined />
                        <span>Username</span>
                    </Space>
                }>
                    <Text strong>@{admin.username}</Text>
                </Descriptions.Item>

                <Descriptions.Item label={
                    <Space>
                        <PhoneOutlined />
                        <span>Phone Number</span>
                    </Space>
                }>
                    <Text strong>{admin.phone}</Text>
                </Descriptions.Item>

                <Descriptions.Item label={
                    <Space>
                        <CalendarOutlined />
                        <span>Created Date</span>
                    </Space>
                }>
                    {dayjs(admin.created_at).format('DD MMMM YYYY HH:mm')}
                </Descriptions.Item>

                <Descriptions.Item label={
                    <Space>
                        <CalendarOutlined />
                        <span>Last Updated</span>
                    </Space>
                }>
                    {dayjs(admin.updated_at).format('DD MMMM YYYY HH:mm')}
                </Descriptions.Item>
            </Descriptions>

            <Divider />

            <div className="flex justify-center space-x-4">
                <Button onClick={onCancel}>
                    Close
                </Button>
                <Button
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={onEdit}
                    className="bg-blue-600 hover:bg-blue-700"
                >
                    Edit Admin
                </Button>
            </div>
        </Modal>
    );
};

export default AdminDetailModal;