import { Container, Typography } from '@mui/material';
import { NFTGrid } from '../components/NFTGrid';

export const HomePage = () => {
  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Explore the Marketplace
      </Typography>
      <NFTGrid />
    </Container>
  );
};