package csd.t6.backend.glossary;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
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
import csd.t6.backend.glossary.dto.response.GlossaryResponse;

@SpringBootTest
@WebAppConfiguration
@ActiveProfiles("test")
@Transactional
class GlossaryControllerTest {

    @Autowired
    private WebApplicationContext context;

    private MockMvc mockMvc;

    @MockitoBean
    private GlossaryService glossaryService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context).build();
    }

    @Test
    @DisplayName("POST /api/glossary/ - should autogen relationships")
    void shouldAutogenRelationships() throws Exception {
        mockMvc.perform(post("/api/glossary/").contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());

        verify(glossaryService).generateGlossary();
    }

    @Test
    @DisplayName("GET /api/glossary/ - should get all glossary terms")
    void shouldGetAllGlossaryTerms() throws Exception {
        GlossaryResponse response = new GlossaryResponse("Term 1", "Description 1", "Context 1", "Example 1",
                new String[] { "Related 1" });

        when(glossaryService.getAllGlossaryTerms()).thenReturn(List.of(response));

        mockMvc.perform(get("/api/glossary/").contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());

        verify(glossaryService).getAllGlossaryTerms();
    }

    @Test
    @DisplayName("PUT /api/glossary/ - should update glossary term")
    void shouldUpdateGlossaryTerm() throws Exception {
        GlossaryUpdateRequest request = new GlossaryUpdateRequest("Test Term", "Test Description", "Test Example",
                "Test Context", List.of("Related Term"));
        String json = objectMapper.writeValueAsString(request);

        mockMvc.perform(put("/api/glossary/").contentType(MediaType.APPLICATION_JSON).content(json))
                .andExpect(status().isOk());

        verify(glossaryService).updateGlossaryTerm(request);
    }

    @Test
    @DisplayName("DELETE /api/glossary/ - should clear all glossary terms")
    void shouldClearAllGlossaryTerms() throws Exception {
        mockMvc.perform(delete("/api/glossary/").contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());

        verify(glossaryService).clearGlossaryTerms();
    }
}
