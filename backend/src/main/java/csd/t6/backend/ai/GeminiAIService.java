package csd.t6.backend.ai;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.genai.Client;
import com.google.genai.types.GenerateContentConfig;
import com.google.genai.types.GenerateContentResponse;
import com.google.genai.types.Schema;
import com.google.genai.types.ThinkingConfig;
import com.google.genai.types.ThinkingLevel;

import csd.t6.backend.ai.dto.response.GeminiRelationshipResponse;
import csd.t6.backend.glossary.dto.request.GlossaryUpdateRequest;

@Service
public class GeminiAIService implements AIService {
  private final Client client;

  public GeminiAIService() {
    this.client = new Client();
  }

  public List<GlossaryUpdateRequest> generateTags(List<String> genTags, List<String> existingGlossaryTerms,
      List<String> existingCategories) {
    String prompt = String.format(
        """
            You are given two sets of tags related to courses about **Gen Alpha culture**:
            - Pending Tags: Tags that require processing
            - Existing Tags: Tags that are already defined and must NOT be modified
            - Existing Categories: Prefer these category names whenever they fit

            # Your Tasks for pending tags
            1. Derive Relationships
                - For each pending tag, identify its relationship to existing or pending tags.
                - Relationships can be hierarchical (e.g., "is a type of"), associative (e.g., "is related to"), or causal (e.g., "influences").
                - Use only logical, high-confidence relationships. Do NOT infer beyond the given tags.
            2. Generate Metadata
                - For each pending tag, provide:
                    - Description: Clear, concise explanation (1-2 sentences, factual, no speculation)
                    - Context: Maximum 5 words
                    - Example: A realistic sentence showing how the tag is used in conversation
                    - Category: Reuse an existing category when possible. Only create a new short category if none fit.

            # Inputs:
            ## Pending Tags:
            %s
            ## Existing Tags:
            %s
            ## Existing Categories:
            %s
            """,
        String.join("\n", genTags), String.join("\n", existingGlossaryTerms), String.join("\n", existingCategories));

    // @formatter:off
    Schema schema = Schema.builder()
      .type("object")
      .required(List.of("tags"))
      .properties(Map.of(
          "tags", Schema.builder()
              .type("array")
              .items(
                  Schema.builder()
                      .type("object")
                      .required(List.of("name", "description", "usedInConversationExample", "usedInContext", "category", "relationships"))
                      .properties(Map.of(
                          "name", Schema.builder().type("string").build(),
                          "description", Schema.builder().type("string").build(),
                          "usedInConversationExample", Schema.builder().type("string").build(),
                          "usedInContext", Schema.builder().type("string").build(),
                          "category", Schema.builder().type("string").build(),
                          "relationships", Schema.builder()
                              .type("array")
                              .items(Schema.builder().type("string").build())
                              .build()
                      ))
                      .build()
              )
              .build()
      ))
      .build();
    // @formatter:on

    GenerateContentConfig config = GenerateContentConfig.builder().responseMimeType("application/json")
        .candidateCount(1).responseSchema(schema)
        .thinkingConfig(ThinkingConfig.builder().thinkingLevel(ThinkingLevel.Known.HIGH).build()).build();

    // String model = "gemini-3-flash-preview";
    String model = "gemini-3.1-flash-lite-preview";
    GenerateContentResponse response = client.models.generateContent(model, prompt, config);

    try {
      ObjectMapper objectMapper = new ObjectMapper();
      String jsonResponse = response.text();
      GeminiRelationshipResponse relationshipResponse = objectMapper.readValue(jsonResponse,
          GeminiRelationshipResponse.class);
      return relationshipResponse.tags();
    } catch (Exception e) {
      throw new RuntimeException("Failed to parse Gemini response", e);
    }
  }
}
