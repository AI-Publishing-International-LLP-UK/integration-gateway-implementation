FROM nginx:alpine

# Set working directory
WORKDIR /usr/share/nginx/html

# Copy project files to nginx html directory
COPY . .

# Expose port 80
EXPOSE 80

# Command to run the nginx server
CMD ["nginx", "-g", "daemon off;"]

