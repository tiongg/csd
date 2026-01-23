package csd.t6.backend.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

/**
 * Exception for HTTP 400 Bad Request errors.
 * 
 * @see HttpErrorPayload Error payload mapping for HTTP errors.
 */
public class BadRequestException extends ResponseStatusException {
  public BadRequestException(String message) {
    super(HttpStatus.BAD_REQUEST, message);
  }
}
