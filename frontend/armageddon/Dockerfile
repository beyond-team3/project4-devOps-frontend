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

# 위에서 만든 'build-stage'의 결과물을 가져옴.
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Nginx 설정 파일 복사
# (경로가 frontend/armageddon/nginx/default.conf 에 있어야 함)
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# 80번 포트 노출
EXPOSE 80

# Nginx 실행
CMD ["nginx", "-g", "daemon off;"]