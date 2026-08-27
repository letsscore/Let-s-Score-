(() => {
"use strict";

const SUPABASE_CDN =
  "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";

const CLASSES = ["VI","VII","VIII","IX","X","XI","XII"];

let sb = null;
let rows = [];

const $ = id => document.getElementById(id);

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, ch => ({
    "&":"&amp;",
    "<":"&lt;",
    ">":"&gt;",
    '"':"&quot;",
    "'":"&#39;"
  }[ch]));
}

function showLoginError(message) {
  const box = $("loginError");
  const ok = $("loginSuccess");

  if (ok) ok.classList.add("rt-hidden");

  if (box) {
    box.textContent = message;
    box.classList.remove("rt-hidden");
  }
}

function showLoginSuccess(message) {
  const box = $("loginSuccess");
  const err = $("loginError");

  if (err) err.classList.add("rt-hidden");

  if (box) {
    box.textContent = message;
    box.classList.remove("rt-hidden");
  }
}

function toast(message, type = "") {
  let el = $("toast");

  if (!el) {
    el = document.createElement("div");
    el.id = "toast";
    el.className = "rt-toast";
    document.body.appendChild(el);
  }

  el.textContent = message;
  el.className = "rt-toast " + type;

  clearTimeout(window.__rtToastTimer);
  window.__rtToastTimer =
    setTimeout(() => el.remove(), 3500);
}

async function loadSupabaseLibrary() {
  if (window.supabase) return;

  await new Promise((resolve, reject) => {
    const script = document.createElement("script");

    script.src = SUPABASE_CDN;

    script.onload = resolve;

    script.onerror = () =>
      reject(
        new Error("Could not load the Supabase library.")
      );

    document.head.appendChild(script);
  });
}

async function initSupabase() {
  if (sb) return sb;

  const config = window.LETS_SCORE_SUPABASE;

  if (!config) {
    throw new Error(
      "Supabase configuration was not loaded. Check supabase-config.js."
    );
  }

  if (!config.url || !config.anonKey) {
    throw new Error(
      "Supabase URL or publishable key is missing."
    );
  }

  await loadSupabaseLibrary();

  sb = window.supabase.createClient(
    config.url,
    config.anonKey,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false
      }
    }
  );

  return sb;
}

async function teacherLogin() {
  const email = $("email")?.value.trim();
  const password = $("password")?.value;

  if (!email) {
    showLoginError("Please enter your teacher email.");
    return;
  }

  if (!password) {
    showLoginError("Please enter your password.");
    return;
  }

  const button = $("loginBtn");

  if (button) {
    button.disabled = true;
    button.textContent = "Signing in…";
  }

  try {
    await initSupabase();

    const { data, error } =
      await sb.auth.signInWithPassword({
        email,
        password
      });

    if (error) {
      console.error("Supabase login error:", error);

      let message = error.message || "Login failed.";

      if (
        error.message?.toLowerCase().includes("invalid login")
      ) {
        message =
          "Invalid email or password. Check the password you just set in Supabase.";
      }

      showLoginError(message);
      return;
    }

    if (!data?.session || !data?.user) {
      showLoginError(
        "Login succeeded but no active session was returned."
      );
      return;
    }

    // Verify that this authenticated user is actually a Teacher.
    const { data: profile, error: profileError } =
      await sb
        .from("teacher_profiles")
        .select("user_id,display_name")
        .eq("user_id", data.user.id)
        .maybeSingle();

    if (profileError) {
      console.error(
        "Teacher profile error:",
        profileError
      );

      await sb.auth.signOut();

      showLoginError(
        "Authentication succeeded, but the Teacher profile could not be verified."
      );
      return;
    }

    if (!profile) {
      await sb.auth.signOut();

      showLoginError(
        "This account is not registered as a Teacher."
      );
      return;
    }

    showLoginSuccess(
      "Login successful. Loading Teacher Control…"
    );

    $("login").classList.add("rt-hidden");
    $("app").classList.remove("rt-hidden");

    await loadDashboard();

  } catch (error) {
    console.error("Teacher login exception:", error);

    showLoginError(
      "System error: " +
      (error.message || String(error))
    );

  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = "Sign In";
    }
  }
}

async function restoreSession() {
  try {
    await initSupabase();

    const { data, error } =
      await sb.auth.getSession();

    if (error) {
      console.error(error);
      return;
    }

    if (!data?.session?.user) return;

    const { data: profile } =
      await sb
        .from("teacher_profiles")
        .select("user_id,display_name")
        .eq("user_id", data.session.user.id)
        .maybeSingle();

    if (!profile) {
      await sb.auth.signOut();
      return;
    }

    $("login").classList.add("rt-hidden");
    $("app").classList.remove("rt-hidden");

    await loadDashboard();

  } catch (error) {
    console.error(
      "Session restoration failed:",
      error
    );
  }
}

async function loadDashboard() {
  const { data, error } =
    await sb
      .from("revision_tests")
      .select("*")
      .order("class");

  if (error) throw error;

  rows = data || [];

  $("classSelect").innerHTML =
    CLASSES
      .map(c => `<option value="${c}">Class ${c}</option>`)
      .join("");

  renderTable();
  loadEditor();
}

function renderTable() {
  const table = $("testRows");

  if (!table) return;

  table.innerHTML = CLASSES.map(c => {

    const row =
      rows.find(item => item.class === c) || {};

    const live = row.is_live === true;

    return `
      <tr>
        <td><b>Class ${c}</b></td>

        <td>${esc(row.title || "Revisionary Test")}</td>

        <td>${Array.isArray(row.questions)
          ? row.questions.length
          : 0}</td>

        <td>
          ${
            live
            ? '<span class="rt-status on">LIVE</span>'
            : '<span class="rt-status off">NOT STARTED</span>'
          }
        </td>

        <td>
          <button
            class="rt-btn small ${live ? "danger" : "success"}"
            type="button"
            onclick="window.rtToggle('${c}', ${!live})">
            ${live ? "Stop Test" : "Start Test"}
          </button>
        </td>
      </tr>
    `;
  }).join("");
}

function loadEditor() {
  const className = $("classSelect").value;

  const row =
    rows.find(item => item.class === className);

  $("titleInput").value =
    row?.title || "Revisionary Test";

  $("durationInput").value =
    row?.duration_minutes || 30;

  $("questionsInput").value =
    JSON.stringify(
      row?.questions || [],
      null,
      2
    );

  $("liveLabel").textContent =
    row?.is_live
      ? "TEST IS LIVE"
      : "TEST IS NOT STARTED";
}

function parseQuestions() {
  let questions;

  try {
    questions =
      JSON.parse($("questionsInput").value);
  } catch {
    throw new Error(
      "Questions JSON is invalid."
    );
  }

  if (
    !Array.isArray(questions) ||
    questions.length === 0
  ) {
    throw new Error(
      "Add at least one question."
    );
  }

  questions.forEach((q, index) => {

    if (
      !q.question ||
      !Array.isArray(q.options) ||
      q.options.length < 2 ||
      typeof q.answer !== "number"
    ) {
      throw new Error(
        `Question ${index + 1} is incomplete.`
      );
    }

    if (
      q.answer < 0 ||
      q.answer >= q.options.length
    ) {
      throw new Error(
        `Question ${index + 1} has an invalid answer.`
      );
    }
  });

  return questions;
}

async function saveTest(liveValue = null) {
  const className =
    $("classSelect").value;

  const questions =
    parseQuestions();

  const existing =
    rows.find(item =>
      item.class === className
    );

  const payload = {
    class: className,
    title:
      $("titleInput").value.trim() ||
      "Revisionary Test",
    duration_minutes:
      Number($("durationInput").value) || 30,
    questions
  };

  if (liveValue !== null) {
    payload.is_live = liveValue;
  }

  let result;

  if (existing) {

    result =
      await sb
        .from("revision_tests")
        .update(payload)
        .eq("id", existing.id);

  } else {

    result =
      await sb
        .from("revision_tests")
        .insert({
          ...payload,
          is_live:
            liveValue === true
        });
  }

  if (result.error) {
    throw result.error;
  }

  await loadDashboard();

  toast(
    liveValue === true
      ? `Class ${className} test is now LIVE.`
      : liveValue === false
        ? `Class ${className} test stopped.`
        : `Class ${className} test saved.`,
    "ok"
  );
}

async function toggleTest(className, value) {
  $("classSelect").value = className;
  loadEditor();

  try {
    await saveTest(value);
  } catch (error) {
    console.error(error);
    toast(
      error.message || "Could not update test.",
      "err"
    );
  }
}

async function logout() {
  if (sb) {
    await sb.auth.signOut();
  }

  location.reload();
}

document.addEventListener(
  "DOMContentLoaded",
  async () => {

    $("loginBtn")?.addEventListener(
      "click",
      teacherLogin
    );

    $("password")?.addEventListener(
      "keydown",
      event => {
        if (event.key === "Enter") {
          teacherLogin();
        }
      }
    );

    $("classSelect")?.addEventListener(
      "change",
      loadEditor
    );

    $("saveBtn")?.addEventListener(
      "click",
      async () => {
        try {
          await saveTest();
        } catch (error) {
          toast(
            error.message ||
            "Could not save test.",
            "err"
          );
        }
      }
    );

    $("startBtn")?.addEventListener(
      "click",
      async () => {
        try {
          await saveTest(true);
        } catch (error) {
          toast(
            error.message ||
            "Could not start test.",
            "err"
          );
        }
      }
    );

    $("stopBtn")?.addEventListener(
      "click",
      async () => {
        try {
          await saveTest(false);
        } catch (error) {
          toast(
            error.message ||
            "Could not stop test.",
            "err"
          );
        }
      }
    );

    $("logoutBtn")?.addEventListener(
      "click",
      logout
    );

    try {
      await restoreSession();
    } catch (error) {
      console.error(error);
    }
  }
);

window.rtToggle = toggleTest;

})();
