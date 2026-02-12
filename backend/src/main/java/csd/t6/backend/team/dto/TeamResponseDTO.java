package csd.t6.backend.team.dto;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import csd.t6.jooq.teams.tables.records.TeamRecord;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

@Schema(name = "Team")
public record TeamResponseDTO(
    @NotNull UUID id,
    @NotNull String name,
    String description,
    @NotNull UUID ownerId,
    @NotNull OffsetDateTime createdAt,
    @NotNull OffsetDateTime updatedAt,
    List<TeamMemberResponseDTO> members) {

  public TeamResponseDTO(TeamRecord team, List<TeamMemberResponseDTO> members) {
    this(team.getId(), team.getName(), team.getDescription(), team.getOwnerId(), team.getCreatedAt(),
        team.getUpdatedAt(), members);
  }
}