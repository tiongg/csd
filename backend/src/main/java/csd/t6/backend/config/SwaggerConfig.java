package csd.t6.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;

@Configuration
public class SwaggerConfig {
  @Bean
  OpenAPI swaggerConfigerer() {
    return new OpenAPI()
        .info(new Info().title("API Documentation")
            .description("API documentation for development environments")
            .version("1.0"));
  }
}