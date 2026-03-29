package csd.t6.backend.glossary;

import java.util.List;

import csd.t6.backend.glossary.dto.request.GlossaryUpdateRequest;
import csd.t6.backend.glossary.dto.response.GlossaryResponse;

public interface GlossaryService {
  public void generateGlossary();

  public void updateGlossaryTerm(GlossaryUpdateRequest request);

  public List<GlossaryResponse> getAllGlossaryTerms();
}