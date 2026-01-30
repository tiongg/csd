package csd.t6.backend.decorators.auth;

import java.util.ArrayList;
import java.util.List;

import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Component;

@Component
public class PublicEndpointScanner extends RouteWithDecoratorScanner {
  private List<String> publicPaths = List.of(
      "/v3/api-docs.yaml",
      "/v3/api-docs/**",
      "/swagger-ui/**",
      "/swagger-ui.html");

  public PublicEndpointScanner(ApplicationContext applicationContext) {
    super(applicationContext, PublicDecorator.class);
  }

  public String[] getPublicPaths() {
    List<String> paths = new ArrayList<>(publicPaths);
    paths.addAll(this.scanRoutes());
    return paths.toArray(String[]::new);
  }
}
