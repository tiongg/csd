package csd.t6.backend.team;

import csd.t6.backend.account.AccountRepository;
import csd.t6.backend.exceptions.BadRequestException;
import csd.t6.backend.team.dto.request.AddMemberRequest;
import csd.t6.backend.team.dto.request.TeamCreateRequest;
import csd.t6.backend.team.dto.request.TeamUpdateRequest;
import csd.t6.backend.team.dto.response.TeamMemberResponse;
import csd.t6.backend.team.dto.response.TeamResponse;
import csd.t6.jooq.accounts.enums.Roles;
import csd.t6.jooq.accounts.tables.records.AccountRecord;
import csd.t6.jooq.public_.enums.TeamRole;
import csd.t6.jooq.public_.tables.records.TeamMemberRecord;
import csd.t6.jooq.public_.tables.records.TeamRecord;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static csd.t6.jooq.accounts.tables.Account.ACCOUNT;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TeamServiceTest {

    @Mock
    private TeamRepository teamRepository;
    @Mock
    private TeamMemberRepository teamMemberRepository;
    @Mock
    private AccountRepository accountRepository;

    @InjectMocks
    private TeamService teamService;

    private UUID ownerId;
    private UUID teamId;
    private UUID memberId;
    private TeamRecord mockTeam;
    private TeamMemberRecord ownerMember;
    private AccountRecord mockAccount;

    @BeforeEach
    void setUp() {
        ownerId = UUID.randomUUID();
        teamId = UUID.randomUUID();
        memberId = UUID.randomUUID();

        mockTeam = mock(TeamRecord.class);
        lenient().when(mockTeam.getId()).thenReturn(teamId);
        lenient().when(mockTeam.getName()).thenReturn("Test Team");
        lenient().when(mockTeam.getOwnerId()).thenReturn(ownerId);

        ownerMember = mock(TeamMemberRecord.class);
        lenient().when(ownerMember.getTeamRole()).thenReturn(TeamRole.OWNER);
        lenient().when(ownerMember.getTeamId()).thenReturn(teamId);
        lenient().when(ownerMember.getAccountId()).thenReturn(ownerId);

        mockAccount = mock(AccountRecord.class);
        lenient().when(mockAccount.getId()).thenReturn(ownerId);
        lenient().when(mockAccount.getUsername()).thenReturn("owner");
        lenient().when(mockAccount.getEmail()).thenReturn("owner@test.com");
    }

    // --- createTeam ---

    @Test
    @DisplayName("Should create team and add owner as OWNER member")
    void shouldCreateTeam() {
        when(teamRepository.create("Test Team", "Desc", ownerId)).thenReturn(mockTeam);
        when(teamMemberRepository.addMember(teamId, ownerId, TeamRole.OWNER)).thenReturn(ownerMember);
        when(teamMemberRepository.findByTeamId(teamId)).thenReturn(List.of(ownerMember));
        when(accountRepository.findOneBy(ACCOUNT.ID, ownerId)).thenReturn(Optional.of(mockAccount));

        TeamResponse result = teamService.createTeam(new TeamCreateRequest("Test Team", "Desc"), ownerId);

        assertThat(result).isNotNull();
        assertThat(result.members()).hasSize(1);
        verify(teamMemberRepository).addMember(teamId, ownerId, TeamRole.OWNER);
    }

    // --- getTeamById ---

    @Test
    @DisplayName("Should return team by ID")
    void shouldGetTeamById() {
        when(teamRepository.findById(teamId)).thenReturn(Optional.of(mockTeam));
        when(teamMemberRepository.findByTeamId(teamId)).thenReturn(List.of(ownerMember));
        when(accountRepository.findOneBy(ACCOUNT.ID, ownerId)).thenReturn(Optional.of(mockAccount));

        TeamResponse result = teamService.getTeamById(teamId);

        assertThat(result).isNotNull();
        assertThat(result.id()).isEqualTo(teamId);
    }

    @Test
    @DisplayName("Should throw when team not found")
    void shouldThrowWhenTeamNotFound() {
        when(teamRepository.findById(teamId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> teamService.getTeamById(teamId))
            .isInstanceOf(BadRequestException.class)
            .hasMessageContaining("Team not found");
    }

    // --- updateTeam ---

    @Test
    @DisplayName("Should update team when requester is owner")
    void shouldUpdateTeamAsOwner() {
        when(teamRepository.findById(teamId)).thenReturn(Optional.of(mockTeam));
        when(teamMemberRepository.findByTeamAndAccount(teamId, ownerId)).thenReturn(Optional.of(ownerMember));
        when(teamRepository.update(teamId, "New Name", "New Desc")).thenReturn(mockTeam);
        when(teamMemberRepository.findByTeamId(teamId)).thenReturn(List.of(ownerMember));
        when(accountRepository.findOneBy(ACCOUNT.ID, ownerId)).thenReturn(Optional.of(mockAccount));

        TeamResponse result = teamService.updateTeam(teamId, new TeamUpdateRequest("New Name", "New Desc"), ownerId);

        assertThat(result).isNotNull();
    }

    @Test
    @DisplayName("Should throw when non-member tries to update team")
    void shouldThrowWhenNonMemberUpdatesTeam() {
        UUID nonMemberId = UUID.randomUUID();
        when(teamRepository.findById(teamId)).thenReturn(Optional.of(mockTeam));
        when(teamMemberRepository.findByTeamAndAccount(teamId, nonMemberId)).thenReturn(Optional.empty());

        assertThatThrownBy(() ->
            teamService.updateTeam(teamId, new TeamUpdateRequest("Name", "Desc"), nonMemberId))
            .isInstanceOf(BadRequestException.class)
            .hasMessageContaining("not a member");
    }

    @Test
    @DisplayName("Should throw when regular member tries to update team")
    void shouldThrowWhenRegularMemberUpdatesTeam() {
        UUID regularMemberId = UUID.randomUUID();
        TeamMemberRecord regularMember = mock(TeamMemberRecord.class);
        when(regularMember.getTeamRole()).thenReturn(TeamRole.MEMBER);

        when(teamRepository.findById(teamId)).thenReturn(Optional.of(mockTeam));
        when(teamMemberRepository.findByTeamAndAccount(teamId, regularMemberId))
            .thenReturn(Optional.of(regularMember));

        assertThatThrownBy(() ->
            teamService.updateTeam(teamId, new TeamUpdateRequest("Name", "Desc"), regularMemberId))
            .isInstanceOf(BadRequestException.class)
            .hasMessageContaining("owner or admin");
    }

    // --- deleteTeam ---

    @Test
    @DisplayName("Should delete team when requester is owner")
    void shouldDeleteTeamAsOwner() {
        when(teamRepository.findById(teamId)).thenReturn(Optional.of(mockTeam));

        assertThatNoException().isThrownBy(() -> teamService.deleteTeam(teamId, ownerId));
        verify(teamRepository).delete(teamId);
    }

    @Test
    @DisplayName("Should throw when non-owner tries to delete team")
    void shouldThrowWhenNonOwnerDeletesTeam() {
        UUID nonOwnerId = UUID.randomUUID();
        when(teamRepository.findById(teamId)).thenReturn(Optional.of(mockTeam));

        assertThatThrownBy(() -> teamService.deleteTeam(teamId, nonOwnerId))
            .isInstanceOf(BadRequestException.class)
            .hasMessageContaining("Only team owner");
    }

    // --- addMember ---

    @Test
    @DisplayName("Should add contributor member to team successfully")
    void shouldAddMember() {
        AccountRecord newMemberAccount = mock(AccountRecord.class);
        when(newMemberAccount.getId()).thenReturn(memberId);
        when(newMemberAccount.getUsername()).thenReturn("newmember");
        when(newMemberAccount.getEmail()).thenReturn("new@test.com");
        // Must stub getUserRole() since LEARNER check now runs before duplicate check
        when(newMemberAccount.getUserRole()).thenReturn(Roles.CONTRIBUTOR);

        TeamMemberRecord newMemberRecord = mock(TeamMemberRecord.class);
        when(newMemberRecord.getTeamRole()).thenReturn(TeamRole.MEMBER);
        when(newMemberRecord.getTeamId()).thenReturn(teamId);
        when(newMemberRecord.getAccountId()).thenReturn(memberId);

        when(teamMemberRepository.findByTeamAndAccount(teamId, ownerId)).thenReturn(Optional.of(ownerMember));
        when(accountRepository.findOneBy(ACCOUNT.USERNAME, "newmember")).thenReturn(Optional.of(newMemberAccount));
        when(teamMemberRepository.findByTeamAndAccount(teamId, memberId)).thenReturn(Optional.empty());
        when(teamMemberRepository.addMember(teamId, memberId, TeamRole.MEMBER)).thenReturn(newMemberRecord);

        TeamMemberResponse result = teamService.addMember(teamId, new AddMemberRequest("newmember"), ownerId);

        assertThat(result).isNotNull();
    }

    @Test
    @DisplayName("Should throw when adding a LEARNER to a team")
    void shouldThrowWhenAddingLearner() {
        AccountRecord learnerAccount = mock(AccountRecord.class);
        when(learnerAccount.getUserRole()).thenReturn(Roles.LEARNER);

        when(teamMemberRepository.findByTeamAndAccount(teamId, ownerId)).thenReturn(Optional.of(ownerMember));
        when(accountRepository.findOneBy(ACCOUNT.USERNAME, "learneruser")).thenReturn(Optional.of(learnerAccount));

        assertThatThrownBy(() -> teamService.addMember(teamId, new AddMemberRequest("learneruser"), ownerId))
            .isInstanceOf(BadRequestException.class)
            .hasMessageContaining("Only Contributors and Admins can be added to a team");
    }

    @Test
    @DisplayName("Should throw when adding already existing member")
    void shouldThrowWhenAddingExistingMember() {
        AccountRecord existingMember = mock(AccountRecord.class);
        when(existingMember.getId()).thenReturn(memberId);
        when(existingMember.getUserRole()).thenReturn(Roles.CONTRIBUTOR);

        when(teamMemberRepository.findByTeamAndAccount(teamId, ownerId)).thenReturn(Optional.of(ownerMember));
        when(accountRepository.findOneBy(ACCOUNT.USERNAME, "existing")).thenReturn(Optional.of(existingMember));
        when(teamMemberRepository.findByTeamAndAccount(teamId, memberId)).thenReturn(Optional.of(mock(TeamMemberRecord.class)));

        assertThatThrownBy(() -> teamService.addMember(teamId, new AddMemberRequest("existing"), ownerId))
            .isInstanceOf(BadRequestException.class)
            .hasMessageContaining("already a member");
    }

    // --- removeMember ---

    @Test
    @DisplayName("Should remove member from team")
    void shouldRemoveMember() {
        TeamMemberRecord memberRecord = mock(TeamMemberRecord.class);

        when(teamRepository.findById(teamId)).thenReturn(Optional.of(mockTeam));
        when(teamMemberRepository.findByTeamAndAccount(teamId, ownerId)).thenReturn(Optional.of(ownerMember));
        when(teamMemberRepository.findByTeamAndAccount(teamId, memberId)).thenReturn(Optional.of(memberRecord));

        assertThatNoException().isThrownBy(() -> teamService.removeMember(teamId, memberId, ownerId));
        verify(teamMemberRepository).removeMember(teamId, memberId);
    }

    @Test
    @DisplayName("Should throw when trying to remove owner")
    void shouldThrowWhenRemovingOwner() {
        when(teamRepository.findById(teamId)).thenReturn(Optional.of(mockTeam));

        assertThatThrownBy(() -> teamService.removeMember(teamId, ownerId, ownerId))
            .isInstanceOf(BadRequestException.class)
            .hasMessageContaining("Cannot remove team owner");
    }

    // --- isTeamMember ---

    @Test
    @DisplayName("Should return true when user is team member")
    void shouldReturnTrueWhenTeamMember() {
        when(teamMemberRepository.findByTeamAndAccount(teamId, ownerId))
            .thenReturn(Optional.of(ownerMember));

        assertThat(teamService.isTeamMember(teamId, ownerId)).isTrue();
    }

    @Test
    @DisplayName("Should return false when user is not team member")
    void shouldReturnFalseWhenNotTeamMember() {
        when(teamMemberRepository.findByTeamAndAccount(teamId, memberId))
            .thenReturn(Optional.empty());

        assertThat(teamService.isTeamMember(teamId, memberId)).isFalse();
    }

    // --- updateMemberRole ---

    @Test
    @DisplayName("Should update member role as owner")
    void shouldUpdateMemberRoleAsOwner() {
        TeamMemberRecord targetMember = mock(TeamMemberRecord.class);
        when(targetMember.getTeamRole()).thenReturn(TeamRole.MEMBER);

        AccountRecord targetAccount = mock(AccountRecord.class);
        when(targetAccount.getUsername()).thenReturn("target");
        when(targetAccount.getEmail()).thenReturn("target@test.com");

        TeamMemberRecord updatedMember = mock(TeamMemberRecord.class);
        when(updatedMember.getTeamRole()).thenReturn(TeamRole.ADMIN);
        when(updatedMember.getTeamId()).thenReturn(teamId);
        when(updatedMember.getAccountId()).thenReturn(memberId);

        when(teamRepository.findById(teamId)).thenReturn(Optional.of(mockTeam));
        when(teamMemberRepository.findByTeamAndAccount(teamId, ownerId)).thenReturn(Optional.of(ownerMember));
        when(teamMemberRepository.findByTeamAndAccount(teamId, memberId))
            .thenReturn(Optional.of(targetMember))
            .thenReturn(Optional.of(updatedMember));
        when(accountRepository.findOneBy(ACCOUNT.ID, memberId)).thenReturn(Optional.of(targetAccount));

        TeamMemberResponse result = teamService.updateMemberRole(teamId, memberId, TeamRole.ADMIN, ownerId);

        assertThat(result).isNotNull();
        verify(teamMemberRepository).updateRole(teamId, memberId, TeamRole.ADMIN);
    }
}