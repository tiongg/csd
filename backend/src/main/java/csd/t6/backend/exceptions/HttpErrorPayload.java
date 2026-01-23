package csd.t6.backend.exceptions;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

/**
 * Error payload mapping for HTTP errors.
 *
 * Created automatically by exception handlers.
 */
@Schema(name = "HttpErrorPayload")
public record HttpErrorPayload(
    @NotNull long timestamp,
    @NotNull int status,
    @NotNull String error,
    @NotNull String message,
    @NotNull String path) {
}
