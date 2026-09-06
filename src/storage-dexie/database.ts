import Dexie, { type Table } from "dexie";
import type {
  CalibrationCompletion,
  PreferenceRecord,
  ProfileRecord,
  TypingSessionRecord,
} from "../onboarding/repositories";

export class OnboardingDatabase extends Dexie {
  profiles!: Table<ProfileRecord, string>;
  preferences!: Table<PreferenceRecord, string>;
  calibrations!: Table<CalibrationCompletion, string>;
  typingSessions!: Table<TypingSessionRecord, string>;

  constructor(databaseName = "entrama_onboarding") {
    super(databaseName);
    this.version(1).stores({
      profiles: "id",
      preferences: "profileId",
      calibrations: "profileId",
    });
    this.version(2).stores({
      profiles: "id",
      preferences: "profileId",
      calibrations: "profileId",
      typingSessions:
        "id, profileId, timestamp, completedAt, category, locale, presetSeconds",
    });
  }
}

export const defaultOnboardingDatabase = new OnboardingDatabase();
