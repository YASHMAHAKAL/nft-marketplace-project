# --- 1. Security Group for the RDS Database ---
# This acts as a virtual firewall, controlling traffic to the database.
resource "aws_security_group" "db" {
  name        = "nft-db-security-group"
  description = "Allow traffic from within the VPC to the RDS instance"
  vpc_id      = aws_vpc.main.id

  # Ingress rule to allow PostgreSQL traffic from any resource inside the VPC
  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = [aws_vpc.main.cidr_block] # Only allows traffic from within our VPC
  }

  # Egress rule to allow all outbound traffic
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "nft-db-sg"
  }
}

# --- 2. DB Subnet Group ---
# Tells RDS which subnets it can be placed in.
resource "aws_db_subnet_group" "main" {
  name       = "nft-db-subnet-group"
  subnet_ids = [for s in aws_subnet.public : s.id]

  tags = {
    Name = "NFT Marketplace DB Subnet Group"
  }
}

# --- 3. PostgreSQL Database Instance (RDS) ---
# [cite_start]This will store our structured data like user profiles and order history[cite: 155, 156].
resource "aws_db_instance" "main" {
  identifier             = "nft-marketplace-db"
  engine                 = "postgres"
  engine_version         = "15.7"
  instance_class         = "db.t3.micro" # Free Tier eligible
  allocated_storage      = 20
  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.db.id]
  publicly_accessible    = false
  skip_final_snapshot    = true

  # IMPORTANT: Store these credentials securely, for example in AWS Secrets Manager.
  # For this project, we are defining them here for simplicity.
  username = "postgres"
  password = "mysecretpassword" # Change this to a strong password
}

# --- 4. DynamoDB Table (NoSQL) ---
# [cite_start]This will store our flexible data like user sessions and ML model outputs[cite: 161, 163].
resource "aws_dynamodb_table" "main" {
  name           = "nft-marketplace-sessions"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "SessionId"

  attribute {
    name = "SessionId"
    type = "S"
  }

  tags = {
    Name = "nft-marketplace-dynamodb-table"
  }
}