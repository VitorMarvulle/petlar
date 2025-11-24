provider "aws" {
  region = var.aws_region
}

# -------------------------
#  S3 Bucket (PRIVADO)
# -------------------------
resource "aws_s3_bucket" "petbucket" {
  bucket = var.bucket_name

  tags = {
    Name        = "PetAppBucket"
    Environment = "dev"
  }
}

# Bloqueia acesso público
resource "aws_s3_bucket_public_access_block" "public_block" {
  bucket = aws_s3_bucket.petbucket.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# -------------------------
#  IAM USER
# -------------------------
resource "aws_iam_user" "petapp_user" {
  name = "petapp-s3-user"
}

# -------------------------
#  IAM POLICY (somente acesso interno)
# -------------------------
resource "aws_iam_policy" "petapp_policy" {
  name = "petapp-s3-policy"

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Action = [
          "s3:PutObject",
          "s3:GetObject",
          "s3:DeleteObject"
        ],
        Resource = "${aws_s3_bucket.petbucket.arn}/*"
      }
    ]
  })
}

# Vincular policy ao usuário
resource "aws_iam_user_policy_attachment" "attach_policy" {
  user       = aws_iam_user.petapp_user.name
  policy_arn = aws_iam_policy.petapp_policy.arn
}

# -------------------------
#  ACCESS KEY
# -------------------------
resource "aws_iam_access_key" "petapp_access_key" {
  user = aws_iam_user.petapp_user.name
}
