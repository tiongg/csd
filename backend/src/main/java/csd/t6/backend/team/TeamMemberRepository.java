package csd.t6.backend.team;

import static csd.t6.jooq.public_.tables.TeamMember.TEAM_MEMBER;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.jooq.DSLContext;
import org.springframework.stereotype.Repository;

import csd.t6.jooq.public_.enums.TeamRole;
import csd.t6.jooq.public_.tables.records.TeamMemberRecord;

@Repository
public class TeamMemberRepository {
  private final DSLContext dsl;

  public TeamMemberRepository(DSLContext dsl) {
    this.dsl = dsl;
  }

  public TeamMemberRecord addMember(UUID teamId, UUID accountId, TeamRole role) {
    return dsl.insertInto(TEAM_MEMBER).set(TEAM_MEMBER.TEAM_ID, teamId).set(TEAM_MEMBER.ACCOUNT_ID, accountId)
        .set(TEAM_MEMBER.TEAM_ROLE, role).returning().fetchOne();
  }

  public Optional<TeamMemberRecord> findByTeamAndAccount(UUID teamId, UUID accountId) {
    return dsl.selectFrom(TEAM_MEMBER).where(TEAM_MEMBER.TEAM_ID.eq(teamId)).and(TEAM_MEMBER.ACCOUNT_ID.eq(accountId))
        .fetchOptional();
  }

  public List<TeamMemberRecord> findByTeamId(UUID teamId) {
    return dsl.selectFrom(TEAM_MEMBER).where(TEAM_MEMBER.TEAM_ID.eq(teamId)).fetch();
  }

  public List<TeamMemberRecord> findByAccountId(UUID accountId) {
    return dsl.selectFrom(TEAM_MEMBER).where(TEAM_MEMBER.ACCOUNT_ID.eq(accountId)).fetch();
  }

  public void removeMember(UUID teamId, UUID accountId) {
    dsl.deleteFrom(TEAM_MEMBER).where(TEAM_MEMBER.TEAM_ID.eq(teamId)).and(TEAM_MEMBER.ACCOUNT_ID.eq(accountId))
        .execute();
  }

  public void updateRole(UUID teamId, UUID accountId, TeamRole newRole) {
    dsl.update(TEAM_MEMBER).set(TEAM_MEMBER.TEAM_ROLE, newRole).where(TEAM_MEMBER.TEAM_ID.eq(teamId))
        .and(TEAM_MEMBER.ACCOUNT_ID.eq(accountId)).execute();
  }
}