# develop stage

FROM node:20.11-bullseye as node-stage
WORKDIR /app
COPY . .
RUN npm install

RUN npm run build

FROM nginx:1.25.4-bookworm as nginx-mod-stage
RUN apt-get update && apt-get install cmake gcc wget git libpcre3-dev zlib1g-dev -y
RUN wget "http://nginx.org/download/nginx-${NGINX_VERSION}.tar.gz" -O nginx.tar.gz && tar -zxC /usr/src -f nginx.tar.gz
RUN git clone --recurse-submodules -j8 https://github.com/google/ngx_brotli
RUN cd ngx_brotli/deps/brotli && \
    mkdir out && \
    cd out && \
    cmake -DCMAKE_BUILD_TYPE=Release -DBUILD_SHARED_LIBS=OFF \
        -DCMAKE_C_FLAGS="-Ofast -m64 -march=native -mtune=native -flto -funroll-loops -ffunction-sections -fdata-sections -Wl,--gc-sections" \
        -DCMAKE_CXX_FLAGS="-Ofast -m64 -march=native -mtune=native -flto -funroll-loops -ffunction-sections -fdata-sections -Wl,--gc-sections" \
        -DCMAKE_INSTALL_PREFIX=./installed .. && \
    cmake --build . --config Release --target brotlienc
RUN CONFARGS=$(nginx -V 2>&1 | sed -n -e 's/^.*arguments: //p') cd /usr/src/nginx-$NGINX_VERSION && \
  ./configure --with-compat $CONFARGS --add-dynamic-module=/ngx_brotli && \
  make && make install

# production stage
FROM nginx:1.25.4-alpine
COPY --from=nginx-mod-stage /usr/local/nginx/modules/ngx_http_brotli_filter_module.so /etc/nginx/modules/ngx_http_brotli_filter_module.so
COPY --from=nginx-mod-stage /usr/local/nginx/modules/ngx_http_brotli_static_module.so /etc/nginx/modules/ngx_http_brotli_static_module.so
COPY --from=node-stage /app/dist /usr/share/nginx/html
COPY --from=node-stage /app/nginx.conf /etc/nginx/conf.d/default.conf
RUN (echo "load_module modules/ngx_http_brotli_filter_module.so; "; cat /etc/nginx/nginx.conf) > /tmp/nginx.conf && mv /tmp/nginx.conf /etc/nginx/nginx.conf
RUN (echo "load_module modules/ngx_http_brotli_static_module.so; "; cat /etc/nginx/nginx.conf) > /tmp/nginx.conf && mv /tmp/nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]