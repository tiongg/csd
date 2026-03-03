package csd.t6.backend.preference;

import static csd.t6.jooq.accounts.tables.Preference.PREFERENCE;

import java.util.ArrayList;
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
    List<PreferenceRecord> list = new ArrayList<>();
    for (String pref : preference) {
      PreferenceRecord rec = new PreferenceRecord(accountId, pref);
      list.add(rec);
    }
    ;
    this.dsl.batchInsert(list).execute();

    // for (String pref : preference) {
    // this.dsl.insertInto(PREFERENCE, PREFERENCE.ACCOUNT_ID,
    // PREFERENCE.TOPIC).values(accountId, pref).execute();
    // }
    return list;
  }
}
