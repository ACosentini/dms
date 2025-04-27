FROM eclipse-temurin:17-jdk AS build
WORKDIR /app

# Install Maven
RUN apt-get update && \
    apt-get install -y maven && \
    apt-get clean

COPY pom.xml .
RUN mvn dependency:go-offline
COPY src/ /app/src/
RUN mvn package -DskipTests

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

# Expose both 8080 and 10000 (Render's default)
EXPOSE 8080
EXPOSE 10000

# Add health check - use PORT env var with default to 10000 (Render's default)
HEALTHCHECK --interval=30s --timeout=3s CMD curl -f http://localhost:${PORT:-10000}/api/actuator/health || exit 1

# Create a script to properly handle environment variables and signals
RUN echo '#!/bin/sh\n\
exec java -jar app.jar --server.port=${PORT:-10000}' > /app/run.sh && \
chmod +x /app/run.sh

# Use the script as entrypoint for proper signal handling
ENTRYPOINT ["/app/run.sh"] 