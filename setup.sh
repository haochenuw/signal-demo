#!bin/bash
# assume git is installed
# assume node is installed. checking node version
NODE_VERSION=$(node -v) # get the current version of Node.js

if [[ $NODE_VERSION =~ ^v16\. ]]; then
  echo "Node version is 16.x.x, continuing..."
else
  echo "Node version is not 16.x.x, exiting..."
  exit 1
fi

git clone https://github.com/haochenuw/libsignal-typescript-fork.git
cd libsignal-typescript-fork
npm i
npm link
# setup the demo repo.
cd ..
npm i
npm link @privacyresearch/libsignal-protocol-typescript

# Install pm2 globally
npm install -g pm2

# Start the project using pm2
cd /path/to/project
pm2 start npm --name "my-app" -- start
