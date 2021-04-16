FROM apify/actor-node-chrome

# Copy source code
COPY . ./

# Install default dependencies, print versions of everything
RUN npm --quiet set progress=false \
 && npm install --only=prod \
 && npm uninstall apify-client  \
 && npm install apify-client --only=prod \
 && echo "Installed NPM packages:" \
 && npm list \
 && echo "Node.js version:" \
 && node --version \
 && echo "NPM version:" \
 && npm --version

ENV APIFY_DISABLE_OUTDATED_WARNING 1
