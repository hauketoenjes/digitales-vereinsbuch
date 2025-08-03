FROM oven/bun:alpine AS builder
ARG PB_VERSION=0.28.2

# Install dependencies
RUN apk add --no-cache ca-certificates unzip wget

# Download and extract PocketBase
RUN wget -O /usr/local/bin/pocketbase.zip \
  https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_amd64.zip \
  && unzip /usr/local/bin/pocketbase.zip -d /usr/local/bin \
  && rm /usr/local/bin/pocketbase.zip \
  && chmod +x /usr/local/bin/pocketbase

WORKDIR /app/pocketbase
COPY ./pocketbase/package.json /app/pocketbase/package.json
COPY ./pocketbase/bun.lock /app/pocketbase/bun.lock

# Install dependencies
RUN bun install --frozen-lockfile --production

FROM gcr.io/distroless/static-debian12:latest

WORKDIR /app/pocketbase
COPY --from=builder /usr/local/bin/pocketbase .
COPY --from=builder /app/pocketbase/node_modules ./node_modules

EXPOSE 8090

ENTRYPOINT ["./pocketbase"]
CMD ["serve", "--http=0.0.0.0:8090"]