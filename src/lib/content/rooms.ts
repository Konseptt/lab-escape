import type { AchievementContent, RoomContent, WingContent } from "./types";
import { RESEARCH_PROTOCOLS } from "./research-vocabulary";

/**
 * Canonical content for the research facility.
 *
 * This module is the single source of truth for room content. It seeds the
 * database and also serves as the read fallback when no database is
 * reachable (kiosk / demo installations).
 */

export const WINGS: WingContent[] = [
  { slug: "attention", name: "Attention & Perception", ordinal: 1, mapX: 0, mapY: 0 },
  { slug: "memory", name: "Memory Systems", ordinal: 2, mapX: 1, mapY: 0 },
  { slug: "decision", name: "Judgment & Decision", ordinal: 3, mapX: 2, mapY: 0 },
  { slug: "executive", name: "Executive Control", ordinal: 4, mapX: 0, mapY: 1 },
  { slug: "social", name: "Social Psychology", ordinal: 5, mapX: 1, mapY: 1 },
];

export const ROOMS: RoomContent[] = (
  [
  {
    slug: "invisible-gorilla",
    code: "A-01",
    title: "The Invisible Gorilla",
    domain: "Selective Attention",
    paradigm: "Inattentional blindness",
    engine: "search",
    wing: "attention",
    ordinal: 1,
    difficulty: "INTRO",
    durationMin: 8,
    unlockAfter: null,
    summary:
      "Count what you're told to count, and discover what your attention deletes from the world.",
    concept:
      "Attention is a spotlight, not a floodlight. When your visual system commits to one task, unexpected objects, even large, obvious ones, can pass through your field of view without ever reaching awareness.",
    background:
      "In 1999, Daniel Simons and Christopher Chabris asked participants to count basketball passes between players in white shirts. Halfway through the video, a person in a gorilla suit walked through the scene, faced the camera, thumped its chest, and left. Roughly half of all viewers never saw it. The study became one of the most cited demonstrations in cognitive psychology because it overturned the intuition that we see what is in front of our eyes. Seeing requires attention, and attention is a scarce resource allocated by task goals.",
    learningGoals: [
      "Define inattentional blindness and distinguish it from change blindness",
      "Explain why attentional load determines what reaches awareness",
      "Identify real-world situations where task focus erases unexpected events",
    ],
    skills: ["Sustained attention", "Visual search", "Target tracking"],
    originalStudy: {
      year: 1999,
      researchers: ["Daniel Simons", "Christopher Chabris"],
      citation:
        "Simons, D. J., & Chabris, C. F. (1999). Gorillas in our midst: Sustained inattentional blindness for dynamic events. Perception, 28(9), 1059–1074.",
      sample: "228 observers across four task conditions",
      finding:
        "46% of observers failed to notice the gorilla; failure rate rose with attentional load.",
    },
    applications: [
      "Radiologists miss anomalies outside the search template, a 2013 replication placed a gorilla in lung scans and 83% of radiologists missed it",
      "Driver distraction: phone conversations produce inattentional blindness for pedestrians and signals",
      "Eyewitness reliability: attention during an event bounds what can later be remembered",
    ],
    whatHappened:
      "You were asked to track a subset of moving targets while distractors shared the space. During high-load trials, an unexpected object crossed the display. Whether you reported it depended almost entirely on how much attention the counting task consumed.",
    whyItHappened:
      "Visual processing is capacity-limited. Task goals program a 'search template' that filters input before it reaches awareness. Objects that don't match the template can be fully processed by early vision yet never become conscious, perception without awareness.",
    config: {
      trials: 24,
      practice: 4,
      setSizes: [8, 12, 16],
      targetShape: "circle",
      unexpectedTrial: 18,
    },
  },
  {
    slug: "change-blindness",
    code: "A-02",
    title: "The Flicker Room",
    domain: "Perception",
    paradigm: "Change blindness",
    engine: "flicker",
    wing: "attention",
    ordinal: 2,
    difficulty: "STANDARD",
    durationMin: 10,
    unlockAfter: "invisible-gorilla",
    summary:
      "Two nearly identical scenes alternate in front of you. Something large keeps changing. Finding it is harder than you think.",
    concept:
      "Your visual system does not keep a photographic buffer of the world. Between glances, it stores only what was attended. Interrupt the motion signal that normally flags a change, and even large changes become invisible.",
    background:
      "Ronald Rensink, Kevin O'Regan and James Clark formalized the 'flicker paradigm' in 1997: alternate an original and a modified photograph with a brief blank between them. The blank masks the motion transient that would normally capture attention, so observers must serially search the scene with focused attention to find the change. Search times stretch to tens of seconds even for changes in the center of interest, showing that scene representations are far sparser than subjective experience suggests.",
    learningGoals: [
      "Describe the flicker paradigm and the role of motion transients",
      "Explain why subjective visual richness overstates what is stored",
      "Relate change detection to focused attention",
    ],
    skills: ["Focused attention", "Scene memory", "Systematic search"],
    originalStudy: {
      year: 1997,
      researchers: ["Ronald Rensink", "Kevin O'Regan", "James Clark"],
      citation:
        "Rensink, R. A., O'Regan, J. K., & Clark, J. J. (1997). To see or not to see: The need for attention to perceive changes in scenes. Psychological Science, 8(5), 368–373.",
      sample: "Repeated-measures search across dozens of natural scenes",
      finding:
        "With a blank inserted between frames, change detection required an average of over 10 alternations even for central changes.",
    },
    applications: [
      "Interface design: state changes without motion cues go unnoticed by users",
      "Aviation and control rooms: silent mode changes are a documented accident factor",
      "Film continuity errors survive because audiences cannot track unattended detail",
    ],
    whatHappened:
      "A grid of instruments alternated with a modified copy, separated by a blank flash. You searched, cell by cell, until the changing element was found. Your search time per set size traces how much of the scene you could hold and compare at once.",
    whyItHappened:
      "The blank frame masks the motion transient that would normally summon attention to the change. Without that signal, you must load each region into visual short-term memory and compare across the flicker, a slow, serial, capacity-limited process.",
    config: {
      trials: 16,
      practice: 3,
      gridSizes: [9, 16, 25],
      flickerMs: 240,
      blankMs: 120,
    },
  },
  {
    slug: "magic-number-seven",
    code: "B-01",
    title: "Span Chamber",
    domain: "Working Memory",
    paradigm: "Digit span",
    engine: "span",
    wing: "memory",
    ordinal: 1,
    difficulty: "INTRO",
    durationMin: 9,
    unlockAfter: null,
    summary:
      "Sequences of symbols appear once, then vanish. The door advances only while your memory holds. How far can you go?",
    concept:
      "Working memory, the mental workspace where you hold and manipulate information, has a sharply limited capacity. Most adults can hold about seven digits, and about four independent chunks, before the sequence collapses.",
    background:
      "George Miller's 1956 paper 'The Magical Number Seven, Plus or Minus Two' is among the most cited in psychology. Reviewing absolute-judgment and immediate-memory studies, Miller observed a recurring capacity near seven items and, crucially, that the unit is the chunk, not the bit: recoding items into larger meaningful units expands effective span. Later work by Nelson Cowan revised the pure capacity estimate to about four chunks when rehearsal and grouping are controlled.",
    learningGoals: [
      "Estimate your own span and understand individual variation",
      "Explain chunking and why expertise expands effective capacity",
      "Distinguish short-term storage from working-memory manipulation",
    ],
    skills: ["Working memory", "Sequencing", "Chunking strategy"],
    originalStudy: {
      year: 1956,
      researchers: ["George A. Miller"],
      citation:
        "Miller, G. A. (1956). The magical number seven, plus or minus two: Some limits on our capacity for processing information. Psychological Review, 63(2), 81–97.",
      sample: "Synthesis of psychophysical and memory-span experiments",
      finding:
        "Immediate memory span clusters near 7 ± 2 items; recoding into chunks raises the information ceiling.",
    },
    applications: [
      "Phone numbers, postal codes and license plates are sized to span limits",
      "Checklist design in medicine and aviation keeps steps within capacity",
      "Instructional design sequences new material to avoid overload",
    ],
    whatHappened:
      "Symbol sequences grew one item at a time. Each correct recall lengthened the next sequence; each error shortened it. The staircase converged on your span, the point where storage demand met capacity.",
    whyItHappened:
      "Items in working memory are maintained by active rehearsal and decay or interfere within seconds. Each additional item raises interference between traces, so recall probability falls steeply past capacity. Chunking works because it stores structure, not raw items.",
    config: {
      startLength: 3,
      maxLength: 12,
      trials: 14,
      practice: 2,
      itemMs: 800,
      isiMs: 250,
    },
  },
  {
    slug: "false-memory",
    code: "B-02",
    title: "The Archive of Things That Never Happened",
    domain: "Memory",
    paradigm: "DRM false memory",
    engine: "drm",
    wing: "memory",
    ordinal: 2,
    difficulty: "STANDARD",
    durationMin: 11,
    unlockAfter: "magic-number-seven",
    summary:
      "Study the evidence, then testify. Some of what you will confidently remember was never shown to you.",
    concept:
      "Memory is reconstructive. Studying words that all point at a missing theme word ('bed, rest, awake, tired…') reliably creates a vivid, confident memory of the word 'sleep', which never appeared.",
    background:
      "James Deese observed the effect in 1959; Henry Roediger and Kathleen McDermott turned it into the standard DRM paradigm in 1995. Participants study lists of semantic associates of a critical lure. At test, the lure is falsely recalled and recognized at rates rivaling genuinely studied words, often with high-confidence 'remember' judgments. The paradigm showed that false memories are not exotic failures but a signature of a memory system that stores gist and reconstructs detail.",
    learningGoals: [
      "Explain gist-based encoding and spreading activation",
      "Distinguish familiarity from recollection",
      "Connect laboratory false memory to eyewitness testimony research",
    ],
    skills: ["Verbal memory", "Source monitoring", "Metacognition"],
    originalStudy: {
      year: 1995,
      researchers: ["Henry L. Roediger III", "Kathleen B. McDermott"],
      citation:
        "Roediger, H. L., & McDermott, K. B. (1995). Creating false memories: Remembering words not presented in lists. Journal of Experimental Psychology: Learning, Memory, and Cognition, 21(4), 803–814.",
      sample: "Two experiments, 36 and 30 undergraduates",
      finding:
        "Critical lures were falsely recalled on 40–55% of lists and falsely recognized at rates comparable to studied words.",
    },
    applications: [
      "Eyewitness testimony: confidence is not a reliable index of accuracy",
      "Interview technique: leading associates can implant detail",
      "Therapeutic and legal standards for recovered-memory claims",
    ],
    whatHappened:
      "You studied themed evidence lists, then judged a recognition set containing studied items, unrelated foils, and the critical lures. Your false-alarm rate to lures, and your confidence in them, is the reconstructive signature.",
    whyItHappened:
      "Each studied associate spreads activation to the shared theme node. At test, that accumulated activation is misattributed to actual presentation, a source-monitoring failure. The gist trace ('this was about sleep') is real; the specific memory is manufactured.",
    config: {
      lists: 6,
      wordsPerList: 8,
      studyMs: 1100,
      recognitionSize: 30,
    },
  },
  {
    slug: "framing-effect",
    code: "C-01",
    title: "The Two Doors",
    domain: "Decision Making",
    paradigm: "Framing & prospect theory",
    engine: "framing",
    wing: "decision",
    ordinal: 1,
    difficulty: "INTRO",
    durationMin: 10,
    unlockAfter: null,
    summary:
      "Identical outcomes, different words. Watch your own risk preferences invert depending on how a choice is framed.",
    concept:
      "People do not evaluate outcomes in absolute terms; they evaluate gains and losses from a reference point, and losses loom larger than gains. Describing the same option as lives saved versus lives lost flips the majority preference.",
    background:
      "Amos Tversky and Daniel Kahneman's 1981 'Asian disease problem' presented the same epidemic-response choice framed as gains (lives saved) or losses (lives lost). With a gain frame, 72% chose the certain option; with a loss frame, 78% chose the gamble. This violation of invariance, a pillar of rational choice theory, helped establish prospect theory, for which Kahneman later received the Nobel Memorial Prize in Economic Sciences.",
    learningGoals: [
      "Define reference dependence and loss aversion",
      "Recognize gain and loss frames in real decisions",
      "Explain why framing violates the invariance axiom of rational choice",
    ],
    skills: ["Decision making", "Risk calibration", "Frame detection"],
    originalStudy: {
      year: 1981,
      researchers: ["Amos Tversky", "Daniel Kahneman"],
      citation:
        "Tversky, A., & Kahneman, D. (1981). The framing of decisions and the psychology of choice. Science, 211(4481), 453–458.",
      sample: "307 respondents across framing conditions",
      finding:
        "Preference reversed from 72% risk-averse under a gain frame to 78% risk-seeking under a loss frame for identical outcomes.",
    },
    applications: [
      "Medical consent: '90% survival' vs '10% mortality' changes treatment uptake",
      "Public policy defaults and pension enrollment design",
      "Pricing: discounts versus surcharges for the same price difference",
    ],
    whatHappened:
      "You made a series of choices between certain and risky options. Interleaved pairs were mathematically identical but framed as gains or losses. The divergence between your matched answers measures your framing susceptibility.",
    whyItHappened:
      "Prospect theory's value function is concave for gains (making sure gains attractive) and convex and steeper for losses (making sure losses repellent). The frame sets the reference point, which determines whether the same outcome is coded as a gain or a loss.",
    config: {
      scenarios: 12,
      matchedPairs: 5,
      deliberationMsMin: 1200,
    },
  },
  {
    slug: "reward-corridor",
    code: "C-02",
    title: "Reward Corridor",
    domain: "Learning",
    paradigm: "Reinforcement learning / operant conditioning",
    engine: "bandit",
    wing: "decision",
    ordinal: 2,
    difficulty: "STANDARD",
    durationMin: 12,
    unlockAfter: "framing-effect",
    summary:
      "Three panels, hidden reward rates, limited trials. Explore or exploit, the corridor keeps score of every choice.",
    concept:
      "Learning from reward is a running negotiation between exploiting what has paid off and exploring what might pay better. Your choice patterns reveal the learning rule your brain runs, and its signature biases.",
    background:
      "B.F. Skinner's operant chamber (1938) established that consequences shape behavior lawfully, and that intermittent reinforcement produces the most persistent responding. Modern computational work, Rescorla & Wagner's 1972 model and its descendants, recast conditioning as prediction-error learning: surprise drives updating. The multi-armed bandit task is today's standard probe, and midbrain dopamine neurons were shown by Schultz and colleagues to encode exactly the reward prediction error these models require.",
    learningGoals: [
      "Explain prediction-error learning and the Rescorla–Wagner rule",
      "Describe the exploration–exploitation tradeoff",
      "Connect partial reinforcement to persistence of behavior",
    ],
    skills: ["Probabilistic learning", "Adaptation", "Strategic exploration"],
    originalStudy: {
      year: 1938,
      researchers: ["B. F. Skinner", "Robert Rescorla", "Allan Wagner"],
      citation:
        "Skinner, B. F. (1938). The Behavior of Organisms. / Rescorla, R. A., & Wagner, A. R. (1972). A theory of Pavlovian conditioning. In Classical Conditioning II, 64–99.",
      sample: "Foundational animal-learning programs, later formalized computationally",
      finding:
        "Behavior tracks reinforcement probability; learning speed is proportional to prediction error, and variable schedules resist extinction.",
    },
    applications: [
      "A/B testing and recommendation systems are industrial bandit problems",
      "Habit formation and extinction in behavior therapy",
      "Why variable-ratio rewards make slot machines and feeds compulsive",
    ],
    whatHappened:
      "You sampled three options with hidden, drifting reward probabilities. Midway, the best option silently changed. How quickly your choices tracked the reversal measures your learning rate; your switching pattern reveals your exploration policy.",
    whyItHappened:
      "Each outcome generates a prediction error, the gap between expected and received reward, which nudges the option's value estimate. High learning rates adapt fast but chase noise; low rates are stable but slow after reversals. There is no free lunch, only a tradeoff.",
    config: {
      trials: 60,
      arms: 3,
      baseProbs: [0.7, 0.4, 0.2],
      reversalAt: 30,
      driftSd: 0.03,
    },
  },
  {
    slug: "stroop-lock",
    code: "D-01",
    title: "Stroop Lock",
    domain: "Executive Function",
    paradigm: "Stroop interference",
    engine: "stroop",
    wing: "executive",
    ordinal: 1,
    difficulty: "INTRO",
    durationMin: 8,
    unlockAfter: null,
    summary:
      "Name the ink, ignore the word. A lock that opens only when your executive control overrides sixty thousand hours of reading practice.",
    concept:
      "Reading is so overlearned it is automatic, it happens whether you want it to or not. When the word RED is printed in blue ink, naming the ink color requires actively suppressing the automatic response. The delay is pure, measurable executive control.",
    background:
      "John Ridley Stroop published the effect in 1935, and it remains one of the most replicated findings in experimental psychology. Naming ink colors of incongruent color words is reliably slower, often by 100–200 ms, and more error-prone than naming colors of neutral stimuli. The task became the canonical probe of inhibitory control, and its neural signature centers on anterior cingulate conflict monitoring and dorsolateral prefrontal control.",
    learningGoals: [
      "Define automaticity and response conflict",
      "Measure your interference cost in milliseconds",
      "Explain the roles of anterior cingulate and prefrontal cortex in control",
    ],
    skills: ["Inhibitory control", "Processing speed", "Conflict resolution"],
    originalStudy: {
      year: 1935,
      researchers: ["John Ridley Stroop"],
      citation:
        "Stroop, J. R. (1935). Studies of interference in serial verbal reactions. Journal of Experimental Psychology, 18(6), 643–662.",
      sample: "70 undergraduates across three experiments",
      finding:
        "Naming ink colors of incongruent words took 74% longer than naming solid color patches.",
    },
    applications: [
      "Clinical assessment of ADHD, addiction, and frontal-lobe function",
      "The emotional Stroop probes attentional bias in anxiety and PTSD",
      "Design lesson: never make a label fight its own appearance",
    ],
    whatHappened:
      "You classified ink colors across congruent, neutral, and incongruent trials. Your interference cost, incongruent minus congruent reaction time, is your personal Stroop effect, the time your executive system needed to overrule the automatic reading response.",
    whyItHappened:
      "Word reading reaches the response system faster than color naming. On incongruent trials both pathways activate conflicting responses; the anterior cingulate detects the conflict and recruits prefrontal control to bias processing toward the task-relevant feature. That arbitration takes time.",
    config: {
      trials: 48,
      practice: 8,
      congruentPct: 0.33,
      neutralPct: 0.33,
      responseKeys: ["r", "g", "b", "y"],
    },
  },
  {
    slug: "affective-gate",
    code: "D-02",
    title: "Affective Gate",
    domain: "Emotion",
    paradigm: "Emotional attention capture",
    engine: "stroop",
    wing: "executive",
    ordinal: 2,
    difficulty: "ADVANCED",
    durationMin: 10,
    unlockAfter: "stroop-lock",
    summary:
      "The lock is the same. The words are not. Feel emotionally charged language reach into a task it has nothing to do with.",
    concept:
      "Emotionally significant stimuli get priority access to attention even when they are completely task-irrelevant. Threat and arousal words slow color naming more than neutral words, your evaluation system screens everything, always.",
    background:
      "The emotional Stroop task adapts Stroop's logic: participants name ink colors of neutral versus emotionally charged words. Across hundreds of studies, charged words, especially those matching a person's current concerns, produce slower color naming. Unlike the classic effect, the interference is not response conflict but attentional capture: the amygdala-driven significance system flags the word's meaning and holds attention for a beat. The paradigm became a workhorse of clinical research on anxiety, phobia, and PTSD.",
    learningGoals: [
      "Distinguish response conflict from attentional capture",
      "Explain prioritized processing of emotional stimuli",
      "Understand attentional bias and its clinical measurement",
    ],
    skills: ["Attentional control", "Emotional regulation", "Response consistency"],
    originalStudy: {
      year: 1986,
      researchers: ["Colin MacLeod", "Andrew Mathews", "Philip Tata"],
      citation:
        "MacLeod, C., Mathews, A., & Tata, P. (1986). Attentional bias in emotional disorders. Journal of Abnormal Psychology, 95(1), 15–20.",
      sample: "Clinically anxious and control participants",
      finding:
        "Anxious individuals showed systematic attentional bias toward threat content; emotional content modulates early attention.",
    },
    applications: [
      "Attentional-bias measurement and modification in anxiety treatment",
      "Warning design: emotional salience buys attention, at a cost",
      "Content moderation workloads and attentional fatigue",
    ],
    whatHappened:
      "You ran the same color-classification task, but the embedded words varied in emotional charge. The reaction-time gap between charged and neutral words indexes how strongly meaning captured your attention when meaning was irrelevant.",
    whyItHappened:
      "The brain evaluates significance pre-attentively. Charged words trigger amygdala-mediated prioritization that briefly diverts attention from the color task. It is not a conflict between responses but a tax on attention itself, which is why it appears even when the word names no color.",
    config: {
      trials: 48,
      practice: 6,
      categories: ["neutral", "threat", "positive"],
      responseKeys: ["r", "g", "b", "y"],
    },
  },
  {
    slug: "conformity-chamber",
    code: "E-01",
    title: "The Conformity Chamber",
    domain: "Social Psychology",
    paradigm: "Asch conformity",
    engine: "conformity",
    wing: "social",
    ordinal: 1,
    difficulty: "STANDARD",
    durationMin: 10,
    unlockAfter: null,
    summary:
      "The answer is obvious. The room disagrees. A panel of previous participants answers before you, and they are confidently wrong.",
    concept:
      "When a unanimous group contradicts plain perceptual evidence, a large fraction of people go along, some doubting their eyes, others knowingly yielding. Social reality can override physical reality.",
    background:
      "Solomon Asch (1951, 1956) seated participants with confederates who unanimously gave wrong answers on trivially easy line-length judgments. Across critical trials, 75% of participants conformed at least once and about a third of all critical responses were conforming errors, versus under 1% errors when judging alone. A single dissenting confederate cut conformity dramatically, one of the most practically important results in the literature.",
    learningGoals: [
      "Distinguish informational from normative social influence",
      "Quantify the power of unanimity and the effect of a single ally",
      "Recognize conformity pressure in group decisions",
    ],
    skills: ["Independent judgment", "Perceptual confidence", "Social reasoning"],
    originalStudy: {
      year: 1951,
      researchers: ["Solomon Asch"],
      citation:
        "Asch, S. E. (1956). Studies of independence and conformity: A minority of one against a unanimous majority. Psychological Monographs, 70(9), 1–70.",
      sample: "123 male undergraduates in the core studies",
      finding:
        "36.8% of critical responses conformed to the wrong majority; 75% of participants conformed at least once.",
    },
    applications: [
      "Jury deliberation dynamics and the value of secret first ballots",
      "Groupthink in boards and engineering-review meetings",
      "Design of voting and code-review systems that collect independent judgments first",
    ],
    whatHappened:
      "You judged simple perceptual comparisons after seeing a panel's answers. On critical trials the panel was unanimously wrong. Your yield rate, and how it changed when one panelist dissented, replays Asch's central manipulation on you.",
    whyItHappened:
      "Two pressures operate at once: informational influence ('so many people can't all be wrong') and normative influence (deviating from a unanimous group is socially costly, and fMRI work shows it registers like an error signal). A single ally removes unanimity and collapses the normative pressure.",
    config: {
      trials: 18,
      criticalTrials: 8,
      panelSize: 5,
      allyTrial: 14,
    },
  },
  {
    slug: "authority-protocol",
    code: "E-02",
    title: "Authority Protocol",
    domain: "Authority",
    paradigm: "Obedience (Milgram)",
    engine: "authority",
    wing: "social",
    ordinal: 2,
    difficulty: "ADVANCED",
    durationMin: 14,
    unlockAfter: "conformity-chamber",
    summary:
      "A calm voice, a legitimate institution, an escalating protocol. At each step you decide: comply, question, or refuse. This room studies the decision, not the shock.",
    concept:
      "Ordinary people comply with authority to a degree almost no one predicts, including professionals asked to forecast the results. Legitimacy, gradual escalation, and diffusion of responsibility do most of the work.",
    background:
      "Stanley Milgram's 1963 obedience studies asked participants to administer what they believed were escalating electric shocks to a learner, prompted by an experimenter's scripted insistence. Psychiatrists predicted fewer than 1% would continue to the maximum; in the baseline condition, 65% did. Milgram's variations mapped the conditions that raise and lower obedience, proximity of the victim, legitimacy of the institution, presence of dissenting peers. This platform recreates the decision structure ethically: no deception, no victim, full debrief, the modern consensus for teaching this study.",
    learningGoals: [
      "Identify the situational levers of obedience: legitimacy, gradualism, diffusion",
      "Contrast dispositional and situational explanations of harmful compliance",
      "Understand the ethical revolution the study triggered, IRBs, informed consent, debriefing",
    ],
    skills: ["Ethical reasoning", "Assertiveness", "Situational awareness"],
    originalStudy: {
      year: 1963,
      researchers: ["Stanley Milgram"],
      citation:
        "Milgram, S. (1963). Behavioral study of obedience. Journal of Abnormal and Social Psychology, 67(4), 371–378.",
      sample: "40 men aged 20–50 in the baseline condition",
      finding:
        "65% of participants continued to the maximum 450-volt level under scripted experimenter prompts.",
    },
    applications: [
      "Aviation's crew resource management: training first officers to challenge captains",
      "Medical hierarchy and nurse–physician error escalation",
      "Whistleblowing structures and the design of dissent channels",
    ],
    whatHappened:
      "You moved through an escalating institutional protocol in which a scripted authority urged continuation at each checkpoint. The room recorded where you questioned, where you complied, and what finally made you refuse, the same decision points Milgram's variations manipulated.",
    whyItHappened:
      "Obedience is scaffolded by the situation: an accepted legitimate authority reframes responsibility ('the experimenter is accountable, not me', the agentic state), escalation in small steps never presents an obvious line to cross, and the absence of dissenting models keeps refusal cognitively unavailable.",
    config: {
      checkpoints: 10,
      promptScript: "milgram-v1",
      debriefRequired: true,
    },
  },
] as const satisfies Omit<RoomContent, "research">[]
).map((room) => ({
  ...room,
  research: RESEARCH_PROTOCOLS[room.slug],
}));

export const ACHIEVEMENTS: AchievementContent[] = [
  { slug: "first-steps", title: "Subject Zero", description: "Complete your first experiment.", xpReward: 50 },
  { slug: "perfect-stroop", title: "Automaticity Override", description: "Complete Stroop Lock with 100% accuracy.", xpReward: 150, roomSlug: "stroop-lock" },
  { slug: "span-nine", title: "Nine Symbols Deep", description: "Reach a span of 9 in the Span Chamber.", xpReward: 200, roomSlug: "magic-number-seven" },
  { slug: "saw-gorilla", title: "I Saw It", description: "Notice the unexpected object on the critical trial.", xpReward: 100, roomSlug: "invisible-gorilla", secret: true },
  { slug: "unmoved", title: "Minority of One", description: "Never conform on any critical trial in the Conformity Chamber.", xpReward: 250, roomSlug: "conformity-chamber" },
  { slug: "early-refusal", title: "Conscientious Objector", description: "Refuse the protocol before checkpoint five.", xpReward: 150, roomSlug: "authority-protocol", secret: true },
  { slug: "frame-proof", title: "Invariant", description: "Give consistent answers on every matched framing pair.", xpReward: 200, roomSlug: "framing-effect" },
  { slug: "fast-adapt", title: "Prediction Error", description: "Track the reversal within 8 trials in Reward Corridor.", xpReward: 150, roomSlug: "reward-corridor" },
  { slug: "wing-attention", title: "Attention Cleared", description: "Complete every room in the Attention & Perception wing.", xpReward: 300 },
  { slug: "all-rooms", title: "Full Clearance", description: "Complete all ten rooms of the facility.", xpReward: 1000 },
  { slug: "week-streak", title: "Longitudinal Subject", description: "Play on seven consecutive days.", xpReward: 200 },
  { slug: "skeptic", title: "Source Monitor", description: "Reject every critical lure in the Archive.", xpReward: 250, roomSlug: "false-memory", secret: true },
];

export function getRoom(slug: string): RoomContent | undefined {
  return ROOMS.find((r) => r.slug === slug);
}

export function getWing(slug: string): WingContent | undefined {
  return WINGS.find((w) => w.slug === slug);
}

export const DIFFICULTY_LABEL: Record<string, string> = {
  INTRO: "Intro",
  STANDARD: "Standard",
  ADVANCED: "Advanced",
};
