package csd.t6.backend.team;

import static csd.t6.jooq.accounts.tables.Account.ACCOUNT;
import static csd.t6.jooq.teams.tables.Team.TEAM;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import csd.t6.backend.account.AccountRepository;
import csd.t6.backend.exceptions.BadRequestException;
import csd.t6.backend.team.dto.AddMemberRequest;
import csd.t6.backend.team.dto.TeamCreateRequest;
import csd.t6.backend.team.dto.TeamMemberResponseDTO;
import csd.t6.backend.team.dto.TeamResponseDTO;
import csd.t6.backend.team.dto.TeamUpdateRequest;
import csd.t6.jooq.accounts.tables.records.AccountRecord;
import csd.t6.jooq.teams.enums.TeamRole;
import csd.t6.jooq.teams.tables.records.TeamMemberRecord;
import csd.t6.jooq.teams.tables.records.TeamRecord;

@Service
public class TeamService {
  private final TeamRepository teamRepository;
  private final TeamMemberRepository teamMemberRepository;
  private final AccountRepository accountRepository;

  public TeamService(TeamRepository teamRepository, TeamMemberRepository teamMemberRepository,
      AccountRepository accountRepository) {
    this.teamRepository = teamRepository;
    this.teamMemberRepository = teamMemberRepository;
    this.accountRepository = accountRepository;
  }

  @Transactional
  public TeamResponseDTO createTeam(TeamCreateRequest request, UUID ownerId) {
    TeamRecord teamRecord = teamRepository.create(request.name(), request.description(), ownerId);
    teamMemberRepository.addMember(teamRecord.getId(), ownerId, TeamRole.OWNER);

    List<TeamMemberResponseDTO> members = getTeamMembers(teamRecord.getId());
    return new TeamResponseDTO(teamRecord, members);
  }

  @Transactional(readOnly = true)
  public TeamResponseDTO getTeamById(UUID teamId) {
    TeamRecord teamRecord = teamRepository.findById(teamId)
        .orElseThrow(() -> new BadRequestException("Team not found"));

    List<TeamMemberResponseDTO> members = getTeamMembers(teamId);
    return new TeamResponseDTO(teamRecord, members);
  }

  @Transactional(readOnly = true)
  public List<TeamResponseDTO> getAllTeams() {
    return teamRepository.findAll().stream()
        .map(record -> {
          List<TeamMemberResponseDTO> members = getTeamMembers(record.getId());
          return new TeamResponseDTO(record, members);
        })
        .collect(Collectors.toList());
  }

  @Transactional
  public TeamResponseDTO updateTeam(UUID teamId, TeamUpdateRequest request, UUID requesterId) {
    TeamRecord teamRecord = teamRepository.findById(teamId)
        .orElseThrow(() -> new BadRequestException("Team not found"));

    TeamMemberRecord memberRecord = teamMemberRepository.findByTeamAndAccount(teamId, requesterId)
        .orElseThrow(() -> new BadRequestException("You are not a member of this team"));

    if (memberRecord.getTeamRole() != TeamRole.OWNER && memberRecord.getTeamRole() != TeamRole.ADMIN) {
      throw new BadRequestException("Only team owner or admin can update team details");
    }

    String newName = request.name() != null ? request.name() : teamRecord.getName();
    String newDescription = request.description() != null ? request.description() : teamRecord.getDescription();

    TeamRecord updatedRecord = teamRepository.update(teamId, newName, newDescription);
    List<TeamMemberResponseDTO> members = getTeamMembers(teamId);

    return new TeamResponseDTO(updatedRecord, members);
  }

  @Transactional
  public void deleteTeam(UUID teamId, UUID requesterId) {
    TeamRecord teamRecord = teamRepository.findById(teamId)
        .orElseThrow(() -> new BadRequestException("Team not found"));

    if (!teamRecord.getOwnerId().equals(requesterId)) {
      throw new BadRequestException("Only team owner can delete the team");
    }

    teamRepository.delete(teamId);
  }

  @Transactional
  public TeamMemberResponseDTO addMember(UUID teamId, AddMemberRequest request, UUID requesterId) {
    teamRepository.findById(teamId)
        .orElseThrow(() -> new BadRequestException("Team not found"));

    TeamMemberRecord requesterMember = teamMemberRepository.findByTeamAndAccount(teamId, requesterId)
        .orElseThrow(() -> new BadRequestException("You are not a member of this team"));

    if (requesterMember.getTeamRole() != TeamRole.OWNER && requesterMember.getTeamRole() != TeamRole.ADMIN) {
      throw new BadRequestException("Only team owner or admin can add members");
    }

    AccountRecord accountRecord = accountRepository.findBy(ACCOUNT.ID, request.accountId())
        .orElseThrow(() -> new BadRequestException("Account not found"));

    if (teamMemberRepository.findByTeamAndAccount(teamId, request.accountId()).isPresent()) {
      throw new BadRequestException("User is already a member of this team");
    }

    TeamMemberRecord memberRecord = teamMemberRepository.addMember(teamId, request.accountId(),
        TeamRole.valueOf(request.teamRole()));

    return new TeamMemberResponseDTO(memberRecord, accountRecord.getUsername(), accountRecord.getEmail());
  }

  @Transactional
  public void removeMember(UUID teamId, UUID accountId, UUID requesterId) {
    TeamRecord teamRecord = teamRepository.findById(teamId)
        .orElseThrow(() -> new BadRequestException("Team not found"));

    if (teamRecord.getOwnerId().equals(accountId)) {
      throw new BadRequestException("Cannot remove team owner");
    }

    TeamMemberRecord requesterMember = teamMemberRepository.findByTeamAndAccount(teamId, requesterId)
        .orElseThrow(() -> new BadRequestException("You are not a member of this team"));

    if (requesterMember.getTeamRole() != TeamRole.OWNER && requesterMember.getTeamRole() != TeamRole.ADMIN) {
      throw new BadRequestException("Only team owner or admin can remove members");
    }

    teamMemberRepository.findByTeamAndAccount(teamId, accountId)
        .orElseThrow(() -> new BadRequestException("User is not a member of this team"));

    teamMemberRepository.removeMember(teamId, accountId);
  }

  @Transactional(readOnly = true)
  public List<TeamMemberResponseDTO> getTeamMembers(UUID teamId) {
    List<TeamMemberRecord> memberRecords = teamMemberRepository.findByTeamId(teamId);

    return memberRecords.stream()
        .map(record -> {
          AccountRecord accountRecord = accountRepository.findBy(ACCOUNT.ID, record.getAccountId())
              .orElseThrow(() -> new BadRequestException("Account not found"));
          return new TeamMemberResponseDTO(record, accountRecord.getUsername(), accountRecord.getEmail());
        })
        .collect(Collectors.toList());
  }

  @Transactional(readOnly = true)
  public boolean isTeamMember(UUID teamId, UUID accountId) {
    return teamMemberRepository.findByTeamAndAccount(teamId, accountId).isPresent();
  }

  @Transactional(readOnly = true)
  public TeamRole getTeamMemberRole(UUID teamId, UUID accountId) {
    return teamMemberRepository.findByTeamAndAccount(teamId, accountId)
        .map(TeamMemberRecord::getTeamRole)
        .orElse(null);
  }

  @Transactional
  public TeamMemberResponseDTO updateMemberRole(UUID teamId, UUID accountId, TeamRole newRole, UUID requesterId) {
    TeamRecord team = teamRepository.findById(teamId)
        .orElseThrow(() -> new BadRequestException("Team not found"));

    TeamMemberRecord requesterMember = teamMemberRepository.findByTeamAndAccount(teamId, requesterId)
        .orElseThrow(() -> new BadRequestException("You are not a member of this team"));

    if (requesterMember.getTeamRole() != TeamRole.OWNER && requesterMember.getTeamRole() != TeamRole.ADMIN) {
      throw new BadRequestException("Only team owner or admin can update member roles");
    }

    TeamMemberRecord targetMember = teamMemberRepository.findByTeamAndAccount(teamId, accountId)
        .orElseThrow(() -> new BadRequestException("User is not a member of this team"));

    // SIMPLIFIED CHECK - Owner role should never be changed
    if (targetMember.getTeamRole() == TeamRole.OWNER) {
      throw new BadRequestException("Cannot change owner's role");
    }

    teamMemberRepository.updateRole(teamId, accountId, newRole);

    TeamMemberRecord updatedMember = teamMemberRepository.findByTeamAndAccount(teamId, accountId).orElseThrow();
    AccountRecord accountRecord = accountRepository.findBy(ACCOUNT.ID, accountId).orElseThrow();

    return new TeamMemberResponseDTO(updatedMember, accountRecord.getUsername(), accountRecord.getEmail());
  }
}