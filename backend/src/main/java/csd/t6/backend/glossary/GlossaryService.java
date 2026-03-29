package csd.t6.backend.glossary;

import java.util.List;

import csd.t6.backend.glossary.request.GlossaryUpdateRequest;
import csd.t6.backend.glossary.response.GlossaryResponse;

public interface GlossaryService {
  public void generateGlossary();

  public void updateGlossaryTerm(GlossaryUpdateRequest request);

  public List<GlossaryResponse> getAllGlossaryTerms();
}