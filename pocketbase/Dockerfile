FROM alpine:3.18

ARG PB_VERSION=0.28.2
RUN apk add --no-cache ca-certificates unzip wget

RUN wget -O /usr/local/bin/pocketbase.zip \
      https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_amd64.zip \
  && unzip /usr/local/bin/pocketbase.zip -d /usr/local/bin \
  && rm /usr/local/bin/pocketbase.zip \
  && chmod +x /usr/local/bin/pocketbase

WORKDIR /app/pocketbase

EXPOSE 8090

ENTRYPOINT ["pocketbase"]
CMD ["serve", "--http=0.0.0.0:8090"]