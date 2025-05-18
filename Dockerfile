FROM docker.io/node:latest as web_builder
WORKDIR /app
COPY . .

RUN yarn install
RUN yarn build

FROM docker.io/golang:alpine as go_builder

WORKDIR /app
COPY . .

RUN go mod download
RUN go build -o pocketbase .

FROM docker.io/alpine:latest

WORKDIR /app
COPY --from=go_builder /app/pocketbase .
COPY --from=go_builder /app/pb_migrations ./pb_migrations
COPY --from=web_builder /app/dist ./pb_public

EXPOSE 8090

ENTRYPOINT ["/app/pocketbase", "serve", "--http", "0.0.0.0:8090"]