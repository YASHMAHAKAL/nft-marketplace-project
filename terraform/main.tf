# VPC Module
module "vpc" {
  source = "./modules/vpc"

  project_name       = var.project_name
  environment        = var.environment
  vpc_cidr           = var.vpc_cidr
  availability_zones = var.availability_zones
  enable_nat_gateway = var.enable_nat_gateway

  tags = var.tags
}

# EKS Module
module "eks" {
  source = "./modules/eks"

  project_name         = var.project_name
  environment          = var.environment
  cluster_version      = var.eks_cluster_version
  vpc_id               = module.vpc.vpc_id
  private_subnet_ids   = module.vpc.private_subnet_ids
  public_subnet_ids    = module.vpc.public_subnet_ids
  node_instance_types  = var.eks_node_instance_types
  node_desired_size    = var.eks_node_desired_size
  node_min_size        = var.eks_node_min_size
  node_max_size        = var.eks_node_max_size
  enable_spot_instances = var.enable_spot_instances

  tags = var.tags
}

# RDS Module
module "rds" {
  source = "./modules/rds"

  project_name       = var.project_name
  environment        = var.environment
  vpc_id             = module.vpc.vpc_id
  subnet_ids         = module.vpc.private_subnet_ids
  instance_class     = var.rds_instance_class
  allocated_storage  = var.rds_allocated_storage
  engine_version     = var.rds_engine_version
  database_name      = var.db_name
  master_username    = var.db_username
  master_password    = var.db_password
  allowed_cidr_blocks = [var.vpc_cidr]

  tags = var.tags
}

# ECR Module
module "ecr" {
  source = "./modules/ecr"

  project_name = var.project_name
  environment  = var.environment
  repositories = ["frontend", "api-gateway", "ml-service", "ai-scaler"]

  tags = var.tags
}

# S3 + CloudFront Module
module "s3_cloudfront" {
  source = "./modules/s3-cloudfront"

  project_name = var.project_name
  environment  = var.environment
  domain_name  = var.domain_name

  tags = var.tags
}

# IAM Module
module "iam" {
  source = "./modules/iam"

  project_name    = var.project_name
  environment     = var.environment
  eks_cluster_name = module.eks.cluster_name
  eks_oidc_provider_arn = module.eks.oidc_provider_arn

  tags = var.tags
}
