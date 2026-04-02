package csd.t6.backend.ai;

import java.util.List;

import csd.t6.backend.glossary.dto.request.GlossaryUpdateRequest;

public interface AIService {
  public List<GlossaryUpdateRequest> generateTags(List<String> tags, List<String> existingGlossaryTerms);
}