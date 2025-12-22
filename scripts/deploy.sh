#!/bin/bash
set -e

echo "🚀 NFT Marketplace - One-Command Deployment"
echo "==========================================="

# Check prerequisites
command -v terraform >/dev/null 2>&1 || { echo "❌ Terraform not installed"; exit 1; }
command -v aws >/dev/null 2>&1 || { echo "❌ AWS CLI not installed"; exit 1; }
command -v kubectl >/dev/null 2>&1 || { echo "❌ kubectl not installed"; exit 1; }
command -v docker >/dev/null 2>&1 || { echo "❌ Docker not installed"; exit 1; }

echo "✅ Prerequisites check passed"

# Step 1: Deploy infrastructure
echo ""
echo "📦 Step 1: Deploying AWS infrastructure with Terraform..."
cd terraform

if [ ! -f "terraform.tfvars" ]; then
    echo "⚠️  terraform.tfvars not found. Copying from example..."
    cp terraform.tfvars.example terraform.tfvars
    echo "❗ Please edit terraform.tfvars with your values and run again"
    exit 1
fi

terraform init
terraform plan -out=tfplan
terraform apply tfplan

# Get outputs
EKS_CLUSTER=$(terraform output -raw eks_cluster_name)
ECR_FRONTEND=$(terraform output -json ecr_repository_urls | jq -r '.frontend')
ECR_API_GATEWAY=$(terraform output -json ecr_repository_urls | jq -r '.["api-gateway"]')
ECR_ML_SERVICE=$(terraform output -json ecr_repository_urls | jq -r '.["ml-service"]')
ECR_AI_SCALER=$(terraform output -json ecr_repository_urls | jq -r '.["ai-scaler"]')

echo "✅ Infrastructure deployed"
echo "   EKS Cluster: $EKS_CLUSTER"

cd ..

# Step 2: Configure kubectl
echo ""
echo "🔧 Step 2: Configuring kubectl..."
aws eks update-kubeconfig --region us-east-1 --name $EKS_CLUSTER
echo "✅ kubectl configured"

# Step 3: Build and push Docker images
echo ""
echo "🐳 Step 3: Building and pushing Docker images..."

# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin $(echo $ECR_FRONTEND | cut -d'/' -f1)

# Build and push frontend
echo "Building frontend..."
docker build -t $ECR_FRONTEND:latest ./frontend
docker push $ECR_FRONTEND:latest

# Build and push API Gateway
echo "Building API Gateway..."
docker build -t $ECR_API_GATEWAY:latest ./api-gateway
docker push $ECR_API_GATEWAY:latest

# Build and push ML Service
echo "Building ML Service..."
docker build -t $ECR_ML_SERVICE:latest ./ml-service
docker push $ECR_ML_SERVICE:latest

# Build and push AI Scaler
echo "Building AI Scaler..."
docker build -t $ECR_AI_SCALER:latest ./ai-scaler
docker push $ECR_AI_SCALER:latest

echo "✅ Docker images pushed to ECR"

# Step 4: Deploy to Kubernetes
echo ""
echo "☸️  Step 4: Deploying to Kubernetes..."
kubectl apply -f k8s/base/

# Wait for deployments
echo "Waiting for deployments to be ready..."
kubectl wait --for=condition=available --timeout=300s deployment/frontend-deployment
kubectl wait --for=condition=available --timeout=300s deployment/api-gateway-deployment
kubectl wait --for=condition=available --timeout=300s deployment/ml-service-deployment

echo "✅ Kubernetes deployments ready"

# Step 5: Get service URLs
echo ""
echo "🌐 Step 5: Getting service URLs..."
kubectl get services

echo ""
echo "🎉 Deployment Complete!"
echo "======================="
echo ""
echo "Next steps:"
echo "1. Check pods: kubectl get pods"
echo "2. View logs: kubectl logs -f deployment/frontend-deployment"
echo "3. Access application via LoadBalancer URL above"
echo ""
echo "To destroy everything: ./scripts/destroy.sh"
