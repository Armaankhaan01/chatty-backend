resource "aws_launch_template" "asg_launch_template" {
  name          = "${local.prefix}-launch-template"
  image_id      = data.aws_ami.al2023.id
  instance_type = var.ec2_instance_type
  key_name      = "chatappKeyPair"

  network_interfaces {
    associate_public_ip_address = false
    security_groups             = [aws_security_group.autoscaling_group_sg.id]
  }

  iam_instance_profile {
    name = aws_iam_instance_profile.ec2_instance_profile.name
  }

  user_data = filebase64("${path.module}/userdata/user-data.sh")

  block_device_mappings {
    device_name = "/dev/xvda" # Default root volume for Amazon Linux 2023
    ebs {
      volume_size           = 30    # Size in GB
      volume_type           = "gp3" # General Purpose SSD (gp3)
      delete_on_termination = true  # Delete when the instance is terminated
      encrypted             = true  # Encrypt the volume
    }
  }

  tag_specifications {
    resource_type = "instance"
    tags = merge(
      local.common_tags,
      tomap({ "Name" = "${local.prefix}-asg-instance" })
    )
  }

  tags = merge(
    local.common_tags,
    tomap({ "Name" = "${local.prefix}-launch-template" })
  )
}
