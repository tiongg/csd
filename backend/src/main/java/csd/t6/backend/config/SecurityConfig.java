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
import csd.t6.backend.auth.oauth.OAuth2SuccessHandler;
import csd.t6.backend.decorators.auth.PublicEndpointScanner;
import csd.t6.backend.decorators.auth.RouteInfo;
import jakarta.servlet.http.HttpServletResponse;

@Configuration
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {
  private final JwtAuthenticationFilter jwtAuthenticationFilter;
  private final PublicEndpointScanner publicEndpointScanner;
  private final OAuth2SuccessHandler oAuth2SuccessHandler;

  public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter, PublicEndpointScanner publicEndpointScanner,
      OAuth2SuccessHandler oAuth2SuccessHandler) {
    this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    this.publicEndpointScanner = publicEndpointScanner;
    this.oAuth2SuccessHandler = oAuth2SuccessHandler;
  }

  @Bean
  SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    // @formatter:off
    http
      .cors(Customizer.withDefaults()).csrf(csrf -> csrf.disable())
      .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
      .authorizeHttpRequests((requests) ->{
        for(RouteInfo route : publicEndpointScanner.getPublicRoutes()) {
          System.out.println("Permitting public route: " + route);
          if(route.httpMethod() != null) {
            requests.requestMatchers(route.httpMethod(), route.path()).permitAll();
          } else {
            requests.requestMatchers(route.path()).permitAll();
          }
        }

        // Default: secure all other endpoints
        requests.anyRequest().authenticated();
      })
      .oauth2Login(oauth2 -> oauth2.successHandler(oAuth2SuccessHandler))
      .exceptionHandling(exception -> exception
        .authenticationEntryPoint((req, res, authEx) -> {
            // Return 401 for API requests instead of redirecting
            res.sendError(HttpServletResponse.SC_UNAUTHORIZED, authEx.getMessage());
        })
      )
      .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
    // @formatter:on
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
