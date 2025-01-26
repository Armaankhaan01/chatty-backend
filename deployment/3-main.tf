terraform {
  backend "s3" {
    bucket  = "chatty-app-terraform-state-ark"
    key     = "develop/chatapp.tfstate"
    region  = "ap-south-1"
    encrypt = true
  }
}

locals {
  prefix = "${var.prefix}-${terraform.workspace}"

  common_tags = {
    Environment = terraform.workspace
    Project     = var.project
    ManagedBy   = "Terraform"
    Owner       = "Arman Khan"
  }
}
