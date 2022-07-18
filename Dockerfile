FROM nginx
COPY ./release/app/dist/renderer/ /usr/share/nginx/html
