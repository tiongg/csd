package csd.t6.backend.decorators.auth;

import java.lang.annotation.Annotation;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

import org.springframework.context.ApplicationContext;
import org.springframework.http.HttpMethod;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

record MappingAnnotation(Class<? extends Annotation> annotationClass, HttpMethod httpMethod) {}

public class RouteWithDecoratorScanner {
  private final ApplicationContext applicationContext;
  private final Class<? extends Annotation> decorator;

  public RouteWithDecoratorScanner(ApplicationContext applicationContext, Class<? extends Annotation> decorator) {
    this.applicationContext = applicationContext;
    this.decorator = decorator;
  }

  protected List<RouteInfo> scanRoutes() {
    List<RouteInfo> routes = new ArrayList<>();

    // Get all controllers
    Set<String> controllerBeans = applicationContext.getBeansWithAnnotation(RestController.class).keySet();

    for (String beanName : controllerBeans) {
      Object controller = applicationContext.getBean(beanName);
      Class<?> controllerClass = controller.getClass();

      // Get class-level @RequestMapping
      String classPath = getClassPath(controllerClass);

      // Scan all methods
      for (Method method : controllerClass.getDeclaredMethods()) {
        if (method.isAnnotationPresent(decorator)) {
          RouteInfo route = getRouteInfo(method);
          if (route != null) {
            String fullPath = classPath + route.path();
            routes.add(new RouteInfo(fullPath, route.httpMethod()));
            // Also add wildcard version for paths with path variables
            if (fullPath.contains("{") && !fullPath.endsWith("/**")) {
              routes.add(new RouteInfo(fullPath + "/**", route.httpMethod()));
            }
          }
        }
      }
    }

    return routes;
  }

  private String getClassPath(Class<?> clazz) {
    RequestMapping requestMapping = clazz.getAnnotation(RequestMapping.class);
    if (requestMapping != null && requestMapping.value().length > 0) {
      return requestMapping.value()[0];
    }
    return "";
  }

  private RouteInfo getRouteInfo(Method method) {
    // @formatter:off
    List<MappingAnnotation> mappingAnnotations = List.of(
      new MappingAnnotation(GetMapping.class, HttpMethod.GET) ,
      new MappingAnnotation(PostMapping.class, HttpMethod.POST) ,
      new MappingAnnotation(PutMapping.class, HttpMethod.PUT) ,
      new MappingAnnotation(DeleteMapping.class, HttpMethod.DELETE) ,
      new MappingAnnotation(PatchMapping.class, HttpMethod.PATCH) ,
      new MappingAnnotation(RequestMapping.class, null) 
    );
    // @formatter:on

    for (MappingAnnotation mappingAnnotation : mappingAnnotations) {
      if (method.isAnnotationPresent(mappingAnnotation.annotationClass())) {
        Annotation annotation = method.getAnnotation(mappingAnnotation.annotationClass());
        try {
          String[] value = (String[]) annotation.annotationType().getMethod("value").invoke(annotation);
          return value.length > 0 ? new RouteInfo(value[0], mappingAnnotation.httpMethod()) : null;
        } catch (Exception e) {
          return null;
        }
      }
    }
    return null;
  }
}
