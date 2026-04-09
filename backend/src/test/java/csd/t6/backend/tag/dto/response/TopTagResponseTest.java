package csd.t6.backend.tag.dto.response;

import static org.assertj.core.api.Assertions.assertThat;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import java.util.Set;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class TopTagResponseTest {

    private Validator validator;

    @BeforeEach
    void setUp() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @Test
    @DisplayName("Should create valid top tag response")
    void shouldCreateValidTopTagResponse() {
        UUID id = UUID.randomUUID();
        TopTagResponse response = new TopTagResponse(id, "Java", 100);

        assertThat(response.id()).isEqualTo(id);
        assertThat(response.title()).isEqualTo("Java");
        assertThat(response.usageCount()).isEqualTo(100);
    }

    @Test
    @DisplayName("Should validate required fields")
    void shouldValidateRequiredFields() {
        TopTagResponse response = new TopTagResponse(null, null, null);

        Set<ConstraintViolation<TopTagResponse>> violations = validator.validate(response);

        assertThat(violations).hasSize(3);
        assertThat(violations).anyMatch(v -> v.getPropertyPath().toString().equals("id"));
        assertThat(violations).anyMatch(v -> v.getPropertyPath().toString().equals("title"));
        assertThat(violations).anyMatch(v -> v.getPropertyPath().toString().equals("usageCount"));
    }

    @Test
    @DisplayName("Should validate null id")
    void shouldValidateNullId() {
        TopTagResponse response = new TopTagResponse(null, "Java", 50);

        Set<ConstraintViolation<TopTagResponse>> violations = validator.validate(response);

        assertThat(violations).isNotEmpty();
        assertThat(violations).anyMatch(v -> v.getPropertyPath().toString().equals("id"));
    }

    @Test
    @DisplayName("Should validate null title")
    void shouldValidateNullTitle() {
        TopTagResponse response = new TopTagResponse(UUID.randomUUID(), null, 50);

        Set<ConstraintViolation<TopTagResponse>> violations = validator.validate(response);

        assertThat(violations).isNotEmpty();
        assertThat(violations).anyMatch(v -> v.getPropertyPath().toString().equals("title"));
    }

    @Test
    @DisplayName("Should validate null usage count")
    void shouldValidateNullUsageCount() {
        TopTagResponse response = new TopTagResponse(UUID.randomUUID(), "Java", null);

        Set<ConstraintViolation<TopTagResponse>> violations = validator.validate(response);

        assertThat(violations).isNotEmpty();
        assertThat(violations).anyMatch(v -> v.getPropertyPath().toString().equals("usageCount"));
    }

    @Test
    @DisplayName("Should handle zero usage count")
    void shouldHandleZeroUsageCount() {
        UUID id = UUID.randomUUID();
        TopTagResponse response = new TopTagResponse(id, "Unused Tag", 0);

        Set<ConstraintViolation<TopTagResponse>> violations = validator.validate(response);

        assertThat(violations).isEmpty();
        assertThat(response.usageCount()).isEqualTo(0);
    }

    @Test
    @DisplayName("Should handle negative usage count")
    void shouldHandleNegativeUsageCount() {
        UUID id = UUID.randomUUID();
        TopTagResponse response = new TopTagResponse(id, "Tag", -5);

        Set<ConstraintViolation<TopTagResponse>> violations = validator.validate(response);

        assertThat(violations).isEmpty(); // Negative values might be allowed
        assertThat(response.usageCount()).isEqualTo(-5);
    }

    @Test
    @DisplayName("Should handle large usage counts")
    void shouldHandleLargeUsageCounts() {
        UUID id = UUID.randomUUID();
        TopTagResponse response = new TopTagResponse(id, "Popular Tag", 1000000);

        Set<ConstraintViolation<TopTagResponse>> violations = validator.validate(response);

        assertThat(violations).isEmpty();
        assertThat(response.usageCount()).isEqualTo(1000000);
    }

    @Test
    @DisplayName("Should handle maximum usage count")
    void shouldHandleMaximumUsageCount() {
        UUID id = UUID.randomUUID();
        TopTagResponse response = new TopTagResponse(id, "Max Tag", Integer.MAX_VALUE);

        Set<ConstraintViolation<TopTagResponse>> violations = validator.validate(response);

        assertThat(violations).isEmpty();
        assertThat(response.usageCount()).isEqualTo(Integer.MAX_VALUE);
    }

    @Test
    @DisplayName("Should handle minimum usage count")
    void shouldHandleMinimumUsageCount() {
        UUID id = UUID.randomUUID();
        TopTagResponse response = new TopTagResponse(id, "Min Tag", Integer.MIN_VALUE);

        Set<ConstraintViolation<TopTagResponse>> violations = validator.validate(response);

        assertThat(violations).isEmpty();
        assertThat(response.usageCount()).isEqualTo(Integer.MIN_VALUE);
    }
}
