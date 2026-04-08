package csd.t6.backend.ai;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.web.WebAppConfiguration;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import com.fasterxml.jackson.databind.ObjectMapper;

import csd.t6.backend.glossary.dto.request.GlossaryUpdateRequest;

@SpringBootTest
@WebAppConfiguration
@ActiveProfiles("test")
@Transactional
class AIControllerAdditionalTest {

    @Autowired
    private WebApplicationContext context;

    private MockMvc mockMvc;

    @MockitoBean
    private AIService aiService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context).build();
    }

    @Test
    @DisplayName("GET /api/ai/relations - should return correct relationship data")
    void shouldReturnCorrectRelationshipData() throws Exception {
        List<String> tags = List.of("rizz", "no cap");
        String jsonBody = objectMapper.writeValueAsString(tags);

        GlossaryUpdateRequest r1 = new GlossaryUpdateRequest("rizz", "Charisma or charm", "He's got rizz.", "Dating",
                List.of("no cap", "vibe"));
        when(aiService.generateTags(tags, List.of())).thenReturn(List.of(r1));

        mockMvc.perform(get("/api/ai/relations").contentType(MediaType.APPLICATION_JSON).content(jsonBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("rizz"))
                .andExpect(jsonPath("$[0].description").value("Charisma or charm"))
                .andExpect(jsonPath("$[0].context").value("Dating"))
                .andExpect(jsonPath("$[0].relationships").isArray())
                .andExpect(jsonPath("$[0].relationships[0]").value("no cap"));

        verify(aiService).generateTags(tags, List.of());
    }

    @Test
    @DisplayName("GET /api/ai/relations - single tag returns single result")
    void shouldHandleSingleTag() throws Exception {
        List<String> tags = List.of("slay");
        String jsonBody = objectMapper.writeValueAsString(tags);

        GlossaryUpdateRequest r = new GlossaryUpdateRequest("slay", "To do something impressively well",
                "She slayed that presentation.", "Affirmation", List.of());
        when(aiService.generateTags(tags, List.of())).thenReturn(List.of(r));

        mockMvc.perform(get("/api/ai/relations").contentType(MediaType.APPLICATION_JSON).content(jsonBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].name").value("slay"));
    }

    @Test
    @DisplayName("GET /api/ai/relations - large tag list is passed through correctly")
    void shouldHandleLargeTagList() throws Exception {
        List<String> tags = List.of("bussin", "lowkey", "highkey", "vibe check", "understood the assignment");
        String jsonBody = objectMapper.writeValueAsString(tags);

        List<GlossaryUpdateRequest> results = tags.stream()
                .map(t -> new GlossaryUpdateRequest(t, "desc", "example", "context", List.of()))
                .toList();
        when(aiService.generateTags(tags, List.of())).thenReturn(results);

        mockMvc.perform(get("/api/ai/relations").contentType(MediaType.APPLICATION_JSON).content(jsonBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(5));
    }
}

// ---- AIService interface contract tests ----
class AIServiceInterfaceTest {

    @Test
    @DisplayName("GeminiAIService implements AIService")
    void geminiAIService_implementsAIService() {
        GeminiAIService service = new GeminiAIService();
        assertThat(service).isInstanceOf(AIService.class);
    }

    @Test
    @DisplayName("GeminiAIService is instantiable without arguments")
    void geminiAIService_isInstantiable() {
        assertThat(new GeminiAIService()).isNotNull();
    }

    @Test
    @DisplayName("GeminiAIService multiple instances are independent")
    void geminiAIService_multipleInstancesAreIndependent() {
        GeminiAIService s1 = new GeminiAIService();
        GeminiAIService s2 = new GeminiAIService();
        assertThat(s1).isNotSameAs(s2);
    }
}

// ---- AIController unit tests (no Spring context) ----
class AIControllerUnitTest {

    @Test
    @DisplayName("AIController constructor accepts AIService dependency")
    void aiController_constructorAcceptsService() {
        AIService mockService = (tags, existing) -> List.of();
        AIController controller = new AIController(mockService);
        assertThat(controller).isNotNull();
    }

    @Test
    @DisplayName("AIController.getTagRelations delegates to AIService")
    void aiController_delegatesToService() {
        List<GlossaryUpdateRequest> expected = List.of(
                new GlossaryUpdateRequest("yeet", "to throw", "Yeet the ball.", "Sports", List.of()));
        AIService mockService = (tags, existing) -> expected;
        AIController controller = new AIController(mockService);

        List<GlossaryUpdateRequest> result = controller.getTagRelations(List.of("yeet"));

        assertThat(result).isEqualTo(expected);
    }

    @Test
    @DisplayName("AIController.getTagRelations with empty list returns empty")
    void aiController_emptyTagsReturnsEmpty() {
        AIService mockService = (tags, existing) -> List.of();
        AIController controller = new AIController(mockService);

        List<GlossaryUpdateRequest> result = controller.getTagRelations(List.of());

        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("AIController passes empty existing glossary list")
    void aiController_passesEmptyExistingGlossary() {
        List<String> capturedExisting = new java.util.ArrayList<>();
        AIService mockService = (tags, existing) -> {
            capturedExisting.addAll(existing);
            return List.of();
        };
        AIController controller = new AIController(mockService);
        controller.getTagRelations(List.of("test"));

        assertThat(capturedExisting).isEmpty();
    }
}