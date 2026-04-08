package csd.t6.backend.learner;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.web.WebAppConfiguration;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import com.fasterxml.jackson.databind.ObjectMapper;

import csd.t6.backend.learner.dto.response.LearnerAnalyticsResponse;
import csd.t6.backend.learner.dto.response.UserEnrolledLessonsResponse;
import csd.t6.jooq.public_.enums.LearnerCourseStatus;
import csd.t6.jooq.public_.tables.records.LearnerCourseRecord;

/**
 * Integration tests for LearnerAnalyticsController and LearnerLessonController.
 * Uses MockitoBean to avoid real DB calls while exercising the full Spring MVC layer.
 */
@SpringBootTest
@WebAppConfiguration
@ActiveProfiles("test")
@Transactional
class LearnerControllerTest {

    @Autowired
    private WebApplicationContext context;

    private MockMvc mockMvc;

    @MockitoBean
    private LearnerAnalyticsService learnerAnalyticsService;

    @MockitoBean
    private LearnerLessonService learnerLessonService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context).build();
    }

    // ---- LearnerAnalyticsController ----

    @Test
    @DisplayName("GET /api/learner/analytics - should return analytics response")
    void shouldReturnAnalyticsResponse() throws Exception {
        UUID userId = UUID.randomUUID();
        LearnerAnalyticsResponse analyticsResponse = new LearnerAnalyticsResponse(
                List.of(1, 0, 1, 1, 0, 1, 0), 4, 57, 3, 7);

        when(learnerAnalyticsService.getAnalytics(any(UUID.class))).thenReturn(analyticsResponse);

        mockMvc.perform(get("/api/learner/analytics")
                        .with(SecurityMockMvcRequestPostProcessors.user(userId.toString())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.activeDays").value(4))
                .andExpect(jsonPath("$.focusScore").value(57))
                .andExpect(jsonPath("$.completedCoursesCount").value(3))
                .andExpect(jsonPath("$.currentStreak").value(7))
                .andExpect(jsonPath("$.weeklyCadence").isArray());
    }

    @Test
    @DisplayName("GET /api/learner/analytics - should return zeros when no activity")
    void shouldReturnZeroAnalyticsWhenNoActivity() throws Exception {
        LearnerAnalyticsResponse emptyResponse = new LearnerAnalyticsResponse(
                List.of(0, 0, 0, 0, 0, 0, 0), 0, 0, 0, 0);

        when(learnerAnalyticsService.getAnalytics(any(UUID.class))).thenReturn(emptyResponse);

        mockMvc.perform(get("/api/learner/analytics")
                        .with(SecurityMockMvcRequestPostProcessors.user("user")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.activeDays").value(0))
                .andExpect(jsonPath("$.focusScore").value(0))
                .andExpect(jsonPath("$.currentStreak").value(0));
    }

    // ---- LearnerLessonController ----

    @Test
    @DisplayName("GET /api/learner/lesson/enrolled - should return enrolled lessons")
    void shouldReturnEnrolledLessons() throws Exception {
        UserEnrolledLessonsResponse response = new UserEnrolledLessonsResponse(List.of());
        when(learnerLessonService.getEnrolledLessons(any(UUID.class))).thenReturn(response);

        mockMvc.perform(get("/api/learner/lesson/enrolled")
                        .with(SecurityMockMvcRequestPostProcessors.user("user")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.enrolledLessons").isArray());
    }

    @Test
    @DisplayName("POST /api/learner/lesson/{courseId}/enroll - should enroll user")
    void shouldEnrollUser() throws Exception {
        UUID courseId = UUID.randomUUID();
        UUID lessonSessionId = UUID.randomUUID();

        LearnerCourseRecord mockRecord = mock(LearnerCourseRecord.class);
        lenient().when(mockRecord.getCourseId()).thenReturn(courseId);
        lenient().when(mockRecord.getId()).thenReturn(lessonSessionId);
        lenient().when(mockRecord.getMetadata()).thenReturn(null);

        when(learnerLessonService.enrollToCourse(eq(courseId), any(UUID.class))).thenReturn(mockRecord);

        mockMvc.perform(post("/api/learner/lesson/{courseId}/enroll", courseId)
                        .with(SecurityMockMvcRequestPostProcessors.user("user")))
                .andExpect(status().isOk());

        verify(learnerLessonService).enrollToCourse(eq(courseId), any(UUID.class));
    }

    @Test
    @DisplayName("POST /api/learner/lesson/{lessonId}/drop - should drop course")
    void shouldDropCourse() throws Exception {
        UUID lessonId = UUID.randomUUID();

        mockMvc.perform(post("/api/learner/lesson/{lessonId}/drop", lessonId)
                        .with(SecurityMockMvcRequestPostProcessors.user("user")))
                .andExpect(status().isOk());

        verify(learnerLessonService).dropCourse(lessonId);
    }

    @Test
    @DisplayName("POST /api/learner/lesson/{lessonId}/complete - should complete lesson")
    void shouldCompleteLesson() throws Exception {
        UUID lessonId = UUID.randomUUID();
        UUID courseId = UUID.randomUUID();

        LearnerCourseRecord mockRecord = mock(LearnerCourseRecord.class);
        lenient().when(mockRecord.getCourseId()).thenReturn(courseId);
        lenient().when(mockRecord.getId()).thenReturn(lessonId);
        lenient().when(mockRecord.getStatus()).thenReturn(LearnerCourseStatus.COMPLETED);
        lenient().when(mockRecord.getMetadata()).thenReturn(null);

        when(learnerLessonService.completeLesson(lessonId)).thenReturn(mockRecord);

        mockMvc.perform(post("/api/learner/lesson/{lessonId}/complete", lessonId)
                        .with(SecurityMockMvcRequestPostProcessors.user("user")))
                .andExpect(status().isOk());

        verify(learnerLessonService).completeLesson(lessonId);
    }

    @Test
    @DisplayName("PUT /api/learner/lesson/{lessonId}/metadata - should update metadata")
    void shouldUpdateMetadata() throws Exception {
        UUID lessonId = UUID.randomUUID();
        UUID courseId = UUID.randomUUID();

        LearnerCourseRecord mockRecord = mock(LearnerCourseRecord.class);
        lenient().when(mockRecord.getCourseId()).thenReturn(courseId);
        lenient().when(mockRecord.getId()).thenReturn(lessonId);
        lenient().when(mockRecord.getMetadata()).thenReturn(null);

        when(learnerLessonService.updateLessonSessionMetadata(eq(lessonId), any(UUID.class), any()))
                .thenReturn(mockRecord);

        String body = objectMapper.writeValueAsString(
                new csd.t6.backend.learner.dto.request.UpdateLessonSessionRequest(
                        java.util.Map.of("progress", 50)));

        mockMvc.perform(put("/api/learner/lesson/{lessonId}/metadata", lessonId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body)
                        .with(SecurityMockMvcRequestPostProcessors.user("user")))
                .andExpect(status().isOk());

        verify(learnerLessonService).updateLessonSessionMetadata(eq(lessonId), any(UUID.class), any());
    }

    @Test
    @DisplayName("PUT /api/learner/lesson/{lessonId}/metadata - should reject null metadata")
    void shouldRejectNullMetadata() throws Exception {
        UUID lessonId = UUID.randomUUID();

        String body = "{\"metadata\": null}";

        mockMvc.perform(put("/api/learner/lesson/{lessonId}/metadata", lessonId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body)
                        .with(SecurityMockMvcRequestPostProcessors.user("user")))
                .andExpect(status().isBadRequest());
    }
}