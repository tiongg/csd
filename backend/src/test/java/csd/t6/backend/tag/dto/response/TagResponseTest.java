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

class TagResponseTest {

    private Validator validator;

    @BeforeEach
    void setUp() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @Test
    @DisplayName("Should create valid tag response")
    void shouldCreateValidTagResponse() {
        UUID id = UUID.randomUUID();
        TagResponse response = new TagResponse(id, "Java");

        assertThat(response.id()).isEqualTo(id);
        assertThat(response.title()).isEqualTo("Java");
    }

    @Test
    @DisplayName("Should validate required fields")
    void shouldValidateRequiredFields() {
        TagResponse response = new TagResponse(null, null);

        Set<ConstraintViolation<TagResponse>> violations = validator.validate(response);

        assertThat(violations).hasSize(2);
        assertThat(violations).anyMatch(v -> v.getPropertyPath().toString().equals("id"));
        assertThat(violations).anyMatch(v -> v.getPropertyPath().toString().equals("title"));
    }

    @Test
    @DisplayName("Should validate null id")
    void shouldValidateNullId() {
        TagResponse response = new TagResponse(null, "Java");

        Set<ConstraintViolation<TagResponse>> violations = validator.validate(response);

        assertThat(violations).isNotEmpty();
        assertThat(violations).anyMatch(v -> v.getPropertyPath().toString().equals("id"));
    }

    @Test
    @DisplayName("Should validate null title")
    void shouldValidateNullTitle() {
        TagResponse response = new TagResponse(UUID.randomUUID(), null);

        Set<ConstraintViolation<TagResponse>> violations = validator.validate(response);

        assertThat(violations).isNotEmpty();
        assertThat(violations).anyMatch(v -> v.getPropertyPath().toString().equals("title"));
    }

    @Test
    @DisplayName("Should handle special characters in title")
    void shouldHandleSpecialCharactersInTitle() {
        UUID id = UUID.randomUUID();
        TagResponse response = new TagResponse(id, "C# & Java");

        Set<ConstraintViolation<TagResponse>> violations = validator.validate(response);

        assertThat(violations).isEmpty();
        assertThat(response.title()).isEqualTo("C# & Java");
    }

    @Test
    @DisplayName("Should handle long titles")
    void shouldHandleLongTitles() {
        UUID id = UUID.randomUUID();
        String longTitle = "This is a very long tag title that contains many words and should still be handled properly by the validation system.";
        TagResponse response = new TagResponse(id, longTitle);

        Set<ConstraintViolation<TagResponse>> violations = validator.validate(response);

        assertThat(violations).isEmpty();
        assertThat(response.title()).hasSizeGreaterThan(50);
    }

    @Test
    @DisplayName("Should handle empty title")
    void shouldHandleEmptyTitle() {
        UUID id = UUID.randomUUID();
        TagResponse response = new TagResponse(id, "");

        Set<ConstraintViolation<TagResponse>> violations = validator.validate(response);

        assertThat(violations).isEmpty(); // Empty strings are typically allowed
        assertThat(response.title()).isEmpty();
    }

    @Test
    @DisplayName("Should handle unicode characters")
    void shouldHandleUnicodeCharacters() {
        UUID id = UUID.randomUUID();
        TagResponse response = new TagResponse(id, "Java 编程");

        Set<ConstraintViolation<TagResponse>> violations = validator.validate(response);

        assertThat(violations).isEmpty();
        assertThat(response.title()).isEqualTo("Java 编程");
    }

    @Test
    @DisplayName("Should handle whitespace in title")
    void shouldHandleWhitespaceInTitle() {
        UUID id = UUID.randomUUID();
        TagResponse response = new TagResponse(id, "   Java Programming   ");

        Set<ConstraintViolation<TagResponse>> violations = validator.validate(response);

        assertThat(violations).isEmpty();
        assertThat(response.title()).isEqualTo("   Java Programming   ");
    }
}
