package csd.t6.backend.glossary;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import csd.t6.backend.glossary.dto.request.GlossaryUpdateRequest;
import csd.t6.jooq.public_.tables.records.GlossaryTermRecord;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class GlossaryRelationRepositoryTest {

    @Autowired
    private GlossaryRepository glossaryRepository;

    @Autowired
    private GlossaryRelationRepository glossaryRelationRepository;

    private GlossaryTermRecord parentTerm;
    private GlossaryTermRecord childTerm1;
    private GlossaryTermRecord childTerm2;

    @BeforeEach
    void setUp() {
        GlossaryUpdateRequest parentRequest = new GlossaryUpdateRequest("Parent Term", "Parent Description",
                "Parent Example", "Parent Context", "Category", List.of());
        parentTerm = glossaryRepository.upsert(parentRequest);

        GlossaryUpdateRequest childRequest1 = new GlossaryUpdateRequest("Child Term 1", "Child Description 1",
                "Child Example 1", "Child Context 1", "Category", List.of());
        childTerm1 = glossaryRepository.upsert(childRequest1);

        GlossaryUpdateRequest childRequest2 = new GlossaryUpdateRequest("Child Term 2", "Child Description 2",
                "Child Example 2", "Child Context 2", "Category", List.of());
        childTerm2 = glossaryRepository.upsert(childRequest2);
    }

    @Test
    @DisplayName("Should set relationships for parent term")
    void shouldSetRelationships() {
        List<UUID> childTermIds = List.of(childTerm1.getId(), childTerm2.getId());

        glossaryRelationRepository.setRelationships(parentTerm.getId(), childTermIds);

        var relationships = glossaryRepository.getAllWithRelationshipTitles();
        List<String> parentRelationships = relationships.get(parentTerm.getId());

        assertThat(parentRelationships).isNotNull();
        assertThat(parentRelationships).hasSize(2);
        assertThat(parentRelationships).contains("Child Term 1", "Child Term 2");
    }

    @Test
    @DisplayName("Should replace existing relationships")
    void shouldReplaceExistingRelationships() {
        // Set initial relationships
        glossaryRelationRepository.setRelationships(parentTerm.getId(), List.of(childTerm1.getId()));

        // Replace with new relationships
        glossaryRelationRepository.setRelationships(parentTerm.getId(), List.of(childTerm2.getId()));

        var relationships = glossaryRepository.getAllWithRelationshipTitles();
        List<String> parentRelationships = relationships.get(parentTerm.getId());

        assertThat(parentRelationships).isNotNull();
        assertThat(parentRelationships).hasSize(1);
        assertThat(parentRelationships).contains("Child Term 2");
        assertThat(parentRelationships).doesNotContain("Child Term 1");
    }

    @Test
    @DisplayName("Should clear all relationships when empty list provided")
    void shouldClearRelationshipsWithEmptyList() {
        // Set initial relationships
        glossaryRelationRepository.setRelationships(parentTerm.getId(),
                List.of(childTerm1.getId(), childTerm2.getId()));

        // Clear relationships
        glossaryRelationRepository.setRelationships(parentTerm.getId(), List.of());

        var relationships = glossaryRepository.getAllWithRelationshipTitles();
        List<String> parentRelationships = relationships.get(parentTerm.getId());

        assertThat(parentRelationships).isNotNull();
        assertThat(parentRelationships).isEmpty();
    }
}
