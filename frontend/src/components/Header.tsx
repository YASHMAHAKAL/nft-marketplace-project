import { Link as RouterLink } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, IconButton, useTheme, Box } from '@mui/material';
import { useThemeContext } from '../ThemeContext';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { ethers } from 'ethers';
import { useWalletStore } from '../store';

export const Header = () => {
  const theme = useTheme();
  const { toggleTheme } = useThemeContext();
  const { account, setAccount, jwt, setJwt } = useWalletStore();

  const handleLogin = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask!");
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      // 1. Get nonce from backend
      const nonceRes = await fetch(`http://localhost:3002/auth/nonce/${address}`);
      const { nonce } = await nonceRes.json();

      // 2. Prompt user to sign the message
      const message = `Please sign this message to log in: ${nonce}`;
      const signature = await signer.signMessage(message);

      // 3. Verify signature with backend and get JWT
      const verifyRes = await fetch('http://localhost:3002/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, signature }),
      });

      if (!verifyRes.ok) {
        throw new Error("Signature verification failed");
      }

      const { token } = await verifyRes.json();

      // 4. Save account and JWT to state
      setAccount(address);
      setJwt(token);
      console.log("Login successful, JWT:", token);

    } catch (error) {
      console.error("Error during login process", error);
      alert("Login failed!");
    }
  };

  const truncateAddress = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`;

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          <RouterLink to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            NFT Marketplace
          </RouterLink>
        </Typography>

        <Button color="inherit" component={RouterLink} to="/mint">
          Mint
        </Button>
        
        <IconButton sx={{ ml: 1 }} onClick={toggleTheme} color="inherit">
          {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>

        {account && jwt ? (
          <Box sx={{ ml: 2, p: 1, border: '1px solid grey', borderRadius: '4px' }}>
            <Typography variant="body1">{truncateAddress(account)}</Typography>
          </Box>
        ) : (
          <Button color="inherit" onClick={handleLogin} sx={{ ml: 2 }}>
            Connect & Login
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};