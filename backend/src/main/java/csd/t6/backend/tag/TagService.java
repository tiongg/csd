package csd.t6.backend.tag;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import csd.t6.backend.exceptions.BadRequestException;
import csd.t6.backend.tag.dto.response.TagResponse;
import csd.t6.backend.tag.dto.response.TopTagResponse;
import csd.t6.jooq.public_.tables.records.TagsRecord;

@Service
public class TagService {

  private final TagRepository tagRepository;

  private static final int MAX_TAGS_PER_COURSE = 8;
  private static final int MAX_TAG_TITLE_LENGTH = 50;

  public TagService(TagRepository tagRepository) {
    this.tagRepository = tagRepository;
  }

  /**
   * Get all tags.
   */
  public List<TagResponse> getAllTags() {
    return tagRepository.findAll().stream().map(this::toTagResponse).toList();
  }

  /**
   * Search tags by title pattern.
   */
  public List<TagResponse> searchTags(String search) {
    return tagRepository.searchByTitle(search).stream().map(this::toTagResponse).toList();
  }

  /**
   * Get top 5 most commonly used tags.
   */
  public List<TopTagResponse> getTopTags() {
    return tagRepository.getTagsByUsageCount().stream().limit(5)
        .map(record -> new TopTagResponse(record.id, record.title, record.usageCount)).toList();
  }

  /**
   * Get tags for a specific course.
   */
  public List<String> getTagsForCourse(UUID courseId) {
    return tagRepository.getTagTitlesByCourseId(courseId);
  }

  /**
   * Update tags for a course. Replaces all existing tags with the new list.
   * Validates tag count and title length. Reuses existing tags (case-insensitive)
   * or creates new ones.
   *
   * @return List of tag titles for the course
   */
  public List<String> updateCourseTags(UUID courseId, List<String> tagTitles) {
    // Validate tag titles are not null
    if (tagTitles == null) {
      throw new BadRequestException("Tag titles cannot be null");
    }

    // Validate tag count
    if (tagTitles.size() > MAX_TAGS_PER_COURSE) {
      throw new BadRequestException("Maximum " + MAX_TAGS_PER_COURSE + " tags allowed per course");
    }

    // Validate each tag title
    for (String title : tagTitles) {
      if (title == null || title.trim().isEmpty()) {
        throw new BadRequestException("Tag title cannot be empty");
      }
      if (title.length() > MAX_TAG_TITLE_LENGTH) {
        throw new BadRequestException("Tag title must not exceed " + MAX_TAG_TITLE_LENGTH + " characters");
      }
    }

    // Remove all existing tag associations
    tagRepository.unlinkAllTagsFromCourse(courseId);

    // Add new tag associations
    for (String title : tagTitles) {
      TagsRecord tag = tagRepository.findOrCreateByTitle(title.trim());
      tagRepository.linkCourseToTag(courseId, tag.getId());
    }

    // Return the list of tag titles for the course
    return tagRepository.getTagTitlesByCourseId(courseId);
  }

  /**
   * Convert a TagsRecord to TagResponse.
   */
  private TagResponse toTagResponse(TagsRecord record) {
    return new TagResponse(record.getId(), record.getTitle());
  }
}
