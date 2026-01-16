import {
    HomeOutlined,
    PlusOutlined,
    ProductOutlined,
    RedoOutlined,
    ToolOutlined,
    UnorderedListOutlined
} from "@ant-design/icons";
import {useState} from "react";
import {Layout, Menu, theme} from "antd";

import { Link } from "react-router-dom";
import {useLocation} from "react-router";

const menuItems = [
    {
        key: "/",
        icon: <HomeOutlined />,
        label: <Link to="/">Home</Link>,
    },
    {
        key: "/products",
        icon: <ProductOutlined />,
        label:"Products",
        children: [
            {
                key: "/products",
                icon: <UnorderedListOutlined />,
                label: <Link to="/products">Products</Link>,
            },
            {
                key: "/products/create",
                icon: <PlusOutlined />,
                label:<Link to="/products/create">Create Products</Link>,
            },
            {
                key: "/products/trashed",
                icon:<RedoOutlined/>,
                label:<Link to="/products/trashed">Trash Products</Link>,
            }
        ]
    },
    {
        key: "/services",
        icon:<ToolOutlined />,
        label:"Services",
        children: [
            {
                key: "/services",
                icon: <UnorderedListOutlined />,
                label: <Link to="/services">Services</Link>,
            },
            {
                key: "/services/create",
                icon: <PlusOutlined />,
                label:<Link to="/services/create">Create Services</Link>,
            },
            {
                key: "/services/trashed",
                icon:<RedoOutlined/>,
                label:<Link to="/services/trashed">Trash Services</Link>,
            }
        ]
    }
];


export function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const location = useLocation();
    const colorPrimary =theme.useToken().token.colorPrimary;
    return (
        <>
            <Layout.Sider
                breakpoint={"md"}
                collapsedWidth={"0"}
                collapsible
                collapsed={collapsed}
                onCollapse={(collapsed) => setCollapsed(collapsed)}
                theme={"light"}
            >
                <div className={`flex items-center justify-center transition-all duration-300 ${collapsed ? 'px-2 py-4' : 'px-4 py-6'}`}>
                    <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                            </svg>
                        </div>

                        {!collapsed && (
                            <div className="flex flex-col">
                                <span className="text-xl font-bold text-gray-800 leading-tight">BrandName</span>
                                <span className="text-xs text-gray-500 font-medium">Admin Panel</span>
                            </div>
                        )}
                    </div>
                </div>
                <Menu selectedKeys={[location.pathname]} defaultSelectedKeys={["/"]}  mode="inline" items={menuItems} />
            </Layout.Sider>
        </>
    )
}