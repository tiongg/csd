package csd.t6.backend.course;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

@Repository
public class CourseRepository {
  private final JdbcTemplate jdbcTemplate;

  public CourseRepository(JdbcTemplate jdbcTemplate) {
    this.jdbcTemplate = jdbcTemplate;
  }

  private static final RowMapper<Course> COURSE_ROW_MAPPER = (rs, rowNum) -> {
    Course course = new Course();
    course.setId(UUID.fromString(rs.getString("id")));
    course.setTitle(rs.getString("title"));
    course.setDescription(rs.getString("description"));
    course.setCreatorId(UUID.fromString(rs.getString("creator_id")));
    
    String teamIdStr = rs.getString("team_id");
    if (teamIdStr != null) {
      course.setTeamId(UUID.fromString(teamIdStr));
    }
    
    course.setIsPublished(rs.getBoolean("is_published"));
    course.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime().atOffset(java.time.ZoneOffset.UTC));
    course.setUpdatedAt(rs.getTimestamp("updated_at").toLocalDateTime().atOffset(java.time.ZoneOffset.UTC));
    return course;
  };

  public Course create(String title, String description, UUID creatorId, UUID teamId) {
    UUID id = UUID.randomUUID();
    jdbcTemplate.update(
        "INSERT INTO courses.course (id, title, description, creator_id, team_id, is_published) VALUES (?, ?, ?, ?, ?, ?)",
        id, title, description, creatorId, teamId, false);
    return findById(id).orElseThrow();
  }

  public Optional<Course> findById(UUID id) {
    List<Course> results = jdbcTemplate.query(
        "SELECT * FROM courses.course WHERE id = ?",
        COURSE_ROW_MAPPER,
        id);
    return results.isEmpty() ? Optional.empty() : Optional.of(results.get(0));
  }

  public List<Course> findAll() {
    return jdbcTemplate.query("SELECT * FROM courses.course", COURSE_ROW_MAPPER);
  }

  public Course update(UUID id, String title, String description, UUID teamId, Boolean isPublished) {
    Course existing = findById(id).orElseThrow();
    
    String newTitle = title != null ? title : existing.getTitle();
    String newDescription = description != null ? description : existing.getDescription();
    UUID newTeamId = teamId != null ? teamId : existing.getTeamId();
    Boolean newIsPublished = isPublished != null ? isPublished : existing.getIsPublished();
    
    jdbcTemplate.update(
        "UPDATE courses.course SET title = ?, description = ?, team_id = ?, is_published = ? WHERE id = ?",
        newTitle, newDescription, newTeamId, newIsPublished, id);
    
    return findById(id).orElseThrow();
  }

  public void delete(UUID id) {
    jdbcTemplate.update("DELETE FROM courses.course WHERE id = ?", id);
  }
}