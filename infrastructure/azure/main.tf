# Azure Infrastructure for NFT Marketplace
terraform {
  required_version = ">= 1.0"
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.0"
    }
  }
}

provider "azurerm" {
  features {}
}

# Resource Group
resource "azurerm_resource_group" "main" {
  name     = "nft-marketplace-rg"
  location = var.location

  tags = {
    Environment = var.environment
    Project     = "NFT-Marketplace"
  }
}

# Virtual Network
resource "azurerm_virtual_network" "main" {
  name                = "nft-marketplace-vnet"
  address_space       = ["10.1.0.0/16"]
  location           = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name

  tags = {
    Environment = var.environment
    Project     = "NFT-Marketplace"
  }
}

# Subnet for AKS
resource "azurerm_subnet" "aks" {
  name                 = "aks-subnet"
  resource_group_name  = azurerm_resource_group.main.name
  virtual_network_name = azurerm_virtual_network.main.name
  address_prefixes     = ["10.1.1.0/24"]
}

# Network Security Group
resource "azurerm_network_security_group" "aks" {
  name                = "aks-nsg"
  location           = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name

  security_rule {
    name                       = "allow-https"
    priority                   = 1001
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "443"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }

  security_rule {
    name                       = "allow-http"
    priority                   = 1002
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "80"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }

  tags = {
    Environment = var.environment
    Project     = "NFT-Marketplace"
  }
}

# Associate NSG with subnet
resource "azurerm_subnet_network_security_group_association" "aks" {
  subnet_id                 = azurerm_subnet.aks.id
  network_security_group_id = azurerm_network_security_group.aks.id
}

# Azure Container Registry
resource "azurerm_container_registry" "main" {
  name                = "nftmarketplace${random_string.suffix.result}"
  resource_group_name = azurerm_resource_group.main.name
  location           = azurerm_resource_group.main.location
  sku                = "Standard"
  admin_enabled      = true

  tags = {
    Environment = var.environment
    Project     = "NFT-Marketplace"
  }
}

# Random string for unique naming
resource "random_string" "suffix" {
  length  = 8
  special = false
  upper   = false
}

# AKS Cluster
resource "azurerm_kubernetes_cluster" "main" {
  name                = "nft-marketplace-aks"
  location           = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  dns_prefix         = "nftmarketplace"
  kubernetes_version = var.kubernetes_version

  default_node_pool {
    name           = "default"
    node_count     = var.node_count
    vm_size        = var.node_size
    vnet_subnet_id = azurerm_subnet.aks.id

    # Enable auto-scaling
    enable_auto_scaling = true
    min_count          = var.min_node_count
    max_count          = var.max_node_count

    # Node labels
    node_labels = {
      "workload" = "general"
    }

    tags = {
      Environment = var.environment
      Project     = "NFT-Marketplace"
    }
  }

  # ML workload node pool
  dynamic "default_node_pool" {
    for_each = var.enable_ml_nodes ? [1] : []
    content {
      name           = "mlnodes"
      node_count     = 2
      vm_size        = "Standard_D4s_v3"
      vnet_subnet_id = azurerm_subnet.aks.id
      
      node_labels = {
        "workload" = "ml-service"
      }

      node_taints = [
        "ml-workload=true:NoSchedule"
      ]
    }
  }

  identity {
    type = "SystemAssigned"
  }

  network_profile {
    network_plugin    = "azure"
    load_balancer_sku = "standard"
  }

  # Enable monitoring
  oms_agent {
    log_analytics_workspace_id = azurerm_log_analytics_workspace.main.id
  }

  # Enable Azure RBAC
  azure_active_directory_role_based_access_control {
    managed = true
  }

  tags = {
    Environment = var.environment
    Project     = "NFT-Marketplace"
  }
}

# Additional node pool for ML workloads
resource "azurerm_kubernetes_cluster_node_pool" "ml_nodes" {
  count                 = var.enable_ml_nodes ? 1 : 0
  name                  = "mlnodes"
  kubernetes_cluster_id = azurerm_kubernetes_cluster.main.id
  vm_size              = "Standard_D4s_v3"
  node_count           = 2
  vnet_subnet_id       = azurerm_subnet.aks.id

  # Enable auto-scaling
  enable_auto_scaling = true
  min_count          = 1
  max_count          = 8

  node_labels = {
    "workload" = "ml-service"
  }

  node_taints = [
    "ml-workload=true:NoSchedule"
  ]

  tags = {
    Environment = var.environment
    Project     = "NFT-Marketplace"
    Workload    = "ML-Service"
  }
}

# Log Analytics Workspace for monitoring
resource "azurerm_log_analytics_workspace" "main" {
  name                = "nft-marketplace-logs"
  location           = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  sku                = "PerGB2018"
  retention_in_days  = 30

  tags = {
    Environment = var.environment
    Project     = "NFT-Marketplace"
  }
}

# Azure Database for PostgreSQL (Flexible Server)
resource "azurerm_postgresql_flexible_server" "main" {
  name                   = "nft-marketplace-db-${random_string.suffix.result}"
  resource_group_name    = azurerm_resource_group.main.name
  location              = azurerm_resource_group.main.location
  version               = "13"
  administrator_login    = var.db_admin_username
  administrator_password = var.db_admin_password
  zone                  = "1"
  storage_mb            = 32768
  sku_name             = var.db_sku_name

  tags = {
    Environment = var.environment
    Project     = "NFT-Marketplace"
  }
}

# Database
resource "azurerm_postgresql_flexible_server_database" "main" {
  name      = "nft_marketplace"
  server_id = azurerm_postgresql_flexible_server.main.id
  collation = "en_US.utf8"
  charset   = "utf8"
}

# ACR role assignment for AKS
resource "azurerm_role_assignment" "aks_acr" {
  principal_id                     = azurerm_kubernetes_cluster.main.kubelet_identity[0].object_id
  role_definition_name             = "AcrPull"
  scope                           = azurerm_container_registry.main.id
  skip_service_principal_aad_check = true
}