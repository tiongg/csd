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

class EnrollmentTrendBucketTest {

    private Validator validator;

    @BeforeEach
    void setUp() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @Test
    @DisplayName("Should create valid enrollment trend bucket")
    void shouldCreateValidEnrollmentTrendBucket() {
        EnrollmentTrendBucket bucket = new EnrollmentTrendBucket("Jan 2024", 10, 5);

        assertThat(bucket.label()).isEqualTo("Jan 2024");
        assertThat(bucket.value()).isEqualTo(10);
        assertThat(bucket.attempts()).isEqualTo(5);
    }

    @Test
    @DisplayName("Should create bucket with zero values")
    void shouldCreateBucketWithZeroValues() {
        EnrollmentTrendBucket bucket = new EnrollmentTrendBucket("Jan", 0, 0);

        Set<ConstraintViolation<EnrollmentTrendBucket>> violations = validator.validate(bucket);

        assertThat(violations).isEmpty();
        assertThat(bucket.value()).isEqualTo(0);
        assertThat(bucket.attempts()).isEqualTo(0);
    }

    @Test
    @DisplayName("Should handle large values")
    void shouldHandleLargeValues() {
        EnrollmentTrendBucket bucket = new EnrollmentTrendBucket("Dec 2024", 1000000, 500000);

        assertThat(bucket.value()).isEqualTo(1000000);
        assertThat(bucket.attempts()).isEqualTo(500000);
    }

    @Test
    @DisplayName("Should handle different label formats")
    void shouldHandleDifferentLabelFormats() {
        EnrollmentTrendBucket monthLabel = new EnrollmentTrendBucket("Jan", 5, 2);
        EnrollmentTrendBucket yearLabel = new EnrollmentTrendBucket("2024", 10, 5);
        EnrollmentTrendBucket fullDateLabel = new EnrollmentTrendBucket("15 Jan 2024", 3, 1);

        assertThat(monthLabel.label()).isEqualTo("Jan");
        assertThat(yearLabel.label()).isEqualTo("2024");
        assertThat(fullDateLabel.label()).isEqualTo("15 Jan 2024");
    }

    @Test
    @DisplayName("Should handle value equal to attempts")
    void shouldHandleValueEqualToAttempts() {
        EnrollmentTrendBucket bucket = new EnrollmentTrendBucket("Jan", 10, 10);

        assertThat(bucket.value()).isEqualTo(10);
        assertThat(bucket.attempts()).isEqualTo(10);
    }

    @Test
    @DisplayName("Should handle attempts greater than value")
    void shouldHandleAttemptsGreaterThanValue() {
        EnrollmentTrendBucket bucket = new EnrollmentTrendBucket("Feb", 5, 10);

        assertThat(bucket.value()).isEqualTo(5);
        assertThat(bucket.attempts()).isEqualTo(10);
    }

    @Test
    @DisplayName("Should handle value greater than attempts")
    void shouldHandleValueGreaterThanAttempts() {
        EnrollmentTrendBucket bucket = new EnrollmentTrendBucket("Mar", 10, 5);

        assertThat(bucket.value()).isEqualTo(10);
        assertThat(bucket.attempts()).isEqualTo(5);
    }

    @Test
    @DisplayName("Should handle special characters in labels")
    void shouldHandleSpecialCharactersInLabels() {
        EnrollmentTrendBucket bucket = new EnrollmentTrendBucket("Jan '24", 5, 2);

        assertThat(bucket.label()).isEqualTo("Jan '24");
    }

    @Test
    @DisplayName("Should handle long labels")
    void shouldHandleLongLabels() {
        String longLabel = "January 2024 Week 1";
        EnrollmentTrendBucket bucket = new EnrollmentTrendBucket(longLabel, 8, 3);

        assertThat(bucket.label()).isEqualTo(longLabel);
    }

    @Test
    @DisplayName("Should handle negative attempts")
    void shouldHandleNegativeAttempts() {
        EnrollmentTrendBucket bucket = new EnrollmentTrendBucket("Jan", 5, -2);

        assertThat(bucket.attempts()).isEqualTo(-2);
    }
}
