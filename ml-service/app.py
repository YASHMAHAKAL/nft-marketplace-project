from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app) # Allows our frontend to make requests

# Placeholder for NFT recommendations
@app.route("/recommendations", methods=['GET'])
def get_recommendations():
    mock_recommendations = [
        {"id": 101, "name": "AI Art #1"},
        {"id": 102, "name": "AI Art #2"},
    ]
    return jsonify(mock_recommendations)

# Placeholder for transaction checks
@app.route("/check-transaction", methods=['POST'])
def check_transaction():
    return jsonify({"fraud_score": 0.1})

if __name__ == "__main__":
    app.run(debug=True, port=5000)