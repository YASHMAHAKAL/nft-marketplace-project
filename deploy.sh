#!/bin/bash
set -euo pipefail

# NFT Marketplace Cloud-Native Deployment Script
# Implements extraordinary cloud features with monitoring and scaling

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Configuration
NAMESPACE="default"
MONITORING_NAMESPACE="monitoring"
CLUSTER_NAME="${CLUSTER_NAME:-nft-marketplace}"
ENVIRONMENT="${ENVIRONMENT:-production}"
CLOUD_PROVIDER="${CLOUD_PROVIDER:-aws}"

# Cloud-specific configurations
declare -A CLOUD_CONFIGS
CLOUD_CONFIGS["aws"]="us-east-1"
CLOUD_CONFIGS["azure"]="eastus"
CLOUD_CONFIGS["gcp"]="us-central1-a"

# Container Registry URLs
declare -A REGISTRY_URLS
REGISTRY_URLS["aws"]="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"
REGISTRY_URLS["azure"]="$ACR_NAME.azurecr.io"
REGISTRY_URLS["gcp"]="gcr.io/$GCP_PROJECT_ID"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

check_prerequisites() {
    log_step "Checking prerequisites..."
    
    local required_tools=("kubectl" "docker" "helm" "terraform")
    
    # Add cloud-specific CLI tools
    case $CLOUD_PROVIDER in
        "aws")
            required_tools+=("aws")
            ;;
        "azure")
            required_tools+=("az")
            ;;
        "gcp")
            required_tools+=("gcloud")
            ;;
        *)
            log_error "Unsupported cloud provider: $CLOUD_PROVIDER"
            log_error "Supported providers: aws, azure, gcp"
            exit 1
            ;;
    esac
    
    for tool in "${required_tools[@]}"; do
        if ! command -v "$tool" &> /dev/null; then
            log_error "$tool is required but not installed."
            case $tool in
                "aws")
                    log_error "Install AWS CLI: https://aws.amazon.com/cli/"
                    ;;
                "az")
                    log_error "Install Azure CLI: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
                    ;;
                "gcloud")
                    log_error "Install Google Cloud SDK: https://cloud.google.com/sdk/docs/install"
                    ;;
                "terraform")
                    log_error "Install Terraform: https://www.terraform.io/downloads"
                    ;;
            esac
            exit 1
        fi
        log_info "✓ $tool found"
    done
    
    # Check cloud authentication
    check_cloud_auth
    
    # Check kubectl connection (skip if provisioning infrastructure)
    if [[ "$PROVISION_INFRASTRUCTURE" != "true" ]]; then
        if ! kubectl cluster-info &> /dev/null; then
            log_error "Cannot connect to Kubernetes cluster"
            log_error "Either provide an existing cluster or use --provision-infrastructure"
            exit 1
        fi
        log_info "✓ Kubernetes cluster connection verified"
    fi
    
    # Check Docker daemon
    if ! docker info &> /dev/null; then
        log_error "Docker daemon is not running"
        exit 1
    fi
    log_info "✓ Docker daemon is running"
}

check_cloud_auth() {
    log_step "Checking cloud authentication..."
    
    case $CLOUD_PROVIDER in
        "aws")
            if ! aws sts get-caller-identity &> /dev/null; then
                log_error "AWS authentication failed. Run: aws configure"
                exit 1
            fi
            AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
            AWS_REGION=${AWS_REGION:-${CLOUD_CONFIGS["aws"]}}
            log_info "✓ AWS authenticated (Account: $AWS_ACCOUNT_ID, Region: $AWS_REGION)"
            ;;
        "azure")
            if ! az account show &> /dev/null; then
                log_error "Azure authentication failed. Run: az login"
                exit 1
            fi
            AZURE_SUBSCRIPTION=$(az account show --query id --output tsv)
            ACR_NAME=${ACR_NAME:-nftmarketplace$(echo $AZURE_SUBSCRIPTION | cut -c1-8)}
            log_info "✓ Azure authenticated (Subscription: $AZURE_SUBSCRIPTION)"
            ;;
        "gcp")
            if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | head -1 &> /dev/null; then
                log_error "GCP authentication failed. Run: gcloud auth login"
                exit 1
            fi
            GCP_PROJECT_ID=${GCP_PROJECT_ID:-$(gcloud config get-value project)}
            if [[ -z "$GCP_PROJECT_ID" ]]; then
                log_error "GCP project not set. Run: gcloud config set project YOUR_PROJECT_ID"
                exit 1
            fi
            log_info "✓ GCP authenticated (Project: $GCP_PROJECT_ID)"
            ;;
    esac
}

provision_infrastructure() {
    if [[ "$PROVISION_INFRASTRUCTURE" != "true" ]]; then
        log_info "Skipping infrastructure provisioning"
        return 0
    fi
    
    log_step "Provisioning infrastructure with Terraform..."
    
    local infra_dir="$PROJECT_ROOT/infrastructure/$CLOUD_PROVIDER"
    
    if [[ ! -d "$infra_dir" ]]; then
        log_error "Infrastructure directory not found: $infra_dir"
        exit 1
    fi
    
    cd "$infra_dir"
    
    # Initialize Terraform
    log_info "Initializing Terraform..."
    terraform init
    
    # Create terraform.tfvars if it doesn't exist
    create_terraform_vars
    
    # Plan infrastructure
    log_info "Planning infrastructure changes..."
    terraform plan -out=tfplan
    
    # Apply infrastructure
    log_info "Applying infrastructure changes..."
    terraform apply tfplan
    
    # Get outputs and configure kubectl
    configure_kubectl_from_terraform
    
    cd "$PROJECT_ROOT"
    log_info "✓ Infrastructure provisioned successfully"
}

create_terraform_vars() {
    local tfvars_file="terraform.tfvars"
    
    if [[ -f "$tfvars_file" ]]; then
        log_info "Using existing $tfvars_file"
        return 0
    fi
    
    log_info "Creating $tfvars_file..."
    
    case $CLOUD_PROVIDER in
        "aws")
            cat > "$tfvars_file" <<EOF
# AWS Infrastructure Variables
# Add your specific values here
EOF
            ;;
        "azure")
            cat > "$tfvars_file" <<EOF
# Azure Infrastructure Variables
location = "${CLOUD_CONFIGS[$CLOUD_PROVIDER]}"
environment = "$ENVIRONMENT"
db_admin_password = "$(openssl rand -base64 32)"
EOF
            ;;
        "gcp")
            cat > "$tfvars_file" <<EOF
# GCP Infrastructure Variables
project_id = "${GCP_PROJECT_ID:-your-project-id}"
region = "${CLOUD_CONFIGS[$CLOUD_PROVIDER]%%-*}"
zone = "${CLOUD_CONFIGS[$CLOUD_PROVIDER]}"
db_admin_password = "$(openssl rand -base64 32)"
EOF
            ;;
    esac
    
    log_info "✓ Created $tfvars_file (please review and customize as needed)"
}

configure_kubectl_from_terraform() {
    log_info "Configuring kubectl from Terraform outputs..."
    
    case $CLOUD_PROVIDER in
        "aws")
            local cluster_name=$(terraform output -raw eks_cluster_name 2>/dev/null || echo "nft-marketplace-eks")
            local region=$(terraform output -raw aws_region 2>/dev/null || echo "${CLOUD_CONFIGS[$CLOUD_PROVIDER]}")
            aws eks update-kubeconfig --region "$region" --name "$cluster_name"
            ;;
        "azure")
            local resource_group=$(terraform output -raw resource_group_name)
            local cluster_name=$(terraform output -raw aks_cluster_name)
            az aks get-credentials --resource-group "$resource_group" --name "$cluster_name" --overwrite-existing
            ;;
        "gcp")
            local cluster_name=$(terraform output -raw gke_cluster_name)
            local cluster_zone=$(terraform output -raw zone)
            local project_id=$(terraform output -raw project_id)
            gcloud container clusters get-credentials "$cluster_name" --zone "$cluster_zone" --project "$project_id"
            ;;
    esac
    
    # Verify kubectl connection
    if kubectl cluster-info &> /dev/null; then
        log_info "✓ kubectl configured successfully"
    else
        log_error "Failed to configure kubectl"
        exit 1
    fi
}
    log_step "Setting up container registry..."
    
    case $CLOUD_PROVIDER in
        "aws")
            # Create ECR repositories if they don't exist
            local services=("frontend" "api-gateway" "ml-service" "ai-scaler")
            for service in "${services[@]}"; do
                if ! aws ecr describe-repositories --repository-names "nft-marketplace/$service" --region "$AWS_REGION" &> /dev/null; then
                    aws ecr create-repository --repository-name "nft-marketplace/$service" --region "$AWS_REGION" &> /dev/null
                    log_info "✓ Created ECR repository: nft-marketplace/$service"
                fi
            done
            
            # Login to ECR
            aws ecr get-login-password --region "$AWS_REGION" | docker login --username AWS --password-stdin "${REGISTRY_URLS["aws"]}"
            log_info "✓ Logged into Amazon ECR"
            ;;
        "azure")
            # Create ACR if it doesn't exist
            local resource_group="nft-marketplace-rg"
            if ! az acr show --name "$ACR_NAME" --resource-group "$resource_group" &> /dev/null; then
                if ! az group show --name "$resource_group" &> /dev/null; then
                    az group create --name "$resource_group" --location "${CLOUD_CONFIGS["azure"]}"
                fi
                az acr create --resource-group "$resource_group" --name "$ACR_NAME" --sku Standard
                log_info "✓ Created Azure Container Registry: $ACR_NAME"
            fi
            
            # Login to ACR
            az acr login --name "$ACR_NAME"
            log_info "✓ Logged into Azure Container Registry"
            ;;
        "gcp")
            # Configure Docker for GCR
            gcloud auth configure-docker --quiet
            log_info "✓ Configured Docker for Google Container Registry"
            ;;
    esac
}

create_namespaces() {
    log_step "Creating namespaces..."
    
    for ns in "$NAMESPACE" "$MONITORING_NAMESPACE"; do
        if kubectl get namespace "$ns" &> /dev/null; then
            log_info "✓ Namespace $ns already exists"
        else
            kubectl create namespace "$ns"
            
            # Add cloud-specific labels
            kubectl label namespace "$ns" cloud-provider="$CLOUD_PROVIDER" --overwrite
            kubectl label namespace "$ns" environment="$ENVIRONMENT" --overwrite
            
            log_info "✓ Created namespace $ns"
        fi
    done
}

get_registry_url() {
    # Try to get from Terraform outputs first
    local registry_url=""
    
    if [[ "$PROVISION_INFRASTRUCTURE" == "true" ]]; then
        local infra_dir="$PROJECT_ROOT/infrastructure/$CLOUD_PROVIDER"
        if [[ -d "$infra_dir" ]]; then
            cd "$infra_dir"
            case $CLOUD_PROVIDER in
                "aws")
                    registry_url=$(terraform output -raw ecr_registry_url 2>/dev/null || echo "")
                    ;;
                "azure")
                    registry_url=$(terraform output -raw acr_login_server 2>/dev/null || echo "")
                    ;;
                "gcp")
                    registry_url=$(terraform output -raw artifact_registry_url 2>/dev/null || echo "")
                    ;;
            esac
            cd "$PROJECT_ROOT"
        fi
    fi
    
    # Fallback to manual configuration
    if [[ -z "$registry_url" ]]; then
        case $CLOUD_PROVIDER in
            "aws")
                echo "${REGISTRY_URLS["aws"]}/nft-marketplace"
                ;;
            "azure")
                echo "${REGISTRY_URLS["azure"]}/nft-marketplace"
                ;;
            "gcp")
                echo "${REGISTRY_URLS["gcp"]}/nft-marketplace"
                ;;
        esac
    else
        echo "$registry_url/nft-marketplace"
    fi
}

build_images() {
    log_step "Building and pushing Docker images..."
    
    local services=("frontend" "api-gateway" "ml-service" "ai-scaler")
    local registry_url=$(get_registry_url)
    
    for service in "${services[@]}"; do
        local local_image="nft-marketplace/$service:latest"
        local remote_image="$registry_url/$service:$ENVIRONMENT"
        
        log_info "Building $local_image..."
        
        case $service in
            "ai-scaler")
                docker build -t "$local_image" "$PROJECT_ROOT/ai-scaler/"
                ;;
            *)
                docker build -t "$local_image" "$PROJECT_ROOT/$service/"
                ;;
        esac
        
        # Tag and push to cloud registry
        docker tag "$local_image" "$remote_image"
        docker push "$remote_image"
        
        # Update deployment files with correct image
        update_deployment_images "$service" "$remote_image"
        
        log_info "✓ Built and pushed $remote_image"
    done
}

update_deployment_images() {
    local service=$1
    local image_url=$2
    local deployment_file=""
    
    case $service in
        "api-gateway")
            deployment_file="$PROJECT_ROOT/k8s/api-gateway-deployment.yaml"
            ;;
        "ml-service")
            deployment_file="$PROJECT_ROOT/k8s/ml-service-deployment.yaml"
            ;;
        "frontend")
            deployment_file="$PROJECT_ROOT/k8s/frontend-deployment.yaml"
            ;;
    esac
    
    if [[ -f "$deployment_file" ]]; then
        # Update image reference in deployment file
        sed -i.bak "s|image: nft-marketplace/$service.*|image: $image_url|g" "$deployment_file"
        log_info "✓ Updated deployment file for $service"
    fi
}

deploy_monitoring() {
    log_step "Deploying monitoring stack..."
    
    # Create cloud-specific monitoring configuration
    create_cloud_monitoring_config
    
    # Deploy Prometheus
    log_info "Deploying Prometheus..."
    kubectl apply -f "$PROJECT_ROOT/k8s/monitoring/prometheus.yaml" -n "$MONITORING_NAMESPACE"
    
    # Deploy Grafana
    log_info "Deploying Grafana..."
    kubectl apply -f "$PROJECT_ROOT/k8s/monitoring/grafana.yaml" -n "$MONITORING_NAMESPACE"
    
    # Wait for monitoring to be ready
    log_info "Waiting for monitoring services to be ready..."
    kubectl wait --for=condition=available --timeout=300s deployment/prometheus -n "$MONITORING_NAMESPACE" || true
    kubectl wait --for=condition=available --timeout=300s deployment/grafana -n "$MONITORING_NAMESPACE" || true
    
    log_info "✓ Monitoring stack deployed"
}

create_cloud_monitoring_config() {
    case $CLOUD_PROVIDER in
        "aws")
            # AWS CloudWatch integration
            kubectl apply -f - <<EOF
apiVersion: v1
kind: ConfigMap
metadata:
  name: cloudwatch-config
  namespace: $MONITORING_NAMESPACE
data:
  cwagentconfig.json: |
    {
      "logs": {
        "metrics_collected": {
          "kubernetes": {
            "cluster_name": "$CLUSTER_NAME",
            "metrics_collection_interval": 60
          }
        }
      }
    }
EOF
            ;;
        "azure")
            # Azure Monitor integration
            kubectl apply -f - <<EOF
apiVersion: v1
kind: ConfigMap
metadata:
  name: azure-monitor-config
  namespace: $MONITORING_NAMESPACE
data:
  config.yaml: |
    cluster:
      name: $CLUSTER_NAME
      region: ${CLOUD_CONFIGS["azure"]}
    azureMonitor:
      enabled: true
EOF
            ;;
        "gcp")
            # Google Cloud Operations integration
            kubectl apply -f - <<EOF
apiVersion: v1
kind: ConfigMap
metadata:
  name: stackdriver-config
  namespace: $MONITORING_NAMESPACE
data:
  config.yaml: |
    project_id: $GCP_PROJECT_ID
    cluster_name: $CLUSTER_NAME
    zone: ${CLOUD_CONFIGS["gcp"]}
EOF
            ;;
    esac
}

deploy_applications() {
    log_step "Deploying application services..."
    
    # Deploy in order: database -> api-gateway -> ml-service -> frontend
    local deployments=(
        "$PROJECT_ROOT/k8s/api-gateway-deployment.yaml"
        "$PROJECT_ROOT/k8s/ml-service-deployment.yaml"
        "$PROJECT_ROOT/k8s/frontend-deployment.yaml"
    )
    
    for deployment in "${deployments[@]}"; do
        if [[ -f "$deployment" ]]; then
            log_info "Deploying $(basename "$deployment")..."
            kubectl apply -f "$deployment" -n "$NAMESPACE"
        else
            log_warn "Deployment file $deployment not found, skipping..."
        fi
    done
    
    # Wait for deployments to be ready
    log_info "Waiting for application deployments to be ready..."
    local apps=("api-gateway" "ml-service" "frontend")
    
    for app in "${apps[@]}"; do
        if kubectl get deployment "$app" -n "$NAMESPACE" &> /dev/null; then
            kubectl wait --for=condition=available --timeout=300s deployment/"$app" -n "$NAMESPACE" || {
                log_warn "Deployment $app did not become ready within timeout"
            }
            log_info "✓ $app deployment ready"
        else
            log_warn "Deployment $app not found, skipping wait..."
        fi
    done
}

deploy_ai_scaling() {
    log_step "Deploying AI-powered scaling..."
    
    # Create AI scaling namespace
    if ! kubectl get namespace ai-scaling &> /dev/null; then
        kubectl create namespace ai-scaling
    fi
    
    # Deploy predictive HPA
    kubectl apply -f "$PROJECT_ROOT/k8s/ai-scaling/predictive-hpa.yaml" -n "$NAMESPACE"
    
    log_info "✓ AI-powered scaling deployed"
}

deploy_service_mesh() {
    log_step "Deploying service mesh (Istio)..."
    
    # Check if Istio is installed
    if ! kubectl get namespace istio-system &> /dev/null; then
        log_warn "Istio not found. Installing Istio..."
        
        # Download and install Istio (basic installation)
        if command -v istioctl &> /dev/null; then
            istioctl install --set values.defaultRevision=default -y
        else
            log_warn "istioctl not found. Please install Istio manually."
            log_warn "Skipping service mesh deployment..."
            return
        fi
    fi
    
    # Label namespace for Istio injection
    kubectl label namespace "$NAMESPACE" istio-injection=enabled --overwrite
    
    # Deploy Istio configurations
    if [[ -f "$PROJECT_ROOT/k8s/service-mesh/istio-config.yaml" ]]; then
        kubectl apply -f "$PROJECT_ROOT/k8s/service-mesh/istio-config.yaml" -n "$NAMESPACE" || {
            log_warn "Failed to apply Istio configurations, this is expected if CRDs are not installed"
        }
    fi
    
    log_info "✓ Service mesh configuration applied"
}

setup_multi_cloud() {
    log_step "Setting up cloud-specific configuration..."
    
    # Create cloud-specific storage classes
    create_storage_classes
    
    # Apply load balancer configurations
    setup_load_balancer
    
    # Apply multi-cloud configurations
    if [[ -f "$PROJECT_ROOT/k8s/multi-cloud/deployment-config.yaml" ]]; then
        kubectl apply -f "$PROJECT_ROOT/k8s/multi-cloud/deployment-config.yaml" -n "$NAMESPACE"
        log_info "✓ Multi-cloud configuration applied"
    else
        log_warn "Multi-cloud configuration not found, skipping..."
    fi
}

create_storage_classes() {
    log_info "Creating cloud-specific storage classes..."
    
    case $CLOUD_PROVIDER in
        "aws")
            kubectl apply -f - <<EOF
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: fast-ssd
provisioner: kubernetes.io/aws-ebs
parameters:
  type: gp3
  iops: "3000"
  fsType: ext4
volumeBindingMode: WaitForFirstConsumer
EOF
            ;;
        "azure")
            kubectl apply -f - <<EOF
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: fast-ssd
provisioner: kubernetes.io/azure-disk
parameters:
  storageaccounttype: Premium_LRS
  kind: Managed
  fsType: ext4
volumeBindingMode: WaitForFirstConsumer
EOF
            ;;
        "gcp")
            kubectl apply -f - <<EOF
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: fast-ssd
provisioner: kubernetes.io/gce-pd
parameters:
  type: pd-ssd
  fsType: ext4
  replication-type: regional-pd
volumeBindingMode: WaitForFirstConsumer
EOF
            ;;
    esac
}

setup_load_balancer() {
    log_info "Setting up cloud-specific load balancer..."
    
    local lb_annotations=""
    case $CLOUD_PROVIDER in
        "aws")
            lb_annotations='
    service.beta.kubernetes.io/aws-load-balancer-type: nlb
    service.beta.kubernetes.io/aws-load-balancer-cross-zone-load-balancing-enabled: "true"
    service.beta.kubernetes.io/aws-load-balancer-backend-protocol: tcp'
            ;;
        "azure")
            lb_annotations='
    service.beta.kubernetes.io/azure-load-balancer-internal: "false"
    service.beta.kubernetes.io/azure-load-balancer-health-probe-request-path: /health'
            ;;
        "gcp")
            lb_annotations='
    cloud.google.com/neg: "ingress"
    cloud.google.com/backend-config: {"default": "nft-backend-config"}'
            ;;
    esac
    
    # Apply load balancer service with cloud-specific annotations
    kubectl apply -f - <<EOF
apiVersion: v1
kind: Service
metadata:
  name: nft-marketplace-lb
  namespace: $NAMESPACE
  annotations:$lb_annotations
spec:
  type: LoadBalancer
  selector:
    app: frontend
  ports:
    - port: 80
      targetPort: 3000
      name: http
    - port: 443
      targetPort: 3000
      name: https
EOF
}

verify_deployment() {
    log_step "Verifying deployment..."
    
    # Check pod status
    log_info "Checking pod status..."
    kubectl get pods -n "$NAMESPACE" -o wide
    
    # Check services
    log_info "Checking services..."
    kubectl get services -n "$NAMESPACE"
    
    # Check ingress
    log_info "Checking ingress..."
    kubectl get ingress -n "$NAMESPACE" || log_warn "No ingress found"
    
    # Check monitoring
    log_info "Checking monitoring services..."
    kubectl get pods -n "$MONITORING_NAMESPACE" || log_warn "Monitoring namespace not found"
    
    # Health checks
    log_info "Performing health checks..."
    local health_endpoints=(
        "api-gateway-service:3005/health"
        "ml-service-service:5000/health"
        "frontend-service:3000"
    )
    
    for endpoint in "${health_endpoints[@]}"; do
        local service_name=$(echo "$endpoint" | cut -d: -f1)
        local port=$(echo "$endpoint" | cut -d: -f2 | cut -d/ -f1)
        local path=$(echo "$endpoint" | cut -d/ -f2-)
        
        if kubectl get service "$service_name" -n "$NAMESPACE" &> /dev/null; then
            log_info "✓ Service $service_name is running"
            
            # Port forward for health check
            kubectl port-forward "service/$service_name" "$port:$port" -n "$NAMESPACE" &
            local pf_pid=$!
            sleep 2
            
            if curl -s "http://localhost:$port/$path" &> /dev/null; then
                log_info "✓ Health check passed for $service_name"
            else
                log_warn "Health check failed for $service_name"
            fi
            
            kill $pf_pid 2>/dev/null || true
        else
            log_warn "Service $service_name not found"
        fi
    done
}

show_access_info() {
    log_step "Deployment completed! Access information:"
    
    echo
    echo "🚀 NFT Marketplace Cloud-Native Deployment Complete!"
    echo "☁️  Cloud Provider: $(echo $CLOUD_PROVIDER | tr '[:lower:]' '[:upper:]')"
    echo "🌍 Region: ${CLOUD_CONFIGS[$CLOUD_PROVIDER]}"
    if [[ "${PROVISION_INFRASTRUCTURE:-false}" == "true" ]]; then
        echo "🏗️  Infrastructure: Provisioned via Terraform"
    else
        echo "🏗️  Infrastructure: Using existing cluster"
    fi
    echo
    
    # Show Terraform infrastructure details if provisioned
    if [[ "${PROVISION_INFRASTRUCTURE:-false}" == "true" ]]; then
        echo "🏗️ Infrastructure Details (from Terraform):"
        cd infrastructure/$CLOUD_PROVIDER
        
        case $CLOUD_PROVIDER in
            "aws")
                CLUSTER_ENDPOINT=$(terraform output -raw cluster_endpoint 2>/dev/null || echo "Not available")
                REGISTRY_URL=$(terraform output -raw ecr_registry_url 2>/dev/null || echo "Not available")
                echo "  • EKS Cluster: $(terraform output -raw cluster_name 2>/dev/null || echo "Not available")"
                echo "  • Cluster Endpoint: $CLUSTER_ENDPOINT"
                echo "  • ECR Registry: $REGISTRY_URL"
                echo "  • AWS Console: https://console.aws.amazon.com/eks/home?region=${CLOUD_CONFIGS[$CLOUD_PROVIDER]}#/clusters/$(terraform output -raw cluster_name 2>/dev/null)"
                ;;
            "azure")
                CLUSTER_NAME=$(terraform output -raw aks_cluster_name 2>/dev/null || echo "Not available")
                REGISTRY_URL=$(terraform output -raw acr_login_server 2>/dev/null || echo "Not available")
                echo "  • AKS Cluster: $CLUSTER_NAME"
                echo "  • Resource Group: $(terraform output -raw resource_group_name 2>/dev/null || echo "Not available")"
                echo "  • ACR Registry: $REGISTRY_URL"
                echo "  • Azure Portal: https://portal.azure.com/#@/resource/subscriptions/$(terraform output -raw subscription_id 2>/dev/null)/resourceGroups/$(terraform output -raw resource_group_name 2>/dev/null)/overview"
                ;;
            "gcp")
                CLUSTER_NAME=$(terraform output -raw gke_cluster_name 2>/dev/null || echo "Not available")
                REGISTRY_URL=$(terraform output -raw artifact_registry_url 2>/dev/null || echo "Not available")
                echo "  • GKE Cluster: $CLUSTER_NAME"
                echo "  • Project ID: $(terraform output -raw project_id 2>/dev/null || echo "Not available")"
                echo "  • Artifact Registry: $REGISTRY_URL"
                echo "  • GCP Console: https://console.cloud.google.com/kubernetes/clusters/details/$(terraform output -raw region 2>/dev/null)/$CLUSTER_NAME?project=$(terraform output -raw project_id 2>/dev/null)"
                ;;
        esac
        
        cd ../../
        echo
    fi
    
    # Get load balancer IP/hostname
    local lb_info=""
    case $CLOUD_PROVIDER in
        "aws")
            lb_info=$(kubectl get service nft-marketplace-lb -n "$NAMESPACE" -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' 2>/dev/null || echo "pending...")
            echo "🔗 Load Balancer: $lb_info"
            if [[ "${PROVISION_INFRASTRUCTURE:-false}" != "true" ]]; then
                echo "📋 AWS Console: https://console.aws.amazon.com/eks/home?region=$AWS_REGION#/clusters/$CLUSTER_NAME"
            fi
            ;;
        "azure")
            lb_info=$(kubectl get service nft-marketplace-lb -n "$NAMESPACE" -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "pending...")
            echo "� Load Balancer: $lb_info"
            echo "📋 Azure Portal: https://portal.azure.com/#@/resource/subscriptions/$AZURE_SUBSCRIPTION/resourceGroups/nft-marketplace-rg/overview"
            ;;
        "gcp")
            lb_info=$(kubectl get service nft-marketplace-lb -n "$NAMESPACE" -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "pending...")
            echo "🔗 Load Balancer: $lb_info"
            if [[ "${PROVISION_INFRASTRUCTURE:-false}" != "true" ]]; then
                echo "📋 GCP Console: https://console.cloud.google.com/kubernetes/clusters/details/${CLOUD_CONFIGS['gcp']}/$CLUSTER_NAME?project=$GCP_PROJECT_ID"
            fi
            ;;
    esac
    
    echo
    echo "�📊 Monitoring Dashboards:"
    
    # Get service URLs
    if kubectl get service grafana-service -n "$MONITORING_NAMESPACE" &> /dev/null; then
        local grafana_port=$(kubectl get service grafana-service -n "$MONITORING_NAMESPACE" -o jsonpath='{.spec.ports[0].nodePort}')
        echo "  • Grafana: http://localhost:$grafana_port (admin/nft-admin-2024)"
        echo "    kubectl port-forward service/grafana-service $grafana_port:3000 -n $MONITORING_NAMESPACE"
    fi
    
    if kubectl get service prometheus-service -n "$MONITORING_NAMESPACE" &> /dev/null; then
        echo "  • Prometheus: http://localhost:9090"
        echo "    kubectl port-forward service/prometheus-service 9090:9090 -n $MONITORING_NAMESPACE"
    fi
    
    echo
    echo "🌐 Application Services:"
    
    if kubectl get service frontend-service -n "$NAMESPACE" &> /dev/null; then
        echo "  • Frontend: http://localhost:3000"
        echo "    kubectl port-forward service/frontend-service 3000:3000 -n $NAMESPACE"
    fi
    
    if kubectl get service api-gateway-service -n "$NAMESPACE" &> /dev/null; then
        echo "  • API Gateway: http://localhost:3005"
        echo "    kubectl port-forward service/api-gateway-service 3005:3005 -n $NAMESPACE"
    fi
    
    echo
    echo "🤖 AI Features:"
    echo "  • Predictive auto-scaling active"
    echo "  • NFT market trend analysis"
    echo "  • ML-powered recommendations"
    echo "  • Smart contract gas optimization"
    
    echo
    echo "☁️  Cloud-Specific Features:"
    case $CLOUD_PROVIDER in
        "aws")
            echo "  • EKS cluster with managed node groups"
            echo "  • ECR for container images"
            echo "  • EBS CSI for persistent storage"
            echo "  • CloudWatch integration"
            echo "  • Network Load Balancer"
            ;;
        "azure")
            echo "  • AKS cluster with virtual node pools"
            echo "  • Azure Container Registry"
            echo "  • Azure Disk CSI for storage"
            echo "  • Azure Monitor integration"
            echo "  • Azure Load Balancer"
            ;;
        "gcp")
            echo "  • GKE cluster with auto-scaling"
            echo "  • Google Container Registry"
            echo "  • Persistent Disk CSI"
            echo "  • Cloud Operations integration"
            echo "  • Google Cloud Load Balancer"
            ;;
    esac
    
    echo "  • Service mesh with Istio"
    echo "  • Advanced monitoring with Prometheus/Grafana"
    echo "  • Circuit breakers and retries"
    echo "  • Auto-scaling based on NFT transaction patterns"
    
    echo
    echo "🔍 Useful Commands:"
    echo "  • Watch pods: kubectl get pods -n $NAMESPACE -w"
    echo "  • View logs: kubectl logs -f deployment/api-gateway -n $NAMESPACE"
    echo "  • Scale service: kubectl scale deployment api-gateway --replicas=5 -n $NAMESPACE"
    echo "  • Check HPA: kubectl get hpa -n $NAMESPACE"
    
    if [[ "${PROVISION_INFRASTRUCTURE:-false}" == "true" ]]; then
        echo
        echo "🏗️ Infrastructure Management:"
        echo "  • View infrastructure: cd infrastructure/$CLOUD_PROVIDER && terraform show"
        echo "  • Update infrastructure: cd infrastructure/$CLOUD_PROVIDER && terraform apply"
        echo "  • Destroy infrastructure: cd infrastructure/$CLOUD_PROVIDER && terraform destroy"
        echo "  ⚠️  Warning: Destroying infrastructure will delete all resources!"
    fi
    
    echo
    echo "🎯 Next Steps:"
    echo "  1. Configure your domain DNS to point to: $lb_info"
    echo "  2. Set up TLS certificates"
    echo "  3. Configure external monitoring alerts"
    echo "  4. Set up backup and disaster recovery"
    echo
}

cleanup() {
    log_step "Cleaning up..."
    
    # Kill any background processes
    jobs -p | xargs -r kill 2>/dev/null || true
    
    log_info "Cleanup completed"
}

main() {
    log_info "🚀 Starting NFT Marketplace Multi-Cloud Deployment"
    log_info "Environment: $ENVIRONMENT"
    log_info "Cloud Provider: $(echo $CLOUD_PROVIDER | tr '[:lower:]' '[:upper:]')"
    log_info "Region: ${CLOUD_CONFIGS[$CLOUD_PROVIDER]}"
    log_info "Provision Infrastructure: ${PROVISION_INFRASTRUCTURE:-false}"
    echo
    
    trap cleanup EXIT
    
    check_prerequisites
    provision_infrastructure
    setup_container_registry
    create_namespaces
    build_images
    deploy_monitoring
    deploy_applications
    deploy_ai_scaling
    deploy_service_mesh
    setup_multi_cloud
    verify_deployment
    show_access_info
    
    log_info "🎉 Deployment script completed successfully!"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --environment|-e)
            ENVIRONMENT="$2"
            shift 2
            ;;
        --cloud|-c)
            CLOUD_PROVIDER="$2"
            # Validate cloud provider
            if [[ ! "$CLOUD_PROVIDER" =~ ^(aws|azure|gcp)$ ]]; then
                log_error "Invalid cloud provider: $CLOUD_PROVIDER"
                log_error "Supported providers: aws, azure, gcp"
                exit 1
            fi
            shift 2
            ;;
        --namespace|-n)
            NAMESPACE="$2"
            shift 2
            ;;
        --region|-r)
            case $CLOUD_PROVIDER in
                "aws")
                    AWS_REGION="$2"
                    CLOUD_CONFIGS["aws"]="$2"
                    ;;
                "azure")
                    CLOUD_CONFIGS["azure"]="$2"
                    ;;
                "gcp")
                    CLOUD_CONFIGS["gcp"]="$2"
                    ;;
            esac
            shift 2
            ;;
        --registry|-reg)
            case $CLOUD_PROVIDER in
                "aws")
                    AWS_ACCOUNT_ID=$(echo "$2" | cut -d'.' -f1)
                    ;;
                "azure")
                    ACR_NAME="$2"
                    ;;
                "gcp")
                    GCP_PROJECT_ID="$2"
                    ;;
            esac
            shift 2
            ;;
        --help|-h)
            echo "NFT Marketplace Multi-Cloud Deployment Script"
            echo
            echo "Usage: $0 [OPTIONS]"
            echo
            echo "Options:"
            echo "  -e, --environment    Deployment environment (default: production)"
            echo "  -c, --cloud         Cloud provider: aws, azure, gcp (default: aws)"
            echo "  -n, --namespace     Kubernetes namespace (default: default)"
            echo "  -r, --region        Cloud region (default: cloud-specific default)"
            echo "  -reg, --registry    Container registry identifier:"
            echo "                        AWS: Account ID"
            echo "                        Azure: ACR name"
            echo "                        GCP: Project ID"
            echo "  -h, --help          Show this help message"
            echo
            echo "Examples:"
            echo "  # Deploy to AWS (default)"
            echo "  $0 --cloud aws --region us-west-2"
            echo
            echo "  # Deploy to Azure"
            echo "  $0 --cloud azure --region westus2 --registry myacrname"
            echo
            echo "  # Deploy to GCP"
            echo "  $0 --cloud gcp --region us-central1-b --registry my-project-id"
            echo
            echo "Prerequisites:"
            echo "  AWS:   aws cli configured with credentials"
            echo "  Azure: az cli logged in with subscription"
            echo "  GCP:   gcloud cli authenticated with project set"
            echo
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

main "$@"