package csd.t6.backend.exceptions;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

class ExceptionTests {

    // --- BadRequestException ---

    @Test
    @DisplayName("BadRequestException should have HTTP 400 status")
    void badRequestException_shouldHave400Status() {
        BadRequestException ex = new BadRequestException("bad input");
        assertThat(ex.getStatusCode().value()).isEqualTo(400);
        assertThat(ex.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    @DisplayName("BadRequestException should preserve message")
    void badRequestException_shouldPreserveMessage() {
        BadRequestException ex = new BadRequestException("invalid field");
        assertThat(ex.getReason()).isEqualTo("invalid field");
    }

    @Test
    @DisplayName("BadRequestException should be throwable and catchable")
    void badRequestException_shouldBeThrowable() {
        assertThatThrownBy(() -> { throw new BadRequestException("oops"); })
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("oops");
    }

    @Test
    @DisplayName("BadRequestException with empty message")
    void badRequestException_emptyMessage() {
        BadRequestException ex = new BadRequestException("");
        assertThat(ex.getStatusCode().value()).isEqualTo(400);
    }

    // --- ForbiddenException ---

    @Test
    @DisplayName("ForbiddenException should have HTTP 403 status")
    void forbiddenException_shouldHave403Status() {
        ForbiddenException ex = new ForbiddenException("not allowed");
        assertThat(ex.getStatusCode().value()).isEqualTo(403);
        assertThat(ex.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
    }

    @Test
    @DisplayName("ForbiddenException should preserve message")
    void forbiddenException_shouldPreserveMessage() {
        ForbiddenException ex = new ForbiddenException("access denied");
        assertThat(ex.getReason()).isEqualTo("access denied");
    }

    @Test
    @DisplayName("ForbiddenException should be throwable and catchable")
    void forbiddenException_shouldBeThrowable() {
        assertThatThrownBy(() -> { throw new ForbiddenException("forbidden"); })
                .isInstanceOf(ForbiddenException.class)
                .hasMessageContaining("forbidden");
    }

    // --- UnauthorizedException ---

    @Test
    @DisplayName("UnauthorizedException should have HTTP 401 status")
    void unauthorizedException_shouldHave401Status() {
        UnauthorizedException ex = new UnauthorizedException("please login");
        assertThat(ex.getStatusCode().value()).isEqualTo(401);
        assertThat(ex.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    @DisplayName("UnauthorizedException should preserve message")
    void unauthorizedException_shouldPreserveMessage() {
        UnauthorizedException ex = new UnauthorizedException("token expired");
        assertThat(ex.getReason()).isEqualTo("token expired");
    }

    @Test
    @DisplayName("UnauthorizedException should be throwable and catchable")
    void unauthorizedException_shouldBeThrowable() {
        assertThatThrownBy(() -> { throw new UnauthorizedException("unauthorized"); })
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("unauthorized");
    }

    // --- HttpErrorPayload ---

    @Test
    @DisplayName("HttpErrorPayload should store all fields correctly")
    void httpErrorPayload_shouldStoreAllFields() {
        long ts = System.currentTimeMillis();
        HttpErrorPayload payload = new HttpErrorPayload(ts, 400, "Bad Request", "invalid input", "/api/test");

        assertThat(payload.timestamp()).isEqualTo(ts);
        assertThat(payload.status()).isEqualTo(400);
        assertThat(payload.error()).isEqualTo("Bad Request");
        assertThat(payload.message()).isEqualTo("invalid input");
        assertThat(payload.path()).isEqualTo("/api/test");
    }

    @Test
    @DisplayName("HttpErrorPayload equality via record semantics")
    void httpErrorPayload_recordEquality() {
        HttpErrorPayload p1 = new HttpErrorPayload(1000L, 404, "Not Found", "missing", "/api/x");
        HttpErrorPayload p2 = new HttpErrorPayload(1000L, 404, "Not Found", "missing", "/api/x");

        assertThat(p1).isEqualTo(p2);
        assertThat(p1.hashCode()).isEqualTo(p2.hashCode());
    }

    @Test
    @DisplayName("HttpErrorPayload toString contains field values")
    void httpErrorPayload_toStringContainsValues() {
        HttpErrorPayload payload = new HttpErrorPayload(999L, 500, "Internal Server Error", "crash", "/api/boom");
        String str = payload.toString();

        assertThat(str).contains("500");
        assertThat(str).contains("crash");
    }

    @Test
    @DisplayName("HttpErrorPayload for 403 scenario")
    void httpErrorPayload_403Scenario() {
        HttpErrorPayload payload = new HttpErrorPayload(0L, 403, "Forbidden", "access denied", "/api/admin");

        assertThat(payload.status()).isEqualTo(403);
        assertThat(payload.error()).isEqualTo("Forbidden");
        assertThat(payload.message()).isEqualTo("access denied");
    }

    @Test
    @DisplayName("HttpErrorPayload for 401 scenario")
    void httpErrorPayload_401Scenario() {
        HttpErrorPayload payload = new HttpErrorPayload(12345L, 401, "Unauthorized", "token missing", "/api/secure");

        assertThat(payload.status()).isEqualTo(401);
        assertThat(payload.path()).isEqualTo("/api/secure");
    }

    // --- Cross-exception type checks ---

    @Test
    @DisplayName("Exception types should be distinct")
    void exceptionTypes_shouldBeDistinct() {
        BadRequestException bad = new BadRequestException("x");
        ForbiddenException forbidden = new ForbiddenException("x");
        UnauthorizedException unauthorized = new UnauthorizedException("x");

        assertThat(bad).isNotInstanceOf(ForbiddenException.class);
        assertThat(forbidden).isNotInstanceOf(BadRequestException.class);
        assertThat(unauthorized).isNotInstanceOf(ForbiddenException.class);
    }

    @Test
    @DisplayName("All exceptions extend ResponseStatusException")
    void allExceptions_extendResponseStatusException() {
        assertThat(new BadRequestException("x"))
                .isInstanceOf(org.springframework.web.server.ResponseStatusException.class);
        assertThat(new ForbiddenException("x"))
                .isInstanceOf(org.springframework.web.server.ResponseStatusException.class);
        assertThat(new UnauthorizedException("x"))
                .isInstanceOf(org.springframework.web.server.ResponseStatusException.class);
    }
}