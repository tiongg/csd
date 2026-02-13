package csd.t6.backend.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

/**
 * Exception for HTTP 401 Unauthorized errors.
 */
public class UnauthorizedException extends ResponseStatusException {
  public UnauthorizedException(String message) {
    super(HttpStatus.UNAUTHORIZED, message);
  }
}