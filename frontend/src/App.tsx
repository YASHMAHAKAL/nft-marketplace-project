import { Box } from '@mui/material';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { HomePage } from './pages/home';
import { MintPage } from './pages/mint';

function App() {
  return (
    <Router>
      <Box>
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/mint" element={<MintPage />} />
        </Routes>
      </Box>
    </Router>
  );
}

export default App;