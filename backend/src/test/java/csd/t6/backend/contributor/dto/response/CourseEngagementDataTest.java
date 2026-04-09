package csd.t6.backend.contributor.dto.response;

import static org.assertj.core.api.Assertions.assertThat;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import java.util.Set;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class CourseEngagementDataTest {

    private Validator validator;

    @BeforeEach
    void setUp() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @Test
    @DisplayName("Should create valid course engagement data")
    void shouldCreateValidCourseEngagementData() {
        CourseEngagementData data = new CourseEngagementData(10, 5, 3);

        assertThat(data.enrolled()).isEqualTo(10);
        assertThat(data.active()).isEqualTo(5);
        assertThat(data.completed()).isEqualTo(3);
    }

    @Test
    @DisplayName("Should create engagement data with zero values")
    void shouldCreateEngagementDataWithZeroValues() {
        CourseEngagementData data = new CourseEngagementData(0, 0, 0);

        Set<ConstraintViolation<CourseEngagementData>> violations = validator.validate(data);

        assertThat(violations).isEmpty();
        assertThat(data.enrolled()).isEqualTo(0);
        assertThat(data.active()).isEqualTo(0);
        assertThat(data.completed()).isEqualTo(0);
    }

    @Test
    @DisplayName("Should handle large numbers")
    void shouldHandleLargeNumbers() {
        CourseEngagementData data = new CourseEngagementData(1000000, 500000, 250000);

        assertThat(data.enrolled()).isEqualTo(1000000);
        assertThat(data.active()).isEqualTo(500000);
        assertThat(data.completed()).isEqualTo(250000);
    }

    @Test
    @DisplayName("Should handle enrolled equal to active and completed")
    void shouldHandleEnrolledEqualToActiveAndCompleted() {
        CourseEngagementData data = new CourseEngagementData(10, 10, 0);

        assertThat(data.enrolled()).isEqualTo(10);
        assertThat(data.active()).isEqualTo(10);
        assertThat(data.completed()).isEqualTo(0);
    }

    @Test
    @DisplayName("Should handle completed equal to enrolled")
    void shouldHandleCompletedEqualToEnrolled() {
        CourseEngagementData data = new CourseEngagementData(10, 0, 10);

        assertThat(data.enrolled()).isEqualTo(10);
        assertThat(data.active()).isEqualTo(0);
        assertThat(data.completed()).isEqualTo(10);
    }

    @Test
    @DisplayName("Should handle typical engagement scenario")
    void shouldHandleTypicalEngagementScenario() {
        CourseEngagementData data = new CourseEngagementData(100, 45, 30);

        assertThat(data.enrolled()).isEqualTo(100);
        assertThat(data.active()).isEqualTo(45);
        assertThat(data.completed()).isEqualTo(30);
    }

    @Test
    @DisplayName("Should handle high completion rate")
    void shouldHandleHighCompletionRate() {
        CourseEngagementData data = new CourseEngagementData(50, 5, 40);

        assertThat(data.enrolled()).isEqualTo(50);
        assertThat(data.active()).isEqualTo(5);
        assertThat(data.completed()).isEqualTo(40);
    }

    @Test
    @DisplayName("Should handle low engagement")
    void shouldHandleLowEngagement() {
        CourseEngagementData data = new CourseEngagementData(20, 2, 1);

        assertThat(data.enrolled()).isEqualTo(20);
        assertThat(data.active()).isEqualTo(2);
        assertThat(data.completed()).isEqualTo(1);
    }

    @Test
    @DisplayName("Should handle no active users")
    void shouldHandleNoActiveUsers() {
        CourseEngagementData data = new CourseEngagementData(15, 0, 10);

        assertThat(data.enrolled()).isEqualTo(15);
        assertThat(data.active()).isEqualTo(0);
        assertThat(data.completed()).isEqualTo(10);
    }

    @Test
    @DisplayName("Should handle no completions yet")
    void shouldHandleNoCompletionsYet() {
        CourseEngagementData data = new CourseEngagementData(25, 20, 0);

        assertThat(data.enrolled()).isEqualTo(25);
        assertThat(data.active()).isEqualTo(20);
        assertThat(data.completed()).isEqualTo(0);
    }
}
