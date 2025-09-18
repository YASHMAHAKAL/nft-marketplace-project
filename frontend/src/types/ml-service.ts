import { NFTRecommendation } from './recommendation';

export interface FraudCheckResult {
  isFraudulent: boolean;
  confidence: number;
  reason?: string;
}

export interface MLServiceInterface {
  getRecommendations(walletAddress: string): Promise<NFTRecommendation[]>;
  checkFraud(tokenId: string): Promise<FraudCheckResult>;
  updateUserPreferences(walletAddress: string, tokenId: string): Promise<void>;
}