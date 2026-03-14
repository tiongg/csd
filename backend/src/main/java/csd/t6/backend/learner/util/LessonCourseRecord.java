package csd.t6.backend.learner.util;

import csd.t6.jooq.public_.tables.records.CourseRecord;
import csd.t6.jooq.public_.tables.records.LearnerCourseRecord;

// Contains both LearnerCourseRecord and CourseRecord
public record LessonCourseRecord(LearnerCourseRecord learnerCourseRecord, CourseRecord courseRecord) {}
