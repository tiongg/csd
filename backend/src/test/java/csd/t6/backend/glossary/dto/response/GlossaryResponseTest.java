package csd.t6.backend.glossary.dto.response;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Set;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;

class GlossaryResponseTest {

    private Validator validator;

    @BeforeEach
    void setUp() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @Test
    @DisplayName("Should create valid glossary response")
    void shouldCreateValidGlossaryResponse() {
        String[] relationships = {
                "Related 1", "Related 2"
        };
        GlossaryResponse response = new GlossaryResponse("Test Term", "Test Description", "Test Context",
                "Test Example", "Category", relationships);

        assertThat(response.title()).isEqualTo("Test Term");
        assertThat(response.description()).isEqualTo("Test Description");
        assertThat(response.context()).isEqualTo("Test Context");
        assertThat(response.example()).isEqualTo("Test Example");
        assertThat(response.relationships()).hasSize(2);
        assertThat(response.relationships()).containsExactly("Related 1", "Related 2");
    }

    @Test
    @DisplayName("Should validate required fields")
    void shouldValidateRequiredFields() {
        GlossaryResponse response = new GlossaryResponse(null, null, null, null, null, null);

        Set<ConstraintViolation<GlossaryResponse>> violations = validator.validate(response);

        assertThat(violations).hasSize(5);
        assertThat(violations).anyMatch(v -> v.getPropertyPath().toString().equals("title"));
        assertThat(violations).anyMatch(v -> v.getPropertyPath().toString().equals("description"));
        assertThat(violations).anyMatch(v -> v.getPropertyPath().toString().equals("context"));
        assertThat(violations).anyMatch(v -> v.getPropertyPath().toString().equals("example"));
        assertThat(violations).anyMatch(v -> v.getPropertyPath().toString().equals("relationships"));
    }

    @Test
    @DisplayName("Should create response with empty relationships")
    void shouldCreateResponseWithEmptyRelationships() {
        String[] emptyRelationships = {};
        GlossaryResponse response = new GlossaryResponse("Test Term", "Test Description", "Test Context",
                "Test Example", "Category", emptyRelationships);

        Set<ConstraintViolation<GlossaryResponse>> violations = validator.validate(response);

        assertThat(violations).isEmpty();
        assertThat(response.relationships()).isEmpty();
    }

    @Test
    @DisplayName("Should create response with single relationship")
    void shouldCreateResponseWithSingleRelationship() {
        String[] singleRelationship = {
                "Single Related"
        };
        GlossaryResponse response = new GlossaryResponse("Test Term", "Test Description", "Test Context",
                "Test Example", "Category", singleRelationship);

        assertThat(response.relationships()).hasSize(1);
        assertThat(response.relationships()).containsExactly("Single Related");
    }

    @Test
    @DisplayName("Should create response with multiple relationships")
    void shouldCreateResponseWithMultipleRelationships() {
        String[] multipleRelationships = {
                "Related 1", "Related 2", "Related 3"
        };
        GlossaryResponse response = new GlossaryResponse("Test Term", "Test Description", "Test Context",
                "Test Example", "Category", multipleRelationships);

        assertThat(response.relationships()).hasSize(3);
        assertThat(response.relationships()).containsExactlyInAnyOrder("Related 1", "Related 2", "Related 3");
    }

    @Test
    @DisplayName("Should handle long descriptions")
    void shouldHandleLongDescriptions() {
        String longDescription = "This is a very long description that provides detailed information about the glossary term. It can include multiple sentences and should still be handled properly by the response object.";
        GlossaryResponse response = new GlossaryResponse("Test Term", longDescription, "Test Context", "Test Example",
                "Category", new String[] {});

        Set<ConstraintViolation<GlossaryResponse>> violations = validator.validate(response);

        assertThat(violations).isEmpty();
        assertThat(response.description()).isEqualTo(longDescription);
    }

    @Test
    @DisplayName("Should handle special characters in fields")
    void shouldHandleSpecialCharactersInFields() {
        String[] relationships = {
                "Related & More", "Special/Characters", "Test (2024)"
        };
        GlossaryResponse response = new GlossaryResponse("Test Term (Special)", "Description with & symbols",
                "Context with émojis 🎉", "Example with numbers 123", "Category", relationships);

        Set<ConstraintViolation<GlossaryResponse>> violations = validator.validate(response);

        assertThat(violations).isEmpty();
        assertThat(response.title()).isEqualTo("Test Term (Special)");
        assertThat(response.context()).isEqualTo("Context with émojis 🎉");
    }
}
