# Etapa 1: Build de la aplicación
FROM node:18-alpine AS build
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY public/ /app/public/
COPY src/ /app/src/
COPY .gitignore /app/.gitignore
COPY README.md /app/README.md
COPY components.json /app/components.json
COPY eslint.config.js /app/eslint.config.js
COPY index.html /app/index.html
COPY tsconfig.app.json /app/tsconfig.app.json
COPY tsconfig.json /app/tsconfig.json
COPY tsconfig.node.json /app/tsconfig.node.json
COPY vite.config.ts /app/vite.config.ts

RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
