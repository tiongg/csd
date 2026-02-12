package csd.t6.backend.team.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

import csd.t6.jooq.enums.TeamRole;
import csd.t6.jooq.tables.records.TeamMemberRecord;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

@Schema(name = "TeamMember")
public record TeamMemberResponseDTO(
    @NotNull UUID id,
    @NotNull UUID teamId,
    @NotNull UUID accountId,
    @NotNull String username,
    @NotNull String email,
    @NotNull TeamRole teamRole,
    @NotNull OffsetDateTime joinedAt) {

  public TeamMemberResponseDTO(TeamMemberRecord member, String username, String email) {
    this(member.getId(), member.getTeamId(), member.getAccountId(), username, email,
        member.getTeamRole(), member.getJoinedAt());
  }
}