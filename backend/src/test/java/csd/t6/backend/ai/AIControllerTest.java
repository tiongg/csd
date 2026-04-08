package csd.t6.backend.ai;

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
class AIControllerTest {

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
    @DisplayName("GET /api/ai/relations - should get tag relations")
    void shouldGetTagRelations() throws Exception {
        List<String> tags = List.of("tag1", "tag2");
        String jsonBody = objectMapper.writeValueAsString(tags);

        GlossaryUpdateRequest response1 = new GlossaryUpdateRequest("tag1", "Description 1", "Example 1", "Context 1",
                "Category", List.of("tag2"));
        GlossaryUpdateRequest response2 = new GlossaryUpdateRequest("tag2", "Description 2", "Example 2", "Context 2",
                "Category", List.of("tag1"));
        List<GlossaryUpdateRequest> aiResponse = List.of(response1, response2);

        when(aiService.generateTags(tags, List.of(), List.of())).thenReturn(aiResponse);

        mockMvc.perform(get("/api/ai/relations").contentType(MediaType.APPLICATION_JSON).content(jsonBody))
                .andExpect(status().isOk()).andExpect(jsonPath("$[0].name").value("tag1"))
                .andExpect(jsonPath("$[0].description").value("Description 1"))
                .andExpect(jsonPath("$[0].relationships[0]").value("tag2"))
                .andExpect(jsonPath("$[1].name").value("tag2"));

        verify(aiService).generateTags(tags, List.of(), List.of());
    }

    @Test
    @DisplayName("GET /api/ai/relations - should handle empty tags")
    void shouldHandleEmptyTags() throws Exception {
        List<String> tags = List.of();
        String jsonBody = objectMapper.writeValueAsString(tags);

        when(aiService.generateTags(tags, List.of(), List.of())).thenReturn(List.of());

        mockMvc.perform(get("/api/ai/relations").contentType(MediaType.APPLICATION_JSON).content(jsonBody))
                .andExpect(status().isOk()).andExpect(jsonPath("$").isArray());

        verify(aiService).generateTags(tags, List.of(), List.of());
    }
}
