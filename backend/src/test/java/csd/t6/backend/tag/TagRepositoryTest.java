package csd.t6.backend.tag;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import java.util.Optional;

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
import csd.t6.jooq.public_.tables.records.CourseRecord;
import csd.t6.jooq.public_.tables.records.TagsRecord;
import csd.t6.jooq.public_.tables.records.TeamRecord;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class TagRepositoryTest {

    @Autowired
    private TagRepository tagRepository;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private TeamRepository teamRepository;

    private AccountRecord testAccount;
    private TeamRecord testTeam;
    private CourseRecord testCourse;
    private TagsRecord testTag;

    @BeforeEach
    void setUp() {
        testAccount = accountRepository.insert("tagtest@example.com", "taguser", "hash", "Tag User");
        testTeam = teamRepository.create("Tag Test Team", null, testAccount.getId());
        testCourse = courseRepository.create("Tag Course", "Test Description", testAccount.getId(), testTeam.getId(),
                "Others");
        testTag = tagRepository.findOrCreateByTitle("Test Tag");
    }

    @Test
    @DisplayName("Should find tag by title")
    void shouldFindTagByTitle() {
        Optional<TagsRecord> found = tagRepository.findByTitle("Test Tag");

        assertThat(found).isPresent();
        assertThat(found.get().getTitle()).isEqualTo("Test Tag");
    }

    @Test
    @DisplayName("Should return empty for non-existent tag")
    void shouldReturnEmptyForNonExistentTag() {
        Optional<TagsRecord> found = tagRepository.findByTitle("Non Existent Tag");

        assertThat(found).isEmpty();
    }

    @Test
    @DisplayName("Should create new tag if not exists")
    void shouldCreateNewTagIfNotExists() {
        TagsRecord newTag = tagRepository.findOrCreateByTitle("New Tag");

        assertThat(newTag).isNotNull();
        assertThat(newTag.getId()).isNotNull();
        assertThat(newTag.getTitle()).isEqualTo("New Tag");
    }

    @Test
    @DisplayName("Should return existing tag if already exists")
    void shouldReturnExistingTagIfExists() {
        TagsRecord existingTag = tagRepository.findOrCreateByTitle("Test Tag");

        assertThat(existingTag).isNotNull();
        assertThat(existingTag.getId()).isEqualTo(testTag.getId());
    }


    @Test
    @DisplayName("Should unlink course from tag")
    void shouldUnlinkCourseFromTag() {
        tagRepository.linkCourseToTag(testCourse.getId(), testTag.getId());
        tagRepository.unlinkCourseFromTag(testCourse.getId(), testTag.getId());

        List<TagsRecord> courseTags = tagRepository.getTagsByCourseId(testCourse.getId());

        assertThat(courseTags).doesNotContain(testTag);
    }

    @Test
    @DisplayName("Should unlink all tags from course")
    void shouldUnlinkAllTagsFromCourse() {
        tagRepository.linkCourseToTag(testCourse.getId(), testTag.getId());
        tagRepository.unlinkAllTagsFromCourse(testCourse.getId());

        List<TagsRecord> courseTags = tagRepository.getTagsByCourseId(testCourse.getId());

        assertThat(courseTags).isEmpty();
    }

    @Test
    @DisplayName("Should get tag titles for course")
    void shouldGetTagTitlesForCourse() {
        tagRepository.linkCourseToTag(testCourse.getId(), testTag.getId());

        List<String> tagTitles = tagRepository.getTagTitlesByCourseId(testCourse.getId());

        assertThat(tagTitles).contains("Test Tag");
    }

    @Test
    @DisplayName("Should get all tags")
    void shouldGetAllTags() {
        tagRepository.findOrCreateByTitle("Another Tag");

        List<TagsRecord> allTags = tagRepository.findAll();

        assertThat(allTags).hasSizeGreaterThanOrEqualTo(2);
        assertThat(allTags).anyMatch(tag -> "Test Tag".equals(tag.getTitle()));
        assertThat(allTags).anyMatch(tag -> "Another Tag".equals(tag.getTitle()));
    }



    @Test
    @DisplayName("Should search tags case-insensitively")
    void shouldSearchTagsCaseInsensitively() {
        tagRepository.findOrCreateByTitle("CaseSensitive Tag");

        List<TagsRecord> searchResultsLower = tagRepository.searchByTitle("casesensitive");
        List<TagsRecord> searchResultsMixed = tagRepository.searchByTitle("CaseSensitive");

        assertThat(searchResultsLower).isNotEmpty();
        assertThat(searchResultsMixed).isNotEmpty();
    }

    @Test
    @DisplayName("Should get tags by usage count")
    void shouldGetTagsByUsageCount() {
        // Create multiple courses and link them to the test tag
        CourseRecord course2 = courseRepository.create("Course 2", "Description 2", testAccount.getId(),
                testTeam.getId(), "Others");
        CourseRecord course3 = courseRepository.create("Course 3", "Description 3", testAccount.getId(),
                testTeam.getId(), "Others");

        tagRepository.linkCourseToTag(course2.getId(), testTag.getId());
        tagRepository.linkCourseToTag(course3.getId(), testTag.getId());

        List<TagRepository.TagUsageRecord> usageRecords = tagRepository.getTagsByUsageCount();

        assertThat(usageRecords).isNotEmpty();
        assertThat(usageRecords).anyMatch(record -> testTag.getId().equals(record.id));
        assertThat(usageRecords).anyMatch(record -> record.usageCount >= 2);
    }

    @Test
    @DisplayName("Should handle search with special characters")
    void shouldHandleSearchWithSpecialCharacters() {
        tagRepository.findOrCreateByTitle("C# & Java");

        List<TagsRecord> searchResults = tagRepository.searchByTitle("C#");

        assertThat(searchResults).isNotEmpty();
        assertThat(searchResults.get(0).getTitle()).contains("C#");
    }
}
