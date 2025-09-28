# NFT Marketplace Multi-Cloud Deployment Guide

## Overview

This guide covers deploying the NFT Marketplace to multiple cloud platforms (AWS, Azure, GCP) with optional infrastructure provisioning via Terraform.

## Prerequisites

### Common Requirements
- Docker and Docker Compose
- kubectl
- Helm (for service mesh and monitoring)
- Git

### Cloud-Specific Requirements

#### AWS
- AWS CLI configured with appropriate credentials
- Terraform (if using `--provision-infrastructure`)
- Access to EKS, ECR, VPC, and IAM services

#### Azure
- Azure CLI configured with appropriate credentials
- Terraform (if using `--provision-infrastructure`)
- Access to AKS, ACR, VNet, and Resource Management services

#### GCP
- gcloud CLI configured with appropriate credentials
- Terraform (if using `--provision-infrastructure`)
- Access to GKE, Artifact Registry, VPC, and Compute services

## Deployment Options

### Option 1: Deploy to Existing Infrastructure

If you already have a Kubernetes cluster and container registry set up:

```bash
# Deploy to existing AWS EKS cluster
./deploy.sh --cloud aws --environment production

# Deploy to existing Azure AKS cluster
./deploy.sh --cloud azure --environment production

# Deploy to existing GCP GKE cluster
./deploy.sh --cloud gcp --environment production
```

### Option 2: Deploy with Terraform Infrastructure Provisioning

To provision infrastructure and deploy the application in one command:

```bash
# AWS - Creates EKS cluster, ECR, VPC, and all dependencies
./deploy.sh --cloud aws --environment production --provision-infrastructure

# Azure - Creates AKS cluster, ACR, VNet, and all dependencies
./deploy.sh --cloud azure --environment production --provision-infrastructure

# GCP - Creates GKE cluster, Artifact Registry, VPC, and all dependencies
./deploy.sh --cloud gcp --environment production --provision-infrastructure
```

## Infrastructure Details

### AWS Infrastructure (Terraform)
Located in `infrastructure/aws/`:
- **EKS Cluster**: Managed Kubernetes cluster with optimized node groups
- **ECR Repository**: Private container registry for application images
- **VPC & Networking**: Custom VPC with public/private subnets
- **IAM Roles**: Proper service roles and policies
- **Security Groups**: Network security configurations

### Azure Infrastructure (Terraform)
Located in `infrastructure/azure/`:
- **AKS Cluster**: Managed Kubernetes cluster with auto-scaling
- **ACR Repository**: Azure Container Registry for images
- **VNet & Networking**: Virtual network with subnets
- **PostgreSQL**: Managed database service
- **Resource Group**: Organized resource management

### GCP Infrastructure (Terraform)
Located in `infrastructure/gcp/`:
- **GKE Cluster**: Google Kubernetes Engine with node pools
- **Artifact Registry**: Google's container registry
- **VPC & Networking**: Virtual Private Cloud configuration
- **Cloud SQL**: Managed PostgreSQL database
- **Workload Identity**: Secure pod-to-GCP service authentication

## Environment Variables

### AWS Deployment
```bash
export AWS_REGION="us-east-1"
export AWS_ACCOUNT_ID="123456789012"
export CLUSTER_NAME="nft-marketplace-eks"
```

### Azure Deployment
```bash
export AZURE_SUBSCRIPTION="subscription-id"
export AZURE_RESOURCE_GROUP="nft-marketplace-rg"
export AZURE_LOCATION="East US"
```

### GCP Deployment
```bash
export GCP_PROJECT_ID="your-project-id"
export GCP_REGION="us-central1"
export GCP_ZONE="us-central1-a"
```

## Customization

### Terraform Variables

#### AWS Variables (`infrastructure/aws/terraform.tfvars`)
```hcl
region = "us-east-1"
cluster_name = "nft-marketplace-eks"
node_instance_type = "t3.medium"
desired_capacity = 2
max_capacity = 10
min_capacity = 1
```

#### Azure Variables (`infrastructure/azure/terraform.tfvars`)
```hcl
location = "East US"
resource_group_name = "nft-marketplace-rg"
cluster_name = "nft-marketplace-aks"
node_count = 2
node_vm_size = "Standard_D2s_v3"
```

#### GCP Variables (`infrastructure/gcp/terraform.tfvars`)
```hcl
project_id = "your-project-id"
region = "us-central1"
zone = "us-central1-a"
cluster_name = "nft-marketplace-gke"
node_count = 2
machine_type = "e2-medium"
```

## Deployment Features

### Core Application Stack
- **Frontend**: React TypeScript application with Nginx
- **API Gateway**: Node.js with Express and health checks
- **ML Service**: Python Flask with scikit-learn models
- **Database**: PostgreSQL with persistent storage

### Cloud-Native Features
- **Auto-scaling**: Horizontal Pod Autoscaler (HPA) based on CPU/memory
- **Service Mesh**: Istio for traffic management and security
- **Monitoring**: Prometheus and Grafana with NFT-specific metrics
- **AI Scaling**: Predictive scaling based on NFT market trends
- **Load Balancing**: Cloud-native load balancers
- **Security**: Network policies, RBAC, and secret management

### AI-Powered Features
- **Predictive Auto-scaling**: ML models predict traffic patterns
- **NFT Market Analysis**: Real-time trend analysis
- **Smart Recommendations**: AI-powered NFT suggestions
- **Gas Optimization**: Smart contract interaction optimization

## Monitoring and Observability

### Prometheus Metrics
- Application performance metrics
- NFT marketplace specific metrics (transactions, listings, views)
- Kubernetes cluster metrics
- Custom business metrics

### Grafana Dashboards
- NFT Marketplace Overview
- Kubernetes Cluster Health
- Application Performance
- Business Intelligence Dashboard

### Access Information
After deployment, the script provides:
- Load balancer URLs
- Monitoring dashboard links
- Cloud console links
- Port forwarding commands

## Infrastructure Management

### Terraform Operations
```bash
# View current infrastructure state
cd infrastructure/{aws|azure|gcp}
terraform show

# Update infrastructure
terraform plan
terraform apply

# Destroy infrastructure (⚠️ Warning: This deletes all resources!)
terraform destroy
```

### Kubernetes Operations
```bash
# View all resources
kubectl get all -A

# Check application logs
kubectl logs -f deployment/api-gateway -n nft-marketplace

# Scale applications
kubectl scale deployment api-gateway --replicas=5 -n nft-marketplace

# Check auto-scaling status
kubectl get hpa -n nft-marketplace
```

## Troubleshooting

### Common Issues

#### Infrastructure Provisioning Fails
1. Check cloud CLI authentication
2. Verify required permissions
3. Check Terraform state locks
4. Review cloud service quotas

#### Application Deployment Fails
1. Verify cluster connectivity (`kubectl cluster-info`)
2. Check resource availability
3. Review application logs
4. Verify container registry access

#### Load Balancer Issues
1. Check cloud provider load balancer limits
2. Verify security group/firewall rules
3. Check service configurations
4. Review ingress controller status

### Debug Commands
```bash
# Check cluster status
kubectl cluster-info

# View resource status
kubectl get pods,svc,ingress -A

# Check events
kubectl get events --sort-by=.metadata.creationTimestamp

# View detailed resource info
kubectl describe pod <pod-name> -n nft-marketplace
```

## Security Considerations

### Network Security
- Private subnets for worker nodes
- Security groups with minimal required access
- Network policies for pod-to-pod communication
- TLS encryption for all services

### Authentication & Authorization
- RBAC policies for service accounts
- Cloud-native identity integration
- Secret management for sensitive data
- Pod security standards

### Container Security
- Non-root containers
- Read-only root filesystems
- Resource limits and requests
- Regular security updates

## Performance Optimization

### Resource Allocation
- Right-sized nodes for workload requirements
- Appropriate resource requests and limits
- Auto-scaling configuration
- Storage optimization

### Network Performance
- Regional deployment for low latency
- CDN integration for frontend assets
- Database connection pooling
- Caching strategies

## Backup and Disaster Recovery

### Database Backups
- Automated database backups
- Point-in-time recovery
- Cross-region backup replication
- Backup retention policies

### Application State
- Persistent volume backups
- Configuration backup
- Secret and ConfigMap backup
- Stateful application recovery

## Cost Optimization

### Resource Management
- Auto-scaling to match demand
- Spot instances where appropriate
- Reserved capacity for predictable workloads
- Resource cleanup automation

### Monitoring Costs
- Cloud cost monitoring
- Resource utilization tracking
- Idle resource identification
- Cost allocation tags

## Multi-Cloud Strategy

### Benefits
- **Vendor Independence**: Avoid lock-in
- **Geographic Distribution**: Global availability
- **Risk Mitigation**: Provider redundancy
- **Cost Optimization**: Choose best pricing

### Considerations
- **Complexity**: Multiple tool sets and APIs
- **Data Transfer**: Cross-cloud networking costs
- **Compliance**: Multi-region data governance
- **Operational**: Unified monitoring and management

## Contributing

When making changes to the deployment system:

1. Test on all supported cloud platforms
2. Update Terraform modules consistently
3. Maintain backward compatibility
4. Update documentation
5. Validate with different cluster sizes

## Support

For deployment issues:
1. Check this guide first
2. Review cloud provider documentation
3. Check Terraform provider documentation
4. Review Kubernetes deployment guides
5. Submit issues with full deployment logs