from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.ensemble import IsolationForest
import numpy as np

app = Flask(__name__)
CORS(app)

# --- Recommendation Model ---
mock_nft_data = [
    {"id": 0, "name": "Abstract Sunrise", "description": "A vibrant abstract painting of a beautiful sunrise over the mountains."},
    {"id": 1, "name": "Mountain Vista", "description": "A serene landscape painting of a mountain range at dawn."},
    {"id": 2, "name": "Cyber Cityscape", "description": "A futuristic digital art piece showing a neon city at night."},
    {"id": 3, "name": "Neon Dreams", "description": "An abstract piece with glowing neon lines in a dark city."},
    {"id": 4, "name": "Ocean Serenity", "description": "A calming painting of a quiet ocean beach scene."}
]
nfts_df = pd.DataFrame(mock_nft_data)
nfts_df["content"] = nfts_df['name'] + ' ' + nfts_df['description']
tfidf = TfidfVectorizer(stop_words='english')
tfidf_matrix = tfidf.fit_transform(nfts_df['content'])
cosine_sim = cosine_similarity(tfidf_matrix, tfidf_matrix)
print("✅ Recommendation Model is ready.")

# --- Fraud Detection Model ---
# In a real app, this data would be a history of normal transactions
mock_transaction_data = np.random.rand(100, 2) * [100, 5000] # [Transaction Count, Avg Price]
fraud_model = IsolationForest(contamination=0.05)
fraud_model.fit(mock_transaction_data)
print("✅ Fraud Detection Model is ready.")


# --- API Endpoints ---
@app.route("/recommendations/<int:nft_id>", methods=['GET'])
def get_recommendations(nft_id):
    # ... (same as before) ...
    sim_scores = list(enumerate(cosine_sim[nft_id]))
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)[1:4]
    nft_indices = [i[0] for i in sim_scores]
    recommendations = nfts_df.iloc[nft_indices].to_dict('records')
    return jsonify(recommendations)

@app.route("/check-transaction", methods=['POST'])
def check_transaction():
    # Get transaction data from the request
    data = request.get_json()
    transaction_features = np.array([[data['transaction_count'], data['avg_price']]])

    # Predict if it's an anomaly (-1 for anomaly, 1 for normal)
    prediction = fraud_model.predict(transaction_features)

    # Get the anomaly score
    score = fraud_model.decision_function(transaction_features)

    is_anomaly = True if prediction[0] == -1 else False

    return jsonify({"is_anomaly": is_anomaly, "fraud_score": float(score[0])})

if __name__ == "__main__":
    app.run(debug=True, port=5000, host='0.0.0.0')