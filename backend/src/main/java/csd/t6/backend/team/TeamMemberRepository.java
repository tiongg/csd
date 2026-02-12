package csd.t6.backend.team;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

@Repository
public class TeamMemberRepository {
  private final JdbcTemplate jdbcTemplate;

  public TeamMemberRepository(JdbcTemplate jdbcTemplate) {
    this.jdbcTemplate = jdbcTemplate;
  }

  private static final RowMapper<TeamMember> MEMBER_ROW_MAPPER = (rs, rowNum) -> {
    TeamMember member = new TeamMember();
    member.setId(UUID.fromString(rs.getString("id")));
    member.setTeamId(UUID.fromString(rs.getString("team_id")));
    member.setAccountId(UUID.fromString(rs.getString("account_id")));
    member.setTeamRole(rs.getString("team_role"));
    member.setJoinedAt(rs.getTimestamp("joined_at").toLocalDateTime().atOffset(java.time.ZoneOffset.UTC));
    return member;
  };

  public TeamMember addMember(UUID teamId, UUID accountId, String role) {
    UUID id = UUID.randomUUID();
    jdbcTemplate.update(
        "INSERT INTO teams.team_member (id, team_id, account_id, team_role) VALUES (?, ?, ?, ?::teams.team_role)",
        id, teamId, accountId, role);
    return findByTeamAndAccount(teamId, accountId).orElseThrow();
  }

  public Optional<TeamMember> findByTeamAndAccount(UUID teamId, UUID accountId) {
    List<TeamMember> results = jdbcTemplate.query(
        "SELECT * FROM teams.team_member WHERE team_id = ? AND account_id = ?",
        MEMBER_ROW_MAPPER,
        teamId, accountId);
    return results.isEmpty() ? Optional.empty() : Optional.of(results.get(0));
  }

  public List<TeamMember> findByTeamId(UUID teamId) {
    return jdbcTemplate.query(
        "SELECT * FROM teams.team_member WHERE team_id = ?",
        MEMBER_ROW_MAPPER,
        teamId);
  }

  public List<TeamMember> findByAccountId(UUID accountId) {
    return jdbcTemplate.query(
        "SELECT * FROM teams.team_member WHERE account_id = ?",
        MEMBER_ROW_MAPPER,
        accountId);
  }

  public void removeMember(UUID teamId, UUID accountId) {
    jdbcTemplate.update(
        "DELETE FROM teams.team_member WHERE team_id = ? AND account_id = ?",
        teamId, accountId);
  }

  public void updateRole(UUID teamId, UUID accountId, String newRole) {
    jdbcTemplate.update(
        "UPDATE teams.team_member SET team_role = ?::teams.team_role WHERE team_id = ? AND account_id = ?",
        newRole, teamId, accountId);
  }
}