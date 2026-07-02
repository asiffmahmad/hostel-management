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

# Create a non-root user and group
RUN addgroup --system --gid 1001 appgroup && adduser --system --uid 1001 --ingroup appgroup appuser
# Change ownership of the app.jar to the non-root user
RUN chown appuser:appgroup app.jar

# Switch to the non-root user
USER appuser

# Expose port (Render sets PORT environment variable, defaulting to 8080)
ENV PORT=8080
EXPOSE $PORT

# Run the jar file
ENTRYPOINT ["sh", "-c", "java -Dserver.port=${PORT} -jar app.jar"]
