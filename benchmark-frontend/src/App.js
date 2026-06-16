import { Routes, Route } from 'react-router-dom';
import { Container } from '@mui/material';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import ShopifyPage from './pages/ShopifyPage';
import ManualEntryPage from './pages/ManualEntryPage';
import ResultsPage from './pages/ResultsPage';
import ImportPage from './pages/ImportPage';
import BlogsPage from './pages/BlogsPage';

function App() {
  return (
    <div>
      <Navbar />
      <Container sx={{ mt: 10, mb: 6 }}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/import" element={<ImportPage />} />
          <Route path="/shopify" element={<ShopifyPage />} />
          <Route path="/manual" element={<ManualEntryPage />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="/blogs" element={<BlogsPage />} />
        </Routes>
      </Container>
    </div>
  );
}

export default App;
