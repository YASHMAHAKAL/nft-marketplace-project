# Terraform Infrastructure Troubleshooting Guide

## Overview

This guide provides solutions for common Terraform issues when deploying NFT Marketplace infrastructure across AWS, Azure, and GCP.

## Prerequisites Check

Before running Terraform, ensure:

### AWS
```bash
# Check AWS CLI configuration
aws sts get-caller-identity

# Verify required permissions
aws iam list-attached-user-policies --user-name $(aws sts get-caller-identity --query 'Arn' --output text | cut -d'/' -f2)

# Check service quotas
aws service-quotas list-service-quotas --service-code eks
```

### Azure
```bash
# Check Azure CLI login
az account show

# Verify subscription access
az account list --output table

# Check resource provider registration
az provider list --query "[?registrationState=='NotRegistered']" --output table
```

### GCP
```bash
# Check gcloud configuration
gcloud auth list
gcloud config list

# Verify project access
gcloud projects describe $PROJECT_ID

# Check enabled APIs
gcloud services list --enabled
```

## Common Terraform Issues

### 1. State Lock Issues

#### Symptoms
- "Error acquiring the state lock"
- "Lock Info" with Lock ID

#### Solutions

**AWS (S3 backend)**
```bash
cd infrastructure/aws
# Force unlock (use the Lock ID from error message)
terraform force-unlock <LOCK_ID>

# Alternative: Delete lock from DynamoDB
aws dynamodb delete-item --table-name terraform-locks --key '{"LockID":{"S":"<LOCK_ID>"}}'
```

**Azure (Storage backend)**
```bash
cd infrastructure/azure
terraform force-unlock <LOCK_ID>

# Alternative: Check storage account locks
az storage blob list --account-name <storage-account> --container-name tfstate
```

**GCP (GCS backend)**
```bash
cd infrastructure/gcp
terraform force-unlock <LOCK_ID>

# Alternative: Remove lock file from GCS
gsutil rm gs://<bucket-name>/terraform.tfstate.lock.info
```

### 2. Resource Already Exists

#### Symptoms
- "already exists"
- "Resource already exists in resource group"

#### Solutions

**Import Existing Resources**
```bash
# Example: Import existing resource group in Azure
terraform import azurerm_resource_group.main /subscriptions/{subscription-id}/resourceGroups/{rg-name}

# Example: Import existing VPC in AWS
terraform import aws_vpc.main vpc-12345678

# Example: Import existing project in GCP
terraform import google_project.main {project-id}
```

**Force Replacement**
```bash
# Force recreation of specific resource
terraform apply -replace="aws_instance.example"
```

### 3. Insufficient Permissions

#### AWS Common Permissions
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "eks:*",
                "ecr:*",
                "ec2:*",
                "iam:*",
                "logs:*",
                "s3:*",
                "autoscaling:*"
            ],
            "Resource": "*"
        }
    ]
}
```

#### Azure Required Roles
- Contributor (for resource creation)
- User Access Administrator (for role assignments)
- AKS Cluster Admin (for Kubernetes access)

#### GCP Required Roles
- Compute Admin
- Kubernetes Engine Admin
- Project IAM Admin
- Storage Admin
- Service Account Admin

### 4. Version Conflicts

#### Provider Version Issues
```bash
# Lock provider versions in versions.tf
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

# Upgrade providers
terraform init -upgrade
```

### 5. Resource Dependencies

#### Circular Dependencies
```bash
# View dependency graph
terraform graph | dot -Tpng > graph.png

# Plan with detailed output
terraform plan -out=tfplan
terraform show -json tfplan | jq '.planned_changes'
```

#### Resource Ordering
```hcl
# Use explicit dependencies
resource "aws_route_table_association" "private" {
  count          = length(aws_subnet.private)
  subnet_id      = aws_subnet.private[count.index].id
  route_table_id = aws_route_table.private[count.index].id
  
  depends_on = [aws_subnet.private, aws_route_table.private]
}
```

## Cloud-Specific Issues

### AWS Issues

#### EKS Node Group Failures
```bash
# Check EKS cluster status
aws eks describe-cluster --name nft-marketplace-eks

# Check node group status
aws eks describe-nodegroup --cluster-name nft-marketplace-eks --nodegroup-name workers

# Common fix: Update node group AMI
terraform apply -target=aws_eks_node_group.workers
```

#### ECR Repository Issues
```bash
# Check ECR repository
aws ecr describe-repositories --repository-names nft-marketplace-frontend

# Create repository manually if needed
aws ecr create-repository --repository-name nft-marketplace-frontend
```

### Azure Issues

#### AKS Creation Failures
```bash
# Check AKS cluster details
az aks show --resource-group nft-marketplace-rg --name nft-marketplace-aks

# Check activity log
az monitor activity-log list --resource-group nft-marketplace-rg

# Common fix: Service principal issues
az ad sp create-for-rbac --role Contributor --scopes /subscriptions/{subscription-id}
```

#### ACR Authentication Issues
```bash
# Login to ACR
az acr login --name nftmarketplaceacr

# Check ACR admin credentials
az acr credential show --name nftmarketplaceacr

# Enable admin user if needed
az acr update --name nftmarketplaceacr --admin-enabled true
```

### GCP Issues

#### GKE Cluster Creation Failures
```bash
# Check cluster status
gcloud container clusters describe nft-marketplace-gke --zone us-central1-a

# Check operations
gcloud container operations list

# Common fix: Enable required APIs
gcloud services enable container.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

#### Artifact Registry Issues
```bash
# Check registry
gcloud artifacts repositories describe nft-marketplace --location=us-central1

# Create registry manually
gcloud artifacts repositories create nft-marketplace --location=us-central1 --repository-format=docker
```

## Troubleshooting Workflow

### 1. Basic Diagnostics
```bash
# Check Terraform version
terraform version

# Validate configuration
terraform validate

# Check formatting
terraform fmt -check

# Dry run
terraform plan
```

### 2. Detailed Analysis
```bash
# Enable debug logging
export TF_LOG=DEBUG
export TF_LOG_PATH=./terraform.log
terraform apply

# Analyze specific resource
terraform state show aws_eks_cluster.main

# Check resource configuration
terraform show -json | jq '.values.root_module.resources[] | select(.address=="aws_eks_cluster.main")'
```

### 3. State Management
```bash
# List all resources in state
terraform state list

# Remove resource from state (without destroying)
terraform state rm aws_instance.example

# Move resource to different address
terraform state mv aws_instance.example aws_instance.new_example

# Backup state
terraform state pull > terraform.tfstate.backup
```

## Recovery Procedures

### Complete State Corruption
```bash
# 1. Backup current state
terraform state pull > corrupted-state.tfstate

# 2. Initialize new state
rm -rf .terraform
terraform init

# 3. Import critical resources
terraform import aws_vpc.main vpc-12345678
terraform import aws_subnet.public subnet-12345678

# 4. Plan and apply
terraform plan
terraform apply
```

### Partial Failures
```bash
# Target specific resources for reapplication
terraform apply -target=aws_eks_node_group.workers

# Refresh state
terraform refresh

# Taint resource for recreation
terraform taint aws_instance.example
terraform apply
```

## Prevention Best Practices

### 1. State Backend Configuration
```hcl
terraform {
  backend "s3" {
    bucket         = "terraform-state-nft-marketplace"
    key            = "aws/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-locks"
  }
}
```

### 2. Consistent Tagging
```hcl
locals {
  common_tags = {
    Project     = "nft-marketplace"
    Environment = var.environment
    ManagedBy   = "terraform"
    Owner       = "devops-team"
  }
}

resource "aws_instance" "example" {
  # ... other configuration
  tags = local.common_tags
}
```

### 3. Resource Naming
```hcl
locals {
  name_prefix = "${var.project_name}-${var.environment}"
}

resource "aws_eks_cluster" "main" {
  name = "${local.name_prefix}-eks"
  # ... other configuration
}
```

### 4. Variable Validation
```hcl
variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.medium"
  
  validation {
    condition = can(regex("^t3\\.", var.instance_type))
    error_message = "Instance type must be from t3 family."
  }
}
```

## Monitoring Terraform Operations

### 1. Terraform Cloud/Enterprise
- State management
- Plan/Apply automation
- Policy as Code
- Cost estimation

### 2. Custom Monitoring
```bash
#!/bin/bash
# terraform-monitor.sh
PLAN_OUTPUT=$(terraform plan -detailed-exitcode)
EXIT_CODE=$?

case $EXIT_CODE in
    0) echo "No changes needed" ;;
    1) echo "Error in plan"; exit 1 ;;
    2) echo "Changes detected"; terraform apply -auto-approve ;;
esac
```

### 3. Integration with CI/CD
```yaml
# GitHub Actions example
name: Terraform
on: [push, pull_request]

jobs:
  terraform:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v1
        with:
          terraform_version: 1.0.0
          
      - name: Terraform Init
        run: terraform init
        
      - name: Terraform Plan
        run: terraform plan -no-color
        
      - name: Terraform Apply
        if: github.ref == 'refs/heads/main'
        run: terraform apply -auto-approve
```

## Emergency Contacts

### Cloud Provider Support
- **AWS**: AWS Support (based on support plan)
- **Azure**: Azure Support Portal
- **GCP**: Google Cloud Support

### Internal Escalation
1. DevOps Team Lead
2. Platform Engineering Manager
3. CTO/VP Engineering

## Documentation Updates

When resolving new issues:
1. Document the problem and solution
2. Update this troubleshooting guide
3. Create runbooks for common procedures
4. Share learnings with the team

Remember: Always backup state files before making major changes!