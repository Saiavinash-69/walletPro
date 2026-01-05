resource "aws_ecr_repository" "app" {
  name         = "wallet-pro"
  force_delete = true
}

resource "aws_ecs_cluster" "main" {
  name = "wallet-pro-cluster"
}

resource "aws_ecs_task_definition" "app" {
  family                   = "wallet-pro-task"
  network_mode             = "bridge"
  requires_compatibilities = ["EC2"]
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn

  container_definitions = jsonencode([
    {
      name      = "wallet-pro"
      image     = "${aws_ecr_repository.app.repository_url}:latest"
      cpu       = 256
      memory    = 512
      essential = true
      portMappings = [{ containerPort = 3000, hostPort = 3000 }]
    }
  ])
}

resource "aws_ecs_service" "app" {
  name            = "wallet-pro-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.app.arn
  desired_count   = 1
  launch_type     = "EC2"
}
