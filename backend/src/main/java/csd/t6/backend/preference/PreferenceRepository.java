package csd.t6.backend.preference;

import static csd.t6.jooq.accounts.tables.Preference.PREFERENCE;

import java.util.List;
import java.util.UUID;

import org.jooq.DSLContext;
import org.springframework.stereotype.Repository;

import csd.t6.backend.utils.BaseRepository;
import csd.t6.jooq.accounts.tables.records.PreferenceRecord;

@Repository
public class PreferenceRepository extends BaseRepository<PreferenceRecord> {
  public PreferenceRepository(DSLContext dsl) {
    super(dsl, PREFERENCE);
  }

  public List<String> findTopics(UUID accountId) {
    return dsl.select(PREFERENCE.TOPIC).from(PREFERENCE).where(PREFERENCE.ACCOUNT_ID.eq(accountId))
        .fetch(PREFERENCE.TOPIC);
  }

  public List<PreferenceRecord> addPreference(UUID accountId, List<String> preference) {
    List<PreferenceRecord> list = preference.stream().map(pref -> new PreferenceRecord(accountId, pref)).toList();

    this.dsl.batchInsert(list).execute();

    return list;
  }
}
