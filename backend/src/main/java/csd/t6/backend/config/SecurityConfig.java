package csd.t6.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import csd.t6.backend.auth.JwtAuthenticationFilter;
import csd.t6.backend.decorators.auth.PublicEndpointScanner;

@Configuration
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {
  private final JwtAuthenticationFilter jwtAuthenticationFilter;
  private final PublicEndpointScanner publicEndpointScanner;

  public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter, PublicEndpointScanner publicEndpointScanner) {
    this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    this.publicEndpointScanner = publicEndpointScanner;
  }

  @Bean
  SecurityFilterChain securityFilterChain(HttpSecurity http) {
    http
        .cors(Customizer.withDefaults())
        .csrf(csrf -> csrf.disable())
        .sessionManagement(session -> session
            .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests((requests) -> requests
            // Public endpoints (swagger + @PublicDecorator annotated methods)
            .requestMatchers(publicEndpointScanner.getPublicPaths()).permitAll()
            .anyRequest().authenticated())
        .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

    return http.build();
  }

  @Bean
  PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder(12);
  }

  @Bean
  AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
    return authConfig.getAuthenticationManager();
  }
}
