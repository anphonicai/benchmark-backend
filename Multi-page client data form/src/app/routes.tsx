import { createBrowserRouter } from "react-router";
import HomePage from "./pages/HomePage";
import BrandInfoPage from "./pages/BrandInfoPage";
import ConnectOrManualPage from "./pages/ConnectOrManualPage";
import ShopifyConnectionPage from "./pages/ShopifyConnectionPage";
import ManualDataEntryPage from "./pages/ManualDataEntryPage";
import BenchmarkReportPage from "./pages/BenchmarkReportPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: HomePage,
  },
  {
    path: "/brand-info",
    Component: BrandInfoPage,
  },
  {
    path: "/connect-or-manual",
    Component: ConnectOrManualPage,
  },
  {
    path: "/shopify-connect",
    Component: ShopifyConnectionPage,
  },
  {
    path: "/manual-entry",
    Component: ManualDataEntryPage,
  },
  {
    path: "/benchmark-report",
    Component: BenchmarkReportPage,
  },
]);
