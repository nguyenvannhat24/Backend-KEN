# Sử dụng Node.js 18
FROM node:18

# Đặt thư mục làm việc
WORKDIR /app

# Copy package.json trước (để cache npm install)
COPY package*.json ./

# Cài đặt dependencies
RUN npm install --include=dev

# Copy toàn bộ mã nguồn vào container
COPY . .

# Expose port app
EXPOSE 3005

# Lệnh mặc định để chạy test
CMD ["npm", "run", "test"]
