package csd.t6.backend.glossary;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.transaction.annotation.Transactional;

import csd.t6.backend.ai.AIService;
import csd.t6.backend.glossary.dto.request.GlossaryUpdateRequest;
import csd.t6.backend.tag.TagRepository;
import csd.t6.jooq.public_.tables.records.GlossaryTermRecord;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class GlossaryRepositoryTest {

    @Autowired
    private GlossaryRepository glossaryRepository;

    @Autowired
    private TagRepository tagRepository;

    @MockitoBean
    private AIService aiService;

    @Test
    @DisplayName("Should persist glossary category and return it in category list")
    void shouldPersistGlossaryCategory() {
        GlossaryTermRecord saved = glossaryRepository.upsert(new GlossaryUpdateRequest("Sigma", "Confident persona",
                "He acts sigma", "mindset flex", "Mindset", List.of()));

        assertThat(saved.getCategory()).isEqualTo("Mindset");
        assertThat(glossaryRepository.getAllCategories()).contains("Mindset");
    }

    @Test
    @DisplayName("Should return unresolved tags that are not yet glossary terms")
    void shouldReturnUnresolvedTags() {
        tagRepository.findOrCreateByTitle("Rizz");
        tagRepository.findOrCreateByTitle("Skibidi");
        glossaryRepository.upsert(
                new GlossaryUpdateRequest("Rizz", "Charisma", "He has rizz", "dating slang", "Social", List.of()));

        List<String> unresolvedTerms = glossaryRepository.getAllUnresolvedTerms();

        assertThat(unresolvedTerms).contains("Skibidi");
        assertThat(unresolvedTerms).doesNotContain("Rizz");
    }
}
