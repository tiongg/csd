package csd.t6.backend.ai;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import csd.t6.backend.glossary.dto.request.GlossaryUpdateRequest;
import io.jsonwebtoken.lang.Collections;

@RestController
@RequestMapping("/api/ai")
public class AIController {

  private final AIService aiService;

  public AIController(AIService aiService) {
    this.aiService = aiService;
  }

  @GetMapping("relations")
  public List<GlossaryUpdateRequest> getTagRelations(@RequestBody List<String> tags) {
    return aiService.generateTags(tags, Collections.emptyList());
  }
}
