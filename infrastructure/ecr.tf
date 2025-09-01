resource "aws_ecr_repository" "frontend" {
  name                 = "nft-marketplace/frontend"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }
  lifecycle {
    prevent_destroy = true
    }
}

resource "aws_ecr_repository" "api_gateway" {
  name                 = "nft-marketplace/api-gateway"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }
  lifecycle {
    prevent_destroy = true
  
}
}

resource "aws_ecr_repository" "ml_service" {
  name                 = "nft-marketplace/ml-service"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }
  lifecycle {
    prevent_destroy = true
    }
}