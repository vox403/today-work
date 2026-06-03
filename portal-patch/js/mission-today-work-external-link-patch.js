/* VOXTEK MISSION selector -> external today-work site */
(function () {
  "use strict";

  const TODAY_WORK_EXTERNAL_URL = "https://vox403.github.io/today-work/";
  const EMPLOYEE_KEY = "voxtek_employee_v1";

  function $(id) { return document.getElementById(id); }

  function getMissionShell() {
    return (
      document.querySelector("#window-helltalk .mission-shell") ||
      document.querySelector("#missionWindow .mission-shell") ||
      document.querySelector("#mission-window .mission-shell") ||
      (document.getElementById("missionGateView") && document.getElementById("missionGateView").closest(".mission-shell")) ||
      (document.getElementById("missionChatView") && document.getElementById("missionChatView").closest(".mission-shell")) ||
      document.querySelector(".mission-shell")
    );
  }

  function getEmployee() {
    try { return JSON.parse(localStorage.getItem(EMPLOYEE_KEY) || "null"); }
    catch (error) { return null; }
  }

  function isVisible(node) {
    if (!node) return false;
    if (node.classList && node.classList.contains("hidden")) return false;
    const style = window.getComputedStyle(node);
    return style.display !== "none" && style.visibility !== "hidden" && style.opacity !== "0";
  }

  function shouldUseMissionSelector() {
    const employee = getEmployee();
    if (!employee || employee.isAdmin) return false;

    try {
      if (typeof window.missionEnsureState === "function") {
        const state = window.missionEnsureState();
        if (state && state.missionAccessGranted) return true;
      }
    } catch (error) {}

    const gate = $("missionGateView");
    const chat = $("missionChatView");
    const setup = $("missionSetupView");
    const game = $("missionGameView");
    if (!isVisible(gate) && (isVisible(chat) || isVisible(setup) || isVisible(game))) return true;

    return false;
  }

  function ensureStyles() {
    if ($("missionExternalTodayWorkStyle")) return;
    const style = document.createElement("style");
    style.id = "missionExternalTodayWorkStyle";
    style.textContent = `
      .mission-selector-inner{padding:22px;min-height:560px;background:linear-gradient(180deg,rgba(3,18,31,.96),rgba(2,8,17,.98));border:1px solid rgba(0,216,255,.22)}
      .mission-selector-copy{border:1px solid rgba(0,216,255,.26);background:rgba(0,26,42,.58);padding:22px;margin-bottom:18px}
      .mission-selector-copy span{display:block;color:#00e5ff;letter-spacing:.22em;font-size:12px}
      .mission-selector-copy h3{font-size:38px;margin:14px 0 10px;color:#fff;letter-spacing:-.04em}
      .mission-selector-copy p{margin:0;color:#b8e9ff;line-height:1.7}
      .mission-selector-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
      .mission-selector-card{text-align:left;border:1px solid rgba(0,216,255,.34);background:linear-gradient(145deg,rgba(5,18,32,.96),rgba(3,12,23,.98));color:#eaf9ff;padding:20px;min-height:170px;cursor:pointer;position:relative;overflow:hidden}
      .mission-selector-card:before{content:"";position:absolute;right:-46px;bottom:-38px;width:130px;height:130px;border:1px solid rgba(0,216,255,.24);transform:skewX(-18deg)}
      .mission-selector-card:hover,.mission-selector-card:focus-visible{outline:none;border-color:rgba(255,255,255,.86);box-shadow:0 0 24px rgba(0,220,255,.16)}
      .mission-selector-card small{display:block;color:#7cb7ca;letter-spacing:.18em;margin-bottom:18px}
      .mission-selector-card strong{display:block;font-size:28px;margin-bottom:10px;color:#fff}
      .mission-selector-card span{display:block;color:#c8eeff;line-height:1.7}
      @media(max-width:760px){.mission-selector-grid{grid-template-columns:1fr}.mission-selector-copy h3{font-size:30px}}
    `;
    document.head.appendChild(style);
  }

  function ensureSelectorView() {
    const shell = getMissionShell();
    if (!shell) return false;

    if (!$("missionSelectorView")) {
      const selector = document.createElement("section");
      selector.id = "missionSelectorView";
      selector.className = "mission-panel hidden mission-selector-view";
      selector.innerHTML = `
        <div class="mission-top">
          <strong>VOXTEK MISSION CHANNEL</strong>
          <div class="mission-top-right"><span class="mission-status">CHANNEL SELECT</span></div>
        </div>
        <div class="mission-selector-inner">
          <div class="mission-selector-copy">
            <span>MISSION SELECTOR</span>
            <h3>채널을 선택하십시오.</h3>
            <p>기존 생명체 관리 임무와 오늘의 업무 채널을 분기합니다.</p>
          </div>
          <div class="mission-selector-grid">
            <button class="mission-selector-card" id="missionOpenEggChannel" type="button">
              <small>01 / EXISTING CHANNEL</small>
              <strong>알키우기</strong>
              <span>기존 생명체 관리 임무를 진행합니다. 기존 조건과 진행 기록은 유지됩니다.</span>
            </button>
            <button class="mission-selector-card" id="missionOpenTodayWorkChannel" type="button">
              <small>02 / DAILY CHANNEL</small>
              <strong>오늘의 업무</strong>
              <span>CCTV 기록 확인 후 단말기에 보고하는 사내 업무 채널입니다.</span>
            </button>
          </div>
        </div>
      `;
      shell.prepend(selector);
    }

    const eggBtn = $("missionOpenEggChannel");
    const todayBtn = $("missionOpenTodayWorkChannel");

    if (eggBtn && !eggBtn.dataset.bound) {
      eggBtn.dataset.bound = "1";
      eggBtn.addEventListener("click", showEggChannel);
    }

    if (todayBtn && !todayBtn.dataset.bound) {
      todayBtn.dataset.bound = "1";
      todayBtn.addEventListener("click", openExternalTodayWork);
    }

    return true;
  }

  function hideMissionPanels() {
    [
      "missionGateView", "missionChatView", "missionSetupView", "missionGameView",
      "missionFinalView", "missionDeadView", "missionSelectorView", "missionTodayWorkView"
    ].forEach((id) => {
      const node = $(id);
      if (node) node.classList.add("hidden");
    });
    const admin = $("adminMissionShell");
    if (admin) admin.classList.add("hidden");
  }

  function showMissionSelector() {
    ensureStyles();
    ensureSelectorView();
    hideMissionPanels();
    const selector = $("missionSelectorView");
    if (selector) selector.classList.remove("hidden");
  }

  function showEggChannel() {
    hideMissionPanels();
    if (typeof window.__voxtekOriginalMissionRender === "function") {
      window.__voxtekOriginalMissionRender();
    } else if ($("missionChatView")) {
      $("missionChatView").classList.remove("hidden");
    }
  }

  function openExternalTodayWork() {
    const employee = getEmployee() || {};
    const params = new URLSearchParams();
    params.set("return_url", location.href);
    if (employee.employeeId || employee.employee_id || employee.account_id) {
      params.set("employee_id", employee.employeeId || employee.employee_id || employee.account_id);
    }
    if (employee.name || employee.display_name || employee.employee_name) {
      params.set("employee_name", employee.name || employee.display_name || employee.employee_name);
    }

    location.href = TODAY_WORK_EXTERNAL_URL + "?" + params.toString();
  }

  function patchMissionRender() {
    if (!window.__voxtekExternalTodayWorkPatchApplied) {
      window.__voxtekExternalTodayWorkPatchApplied = true;

      if (typeof window.missionRender === "function") {
        window.__voxtekOriginalMissionRender = window.missionRender;
        window.missionRender = function missionRenderWithExternalTodayWork() {
          ensureStyles();
          ensureSelectorView();
          if (shouldUseMissionSelector()) {
            showMissionSelector();
            return;
          }
          return window.__voxtekOriginalMissionRender.apply(this, arguments);
        };
      }

      if (typeof window.missionVerifyPassword === "function") {
        const originalVerify = window.missionVerifyPassword;
        window.missionVerifyPassword = function missionVerifyPasswordWithExternalTodayWork() {
          const result = originalVerify.apply(this, arguments);
          setTimeout(() => {
            if (shouldUseMissionSelector()) showMissionSelector();
          }, 80);
          return result;
        };
      }
    }
  }

  function bindPasswordFollowup() {
    const btn = $("missionPasswordBtn");
    const input = $("missionPasswordInput");
    const follow = () => setTimeout(() => {
      patchMissionRender();
      if (shouldUseMissionSelector()) showMissionSelector();
    }, 120);

    if (btn && !btn.dataset.externalTodayWorkBound) {
      btn.dataset.externalTodayWorkBound = "1";
      btn.addEventListener("click", follow);
    }
    if (input && !input.dataset.externalTodayWorkBound) {
      input.dataset.externalTodayWorkBound = "1";
      input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") follow();
      });
    }
  }

  function init() {
    ensureStyles();
    ensureSelectorView();
    patchMissionRender();
    bindPasswordFollowup();
    window.__voxtekExternalTodayWorkReady = true;

    let tries = 0;
    const timer = setInterval(() => {
      tries += 1;
      ensureSelectorView();
      patchMissionRender();
      bindPasswordFollowup();
      if (shouldUseMissionSelector()) showMissionSelector();
      if (tries > 50) clearInterval(timer);
    }, 250);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
