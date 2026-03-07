package csd.t6.backend.team;

import static csd.t6.jooq.public_.tables.TeamMember.TEAM_MEMBER;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.jooq.DSLContext;
import org.springframework.stereotype.Repository;

import csd.t6.backend.utils.BaseRepository;
import csd.t6.jooq.public_.enums.TeamRole;
import csd.t6.jooq.public_.tables.records.TeamMemberRecord;

@Repository
public class TeamMemberRepository extends BaseRepository<TeamMemberRecord> {
  public TeamMemberRepository(DSLContext dsl) {
    super(dsl, TEAM_MEMBER);
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
    return this.findBy(TEAM_MEMBER.TEAM_ID, teamId);
  }

  public List<TeamMemberRecord> findByAccountId(UUID accountId) {
    return this.findBy(TEAM_MEMBER.ACCOUNT_ID, accountId);
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