# 🧠 Visual Working Memory Task

This repository contains a browser-based **visual working memory experiment**, where participants view a short list of words, retain them, and then decide whether later probe words were shown before or not.

It is implemented in **HTML + JavaScript** and designed for easy online deployment (e.g., GitHub Pages).

---

## 🧩 Overview

### Task Flow

1. **Instructions Page**  
   - Describes the task.  
   - Prompts participant for their name.  
   - Pressing “Start” begins the experiment.

2. **Study Phase**  
   - A set of words (subset of a larger word pool) is displayed **sequentially** on the screen.  
   - Set size (number of words) varies across trials.

3. **Countdown / Inter-Trial Interval**  
   - A short countdown (3, 2, 1) prepares the participant for the next phase.

4. **Probe Phase**  
   - A series of probe words are shown one at a time.  
   - Participants indicate whether each word was part of the studied set or not using **confidence-based responses**:  
     - “Sure Yes” / “Maybe Yes” / “Maybe No” / “Sure No”  
   - Probe words are 50% from the studied set and 50% novel.

5. **End Screen**  
   - Displays overall **accuracy**.  
   - Automatically downloads a **CSV file** containing the participant’s responses.

---

## 📊 Output Data

Each row in the downloaded CSV corresponds to one probe trial and includes the following columns:

| Column       | Description |
|---------------|-------------|
| `set_size`    | Number of words shown in the study phase |
| `word`        | The probe word displayed |
| `from_set`    | `true` if the word was from the studied set |
| `response`    | Participant’s response (“sure yes”, “maybe no”, etc.) |
| `rt_ms`       | Reaction time in milliseconds |

---
