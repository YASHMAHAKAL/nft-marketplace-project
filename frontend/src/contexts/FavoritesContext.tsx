// frontend/src/contexts/FavoritesContext.tsx

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useWallet } from './WalletContext';
import { mlService } from '../services/ml-service';
import type { Artwork } from '../types/artwork';

interface FavoritesContextType {
  favoriteIds: string[];
  favoriteArtworks: Artwork[];
  isLoading: boolean;
  addFavorite: (artwork: Artwork) => Promise<void>;
  removeFavorite: (artworkId: string) => Promise<void>;
  toggleFavorite: (artwork: Artwork) => Promise<void>;
  isFavorite: (artworkId: string) => boolean;
  refreshFavorites: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

interface FavoritesProviderProps {
  children: ReactNode;
}

export function FavoritesProvider({ children }: FavoritesProviderProps) {
  const { account, isConnected } = useWallet();
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [favoriteArtworks, setFavoriteArtworks] = useState<Artwork[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load favorites when wallet connects
  const loadFavorites = async () => {
    if (!account || !isConnected) {
      setFavoriteIds([]);
      setFavoriteArtworks([]);
      return;
    }

    try {
      setIsLoading(true);
      console.log('🔍 [FAVORITES CONTEXT] Loading favorites for:', account);
      
      const favorites = await mlService.getFavorites(account);
      const ids = favorites.map(fav => fav.tokenId.toString());
      
      setFavoriteIds(ids);
      console.log('✅ [FAVORITES CONTEXT] Loaded', ids.length, 'favorite IDs:', ids);
    } catch (error) {
      console.error('❌ [FAVORITES CONTEXT] Error loading favorites:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load favorites when account changes
  useEffect(() => {
    loadFavorites();
  }, [account, isConnected]);

  const addFavorite = async (artwork: Artwork) => {
    if (!account) return;

    try {
      console.log('➕ [FAVORITES CONTEXT] Adding favorite:', artwork.id);
      
      await mlService.updateUserPreferences(account, artwork.id);
      
      // Update local state immediately for better UX
      setFavoriteIds(prev => [...new Set([...prev, artwork.id])]);
      setFavoriteArtworks(prev => {
        const exists = prev.some(fav => fav.id === artwork.id);
        return exists ? prev : [...prev, artwork];
      });
      
      console.log('✅ [FAVORITES CONTEXT] Added favorite successfully');
    } catch (error) {
      console.error('❌ [FAVORITES CONTEXT] Error adding favorite:', error);
    }
  };

  const removeFavorite = async (artworkId: string) => {
    if (!account) return;

    try {
      console.log('➖ [FAVORITES CONTEXT] Removing favorite:', artworkId);
      
      await mlService.updateUserPreferences(account, artworkId);
      
      // Update local state immediately
      setFavoriteIds(prev => prev.filter(id => id !== artworkId));
      setFavoriteArtworks(prev => prev.filter(artwork => artwork.id !== artworkId));
      
      console.log('✅ [FAVORITES CONTEXT] Removed favorite successfully');
    } catch (error) {
      console.error('❌ [FAVORITES CONTEXT] Error removing favorite:', error);
    }
  };

  const toggleFavorite = async (artwork: Artwork) => {
    if (isFavorite(artwork.id)) {
      await removeFavorite(artwork.id);
    } else {
      await addFavorite(artwork);
    }
  };

  const isFavorite = (artworkId: string): boolean => {
    return favoriteIds.includes(artworkId);
  };

  const refreshFavorites = async () => {
    await loadFavorites();
  };

  const value: FavoritesContextType = {
    favoriteIds,
    favoriteArtworks,
    isLoading,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    refreshFavorites
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}