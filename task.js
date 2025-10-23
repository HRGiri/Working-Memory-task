/* ---------------- Parameters ---------------- */
const allWords = [
  "apple", "grape", "pearl", "stone", "chair", "plant", "light", "cloud", "grass", "river",
  "flame", "trail", "smile", "bread", "brick", "table", "leafy", "beach", "crisp", "drink",
  "fence", "skirt", "spoon", "shell", "crown", "drift", "flock", "spark", "plank", "blaze",
  "cream", "glass", "glove", "shade", "flour", "sugar", "honey", "berry", "sheep", "horse",
  "tiger", "zebra", "snake", "mouse", "eagle", "piano", "harp", "drum", "viola", "flute",
  "stone", "steel", "brick", "paper", "cloth", "wheat", "corns", "grind", "smoke", "flask",
  "brush", "paint", "ruler", "plate", "spice", "straw", "frost", "chill", "storm", "bloom",
  "petal", "stalk", "rooty", "valve", "wheel", "screw", "nails", "hinge", "cable", "motor",
  "brain", "heart", "nerve", "blood", "skull", "liver", "limbs", "hands", "teeth", "mouth",
  "voice", "sound", "noise", "pitch", "tempo", "scale", "tone", "blink", "sight", "touch"
];

const setSizes = [8, 10, 12, 14];                 // default
const numResponsesPerTrial = 6;           // number of probe responses per trial
const numResponsesPerSetSize = 12;       // per set size
const numTrialsPerSetSize = Math.floor(numResponsesPerSetSize / numResponsesPerTrial);          // calculated based on above
const probeRatio = 0.5;                // 50% of probes come from studied set
const ITI = 3000;                      // inter-trial interval (ms)
let wordDisplayTime = 800;           // each word shown for 800 ms
const interWordInterval = 300;         // pause between words (ms)

let trials = [];
let currentTrial = 0;
let data = [];
let subjectName = "participant";

/* ---------------- URL Parameter Check ---------------- */
const params = new URLSearchParams(window.location.search);
// Add ?numResponses=<value> to URL to fix the number of responses.
// const numResponsesPerSetSizeParam = parseInt(params.get("numResponses"));
// if (!isNaN(numResponsesPerSetSizeParam)) {
//   numResponsesPerSetSize = numResponsesPerSetSizeParam;
// }

// Add ?wordTime=<value> to URL to fix word display time in ms.
const wordTimeParam = parseInt(params.get("wordTime"));
if (!isNaN(wordTimeParam)) {
  wordDisplayTime = wordTimeParam;
}

/* ---------------- Page Elements ---------------- */
const pages = {
  instruction: document.getElementById("instruction-page"),
  study: document.getElementById("study-page"),
  probe: document.getElementById("probe-page"),
  countdown: document.getElementById("countdown-page"),
  end: document.getElementById("end-page")
};
const studyWordDiv = document.getElementById("study-word");
const probeWordDiv = document.getElementById("probe-word");
const trialNumberSpan = document.getElementById("trial-number");
const countdownSpan = document.getElementById("countdown");
const thankYouText = document.getElementById("thank-you-text");
const overallAccuracySpan = document.getElementById("overall-accuracy");

/* ---------------- Task Flow ---------------- */
document.getElementById("start-btn").onclick = () => {
  const nameInput = document.getElementById("subject-name").value.trim();
  if (nameInput === "") {
    alert("Please enter your name before starting.");
    return;
  }
  subjectName = nameInput.replace(/\s+/g, "_");
  startTask();
};

function startTask() {
  generateTrials();
  currentTrial = 0;
  runNextTrial();
}

function generateTrials() {
  trials = [];
  setSizes.forEach(size => {
    for (let i = 0; i < numTrialsPerSetSize; i++) {
      const shuffled = [...allWords].sort(() => Math.random() - 0.5);
      const subset = shuffled.slice(0, size);
      trials.push({ set_size: size, subset: subset });
    }
  });
  trials = trials.sort(() => Math.random() - 0.5);
//   console.log("Generated Trials:", trials);
}

function runNextTrial() {
  if (currentTrial >= trials.length) {
    endTask();
    return;
  }
  const trial = trials[currentTrial];
  showStudySequence(trial);
}

function showStudySequence(trial) {
  hideAll();
  pages.study.classList.remove("hidden");
  let i = 0;
//   console.log("Trial", trial);
//   console.log("Trial subset:", trial.subset);

  function showNextWord() {
    if (i >= trial.subset.length) {
      setTimeout(() => showProbeLoop(trial), 500);
      return;
    }
    studyWordDiv.textContent = trial.subset[i];
    i++;
    setTimeout(() => {
      studyWordDiv.textContent = "";
      setTimeout(showNextWord, interWordInterval);
    }, wordDisplayTime);
  }

  showNextWord();
}

function showProbeLoop(trial) {
  hideAll();
  let numProbes = numResponsesPerTrial; //Math.round(trial.set_size / 2);
  let probes = [];

  let availableInSet = [...trial.subset];
  let availableOutSet = allWords.filter(w => !trial.subset.includes(w));

  for (let i = 0; i < numProbes; i++) {
  // Ensure we don't reuse words
    const fromSet = Math.random() < probeRatio && availableInSet.length > 0 || availableOutSet.length === 0;

    let word;
    if (fromSet) {
        const idx = Math.floor(Math.random() * availableInSet.length);
        word = availableInSet.splice(idx, 1)[0];  // remove it from available pool
    } else {
        const idx = Math.floor(Math.random() * availableOutSet.length);
        word = availableOutSet.splice(idx, 1)[0];
    }

    probes.push({ word, from_set: fromSet });
  }


  let probeIndex = 0;
  presentProbe();

  function presentProbe() {
    if (probeIndex >= probes.length) {
      currentTrial++;
      showCountdown();
      return;
    }

    hideAll();
    const p = probes[probeIndex];
    probeWordDiv.textContent = p.word;
    pages.probe.classList.remove("hidden");
    const startTime = performance.now();

    document.querySelectorAll("#confidence-buttons button").forEach(btn => {
      btn.onclick = () => {
        const rt = performance.now() - startTime;
        data.push({
          subject: subjectName,
          set_size: trial.set_size,
          word: p.word,
          from_set: p.from_set,
          response: btn.dataset.response,
          rt_ms: Math.round(rt)
        });
        probeIndex++;
        presentProbe();
      };
    });
  }
}

function showCountdown() {
  hideAll();
//   console.log("Current Trial:", currentTrial, "Total Trials:", trials.length);
  if (currentTrial < trials.length) {
  pages.countdown.classList.remove("hidden");
  let count = 3;
  trialNumberSpan.textContent = "" + (currentTrial + 1) + " / " + trials.length;
  countdownSpan.textContent = count;
  const timer = setInterval(() => {
    count--;
    countdownSpan.textContent = count;
    if (count === 0) {
      clearInterval(timer);
      runNextTrial();
    }
  }, 1000);
} else {
  runNextTrial();
}
}

function endTask() {
  hideAll();
  pages.end.classList.remove("hidden");
  thankYouText.textContent = `Thank you for participating, ${subjectName}!`;
  showAccuracySummary();
}

/* ---------------- Helpers ---------------- */
function hideAll() {
  Object.values(pages).forEach(p => p.classList.add("hidden"));
}

function showAccuracySummary() {
  // Compute overall accuracy
  const correct = data.filter(
    row =>
      (row.from_set && (row.response === "sure_yes" || row.response === "maybe_yes")) ||
      (!row.from_set && (row.response === "sure_no" || row.response === "maybe_no"))
  ).length;

  const accuracy = (correct / data.length) * 100;

  // Display results on final page
  overallAccuracySpan.textContent = accuracy.toFixed(1);

  // Trigger download
  downloadCSV();
}

function downloadCSV() {
  if (data.length === 0) return;
  const headers = Object.keys(data[0]);
  const csvContent = [headers.join(",")].concat(
    data.map(r => headers.map(h => r[h]).join(","))
  ).join("\n");

  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `subject_${subjectName}_data.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
