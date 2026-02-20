package csd.t6.backend.team;

import static csd.t6.jooq.accounts.tables.Account.ACCOUNT;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import csd.t6.backend.account.AccountRepository;
import csd.t6.backend.exceptions.BadRequestException;
import csd.t6.backend.team.dto.request.AddMemberRequest;
import csd.t6.backend.team.dto.request.TeamCreateRequest;
import csd.t6.backend.team.dto.request.TeamUpdateRequest;
import csd.t6.backend.team.dto.response.TeamMemberResponse;
import csd.t6.backend.team.dto.response.TeamResponse;
import csd.t6.jooq.accounts.tables.records.AccountRecord;
import csd.t6.jooq.public_.enums.TeamRole;
import csd.t6.jooq.public_.tables.records.TeamMemberRecord;
import csd.t6.jooq.public_.tables.records.TeamRecord;

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

  // Helper function for permission checks
  private boolean isOwnerOrAdmin(TeamMemberRecord member) {
    return member.getTeamRole() == TeamRole.OWNER || member.getTeamRole() == TeamRole.ADMIN;
  }

  @Transactional
  public TeamResponse createTeam(TeamCreateRequest request, UUID ownerId) {
    TeamRecord teamRecord = teamRepository.create(request.name(), request.description(), ownerId);
    teamMemberRepository.addMember(teamRecord.getId(), ownerId, TeamRole.OWNER);

    List<TeamMemberResponse> members = getTeamMembers(teamRecord.getId());
    return new TeamResponse(teamRecord, members);
  }

  public TeamResponse getTeamById(UUID teamId) {
    TeamRecord teamRecord = teamRepository.findById(teamId)
        .orElseThrow(() -> new BadRequestException("Team not found"));

    List<TeamMemberResponse> members = getTeamMembers(teamId);
    return new TeamResponse(teamRecord, members);
  }

  public List<TeamResponse> getUserTeams(UUID userId) {
    List<TeamMemberRecord> userMemberships = teamMemberRepository.findByAccountId(userId);

    return userMemberships.stream().map(membership -> {
      TeamRecord team = teamRepository.findById(membership.getTeamId()).orElseThrow();
      List<TeamMemberResponse> members = getTeamMembers(team.getId());
      return new TeamResponse(team, members);
    }).collect(Collectors.toList());
  }

  @Transactional
  public TeamResponse updateTeam(UUID teamId, TeamUpdateRequest request, UUID requesterId) {
    TeamRecord teamRecord = teamRepository.findById(teamId)
        .orElseThrow(() -> new BadRequestException("Team not found"));

    TeamMemberRecord memberRecord = teamMemberRepository.findByTeamAndAccount(teamId, requesterId)
        .orElseThrow(() -> new BadRequestException("You are not a member of this team"));

    if (!isOwnerOrAdmin(memberRecord)) {
      throw new BadRequestException("Only team owner or admin can update team details");
    }

    String newName = request.name() != null ? request.name() : teamRecord.getName();
    String newDescription = request.description() != null ? request.description() : teamRecord.getDescription();

    TeamRecord updatedRecord = teamRepository.update(teamId, newName, newDescription);
    List<TeamMemberResponse> members = getTeamMembers(teamId);

    return new TeamResponse(updatedRecord, members);
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
  public TeamMemberResponse addMember(UUID teamId, AddMemberRequest request, UUID requesterId) {
    TeamMemberRecord requesterMember = teamMemberRepository.findByTeamAndAccount(teamId, requesterId)
        .orElseThrow(() -> new BadRequestException("You are not a member of this team"));

    if (!isOwnerOrAdmin(requesterMember)) {
      throw new BadRequestException("Only team owner or admin can add members");
    }

    AccountRecord accountRecord = accountRepository.findOneBy(ACCOUNT.USERNAME, request.username())
        .orElseThrow(() -> new BadRequestException("User not found"));

    if (teamMemberRepository.findByTeamAndAccount(teamId, accountRecord.getId()).isPresent()) {
      throw new BadRequestException("User is already a member of this team");
    }

    TeamMemberRecord memberRecord = teamMemberRepository.addMember(teamId, accountRecord.getId(), TeamRole.MEMBER);

    return new TeamMemberResponse(memberRecord, accountRecord.getUsername(), accountRecord.getEmail());
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

    if (!isOwnerOrAdmin(requesterMember)) {
      throw new BadRequestException("Only team owner or admin can remove members");
    }
    teamMemberRepository.findByTeamAndAccount(teamId, accountId)
        .orElseThrow(() -> new BadRequestException("User is not a member of this team"));

    teamMemberRepository.removeMember(teamId, accountId);
  }

  public List<TeamMemberResponse> getTeamMembers(UUID teamId) {
    List<TeamMemberRecord> memberRecords = teamMemberRepository.findByTeamId(teamId);

    return memberRecords.stream().map(record -> {
      AccountRecord accountRecord = accountRepository.findOneBy(ACCOUNT.ID, record.getAccountId())
          .orElseThrow(() -> new BadRequestException("Account not found"));
      return new TeamMemberResponse(record, accountRecord.getUsername(), accountRecord.getEmail());
    }).collect(Collectors.toList());
  }

  public boolean isTeamMember(UUID teamId, UUID accountId) {
    return teamMemberRepository.findByTeamAndAccount(teamId, accountId).isPresent();
  }

  public TeamRole getTeamMemberRole(UUID teamId, UUID accountId) {
    return teamMemberRepository.findByTeamAndAccount(teamId, accountId).map(TeamMemberRecord::getTeamRole).orElse(null);
  }

  @Transactional
  public TeamMemberResponse updateMemberRole(UUID teamId, UUID accountId, TeamRole newRole, UUID requesterId) {
    teamRepository.findById(teamId).orElseThrow(() -> new BadRequestException("Team not found"));

    TeamMemberRecord requesterMember = teamMemberRepository.findByTeamAndAccount(teamId, requesterId)
        .orElseThrow(() -> new BadRequestException("You are not a member of this team"));

    if (!isOwnerOrAdmin(requesterMember)) {
      throw new BadRequestException("Only team owner or admin can update member roles");
    }

    TeamMemberRecord targetMember = teamMemberRepository.findByTeamAndAccount(teamId, accountId)
        .orElseThrow(() -> new BadRequestException("User is not a member of this team"));

    boolean isRequesterOwner = requesterMember.getTeamRole() == TeamRole.OWNER;
    boolean isTargetOwner = targetMember.getTeamRole() == TeamRole.OWNER;
    boolean isSelfUpdate = requesterId.equals(accountId);

    if (isSelfUpdate && newRole == TeamRole.OWNER && !isRequesterOwner) {
      throw new BadRequestException("You cannot promote yourself to owner");
    }

    if (!isRequesterOwner) {
      if (newRole == TeamRole.OWNER) {
        throw new BadRequestException("Only the team owner can promote members to owner");
      }

      if (isTargetOwner) {
        throw new BadRequestException("Only the team owner can change another owner's role");
      }
    }

    if (isRequesterOwner && isSelfUpdate && isTargetOwner && newRole != TeamRole.OWNER) {
      throw new BadRequestException("Cannot demote yourself as owner. Transfer ownership to another member first");
    }

    teamMemberRepository.updateRole(teamId, accountId, newRole);

    TeamMemberRecord updatedMember = teamMemberRepository.findByTeamAndAccount(teamId, accountId).orElseThrow();
    AccountRecord accountRecord = accountRepository.findOneBy(ACCOUNT.ID, accountId)
        .orElseThrow(() -> new BadRequestException("Account not found"));

    return new TeamMemberResponse(updatedMember, accountRecord.getUsername(), accountRecord.getEmail());
  }
}