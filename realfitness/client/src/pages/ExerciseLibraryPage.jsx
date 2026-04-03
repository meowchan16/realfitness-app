import { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader";

const exerciseCategories = {
  Legs: [
    {
      name: "Bodyweight squats",
      howTo: "Stand with feet shoulder-width apart, sit your hips back, bend your knees, lower until your thighs are nearly parallel, then push through your heels to stand."
    },
    {
      name: "Goblet squats",
      howTo: "Hold a dumbbell or kettlebell at your chest, keep your chest up, lower into a squat, then drive back up while keeping the weight close."
    },
    {
      name: "Barbell back squats",
      howTo: "Rest the bar on your upper back, brace your core, sit back and down under control, then stand by pressing evenly through both feet."
    },
    {
      name: "Front squats",
      howTo: "Hold the bar across the front of your shoulders, keep elbows lifted, squat straight down with an upright chest, and rise back up under control."
    },
    {
      name: "Leg press",
      howTo: "Sit with your back supported, place feet shoulder-width on the platform, lower until knees are bent deeply, then press the platform away without locking out hard."
    },
    {
      name: "Walking lunges",
      howTo: "Step forward into a lunge, lower until both knees bend, push through the front foot, then bring the back leg through into the next step."
    },
    {
      name: "Reverse lunges",
      howTo: "Step one leg back, lower until both knees bend, keep your front knee stacked over the foot, then press back to the start."
    },
    {
      name: "Bulgarian split squats",
      howTo: "Place your back foot on a bench, lower through the front leg until the rear knee drops, then drive up through the front heel."
    },
    {
      name: "Romanian deadlifts",
      howTo: "Hold the weight close to your legs, soften the knees, hinge your hips back with a flat back, then squeeze the glutes to return upright."
    },
    {
      name: "Step-ups",
      howTo: "Place one foot on a bench or box, push through that foot to stand up, then lower slowly back down with control."
    },
    {
      name: "Hamstring curls",
      howTo: "Set up on the curl machine, bend your knees to pull the pad toward your body, pause briefly, then lower slowly."
    },
    {
      name: "Calf raises",
      howTo: "Stand tall, press through the balls of your feet to lift your heels, squeeze your calves at the top, then lower with control."
    }
  ],
  Arms: [
    {
      name: "Bicep curls",
      howTo: "Hold the weights at your sides, keep elbows close to your torso, curl the weights up, then lower slowly without swinging."
    },
    {
      name: "Hammer curls",
      howTo: "Keep your palms facing each other, curl both weights upward, pause at the top, and lower with control."
    },
    {
      name: "Preacher curls",
      howTo: "Rest your arms on the preacher pad, curl the bar or dumbbell up without lifting the elbows, then lower slowly."
    },
    {
      name: "Concentration curls",
      howTo: "Sit with your elbow braced against your inner thigh, curl the weight up toward your shoulder, and lower with control."
    },
    {
      name: "Tricep dips",
      howTo: "Place your hands on parallel bars or a bench, lower your body by bending your elbows, then press back up until your arms straighten."
    },
    {
      name: "Cable pushdowns",
      howTo: "Grip the cable attachment, keep elbows pinned by your sides, press the handle down, and return slowly."
    },
    {
      name: "Overhead tricep extensions",
      howTo: "Raise the weight overhead, bend at the elbows to lower it behind your head, then extend back up without flaring too much."
    },
    {
      name: "Close-grip push-ups",
      howTo: "Place your hands closer than shoulder width, lower your chest toward the floor, then press back up while keeping elbows tucked."
    },
    {
      name: "Skull crushers",
      howTo: "Lie on a bench, hold the weight above your chest, bend your elbows to lower toward your forehead, then extend back up."
    },
    {
      name: "Reverse curls",
      howTo: "Use an overhand grip, curl the bar or weights upward while keeping wrists steady, then lower under control."
    }
  ],
  Chest: [
    {
      name: "Push-ups",
      howTo: "Start in a plank, lower your chest toward the floor while keeping your body straight, then press back up."
    },
    {
      name: "Wide push-ups",
      howTo: "Place your hands wider than shoulder width, lower your body with control, then push back up while keeping your core tight."
    },
    {
      name: "Bench press",
      howTo: "Lie on the bench, grip the bar slightly wider than shoulder width, lower it to mid-chest, then press straight back up."
    },
    {
      name: "Incline dumbbell press",
      howTo: "Sit on an incline bench, press the dumbbells upward from chest level, then lower until elbows are slightly below the bench line."
    },
    {
      name: "Decline press",
      howTo: "Secure yourself on a decline bench, lower the weight toward the lower chest, then press back up in line with your chest."
    },
    {
      name: "Chest fly",
      howTo: "Lie on a bench with dumbbells above your chest, open your arms wide with a slight bend in the elbows, then bring them back together."
    },
    {
      name: "Cable fly",
      howTo: "Stand between the cables, bring both handles inward in a hugging motion, squeeze your chest, then return slowly."
    },
    {
      name: "Chest dips",
      howTo: "Lean slightly forward on the dip bars, lower until your elbows bend deeply, then push back up through your chest and triceps."
    },
    {
      name: "Machine chest press",
      howTo: "Sit with the handles at chest height, press straight forward until your arms extend, then return with control."
    },
    {
      name: "Pec deck fly",
      howTo: "Sit tall in the machine, bring the pads together in front of your chest, squeeze briefly, then open back slowly."
    }
  ],
  Back: [
    {
      name: "Pull-ups",
      howTo: "Hang from the bar with palms forward, pull your chest toward the bar by driving elbows down, then lower fully."
    },
    {
      name: "Chin-ups",
      howTo: "Use an underhand grip, pull yourself up until your chin clears the bar, then lower with control."
    },
    {
      name: "Lat pulldown",
      howTo: "Grip the bar wide, pull it toward your upper chest while keeping your torso steady, then let it rise slowly."
    },
    {
      name: "Seated row",
      howTo: "Sit tall, pull the handle toward your torso by squeezing your shoulder blades, then extend your arms back out."
    },
    {
      name: "Single-arm dumbbell row",
      howTo: "Brace one hand on a bench, pull the dumbbell toward your hip, squeeze your back, then lower slowly."
    },
    {
      name: "Barbell row",
      howTo: "Hinge at the hips with a flat back, pull the bar toward your lower ribs, then lower it under control."
    },
    {
      name: "Deadlift",
      howTo: "Stand with the bar over your midfoot, hinge down to grip it, brace your core, stand tall with the bar close, then lower carefully."
    },
    {
      name: "Rack pulls",
      howTo: "Set the bar on pins just below the knees, lift it by driving hips forward, then lower back to the rack position."
    },
    {
      name: "Face pulls",
      howTo: "Pull the rope attachment toward your face with elbows high, squeeze the upper back, then return slowly."
    },
    {
      name: "Back extensions",
      howTo: "Set your hips on the pad, hinge down with control, then raise your torso until your body is straight."
    }
  ],
  Shoulders: [
    {
      name: "Shoulder press",
      howTo: "Start with weights at shoulder level, press overhead until your arms extend, then lower back down steadily."
    },
    {
      name: "Arnold press",
      howTo: "Begin with palms facing you, rotate the dumbbells outward as you press overhead, then reverse the motion on the way down."
    },
    {
      name: "Lateral raises",
      howTo: "Lift the dumbbells out to your sides up to shoulder height, pause briefly, then lower with control."
    },
    {
      name: "Front raises",
      howTo: "Raise the weight straight in front of you to shoulder height, pause, then lower slowly."
    },
    {
      name: "Rear delt fly",
      howTo: "Hinge forward, open your arms wide to the sides, squeeze the rear shoulders, then lower back down."
    },
    {
      name: "Upright rows",
      howTo: "Pull the bar or weights up along your torso to upper chest height, then lower back down under control."
    },
    {
      name: "Pike push-ups",
      howTo: "Start in a pike position, lower the top of your head toward the floor, then push back up through your shoulders."
    },
    {
      name: "Machine shoulder press",
      howTo: "Sit with handles near shoulder level, press upward until arms extend, then return with control."
    },
    {
      name: "Cable lateral raises",
      howTo: "Hold the cable at your side, raise your arm outward to shoulder height, then lower slowly."
    },
    {
      name: "Shrugs",
      howTo: "Hold the weights at your sides, raise your shoulders straight up toward your ears, then lower without rolling."
    }
  ],
  Core: [
    {
      name: "Plank",
      howTo: "Hold your body in a straight line on your forearms or hands, keep your core tight, and avoid letting your hips sag."
    },
    {
      name: "Side plank",
      howTo: "Support your body on one forearm and the side of one foot, keep your hips lifted, and hold a straight line."
    },
    {
      name: "Russian twists",
      howTo: "Sit slightly reclined, lift your feet if comfortable, rotate your torso side to side, and tap the weight or hands beside you."
    },
    {
      name: "Leg raises",
      howTo: "Lie flat, keep your legs straight, raise them upward without arching your lower back, then lower slowly."
    },
    {
      name: "Mountain climbers",
      howTo: "Start in a plank and drive your knees toward your chest one at a time at a steady or fast pace."
    },
    {
      name: "Bicycle crunches",
      howTo: "Lie on your back, bring opposite elbow and knee together, extend the other leg, then switch sides smoothly."
    },
    {
      name: "Dead bug",
      howTo: "Lie on your back with arms up and knees bent, extend one arm and the opposite leg, then return and switch sides."
    },
    {
      name: "Flutter kicks",
      howTo: "Lie back with legs extended slightly off the floor and kick them up and down in small controlled motions."
    },
    {
      name: "Hanging knee raises",
      howTo: "Hang from a bar, lift your knees toward your chest using your core, then lower without swinging."
    },
    {
      name: "Heel touches",
      howTo: "Lie on your back with knees bent, crunch slightly and reach side to side toward each heel."
    }
  ],
  Cardio: [
    {
      name: "Brisk walking",
      howTo: "Walk at a pace that raises your heart rate while keeping your posture tall and your arms moving naturally."
    },
    {
      name: "Jogging",
      howTo: "Run at a steady comfortable pace, land softly, and keep your shoulders relaxed."
    },
    {
      name: "Sprint intervals",
      howTo: "Alternate short all-out sprints with recovery walking or slow jogging for repeated rounds."
    },
    {
      name: "Cycling",
      howTo: "Keep a smooth pedal rhythm, maintain a steady core, and adjust resistance or speed based on your workout goal."
    },
    {
      name: "Jump rope",
      howTo: "Hold the handles lightly, rotate the rope with your wrists, and bounce low off the ground."
    },
    {
      name: "High knees",
      howTo: "Run in place while driving your knees upward and pumping your arms quickly."
    },
    {
      name: "Burpees",
      howTo: "Drop to the floor, jump or step your feet back, return to standing, and finish with a jump."
    },
    {
      name: "Rowing machine",
      howTo: "Push with your legs first, then lean back slightly and pull the handle to your torso, reversing the motion smoothly."
    },
    {
      name: "Stair climber",
      howTo: "Step steadily through the machine pedals, keep your chest up, and avoid leaning heavily on the handles."
    },
    {
      name: "Treadmill incline walk",
      howTo: "Walk at a firm pace on an incline, stay upright, and keep your steps controlled and even."
    }
  ],
  "Full Body": [
    {
      name: "Burpees",
      howTo: "Drop to the floor, jump or step back into plank, return your feet forward, and stand up with a jump."
    },
    {
      name: "Thrusters",
      howTo: "Squat with dumbbells or a bar at shoulder level, then drive upward and press overhead in one motion."
    },
    {
      name: "Kettlebell swings",
      howTo: "Hinge at your hips, swing the kettlebell backward between your legs, then snap your hips forward to bring it up."
    },
    {
      name: "Push-up to squat combo",
      howTo: "Perform a push-up, jump or step your feet in, rise into a squat or stand, then repeat."
    },
    {
      name: "Battle ropes",
      howTo: "Hold the rope ends, brace your body, and create alternating or double waves by moving your arms powerfully."
    },
    {
      name: "Farmer's walk",
      howTo: "Hold heavy weights at your sides, stand tall, and walk steadily while keeping your core tight."
    },
    {
      name: "Clean and press",
      howTo: "Lift the weight from lower position to shoulder level in one smooth motion, then press it overhead."
    },
    {
      name: "Jump squats",
      howTo: "Lower into a squat, explode upward into a jump, land softly, and go straight into the next rep."
    },
    {
      name: "Bear crawls",
      howTo: "Hover your knees just off the floor and move opposite hand and foot forward while keeping your back flat."
    },
    {
      name: "Renegade rows",
      howTo: "Hold a plank with dumbbells, row one weight toward your ribcage, lower it, then repeat on the other side."
    }
  ]
};

function ExerciseLibraryPage() {
  const [selectedCategory, setSelectedCategory] = useState("Legs");

  useEffect(() => {
    document.title = "RealFitness Exercise Library";
  }, []);

  return (
    <section className="simple-page-shell">
      <div className="simple-page-card">
        <PageHeader
          eyebrow="More Exercises"
          title="Browse more exercises by category and open the right type of movement faster."
          description="Use this library when you want new ideas for your planner or a better range of movement options."
        />

        <div className="library-layout">
          <div className="library-categories">
            {Object.keys(exerciseCategories).map((category) => (
              <button
                key={category}
                type="button"
                className={`selection-card ${selectedCategory === category ? "selection-card--active" : ""}`}
                onClick={() => setSelectedCategory(category)}
              >
                <strong>{category}</strong>
                <p>Browse {exerciseCategories[category].length} {category.toLowerCase()} exercise options.</p>
              </button>
            ))}
          </div>

          <div className="library-results">
            <span className="feature-label">{selectedCategory}</span>
            <h2>{selectedCategory} Exercises</h2>
            <div className="exercise-grid">
              {exerciseCategories[selectedCategory].map((exercise) => (
                <article className="saved-day-card" key={exercise.name}>
                  <strong>{exercise.name}</strong>
                  <p>
                    {exercise.howTo}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ExerciseLibraryPage;
