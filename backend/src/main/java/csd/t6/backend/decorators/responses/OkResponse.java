package csd.t6.backend.decorators.responses;

import java.lang.annotation.ElementType;
import java.lang.annotation.Inherited;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

import io.swagger.v3.oas.annotations.responses.ApiResponse;

/**
 * Annotation to indicate that a method or class returns a 200 OK response.
 * 
 * Unnecessary most of the time since 200 OK is the default, but can be used for
 * clarity.
 */
@Target({ ElementType.METHOD, ElementType.TYPE })
@Retention(RetentionPolicy.RUNTIME)
@Inherited
@ResponseStatus(code = HttpStatus.OK)
@ApiResponse(responseCode = "200", description = "OK")
public @interface OkResponse {
}
