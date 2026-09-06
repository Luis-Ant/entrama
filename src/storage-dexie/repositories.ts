import type { LayoutProfileId } from "../keyboard-layouts/types";
import {
  UI_LOCALE,
  type CalibrationCompletion,
  type CalibrationRepository,
  type OnboardingRepository,
  type OnboardingSnapshot,
  type PreferenceRecord,
  type PreferenceRepository,
  type ProfileRecord,
  type ProfileRepository,
  type TypingSessionRecord,
  type TypingSessionRepository,
  type UiLocale,
} from "../onboarding/repositories";
import { defaultOnboardingDatabase, OnboardingDatabase } from "./database";
import {
  parseCalibrationCompletion,
  parsePreferenceRecord,
  parseProfileRecord,
  parseTypingSessionRecord,
  projectCalibrationCompletion,
  projectPreferenceRecord,
  projectProfileRecord,
  projectTypingSessionRecord,
} from "./schemas";

export class DexieProfileRepository implements ProfileRepository {
  constructor(
    private readonly db: OnboardingDatabase = defaultOnboardingDatabase,
  ) {}

  async ensureGuest(): Promise<ProfileRecord> {
    const raw = await this.db.profiles.get("guest");
    const existing = parseProfileRecord(raw);
    if (existing) {
      return existing;
    }
    const created: ProfileRecord = {
      id: "guest",
      kind: "guest",
      updatedAt: Date.now(),
    };
    const projected = projectProfileRecord(created);
    await this.db.profiles.put(projected);
    return projected;
  }
}

export class DexiePreferenceRepository implements PreferenceRepository {
  constructor(
    private readonly db: OnboardingDatabase = defaultOnboardingDatabase,
  ) {}

  async load(profileId: string): Promise<PreferenceRecord | undefined> {
    const raw = await this.db.preferences.get(profileId);
    return parsePreferenceRecord(raw);
  }

  async saveLocale(profileId: string, locale: UiLocale): Promise<void> {
    const existing = await this.load(profileId);
    const updated = projectPreferenceRecord({
      profileId,
      locale,
      layoutProfileId: existing?.layoutProfileId,
      theme: existing?.theme,
      typography: existing?.typography ?? existing?.fontFamily,
      fontFamily: existing?.fontFamily ?? existing?.typography,
      soundProfile: existing?.soundProfile,
    });
    await this.db.preferences.put(updated);
  }

  async confirmLayout(
    profileId: string,
    layoutProfileId: LayoutProfileId,
  ): Promise<void> {
    await this.db.transaction(
      "rw",
      [this.db.preferences, this.db.calibrations],
      async () => {
        const existingRaw = await this.db.preferences.get(profileId);
        const existing = parsePreferenceRecord(existingRaw);
        const updated = projectPreferenceRecord({
          profileId,
          locale: existing?.locale ?? UI_LOCALE.ENGLISH,
          layoutProfileId,
          theme: existing?.theme,
          typography: existing?.typography ?? existing?.fontFamily,
          fontFamily: existing?.fontFamily ?? existing?.typography,
          soundProfile: existing?.soundProfile,
        });
        await this.db.preferences.put(updated);
        await this.db.calibrations.delete(profileId);
      },
    );
  }

  async savePreferences(
    profileId: string,
    updates: Partial<PreferenceRecord>,
  ): Promise<void> {
    const existing = await this.load(profileId);
    const updated = projectPreferenceRecord({
      profileId,
      locale: updates.locale ?? existing?.locale ?? UI_LOCALE.ENGLISH,
      layoutProfileId: updates.layoutProfileId ?? existing?.layoutProfileId,
      theme: updates.theme ?? existing?.theme,
      typography:
        updates.typography ??
        updates.fontFamily ??
        existing?.typography ??
        existing?.fontFamily,
      fontFamily:
        updates.fontFamily ??
        updates.typography ??
        existing?.fontFamily ??
        existing?.typography,
      soundProfile: updates.soundProfile ?? existing?.soundProfile,
    });
    await this.db.preferences.put(updated);
  }
}

export class DexieCalibrationRepository implements CalibrationRepository {
  constructor(
    private readonly db: OnboardingDatabase = defaultOnboardingDatabase,
  ) {}

  async findValid(
    profileId: string,
  ): Promise<CalibrationCompletion | undefined> {
    const raw = await this.db.calibrations.get(profileId);
    return parseCalibrationCompletion(raw);
  }

  async replaceCompletion(completion: CalibrationCompletion): Promise<void> {
    const projected = projectCalibrationCompletion(completion);
    await this.db.calibrations.put(projected);
  }
}

export class DexieOnboardingRepository implements OnboardingRepository {
  constructor(
    private readonly db: OnboardingDatabase = defaultOnboardingDatabase,
  ) {}

  async load(): Promise<OnboardingSnapshot> {
    const rawProfile = await this.db.profiles.get("guest");
    const profile = parseProfileRecord(rawProfile);
    if (!profile) {
      return {};
    }
    const rawPref = await this.db.preferences.get(profile.id);
    const preference = parsePreferenceRecord(rawPref);

    const rawCal = await this.db.calibrations.get(profile.id);
    const completion = parseCalibrationCompletion(rawCal);

    return {
      profile,
      ...(preference ? { preference } : {}),
      ...(completion ? { completion } : {}),
    };
  }

  async save(snapshot: OnboardingSnapshot): Promise<void> {
    await this.db.transaction(
      "rw",
      [this.db.profiles, this.db.preferences, this.db.calibrations],
      async () => {
        if (snapshot.profile) {
          const projectedProfile = projectProfileRecord(snapshot.profile);
          await this.db.profiles.put(projectedProfile);
        }

        if (snapshot.preference) {
          const existingRaw = await this.db.preferences.get(
            snapshot.preference.profileId,
          );
          const existingPref = parsePreferenceRecord(existingRaw);
          const projectedPref = projectPreferenceRecord(snapshot.preference);
          await this.db.preferences.put(projectedPref);

          if (
            existingPref?.layoutProfileId &&
            existingPref.layoutProfileId !== snapshot.preference.layoutProfileId
          ) {
            await this.db.calibrations.delete(snapshot.preference.profileId);
          }
        }

        if (snapshot.completion) {
          const projectedCal = projectCalibrationCompletion(
            snapshot.completion,
          );
          await this.db.calibrations.put(projectedCal);
        }
      },
    );
  }
}

export class DexieTypingSessionRepository implements TypingSessionRepository {
  constructor(
    private readonly db: OnboardingDatabase = defaultOnboardingDatabase,
  ) {}

  async saveSession(record: TypingSessionRecord): Promise<void> {
    const projected = projectTypingSessionRecord(record);
    await this.db.typingSessions.put(projected);
  }

  async listRecentSessions(
    profileId: string,
    limit: number = 10,
  ): Promise<readonly TypingSessionRecord[]> {
    const rawList = await this.db.typingSessions
      .where("profileId")
      .equals(profileId)
      .toArray();

    rawList.sort((a, b) => {
      const timeA = a.timestamp ?? a.completedAt ?? 0;
      const timeB = b.timestamp ?? b.completedAt ?? 0;
      return timeB - timeA;
    });

    const validSessions = rawList
      .map(parseTypingSessionRecord)
      .filter(
        (session): session is TypingSessionRecord => session !== undefined,
      );

    return limit > 0 ? validSessions.slice(0, limit) : validSessions;
  }

  async getRecentSessions(
    profileId: string,
    limit: number = 10,
  ): Promise<readonly TypingSessionRecord[]> {
    return this.listRecentSessions(profileId, limit);
  }

  async clearSessions(profileId?: string): Promise<void> {
    if (profileId) {
      await this.db.typingSessions
        .where("profileId")
        .equals(profileId)
        .delete();
    } else {
      await this.db.typingSessions.clear();
    }
  }
}
