# 빌드
FROM node:22-alpine AS build-stage

WORKDIR /app

# 패키지 정보 복사 및 설치
COPY package*.json ./
RUN npm install

# 소스 코드 복사 및 빌드
COPY . .
RUN npm run build

# 배포 (Production Stage)
FROM nginx:stable-alpine AS production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html

# 설정 파일 복사
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf

# 빌드할 때 파일 목록과 내용을 강제로 출력.
RUN echo "=== [DEBUG] Check Config File Content ===" && \
    ls -al /etc/nginx/conf.d/ && \
    cat /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]