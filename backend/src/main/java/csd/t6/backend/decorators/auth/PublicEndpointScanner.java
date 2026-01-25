package csd.t6.backend.decorators.auth;

import java.util.ArrayList;
import java.util.List;

import org.springframework.context.ApplicationContext;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;

@Component
public class PublicEndpointScanner extends RouteWithDecoratorScanner {
  // @formatter:off
  private List<RouteInfo> publicPaths = List.of(
      new RouteInfo("/v3/api-docs.yaml", HttpMethod.GET),
      new RouteInfo("/v3/api-docs/**", HttpMethod.GET),
      new RouteInfo("/swagger-ui/**", HttpMethod.GET),
      new RouteInfo("/swagger-ui.html", HttpMethod.GET),
      new RouteInfo("/oauth2/**", null),
      new RouteInfo("/login/oauth2/**", null)
  );
  // @formatter:on

  public PublicEndpointScanner(ApplicationContext applicationContext) {
    super(applicationContext, PublicDecorator.class);
  }

  public RouteInfo[] getPublicRoutes() {
    List<RouteInfo> paths = new ArrayList<>(publicPaths);
    paths.addAll(this.scanRoutes());
    return paths.toArray(RouteInfo[]::new);
  }
}
