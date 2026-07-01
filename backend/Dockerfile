# Build stage
FROM maven:3.9.6-eclipse-temurin-21-jammy AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
# Build the application, skipping tests to speed up deployment
RUN mvn clean package -DskipTests

# Run stage
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
# Copy the built jar from the build stage
COPY --from=build /app/target/*.jar app.jar

# Expose port (Render sets PORT environment variable, defaulting to 8080)
ENV PORT=8080
EXPOSE $PORT

# Run the jar file
ENTRYPOINT ["sh", "-c", "java -Dserver.port=${PORT} -jar app.jar"]
