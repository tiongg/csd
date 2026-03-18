package csd.t6.backend.contributor;

import static csd.t6.jooq.public_.tables.PendingContributors.PENDING_CONTRIBUTORS;
import static org.assertj.core.api.Assertions.assertThatNoException;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.UUID;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import csd.t6.backend.exceptions.BadRequestException;
import csd.t6.backend.notification.NotificationService;
import csd.t6.jooq.public_.tables.records.PendingContributorsRecord;

@ExtendWith(MockitoExtension.class)
class ContributorServiceTest {

    @Mock
    private PendingContributorRepository pendingContributorRepository;
    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private ContributorService contributorService;

    @Test
    @DisplayName("Should insert pending contributor successfully")
    void shouldInsertPendingContributor() {
        UUID learnerId = UUID.randomUUID();
        when(pendingContributorRepository.exists(PENDING_CONTRIBUTORS.LEARNER_ID, learnerId)).thenReturn(false);
        when(pendingContributorRepository.insertPendingContributor(learnerId))
                .thenReturn(mock(PendingContributorsRecord.class));

        assertThatNoException().isThrownBy(() -> contributorService.insertPendingContributor(learnerId));

        verify(pendingContributorRepository).insertPendingContributor(learnerId);
    }

    @Test
    @DisplayName("Should throw when user is already pending")
    void shouldThrowWhenAlreadyPending() {
        UUID learnerId = UUID.randomUUID();
        when(pendingContributorRepository.exists(PENDING_CONTRIBUTORS.LEARNER_ID, learnerId)).thenReturn(true);

        assertThatThrownBy(() -> contributorService.insertPendingContributor(learnerId))
                .isInstanceOf(BadRequestException.class).hasMessageContaining("pending approval");

        verify(pendingContributorRepository, never()).insertPendingContributor(any());
    }
}