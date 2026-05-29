import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  TextField,
  Typography,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import Loader from '../components/Loader';

function ImportPage() {
  const [stores, setStores] = useState([
    {
      id: 1,
      company_name: 'Aroha Wellness',
      shopifyStoreUrl: 'aroha.myshopify.com',
      shopifyToken: '',
      status: 'pending',
    },
    {
      id: 2,
      company_name: 'Nourish Labs',
      shopifyStoreUrl: 'nourishlabs.myshopify.com',
      shopifyToken: '',
      status: 'pending',
    },
    {
      id: 3,
      company_name: 'PurePulse',
      shopifyStoreUrl: 'purepulse.myshopify.com',
      shopifyToken: '',
      status: 'pending',
    },
    {
      id: 4,
      company_name: 'FreshBites',
      shopifyStoreUrl: 'freshbites.myshopify.com',
      shopifyToken: '',
      status: 'pending',
    },
    {
      id: 5,
      company_name: 'GlowGrain',
      shopifyStoreUrl: 'glowgrain.myshopify.com',
      shopifyToken: '',
      status: 'pending',
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);

  const handleTokenChange = (id, token) => {
    setStores(
      stores.map((store) => (store.id === id ? { ...store, shopifyToken: token } : store))
    );
  };

  const handleOpenDialog = (store) => {
    setSelectedStore(store);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedStore(null);
  };

  const handleImport = async () => {
    const allConfigured = stores.every((s) => s.shopifyToken && s.shopifyToken.startsWith('shpat_'));
    if (!allConfigured) {
      alert('Please configure all Shopify tokens before importing.');
      return;
    }

    setLoading(true);
    setResults(null);

    try {
      const response = await fetch('/shopify/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stores: stores.map((s) => ({
            company_name: s.company_name,
            shopifyStoreUrl: s.shopifyStoreUrl,
            shopifyToken: s.shopifyToken,
          })),
        }),
      });

      const data = await response.json();
      setResults(data.results);

      // Update store status based on results
      const updatedStores = stores.map((store) => {
        const result = data.results.find((r) => r.company_name === store.company_name);
        return {
          ...store,
          status: result?.status === 'success' ? 'success' : 'error',
          message: result?.message,
        };
      });
      setStores(updatedStores);
    } catch (error) {
      alert('Error importing data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Import Shopify Data
      </Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        Configure your Shopify access tokens and import real-time data for all 5 companies.
      </Typography>

      {loading && <Loader />}

      {results && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Import complete! {results.filter((r) => r.status === 'success').length} of {results.length} companies imported
          successfully.
        </Alert>
      )}

      <Grid container spacing={3}>
        {stores.map((store) => (
          <Grid item xs={12} md={6} key={store.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  {store.status === 'success' && <CheckCircleIcon sx={{ color: 'green', mr: 1 }} />}
                  {store.status === 'error' && <ErrorIcon sx={{ color: 'red', mr: 1 }} />}
                  <Typography variant="h6">{store.company_name}</Typography>
                </Box>

                <TextField
                  label="Shopify store URL"
                  value={store.shopifyStoreUrl}
                  fullWidth
                  disabled
                  size="small"
                  sx={{ mb: 2 }}
                />

                <TextField
                  label="Shopify access token"
                  type="password"
                  value={store.shopifyToken}
                  onChange={(e) => handleTokenChange(store.id, e.target.value)}
                  placeholder="shpat_..."
                  fullWidth
                  size="small"
                  sx={{ mb: 2 }}
                />

                {store.status === 'success' && (
                  <Typography variant="caption" sx={{ color: 'green' }}>
                    ✓ Imported successfully
                  </Typography>
                )}
                {store.status === 'error' && store.message && (
                  <Typography variant="caption" sx={{ color: 'red' }}>
                    ✗ {store.message}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
        <Button variant="contained" size="large" onClick={handleImport} disabled={loading}>
          Import all stores
        </Button>
        <Button variant="outlined" size="large">
          View setup guide
        </Button>
      </Box>

      {/* Setup Guide Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>How to get Shopify access tokens</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" gutterBottom>
              For each Shopify store, you need to create a private app:
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>1</ListItemIcon>
                <ListItemText primary="Go to your Shopify admin dashboard" />
              </ListItem>
              <ListItem>
                <ListItemIcon>2</ListItemIcon>
                <ListItemText primary="Navigate to Settings → Apps and integrations" />
              </ListItem>
              <ListItem>
                <ListItemIcon>3</ListItemIcon>
                <ListItemText primary="Click 'Develop apps' and create a new app" />
              </ListItem>
              <ListItem>
                <ListItemIcon>4</ListItemIcon>
                <ListItemText primary="Grant 'read' permissions for: orders, customers, products" />
              </ListItem>
              <ListItem>
                <ListItemIcon>5</ListItemIcon>
                <ListItemText primary="Generate an access token (starts with shpat_)" />
              </ListItem>
              <ListItem>
                <ListItemIcon>6</ListItemIcon>
                <ListItemText primary="Paste the token in the field above" />
              </ListItem>
            </List>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ImportPage;
