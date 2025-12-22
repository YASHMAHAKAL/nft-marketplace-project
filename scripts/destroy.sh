#!/bin/bash
set -e

echo "💥 NFT Marketplace - Infrastructure Teardown"
echo "==========================================="

# Check prerequisites
command -v terraform >/dev/null 2>&1 || { echo "❌ Terraform not installed"; exit 1; }
command -v aws >/dev/null 2>&1 || { echo "❌ AWS CLI not installed"; exit 1; }
command -v kubectl >/dev/null 2>&1 || { echo "❌ kubectl not installed"; exit 1; }

# Confirmation
read -p "⚠️  This will destroy ALL AWS resources. Type 'destroy' to confirm: " confirm
if [ "$confirm" != "destroy" ]; then
    echo "❌ Aborted"
    exit 1
fi

echo "✅ Confirmation received"

# Step 1: Get cluster name
echo ""
echo "🔍 Step 1: Getting EKS cluster name..."
cd terraform
terraform init
EKS_CLUSTER=$(terraform output -raw eks_cluster_name 2>/dev/null || echo "")

if [ -n "$EKS_CLUSTER" ]; then
    echo "   Found cluster: $EKS_CLUSTER"
    
    # Step 2: Configure kubectl
    echo ""
    echo "🔧 Step 2: Configuring kubectl..."
    aws eks update-kubeconfig --region us-east-1 --name $EKS_CLUSTER 2>/dev/null || true
    
    # Step 3: Delete Kubernetes resources
    echo ""
    echo "☸️  Step 3: Deleting Kubernetes resources..."
    kubectl delete all --all -n default 2>/dev/null || true
    kubectl delete pvc --all 2>/dev/null || true
    kubectl delete ingress --all 2>/dev/null || true
    
    echo "✅ Kubernetes resources deleted"
else
    echo "⚠️  No EKS cluster found, skipping Kubernetes cleanup"
fi

# Step 4: Terraform destroy
echo ""
echo "🔥 Step 4: Destroying Terraform infrastructure..."
terraform destroy -auto-approve

echo "✅ Terraform destroy complete"

cd ..

# Step 5: Verify cleanup
echo ""
echo "🔍 Step 5: Verifying cleanup..."

echo "Checking for remaining EKS clusters..."
aws eks list-clusters --region us-east-1

echo "Checking for remaining RDS instances..."
aws rds describe-db-instances --region us-east-1 --query 'DBInstances[?contains(DBInstanceIdentifier, `nft-marketplace`)].DBInstanceIdentifier' || true

echo "Checking for remaining VPCs..."
aws ec2 describe-vpcs --region us-east-1 --filters "Name=tag:Project,Values=nft-marketplace" --query 'Vpcs[].VpcId' || true

echo ""
echo "✅ Teardown Complete!"
echo "===================="
echo ""
echo "Please verify in AWS Console that all resources are deleted:"
echo "- EKS Clusters"
echo "- RDS Instances"
echo "- VPCs"
echo "- Load Balancers"
echo "- ECR Repositories"
echo "- S3 Buckets"
echo ""
echo "Check AWS Cost Explorer to verify no ongoing charges"
