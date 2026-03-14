package csd.t6.backend.course;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import csd.t6.backend.account.AccountRepository;
import csd.t6.backend.team.TeamRepository;
import csd.t6.jooq.accounts.tables.records.AccountRecord;
import csd.t6.jooq.public_.tables.records.CourseRecord;
import csd.t6.jooq.public_.tables.records.TeamRecord;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class CourseRepositoryTest {

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private TeamRepository teamRepository;

    private AccountRecord creator;
    private TeamRecord team;

    @BeforeEach
    void setUp() {
        creator = accountRepository.insert("course_creator@test.com", "coursecreator", "hash");
        team = teamRepository.create("Course Test Team", null, creator.getId());
    }

    @Test
    @DisplayName("Should create course")
    void shouldCreateCourse() {
        CourseRecord course = courseRepository.create("Java Basics", "Learn Java", creator.getId(), team.getId());

        assertThat(course).isNotNull();
        assertThat(course.getId()).isNotNull();
        assertThat(course.getTitle()).isEqualTo("Java Basics");
        assertThat(course.getDescription()).isEqualTo("Learn Java");
        assertThat(course.getCreatorId()).isEqualTo(creator.getId());
        assertThat(course.getTeamId()).isEqualTo(team.getId());
    }

    @Test
    @DisplayName("Should find course by ID")
    void shouldFindById() {
        CourseRecord created = courseRepository.create("Spring Boot", "Spring Boot course", creator.getId(),
                team.getId());

        Optional<CourseRecord> found = courseRepository.findById(created.getId());

        assertThat(found).isPresent();
        assertThat(found.get().getTitle()).isEqualTo("Spring Boot");
    }

    @Test
    @DisplayName("Should return empty when course not found")
    void shouldReturnEmptyWhenNotFound() {
        Optional<CourseRecord> found = courseRepository.findById(UUID.randomUUID());

        assertThat(found).isEmpty();
    }

    @Test
    @DisplayName("Should return all courses")
    void shouldFindAllCourses() {
        courseRepository.create("Course 1", null, creator.getId(), team.getId());
        courseRepository.create("Course 2", null, creator.getId(), team.getId());

        List<CourseRecord> all = courseRepository.findAll();

        assertThat(all).hasSizeGreaterThanOrEqualTo(2);
    }

    @Test
    @DisplayName("Should update course title")
    void shouldUpdateCourseTitle() {
        CourseRecord course = courseRepository.create("Old Title", "Desc", creator.getId(), team.getId());

        CourseRecord updated = courseRepository.update(course.getId(), "New Title", null, null);

        assertThat(updated.getTitle()).isEqualTo("New Title");
        assertThat(updated.getDescription()).isEqualTo("Desc");
    }

    @Test
    @DisplayName("Should delete course")
    void shouldDeleteCourse() {
        CourseRecord course = courseRepository.create("Delete Me", null, creator.getId(), team.getId());

        courseRepository.delete(course.getId());

        assertThat(courseRepository.findById(course.getId())).isEmpty();
    }
}