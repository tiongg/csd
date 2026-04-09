package csd.t6.backend.tag;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
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

import csd.t6.backend.tag.dto.response.TagResponse;
import csd.t6.backend.tag.dto.response.TopTagResponse;

@SpringBootTest
@WebAppConfiguration
@ActiveProfiles("test")
@Transactional
class TagControllerTest {

    @Autowired
    private WebApplicationContext context;

    private MockMvc mockMvc;

    @MockitoBean
    private TagService tagService;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context).build();
    }

    @Test
    @DisplayName("GET /api/tags/ - should get all tags")
    void shouldGetAllTags() throws Exception {
        List<TagResponse> mockTags = List.of(
                new TagResponse(java.util.UUID.randomUUID(), "Java"),
                new TagResponse(java.util.UUID.randomUUID(), "Spring"));

        when(tagService.getAllTags()).thenReturn(mockTags);

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get("/api/tags/")
                        .contentType(MediaType.APPLICATION_JSON)).andExpect(status().isOk())
                        .andExpect(jsonPath("$[0].title").value("Java"))
                        .andExpect(jsonPath("$[1].title").value("Spring"));

        verify(tagService).getAllTags();
    }

    @Test
    @DisplayName("GET /api/tags/search - should search tags by query")
    void shouldSearchTagsByQuery() throws Exception {
        String searchQuery = "Java";
        List<TagResponse> mockTags = List.of(
                new TagResponse(java.util.UUID.randomUUID(), "Java"),
                new TagResponse(java.util.UUID.randomUUID(), "JavaScript"));

        when(tagService.searchTags(searchQuery)).thenReturn(mockTags);

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get("/api/tags/search")
                        .param("q", searchQuery).contentType(MediaType.APPLICATION_JSON))
                        .andExpect(status().isOk()).andExpect(jsonPath("$[0].title").value("Java"))
                        .andExpect(jsonPath("$.size()").value(2));

        verify(tagService).searchTags(searchQuery);
    }

    @Test
    @DisplayName("GET /api/tags/search - should handle empty search results")
    void shouldHandleEmptySearchResults() throws Exception {
        String searchQuery = "NonExistentTag";

        when(tagService.searchTags(searchQuery)).thenReturn(List.of());

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get("/api/tags/search")
                        .param("q", searchQuery).contentType(MediaType.APPLICATION_JSON))
                        .andExpect(status().isOk()).andExpect(jsonPath("$.size()").value(0));

        verify(tagService).searchTags(searchQuery);
    }

    @Test
    @DisplayName("GET /api/tags/top - should get top tags")
    void shouldGetTopTags() throws Exception {
        List<TopTagResponse> mockTopTags = List.of(
                new TopTagResponse(java.util.UUID.randomUUID(), "Java", 100),
                new TopTagResponse(java.util.UUID.randomUUID(), "Spring", 85),
                new TopTagResponse(java.util.UUID.randomUUID(), "Python", 70));

        when(tagService.getTopTags()).thenReturn(mockTopTags);

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get("/api/tags/top")
                        .contentType(MediaType.APPLICATION_JSON)).andExpect(status().isOk())
                        .andExpect(jsonPath("$[0].usageCount").value(100))
                        .andExpect(jsonPath("$[1].title").value("Spring"))
                        .andExpect(jsonPath("$.size()").value(3));

        verify(tagService).getTopTags();
    }

}
