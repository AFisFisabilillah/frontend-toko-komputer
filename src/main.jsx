import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import './index.css'
import {BrowserRouter, Route, Routes} from "react-router";
import {Provider} from "react-redux";
import {configureStore} from "@reduxjs/toolkit";
import {auth} from "./features/auth/authSlice.js";
import LoginPage from "./pages/LoginPage.jsx";
import {DashboardLayout} from "./layouts/DashboardLayout.jsx";
import {ProtectedRoute} from "./components/ProtectedRoute.jsx";
import HomePage from "./pages/HomePage.jsx";
import Products from "./pages/ProductPage.jsx";
import CreateProduct from "./pages/CreateProductPage.jsx";
import ProductDetail from "./pages/ProductDetailPage.jsx";
import EditProduct from "./pages/EditProductPage.jsx";
import ProductTrash from "./pages/ProductTrashPage.jsx";
import ServicesTrash from "./pages/ServicesTrash.jsx";
import Services from "./pages/ServicesPage.jsx";
import CreateService from "./pages/CreateServicesPage.jsx";
import ServiceDetail from "./pages/ServicesDetail.jsx";
import EditService from "./pages/EditServicesPage.jsx";
import ImportProduct from "./pages/ImportProductPage.jsx";
import ImportService from "./pages/ImportServicePage.jsx";

const store = configureStore({
    reducer: {
        auth: auth.reducer
    }
})
createRoot(document.getElementById('root')).render(
    <StrictMode>
        <Provider store={store}>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={
                        <ProtectedRoute>
                            <DashboardLayout/>
                        </ProtectedRoute>
                    }>
                        <Route index element={<HomePage/>}/>
                        <Route path="/products" element={<Products />} />
                        <Route path="/products/create" element={<CreateProduct />} />
                        <Route path="/products/:id" element={<ProductDetail />} />
                        <Route path="/products/:id/edit" element={<EditProduct />} />
                        <Route path="/products/trashed" element={<ProductTrash />} />
                        <Route path="/products/import" element={<ImportProduct />} />

                        <Route path="/services" element={<Services />} />
                        <Route path="/services/import" element={<ImportService />} />
                        <Route path="/services/create" element={<CreateService />} />
                        <Route path="/services/:id" element={<ServiceDetail />} />
                        <Route path="/services/:id/edit" element={<EditService />} />
                        <Route path="/services/trashed" element={<ServicesTrash />} />
                    </Route>
                    <Route path="/login" element={<LoginPage/>}/>
                </Routes>
            </BrowserRouter>
        </Provider>
    </StrictMode>
)
