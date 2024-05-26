#!/bin/bash

echo "Starting Serverless deploy..."

export aws_region="us-east-1"
export aws_account_id="000000000000"
export LOG_LEVEL="debug"
export aws_custom_endpoint="http://localstack:4507"
export aws_access_key='test'
export aws_secret_key='test'
yarn nx deploy back-end
# cd /app/monorepo/apps/back-end/localstack && yarn run -T serverless deploy --stage local