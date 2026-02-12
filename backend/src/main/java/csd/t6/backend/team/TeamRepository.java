package csd.t6.backend.team;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

@Repository
public class TeamRepository {
  private final JdbcTemplate jdbcTemplate;

  public TeamRepository(JdbcTemplate jdbcTemplate) {
    this.jdbcTemplate = jdbcTemplate;
  }

  private static final RowMapper<Team> TEAM_ROW_MAPPER = (rs, rowNum) -> {
    Team team = new Team();
    team.setId(UUID.fromString(rs.getString("id")));
    team.setName(rs.getString("name"));
    team.setDescription(rs.getString("description"));
    team.setOwnerId(UUID.fromString(rs.getString("owner_id")));
    team.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime().atOffset(java.time.ZoneOffset.UTC));
    team.setUpdatedAt(rs.getTimestamp("updated_at").toLocalDateTime().atOffset(java.time.ZoneOffset.UTC));
    return team;
  };

  public Team create(String name, String description, UUID ownerId) {
    UUID id = UUID.randomUUID();
    jdbcTemplate.update(
        "INSERT INTO teams.team (id, name, description, owner_id) VALUES (?, ?, ?, ?)",
        id, name, description, ownerId);
    return findById(id).orElseThrow();
  }

  public Optional<Team> findById(UUID id) {
    List<Team> results = jdbcTemplate.query(
        "SELECT * FROM teams.team WHERE id = ?",
        TEAM_ROW_MAPPER,
        id);
    return results.isEmpty() ? Optional.empty() : Optional.of(results.get(0));
  }

  public List<Team> findAll() {
    return jdbcTemplate.query("SELECT * FROM teams.team", TEAM_ROW_MAPPER);
  }

  public List<Team> findByOwnerId(UUID ownerId) {
    return jdbcTemplate.query(
        "SELECT * FROM teams.team WHERE owner_id = ?",
        TEAM_ROW_MAPPER,
        ownerId);
  }

  public Team update(UUID id, String name, String description) {
    jdbcTemplate.update(
        "UPDATE teams.team SET name = ?, description = ? WHERE id = ?",
        name, description, id);
    return findById(id).orElseThrow();
  }

  public void delete(UUID id) {
    jdbcTemplate.update("DELETE FROM teams.team WHERE id = ?", id);
  }
}