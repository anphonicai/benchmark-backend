import { createBrowserRouter, Outlet, useLocation } from "react-router";
import { useEffect } from "react";
import { scrollToTop } from "./utils/lenisInstance";
import HomePage from "./pages/HomePage";
import BrandInfoPage from "./pages/BrandInfoPage";
import ConnectOrManualPage from "./pages/ConnectOrManualPage";
import ShopifyConnectionPage from "./pages/ShopifyConnectionPage";
import ManualDataEntryPage from "./pages/ManualDataEntryPage";
import BenchmarkReportPage from "./pages/BenchmarkReportPage";
import MethodologyPage from "./pages/MethodologyPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import BlogsPage from "./pages/BlogsPage";
import BlogPostPage from "./pages/BlogPostPage";

function ScrollReset() {
  const { pathname } = useLocation();
  useEffect(() => {
    scrollToTop();
  }, [pathname]);
  return <Outlet />;
}

export const router = createBrowserRouter([
  {
    Component: ScrollReset,
    children: [
      { path: "/", Component: HomePage },
      { path: "/brand-info", Component: BrandInfoPage },
      { path: "/connect-or-manual", Component: ConnectOrManualPage },
      { path: "/shopify-connect", Component: ShopifyConnectionPage },
      { path: "/manual-entry", Component: ManualDataEntryPage },
      { path: "/benchmark-report", Component: BenchmarkReportPage },
      { path: "/methodology", Component: MethodologyPage },
      { path: "/privacy", Component: PrivacyPolicyPage },
      { path: "/blogs", Component: BlogsPage },
      { path: "/blogs/:slug", Component: BlogPostPage },
    ],
  },
]);
