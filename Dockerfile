FROM alpine:latest

# Versión alineada con la dependencia de package.json
ARG PB_VERSION=0.26.9

RUN apk add --no-cache \
    unzip \
    ca-certificates \
    curl

# Descargar e instalar PocketBase
ADD https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_amd64.zip /tmp/pb.zip
RUN unzip /tmp/pb.zip -d /pb/ && \
    rm /tmp/pb.zip

# Exponer el puerto por defecto de PocketBase
EXPOSE 8080

# Levantar el servidor
CMD ["/pb/pocketbase", "serve", "--http=0.0.0.0:8080"]
