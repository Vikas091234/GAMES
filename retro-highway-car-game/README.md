
# 🎮 Retro Highway  
> A simple yet challenging **retro-style endless highway game** focused on patterns, and progression.

---

## 🚗 Game Overview  
**Retro Highway** is a classic **"avoid the traffic"** endless runner, but with a twist.  
The game isn't about random traffic — it's about **pattern recognition, and reaction time**.

### Your Goal:
- Avoid oncoming vehicles.
- Stay alive as long as possible.
- Chase the high score.

---

## 🕹️ Controls  

| Action    | Key       |
|-----------|-----------|
| Move Left | ← Arrow   |
| Move Right| → Arrow   |

---

## 🏁 Gameplay Mechanics  

- **Progressive Difficulty:**  
Traffic speed gradually increases as your score rises.

- **Pattern-Based Traffic:**  
Traffic is not random. The game generates **intentional patterns** (zigzag, tunnel, wall, scatter) to challenge players.

- **Player Behavior Feedback:**  
At higher scores, the game **analyzes your previous lane history** and uses this information to:
  - Bias patterns toward lanes you favor.
  - Force you out of comfort zones.
  - Create deceptive "safe" paths.

- **False Safety Traps:**  
Special patterns lure you into open lanes only to challenge you to react fast afterward.

---

## 🎵 Music  

- Background music randomly picked from a small set of tracks.  
- You can toggle music and control volume from the in-game settings.  
- Music resumes where it left off even after restart.

---

## 💡 Key Features  

✅ Retro pixel-art inspired aesthetic  
✅ Dynamic traffic patterns — not pure RNG  
✅ Fake-safety traps to increase challenge  
✅ Lane-bias logic based on player habits  
✅ Clean and readable code structure  
✅ Persistent high-score tracking  
✅ Music with volume control  

---

## 🖼️ Screenshots  

| Home Screen | Gameplay | Game Over |
|-------------|----------|-----------|
| (screenshot)| (screenshot)| (screenshot)|  

> *(Optional: Add screenshots to an `assets/` directory and update here.)*

---

## 🛠️ Technologies  

- **HTML5 Canvas** for rendering  
- **Vanilla JavaScript** for all logic  
- **CSS** for retro styling  
- **LocalStorage** for high scores & music preferences  
- **Google Fonts (Press Start 2P)** for authentic retro vibe  

---

## 🗂️ Project Structure  
Retro-Highway/

├── index.html

├── style.css

├── game.js


│ └── [music files]

├── images/

│ └── [cars, objects, player ]

└── README.md


---

## 📈 How the Game Gets Harder  

| Score  | Behavior                           |
|--------|------------------------------------|
| < 50   | Slow traffic, wider gaps           |
| 50+    | Slight lane bias starts            |
| 75+    | Fake safety traps on edge lanes    |
| 150+   | No guaranteed wide gaps anymore    |
| 180+   | Tunnel-like patterns increase      |
| 200+   | Speed and tightness both max out   |

---

## 🏆 Credits  

- **Developer:** Vikas Raj  
- **Music:** Audioinsmusic  

---

## 📬 Contact  

**Vikas Raj**  
[GitHub - Vikas091234](https://github.com/Vikas091234)  

---


