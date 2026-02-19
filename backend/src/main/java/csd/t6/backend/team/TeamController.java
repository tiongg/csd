package csd.t6.backend.team;

import java.util.List;
import java.util.UUID;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import csd.t6.backend.auth.AuthUserDetails;
import csd.t6.backend.course.CourseService;
import csd.t6.backend.course.dto.response.CourseResponse;
import csd.t6.backend.decorators.responses.BadRequestResponse;
import csd.t6.backend.decorators.responses.CreatedResponse;
import csd.t6.backend.decorators.responses.NoContentResponse;
import csd.t6.backend.decorators.responses.OkResponse;
import csd.t6.backend.team.dto.request.AddMemberRequest;
import csd.t6.backend.team.dto.request.TeamCreateRequest;
import csd.t6.backend.team.dto.request.TeamUpdateRequest;
import csd.t6.backend.team.dto.request.UpdateMemberRoleRequest;
import csd.t6.backend.team.dto.response.CheckMembershipResponse;
import csd.t6.backend.team.dto.response.TeamMemberResponse;
import csd.t6.backend.team.dto.response.TeamResponse;
import csd.t6.jooq.public_.enums.TeamRole;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/teams")
@Tag(name = "Teams", description = "Team management endpoints")
@SecurityRequirement(name = "bearerAuth")
public class TeamController {
  private final TeamService teamService;
  private final CourseService courseService;

  public TeamController(TeamService teamService, CourseService courseService) {
    this.teamService = teamService;
    this.courseService = courseService;
  }

  @PostMapping("/")
  @CreatedResponse
  @BadRequestResponse
  @Operation(summary = "Create a new team", description = "Creates a new team with the authenticated user as owner")
  public TeamResponse createTeam(@Valid @RequestBody TeamCreateRequest request,
      @AuthenticationPrincipal AuthUserDetails userDetails) {
    return teamService.createTeam(request, userDetails.getId());
  }

  @GetMapping("/{teamId}")
  @OkResponse
  @BadRequestResponse
  @Operation(summary = "Get team by ID", description = "Retrieves team details including all members")
  public TeamResponse getTeam(@PathVariable UUID teamId) {
    return teamService.getTeamById(teamId);
  }

  @GetMapping("/")
  @OkResponse
  @Operation(summary = "Get user's teams", description = "Retrieves all teams the authenticated user is a member of")
  public List<TeamResponse> getUserTeams(@AuthenticationPrincipal AuthUserDetails userDetails) {
    return teamService.getUserTeams(userDetails.getId());
  }

  @PutMapping("/{teamId}")
  @OkResponse
  @BadRequestResponse
  @Operation(summary = "Update team", description = "Updates team details. Only owner or admin can update.")
  public TeamResponse updateTeam(@PathVariable UUID teamId, @Valid @RequestBody TeamUpdateRequest request,
      @AuthenticationPrincipal AuthUserDetails userDetails) {
    return teamService.updateTeam(teamId, request, userDetails.getId());
  }

  @DeleteMapping("/{teamId}")
  @NoContentResponse
  @BadRequestResponse
  @Operation(summary = "Delete team", description = "Deletes a team. Only owner can delete.")
  public void deleteTeam(@PathVariable UUID teamId, @AuthenticationPrincipal AuthUserDetails userDetails) {
    teamService.deleteTeam(teamId, userDetails.getId());
  }

  @PostMapping("/{teamId}/members")
  @CreatedResponse
  @BadRequestResponse
  @Operation(summary = "Add team member", description = "Adds a new member to the team. Only owner or admin can add members.")
  public TeamMemberResponse addMember(@PathVariable UUID teamId, @Valid @RequestBody AddMemberRequest request,
      @AuthenticationPrincipal AuthUserDetails userDetails) {
    return teamService.addMember(teamId, request, userDetails.getId());
  }

  @DeleteMapping("/{teamId}/members/{accountId}")
  @NoContentResponse
  @BadRequestResponse
  @Operation(summary = "Remove team member", description = "Removes a member from the team. Only owner or admin can remove members. Cannot remove owner.")
  public void removeMember(@PathVariable UUID teamId, @PathVariable UUID accountId,
      @AuthenticationPrincipal AuthUserDetails userDetails) {
    teamService.removeMember(teamId, accountId, userDetails.getId());
  }

  @GetMapping("/{teamId}/members")
  @OkResponse
  @BadRequestResponse
  @Operation(summary = "Get team members", description = "Retrieves all members of a team")
  public List<TeamMemberResponse> getTeamMembers(@PathVariable UUID teamId) {
    return teamService.getTeamMembers(teamId);
  }

  @GetMapping("/{teamId}/check-membership")
  @OkResponse
  @Operation(summary = "Check if user is team member", description = "Returns user's role in team")
  public CheckMembershipResponse checkMembership(@PathVariable UUID teamId,
      @AuthenticationPrincipal AuthUserDetails userDetails) {
    TeamRole role = teamService.getTeamMemberRole(teamId, userDetails.getId());
    return new CheckMembershipResponse(role != null, role != null ? role.toString() : "NONE");
  }

  @PutMapping("/{teamId}/members/{accountId}/role")
  @OkResponse
  @BadRequestResponse
  @Operation(summary = "Update member role", description = "Updates a team member's role. Only owner and admin can update roles.")
  public TeamMemberResponse updateMemberRole(@PathVariable UUID teamId, @PathVariable UUID accountId,
      @Valid @RequestBody UpdateMemberRoleRequest request, @AuthenticationPrincipal AuthUserDetails userDetails) {
    return teamService.updateMemberRole(teamId, accountId, request.role(), userDetails.getId());
  }

  @GetMapping("/{teamId}/courses")
  @OkResponse
  @BadRequestResponse
  @Operation(summary = "Gets all team courses", description = "Retrieves all courses associated with the team")
  public List<CourseResponse> getTeamCourses(@PathVariable UUID teamId,
      @AuthenticationPrincipal AuthUserDetails userDetails) {
    return this.courseService.getCoursesByTeamId(teamId, userDetails.getId()).stream().map(CourseResponse::new)
        .toList();
  }

}