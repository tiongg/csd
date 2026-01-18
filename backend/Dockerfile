# Multi-stage build for production
# Stage 1: Build with Maven and JDK
FROM maven:3.9.9-eclipse-temurin-21 AS build

# Build arguments for JOOQ codegen (passed from CI/CD)
ARG JOOQ_JDBC_URL
ARG JOOQ_JDBC_USER=postgres
ARG JOOQ_JDBC_PASSWORD

WORKDIR /usr/src/app

# Copy pom.xml and download dependencies (cached layer)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code
COPY src ./src

# Run JOOQ codegen and build the application
# Code generation requires database connection
RUN mvn clean package -DskipTests -B \
    -Djooq.jdbc.url="$JOOQ_JDBC_URL" \
    -Djooq.jdbc.user="$JOOQ_JDBC_USER" \
    -Djooq.jdbc.password="$JOOQ_JDBC_PASSWORD"

# Stage 2: Runtime with JRE only (smaller image)
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Copy the built JAR from build stage
# The JAR is created in target/ with .jar.original being the thin JAR
COPY --from=build /usr/src/app/target/*.jar app.jar

# Create a non-root user for running the application
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# Expose the application port
EXPOSE 8080

# Environment variables for production
ENV SPRING_PROFILES_ACTIVE=prod \
    JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0"

# Run the application
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
