package csd.t6.backend.approval.util;

import java.util.List;

import csd.t6.jooq.public_.tables.records.ContentVersionRecord;
import csd.t6.jooq.public_.tables.records.CourseRecord;

public record ContentVersionWithCourseRecord(ContentVersionRecord contentVersion, CourseRecord course,
    List<String> tags) {}
