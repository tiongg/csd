package csd.t6.backend.team;

import static csd.t6.jooq.accounts.tables.Account.ACCOUNT;

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
    // Create team
    Team team = teamRepository.create(request.name(), request.description(), ownerId);

    // Add owner as a team member with OWNER role
    teamMemberRepository.addMember(team.getId(), ownerId, "OWNER");

    List<TeamMemberResponseDTO> members = getTeamMembers(team.getId());
    return new TeamResponseDTO(team, members);
  }

  @Transactional(readOnly = true)
  public TeamResponseDTO getTeamById(UUID teamId) {
    Team team = teamRepository.findById(teamId)
        .orElseThrow(() -> new BadRequestException("Team not found"));

    List<TeamMemberResponseDTO> members = getTeamMembers(teamId);
    return new TeamResponseDTO(team, members);
  }

  @Transactional(readOnly = true)
  public List<TeamResponseDTO> getAllTeams() {
    return teamRepository.findAll().stream()
        .map(team -> {
          List<TeamMemberResponseDTO> members = getTeamMembers(team.getId());
          return new TeamResponseDTO(team, members);
        })
        .collect(Collectors.toList());
  }

  @Transactional
  public TeamResponseDTO updateTeam(UUID teamId, TeamUpdateRequest request, UUID requesterId) {
    Team team = teamRepository.findById(teamId)
        .orElseThrow(() -> new BadRequestException("Team not found"));

    // Check permissions
    TeamMember memberRecord = teamMemberRepository.findByTeamAndAccount(teamId, requesterId)
        .orElseThrow(() -> new BadRequestException("You are not a member of this team"));

    // Only OWNER and ADMIN can update team details
    if (!"OWNER".equals(memberRecord.getTeamRole()) && !"ADMIN".equals(memberRecord.getTeamRole())) {
      throw new BadRequestException("Only team owner or admin can update team details");
    }

    // Update team
    String newName = request.name() != null ? request.name() : team.getName();
    String newDescription = request.description() != null ? request.description() : team.getDescription();

    Team updatedTeam = teamRepository.update(teamId, newName, newDescription);
    List<TeamMemberResponseDTO> members = getTeamMembers(teamId);

    return new TeamResponseDTO(updatedTeam, members);
  }

  @Transactional
  public void deleteTeam(UUID teamId, UUID requesterId) {
    Team team = teamRepository.findById(teamId)
        .orElseThrow(() -> new BadRequestException("Team not found"));

    // Only owner can delete team
    if (!team.getOwnerId().equals(requesterId)) {
      throw new BadRequestException("Only team owner can delete the team");
    }

    teamRepository.delete(teamId);
  }

  @Transactional
  public TeamMemberResponseDTO addMember(UUID teamId, AddMemberRequest request, UUID requesterId) {
    // Verify team exists
    teamRepository.findById(teamId)
        .orElseThrow(() -> new BadRequestException("Team not found"));

    // Check requester permissions
    TeamMember requesterMember = teamMemberRepository.findByTeamAndAccount(teamId, requesterId)
        .orElseThrow(() -> new BadRequestException("You are not a member of this team"));

    // Only OWNER and ADMIN can add members
    if (!"OWNER".equals(requesterMember.getTeamRole()) && !"ADMIN".equals(requesterMember.getTeamRole())) {
      throw new BadRequestException("Only team owner or admin can add members");
    }

    // Verify account exists
    AccountRecord accountRecord = accountRepository.findBy(ACCOUNT.ID, request.accountId())
        .orElseThrow(() -> new BadRequestException("Account not found"));

    // Check if already a member
    if (teamMemberRepository.findByTeamAndAccount(teamId, request.accountId()).isPresent()) {
      throw new BadRequestException("User is already a member of this team");
    }

    // Add member
    TeamMember member = teamMemberRepository.addMember(teamId, request.accountId(), request.teamRole());

    return new TeamMemberResponseDTO(member, accountRecord.getUsername(), accountRecord.getEmail());
  }

  @Transactional
  public void removeMember(UUID teamId, UUID accountId, UUID requesterId) {
    // Verify team exists
    Team team = teamRepository.findById(teamId)
        .orElseThrow(() -> new BadRequestException("Team not found"));

    // Cannot remove owner
    if (team.getOwnerId().equals(accountId)) {
      throw new BadRequestException("Cannot remove team owner");
    }

    // Check requester permissions
    TeamMember requesterMember = teamMemberRepository.findByTeamAndAccount(teamId, requesterId)
        .orElseThrow(() -> new BadRequestException("You are not a member of this team"));

    // Only OWNER and ADMIN can remove members
    if (!"OWNER".equals(requesterMember.getTeamRole()) && !"ADMIN".equals(requesterMember.getTeamRole())) {
      throw new BadRequestException("Only team owner or admin can remove members");
    }

    // Verify member exists
    teamMemberRepository.findByTeamAndAccount(teamId, accountId)
        .orElseThrow(() -> new BadRequestException("User is not a member of this team"));

    // Remove member
    teamMemberRepository.removeMember(teamId, accountId);
  }

  @Transactional(readOnly = true)
  public List<TeamMemberResponseDTO> getTeamMembers(UUID teamId) {
    List<TeamMember> memberRecords = teamMemberRepository.findByTeamId(teamId);

    return memberRecords.stream()
        .map(record -> {
          AccountRecord accountRecord = accountRepository.findBy(ACCOUNT.ID, record.getAccountId())
              .orElseThrow(() -> new BadRequestException("Account not found"));
          return new TeamMemberResponseDTO(record, accountRecord.getUsername(), accountRecord.getEmail());
        })
        .collect(Collectors.toList());
  }
  
  /**
   * Check if a user is a member of a team
   */
  @Transactional(readOnly = true)
  public boolean isTeamMember(UUID teamId, UUID accountId) {
    return teamMemberRepository.findByTeamAndAccount(teamId, accountId).isPresent();
  }

  /**
   * Get the role of a user in a team
   */
  @Transactional(readOnly = true)
  public String getTeamMemberRole(UUID teamId, UUID accountId) {
    return teamMemberRepository.findByTeamAndAccount(teamId, accountId)
        .map(TeamMember::getTeamRole)
        .orElse(null);
  }

  /**
   * Check if user can edit team member roles
   */
  @Transactional(readOnly = true)
  public boolean canEditTeamMemberRoles(UUID teamId, UUID accountId) {
    TeamMember member = teamMemberRepository.findByTeamAndAccount(teamId, accountId).orElse(null);
    if (member == null) return false;
    return "OWNER".equals(member.getTeamRole()) || "ADMIN".equals(member.getTeamRole());
  }

  @Transactional
  public TeamMemberResponseDTO updateMemberRole(UUID teamId, UUID accountId, String newRole, UUID requesterId) {
    // Verify team exists
    Team team = teamRepository.findById(teamId)
        .orElseThrow(() -> new BadRequestException("Team not found"));

    // Check requester permissions
    TeamMember requesterMember = teamMemberRepository.findByTeamAndAccount(teamId, requesterId)
        .orElseThrow(() -> new BadRequestException("You are not a member of this team"));

    // Only OWNER and ADMIN can update roles
    if (!"OWNER".equals(requesterMember.getTeamRole()) && !"ADMIN".equals(requesterMember.getTeamRole())) {
      throw new BadRequestException("Only team owner or admin can update member roles");
    }

    // Get target member
    TeamMember targetMember = teamMemberRepository.findByTeamAndAccount(teamId, accountId)
        .orElseThrow(() -> new BadRequestException("User is not a member of this team"));

    // Admin cannot update owner
    if ("ADMIN".equals(requesterMember.getTeamRole()) && "OWNER".equals(targetMember.getTeamRole())) {
      throw new BadRequestException("Admin cannot update owner's role");
    }

    // Cannot change owner role if they are the actual owner
    if (team.getOwnerId().equals(accountId) && !"OWNER".equals(newRole)) {
      throw new BadRequestException("Cannot change team owner's role");
    }

    // Validate new role
    if (!newRole.matches("OWNER|ADMIN|CONTRIBUTOR")) {
      throw new BadRequestException("Invalid role. Must be OWNER, ADMIN, or CONTRIBUTOR");
    }

    // Update role
    teamMemberRepository.updateRole(teamId, accountId, newRole);

    // Fetch updated member and account info
    TeamMember updatedMember = teamMemberRepository.findByTeamAndAccount(teamId, accountId).orElseThrow();
    AccountRecord accountRecord = accountRepository.findBy(ACCOUNT.ID, accountId).orElseThrow();

    return new TeamMemberResponseDTO(updatedMember, accountRecord.getUsername(), accountRecord.getEmail());
  }

}