# --- 1. OIDC Identity Provider for GitHub Actions ---
resource "aws_iam_openid_connect_provider" "github" {
  url = "https://token.actions.githubusercontent.com"

  client_id_list = [
    "sts.amazonaws.com"
  ]

  thumbprint_list = ["6938fd4d98bab03faadb97b34396831e3780aea1"] # Standard GitHub thumbprint
  lifecycle {
    prevent_destroy = true
  }
}

# --- 2. IAM Role for GitHub Actions ---
# This is the role our workflow will assume.
resource "aws_iam_role" "github_actions" {
  name = "GitHubActionsRole"

  assume_role_policy = jsonencode({
    Version   = "2012-10-17",
    Statement = [
      {
        Effect    = "Allow",
        Principal = {
          Federated = aws_iam_openid_connect_provider.github.arn
        },
        Action    = "sts:AssumeRoleWithWebIdentity",
        Condition = {
          StringLike = {
            # This ensures only your specific GitHub repo can assume this role
            "token.actions.githubusercontent.com:sub" : "repo:YASHMAHAKAL/nft-marketplace-project:*"
          }
        }
      }
    ]
  })
  lifecycle {
        prevent_destroy = true
    }
}