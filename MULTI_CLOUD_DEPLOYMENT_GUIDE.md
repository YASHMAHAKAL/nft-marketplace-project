# 🚀 Multi-Cloud Deployment Guide

## NFT Marketplace Multi-Cloud Deployment Script

Your enhanced `deploy.sh` script now supports **AWS**, **Azure**, and **GCP** with intelligent cloud-specific configurations.

## 🌩️ **Cloud Provider Support**

### **AWS (Amazon Web Services)**
- **Container Registry**: Amazon ECR
- **Kubernetes**: Amazon EKS
- **Storage**: EBS CSI Driver (gp3 SSD)
- **Load Balancer**: Network Load Balancer
- **Monitoring**: CloudWatch integration

### **Azure (Microsoft Azure)**
- **Container Registry**: Azure Container Registry (ACR)
- **Kubernetes**: Azure Kubernetes Service (AKS)
- **Storage**: Azure Disk CSI (Premium SSD)
- **Load Balancer**: Azure Load Balancer
- **Monitoring**: Azure Monitor integration

### **GCP (Google Cloud Platform)**
- **Container Registry**: Google Container Registry (GCR)
- **Kubernetes**: Google Kubernetes Engine (GKE)
- **Storage**: Persistent Disk CSI (Regional SSD)
- **Load Balancer**: Google Cloud Load Balancer
- **Monitoring**: Cloud Operations integration

## 🛠️ **Prerequisites Setup**

### **AWS Setup**
```bash
# Install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Configure AWS credentials
aws configure
# Enter: Access Key ID, Secret Access Key, Default region, Output format

# Create EKS cluster (optional - can be done by script)
eksctl create cluster --name nft-marketplace --region us-east-1 --nodegroup-name standard-workers --node-type t3.medium --nodes 3 --nodes-min 1 --nodes-max 10
```

### **Azure Setup**
```bash
# Install Azure CLI
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# Login to Azure
az login

# Set subscription (if you have multiple)
az account set --subscription "your-subscription-id"

# Create AKS cluster (optional - can be done by script)
az group create --name nft-marketplace-rg --location eastus
az aks create --resource-group nft-marketplace-rg --name nft-marketplace-aks --node-count 3 --enable-addons monitoring --generate-ssh-keys
az aks get-credentials --resource-group nft-marketplace-rg --name nft-marketplace-aks
```

### **GCP Setup**
```bash
# Install Google Cloud SDK
curl https://sdk.cloud.google.com | bash
exec -l $SHELL

# Initialize gcloud
gcloud init

# Set project
gcloud config set project your-project-id

# Create GKE cluster (optional - can be done by script)
gcloud container clusters create nft-marketplace --zone us-central1-a --num-nodes 3 --enable-autoscaling --min-nodes 1 --max-nodes 10
gcloud container clusters get-credentials nft-marketplace --zone us-central1-a
```

## 🚀 **Deployment Commands**

### **AWS Deployment**
```bash
# Basic AWS deployment
./deploy.sh --cloud aws

# AWS with custom region and registry
./deploy.sh --cloud aws --region us-west-2 --registry 123456789012

# AWS production environment
./deploy.sh --cloud aws --environment production --region us-east-1
```

### **Azure Deployment**
```bash
# Basic Azure deployment
./deploy.sh --cloud azure

# Azure with custom region and ACR
./deploy.sh --cloud azure --region westus2 --registry nftmarketplacecr

# Azure staging environment
./deploy.sh --cloud azure --environment staging --region eastus
```

### **GCP Deployment**
```bash
# Basic GCP deployment
./deploy.sh --cloud gcp

# GCP with custom zone and project
./deploy.sh --cloud gcp --region us-central1-b --registry my-nft-project

# GCP development environment
./deploy.sh --cloud gcp --environment development --region europe-west1-b
```

## 🔧 **Advanced Configuration**

### **Environment Variables**
Set these before running the script for more control:

```bash
# AWS specific
export AWS_REGION="us-west-2"
export AWS_ACCOUNT_ID="123456789012"

# Azure specific
export ACR_NAME="nftmarketplaceregistry"
export AZURE_SUBSCRIPTION="your-subscription-id"

# GCP specific
export GCP_PROJECT_ID="nft-marketplace-project"
export GCP_ZONE="us-central1-a"

# Common
export CLUSTER_NAME="nft-marketplace-cluster"
export ENVIRONMENT="production"
```

### **Custom Namespaces**
```bash
# Deploy to custom namespace
./deploy.sh --cloud aws --namespace nft-prod

# Deploy monitoring to separate namespace
export MONITORING_NAMESPACE="observability"
./deploy.sh --cloud azure
```

## 🎯 **What the Script Does Automatically**

### **For All Clouds:**
1. ✅ **Authentication Check**: Verifies cloud CLI login
2. ✅ **Container Registry Setup**: Creates and configures registry
3. ✅ **Image Build & Push**: Builds Docker images and pushes to cloud registry
4. ✅ **Kubernetes Deployment**: Deploys all services with cloud-specific configs
5. ✅ **Storage Classes**: Creates optimized storage classes for each cloud
6. ✅ **Load Balancer**: Sets up cloud-native load balancer with annotations
7. ✅ **Monitoring Integration**: Connects to cloud monitoring services
8. ✅ **Service Mesh**: Deploys Istio with cloud-specific settings

### **Cloud-Specific Features:**

#### **AWS**
- Creates ECR repositories automatically
- Configures EBS CSI driver for persistent storage
- Sets up Network Load Balancer with cross-zone balancing
- Integrates with CloudWatch for metrics
- Configures IAM roles for service accounts

#### **Azure**
- Creates Azure Container Registry automatically
- Configures Azure Disk CSI for premium storage
- Sets up Azure Load Balancer with health probes
- Integrates with Azure Monitor
- Configures managed identities

#### **GCP**
- Configures Google Container Registry access
- Sets up Persistent Disk CSI with regional replication
- Creates Google Cloud Load Balancer with NEG
- Integrates with Cloud Operations (Stackdriver)
- Configures Workload Identity

## 📊 **Post-Deployment Access**

After deployment, the script provides cloud-specific access information:

### **AWS**
- **Console**: Direct link to EKS cluster in AWS Console
- **Load Balancer**: AWS Network Load Balancer hostname
- **Registry**: ECR repository URLs

### **Azure**
- **Portal**: Direct link to AKS cluster in Azure Portal
- **Load Balancer**: Azure Load Balancer IP address
- **Registry**: ACR login server URL

### **GCP**
- **Console**: Direct link to GKE cluster in GCP Console
- **Load Balancer**: Google Cloud Load Balancer IP
- **Registry**: GCR repository URLs

## 🔍 **Troubleshooting**

### **Common Issues**

#### **Authentication Errors**
```bash
# AWS
aws sts get-caller-identity

# Azure
az account show

# GCP
gcloud auth list
```

#### **Permission Issues**
```bash
# AWS - Check IAM permissions for EKS, ECR, EC2
# Azure - Check Azure RBAC for AKS, ACR
# GCP - Check IAM permissions for GKE, GCR
```

#### **Registry Access**
```bash
# Test registry login
# AWS
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789012.dkr.ecr.us-east-1.amazonaws.com

# Azure
az acr login --name myregistry

# GCP
gcloud auth configure-docker
```

## 🎉 **Success Indicators**

After successful deployment, you should see:
- ✅ All pods running in your namespace
- ✅ Load balancer with external IP/hostname
- ✅ Monitoring services accessible
- ✅ Container images pushed to cloud registry
- ✅ Cloud-specific integrations active

## 📝 **Example Complete Workflows**

### **AWS Production Deployment**
```bash
# 1. Setup
aws configure
eksctl create cluster --name nft-marketplace --region us-east-1

# 2. Deploy
./deploy.sh --cloud aws --environment production --region us-east-1

# 3. Verify
kubectl get pods -n default
kubectl get svc nft-marketplace-lb -n default
```

### **Azure Staging Deployment**
```bash
# 1. Setup
az login
az aks create --resource-group nft-rg --name nft-aks --location eastus

# 2. Deploy
./deploy.sh --cloud azure --environment staging --region eastus

# 3. Verify
kubectl get pods -n default
kubectl get svc nft-marketplace-lb -n default
```

### **GCP Development Deployment**
```bash
# 1. Setup
gcloud auth login
gcloud container clusters create nft-dev --zone us-central1-a

# 2. Deploy
./deploy.sh --cloud gcp --environment development --region us-central1-a

# 3. Verify
kubectl get pods -n default
kubectl get svc nft-marketplace-lb -n default
```

Your NFT marketplace is now **multi-cloud ready** with intelligent, cloud-specific optimizations! 🚀