# Usa una imagen base de Node.js
FROM node:22.5.1

# Crea y establece el directorio de trabajo en el contenedor
WORKDIR /app


# Define los argumentos de construcción
ARG VITE_URL_SEGURIDAD
ARG VITE_IDAPP
ARG VITE_TIMEOUT_COOKIES
ARG VITE_TIMEOUT_SESSION
ARG TZ

# Establece las variables de entorno usando los argumentos de construcción
ENV VITE_URL_SEGURIDAD=$VITE_URL_SEGURIDAD
ENV VITE_IDAPP=$VITE_IDAPP
ENV VITE_TIMEOUT_COOKIES=$VITE_TIMEOUT_COOKIES
ENV VITE_TIMEOUT_SESSION=$VITE_TIMEOUT_SESSION
ENV TZ=$TZ

# Copia el package.json y package-lock.json
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Copia el resto del código de la aplicación
COPY . .

# Establece la variable de entorno para aumentar la memoria asignada a Node.js
ENV NODE_OPTIONS=--max_old_space_size=4096

# Construye la aplicación para producción
RUN npm run build

# Usa una imagen de servidor web para servir la aplicación
FROM nginx:alpine
COPY --from=0 /app/build /usr/share/nginx/html

# Expone el puerto en el que la aplicación correrá
EXPOSE 80

# Comando para correr la aplicación
CMD ["nginx", "-g", "daemon off;"]
