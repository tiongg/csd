package csd.t6.backend.glossary;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Stream;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import csd.t6.backend.ai.AIService;
import csd.t6.backend.glossary.dto.request.GlossaryUpdateRequest;
import csd.t6.backend.glossary.dto.response.GlossaryResponse;
import csd.t6.jooq.public_.tables.records.GlossaryTermRecord;

@Service
public class GlossaryServiceImpl implements GlossaryService {
  private final GlossaryRepository glossaryRepository;
  private final GlossaryRelationRepository glossaryRelationRepository;

  private final AIService aiService;

  public GlossaryServiceImpl(AIService aiService, GlossaryRepository glossaryRepository,
      GlossaryRelationRepository glossaryRelationRepository) {
    this.aiService = aiService;
    this.glossaryRepository = glossaryRepository;
    this.glossaryRelationRepository = glossaryRelationRepository;
  }

  @Transactional
  public void generateGlossary() {
    List<String> unresolvedTerms = glossaryRepository.getAllUnresolvedTerms();
    List<GlossaryTermRecord> existingTerms = glossaryRepository.getAll();
    List<String> uncategorizedTerms = existingTerms.stream()
        .filter(record -> record.getCategory() == null || record.getCategory().isBlank())
        .map(record -> record.getTitle()).toList();
    List<String> pendingTerms = Stream.concat(unresolvedTerms.stream(), uncategorizedTerms.stream()).distinct()
        .toList();

    if (pendingTerms.isEmpty()) {
      return;
    }

    Set<String> pendingTermSet = Set.copyOf(pendingTerms);
    List<String> existingGlossaryTerms = existingTerms.stream().map(record -> record.getTitle())
        .filter(title -> !pendingTermSet.contains(title)).toList();
    List<String> existingCategories = existingTerms.stream().map(record -> record.getCategory())
        .filter(Objects::nonNull).filter(category -> !category.isBlank()).distinct().toList();

    List<GlossaryUpdateRequest> generatedTags = aiService.generateTags(pendingTerms, existingGlossaryTerms,
        existingCategories);
    // Avoid using updateGlossaryTerm here as it is a batch call
    // This means that it is possible that pending tags reference each other,
    // but are not inserted into the db yet, which would cause the relationship
    // insertion to fail
    for (GlossaryUpdateRequest request : generatedTags) {
      this.glossaryRepository.upsert(request);
    }

    // Set relationships
    for (GlossaryUpdateRequest request : generatedTags) {
      this.updateGlossaryTerm(request);
    }
  }

  @Transactional
  public void updateGlossaryTerm(GlossaryUpdateRequest request) {
    GlossaryTermRecord parentTerm = this.glossaryRepository.upsert(request);
    List<GlossaryTermRecord> childTerms = this.glossaryRepository.getByTitles(request.relationships());

    // Filter out terms that cannot be found in the glossary
    if (childTerms.isEmpty()) {
      return;
    }

    // Update relationships only for found terms
    this.glossaryRelationRepository.setRelationships(parentTerm.getId(),
        childTerms.stream().map(record -> record.getId()).toList());
  }

  public List<GlossaryResponse> getAllGlossaryTerms() {
    List<GlossaryTermRecord> terms = glossaryRepository.getAll();
    Map<UUID, List<String>> relationships = glossaryRepository.getAllWithRelationshipTitles();

    return terms.stream()
        .map(term -> new GlossaryResponse(term.getTitle(), term.getDescription(), term.getUsedInContext(),
            term.getUsedInConversationExample(), term.getCategory(),
            relationships.getOrDefault(term.getId(), List.of()).toArray(new String[0])))
        .toList();
  }

  @Transactional
  public void clearGlossaryTerms() {
    this.glossaryRepository.deleteAllTerms();
  }
}
