  #!/bin/bash

  # Check if a program is installed
  function program_is_installed {
    type "$1" >/dev/null 2>&1 && echo 1 || echo 0
  }

  # Ensure 'zip' is installed
  if [[ $(program_is_installed zip) -eq 0 ]]; then
    echo "Installing zip..."
    if command -v apk &>/dev/null; then
      apk update
      apk add zip
    else
      echo "Error: 'apk' not available to install 'zip'. Install it manually."
      exit 1
    fi
  fi

  # Sync files from S3
  aws s3 sync s3://chatapp-env-files-ark/develop .
  unzip env-file.zip || { echo "Failed to unzip env-file.zip"; exit 1; }
  cp .env.develop .env
  rm .env.develop

  # Update Redis host in the .env file
  sed -i -e "s|^\(REDIS_HOST=\).*|\1redis://$ELASTICACHE_ENDPOINT:6379|g" .env

  # Repackage the updated environment file
  rm -rf env-file.zip
  cp .env .env.develop
  zip env-file.zip .env.develop || { echo "Failed to create env-file.zip"; exit 1; }

  # Upload updated file back to S3
  aws --region ap-south-1 s3 cp env-file.zip s3://chatapp-env-files-ark/backend/develop/ || {
    echo "Failed to upload env-file.zip to S3"; exit 1;
  }

  # Clean up
  rm -rf .env* env-file.zip
