import { AppBar, Toolbar, Typography, Button, IconButton, useTheme, Box } from '@mui/material';
import { useThemeContext } from '../ThemeContext';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { ethers } from 'ethers';
import { useWalletStore } from '../store';

export const Header = () => {
  const theme = useTheme();
  const { toggleTheme } = useThemeContext();
  const { account, setAccount } = useWalletStore();

  const connectWallet = async () => {
    // Check if MetaMask is installed
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        // Prompt user for account connections
        const accounts = await provider.send('eth_requestAccounts', []);
        setAccount(accounts[0]);
      } catch (error) {
        console.error("Error connecting to MetaMask", error);
      }
    } else {
      alert("Please install MetaMask!");
    }
  };

  // Function to display a truncated address
  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          NFT Marketplace
        </Typography>
        
        <IconButton sx={{ ml: 1 }} onClick={toggleTheme} color="inherit">
          {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>

        {account ? (
          <Box sx={{ ml: 2, p: 1, border: '1px solid grey', borderRadius: '4px' }}>
            <Typography variant="body1">{truncateAddress(account)}</Typography>
          </Box>
        ) : (
          <Button color="inherit" onClick={connectWallet} sx={{ ml: 2 }}>
            Connect Wallet
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};