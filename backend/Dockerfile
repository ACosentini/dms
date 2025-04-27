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

# Add health check
HEALTHCHECK --interval=30s --timeout=3s CMD curl -f http://localhost:${PORT:-8080}/actuator/health || exit 1

# Use exec form of ENTRYPOINT for proper signal handling
# Pass in the PORT environment variable to the Java application
ENTRYPOINT ["sh", "-c", "java -jar app.jar --server.port=${PORT:-8080}"] 