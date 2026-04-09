package csd.t6.backend.ai.dto.response;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import java.util.Set;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import csd.t6.backend.glossary.dto.request.GlossaryUpdateRequest;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;

class GeminiRelationshipResponseTest {

    private Validator validator;

    @BeforeEach
    void setUp() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @Test
    @DisplayName("Should create valid gemini relationship response")
    void shouldCreateValidGeminiRelationshipResponse() {
        GlossaryUpdateRequest tag1 = new GlossaryUpdateRequest("Tag 1", "Description 1", "Example 1", "Context 1",
                "Category", List.of("Tag 2"));
        GlossaryUpdateRequest tag2 = new GlossaryUpdateRequest("Tag 2", "Description 2", "Example 2", "Context 2",
                "Category", List.of("Tag 1"));
        List<GlossaryUpdateRequest> tags = List.of(tag1, tag2);

        GeminiRelationshipResponse response = new GeminiRelationshipResponse(tags);

        assertThat(response.tags()).hasSize(2);
        assertThat(response.tags()).containsExactlyInAnyOrder(tag1, tag2);
        assertThat(response.tags().get(0).name()).isEqualTo("Tag 1");
    }

    @Test
    @DisplayName("Should validate required tags field")
    void shouldValidateRequiredTagsField() {
        GeminiRelationshipResponse response = new GeminiRelationshipResponse(null);

        Set<ConstraintViolation<GeminiRelationshipResponse>> violations = validator.validate(response);

        assertThat(violations).isNotEmpty();
        assertThat(violations).anyMatch(v -> v.getPropertyPath().toString().equals("tags"));
    }

    @Test
    @DisplayName("Should create response with empty tags list")
    void shouldCreateResponseWithEmptyTagsList() {
        GeminiRelationshipResponse response = new GeminiRelationshipResponse(List.of());

        Set<ConstraintViolation<GeminiRelationshipResponse>> violations = validator.validate(response);

        assertThat(violations).isEmpty();
        assertThat(response.tags()).isEmpty();
    }

    @Test
    @DisplayName("Should create response with single tag")
    void shouldCreateResponseWithSingleTag() {
        GlossaryUpdateRequest tag1 = new GlossaryUpdateRequest("Tag 1", "Description 1", "Example 1", "Context 1",
                "Category", List.of());
        List<GlossaryUpdateRequest> tags = List.of(tag1);

        GeminiRelationshipResponse response = new GeminiRelationshipResponse(tags);

        assertThat(response.tags()).hasSize(1);
        assertThat(response.tags().get(0).name()).isEqualTo("Tag 1");
    }

    @Test
    @DisplayName("Should create response with multiple tags")
    void shouldCreateResponseWithMultipleTags() {
        GlossaryUpdateRequest tag1 = new GlossaryUpdateRequest("Tag 1", "Description 1", "Example 1", "Context 1",
                "Category", List.of("Tag 2", "Tag 3"));
        GlossaryUpdateRequest tag2 = new GlossaryUpdateRequest("Tag 2", "Description 2", "Example 2", "Context 2",
                "Category", List.of("Tag 1"));
        GlossaryUpdateRequest tag3 = new GlossaryUpdateRequest("Tag 3", "Description 3", "Example 3", "Context 3",
                "Category", List.of("Tag 1"));
        List<GlossaryUpdateRequest> tags = List.of(tag1, tag2, tag3);

        GeminiRelationshipResponse response = new GeminiRelationshipResponse(tags);

        assertThat(response.tags()).hasSize(3);
        assertThat(response.tags()).containsExactlyInAnyOrder(tag1, tag2, tag3);
    }

    @Test
    @DisplayName("Should handle tags with complex relationships")
    void shouldHandleTagsWithComplexRelationships() {
        GlossaryUpdateRequest tag1 = new GlossaryUpdateRequest("Tag 1", "Description 1", "Example 1", "Context 1",
                "Category", List.of("Tag 2", "Tag 3", "Tag 4", "Tag 5"));
        List<GlossaryUpdateRequest> tags = List.of(tag1);

        GeminiRelationshipResponse response = new GeminiRelationshipResponse(tags);

        assertThat(response.tags()).hasSize(1);
        assertThat(response.tags().get(0).relationships()).hasSize(4);
        assertThat(response.tags().get(0).relationships()).containsExactlyInAnyOrder("Tag 2", "Tag 3", "Tag 4",
                "Tag 5");
    }

    @Test
    @DisplayName("Should validate tags list is not null")
    void shouldValidateTagsListIsNotNull() {
        GeminiRelationshipResponse response = new GeminiRelationshipResponse(null);

        Set<ConstraintViolation<GeminiRelationshipResponse>> violations = validator.validate(response);

        assertThat(violations).isNotEmpty();
        assertThat(violations).anyMatch(v -> v.getPropertyPath().toString().equals("tags"));
    }

    @Test
    @DisplayName("Should handle tags with no relationships")
    void shouldHandleTagsWithNoRelationships() {
        GlossaryUpdateRequest tag1 = new GlossaryUpdateRequest("Tag 1", "Description 1", "Example 1", "Context 1",
                "Category", List.of());
        List<GlossaryUpdateRequest> tags = List.of(tag1);

        GeminiRelationshipResponse response = new GeminiRelationshipResponse(tags);

        assertThat(response.tags()).hasSize(1);
        assertThat(response.tags().get(0).relationships()).isEmpty();
    }
}
