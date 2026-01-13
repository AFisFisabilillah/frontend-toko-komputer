import {HomeOutlined} from "@ant-design/icons";
import {useState} from "react";
import {Layout, Menu, theme} from "antd";

const menuItems = [
    {
        key:"/",
        icon: <HomeOutlined />,
        label:"Home",
    }
]

export function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);
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
                <Menu defaultSelectedKeys={["/"]}  mode="inline" items={menuItems} />
            </Layout.Sider>
        </>
    )
}