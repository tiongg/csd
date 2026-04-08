package csd.t6.backend.glossary.dto.request;

import static org.assertj.core.api.Assertions.assertThat;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import java.util.List;
import java.util.Set;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class GlossaryUpdateRequestTest {

    private Validator validator;

    @BeforeEach
    void setUp() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @Test
    @DisplayName("Should create valid glossary update request")
    void shouldCreateValidGlossaryUpdateRequest() {
        GlossaryUpdateRequest request = new GlossaryUpdateRequest("Test Term", "Test Description", "Test Example",
                "Test Context", List.of("Related Term 1", "Related Term 2"));

        assertThat(request.name()).isEqualTo("Test Term");
        assertThat(request.description()).isEqualTo("Test Description");
        assertThat(request.usedInConversationExample()).isEqualTo("Test Example");
        assertThat(request.usedInContext()).isEqualTo("Test Context");
        assertThat(request.relationships()).containsExactlyInAnyOrder("Related Term 1", "Related Term 2");
    }

    @Test
    @DisplayName("Should validate required fields")
    void shouldValidateRequiredFields() {
        GlossaryUpdateRequest request = new GlossaryUpdateRequest(null, null, null, null, null);

        Set<ConstraintViolation<GlossaryUpdateRequest>> violations = validator.validate(request);

        assertThat(violations).hasSize(5);
        assertThat(violations).anyMatch(v -> v.getPropertyPath().toString().equals("name"));
        assertThat(violations).anyMatch(v -> v.getPropertyPath().toString().equals("description"));
        assertThat(violations).anyMatch(v -> v.getPropertyPath().toString().equals("usedInConversationExample"));
        assertThat(violations).anyMatch(v -> v.getPropertyPath().toString().equals("usedInContext"));
        assertThat(violations).anyMatch(v -> v.getPropertyPath().toString().equals("relationships"));
    }

    @Test
    @DisplayName("Should validate non-null relationships")
    void shouldValidateNonNullRelationships() {
        GlossaryUpdateRequest request = new GlossaryUpdateRequest("Test Term", "Test Description", "Test Example",
                "Test Context", null);

        Set<ConstraintViolation<GlossaryUpdateRequest>> violations = validator.validate(request);

        assertThat(violations).isNotEmpty();
        assertThat(violations).anyMatch(v -> v.getPropertyPath().toString().equals("relationships"));
    }

    @Test
    @DisplayName("Should create request with empty relationships")
    void shouldCreateRequestWithEmptyRelationships() {
        GlossaryUpdateRequest request = new GlossaryUpdateRequest("Test Term", "Test Description", "Test Example",
                "Test Context", List.of());

        Set<ConstraintViolation<GlossaryUpdateRequest>> violations = validator.validate(request);

        assertThat(violations).isEmpty();
        assertThat(request.relationships()).isEmpty();
    }

    @Test
    @DisplayName("Should create request with single relationship")
    void shouldCreateRequestWithSingleRelationship() {
        GlossaryUpdateRequest request = new GlossaryUpdateRequest("Test Term", "Test Description", "Test Example",
                "Test Context", List.of("Single Related"));

        assertThat(request.relationships()).hasSize(1);
        assertThat(request.relationships()).containsExactly("Single Related");
    }

    @Test
    @DisplayName("Should create request with multiple relationships")
    void shouldCreateRequestWithMultipleRelationships() {
        List<String> relationships = List.of("Related 1", "Related 2", "Related 3");
        GlossaryUpdateRequest request = new GlossaryUpdateRequest("Test Term", "Test Description", "Test Example",
                "Test Context", relationships);

        assertThat(request.relationships()).hasSize(3);
        assertThat(request.relationships()).containsExactlyInAnyOrder("Related 1", "Related 2", "Related 3");
    }
}
