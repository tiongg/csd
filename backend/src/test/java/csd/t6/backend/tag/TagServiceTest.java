package csd.t6.backend.tag;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import csd.t6.backend.exceptions.BadRequestException;
import csd.t6.backend.tag.dto.response.TagResponse;
import csd.t6.jooq.public_.tables.records.TagsRecord;

@ExtendWith(MockitoExtension.class)
class TagServiceTest {

  @Mock
  private TagRepository tagRepository;

  @InjectMocks
  private TagService tagService;

  private UUID courseId;
  private TagsRecord mockTag;
  private UUID tagId;

  @BeforeEach
  void setUp() {
    courseId = UUID.randomUUID();
    tagId = UUID.randomUUID();
    mockTag = mock(TagsRecord.class);
    lenient().when(mockTag.getId()).thenReturn(tagId);
    lenient().when(mockTag.getTitle()).thenReturn("Java");
  }

  // --- getAllTags ---

  @Test
  @DisplayName("Should return all tags as TagResponse")
  void shouldReturnAllTags() {
    when(tagRepository.findAll()).thenReturn(List.of(mockTag));

    List<TagResponse> result = tagService.getAllTags();

    assertThat(result).hasSize(1);
    assertThat(result.get(0).id()).isEqualTo(tagId);
    assertThat(result.get(0).title()).isEqualTo("Java");
  }

  @Test
  @DisplayName("Should return empty list when no tags exist")
  void shouldReturnEmptyListWhenNoTagsExist() {
    when(tagRepository.findAll()).thenReturn(List.of());

    List<TagResponse> result = tagService.getAllTags();

    assertThat(result).isEmpty();
  }

  // --- searchTags ---

  @Test
  @DisplayName("Should search tags by title pattern")
  void shouldSearchTagsByTitle() {
    when(tagRepository.searchByTitle("Java")).thenReturn(List.of(mockTag));

    List<TagResponse> result = tagService.searchTags("Java");

    assertThat(result).hasSize(1);
    assertThat(result.get(0).title()).isEqualTo("Java");
  }

  @Test
  @DisplayName("Should return empty list when search yields no results")
  void shouldReturnEmptyListWhenNoSearchResults() {
    when(tagRepository.searchByTitle("NonExistent")).thenReturn(List.of());

    List<TagResponse> result = tagService.searchTags("NonExistent");

    assertThat(result).isEmpty();
  }

  // --- getTagsForCourse ---

  @Test
  @DisplayName("Should return tags for a specific course")
  void shouldReturnTagsForCourse() {
    List<String> tagTitles = List.of("Java", "Backend", "Spring");
    when(tagRepository.getTagTitlesByCourseId(courseId)).thenReturn(tagTitles);

    List<String> result = tagService.getTagsForCourse(courseId);

    assertThat(result).isEqualTo(tagTitles);
  }

  @Test
  @DisplayName("Should return empty list when course has no tags")
  void shouldReturnEmptyListWhenCourseHasNoTags() {
    when(tagRepository.getTagTitlesByCourseId(courseId)).thenReturn(List.of());

    List<String> result = tagService.getTagsForCourse(courseId);

    assertThat(result).isEmpty();
  }

  // --- updateCourseTags ---

  @Test
  @DisplayName("Should update course tags successfully")
  void shouldUpdateCourseTags() {
    List<String> tagTitles = List.of("Java", "Backend");

    when(tagRepository.findOrCreateByTitle("Java")).thenReturn(mockTag);

    TagsRecord mockTag2 = mock(TagsRecord.class);
    UUID tagId2 = UUID.randomUUID();
    when(mockTag2.getId()).thenReturn(tagId2);
    when(tagRepository.findOrCreateByTitle("Backend")).thenReturn(mockTag2);

    when(tagRepository.getTagTitlesByCourseId(courseId)).thenReturn(tagTitles);

    List<String> result = tagService.updateCourseTags(courseId, tagTitles);

    verify(tagRepository).unlinkAllTagsFromCourse(courseId);
    verify(tagRepository, times(2)).linkCourseToTag(eq(courseId), any());
    assertThat(result).hasSize(2);
  }

  @Test
  @DisplayName("Should throw when tag titles is null")
  void shouldThrowWhenTagTitlesIsNull() {
    assertThatThrownBy(() -> tagService.updateCourseTags(courseId, null)).isInstanceOf(BadRequestException.class)
        .hasMessageContaining("Tag titles cannot be null");
  }

  @Test
  @DisplayName("Should throw when tag count exceeds maximum")
  void shouldThrowWhenTagCountExceedsMaximum() {
    List<String> tooManyTags = List.of("Tag1", "Tag2", "Tag3", "Tag4", "Tag5", "Tag6");

    assertThatThrownBy(() -> tagService.updateCourseTags(courseId, tooManyTags)).isInstanceOf(BadRequestException.class)
        .hasMessageContaining("Maximum 5 tags");
  }

  @Test
  @DisplayName("Should throw when tag title is null")
  void shouldThrowWhenTagTitleIsNull() {
    List<String> tagsWithNull = Arrays.asList("Java", null);

    assertThatThrownBy(() -> tagService.updateCourseTags(courseId, tagsWithNull))
        .isInstanceOf(BadRequestException.class).hasMessageContaining("Tag title cannot be empty");
  }

  @Test
  @DisplayName("Should throw when tag title is empty")
  void shouldThrowWhenTagTitleIsEmpty() {
    List<String> tagsWithEmpty = List.of("Java", "");

    assertThatThrownBy(() -> tagService.updateCourseTags(courseId, tagsWithEmpty))
        .isInstanceOf(BadRequestException.class).hasMessageContaining("Tag title cannot be empty");
  }

  @Test
  @DisplayName("Should throw when tag title is only whitespace")
  void shouldThrowWhenTagTitleIsWhitespace() {
    List<String> tagsWithWhitespace = List.of("Java", "   ");

    assertThatThrownBy(() -> tagService.updateCourseTags(courseId, tagsWithWhitespace))
        .isInstanceOf(BadRequestException.class).hasMessageContaining("Tag title cannot be empty");
  }

  @Test
  @DisplayName("Should throw when tag title exceeds maximum length")
  void shouldThrowWhenTagTitleExceedsMaxLength() {
    String longTitle = "a".repeat(51);
    List<String> tagsWithLongTitle = List.of("Java", longTitle);

    assertThatThrownBy(() -> tagService.updateCourseTags(courseId, tagsWithLongTitle))
        .isInstanceOf(BadRequestException.class).hasMessageContaining("must not exceed 50 characters");
  }

  @Test
  @DisplayName("Should trim whitespace from tag titles")
  void shouldTrimWhitespaceFromTagTitles() {
    List<String> tagsWithWhitespace = List.of("  Java  ", "Backend  ");

    when(tagRepository.findOrCreateByTitle("Java")).thenReturn(mockTag);

    TagsRecord mockTag2 = mock(TagsRecord.class);
    when(mockTag2.getId()).thenReturn(UUID.randomUUID());
    when(tagRepository.findOrCreateByTitle("Backend")).thenReturn(mockTag2);

    when(tagRepository.getTagTitlesByCourseId(courseId)).thenReturn(List.of("Java", "Backend"));

    tagService.updateCourseTags(courseId, tagsWithWhitespace);

    verify(tagRepository).findOrCreateByTitle("Java");
    verify(tagRepository).findOrCreateByTitle("Backend");
  }

  @Test
  @DisplayName("Should reuse existing tags (case-insensitive)")
  void shouldReuseExistingTags() {
    List<String> tags = List.of("Java", "Backend");

    when(tagRepository.findOrCreateByTitle("Java")).thenReturn(mockTag);
    when(tagRepository.findOrCreateByTitle("Backend")).thenReturn(mockTag);

    when(tagRepository.getTagTitlesByCourseId(courseId)).thenReturn(tags);

    tagService.updateCourseTags(courseId, tags);

    verify(tagRepository, never()).findOrCreateByTitle("java");
    verify(tagRepository).findOrCreateByTitle("Java");
  }
}