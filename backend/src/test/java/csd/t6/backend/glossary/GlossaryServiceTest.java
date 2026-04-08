package csd.t6.backend.glossary;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import csd.t6.backend.ai.AIService;
import csd.t6.backend.glossary.dto.request.GlossaryUpdateRequest;
import csd.t6.backend.glossary.dto.response.GlossaryResponse;
import csd.t6.jooq.public_.tables.records.GlossaryTermRecord;

@ExtendWith(MockitoExtension.class)
class GlossaryServiceTest {

  @Mock
  private AIService aiService;

  @Mock
  private GlossaryRepository glossaryRepository;

  @Mock
  private GlossaryRelationRepository glossaryRelationRepository;

  @InjectMocks
  private GlossaryServiceImpl glossaryService;

  @Test
  @DisplayName("Should regenerate glossary for unresolved and uncategorized terms")
  void shouldRegenerateGlossaryForUnresolvedAndUncategorizedTerms() {
    GlossaryTermRecord uncategorizedRecord = mock(GlossaryTermRecord.class);
    UUID uncategorizedId = UUID.randomUUID();
    when(uncategorizedRecord.getId()).thenReturn(uncategorizedId);
    when(uncategorizedRecord.getTitle()).thenReturn("Aura farming");
    when(uncategorizedRecord.getCategory()).thenReturn(null);

    GlossaryTermRecord categorizedRecord = mock(GlossaryTermRecord.class);
    UUID categorizedId = UUID.randomUUID();
    when(categorizedRecord.getId()).thenReturn(categorizedId);
    when(categorizedRecord.getTitle()).thenReturn("Sigma");
    when(categorizedRecord.getCategory()).thenReturn("Mindset");

    GlossaryUpdateRequest rizzRequest = new GlossaryUpdateRequest("Rizz", "Charisma", "He has rizz",
        "dating slang", "Social", List.of("Aura farming"));
    GlossaryUpdateRequest auraRequest = new GlossaryUpdateRequest("Aura farming", "Building mystique",
        "She is aura farming again", "online persona", "Mindset", List.of("Sigma"));

    GlossaryTermRecord rizzRecord = mock(GlossaryTermRecord.class);
    UUID rizzId = UUID.randomUUID();
    when(rizzRecord.getId()).thenReturn(rizzId);

    when(glossaryRepository.getAllUnresolvedTerms()).thenReturn(List.of("Rizz"));
    when(glossaryRepository.getAll()).thenReturn(List.of(uncategorizedRecord, categorizedRecord));
    when(aiService.generateTags(List.of("Rizz", "Aura farming"), List.of("Sigma"), List.of("Mindset")))
        .thenReturn(List.of(rizzRequest, auraRequest));
    when(glossaryRepository.upsert(rizzRequest)).thenReturn(rizzRecord);
    when(glossaryRepository.upsert(auraRequest)).thenReturn(uncategorizedRecord);
    when(glossaryRepository.getByTitles(List.of("Aura farming"))).thenReturn(List.of(uncategorizedRecord));
    when(glossaryRepository.getByTitles(List.of("Sigma"))).thenReturn(List.of(categorizedRecord));

    glossaryService.generateGlossary();

    verify(aiService).generateTags(List.of("Rizz", "Aura farming"), List.of("Sigma"), List.of("Mindset"));
    verify(glossaryRelationRepository).setRelationships(rizzId, List.of(uncategorizedId));
    verify(glossaryRelationRepository).setRelationships(uncategorizedId, List.of(categorizedId));
  }

  @Test
  @DisplayName("Should return glossary responses with category and relationships")
  void shouldReturnGlossaryResponsesWithCategoryAndRelationships() {
    GlossaryTermRecord glossaryTermRecord = mock(GlossaryTermRecord.class);
    UUID termId = UUID.randomUUID();
    when(glossaryTermRecord.getId()).thenReturn(termId);
    when(glossaryTermRecord.getTitle()).thenReturn("Delulu");
    when(glossaryTermRecord.getDescription()).thenReturn("Delusionally optimistic");
    when(glossaryTermRecord.getUsedInContext()).thenReturn("social banter");
    when(glossaryTermRecord.getUsedInConversationExample()).thenReturn("He is delulu today");
    when(glossaryTermRecord.getCategory()).thenReturn("Social");

    when(glossaryRepository.getAll()).thenReturn(List.of(glossaryTermRecord));
    when(glossaryRepository.getAllWithRelationshipTitles()).thenReturn(Map.of(termId, List.of("Rizz")));

    List<GlossaryResponse> response = glossaryService.getAllGlossaryTerms();

    assertThat(response).hasSize(1);
    assertThat(response.get(0).category()).isEqualTo("Social");
    assertThat(response.get(0).relationships()).containsExactly("Rizz");
  }
}
