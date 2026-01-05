#!/bin/bash
set -e  # Exit immediately if a command fails

# 1. DYNAMIC CONFIGURATION ---
echo "🔍 Fetching AWS Configuration from Terraform..."

# Pulling values from your Terraform modular outputs
ECR_URL=$(terraform -chdir=terraform output -raw ecr_repository_url)
ECS_CLUSTER=$(terraform -chdir=terraform output -raw ecs_cluster_name)
ECS_SERVICE=$(terraform -chdir=terraform output -raw ecs_service_name)

AWS_REGION="us-east-1"
REPO_NAME="wallet-pro"

echo "🚀 Starting Deployment for $REPO_NAME..."

# 2. BACKUP ---
TIMESTAMP=$(date +%Y%m%d_%H%M)
ZIP_NAME="backup_${TIMESTAMP}.zip"
echo "🗜️ Step 1: Creating source backup: $ZIP_NAME"
# Note: Added 'frontend/' to the backup list
zip -r "$ZIP_NAME" src/ frontend/ package.json tsconfig.json Dockerfile terraform/ .dockerignore -x "*node_modules*" "*dist*" ".terraform*"

# 3. BUILD & AUTHENTICATE ---
echo "🏗️ Step 2: Building Docker image..."
# The Multi-Stage Dockerfile handles 'npm install' for both FE and BE internally
docker build -t $REPO_NAME .
docker tag $REPO_NAME:latest $ECR_URL:latest

echo "🔑 Step 3: Logging into AWS ECR..."
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_URL

# 4. CLOUD PUSH & ROLLOUT ---
echo "📤 Step 4: Pushing image to ECR..."
docker push $ECR_URL:latest

echo "☁️ Step 5: Triggering Rolling Update on ECS..."
# This forces ECS to pull the new ':latest' image containing both FE and BE
aws ecs update-service --cluster $ECS_CLUSTER --service $ECS_SERVICE --force-new-deployment --region $AWS_REGION

# 5. WAIT FOR STABILITY ---
echo "⏳ Waiting for service to reach a steady state..."
aws ecs wait services-stable --cluster $ECS_CLUSTER --services $ECS_SERVICE --region $AWS_REGION

echo "---------------------------------------------------"
echo "✨ DEPLOYMENT COMPLETE!"
echo "Your App is now live on AWS."
echo "---------------------------------------------------"
