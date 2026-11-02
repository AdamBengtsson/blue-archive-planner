/**
 * Passphrase sign-in and cloud storage with Firebase.
 *
 * Signing in is one passphrase. Behind it is a single Firebase email/password
 * account with a fixed, made-up email (PLANNER_ACCOUNT below), so only the
 * passphrase is ever typed. The account is created by hand in the Firebase
 * console; the page never offers sign-up.
 *
 * Everything personal (gem log, units, archive, settings) lives in one
 * Firestore document per account: users/{uid}. The Firestore rules in
 * firestore.rules let only the owner's account read or write it, so the page
 * itself can be public. Signed out, it shows only the banner forecast.
 *
 * When firebase-config.js is still empty, none of this runs and the planner
 * keeps everything in this browser instead (see storage.js).
 *
 * The UI hands startCloud a set of callbacks, one for each situation:
 *   signedOut()          nobody is signed in
 *   loaded(state, user)  the account's saved state, on sign-in and whenever
 *                        another device changes it
 *   empty(user)          signed in, but nothing is saved for this account yet
 *   denied(user)         signed in, but the rules do not let this account in
 *   status(text)         a short line on how saving is going
 */

const cloud = {
  auth: null,
  doc: null,
  user: null,
  stopListening: null,
  saveTimer: null,
  pending: null,
  lastPayload: null,
  status: null
};

/** The one account the passphrase unlocks. Not a real mailbox; it only names the account. */
const PLANNER_ACCOUNT = "owner@blue-archive-planner.app";

/** How long to wait after an edit before writing, so a burst of taps is one write. */
const SAVE_DELAY_MS = 500;

/** True only when a real config has been filled in and the SDK loaded. */
function cloudConfigured() {
  return (
    typeof firebase !== "undefined" &&
    typeof firebaseConfig !== "undefined" &&
    Boolean(firebaseConfig.projectId)
  );
}

/** Connects to Firebase and follows the sign-in state. Returns false if it could not start. */
function startCloud(callbacks) {
  cloud.status = callbacks.status;
  try {
    if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
    cloud.auth = firebase.auth();
  } catch (error) {
    console.warn("Firebase could not start.", error);
    return false;
  }

  cloud.auth.onAuthStateChanged((user) => {
    stopListening();
    cloud.user = user;
    cloud.lastPayload = null;
    if (!user) {
      cloud.doc = null;
      callbacks.signedOut();
      return;
    }
    cloud.doc = firebase.firestore().doc(`users/${user.uid}`);
    listen(user, callbacks);
  });

  // A save still waiting when the tab closes or goes to the background is sent now.
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flushCloudSave();
  });
  window.addEventListener("beforeunload", flushCloudSave);
  return true;
}

/** Follows the account's document, so a change made on another device shows up here too. */
function listen(user, callbacks) {
  cloud.stopListening = cloud.doc.onSnapshot(
    (snapshot) => {
      // Our own write echoing back, or a remote change while we have unsaved edits.
      if (snapshot.metadata.hasPendingWrites || cloud.saveTimer) return;
      if (!snapshot.exists) {
        callbacks.empty(user);
        return;
      }
      const payload = snapshot.data().payload;
      if (!payload || payload === cloud.lastPayload) return;
      cloud.lastPayload = payload;
      try {
        callbacks.loaded(JSON.parse(payload), user);
      } catch (error) {
        console.warn("The saved planner data could not be read.", error);
        callbacks.status("Your saved data could not be read.");
      }
    },
    (error) => {
      if (error.code === "permission-denied") {
        callbacks.denied(user);
      } else {
        console.warn("Could not reach Firestore.", error);
        callbacks.status("Could not reach the cloud. Check your connection and reload.");
      }
    }
  );
}

function stopListening() {
  flushCloudSave();
  if (cloud.stopListening) cloud.stopListening();
  cloud.stopListening = null;
}

/**
 * Saves the state to the signed-in account. Writes are delayed a little and
 * skipped when nothing changed. The state is stored as one JSON string, so
 * Firestore's limits on nested arrays never come into play.
 */
function cloudSave(state, immediately) {
  if (!cloud.doc) return;
  const payload = JSON.stringify(state);
  if (payload === cloud.lastPayload && !cloud.saveTimer) return;
  cloud.lastPayload = payload;
  cloud.pending = payload;
  clearTimeout(cloud.saveTimer);
  cloud.saveTimer = setTimeout(flushCloudSave, immediately ? 0 : SAVE_DELAY_MS);
  if (cloud.status) cloud.status("Saving…");
}

/** Sends a waiting save right away. */
function flushCloudSave() {
  if (!cloud.saveTimer || !cloud.doc) return;
  clearTimeout(cloud.saveTimer);
  cloud.saveTimer = null;
  const payload = cloud.pending;
  const report = cloud.status || (() => {});
  cloud.doc
    .set({ payload, updatedAt: new Date().toISOString() })
    .then(() => report("Saved to the cloud."))
    .catch((error) => {
      console.warn("Could not save planner state to Firestore.", error);
      // Forget what we sent, so the next edit tries the whole state again.
      cloud.lastPayload = null;
      report("Could not save. Check your connection, then change something to try again.");
    });
}

/**
 * Signs in with the passphrase. Resolves with an error message for the page
 * to show, or null when it worked. Firebase keeps the session, so this is
 * needed once per browser.
 */
function cloudSignIn(passphrase) {
  return cloud.auth
    .signInWithEmailAndPassword(PLANNER_ACCOUNT, passphrase)
    .then(() => null)
    .catch((error) => {
      if (error.code === "auth/too-many-requests") return "Too many tries. Wait a few minutes and try again.";
      if (error.code === "auth/network-request-failed") return "Could not reach the sign-in service. Check your connection.";
      if (
        error.code === "auth/invalid-credential" ||
        error.code === "auth/wrong-password" ||
        error.code === "auth/user-not-found" ||
        error.code === "auth/invalid-login-credentials"
      ) {
        return "That passphrase is not right.";
      }
      console.warn("Sign-in failed.", error);
      return "Sign-in failed. Try again.";
    });
}

function cloudSignOut() {
  flushCloudSave();
  return cloud.auth.signOut();
}

/** The Firestore rules that give exactly this account access, for the first setup. */
function ownerRules(uid) {
  return `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null
        && request.auth.uid == userId
        && userId == "${uid}";
    }
  }
}`;
}
