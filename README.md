To Dockerize the Application, run the following command:

1) Build Local Image inside the project directory terminal:
    docker build -t your-dockerhub-username/node-logs-app .

2) Push the Docker Image to Docker Hub
    docker login
    docker push your-dockerhub-username/node-logs-app

3) Run Docker Container
   docker run -p 3000:3000 -d your-dockerhub-username/node-logs-app
