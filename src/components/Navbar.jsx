import {Avatar, Dropdown, Flex, Layout} from "antd";
import {useSelector} from "react-redux";
import {LogoutOutlined, UserOutlined} from "@ant-design/icons";
import {useNavigate} from "react-router";

export function Navbar() {
    const navigate = useNavigate();
    const userMenuItems = [
        {
            key:"profile",
            icon: <UserOutlined />,
            label: 'Profile',
            onClick: () => {navigate('/profile')}
        },
        {
            type:"divider",
        },
        {
            key: 'logout',
            icon: <LogoutOutlined/>,
            label: 'Keluar',
            danger: true,
            onClick: () => {
            },
        }
    ];
    const user = useSelector((state) => state.auth.user);
    console.log(user);
    return (
        <>
            <Layout.Header
                style={{
                    padding: '0 24px',
                    background: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    boxShadow: '0 1px 4px rgba(0, 0, 0, 0.1)',
                    position: 'sticky',
                    top: 0,
                    zIndex: 10,
                    height: '64px',
                }}
            >

                <Flex justify="space-between" align="center" className="w-full">
                    <div className="flex items-center space-x-2">
                        <h1 className="text-base sm:text-xl font-bold text-gray-800 truncate">
                            Selamat datang,{" "}
                            <span className="text-emerald-300">
                {window.innerWidth < 640 ? user.username : user.username}</span>
                            ! 👋
                        </h1>
                    </div>

                    <Dropdown
                        menu={{items: userMenuItems}}
                        trigger={['click']}
                        placement="bottomRight"
                    >
                        <div
                            className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors duration-200">
                            <Avatar
                                size="large"
                                src={user?.profile}
                                icon={<UserOutlined/>}
                                className="bg-blue-500 shadow-sm"
                            />
                            {/* Tampilkan username hanya di desktop */}
                            <span className="hidden md:inline text-sm font-medium text-gray-700">
            </span>
                        </div>
                    </Dropdown>
                </Flex>
            </Layout.Header>
        </>
    )
}