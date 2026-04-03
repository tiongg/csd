package csd.t6.backend.approval.dto.response;

import csd.t6.backend.approval.util.ContentVersionWithCourseRecord;
import csd.t6.backend.course.dto.response.CourseResponse;
import jakarta.validation.constraints.NotNull;

public record PendingVersionResponse(@NotNull ContentVersionResponse contentVersion, @NotNull CourseResponse course) {
  public PendingVersionResponse(ContentVersionWithCourseRecord record) {
    this(record, null, null);
  }

  public PendingVersionResponse(ContentVersionWithCourseRecord record, String imageUrl) {
    this(record, imageUrl, null);
  }

  public PendingVersionResponse(ContentVersionWithCourseRecord record, String imageUrl, String creatorUsername) {
    this(new ContentVersionResponse(record.contentVersion()),
        new CourseResponse(record.course(), imageUrl, record.tags(), creatorUsername));
  }
}
