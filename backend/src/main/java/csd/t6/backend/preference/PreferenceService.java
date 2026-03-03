package csd.t6.backend.preference;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

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

  public List<PreferenceRecord> createNewPreference(UUID accountId, List<String> preferenceList) {
    if (preferenceList.size() == 0) {
      throw new BadRequestException("No preference selected");
    }
    return this.preferenceRepository.addPreference(accountId, preferenceList);
  }

}
