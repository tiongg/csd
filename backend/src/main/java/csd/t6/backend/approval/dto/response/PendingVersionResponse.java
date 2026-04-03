package csd.t6.backend.approval.dto.response;

import csd.t6.backend.approval.util.ContentVersionWithCourseRecord;
import csd.t6.backend.course.dto.response.CourseResponse;
import jakarta.validation.constraints.NotNull;

public record PendingVersionResponse(@NotNull ContentVersionResponse contentVersion, @NotNull CourseResponse course) {
  public PendingVersionResponse(ContentVersionWithCourseRecord record) {
    this(record, null);
  }

  public PendingVersionResponse(ContentVersionWithCourseRecord record, String imageUrl) {
    this(new ContentVersionResponse(record.contentVersion()), new CourseResponse(record.course(), imageUrl, record.tags()));
  }
}
