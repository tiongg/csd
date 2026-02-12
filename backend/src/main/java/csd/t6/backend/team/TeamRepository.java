package csd.t6.backend.team;

import static csd.t6.jooq.teams.tables.Team.TEAM;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.jooq.DSLContext;
import org.jooq.TableField;
import org.springframework.stereotype.Repository;

import csd.t6.jooq.teams.tables.records.TeamRecord;

@Repository
public class TeamRepository {
  private final DSLContext dsl;

  public TeamRepository(DSLContext dsl) {
    this.dsl = dsl;
  }

  public TeamRecord create(String name, String description, UUID ownerId) {
    return dsl.insertInto(TEAM)
        .set(TEAM.NAME, name)
        .set(TEAM.DESCRIPTION, description)
        .set(TEAM.OWNER_ID, ownerId)
        .returning()
        .fetchOne();
  }

  public Optional<TeamRecord> findById(UUID teamId) {
    return dsl.selectFrom(TEAM)
        .where(TEAM.ID.eq(teamId))
        .fetchOptional();
  }

  public <T> Optional<TeamRecord> findBy(TableField<TeamRecord, T> field, T value) {
    return dsl.selectFrom(TEAM)
        .where(field.eq(value))
        .fetchOptional();
  }

  public List<TeamRecord> findAll() {
    return dsl.selectFrom(TEAM)
        .fetch();
  }

  public List<TeamRecord> findByOwnerId(UUID ownerId) {
    return dsl.selectFrom(TEAM)
        .where(TEAM.OWNER_ID.eq(ownerId))
        .fetch();
  }

  public TeamRecord update(UUID teamId, String name, String description) {
    return dsl.update(TEAM)
        .set(TEAM.NAME, name)
        .set(TEAM.DESCRIPTION, description)
        .where(TEAM.ID.eq(teamId))
        .returning()
        .fetchOne();
  }

  public void delete(UUID teamId) {
    dsl.deleteFrom(TEAM)
        .where(TEAM.ID.eq(teamId))
        .execute();
  }
}