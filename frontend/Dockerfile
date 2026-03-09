# Stage 1: Build with Node
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package.json và package-lock.json (nếu có)
COPY package*.json ./

# Cài đặt dependencies
RUN npm install

# Copy toàn bộ mã nguồn frontend
COPY . .

# Build dự án (Vite/React)
RUN npm run build

# Stage 2: Serve bằng Nginx
FROM nginx:alpine

# Copy file từ quá trình build (thư mục dist của Vite) vào thư mục web server của Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy Nginx config tùy chỉnh dành cho SPA (chống lỗi 404 khi tải lại trang)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Port phục vụ bên trong container
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
