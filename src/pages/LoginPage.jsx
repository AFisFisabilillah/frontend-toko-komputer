import { Button, Form, Input, Card, Typography, message } from "antd";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import {useDispatch, useSelector} from "react-redux";
import {loginUser} from "../features/auth/authSlice.js";

const { Title, Text } = Typography;

export default function LoginPage() {
    const [form] = Form.useForm();
    const dispatch = useDispatch();
    const {loading,isAuthenticated} = useSelector(state => state.auth);

    async function handleFinish(values) {
        console.log(values);
        dispatch(loginUser(values));
        if(isAuthenticated){
            message.success('Login berhasil!');
        }
    }

    function handleFinishFailed(errorInfo) {
        console.log('Failed:', errorInfo);
        message.error('Harap periksa kembali data yang Anda masukkan');
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col justify-center items-center p-4">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-gray-800 mb-2">Selamat Datang</h1>
                <p className="text-gray-600">Masuk ke akun Anda untuk melanjutkan</p>
            </div>

            <Card
                className="w-full max-w-md shadow-2xl rounded-2xl overflow-hidden border-0"
                bodyStyle={{ padding: 0 }}
            >
                <div className="p-8">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 mb-4">
                            <UserOutlined className="text-white text-2xl" />
                        </div>
                        <Title level={3} className="mb-2">Masuk ke Akun</Title>
                        <Text type="secondary">Masukkan kredensial Anda untuk melanjutkan</Text>
                    </div>

                    <Form
                        form={form}
                        name="login"
                        layout="vertical"
                        size="large"
                        onFinish={handleFinish}
                        onFinishFailed={handleFinishFailed}
                        autoComplete="off"
                    >
                        <Form.Item
                            name="username"
                            label={<span className="font-medium text-gray-700">Username</span>}
                            rules={[
                                { required: true, message: "Username wajib diisi" },
                                { pattern: /^\S+$/, message: "Username tidak boleh mengandung spasi" },
                                { min: 3, message: "Username minimal 3 karakter" }
                            ]}
                            className="mb-6"
                        >
                            <Input
                                prefix={<UserOutlined className="text-gray-400" />}
                                placeholder="Masukkan username Anda"
                                size="large"
                                className="rounded-lg py-2 px-4 border-gray-300 hover:border-blue-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                            />
                        </Form.Item>

                        <Form.Item
                            name="password"
                            label={<span className="font-medium text-gray-700">Password</span>}
                            rules={[
                                { required: true, message: "Password wajib diisi" }]}
                            className="mb-2"
                        >
                            <Input.Password
                                prefix={<LockOutlined className="text-gray-400" />}
                                placeholder="Masukkan password Anda"
                                size="large"
                                className="rounded-lg py-2 px-4 border-gray-300 hover:border-blue-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                            />
                        </Form.Item>


                        <Form.Item className="mb-4">
                            <Button
                                type="primary"
                                htmlType="submit"
                                size="large"
                                block
                                className="h-12 rounded-lg font-medium text-base  from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 border-0 shadow-md hover:shadow-lg transition-all duration-300"
                            >
                                Masuk
                            </Button>
                        </Form.Item>


                    </Form>
                </div>

                {/* Footer card */}
                <div className="bg-gray-50 px-8 py-4 border-t border-gray-200 rounded-b-2xl">
                    <div className="flex justify-between items-center">
                        <Text type="secondary" className="text-sm">
                            © 2025 Aplikasi Kami
                        </Text>
                        <div className="flex space-x-4">
                            <a href="#" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">Kebijakan Privasi</a>
                            <a href="#" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">Bantuan</a>
                        </div>
                    </div>
                </div>
            </Card>

            <div className="mt-8 text-center max-w-md">
                <Text type="secondary" className="text-sm">
                    Aplikasi ini kompatibel dengan perangkat mobile, tablet, dan desktop.
                    Login Anda aman dan terenkripsi.
                </Text>
            </div>
            {loading && (
                <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center rounded-2xl">
                    <Spin size="large" tip="Sedang memproses login..." />
                </div>
            )}
        </div>
    );
}