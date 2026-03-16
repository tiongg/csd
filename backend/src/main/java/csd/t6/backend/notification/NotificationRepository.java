package csd.t6.backend.notification;

import static csd.t6.jooq.public_.tables.Notification.NOTIFICATION;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.jooq.DSLContext;
import org.springframework.stereotype.Repository;

import csd.t6.backend.utils.BaseRepository;
import csd.t6.jooq.public_.enums.NotificationType;
import csd.t6.jooq.public_.tables.records.NotificationRecord;

@Repository
public class NotificationRepository extends BaseRepository<NotificationRecord> {

  public NotificationRepository(DSLContext dsl) {
    super(dsl, NOTIFICATION);
  }

  public NotificationRecord insert(UUID accountId, NotificationType type, String title, String message, UUID itemId) {
    NotificationRecord record = dsl.newRecord(NOTIFICATION);
    record.setId(UUID.randomUUID());
    record.setAccountId(accountId);
    record.setNotificationType(type);
    record.setTitle(title);
    record.setMessage(message);
    record.setItemId(itemId);
    record.setIsRead(false);
    return this.save(record);
  }

  public List<NotificationRecord> findByAccountId(UUID accountId, int limit, int offset) {
    return dsl.selectFrom(NOTIFICATION).where(NOTIFICATION.ACCOUNT_ID.eq(accountId))
        .orderBy(NOTIFICATION.CREATED_AT.desc()).limit(limit).offset(offset).fetch();
  }

  public List<NotificationRecord> findUnreadByAccountId(UUID accountId, int limit, int offset) {
    return dsl.selectFrom(NOTIFICATION).where(NOTIFICATION.ACCOUNT_ID.eq(accountId)).and(NOTIFICATION.IS_READ.eq(false))
        .orderBy(NOTIFICATION.CREATED_AT.desc()).limit(limit).offset(offset).fetch();
  }

  public Optional<NotificationRecord> findByIdAndAccountId(UUID id, UUID accountId) {
    return dsl.selectFrom(NOTIFICATION).where(NOTIFICATION.ID.eq(id)).and(NOTIFICATION.ACCOUNT_ID.eq(accountId))
        .fetchOptional();
  }

  public int markAsRead(UUID id, UUID accountId) {
    return dsl.update(NOTIFICATION).set(NOTIFICATION.IS_READ, true).where(NOTIFICATION.ID.eq(id))
        .and(NOTIFICATION.ACCOUNT_ID.eq(accountId)).execute();
  }

  public int markAllAsRead(UUID accountId) {
    return dsl.update(NOTIFICATION).set(NOTIFICATION.IS_READ, true).where(NOTIFICATION.ACCOUNT_ID.eq(accountId))
        .and(NOTIFICATION.IS_READ.eq(false)).execute();
  }

  public long countUnreadByAccountId(UUID accountId) {
    return dsl.fetchCount(
        dsl.selectFrom(NOTIFICATION).where(NOTIFICATION.ACCOUNT_ID.eq(accountId)).and(NOTIFICATION.IS_READ.eq(false)));
  }

  public int delete(UUID id, UUID accountId) {
    return dsl.deleteFrom(NOTIFICATION).where(NOTIFICATION.ID.eq(id)).and(NOTIFICATION.ACCOUNT_ID.eq(accountId))
        .execute();
  }
}
