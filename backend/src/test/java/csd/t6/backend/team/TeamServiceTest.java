package csd.t6.backend.team;

import csd.t6.backend.account.AccountRepository;
import csd.t6.backend.exceptions.BadRequestException;
import csd.t6.backend.team.dto.AddMemberRequest;
import csd.t6.backend.team.dto.TeamCreateRequest;
import csd.t6.backend.team.dto.TeamMemberResponseDTO;
import csd.t6.backend.team.dto.TeamResponseDTO;
import csd.t6.backend.team.dto.TeamUpdateRequest;
import csd.t6.jooq.accounts.tables.records.AccountRecord;
import csd.t6.jooq.public_.enums.TeamRole;
import csd.t6.jooq.public_.tables.records.TeamMemberRecord;
import csd.t6.jooq.public_.tables.records.TeamRecord;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static csd.t6.jooq.accounts.tables.Account.ACCOUNT;
import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
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

    @Test
    @DisplayName("Should create a team and add owner as member")
    void createTeam_ok() {
        // arrange
        UUID ownerId = UUID.randomUUID();
        UUID teamId = UUID.randomUUID();
        TeamCreateRequest req = new TeamCreateRequest("Team Name", "Description");

        TeamRecord teamRecord = mock(TeamRecord.class);
        when(teamRecord.getId()).thenReturn(teamId);
        when(teamRecord.getName()).thenReturn("Team Name");
        when(teamRecord.getDescription()).thenReturn("Description");
        when(teamRecord.getOwnerId()).thenReturn(ownerId);
        when(teamRepository.create("Team Name", "Description", ownerId)).thenReturn(teamRecord);

        // Mock getTeamMembers to return empty list for simplicity
        when(teamMemberRepository.findByTeamId(any())).thenReturn(List.of());

        // act
        TeamResponseDTO result = teamService.createTeam(req, ownerId);

        // assert
        assertThat(result.id()).isEqualTo(teamId);
        assertThat(result.name()).isEqualTo("Team Name");
        assertThat(result.description()).isEqualTo("Description");
        assertThat(result.ownerId()).isEqualTo(ownerId);
        verify(teamRepository).create("Team Name", "Description", ownerId);
        verify(teamMemberRepository).addMember(teamRecord.getId(), ownerId, TeamRole.OWNER);
    }

    @Test
    @DisplayName("Should get team by id when exists")
    void getTeamById_exists_ok() {
        // arrange
        UUID teamId = UUID.randomUUID();
        TeamRecord teamRecord = mock(TeamRecord.class);
        when(teamRecord.getId()).thenReturn(teamId);
        when(teamRecord.getName()).thenReturn("Team Name");
        when(teamRepository.findById(teamId)).thenReturn(Optional.of(teamRecord));

        when(teamMemberRepository.findByTeamId(teamId)).thenReturn(List.of());

        // act
        TeamResponseDTO result = teamService.getTeamById(teamId);

        // assert
        assertThat(result.id()).isEqualTo(teamId);
        assertThat(result.name()).isEqualTo("Team Name");
    }

    @Test
    @DisplayName("Should throw BadRequestException when team not found")
    void getTeamById_notFound_badRequest() {
        // arrange
        UUID teamId = UUID.randomUUID();
        when(teamRepository.findById(teamId)).thenReturn(Optional.empty());

        // act + assert
        BadRequestException ex = assertThrows(BadRequestException.class, () -> teamService.getTeamById(teamId));
        assertThat(ex).hasMessageContaining("Team not found");
    }

    @Test
    @DisplayName("Should update team when requester is owner")
    void updateTeam_owner_ok() {
        // arrange
        UUID teamId = UUID.randomUUID();
        UUID requesterId = UUID.randomUUID();
        TeamUpdateRequest req = new TeamUpdateRequest("New Name", "New Desc");

        TeamRecord teamRecord = mock(TeamRecord.class);
        when(teamRepository.findById(teamId)).thenReturn(Optional.of(teamRecord));

        TeamMemberRecord memberRecord = mock(TeamMemberRecord.class);
        when(memberRecord.getTeamRole()).thenReturn(TeamRole.OWNER);
        when(teamMemberRepository.findByTeamAndAccount(teamId, requesterId)).thenReturn(Optional.of(memberRecord));

        TeamRecord updatedRecord = mock(TeamRecord.class);
        when(updatedRecord.getId()).thenReturn(teamId);
        when(updatedRecord.getName()).thenReturn("New Name");
        when(updatedRecord.getDescription()).thenReturn("New Desc");
        when(teamRepository.update(teamId, "New Name", "New Desc")).thenReturn(updatedRecord);

        when(teamMemberRepository.findByTeamId(teamId)).thenReturn(List.of());

        // act
        TeamResponseDTO result = teamService.updateTeam(teamId, req, requesterId);

        // assert
        assertThat(result.name()).isEqualTo("New Name");
        assertThat(result.description()).isEqualTo("New Desc");
        verify(teamRepository).update(teamId, "New Name", "New Desc");
    }

    @Test
    @DisplayName("Should throw BadRequestException when updating team as non-admin")
    void updateTeam_nonAdmin_badRequest() {
        // arrange
        UUID teamId = UUID.randomUUID();
        UUID requesterId = UUID.randomUUID();
        TeamUpdateRequest req = new TeamUpdateRequest("New Name", null);

        TeamRecord teamRecord = mock(TeamRecord.class);
        when(teamRepository.findById(teamId)).thenReturn(Optional.of(teamRecord));

        TeamMemberRecord memberRecord = mock(TeamMemberRecord.class);
        when(memberRecord.getTeamRole()).thenReturn(TeamRole.MEMBER);
        when(teamMemberRepository.findByTeamAndAccount(teamId, requesterId)).thenReturn(Optional.of(memberRecord));

        // act + assert
        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> teamService.updateTeam(teamId, req, requesterId));
        assertThat(ex).hasMessageContaining("Only team owner or admin can update team details");
    }

    @Test
    @DisplayName("Should delete team when requester is owner")
    void deleteTeam_owner_ok() {
        // arrange
        UUID teamId = UUID.randomUUID();
        UUID ownerId = UUID.randomUUID();

        TeamRecord teamRecord = mock(TeamRecord.class);
        when(teamRecord.getOwnerId()).thenReturn(ownerId);
        when(teamRepository.findById(teamId)).thenReturn(Optional.of(teamRecord));

        // act
        teamService.deleteTeam(teamId, ownerId);

        // assert
        verify(teamRepository).delete(teamId);
    }

    @Test
    @DisplayName("Should throw BadRequestException when deleting team as non-owner")
    void deleteTeam_nonOwner_badRequest() {
        // arrange
        UUID teamId = UUID.randomUUID();
        UUID ownerId = UUID.randomUUID();
        UUID requesterId = UUID.randomUUID();

        TeamRecord teamRecord = mock(TeamRecord.class);
        when(teamRecord.getOwnerId()).thenReturn(ownerId);
        when(teamRepository.findById(teamId)).thenReturn(Optional.of(teamRecord));

        // act + assert
        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> teamService.deleteTeam(teamId, requesterId));
        assertThat(ex).hasMessageContaining("Only team owner can delete the team");
    }

    @Test
    @DisplayName("Should add member when requester is admin")
    void addMember_admin_ok() {
        // arrange
        UUID teamId = UUID.randomUUID();
        UUID requesterId = UUID.randomUUID();
        UUID accountId = UUID.randomUUID();
        AddMemberRequest req = new AddMemberRequest(accountId, TeamRole.MEMBER);

        TeamRecord teamRecord = mock(TeamRecord.class);
        when(teamRepository.findById(teamId)).thenReturn(Optional.of(teamRecord));

        TeamMemberRecord requesterMember = mock(TeamMemberRecord.class);
        when(requesterMember.getTeamRole()).thenReturn(TeamRole.ADMIN);
        when(teamMemberRepository.findByTeamAndAccount(teamId, requesterId)).thenReturn(Optional.of(requesterMember));

        AccountRecord accountRecord = mock(AccountRecord.class);
        when(accountRecord.getUsername()).thenReturn("username");
        when(accountRecord.getEmail()).thenReturn("email@example.com");
        when(accountRepository.findOneBy(ACCOUNT.ID, accountId)).thenReturn(Optional.of(accountRecord));

        when(teamMemberRepository.findByTeamAndAccount(teamId, accountId)).thenReturn(Optional.empty());

        TeamMemberRecord memberRecord = mock(TeamMemberRecord.class);
        when(memberRecord.getId()).thenReturn(UUID.randomUUID());
        when(memberRecord.getTeamId()).thenReturn(teamId);
        when(memberRecord.getAccountId()).thenReturn(accountId);
        when(memberRecord.getTeamRole()).thenReturn(TeamRole.MEMBER);
        when(teamMemberRepository.addMember(teamId, accountId, TeamRole.MEMBER)).thenReturn(memberRecord);

        // act
        TeamMemberResponseDTO result = teamService.addMember(teamId, req, requesterId);

        // assert
        assertThat(result.accountId()).isEqualTo(accountId);
        assertThat(result.username()).isEqualTo("username");
        assertThat(result.email()).isEqualTo("email@example.com");
        assertThat(result.teamRole()).isEqualTo(TeamRole.MEMBER);
    }

    @Test
    @DisplayName("Should throw BadRequestException when adding existing member")
    void addMember_alreadyMember_badRequest() {
        // arrange
        UUID teamId = UUID.randomUUID();
        UUID requesterId = UUID.randomUUID();
        UUID accountId = UUID.randomUUID();
        AddMemberRequest req = new AddMemberRequest(accountId, TeamRole.MEMBER);

        TeamRecord teamRecord = mock(TeamRecord.class);
        when(teamRepository.findById(teamId)).thenReturn(Optional.of(teamRecord));

        TeamMemberRecord requesterMember = mock(TeamMemberRecord.class);
        when(requesterMember.getTeamRole()).thenReturn(TeamRole.OWNER);
        when(teamMemberRepository.findByTeamAndAccount(teamId, requesterId)).thenReturn(Optional.of(requesterMember));

        AccountRecord accountRecord = mock(AccountRecord.class);
        when(accountRepository.findOneBy(ACCOUNT.ID, accountId)).thenReturn(Optional.of(accountRecord));

        when(teamMemberRepository.findByTeamAndAccount(teamId, accountId))
                .thenReturn(Optional.of(mock(TeamMemberRecord.class)));

        // act + assert
        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> teamService.addMember(teamId, req, requesterId));
        assertThat(ex).hasMessageContaining("User is already a member of this team");
    }

    @Test
    @DisplayName("Should return true when user is team member")
    void isTeamMember_true() {
        // arrange
        UUID teamId = UUID.randomUUID();
        UUID accountId = UUID.randomUUID();

        when(teamMemberRepository.findByTeamAndAccount(teamId, accountId))
                .thenReturn(Optional.of(mock(TeamMemberRecord.class)));

        // act
        boolean result = teamService.isTeamMember(teamId, accountId);

        // assert
        assertThat(result).isTrue();
    }

    @Test
    @DisplayName("Should return false when user is not team member")
    void isTeamMember_false() {
        // arrange
        UUID teamId = UUID.randomUUID();
        UUID accountId = UUID.randomUUID();

        when(teamMemberRepository.findByTeamAndAccount(teamId, accountId)).thenReturn(Optional.empty());

        // act
        boolean result = teamService.isTeamMember(teamId, accountId);

        // assert
        assertThat(result).isFalse();
    }
}