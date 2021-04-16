FROM apify/actor-node-chrome

# Copy source code
COPY . ./

# Install default dependencies, print versions of everything
RUN npm --quiet set progress=false \
 && npm install --only=prod \
 && npm install apify-client --only=prod \
 && echo "Installed NPM packages:" \
 && npm list \
 && echo "Node.js version:" \
 && node --version \
 && echo "NPM version:" \
 && npm --version

RUN npm config set engine-strict true

ENV APIFY_DISABLE_OUTDATED_WARNING 1
