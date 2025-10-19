# Build an Nginx-based image that runs consul-template to render nginx config from nginx.ctmpl
# and start Nginx using the rendered config.

FROM nginx:1.25-alpine

# consul-template version
ARG CT_VERSION=0.37.4

# Install required packages and consul-template
RUN apk add --no-cache curl unzip bash ca-certificates \
 && update-ca-certificates \
 && curl -fsSL -o /tmp/consul-template.zip "https://releases.hashicorp.com/consul-template/${CT_VERSION}/consul-template_${CT_VERSION}_linux_amd64.zip" \
 && unzip /tmp/consul-template.zip -d /usr/local/bin \
 && rm -f /tmp/consul-template.zip \
 && chmod +x /usr/local/bin/consul-template

# Create directory for templates
RUN mkdir -p /etc/nginx/templates

# Copy the nginx consul-template template
COPY nginx.ctmpl /etc/nginx/templates/nginx.ctmpl

# Copy entrypoint that wires consul-template + nginx
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 8000

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
