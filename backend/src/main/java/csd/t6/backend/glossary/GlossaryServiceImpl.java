package csd.t6.backend.glossary;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import csd.t6.backend.ai.AIService;
import csd.t6.backend.exceptions.BadRequestException;
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
    List<String> existingGlossaryTerms = glossaryRepository.getAll().stream().map(record -> record.getTitle()).toList();

    List<GlossaryUpdateRequest> generatedTags = aiService.generateTags(unresolvedTerms, existingGlossaryTerms);
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

    if (childTerms.size() != request.relationships().size()) {
      throw new BadRequestException("Some relationships could not be found in the glossary");
    }

    // Update relationships
    this.glossaryRelationRepository.setRelationships(parentTerm.getId(),
        childTerms.stream().map(record -> record.getId()).toList());
  }

  public List<GlossaryResponse> getAllGlossaryTerms() {
    List<GlossaryTermRecord> terms = glossaryRepository.getAll();
    Map<UUID, List<String>> relationships = glossaryRepository.getAllWithRelationshipTitles();

    return terms.stream()
        .map(term -> new GlossaryResponse(term.getTitle(), term.getDescription(), term.getUsedInContext(),
            term.getUsedInConversationExample(),
            relationships.getOrDefault(term.getId(), List.of()).toArray(new String[0])))
        .toList();
  }
}
