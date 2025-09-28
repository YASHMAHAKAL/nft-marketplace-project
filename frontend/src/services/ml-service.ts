import axios from 'axios';
import type { MLServiceInterface, FraudCheckResult } from '../types/ml-service';
import type { NFTRecommendation } from '../types/recommendation';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3005';

class MLServiceImpl implements MLServiceInterface {
  async getRecommendations(walletAddress: string): Promise<NFTRecommendation[]> {
    try {
      console.log('ML Service: Fetching recommendations for', walletAddress);
      
      const response = await axios.get(`${API_URL}/ml/recommendations/${walletAddress}`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      console.log('ML Service: Recommendations response:', response.data);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error: any) {
      console.error('ML Service: Failed to fetch recommendations:', error.message);
      return [];
    }
  }

  async checkFraud(tokenId: string): Promise<FraudCheckResult> {
    try {
      const response = await axios.post(`${API_URL}/ml/fraud-check`, { tokenId });
      return response.data;
    } catch (error) {
      console.error('Failed to check for fraud:', error);
      return {
        isFraudulent: false,
        confidence: 0,
        reason: 'Error checking for fraud'
      };
    }
  }

  async updateUserPreferences(walletAddress: string, tokenId: string): Promise<void> {
    try {
      console.log('ML Service: Updating preferences:', { walletAddress, tokenId });
      
      const response = await axios.post(`${API_URL}/ml/preferences`, {
        walletAddress,
        tokenId
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      console.log('ML Service: Preference update response:', response.data);
    } catch (error: any) {
      console.error('ML Service: Failed to update preferences:', error.message);
    }
  }

  async getFavorites(walletAddress: string): Promise<{tokenId: number, likedAt: string}[]> {
    try {
      console.log('ML Service: Fetching favorites for', walletAddress);
      
      const response = await axios.get(`${API_URL}/ml/favorites/${walletAddress}`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      console.log('ML Service: Favorites response:', response.data);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error: any) {
      console.error('ML Service: Failed to fetch favorites:', error.message);
      return [];
    }
  }

  async logView(walletAddress: string, tokenId: string): Promise<void> {
    try {
      console.log('ML Service: Logging view:', { walletAddress, tokenId });
      
      await axios.post(`${API_URL}/ml/views`, {
        walletAddress,
        tokenId
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
    } catch (error: any) {
      console.error('ML Service: Failed to log view:', error.message);
    }
  }
}

export const mlService = new MLServiceImpl();