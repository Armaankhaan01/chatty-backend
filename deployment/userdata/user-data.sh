#!/bin/bash

# Function to check if a program is installed
function program_is_installed {
  local return_=1
  type $1 >/dev/null 2>&1 || { local return_=0; }
  echo "$return_"
}

# Update the system
sudo dnf update -y

# Install required dependencies
sudo dnf install -y ruby wget unzip git

# Install AWS CodeDeploy agent
cd /home/ec2-user
wget https://aws-codedeploy-ap-south-1.s3.ap-south-1.amazonaws.com/latest/install
sudo chmod +x ./install
sudo ./install auto

# Check if Node.js is installed. If not, install it
if [ $(program_is_installed node) == 0 ]; then
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
  export NVM_DIR="$HOME/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
  nvm install 20
fi

# Check if Docker is installed. If not, install and start it
if [ $(program_is_installed docker) == 0 ]; then
  sudo dnf install -y docker
  sudo systemctl enable docker
  sudo systemctl start docker
  sudo usermod -aG docker ec2-user
  sudo docker run --name chatapp-redis -p 6379:6379 --restart always --detach redis
fi

# Check if pm2 is installed. If not, install it
if [ $(program_is_installed pm2) == 0 ]; then
  npm install -g pm2
fi

# Clone and set up the chatty-backend repository
cd /home/ec2-user
if [ ! -d "chatty-backend" ]; then
  git clone -b develop https://github.com/Armaankhaan01/chatty-backend.git
fi
cd chatty-backend

# Ensure proper permissions for the directory
sudo chown -R ec2-user:ec2-user /home/ec2-user/chatty-backend

# Install dependencies and sync environment files
npm install
aws s3 sync s3://chatapp-env-files-ark/backend/develop .
unzip -o env-file.zip
cp -f .env.develop .env

# Build and start the application
npm run build || echo "Build failed. Please check logs."
npm run start || echo "Start failed. Please check logs."

# Ensure pm2 restarts the app on system reboot
pm2 startup
pm2 save
