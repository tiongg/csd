package csd.t6.backend.team.dto.response;

import java.time.OffsetDateTime;
import java.util.UUID;

import csd.t6.jooq.public_.enums.TeamRole;
import csd.t6.jooq.public_.tables.records.TeamMemberRecord;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

@Schema(name = "TeamMember")
public record TeamMemberResponse(@NotNull UUID id, @NotNull UUID teamId, @NotNull UUID accountId,
    @NotNull String username, @NotNull String email, @NotNull TeamRole teamRole, @NotNull OffsetDateTime joinedAt) {

  public TeamMemberResponse(TeamMemberRecord member, String username, String email) {
    this(member.getId(), member.getTeamId(), member.getAccountId(), username, email, member.getTeamRole(),
        member.getJoinedAt());
  }
}