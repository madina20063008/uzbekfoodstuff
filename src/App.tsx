// app.tsx
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ThemeProvider } from "./components/theme-provider";
import { AuthProvider } from "./contexts/auth-context";
import "./i18n";

import AboutManagement from "./components/pages/admin/about/page";
import BannersPage from "./components/pages/admin/banners/page";
import CategoryManagement from "./components/pages/admin/categories/page";
import ColorsPage from "./components/pages/admin/colors/page";
import ContactManagement from "./components/pages/admin/contact/page";
import NewsManagement from "./components/pages/admin/news/page";
import OrdersPage from "./components/pages/admin/orders/page";
import OurContactManagement from "./components/pages/admin/our-contact/page";
import ProductManagementContent from "./components/pages/admin/products/page";
import SocialMediaManagement from "./components/pages/admin/social-media/page";
import UserManagement from "./components/pages/admin/users/page";
import LoginPage from "./components/pages/login/page";
import NotFound from "./components/pages/NotFound";

// Context Providers
import { CategoriesProvider } from "./contexts/CategoriesContext";
import { ColorsProvider } from "./contexts/ColorsContext";
import { FeaturesProvider } from "./contexts/FeaturesContext";
import { ProductColorsProvider } from "./contexts/ProductColorsContext";
import { TypesProvider } from "./contexts/TypesContext";
import AdminDashboard from "./components/pages/admin/page";
import { AdminWrapper } from "./components/AdminWrapper";
import { CurrencyProvider } from "./contexts/CurrencyContext";

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <AuthProvider>
        <CurrencyProvider>
          <CategoriesProvider>
          <ColorsProvider>
            <FeaturesProvider>
              <ProductColorsProvider>
                <TypesProvider>
                  <Router>
                    <Routes>
                      {/* Public Routes */}
                      <Route path="/login" element={<LoginPage />} />

                      {/* Admin Routes */}
                      <Route path="/admin" element={<AdminWrapper />}>
                        <Route index element={<AdminDashboard />} />
                        <Route path="about" element={<AboutManagement />} />
                        <Route path="orders" element={<OrdersPage />} />
                        <Route path="users" element={<UserManagement />} />
                        <Route
                          path="categories"
                          element={<CategoryManagement />}
                        />
                        <Route
                          path="products"
                          element={<ProductManagementContent />}
                        />
                        <Route path="banners" element={<BannersPage />} />
                        <Route path="colors" element={<ColorsPage />} />
                        <Route path="contact" element={<ContactManagement />} />
                        <Route path="news" element={<NewsManagement />} />
                        <Route
                          path="our-contact"
                          element={<OurContactManagement />}
                        />
                        <Route
                          path="social-media"
                          element={<SocialMediaManagement />}
                        />
                      </Route>

                      {/* Default redirect */}
                      <Route
                        path="/"
                        element={<Navigate to="/admin" replace />}
                      />

                      {/* 404 Page */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Router>
                </TypesProvider>
              </ProductColorsProvider>
            </FeaturesProvider>
          </ColorsProvider>
        </CategoriesProvider>
        </CurrencyProvider>
        
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
