import React, { useState, useEffect } from 'react';
import {
    Card,
    Avatar,
    Descriptions,
    Button,
    Row,
    Col,
    Typography,
    Space,
    Tag,
    Divider,
    Skeleton,
    message,
    Modal,
    Alert
} from 'antd';
import {
    UserOutlined,
    PhoneOutlined,
    CalendarOutlined,
    EditOutlined,
    SafetyOutlined,
    IdcardOutlined,
    HistoryOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../adapters/axiosInstance';
import EditProfileModal from '../components/EditProfileModal';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/profile');
            setProfile(response.data.data);
        } catch (error) {
            message.error('Failed to fetch profile');
            navigate('/');
        } finally {
            setLoading(false);
        }
    };

    const handleEditSuccess = () => {
        setEditModalVisible(false);
        fetchProfile();
        message.success('Profile updated successfully!');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <Card className="shadow-lg">
                    <Skeleton active avatar paragraph={{ rows: 4 }} />
                </Card>
            </div>
        );
    }

    if (!profile) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                    <Title level={2} className="!mb-2">My Profile</Title>
                    <Text type="secondary">Manage your personal information and account settings</Text>
                </div>

                <Card className="shadow-lg mb-6">
                    <Row gutter={32}>
                        <Col xs={24} md={8}>
                            <div className="text-center">
                                <Avatar
                                    src={profile.profile}
                                    icon={<UserOutlined />}
                                    size={160}
                                    className="border-8 border-gray-100 shadow-xl mb-6"
                                />

                                <Title level={3} className="!mb-1">
                                    {profile.fullname}
                                </Title>
                                <Text type="secondary" className="text-lg block mb-4">
                                    @{profile.username}
                                </Text>

                                <Tag color="green" icon={<SafetyOutlined />} className="mb-6">
                                    Administrator
                                </Tag>

                                <div className="mt-6">
                                    <Button
                                        type="primary"
                                        icon={<EditOutlined />}
                                        size="large"
                                        onClick={() => setEditModalVisible(true)}
                                        className="w-full bg-blue-600 hover:bg-blue-700"
                                    >
                                        Edit Profile
                                    </Button>
                                </div>
                            </div>
                        </Col>

                        <Col xs={24} md={16}>
                            <div className="space-y-6">
                                <div>
                                    <Title level={4} className="!mb-4">
                                        <IdcardOutlined className="mr-2" />
                                        Personal Information
                                    </Title>

                                    <Descriptions column={1} size="middle" className="mb-6">
                                        <Descriptions.Item label={
                                            <Space>
                                                <UserOutlined />
                                                <span>Full Name</span>
                                            </Space>
                                        }>
                                            <Text strong>{profile.fullname}</Text>
                                        </Descriptions.Item>

                                        <Descriptions.Item label={
                                            <Space>
                                                <span className="text-gray-400">@</span>
                                                <span>Username</span>
                                            </Space>
                                        }>
                                            <Text strong>@{profile.username}</Text>
                                        </Descriptions.Item>

                                        <Descriptions.Item label={
                                            <Space>
                                                <PhoneOutlined />
                                                <span>Phone Number</span>
                                            </Space>
                                        }>
                                            <Text strong>{profile.phone}</Text>
                                        </Descriptions.Item>
                                    </Descriptions>
                                </div>

                                <Divider />

                                <div>
                                    <Title level={4} className="!mb-4">
                                        <HistoryOutlined className="mr-2" />
                                        Account Information
                                    </Title>

                                    <Descriptions column={1} size="middle">
                                        <Descriptions.Item label={
                                            <Space>
                                                <CalendarOutlined />
                                                <span>Member Since</span>
                                            </Space>
                                        }>
                                            {dayjs(profile.created_at).format('DD MMMM YYYY')}
                                        </Descriptions.Item>

                                        <Descriptions.Item label={
                                            <Space>
                                                <CalendarOutlined />
                                                <span>Last Updated</span>
                                            </Space>
                                        }>
                                            {dayjs(profile.updated_at).format('DD MMMM YYYY HH:mm')}
                                        </Descriptions.Item>

                                        <Descriptions.Item label="Account Status">
                                            <Tag color="green">Active</Tag>
                                        </Descriptions.Item>

                                        <Descriptions.Item label="Role">
                                            <Tag color="blue">Super Admin</Tag>
                                        </Descriptions.Item>
                                    </Descriptions>
                                </div>

                                <Divider />

                                <Alert
                                    message="Security Information"
                                    description="Your password is encrypted and secured. We recommend changing your password regularly for better security."
                                    type="info"
                                    showIcon
                                />
                            </div>
                        </Col>
                    </Row>
                </Card>
            </div>

            {/* Edit Profile Modal */}
            <EditProfileModal
                visible={editModalVisible}
                profile={profile}
                onCancel={() => setEditModalVisible(false)}
                onSuccess={handleEditSuccess}
            />
        </div>
    );
};

export default Profile;