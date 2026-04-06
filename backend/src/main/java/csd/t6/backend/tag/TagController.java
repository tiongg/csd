package csd.t6.backend.tag;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import csd.t6.backend.decorators.responses.OkResponse;
import csd.t6.backend.tag.dto.response.TagResponse;
import csd.t6.backend.tag.dto.response.TopTagResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/tags")
@Tag(name = "Tags", description = "Tag management endpoints")
@SecurityRequirement(name = "bearerAuth")
public class TagController {

  private final TagService tagService;

  public TagController(TagService tagService) {
    this.tagService = tagService;
  }

  @GetMapping("/")
  @OkResponse
  @Operation(summary = "Get all tags", description = "Retrieves all available tags")
  public List<TagResponse> getAllTags() {
    return tagService.getAllTags();
  }

  @GetMapping("/search")
  @OkResponse
  @Operation(summary = "Search tags", description = "Search tags by title pattern")
  public List<TagResponse> searchTags(@RequestParam String q) {
    return tagService.searchTags(q);
  }

  @GetMapping("/top")
  @OkResponse
  @Operation(summary = "Get top tags", description = "Get the 5 most commonly used tags")
  public List<TopTagResponse> getTopTags() {
    return tagService.getTopTags();
  }
}
