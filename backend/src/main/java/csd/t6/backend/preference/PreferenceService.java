package csd.t6.backend.preference;

import static csd.t6.jooq.accounts.tables.Preference.PREFERENCE;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import csd.t6.backend.exceptions.BadRequestException;
import csd.t6.jooq.accounts.tables.records.PreferenceRecord;

@Service
public class PreferenceService {
  private final PreferenceRepository preferenceRepository;

  public PreferenceService(PreferenceRepository preferenceRepository) {
    this.preferenceRepository = preferenceRepository;
  }

  public List<String> getTopics(UUID accountId) {
    return preferenceRepository.findTopics(accountId);
  }

  @Transactional
  public List<PreferenceRecord> createNewPreference(UUID accountId, List<String> preferenceList) {
    if (preferenceList == null || preferenceList.isEmpty()) {
      throw new BadRequestException("No preference selected");
    }
    this.preferenceRepository.delete(PREFERENCE.ACCOUNT_ID,accountId );
    return this.preferenceRepository.addPreference(accountId, preferenceList);
  }

}
