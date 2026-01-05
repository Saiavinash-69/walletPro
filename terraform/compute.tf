data "aws_ssm_parameter" "ecs_ami" {
  name = "/aws/service/ecs/optimized-ami/amazon-linux-2/recommended/image_id"
}

resource "aws_launch_template" "ecs_node" {
  name_prefix   = "ecs-node-"
  image_id      = data.aws_ssm_parameter.ecs_ami.value
  instance_type = "t3.micro"
  
  user_data = base64encode("#!/bin/bash\necho ECS_CLUSTER=${aws_ecs_cluster.main.name} >> /etc/ecs/ecs.config")

  vpc_security_group_ids = [aws_security_group.ecs_sg.id]
  
  iam_instance_profile { 
    name = aws_iam_instance_profile.ecs_instance_profile.name 
  }
}

resource "aws_autoscaling_group" "ecs_asg" {
  vpc_zone_identifier = data.aws_subnets.default.ids
  desired_capacity    = 1
  max_size            = 1
  min_size            = 1
  launch_template {
    id      = aws_launch_template.ecs_node.id
    version = "$Latest"
  }
}
