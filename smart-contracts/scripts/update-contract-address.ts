import fs from 'fs';
import path from 'path';

export async function updateContractAddress(contractAddress: string) {
  try {
    // Update smart-contracts/.env
    const contractEnvPath = path.join(__dirname, '../.env');
    let contractEnvContent = '';
    
    try {
      contractEnvContent = fs.readFileSync(contractEnvPath, 'utf8');
    } catch (error) {
      console.log('Creating new .env file in smart-contracts/');
    }

    // Preserve existing content while updating/adding CONTRACT_ADDRESS
    const envLines = contractEnvContent.split('\n').filter(line => !line.startsWith('CONTRACT_ADDRESS='));
    envLines.push(`CONTRACT_ADDRESS="${contractAddress}"`);
    
    fs.writeFileSync(contractEnvPath, envLines.join('\n') + '\n');
    console.log('✓ Updated smart-contracts/.env');
    console.log(`  New contract address: ${contractAddress}`);

    // Update frontend/.env
    const frontendEnvPath = path.join(__dirname, '../../frontend/.env');
    let frontendEnvContent = '';
    
    try {
      frontendEnvContent = fs.readFileSync(frontendEnvPath, 'utf8');
    } catch (error) {
      console.log('Creating new .env file in frontend/');
    }

    // Preserve existing content while updating/adding VITE_CONTRACT_ADDRESS
    const frontendEnvLines = frontendEnvContent.split('\n').filter(line => !line.startsWith('VITE_CONTRACT_ADDRESS='));
    frontendEnvLines.push(`VITE_CONTRACT_ADDRESS="${contractAddress}"`);
    
    fs.writeFileSync(frontendEnvPath, frontendEnvLines.join('\n') + '\n');
    console.log('✓ Updated frontend/.env');
    console.log(`  New contract address: ${contractAddress}`);

    console.log(`\n✅ Contract address has been updated in both .env files`);
  } catch (error) {
    console.error('Failed to update contract addresses:', error);
    throw error;
  }
}