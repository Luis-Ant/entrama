import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it } from "vitest";
import { LAYOUT_PROFILE_ID } from "../keyboard-layouts/types";
import {
  UI_LOCALE,
  type CalibrationCompletion,
  type OnboardingSnapshot,
  type PreferenceRecord,
  type ProfileRecord,
  type TypingSessionRecord,
} from "../onboarding/repositories";
import { ONBOARDING_STATE, deriveOnboardingState } from "../onboarding/state";
import { SOUND_PROFILE_ID, THEME_ID, TYPOGRAPHY_ID } from "../styles/theme";
import { OnboardingDatabase } from "./database";
import {
  DexieCalibrationRepository,
  DexieOnboardingRepository,
  DexiePreferenceRepository,
  DexieProfileRepository,
  DexieTypingSessionRepository,
} from "./repositories";
import {
  parseTypingSessionRecord,
  projectCalibrationCompletion,
  projectPreferenceRecord,
  projectProfileRecord,
  projectTypingSessionRecord,
  typingSessionRecordSchema,
} from "./schemas";

describe("Dexie Storage Repositories", () => {
  let db: OnboardingDatabase;
  let repo: DexieOnboardingRepository;
  let profileRepo: DexieProfileRepository;
  let prefRepo: DexiePreferenceRepository;
  let calRepo: DexieCalibrationRepository;
  let typingRepo: DexieTypingSessionRepository;

  beforeEach(async () => {
    // Create a unique DB for each test to avoid cross-test pollution
    db = new OnboardingDatabase(
      `test-db-${Math.random().toString(36).slice(2)}`,
    );
    await db.open();
    repo = new DexieOnboardingRepository(db);
    profileRepo = new DexieProfileRepository(db);
    prefRepo = new DexiePreferenceRepository(db);
    calRepo = new DexieCalibrationRepository(db);
    typingRepo = new DexieTypingSessionRepository(db);
  });

  describe("ensureGuest", () => {
    it("creates a guest profile if none exists", async () => {
      const profile = await profileRepo.ensureGuest();
      expect(profile).toEqual({
        id: "guest",
        kind: "guest",
        updatedAt: expect.any(Number),
      });

      // Calling again returns the existing profile
      const again = await profileRepo.ensureGuest();
      expect(again).toEqual(profile);
    });
  });

  describe("saveLocale and confirmLayout", () => {
    it("saves locale without changing layoutProfileId", async () => {
      await prefRepo.saveLocale("guest", UI_LOCALE.SPANISH);
      const loaded = await prefRepo.load("guest");
      expect(loaded).toEqual({
        profileId: "guest",
        locale: UI_LOCALE.SPANISH,
      });
    });

    it("confirms layout and atomically invalidates previous calibration", async () => {
      await prefRepo.saveLocale("guest", UI_LOCALE.ENGLISH);
      await prefRepo.confirmLayout(
        "guest",
        LAYOUT_PROFILE_ID.WINDOWS_US_INTERNATIONAL,
      );

      await calRepo.replaceCompletion({
        id: "guest:cal1",
        profileId: "guest",
        layoutProfileId: LAYOUT_PROFILE_ID.WINDOWS_US_INTERNATIONAL,
        calibrationId: "def-v1",
        definitionVersion: 1,
        completedAt: Date.now(),
        passedStepIds: ["step1", "step2"],
      });

      // Verify calibration exists
      let cal = await calRepo.findValid("guest");
      expect(cal).toBeDefined();

      // Changing layout profile must atomically delete the calibration completion
      await prefRepo.confirmLayout(
        "guest",
        LAYOUT_PROFILE_ID.MACOS_US_INTERNATIONAL,
      );

      const pref = await prefRepo.load("guest");
      expect(pref?.layoutProfileId).toBe(
        LAYOUT_PROFILE_ID.MACOS_US_INTERNATIONAL,
      );

      cal = await calRepo.findValid("guest");
      expect(cal).toBeUndefined();
    });

    it("saves and updates theme, typography, and sound profile preferences", async () => {
      await prefRepo.saveLocale("guest", UI_LOCALE.ENGLISH);
      await prefRepo.savePreferences("guest", {
        theme: THEME_ID.MIDNIGHT,
        typography: TYPOGRAPHY_ID.SERIF,
        soundProfile: SOUND_PROFILE_ID.CLICKY,
      });

      const loaded = await prefRepo.load("guest");
      expect(loaded).toEqual({
        profileId: "guest",
        locale: UI_LOCALE.ENGLISH,
        theme: THEME_ID.MIDNIGHT,
        typography: TYPOGRAPHY_ID.SERIF,
        fontFamily: TYPOGRAPHY_ID.SERIF,
        soundProfile: SOUND_PROFILE_ID.CLICKY,
      });

      // Partial update should preserve other preferences
      await prefRepo.savePreferences("guest", {
        theme: THEME_ID.FOREST,
      });

      const updated = await prefRepo.load("guest");
      expect(updated?.theme).toBe(THEME_ID.FOREST);
      expect(updated?.typography).toBe(TYPOGRAPHY_ID.SERIF);
      expect(updated?.soundProfile).toBe(SOUND_PROFILE_ID.CLICKY);
    });
  });

  describe("prohibited-field stripping and strict allowlists", () => {
    it("strips prohibited raw input fields when projecting profile records", () => {
      const rawWithProhibited = {
        id: "guest",
        kind: "guest" as const,
        updatedAt: 12345,
        rawInput: "secret keypresses",
        eventStream: [1, 2, 3],
        timing: 999,
      };

      const projected = projectProfileRecord(rawWithProhibited);
      expect(projected).toEqual({
        id: "guest",
        kind: "guest",
        updatedAt: 12345,
      });
      expect(projected).not.toHaveProperty("rawInput");
      expect(projected).not.toHaveProperty("eventStream");
      expect(projected).not.toHaveProperty("timing");
    });

    it("strips prohibited raw input fields when projecting preference records", () => {
      const rawWithProhibited = {
        profileId: "guest",
        locale: "en" as const,
        layoutProfileId: LAYOUT_PROFILE_ID.WINDOWS_US_INTERNATIONAL,
        clipboard: "pasted text",
        keyCodes: ["KeyA"],
      };

      const projected = projectPreferenceRecord(rawWithProhibited);
      expect(projected).toEqual({
        profileId: "guest",
        locale: "en",
        layoutProfileId: LAYOUT_PROFILE_ID.WINDOWS_US_INTERNATIONAL,
      });
      expect(projected).not.toHaveProperty("clipboard");
      expect(projected).not.toHaveProperty("keyCodes");
    });

    it("projects valid theme, typography, and soundProfile fields cleanly", () => {
      const raw = {
        profileId: "guest",
        locale: "en" as const,
        theme: THEME_ID.MIDNIGHT,
        typography: TYPOGRAPHY_ID.SERIF,
        soundProfile: SOUND_PROFILE_ID.CLICKY,
        extraTracking: "ignore-me",
      };

      const projected = projectPreferenceRecord(raw);
      expect(projected).toEqual({
        profileId: "guest",
        locale: "en",
        theme: THEME_ID.MIDNIGHT,
        typography: TYPOGRAPHY_ID.SERIF,
        fontFamily: TYPOGRAPHY_ID.SERIF,
        soundProfile: SOUND_PROFILE_ID.CLICKY,
      });
      expect(projected).not.toHaveProperty("extraTracking");
    });

    it("strips prohibited raw input fields when projecting calibration completions", () => {
      const rawWithProhibited = {
        id: "guest:cal1",
        profileId: "guest",
        layoutProfileId: LAYOUT_PROFILE_ID.WINDOWS_US_INTERNATIONAL,
        calibrationId: "def-v1",
        definitionVersion: 1,
        completedAt: 1000,
        passedStepIds: ["step1"],
        rawInput: "abc",
        compositionState: "active",
        eventLog: ["keydown", "input"],
      };

      const projected = projectCalibrationCompletion(rawWithProhibited);
      expect(projected).toEqual({
        id: "guest:cal1",
        profileId: "guest",
        layoutProfileId: LAYOUT_PROFILE_ID.WINDOWS_US_INTERNATIONAL,
        calibrationId: "def-v1",
        definitionVersion: 1,
        completedAt: 1000,
        passedStepIds: ["step1"],
      });
      expect(projected).not.toHaveProperty("rawInput");
      expect(projected).not.toHaveProperty("compositionState");
      expect(projected).not.toHaveProperty("eventLog");
    });

    it("persists strictly projected records into Dexie without raw input payload", async () => {
      const snapshotWithExtra: OnboardingSnapshot & Record<string, unknown> = {
        profile: {
          id: "guest",
          kind: "guest",
          updatedAt: 500,
          ...({ rawEvents: ["a", "b"] } as Record<string, unknown>),
        },
        preference: {
          profileId: "guest",
          locale: UI_LOCALE.ENGLISH,
          layoutProfileId: LAYOUT_PROFILE_ID.WINDOWS_US_INTERNATIONAL,
          ...({ timingMs: 120 } as Record<string, unknown>),
        },
        completion: {
          id: "guest:cal1",
          profileId: "guest",
          layoutProfileId: LAYOUT_PROFILE_ID.WINDOWS_US_INTERNATIONAL,
          calibrationId: "def-v1",
          definitionVersion: 1,
          completedAt: 1000,
          passedStepIds: ["step1"],
          ...({ textCommitted: "á" } as Record<string, unknown>),
        },
      };

      await repo.save(snapshotWithExtra);

      // Raw query on Dexie tables directly to check raw stored objects
      const rawProfile = await db.profiles.get("guest");
      const rawPref = await db.preferences.get("guest");
      const rawCal = await db.calibrations.get("guest");

      expect(rawProfile).not.toHaveProperty("rawEvents");
      expect(rawPref).not.toHaveProperty("timingMs");
      expect(rawCal).not.toHaveProperty("textCommitted");
    });
  });

  describe("malformed-read quarantine", () => {
    it("quarantines malformed profile records and returns undefined", async () => {
      // Put a corrupted record directly into Dexie
      await db.profiles.put({
        id: "guest",
        kind: "admin",
        updatedAt: "invalid-date",
      } as unknown as ProfileRecord);

      const snapshot = await repo.load();
      expect(snapshot.profile).toBeUndefined();
    });

    it("quarantines malformed preference records (e.g. invalid locale or extra strict key) and returns undefined", async () => {
      await db.preferences.put({
        profileId: "guest",
        locale: "fr",
        extraKey: 123,
      } as unknown as PreferenceRecord);

      const snapshot = await repo.load();
      expect(snapshot.preference).toBeUndefined();
    });

    it("quarantines malformed preference records with invalid theme or soundProfile", async () => {
      await db.preferences.put({
        profileId: "guest",
        locale: "en",
        theme: "cyberpunk",
      } as unknown as PreferenceRecord);

      const snapshot = await repo.load();
      expect(snapshot.preference).toBeUndefined();
    });

    it("quarantines malformed calibration records and returns undefined", async () => {
      await db.calibrations.put({
        id: "guest:cal1",
        profileId: "guest",
        layoutProfileId: "unknown-profile",
        calibrationId: "def-v1",
        definitionVersion: "1",
        completedAt: 1000,
        passedStepIds: "not-an-array",
      } as unknown as CalibrationCompletion);

      const snapshot = await repo.load();
      expect(snapshot.completion).toBeUndefined();
    });
  });

  describe("valid offline restoration", () => {
    it("saves and restores snapshot across new database instances", async () => {
      const validSnapshot: OnboardingSnapshot = {
        profile: { id: "guest", kind: "guest", updatedAt: 1000 },
        preference: {
          profileId: "guest",
          locale: UI_LOCALE.ENGLISH,
          layoutProfileId: LAYOUT_PROFILE_ID.WINDOWS_US_INTERNATIONAL,
        },
        completion: {
          id: "guest:def-v1",
          profileId: "guest",
          layoutProfileId: LAYOUT_PROFILE_ID.WINDOWS_US_INTERNATIONAL,
          calibrationId: "def-v1",
          definitionVersion: 1,
          completedAt: 2000,
          passedStepIds: ["step1", "step2"],
        },
      };

      await repo.save(validSnapshot);

      // Re-instantiate repo with same db instance (simulating app reload)
      const reloadedRepo = new DexieOnboardingRepository(db);
      const loaded = await reloadedRepo.load();

      expect(loaded).toEqual(validSnapshot);

      const versions = { [LAYOUT_PROFILE_ID.WINDOWS_US_INTERNATIONAL]: 1 };
      const derivedState = deriveOnboardingState(loaded, versions);
      expect(derivedState).toBe(ONBOARDING_STATE.NEEDS_GUIDED_EXERCISE);
    });

    it("saves and restores snapshot with guidedCompletedAt timestamp", async () => {
      const completedSnapshot: OnboardingSnapshot = {
        profile: { id: "guest", kind: "guest", updatedAt: 1000 },
        preference: {
          profileId: "guest",
          locale: UI_LOCALE.ENGLISH,
          layoutProfileId: LAYOUT_PROFILE_ID.WINDOWS_US_INTERNATIONAL,
        },
        completion: {
          id: "guest:def-v1",
          profileId: "guest",
          layoutProfileId: LAYOUT_PROFILE_ID.WINDOWS_US_INTERNATIONAL,
          calibrationId: "def-v1",
          definitionVersion: 1,
          completedAt: 2000,
          passedStepIds: ["step1", "step2"],
          guidedCompletedAt: 3000,
        },
      };

      await repo.save(completedSnapshot);

      const reloadedRepo = new DexieOnboardingRepository(db);
      const loaded = await reloadedRepo.load();

      expect(loaded).toEqual(completedSnapshot);

      const versions = { [LAYOUT_PROFILE_ID.WINDOWS_US_INTERNATIONAL]: 1 };
      const derivedState = deriveOnboardingState(loaded, versions);
      expect(derivedState).toBe(ONBOARDING_STATE.GUIDED_EXERCISE_COMPLETE);
    });
  });

  describe("DexieTypingSessionRepository & Schemas", () => {
    const validSession: TypingSessionRecord = {
      id: "session-1",
      profileId: "guest",
      timestamp: 1000,
      completedAt: 1000,
      category: "technology",
      locale: UI_LOCALE.ENGLISH,
      durationPreset: 30,
      presetSeconds: 30,
      netWpm: 45.5,
      grossWpm: 48.0,
      accuracy: 97.2,
      characterCount: 150,
      errorCount: 2,
      elapsedSeconds: 30,
    };

    describe("typingSessionRecordSchema & projectTypingSessionRecord", () => {
      it("validates a compliant typing session record", () => {
        const parsed = typingSessionRecordSchema.parse(validSession);
        expect(parsed).toEqual(validSession);
      });

      it("strips prohibited raw keystroke telemetry fields when projecting", () => {
        const rawWithProhibited = {
          ...validSession,
          rawKeystrokes: ["KeyA", "KeyB", "Space"],
          eventStream: [{ code: "KeyA", time: 100 }],
          clipboard: "pasted password",
          keyLog: "secret text",
        };

        const projected = projectTypingSessionRecord(rawWithProhibited);
        expect(projected).toEqual(validSession);
        expect(projected).not.toHaveProperty("rawKeystrokes");
        expect(projected).not.toHaveProperty("eventStream");
        expect(projected).not.toHaveProperty("clipboard");
        expect(projected).not.toHaveProperty("keyLog");
      });

      it("handles durationPreset and presetSeconds interchangeably", () => {
        const withOnlyDurationPreset = {
          ...validSession,
          durationPreset: 60,
          presetSeconds: undefined,
        };
        const projected1 = projectTypingSessionRecord(withOnlyDurationPreset);
        expect(projected1.durationPreset).toBe(60);
        expect(projected1.presetSeconds).toBe(60);

        const withOnlyPresetSeconds = {
          ...validSession,
          durationPreset: undefined,
          presetSeconds: 120,
        };
        const projected2 = projectTypingSessionRecord(withOnlyPresetSeconds);
        expect(projected2.durationPreset).toBe(120);
        expect(projected2.presetSeconds).toBe(120);

        const withNullPreset = {
          ...validSession,
          durationPreset: null,
          presetSeconds: null,
        };
        const projected3 = projectTypingSessionRecord(withNullPreset);
        expect(projected3.durationPreset).toBeNull();
        expect(projected3.presetSeconds).toBeNull();
      });

      it("quarantines malformed typing session records via parseTypingSessionRecord", () => {
        const corrupted = {
          id: "session-corrupt",
          profileId: "guest",
          category: "invalid-category",
          netWpm: "fast",
        };

        const parsed = parseTypingSessionRecord(corrupted);
        expect(parsed).toBeUndefined();
      });
    });

    describe("saveSession and listRecentSessions / getRecentSessions", () => {
      it("saves and retrieves recent sessions sorted by timestamp descending", async () => {
        const session1: TypingSessionRecord = {
          id: "session-1",
          profileId: "guest",
          timestamp: 1000,
          category: "stories",
          locale: UI_LOCALE.ENGLISH,
          durationPreset: 30,
          netWpm: 40,
          grossWpm: 42,
          accuracy: 95,
          characterCount: 120,
          errorCount: 3,
          elapsedSeconds: 30,
        };

        const session2: TypingSessionRecord = {
          id: "session-2",
          profileId: "guest",
          timestamp: 2000,
          category: "technology",
          locale: UI_LOCALE.SPANISH,
          durationPreset: 60,
          netWpm: 55,
          grossWpm: 56,
          accuracy: 98,
          characterCount: 280,
          errorCount: 1,
          elapsedSeconds: 60,
        };

        const session3: TypingSessionRecord = {
          id: "session-3",
          profileId: "guest",
          timestamp: 3000,
          category: "code",
          locale: UI_LOCALE.ENGLISH,
          durationPreset: null,
          netWpm: 60,
          grossWpm: 62,
          accuracy: 99,
          characterCount: 350,
          errorCount: 1,
          elapsedSeconds: 70,
        };

        await typingRepo.saveSession(session1);
        await typingRepo.saveSession(session2);
        await typingRepo.saveSession(session3);

        const recent = await typingRepo.listRecentSessions("guest", 2);
        expect(recent).toHaveLength(2);
        expect(recent[0].id).toBe("session-3");
        expect(recent[1].id).toBe("session-2");

        const allRecent = await typingRepo.getRecentSessions("guest");
        expect(allRecent).toHaveLength(3);
        expect(allRecent[0].id).toBe("session-3");
        expect(allRecent[1].id).toBe("session-2");
        expect(allRecent[2].id).toBe("session-1");
      });

      it("quarantines corrupted typing session records from query results", async () => {
        await typingRepo.saveSession(validSession);

        // Directly inject corrupted record into Dexie table
        await db.typingSessions.put({
          id: "corrupted-session",
          profileId: "guest",
          category: "non-existent-cat",
          netWpm: "invalid",
        } as unknown as TypingSessionRecord);

        const recent = await typingRepo.listRecentSessions("guest");
        expect(recent).toHaveLength(1);
        expect(recent[0].id).toBe("session-1");
      });

      it("isolates sessions by profileId", async () => {
        await typingRepo.saveSession(validSession);
        await typingRepo.saveSession({
          ...validSession,
          id: "session-other",
          profileId: "user-2",
          timestamp: 5000,
        });

        const guestSessions = await typingRepo.listRecentSessions("guest");
        expect(guestSessions).toHaveLength(1);
        expect(guestSessions[0].id).toBe("session-1");

        const user2Sessions = await typingRepo.listRecentSessions("user-2");
        expect(user2Sessions).toHaveLength(1);
        expect(user2Sessions[0].id).toBe("session-other");
      });

      it("clears sessions by profileId or globally", async () => {
        await typingRepo.saveSession(validSession);
        await typingRepo.saveSession({
          ...validSession,
          id: "session-other",
          profileId: "user-2",
          timestamp: 5000,
        });

        await typingRepo.clearSessions("guest");
        expect(await typingRepo.listRecentSessions("guest")).toHaveLength(0);
        expect(await typingRepo.listRecentSessions("user-2")).toHaveLength(1);

        await typingRepo.clearSessions();
        expect(await typingRepo.listRecentSessions("user-2")).toHaveLength(0);
      });
    });
  });
});
