package csd.t6.backend.team;

import csd.t6.backend.account.AccountRepository;
import csd.t6.jooq.accounts.tables.records.AccountRecord;
import csd.t6.jooq.public_.enums.TeamRole;
import csd.t6.jooq.public_.tables.records.TeamMemberRecord;
import csd.t6.jooq.public_.tables.records.TeamRecord;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class TeamMemberRepositoryTest {

    @Autowired
    private TeamMemberRepository teamMemberRepository;

    @Autowired
    private TeamRepository teamRepository;

    @Autowired
    private AccountRepository accountRepository;

    private AccountRecord owner;
    private AccountRecord member;
    private TeamRecord team;

    @BeforeEach
    void setUp() {
        owner = accountRepository.insert("member_owner@test.com", "memowner", "hash");
        member = accountRepository.insert("member_user@test.com", "memuser", "hash");
        team = teamRepository.create("Member Test Team", null, owner.getId());
    }

    @Test
    @DisplayName("Should add member to team")
    void shouldAddMember() {
        TeamMemberRecord record = teamMemberRepository.addMember(team.getId(), owner.getId(), TeamRole.OWNER);

        assertThat(record).isNotNull();
        assertThat(record.getId()).isNotNull();
        assertThat(record.getTeamId()).isEqualTo(team.getId());
        assertThat(record.getAccountId()).isEqualTo(owner.getId());
        assertThat(record.getTeamRole()).isEqualTo(TeamRole.OWNER);
    }

    @Test
    @DisplayName("Should find member by team and account")
    void shouldFindByTeamAndAccount() {
        teamMemberRepository.addMember(team.getId(), owner.getId(), TeamRole.OWNER);

        Optional<TeamMemberRecord> found =
            teamMemberRepository.findByTeamAndAccount(team.getId(), owner.getId());

        assertThat(found).isPresent();
        assertThat(found.get().getTeamRole()).isEqualTo(TeamRole.OWNER);
    }

    @Test
    @DisplayName("Should return empty when member not found")
    void shouldReturnEmptyWhenMemberNotFound() {
        Optional<TeamMemberRecord> found =
            teamMemberRepository.findByTeamAndAccount(team.getId(), member.getId());

        assertThat(found).isEmpty();
    }

    @Test
    @DisplayName("Should find all members by team ID")
    void shouldFindByTeamId() {
        teamMemberRepository.addMember(team.getId(), owner.getId(), TeamRole.OWNER);
        teamMemberRepository.addMember(team.getId(), member.getId(), TeamRole.MEMBER);

        List<TeamMemberRecord> members = teamMemberRepository.findByTeamId(team.getId());

        assertThat(members).hasSize(2);
    }

    @Test
    @DisplayName("Should find all teams by account ID")
    void shouldFindByAccountId() {
        TeamRecord team2 = teamRepository.create("Team 2", null, owner.getId());
        teamMemberRepository.addMember(team.getId(), owner.getId(), TeamRole.OWNER);
        teamMemberRepository.addMember(team2.getId(), owner.getId(), TeamRole.OWNER);

        List<TeamMemberRecord> memberships = teamMemberRepository.findByAccountId(owner.getId());

        assertThat(memberships).hasSize(2);
    }

    @Test
    @DisplayName("Should remove member")
    void shouldRemoveMember() {
        teamMemberRepository.addMember(team.getId(), member.getId(), TeamRole.MEMBER);

        teamMemberRepository.removeMember(team.getId(), member.getId());

        assertThat(teamMemberRepository.findByTeamAndAccount(team.getId(), member.getId())).isEmpty();
    }

    @Test
    @DisplayName("Should update member role")
    void shouldUpdateRole() {
        teamMemberRepository.addMember(team.getId(), member.getId(), TeamRole.MEMBER);

        teamMemberRepository.updateRole(team.getId(), member.getId(), TeamRole.ADMIN);

        Optional<TeamMemberRecord> updated =
            teamMemberRepository.findByTeamAndAccount(team.getId(), member.getId());
        assertThat(updated).isPresent();
        assertThat(updated.get().getTeamRole()).isEqualTo(TeamRole.ADMIN);
    }
}