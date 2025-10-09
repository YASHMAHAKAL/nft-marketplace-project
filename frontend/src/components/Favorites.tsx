

import React, { useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { ArtworkCard } from './ArtworkCard';

export default function Favorites() {
  const { account, isConnected, isLoading: walletLoading, connectWallet } = useWallet();
  const { favoriteArtworks, isLoading, refreshFavorites } = useFavorites();

  // Refresh favorites when component mounts or account changes
  useEffect(() => {
    if (account && isConnected) {
      refreshFavorites();
    }
  }, [account, isConnected, refreshFavorites]);

  if (walletLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500"></div>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <section className="py-24 sm:py-32 bg-zinc-950">
        <div className="container mx-auto px-6">
          <div className="text-center min-h-[50vh] flex flex-col justify-center items-center">
            <h2 className="text-4xl font-light text-white mb-6">Connect Your Wallet</h2>
            <p className="text-lg text-zinc-400 mb-8 max-w-md">
              Please connect your MetaMask wallet to view your favorite artworks from our ancient collection
            </p>
            <button
              onClick={connectWallet}
              className="px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Connect Wallet
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 sm:py-32 bg-zinc-950">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-light tracking-tight text-white mb-4">
            Your Favorites
          </h1>
          <p className="text-lg text-zinc-400 leading-relaxed">
            Curated collection of your most treasured ancient artifacts
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
            <h3 className="text-xl text-zinc-400 font-light tracking-widest">Loading your treasures...</h3>
          </div>
        ) : favoriteArtworks.length === 0 ? (
          <div className="text-center py-24">
            <div className="mb-8">
              <svg className="w-24 h-24 text-zinc-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="text-2xl text-white mb-4 font-light">No Favorites Yet</h3>
            <p className="text-zinc-400 mb-8 max-w-md mx-auto">
              Start building your collection by clicking the heart icon on artworks that capture your imagination
            </p>
            <a 
              href="/"
              className="inline-block px-6 py-3 bg-amber-600 hover:bg-amber-700 text-black font-semibold rounded-lg transition-colors"
            >
              Explore Gallery
            </a>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="text-center">
              <p className="text-zinc-400">
                {favoriteArtworks.length} treasured artifact{favoriteArtworks.length !== 1 ? 's' : ''}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {favoriteArtworks.map((artwork) => (
                <ArtworkCard 
                  key={artwork.id} 
                  artwork={artwork}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}