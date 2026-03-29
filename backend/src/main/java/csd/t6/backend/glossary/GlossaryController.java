package csd.t6.backend.glossary;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import csd.t6.backend.glossary.response.GlossaryResponse;

@RestController
@RequestMapping("/api/glossary")
public class GlossaryController {
  private final GlossaryService glossaryService;

  public GlossaryController(GlossaryService glossaryService) {
    this.glossaryService = glossaryService;
  }

  @PostMapping("/")
  public void autogenRelationships() {
    this.glossaryService.generateGlossary();
  }

  @GetMapping("/")
  public List<GlossaryResponse> getGlossaryTerms() {
    return this.glossaryService.getAllGlossaryTerms();
  }

}
