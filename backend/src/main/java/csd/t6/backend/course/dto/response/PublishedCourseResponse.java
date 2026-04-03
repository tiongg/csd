package csd.t6.backend.course.dto.response;

import csd.t6.backend.approval.dto.response.ContentVersionResponse;
import csd.t6.backend.approval.util.ContentVersionWithCourseRecord;
import jakarta.validation.constraints.NotNull;

public record PublishedCourseResponse(@NotNull ContentVersionResponse contentVersion, @NotNull CourseResponse course) {
  public PublishedCourseResponse(ContentVersionWithCourseRecord record, String imageUrl) {
    this(new ContentVersionResponse(record.contentVersion()), new CourseResponse(record.course(), imageUrl, record.tags()));
  }
}

