from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.ensemble import IsolationForest
import numpy as np
import datetime
import os

app = Flask(__name__)
CORS(app)

# Health check endpoint
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.datetime.utcnow().isoformat(),
        'service': 'ml-service',
        'version': '1.0.0',
        'model_status': {
            'recommendation_model': 'loaded',
            'fraud_detection_model': 'loaded'
        }
    }), 200

# --- Enhanced NFT Dataset ---
mock_nft_data = [
    {"id": 0, "name": "Abstract Sunrise", "description": "A vibrant abstract painting capturing the beauty of dawn over mountains with warm colors."},
    {"id": 1, "name": "Mountain Vista", "description": "A serene landscape painting showcasing majestic mountain ranges at the break of dawn."},
    {"id": 2, "name": "Cyber Cityscape", "description": "A futuristic digital art piece depicting a neon-lit cyberpunk city during nighttime."},
    {"id": 3, "name": "Neon Dreams", "description": "An abstract digital artwork featuring glowing neon lines and patterns in urban darkness."},
    {"id": 4, "name": "Ocean Serenity", "description": "A tranquil painting of peaceful ocean waves meeting a pristine sandy beach."},
    {"id": 5, "name": "Forest Mystique", "description": "A mysterious forest scene with ancient trees and filtered sunlight creating magical atmosphere."},
    {"id": 6, "name": "Urban Pulse", "description": "A dynamic cityscape artwork capturing the energy and rhythm of metropolitan life."},
    {"id": 7, "name": "Desert Solitude", "description": "A contemplative desert landscape with vast dunes under a star-filled sky."},
    {"id": 8, "name": "Floral Harmony", "description": "A delicate botanical artwork featuring harmonious flower arrangements in soft pastels."},
    {"id": 9, "name": "Cosmic Journey", "description": "A space-themed digital art depicting interstellar travel through nebulae and stars."}
]

# Initialize ML models
nfts_df = pd.DataFrame(mock_nft_data)
nfts_df["content"] = nfts_df['name'] + ' ' + nfts_df['description']

# TF-IDF Vectorizer for content similarity
tfidf = TfidfVectorizer(stop_words='english', max_features=100)
tfidf_matrix = tfidf.fit_transform(nfts_df['content'])
cosine_sim = cosine_similarity(tfidf_matrix, tfidf_matrix)

print("✅ Recommendation Model loaded with", len(mock_nft_data), "NFTs")

# --- Fraud Detection Model ---
# Simulate transaction patterns for fraud detection
np.random.seed(42)  # For consistent results
normal_transactions = np.random.rand(200, 2) * [50, 3000]  # [Transaction Count, Avg Price]
fraud_model = IsolationForest(contamination=0.1, random_state=42)
fraud_model.fit(normal_transactions)
print("✅ Fraud Detection Model loaded and trained")

# --- API Endpoints ---

@app.route("/recommendations/<int:nft_id>", methods=['GET'])
def get_recommendations(nft_id):
    """Get NFT recommendations based on content similarity"""
    try:
        print(f"🎯 Getting recommendations for NFT ID: {nft_id}")
        
        # Check if NFT ID is valid
        if nft_id >= len(nfts_df) or nft_id < 0:
            return jsonify([])  # Return empty if invalid ID
        
        # Get similarity scores for the given NFT
        sim_scores = list(enumerate(cosine_sim[nft_id]))
        
        # Sort by similarity (excluding the NFT itself)
        sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)[1:4]
        
        # Get recommended NFT indices
        nft_indices = [i[0] for i in sim_scores]
        
        # Build recommendations with similarity scores
        recommendations = []
        for idx, similarity_score in zip(nft_indices, [score[1] for score in sim_scores]):
            nft_data = nfts_df.iloc[idx].to_dict()
            recommendations.append({
                "id": int(nft_data["id"]),
                "name": nft_data["name"],
                "description": nft_data["description"],
                "similarity": float(similarity_score),
                "confidence": min(0.95, float(similarity_score) + 0.1)
            })
        
        print(f"✅ Returning {len(recommendations)} recommendations")
        return jsonify(recommendations)
        
    except Exception as e:
        print(f"❌ Error in recommendations: {str(e)}")
        return jsonify([])

@app.route("/check-transaction", methods=['POST'])
def check_transaction():
    """Check if a transaction pattern indicates fraud"""
    try:
        data = request.get_json()
        print(f"🛡️ Fraud check request: {data}")
        
        # Extract transaction features
        transaction_count = data.get('transaction_count', 1)
        avg_price = data.get('avg_price', 1.0)
        
        # Prepare features for ML model
        transaction_features = np.array([[transaction_count, avg_price]])
        
        # Predict if it's an anomaly (-1 for anomaly, 1 for normal)
        prediction = fraud_model.predict(transaction_features)
        
        # Get the anomaly score (more negative = more anomalous)
        score = fraud_model.decision_function(transaction_features)
        
        is_anomaly = True if prediction[0] == -1 else False
        fraud_score = float(score[0])
        
        result = {
            "is_anomaly": is_anomaly,
            "fraud_score": fraud_score,
            "confidence": min(95.0, abs(fraud_score) * 100),
            "risk_level": "high" if is_anomaly else "low"
        }
        
        print(f"✅ Fraud check result: {result}")
        return jsonify(result)
        
    except Exception as e:
        print(f"❌ Error in fraud check: {str(e)}")
        return jsonify({
            "is_anomaly": False,
            "fraud_score": 0.0,
            "confidence": 50.0,
            "risk_level": "unknown"
        })

@app.route("/user-insights/<wallet_address>", methods=['GET'])
def get_user_insights(wallet_address):
    """Get user behavior insights and preferences"""
    try:
        print(f"📊 Getting insights for wallet: {wallet_address}")
        
        # Mock user insights based on wallet address
        # In a real implementation, this would analyze user transaction history
        insights = {
            "preferred_categories": ["abstract", "landscape", "digital"],
            "avg_price_range": {"min": 0.5, "max": 2.0},
            "interaction_count": np.random.randint(5, 50),
            "recommendation_accuracy": np.random.uniform(0.7, 0.95),
            "last_activity": datetime.datetime.utcnow().isoformat()
        }
        
        print(f"✅ Returning insights: {insights}")
        return jsonify(insights)
        
    except Exception as e:
        print(f"❌ Error getting user insights: {str(e)}")
        return jsonify({"error": "Failed to get user insights"})

@app.route("/trending", methods=['GET'])
def get_trending_nfts():
    """Get trending NFTs based on simulated market data"""
    try:
        print("📈 Getting trending NFTs")
        
        # Simulate trending NFTs with random weights
        trending_scores = np.random.uniform(0.5, 1.0, len(nfts_df))
        
        # Get top 5 trending NFTs
        trending_indices = np.argsort(trending_scores)[-5:][::-1]
        
        trending_nfts = []
        for idx in trending_indices:
            nft_data = nfts_df.iloc[idx].to_dict()
            trending_nfts.append({
                "id": int(nft_data["id"]),
                "name": nft_data["name"],
                "description": nft_data["description"],
                "trending_score": float(trending_scores[idx]),
                "volume_24h": np.random.uniform(10, 100),
                "price_change": np.random.uniform(-20, 30)
            })
        
        print(f"✅ Returning {len(trending_nfts)} trending NFTs")
        return jsonify(trending_nfts)
        
    except Exception as e:
        print(f"❌ Error getting trending NFTs: {str(e)}")
        return jsonify([])

@app.route("/similar-users/<wallet_address>", methods=['GET'])
def get_similar_users(wallet_address):
    """Find users with similar preferences"""
    try:
        print(f"👥 Finding similar users for: {wallet_address}")
        
        # Mock similar users (in reality, this would use collaborative filtering)
        similar_users = [
            {
                "wallet_address": "0x" + "1" * 40,
                "similarity": 0.85,
                "common_interests": ["abstract", "digital"],
                "trust_score": 0.92
            },
            {
                "wallet_address": "0x" + "2" * 40,
                "similarity": 0.78,
                "common_interests": ["landscape", "nature"],
                "trust_score": 0.88
            }
        ]
        
        print(f"✅ Found {len(similar_users)} similar users")
        return jsonify(similar_users)
        
    except Exception as e:
        print(f"❌ Error finding similar users: {str(e)}")
        return jsonify([])

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Endpoint not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error"}), 500

if __name__ == "__main__":
    print("🚀 Starting ML Service...")
    print(f"📊 Loaded {len(mock_nft_data)} NFTs for recommendations")
    print("🛡️ Fraud detection model ready")
    print("🔗 API endpoints available:")
    print("   GET  /health - Service health check")
    print("   GET  /recommendations/<nft_id> - Get NFT recommendations")
    print("   POST /check-transaction - Check transaction for fraud")
    print("   GET  /user-insights/<wallet> - Get user behavior insights") 
    print("   GET  /trending - Get trending NFTs")
    print("   GET  /similar-users/<wallet> - Find similar users")
    
    app.run(debug=True, port=5000, host='0.0.0.0')