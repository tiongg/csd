package csd.t6.backend.team;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import csd.t6.backend.account.AccountRepository;
import csd.t6.jooq.accounts.tables.records.AccountRecord;
import csd.t6.jooq.public_.tables.records.TeamRecord;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class TeamRepositoryTest {

    @Autowired
    private TeamRepository teamRepository;

    @Autowired
    private AccountRepository accountRepository;

    private AccountRecord owner;

    @BeforeEach
    void setUp() {
        owner = accountRepository.insert("owner@test.com", "teamowner", "hash");
    }

    @Test
    @DisplayName("Should create team")
    void shouldCreateTeam() {
        TeamRecord team = teamRepository.create("Test Team", "A test team", owner.getId());

        assertThat(team).isNotNull();
        assertThat(team.getId()).isNotNull();
        assertThat(team.getName()).isEqualTo("Test Team");
        assertThat(team.getDescription()).isEqualTo("A test team");
        assertThat(team.getOwnerId()).isEqualTo(owner.getId());
        assertThat(team.getCreatedAt()).isNotNull();
        assertThat(team.getUpdatedAt()).isNotNull();
    }

    @Test
    @DisplayName("Should find team by ID")
    void shouldFindById() {
        TeamRecord created = teamRepository.create("Team A", "Desc", owner.getId());

        Optional<TeamRecord> found = teamRepository.findById(created.getId());

        assertThat(found).isPresent();
        assertThat(found.get().getName()).isEqualTo("Team A");
    }

    @Test
    @DisplayName("Should return empty when team not found by ID")
    void shouldReturnEmptyWhenNotFound() {
        Optional<TeamRecord> found = teamRepository.findById(UUID.randomUUID());

        assertThat(found).isEmpty();
    }

    @Test
    @DisplayName("Should find teams by owner ID")
    void shouldFindByOwnerId() {
        teamRepository.create("Team 1", null, owner.getId());
        teamRepository.create("Team 2", null, owner.getId());

        List<TeamRecord> teams = teamRepository.findByOwnerId(owner.getId());

        assertThat(teams).hasSize(2);
    }

    @Test
    @DisplayName("Should return all teams")
    void shouldFindAllTeams() {
        teamRepository.create("Team X", null, owner.getId());

        List<TeamRecord> all = teamRepository.findAll();

        assertThat(all).hasSizeGreaterThanOrEqualTo(1);
    }

    @Test
    @DisplayName("Should update team")
    void shouldUpdateTeam() {
        TeamRecord team = teamRepository.create("Old Name", "Old Desc", owner.getId());

        TeamRecord updated = teamRepository.update(team.getId(), "New Name", "New Desc");

        assertThat(updated.getName()).isEqualTo("New Name");
        assertThat(updated.getDescription()).isEqualTo("New Desc");
    }

    @Test
    @DisplayName("Should delete team")
    void shouldDeleteTeam() {
        TeamRecord team = teamRepository.create("Delete Me", null, owner.getId());

        teamRepository.delete(team.getId());

        assertThat(teamRepository.findById(team.getId())).isEmpty();
    }
}