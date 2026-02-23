package csd.t6.backend.team;

import static csd.t6.jooq.public_.tables.Team.TEAM;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.jooq.DSLContext;
import org.springframework.stereotype.Repository;

import csd.t6.backend.utils.BaseRepository;
import csd.t6.jooq.public_.tables.records.TeamRecord;

@Repository
public class TeamRepository extends BaseRepository<TeamRecord> {
  public TeamRepository(DSLContext dsl) {
    super(dsl, TEAM);
  }

  public TeamRecord create(String name, String description, UUID ownerId) {
    return dsl.insertInto(TEAM).set(TEAM.NAME, name).set(TEAM.DESCRIPTION, description).set(TEAM.OWNER_ID, ownerId)
        .returning().fetchOne();
  }

  public Optional<TeamRecord> findById(UUID teamId) {
    return this.findOneBy(TEAM.ID, teamId);
  }

  public TeamRecord update(UUID teamId, String name, String description) {
    return dsl.update(TEAM).set(TEAM.NAME, name).set(TEAM.DESCRIPTION, description).where(TEAM.ID.eq(teamId))
        .returning().fetchOne();
  }

  public void delete(UUID teamId) {
    super.delete(TEAM.ID, teamId);
  }

  public List<TeamRecord> findByOwnerId(UUID id) {
    return this.findBy(TEAM.OWNER_ID, id);
  }
}