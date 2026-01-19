# Build 단계
FROM node:22-alpine AS builder

WORKDIR /app

# 패키지 정보 복사 및 설치
COPY package*.json ./
RUN npm install

# 소스 코드 복사 및 빌드
COPY . .
RUN npm run build

# Run 단계 (Nginx로 빌드된 파일 배포)
FROM nginx:alpine

# Nginx 설정 파일이 있다면 복사 (없으면 기본값 사용)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# 빌드 단계에서 만든 결과물(dist 폴더)을 Nginx가 서비스할 경로로 복사
COPY --from=builder /app/dist /usr/share/nginx/html

# 80번 포트 노출
EXPOSE 80

# Nginx 실행
CMD ["nginx", "-g", "daemon off;"]