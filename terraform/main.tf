# Configure the AWS Provider
provider "aws" {
  region = "us-east-1" # Replace with your desired AWS region
}

# Create the DynamoDB table
resource "aws_dynamodb_table" "todos_table" {
  name           = "todos-table-${var.environment}" # Replace "var.environment" with the desired environment (e.g., "dev", "prod")
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "id"

  attribute {
    name = "id"
    type = "S"
  }
}

# Create the IAM role for the Lambda function
resource "aws_iam_role" "lambda_role" {
  name               = "lambda-role"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume_role_policy.json
}

# Define the trust policy for the IAM role
data "aws_iam_policy_document" "lambda_assume_role_policy" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

# Attach the necessary IAM policy to the role
resource "aws_iam_role_policy_attachment" "lambda_dynamodb_policy_attachment" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = aws_iam_policy.lambda_dynamodb_policy.arn
}

# Define the IAM policy for DynamoDB access
resource "aws_iam_policy" "lambda_dynamodb_policy" {
  name   = "lambda-dynamodb-policy"
  policy = data.aws_iam_policy_document.lambda_dynamodb_policy_document.json
}

# Define the IAM policy document for DynamoDB access
data "aws_iam_policy_document" "lambda_dynamodb_policy_document" {
  statement {
    actions = [
      "dynamodb:Query",
      "dynamodb:Scan",
      "dynamodb:GetItem",
      "dynamodb:PutItem",
      "dynamodb:UpdateItem",
      "dynamodb:DeleteItem",
    ]
    resources = [aws_dynamodb_table.todos_table.arn]
  }
}

# Create the Lambda function
resource "aws_lambda_function" "lambda_function" {
  filename         = "apps/dist/back-end/main.zip"
  function_name    = "todo-back-end"
  role             = aws_iam_role.lambda_role.arn
  handler          = "main.handler"
  runtime          = "nodejs20.x"
  source_code_hash = filebase64sha256("apps/dist/back-end/main.zip")

  environment {
    variables = {
      TODOS_TABLE = aws_dynamodb_table.todos_table.name
    }
  }
}

# Create the API Gateway
resource "aws_apigatewayv2_api" "api_gateway" {
  name          = "todo-back-end-api"
  protocol_type = "HTTP"
}

# Create the API Gateway integration
resource "aws_apigatewayv2_integration" "lambda_integration" {
  api_id               = aws_apigatewayv2_api.api_gateway.id
  integration_type     = "AWS_PROXY"
  integration_method   = "POST"
  integration_uri      = aws_lambda_function.lambda_function.invoke_arn
  payload_format_version = "2.0"
}

# Create the API Gateway route
resource "aws_apigatewayv2_route" "api_route" {
  api_id    = aws_apigatewayv2_api.api_gateway.id
  route_key = "ANY /{proxy+}"
  target    = "integrations/${aws_apigatewayv2_integration.lambda_integration.id}"
}

# Create the API Gateway stage
resource "aws_apigatewayv2_stage" "api_stage" {
  api_id      = aws_apigatewayv2_api.api_gateway.id
  name        = "prod" # Replace with the desired stage name
  auto_deploy = true
}