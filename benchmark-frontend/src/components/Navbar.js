import { AppBar, Box, Button, Toolbar, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <AppBar position="fixed" sx={{ backgroundColor: '#0d47a1' }}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Benchmark Frontend
        </Typography>
        <Box>
          <Button color="inherit" component={Link} to="/">
            Home
          </Button>
          <Button color="inherit" component={Link} to="/import">
            Import
          </Button>
          <Button color="inherit" component={Link} to="/shopify">
            Shopify
          </Button>
          <Button color="inherit" component={Link} to="/manual">
            Manual
          </Button>
          <Button color="inherit" component={Link} to="/results">
            Results
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
