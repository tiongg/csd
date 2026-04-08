package csd.t6.backend.contributor;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import org.jooq.Record2;
import org.jooq.Record3;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import csd.t6.backend.account.AccountRepository;
import csd.t6.backend.course.CourseRepository;
import csd.t6.backend.team.TeamRepository;
import csd.t6.jooq.accounts.tables.records.AccountRecord;
import csd.t6.jooq.public_.enums.LearnerCourseStatus;
import csd.t6.jooq.public_.tables.records.CourseRecord;
import csd.t6.jooq.public_.tables.records.LearnerCourseRecord;
import csd.t6.jooq.public_.tables.records.TeamRecord;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class ContributorAnalyticsRepositoryTest {

    @Autowired
    private ContributorAnalyticsRepository contributorAnalyticsRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private TeamRepository teamRepository;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private csd.t6.backend.learner.LearnerCourseRepository learnerCourseRepository;

    private AccountRecord contributor;
    private AccountRecord learner1;
    private AccountRecord learner2;
    private TeamRecord team;
    private CourseRecord course1;
    private CourseRecord course2;
    private OffsetDateTime testTime;

    @BeforeEach
    void setUp() {
        testTime = OffsetDateTime.now().minusDays(1);

        contributor = accountRepository.insert("contributor@test.com", "contributor", "hash", "Contributor Name");
        learner1 = accountRepository.insert("learner1@test.com", "learner1", "hash", "Learner One");
        learner2 = accountRepository.insert("learner2@test.com", "learner2", "hash", "Learner Two");

        team = teamRepository.create("Test Team", null, contributor.getId());

        course1 = courseRepository.create("Course 1", "Description 1", contributor.getId(), team.getId(), "Others");
        course2 = courseRepository.create("Course 2", "Description 2", contributor.getId(), team.getId(), "Others");

        // Create learner course records
        LearnerCourseRecord learnerCourse1 = new LearnerCourseRecord();
        learnerCourse1.setId(UUID.randomUUID());
        learnerCourse1.setUserId(learner1.getId());
        learnerCourse1.setCourseId(course1.getId());
        learnerCourse1.setStatus(LearnerCourseStatus.ENROLLED);
        learnerCourse1.setEnrolledAt(testTime.minusHours(1).toLocalDateTime());
        learnerCourse1.setMetadata(org.jooq.JSONB.valueOf("{}"));
        learnerCourseRepository.save(learnerCourse1);

        LearnerCourseRecord learnerCourse2 = new LearnerCourseRecord();
        learnerCourse2.setId(UUID.randomUUID());
        learnerCourse2.setUserId(learner2.getId());
        learnerCourse2.setCourseId(course1.getId());
        learnerCourse2.setStatus(LearnerCourseStatus.COMPLETED);
        learnerCourse2.setEnrolledAt(testTime.minusHours(2).toLocalDateTime());
        learnerCourse2.setCompletedAt(testTime.minusMinutes(30).toLocalDateTime());
        learnerCourse2.setMetadata(org.jooq.JSONB.valueOf("{}"));
        learnerCourseRepository.save(learnerCourse2);
    }

    @Test
    @DisplayName("Should count enrollments by contributor")
    void shouldCountEnrollmentsByContributor() {
        int count = contributorAnalyticsRepository.countEnrollmentsByContributor(contributor.getId(), testTime);

        assertThat(count).isGreaterThanOrEqualTo(2);
    }

    @Test
    @DisplayName("Should count completions by contributor")
    void shouldCountCompletionsByContributor() {
        int count = contributorAnalyticsRepository.countCompletionsByContributor(contributor.getId(), testTime);

        assertThat(count).isGreaterThanOrEqualTo(1);
    }

    @Test
    @DisplayName("Should count active learners by contributor")
    void shouldCountActiveLearnersByContributor() {
        int count = contributorAnalyticsRepository.countActiveLearnersByContributor(contributor.getId(), testTime);

        assertThat(count).isGreaterThanOrEqualTo(0);
    }

    @Test
    @DisplayName("Should get course update counts by contributor")
    void shouldGetCourseUpdateCountsByContributor() {
        List<Record2<OffsetDateTime, Integer>> counts = contributorAnalyticsRepository
                .getCourseUpdateCountsByContributor(contributor.getId(), testTime);

        assertThat(counts).isNotNull();
        assertThat(counts.size()).isGreaterThan(0);
    }

    @Test
    @DisplayName("Should get enrollment counts by date")
    void shouldGetEnrollmentCountsByDate() {
        List<Record3<java.time.LocalDateTime, Integer, Integer>> counts = contributorAnalyticsRepository
                .getEnrollmentCountsByDate(contributor.getId(), testTime);

        assertThat(counts).isNotNull();
        assertThat(counts.size()).isGreaterThan(0);
    }

    @Test
    @DisplayName("Should get contributor course IDs")
    void shouldGetContributorCourseIds() {
        List<UUID> courseIds = contributorAnalyticsRepository.getContributorCourseIds(contributor.getId());

        assertThat(courseIds).hasSizeGreaterThanOrEqualTo(2);
        assertThat(courseIds).contains(course1.getId(), course2.getId());
    }

    @Test
    @DisplayName("Should return zero counts for contributor with no courses")
    void shouldReturnZeroCountsWithoutCourses() {
        AccountRecord newContributor = accountRepository.insert("newcontrib@test.com", "newcontrib", "hash");

        int enrollments = contributorAnalyticsRepository.countEnrollmentsByContributor(newContributor.getId(), testTime);
        int completions = contributorAnalyticsRepository.countCompletionsByContributor(newContributor.getId(), testTime);
        int active = contributorAnalyticsRepository.countActiveLearnersByContributor(newContributor.getId(), testTime);

        assertThat(enrollments).isEqualTo(0);
        assertThat(completions).isEqualTo(0);
        assertThat(active).isEqualTo(0);
    }
}
