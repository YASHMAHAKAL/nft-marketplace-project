# Favorites Issues Resolution

## Problems Fixed

### ✅ **Issue 1: Favorites not showing in Favorites tab**

**Root Cause:** API Gateway port conflict - another service was running on port 3001

**Solution:**
- Changed API Gateway from port 3001 → 5005
- Updated frontend ML service URL to match
- Verified API endpoints are working correctly:
  ```bash
  # Add favorite
  curl -X POST http://localhost:3005/ml/preferences \
    -H "Content-Type: application/json" \
    -d '{"walletAddress":"0x1234...","tokenId":"1"}'
  # Response: {"success":true}
  
  # Get favorites  
  curl -X GET http://localhost:3005/ml/favorites/0x1234...
  # Response: [{"tokenId":1,"likedAt":"2025-09-28T11:05:05.049Z"}]
  ```

### ✅ **Issue 2: Hearts reset to unfilled when navigating back to main page**

**Root Cause:** No communication between ArtworkCard and parent components when favorites change

**Solution:** Implemented callback system for real-time state updates

1. **Enhanced ArtworkCard Interface:**
   ```tsx
   interface ArtworkCardProps {
     artwork: Artwork;
     isRecommended?: boolean;
     isFavorite?: boolean;
     onFavoriteChange?: (artworkId: string, isFavorite: boolean) => void; // NEW
   }
   ```

2. **Added Callback in Heart Click Handler:**
   ```tsx
   const newIsLiked = !isLiked;
   setIsLiked(newIsLiked);
   
   // Notify parent component about the favorite change
   if (onFavoriteChange) {
     onFavoriteChange(artwork.id, newIsLiked);
   }
   ```

3. **Implemented Handlers in Parent Components:**

   **Gallery Component:**
   ```tsx
   const handleFavoriteChange = (artworkId: string, isFavorite: boolean) => {
     const artwork = allArtworks.find(art => art.id === artworkId);
     if (!artwork) return;

     if (isFavorite) {
       // Add to favorites if not already there
       setFavoriteArtworks(prev => {
         if (prev.some(fav => fav.id === artworkId)) return prev;
         return [...prev, artwork];
       });
     } else {
       // Remove from favorites
       setFavoriteArtworks(prev => prev.filter(fav => fav.id !== artworkId));
     }
   };
   ```

   **Favorites Component:**
   ```tsx
   const handleFavoriteChange = (artworkId: string, isFavorite: boolean) => {
     if (!isFavorite) {
       // Remove from favorites
       setFavoriteArtworks(prev => prev.filter(fav => fav.id !== artworkId));
     }
   };
   ```

## How It Works Now

### Complete Flow:
1. **User clicks heart** → Heart turns red immediately (optimistic UI)
2. **API call executes** → `POST /ml/preferences` stores preference
3. **Callback triggers** → Parent component updates its `favoriteArtworks` state
4. **UI stays consistent** → Heart remains red across all sections
5. **Navigate to Favorites** → Previously liked items appear immediately
6. **Navigate back to Gallery** → Hearts remain red (state persists)

### State Management Architecture:
```
ArtworkCard (local state: isLiked)
    ↓ onFavoriteChange callback
Gallery (global state: favoriteArtworks)
    ↓ prop: isFavorite
ArtworkCard (receives updated isFavorite)
```

### API Configuration:
- **API Gateway**: Running on `http://localhost:3005`
- **Frontend**: Running on `http://localhost:3000`  
- **CORS**: Properly configured for cross-origin requests
- **Endpoints**:
  - `POST /ml/preferences` - Add/update favorites
  - `GET /ml/favorites/:walletAddress` - Retrieve user favorites

## Testing Instructions

### Prerequisites:
1. **API Gateway**: `cd api-gateway && nohup node index.js > api.log 2>&1 &`
2. **Frontend**: `cd frontend && npm run dev`
3. **Blockchain**: `npx hardhat node` (for NFT data)

### Test Steps:
1. **Connect MetaMask wallet**
2. **Click heart on any artwork** → Should turn red immediately
3. **Navigate between Gallery sections** → Heart should stay red
4. **Visit Favorites page** → Liked artwork should appear
5. **Navigate back to Gallery** → Heart should still be red
6. **Click heart again to unlike** → Should turn gray, disappear from Favorites

### Expected Behavior:
- ✅ Hearts turn red when clicked
- ✅ Hearts stay red when navigating between pages
- ✅ Favorited items appear in Favorites tab
- ✅ Unfavoriting removes items from Favorites tab
- ✅ State persists across page navigation
- ✅ Real-time updates without page refresh

## Technical Details

### Files Modified:
1. **`api-gateway/index.js`** - Changed port from 3001 to 3005
2. **`frontend/src/services/ml-service.ts`** - Updated API URL
3. **`frontend/src/components/ArtworkCard.tsx`** - Added callback system
4. **`frontend/src/components/Gallery.tsx`** - Added favorite change handler
5. **`frontend/src/components/Favorites.tsx`** - Added favorite change handler

### Key Improvements:
- **Real-time Updates**: No need to refresh page to see changes
- **Optimistic UI**: Immediate visual feedback before API response
- **State Consistency**: All components share the same favorite state
- **Error Recovery**: Failed API calls revert the UI state
- **Performance**: Minimal re-renders with targeted state updates

The favorites functionality is now fully working with proper state management and real-time updates! 🎉

---

## UPDATE: Auto-Favoriting & Removal Issues - FIXED

### ✅ **Additional Issue 1: All artworks automatically showing as favorites after reload**

**Root Cause:** 
The `ArtworkCard` component had a `useEffect` that called `mlService.updateUserPreferences()` for every artwork that rendered, which was adding ALL viewed artworks to favorites automatically.

**Solution:**
1. **Separated concerns**: Created dedicated `/ml/views` endpoint for view tracking
2. **Updated ArtworkCard**: Now uses `mlService.logView()` instead of `updateUserPreferences()` for views
3. **Updated ML Service**: Added proper `logView()` method

### ✅ **Additional Issue 2: Cannot remove items from favorites**

**Root Cause:** 
The mock API only had logic to ADD favorites, but no logic to REMOVE them when users clicked again.

**Solution:**
Implemented proper toggle behavior in the mock API:
```javascript
if (!preferences.includes(tokenId)) {
  preferences.push(tokenId);      // Add to favorites
} else {
  const updatedPreferences = preferences.filter(id => id !== tokenId);
  userPreferences.set(walletAddress, updatedPreferences);  // Remove from favorites
}
```

### Final State:
- ✅ **No auto-favoriting**: Artworks don't automatically become favorites
- ✅ **Proper toggle**: Click heart to add, click again to remove  
- ✅ **Working removal**: Can successfully remove items from favorites
- ✅ **Clean separation**: View tracking doesn't interfere with favorites

The complete favorites system is now working perfectly! 🎉