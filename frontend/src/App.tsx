import { Box, Container, Typography } from '@mui/material';
import { Header } from './components/Header';

function App() {
  return (
    <Box>
      <Header />
      <Container sx={{ mt: 4 }}>
        <Typography variant="h4">
          Welcome to the Marketplace
        </Typography>
        {/* The grid of NFTs will go here later */}
      </Container>
    </Box>
  );
}

export default App;