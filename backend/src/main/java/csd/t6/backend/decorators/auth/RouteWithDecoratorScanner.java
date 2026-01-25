package csd.t6.backend.decorators.auth;

import java.lang.annotation.Annotation;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

import org.springframework.context.ApplicationContext;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;

public class RouteWithDecoratorScanner {
  private final ApplicationContext applicationContext;
  private final Class<? extends Annotation> decorator;

  public RouteWithDecoratorScanner(ApplicationContext applicationContext, Class<? extends Annotation> decorator) {
    this.applicationContext = applicationContext;
    this.decorator = decorator;
  }

  protected List<String> scanRoutes() {
    List<String> routes = new ArrayList<>();

    // Get all controllers
    Set<String> controllerBeans = applicationContext
        .getBeansWithAnnotation(org.springframework.web.bind.annotation.RestController.class).keySet();

    for (String beanName : controllerBeans) {
      Object controller = applicationContext.getBean(beanName);
      Class<?> controllerClass = controller.getClass();

      // Get class-level @RequestMapping
      String classPath = getClassPath(controllerClass);

      // Scan all methods
      for (Method method : controllerClass.getDeclaredMethods()) {
        if (method.isAnnotationPresent(decorator)) {
          String methodPath = getMethodRoute(method);
          if (methodPath != null) {
            String fullPath = classPath + methodPath;
            routes.add(fullPath);
            // Also add wildcard version for paths with path variables
            if (fullPath.contains("{") && !fullPath.endsWith("/**")) {
              routes.add(fullPath + "/**");
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

  private String getMethodRoute(Method method) {
    List<Class<? extends Annotation>> mappingAnnotations = List.of(GetMapping.class, PostMapping.class,
        PutMapping.class, DeleteMapping.class, PatchMapping.class, RequestMapping.class);

    for (Class<? extends Annotation> annotationClass : mappingAnnotations) {
      if (method.isAnnotationPresent(annotationClass)) {
        Annotation annotation = method.getAnnotation(annotationClass);
        try {
          String[] value = (String[]) annotation.annotationType().getMethod("value").invoke(annotation);
          return value.length > 0 ? value[0] : "";
        } catch (Exception e) {
          return null;
        }
      }
    }
    return null;
  }
}
