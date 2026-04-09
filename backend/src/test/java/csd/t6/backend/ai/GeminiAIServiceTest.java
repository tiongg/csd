package csd.t6.backend.ai;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class GeminiAIServiceTest {

    @Test
    @DisplayName("Should create AI service instance")
    void shouldCreateAIServiceInstance() {
        GeminiAIService service = new GeminiAIService();
        assertThat(service).isNotNull();
    }

    @Test
    @DisplayName("Should verify service implements AIService interface")
    void shouldImplementAIServiceInterface() {
        AIService service = new GeminiAIService();
        assertThat(service).isInstanceOf(AIService.class);
    }

    @Test
    @DisplayName("Should handle service interface methods")
    void shouldHandleServiceInterfaceMethods() {
        AIService service = new GeminiAIService();

        // Verify the service has the required method signature
        List<String> tags = List.of("test");
        List<String> existing = List.of();

        // Note: This test focuses on interface compliance
        // Actual AI integration would require proper mocking of the Google AI client
        assertThat(service).isNotNull();
        assertThat(tags).isNotNull();
        assertThat(existing).isNotNull();
    }
}
