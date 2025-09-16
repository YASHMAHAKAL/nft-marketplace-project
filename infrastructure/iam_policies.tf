# Policy to allow pushing to ECR and describing the EKS cluster
data "aws_iam_policy_document" "github_actions" {
  statement {
    sid    = "ECRAccess"
    effect = "Allow"
    actions = [
      "ecr:GetAuthorizationToken",
      "ecr:BatchCheckLayerAvailability",
      "ecr:GetDownloadUrlForLayer",
      "ecr:GetRepositoryPolicy",
      "ecr:DescribeRepositories",
      "ecr:ListImages",
      "ecr:DescribeImages",
      "ecr:BatchGetImage",
      "ecr:InitiateLayerUpload",
      "ecr:UploadLayerPart",
      "ecr:CompleteLayerUpload",
      "ecr:PutImage"
    ]
    resources = ["*"] # For simplicity; can be restricted to specific ECR repos
  }

  statement {
    sid    = "EKSDescribe"
    effect = "Allow"
    actions = [
      "eks:DescribeCluster"
    ]
    resources = [aws_eks_cluster.main.arn]
  }
}

resource "aws_iam_policy" "github_actions" {
  name   = "GitHubActionsPolicy"
  policy = data.aws_iam_policy_document.github_actions.json
}

resource "aws_iam_role_policy_attachment" "github_actions" {
  role       = aws_iam_role.github_actions.name
  policy_arn = aws_iam_policy.github_actions.arn
}