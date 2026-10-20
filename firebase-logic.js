/**
 * Optional Firestore sync.
 *
 * The planner is fully usable without this: storage.js keeps everything in
 * browser localStorage. When firebase-config.js holds a real project id, this
 * file mirrors the state to a single document so other devices can pick it up.
 *
 * Document: planner/state
 *
 * The two functions the rest of the app looks for are startCloudSync and
 * pushStateToCloud. Both are defined unconditionally but do nothing when
 * Firebase is not configured, so the caller never has to check.
 */

let cloudDoc = null;

/** True only when a real config has been filled in and the SDK loaded. */
function cloudAvailable() {
  return (
    typeof firebase !== "undefined" &&
    typeof firebaseConfig !== "undefined" &&
    Boolean(firebaseConfig.projectId)
  );
}

/**
 * Connects to Firestore and hands the stored state back through onState.
 * Called once on page load; does nothing if Firebase is not configured.
 */
function startCloudSync(onState) {
  if (!cloudAvailable()) return;
  try {
    if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
    cloudDoc = firebase.firestore().doc("planner/state");
  } catch (error) {
    console.warn("Firebase could not start; staying on local storage.", error);
    cloudDoc = null;
    return;
  }

  cloudDoc
    .get()
    .then((snapshot) => {
      if (!snapshot.exists) return;
      const data = snapshot.data();
      if (data && data.payload) onState(JSON.parse(data.payload));
    })
    .catch((error) => console.warn("Could not read planner state from Firestore.", error));
}

/**
 * Mirrors the current state to Firestore. Fire and forget: a failure here is
 * logged but never blocks the user, since localStorage already has the save.
 *
 * The state is stored as a JSON string rather than a nested object so that
 * Firestore's limits on nested arrays never come into play.
 */
function pushStateToCloud(state) {
  if (!cloudDoc) return;
  cloudDoc
    .set({ payload: JSON.stringify(state), updatedAt: new Date().toISOString() })
    .catch((error) => console.warn("Could not save planner state to Firestore.", error));
}
