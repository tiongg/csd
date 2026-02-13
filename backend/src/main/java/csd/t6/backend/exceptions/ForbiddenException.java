package csd.t6.backend.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

/**
 * Exception for HTTP 403 Forbidden errors.
 */
public class ForbiddenException extends ResponseStatusException {
  public ForbiddenException(String message) {
    super(HttpStatus.FORBIDDEN, message);
  }
}