#!/usr/bin/env python3
"""
AI-Powered Predictive Scaling Service for NFT Marketplace
Implements machine learning models to predict resource needs based on market trends
"""

import asyncio
import json
import logging
import os
import time
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple

import aiohttp
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from kubernetes import client, config
from prometheus_client import Gauge, Counter, Histogram, generate_latest
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import yaml

# Configure logging
logging.basicConfig(
    level=getattr(logging, os.getenv('LOG_LEVEL', 'INFO')),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Prometheus metrics
prediction_accuracy = Gauge('ai_scaler_prediction_accuracy', 'Prediction accuracy score')
scaling_decisions = Counter('ai_scaler_decisions_total', 'Total scaling decisions', ['action', 'service'])
prediction_latency = Histogram('ai_scaler_prediction_seconds', 'Time to generate predictions')
model_training_duration = Histogram('ai_scaler_training_seconds', 'Model training duration', ['model_type'])

app = FastAPI(title="AI Predictive Scaler", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class NFTMarketPredictor:
    """Advanced ML model for NFT marketplace demand prediction"""
    
    def __init__(self):
        self.models = {
            'demand': GradientBoostingRegressor(n_estimators=100, learning_rate=0.1),
            'transaction_volume': RandomForestRegressor(n_estimators=50),
            'ml_load': LinearRegression(),
            'gas_price': GradientBoostingRegressor(n_estimators=50)
        }
        self.scalers = {name: StandardScaler() for name in self.models.keys()}
        self.feature_columns = []
        self.last_training = {}
        
    async def collect_features(self, prometheus_url: str, lookback_hours: int = 24) -> pd.DataFrame:
        """Collect features from Prometheus metrics"""
        try:
            features = []
            current_time = int(time.time())
            step = 300  # 5-minute intervals
            
            queries = {
                'transaction_rate': 'rate(nft_transactions_total[5m])',
                'user_count': 'count(increase(user_sessions_total[1h]) > 0)',
                'gas_price': 'ethereum_gas_price_gwei',
                'ml_requests': 'rate(ml_inference_requests_total[5m])',
                'response_time_p95': 'histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))',
                'error_rate': 'rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m])',
                'cpu_usage': 'avg(rate(container_cpu_usage_seconds_total[5m])) by (pod)',
                'memory_usage': 'avg(container_memory_working_set_bytes) by (pod)',
                'cache_hit_ratio': 'redis_cache_hits / (redis_cache_hits + redis_cache_misses)',
            }
            
            async with aiohttp.ClientSession() as session:
                for metric_name, query in queries.items():
                    url = f"{prometheus_url}/api/v1/query_range"
                    params = {
                        'query': query,
                        'start': current_time - (lookback_hours * 3600),
                        'end': current_time,
                        'step': step
                    }
                    
                    async with session.get(url, params=params) as resp:
                        if resp.status == 200:
                            data = await resp.json()
                            if data.get('data', {}).get('result'):
                                for result in data['data']['result']:
                                    for timestamp, value in result['values']:
                                        features.append({
                                            'timestamp': timestamp,
                                            'metric': metric_name,
                                            'value': float(value) if value != 'NaN' else 0,
                                            'labels': result.get('metric', {})
                                        })
            
            if not features:
                logger.warning("No features collected, using synthetic data")
                return self._generate_synthetic_features()
            
            df = pd.DataFrame(features)
            df['timestamp'] = pd.to_datetime(df['timestamp'], unit='s')
            
            # Pivot to get metrics as columns
            pivot_df = df.pivot_table(
                index='timestamp', 
                columns='metric', 
                values='value', 
                aggfunc='mean'
            ).fillna(0)
            
            # Add time-based features
            pivot_df['hour'] = pivot_df.index.hour
            pivot_df['day_of_week'] = pivot_df.index.dayofweek
            pivot_df['is_weekend'] = (pivot_df.index.dayofweek >= 5).astype(int)
            
            # Add rolling averages
            for col in ['transaction_rate', 'user_count', 'gas_price']:
                if col in pivot_df.columns:
                    pivot_df[f'{col}_rolling_1h'] = pivot_df[col].rolling(window=12, min_periods=1).mean()
                    pivot_df[f'{col}_rolling_6h'] = pivot_df[col].rolling(window=72, min_periods=1).mean()
            
            return pivot_df.fillna(0)
            
        except Exception as e:
            logger.error(f"Error collecting features: {e}")
            return self._generate_synthetic_features()
    
    def _generate_synthetic_features(self) -> pd.DataFrame:
        """Generate synthetic features for testing"""
        dates = pd.date_range(start=datetime.now() - timedelta(hours=24), 
                             end=datetime.now(), freq='5T')
        
        np.random.seed(42)
        n_points = len(dates)
        
        # Simulate daily patterns
        hour_effect = np.sin(2 * np.pi * dates.hour / 24) + 0.5
        day_effect = np.sin(2 * np.pi * dates.dayofweek / 7) + 0.5
        
        data = {
            'transaction_rate': np.maximum(0, hour_effect * 10 + np.random.normal(0, 2, n_points)),
            'user_count': np.maximum(0, (hour_effect + day_effect) * 50 + np.random.normal(0, 10, n_points)),
            'gas_price': np.maximum(20, 50 + hour_effect * 30 + np.random.normal(0, 10, n_points)),
            'ml_requests': np.maximum(0, hour_effect * 5 + np.random.normal(0, 1, n_points)),
            'response_time_p95': np.maximum(0.1, 0.5 + hour_effect * 0.3 + np.random.normal(0, 0.1, n_points)),
            'error_rate': np.maximum(0, 0.01 + np.random.normal(0, 0.005, n_points)),
            'cpu_usage': np.clip(0.3 + hour_effect * 0.4 + np.random.normal(0, 0.1, n_points), 0, 1),
            'memory_usage': np.maximum(0, 500000000 + hour_effect * 200000000 + np.random.normal(0, 50000000, n_points)),
            'cache_hit_ratio': np.clip(0.8 + np.random.normal(0, 0.1, n_points), 0, 1),
            'hour': dates.hour,
            'day_of_week': dates.dayofweek,
            'is_weekend': (dates.dayofweek >= 5).astype(int)
        }
        
        df = pd.DataFrame(data, index=dates)
        
        # Add rolling averages
        for col in ['transaction_rate', 'user_count', 'gas_price']:
            df[f'{col}_rolling_1h'] = df[col].rolling(window=12, min_periods=1).mean()
            df[f'{col}_rolling_6h'] = df[col].rolling(window=72, min_periods=1).mean()
        
        return df
    
    async def train_models(self, features_df: pd.DataFrame):
        """Train prediction models"""
        try:
            if features_df.empty:
                logger.warning("No data available for training")
                return
            
            # Create target variables (next period predictions)
            targets = {}
            targets['demand'] = features_df['transaction_rate'].shift(-12).fillna(method='ffill')  # 1 hour ahead
            targets['transaction_volume'] = features_df['transaction_rate'].shift(-4).fillna(method='ffill')  # 20 min ahead
            targets['ml_load'] = features_df['ml_requests'].shift(-6).fillna(method='ffill')  # 30 min ahead
            targets['gas_price'] = features_df['gas_price'].shift(-2).fillna(method='ffill')  # 10 min ahead
            
            # Prepare features
            feature_cols = [col for col in features_df.columns 
                           if not col.endswith('_target') and col not in ['timestamp']]
            self.feature_columns = feature_cols
            
            X = features_df[feature_cols].fillna(0)
            
            for model_name, model in self.models.items():
                if model_name not in targets:
                    continue
                
                start_time = time.time()
                y = targets[model_name].fillna(0)
                
                if len(X) < 10:  # Not enough data
                    logger.warning(f"Not enough data to train {model_name} model")
                    continue
                
                # Split data
                X_train, X_test, y_train, y_test = train_test_split(
                    X, y, test_size=0.2, random_state=42, shuffle=False
                )
                
                # Scale features
                X_train_scaled = self.scalers[model_name].fit_transform(X_train)
                X_test_scaled = self.scalers[model_name].transform(X_test)
                
                # Train model
                model.fit(X_train_scaled, y_train)
                
                # Evaluate
                y_pred = model.predict(X_test_scaled)
                mae = mean_absolute_error(y_test, y_pred)
                mse = mean_squared_error(y_test, y_pred)
                accuracy = max(0, 1 - (mae / (y_test.mean() + 1e-8)))
                
                training_time = time.time() - start_time
                model_training_duration.labels(model_type=model_name).observe(training_time)
                
                self.last_training[model_name] = {
                    'timestamp': datetime.now(),
                    'accuracy': accuracy,
                    'mae': mae,
                    'mse': mse,
                    'samples': len(X_train)
                }
                
                logger.info(f"Trained {model_name} model - Accuracy: {accuracy:.3f}, MAE: {mae:.3f}")
                
                if model_name == 'demand':  # Update global accuracy metric
                    prediction_accuracy.set(accuracy)
        
        except Exception as e:
            logger.error(f"Error training models: {e}")
    
    async def predict(self, features_df: pd.DataFrame) -> Dict[str, float]:
        """Generate predictions for scaling decisions"""
        try:
            with prediction_latency.time():
                if features_df.empty or not self.feature_columns:
                    logger.warning("No features available for prediction")
                    return self._get_default_predictions()
                
                # Use latest data point
                latest_features = features_df[self.feature_columns].iloc[-1:].fillna(0)
                
                predictions = {}
                for model_name, model in self.models.items():
                    try:
                        if model_name not in self.scalers:
                            continue
                            
                        features_scaled = self.scalers[model_name].transform(latest_features)
                        pred = model.predict(features_scaled)[0]
                        predictions[f'predicted_{model_name}'] = max(0, pred)
                    
                    except Exception as e:
                        logger.warning(f"Error predicting {model_name}: {e}")
                        predictions[f'predicted_{model_name}'] = 0
                
                # Add composite predictions
                predictions['predicted_api_load'] = (
                    predictions.get('predicted_demand', 0) * 0.6 + 
                    predictions.get('predicted_transaction_volume', 0) * 0.4
                )
                
                predictions['predicted_ml_load_next_30min'] = predictions.get('predicted_ml_load', 0)
                predictions['predicted_load_next_hour'] = predictions.get('predicted_demand', 0)
                
                return predictions
        
        except Exception as e:
            logger.error(f"Error generating predictions: {e}")
            return self._get_default_predictions()
    
    def _get_default_predictions(self) -> Dict[str, float]:
        """Default predictions when models aren't available"""
        return {
            'predicted_demand': 0.5,
            'predicted_transaction_volume': 0.5,
            'predicted_ml_load': 0.3,
            'predicted_gas_price': 50.0,
            'predicted_api_load': 0.5,
            'predicted_ml_load_next_30min': 0.3,
            'predicted_load_next_hour': 0.5
        }

class KubernetesScaler:
    """Kubernetes scaling operations"""
    
    def __init__(self):
        try:
            config.load_incluster_config()
        except:
            config.load_kube_config()
        
        self.apps_v1 = client.AppsV1Api()
        self.autoscaling_v2 = client.AutoscalingV2Api()
    
    async def get_current_replicas(self, deployment_name: str, namespace: str = 'default') -> int:
        """Get current replica count for deployment"""
        try:
            deployment = self.apps_v1.read_namespaced_deployment(deployment_name, namespace)
            return deployment.spec.replicas
        except Exception as e:
            logger.error(f"Error getting replicas for {deployment_name}: {e}")
            return 0
    
    async def scale_deployment(self, deployment_name: str, replicas: int, namespace: str = 'default') -> bool:
        """Scale deployment to specified replica count"""
        try:
            current_replicas = await self.get_current_replicas(deployment_name, namespace)
            
            if replicas == current_replicas:
                return True
            
            # Update deployment
            body = {'spec': {'replicas': replicas}}
            self.apps_v1.patch_namespaced_deployment(
                name=deployment_name,
                namespace=namespace,
                body=body
            )
            
            action = 'scale_up' if replicas > current_replicas else 'scale_down'
            scaling_decisions.labels(action=action, service=deployment_name).inc()
            
            logger.info(f"Scaled {deployment_name} from {current_replicas} to {replicas} replicas")
            return True
        
        except Exception as e:
            logger.error(f"Error scaling {deployment_name}: {e}")
            return False

# Global instances
predictor = NFTMarketPredictor()
scaler = KubernetesScaler()

async def scaling_loop():
    """Main scaling loop"""
    prometheus_url = os.getenv('PROMETHEUS_URL', 'http://prometheus-service.monitoring.svc.cluster.local:9090')
    scaling_interval = int(os.getenv('SCALING_INTERVAL', '60'))
    
    while True:
        try:
            logger.info("Starting scaling cycle")
            
            # Collect features
            features_df = await predictor.collect_features(prometheus_url)
            
            # Retrain models periodically
            if not predictor.last_training or \
               any(datetime.now() - training['timestamp'] > timedelta(hours=2) 
                   for training in predictor.last_training.values()):
                logger.info("Retraining models")
                await predictor.train_models(features_df)
            
            # Generate predictions
            predictions = await predictor.predict(features_df)
            
            # Make scaling decisions
            await make_scaling_decisions(predictions)
            
            logger.info(f"Scaling cycle completed. Predictions: {predictions}")
            
        except Exception as e:
            logger.error(f"Error in scaling loop: {e}")
        
        await asyncio.sleep(scaling_interval)

async def make_scaling_decisions(predictions: Dict[str, float]):
    """Make scaling decisions based on predictions"""
    try:
        # API Gateway scaling
        api_load = predictions.get('predicted_api_load', 0.5)
        if api_load > 0.7:
            current_replicas = await scaler.get_current_replicas('api-gateway')
            new_replicas = min(50, max(2, int(current_replicas * 1.5)))
            await scaler.scale_deployment('api-gateway', new_replicas)
        elif api_load < 0.3:
            current_replicas = await scaler.get_current_replicas('api-gateway')
            new_replicas = max(2, int(current_replicas * 0.7))
            await scaler.scale_deployment('api-gateway', new_replicas)
        
        # ML Service scaling
        ml_load = predictions.get('predicted_ml_load_next_30min', 0.3)
        if ml_load > 0.6:
            current_replicas = await scaler.get_current_replicas('ml-service')
            new_replicas = min(20, max(1, int(current_replicas * 1.8)))
            await scaler.scale_deployment('ml-service', new_replicas)
        elif ml_load < 0.2:
            current_replicas = await scaler.get_current_replicas('ml-service')
            new_replicas = max(1, int(current_replicas * 0.8))
            await scaler.scale_deployment('ml-service', new_replicas)
    
    except Exception as e:
        logger.error(f"Error making scaling decisions: {e}")

@app.on_event("startup")
async def startup_event():
    """Start the scaling loop"""
    asyncio.create_task(scaling_loop())

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.get("/ready")
async def readiness_check():
    """Readiness check endpoint"""
    return {"status": "ready", "models_trained": len(predictor.last_training)}

@app.get("/predictions")
async def get_predictions():
    """Get current predictions"""
    prometheus_url = os.getenv('PROMETHEUS_URL', 'http://prometheus-service.monitoring.svc.cluster.local:9090')
    features_df = await predictor.collect_features(prometheus_url, lookback_hours=1)
    predictions = await predictor.predict(features_df)
    
    return {
        "predictions": predictions,
        "model_status": predictor.last_training,
        "timestamp": datetime.now().isoformat()
    }

@app.get("/metrics")
async def get_metrics():
    """Prometheus metrics endpoint"""
    return generate_latest().decode('utf-8')

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)