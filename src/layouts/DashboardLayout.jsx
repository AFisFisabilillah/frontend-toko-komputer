import {Breadcrumb, ConfigProvider, Layout, Menu, theme} from "antd";
import {Navbar} from "../components/Navbar.jsx";
import {Sidebar} from "../components/Sidebar.jsx";
import {Outlet} from "react-router";
import {useState} from "react";
import {HomeOutlined} from "@ant-design/icons";
import {Colors} from "../constants/Colors.js";
const {Header,Sider  ,Content, Footer } = Layout;

const items = [
    {
        key:"/",
        icon: <HomeOutlined />,
        children: [],
        label:"Home",
    }
]
export function DashboardLayout() {
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();
    return (
        <ConfigProvider
        theme={{
            "token": {
                "colorPrimary":Colors.primary,
                "colorInfo": "#3ce6a2"
            }
        }}>
            <Layout style={{ minHeight: '100vh' }}>
                <Sidebar/>
                <Layout>
                    <Navbar/>
                    <Content style={{ margin: '0 16px' }}>
                        <div
                            style={{
                                padding: 24,
                                minHeight: 360,
                                background: colorBgContainer,
                                borderRadius: borderRadiusLG,
                            }}
                        >
                            <Outlet/>
                        </div>
                    </Content>
                    <Footer style={{ textAlign: 'center' }}>
                        AhTauFix ©{new Date().getFullYear()} Created by Afis Fisabilillah
                    </Footer>
                </Layout>
            </Layout>

        </ConfigProvider>
    );
}