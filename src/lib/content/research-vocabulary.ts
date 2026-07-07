import type { ResearchProtocol, ResearchTerm } from "./types";

/**
 * Standard experimental-design vocabulary per room (IV, DV, operational definitions).
 * Aligned with published paradigms: Simons & Chabris (1999), Rensink et al. (1997),
 * Miller (1956), Roediger & McDermott (1995), Tversky & Kahneman (1981), Stroop (1935),
 * Asch (1956), Milgram (1963), and related literature.
 */
export const RESEARCH_PROTOCOLS: Record<string, ResearchProtocol> = {
  "invisible-gorilla": {
    design: "Between-subjects (single critical trial); unexpected-stimulus detection",
    independentVariable:
      "Attentional load of the primary task (e.g., count passes among one shirt color vs. both teams)",
    dependentVariables: [
      "Detection of the unexpected object (hit vs. miss)",
      "Subjective awareness reports on the critical trial",
    ],
    operationalDefinitions: {
      "Inattentional blindness":
        "Failure to report a salient, fully visible unexpected object when attention is engaged elsewhere",
      "Attentional load":
        "Difficulty of the counting or tracking task imposed on the observer",
      "Unexpected stimulus":
        "Object not described in pre-trial instructions and absent from practice",
    },
    measuredConstructs: [
      "Selective attention",
      "Perceptual awareness",
      "Task-set maintenance",
    ],
    keyTerms: [
      {
        term: "Inattentional blindness",
        definition:
          "Failure to notice an unexpected object in plain view because attention is occupied by another task (Mack & Rock, 1998; Simons & Chabris, 1999).",
      },
      {
        term: "Change blindness",
        definition:
          "Failure to detect a change between two displays; distinct from inattentional blindness, which concerns a single display (Simons & Rensink, 2005).",
      },
      {
        term: "Attentional set",
        definition:
          "The task-defined filter that determines which features or objects receive processing resources.",
      },
    ],
  },
  "change-blindness": {
    design: "Within-subjects; flicker paradigm with masked motion transients",
    independentVariable:
      "Presence and duration of an inter-stimulus blank (ISI) between original and modified scenes",
    dependentVariables: [
      "Number of alternations until change detected",
      "Search time (seconds to correct localization)",
    ],
    operationalDefinitions: {
      "Change blindness":
        "Failure to notice a large visual change across successive views of a scene",
      "Motion transient":
        "Low-level signal produced when a region changes luminance or position between frames",
      "Flicker paradigm":
        "Rapid alternation of pre-change and post-change images separated by a blank mask",
    },
    measuredConstructs: [
      "Visual short-term memory",
      "Focused attention",
      "Scene representation",
    ],
    keyTerms: [
      {
        term: "Transsaccadic integration",
        definition:
          "Combining information across eye movements; change detection often fails when transients are masked.",
      },
      {
        term: "Mudsplash",
        definition:
          "High-contrast distractors that do not cover the change but still impair detection (O'Regan et al., 2000).",
      },
      {
        term: "Change blindness blindness",
        definition:
          "Metacognitive overconfidence in one's ability to detect changes (Levin et al., 2000).",
      },
    ],
  },
  "magic-number-seven": {
    design: "Adaptive staircase (within-subjects); memory span procedure",
    independentVariable: "Sequence length (number of items to recall)",
    dependentVariables: [
      "Proportion correct per sequence length",
      "Maximum span reached (last length with criterion performance)",
    ],
    operationalDefinitions: {
      "Digit span":
        "Longest sequence of items recalled in correct order on a majority of trials",
      "Working memory capacity":
        "Limit on items held in an active, manipulable store (often ~4 chunks when rehearsal is controlled; Cowan, 2001)",
      Chunking:
        "Recoding individual items into larger meaningful units to expand effective capacity",
    },
    measuredConstructs: ["Working memory", "Phonological storage", "Rehearsal"],
    keyTerms: [
      {
        term: "Magical number seven",
        definition:
          "Miller's (1956) synthesis that immediate memory span clusters near 7 ± 2 items before chunking.",
      },
      {
        term: "Phonological loop",
        definition:
          "Baddeley's subsystem for maintaining verbal sequences via subvocal rehearsal.",
      },
      {
        term: "Articulatory suppression",
        definition:
          "Interfering with rehearsal (e.g., repeating an irrelevant word) to isolate storage capacity.",
      },
    ],
  },
  "false-memory": {
    design: "Within-subjects; Deese-Roediger-McDermott (DRM) list learning",
    independentVariable:
      "Semantic relatedness of studied lists to an unpresented critical lure",
    dependentVariables: [
      "False recognition rate to critical lures",
      "False recall rate",
      "Confidence judgments (remember/know)",
    ],
    operationalDefinitions: {
      "Critical lure":
        "High-associate theme word never presented during study but predicted by list items",
      "False memory":
        "Subjective recollection or recognition of an event that did not occur",
      "Gist trace":
        "Abstract meaning representation shared across list words (e.g., sleep-related concepts)",
    },
    measuredConstructs: ["Episodic memory", "Source monitoring", "Semantic activation"],
    keyTerms: [
      {
        term: "DRM paradigm",
        definition:
          "Lists of associates converging on a critical lure; reliably induces false recognition (Roediger & McDermott, 1995).",
      },
      {
        term: "Spreading activation",
        definition:
          "Semantic priming whereby studied words activate related nodes, including the lure.",
      },
      {
        term: "Remember vs. know",
        definition:
          "Subjective distinction between recollective detail (remember) and familiarity without context (know).",
      },
    ],
  },
  "framing-effect": {
    design: "Between-subjects (gain frame vs. loss frame); Asian disease problem",
    independentVariable:
      "Outcome framing (lives saved / positive frame vs. lives lost / negative frame)",
    dependentVariables: [
      "Choice proportion for risky vs. certain option",
      "Preference reversal across matched frames",
    ],
    operationalDefinitions: {
      "Framing effect":
        "Systematic preference shift when equivalent outcomes are described as gains or losses",
      "Loss aversion":
        "Asymmetric weighting: losses loom larger than equivalent gains (λ > 1 in prospect theory)",
      "Reference point":
        "Status quo or baseline from which outcomes are coded as gains or losses",
    },
    measuredConstructs: [
      "Risk preference",
      "Decision making under uncertainty",
      "Reference dependence",
    ],
    keyTerms: [
      {
        term: "Prospect theory",
        definition:
          "Descriptive model of choice under risk: value is defined over gains/losses, not final wealth (Kahneman & Tversky, 1979).",
      },
      {
        term: "Invariance axiom",
        definition:
          "Rational choice requires preferences over outcomes to be independent of description; violated by framing.",
      },
      {
        term: "Risk seeking in losses",
        definition:
          "Convex value function for losses leads people to gamble to avoid sure losses.",
      },
    ],
  },
  "reward-corridor": {
    design: "Within-subjects; multi-armed bandit with non-stationary rewards",
    independentVariable:
      "Choice option (arm) and trial position (including reversal at midpoint)",
    dependentVariables: [
      "Choice allocation per arm",
      "Post-reversal adaptation rate (trials to shift preference)",
      "Total reward earned",
    ],
    operationalDefinitions: {
      "Prediction error":
        "δ = received reward − expected reward; drives associative learning (Rescorla & Wagner, 1972)",
      "Explore–exploit tradeoff":
        "Balance between sampling uncertain options and choosing the current best estimate",
      "Variable-ratio schedule":
        "Reinforcement on unpredictable trials; produces high, persistent response rates (Skinner, 1938)",
    },
    measuredConstructs: [
      "Reinforcement learning",
      "Reward sensitivity",
      "Behavioral flexibility",
    ],
    keyTerms: [
      {
        term: "Multi-armed bandit",
        definition:
          "Sequential choice among options with unknown payoff distributions; formal model of exploration.",
      },
      {
        term: "Rescorla–Wagner rule",
        definition:
          "ΔV = αβ(λ − ΣV): associative strength updates proportionally to surprise.",
      },
      {
        term: "Reversal learning",
        definition:
          "Contingency switch requiring extinction of old associations and acquisition of new ones.",
      },
    ],
  },
  "stroop-lock": {
    design: "Within-subjects repeated measures; color-word Stroop task",
    independentVariable:
      "Stimulus congruency (congruent, neutral, incongruent word–ink pairings)",
    dependentVariables: [
      "Reaction time (ms) to name ink color",
      "Response accuracy",
      "Stroop interference score (RT_incongruent − RT_congruent or − RT_neutral)",
    ],
    operationalDefinitions: {
      "Stroop interference":
        "Slowing (and errors) when ink color conflicts with the word's meaning",
      Automaticity:
        "Overlearned reading proceeds without deliberate control, competing with color naming",
      "Response conflict":
        "Simultaneous activation of incompatible response tendencies",
    },
    measuredConstructs: ["Inhibitory control", "Processing speed", "Executive attention"],
    keyTerms: [
      {
        term: "Stroop effect",
        definition:
          "Classic interference when naming ink color of incongruent color words (Stroop, 1935).",
      },
      {
        term: "Anterior cingulate cortex (ACC)",
        definition:
          "Conflict monitoring region engaged when competing responses are co-activated.",
      },
      {
        term: "Dorsolateral prefrontal cortex (DLPFC)",
        definition:
          "Implements top-down biasing toward task-relevant dimensions (color, not word).",
      },
    ],
  },
  "affective-gate": {
    design: "Within-subjects; emotional Stroop variant",
    independentVariable:
      "Emotional valence of distractor words (neutral, threat, positive)",
    dependentVariables: [
      "Reaction time to ink-color naming",
      "Emotional interference (RT_emotional − RT_neutral)",
    ],
    operationalDefinitions: {
      "Attentional bias":
        "Preferential processing of threat- or concern-relevant stimuli",
      "Emotional Stroop":
        "Slowed color naming for emotionally salient words unrelated to the ink color",
      "Attentional capture":
        "Involuntary orienting to significant stimuli, distinct from response conflict",
    },
    measuredConstructs: [
      "Emotional attention",
      "Anxiety-related cognition",
      "Attentional control",
    ],
    keyTerms: [
      {
        term: "Threat hypervigilance",
        definition:
          "Faster detection or slower disengagement from threat cues in anxious individuals.",
      },
      {
        term: "Amygdala",
        definition:
          "Subcortical structure that flags affective significance and modulates early attention.",
      },
      {
        term: "Cognitive avoidance",
        definition:
          "Strategy of diverting attention from emotional material; can reduce interference.",
      },
    ],
  },
  "conformity-chamber": {
    design: "Between-subjects (alone vs. group); Asch line-judgment paradigm",
    independentVariable:
      "Social context (unanimous confederate errors vs. solo judgment vs. one dissenting ally)",
    dependentVariables: [
      "Conformity rate (% critical trials matching erroneous majority)",
      "Proportion of participants who conform at least once",
    ],
    operationalDefinitions: {
      Conformity:
        "Public agreement with group judgment despite private perceptual evidence",
      "Normative influence":
        "Yielding to fit in or avoid social disapproval",
      "Informational influence":
        "Treating others' responses as evidence about reality",
    },
    measuredConstructs: [
      "Social influence",
      "Perceptual confidence",
      "Group decision making",
    ],
    keyTerms: [
      {
        term: "Asch effect",
        definition:
          "Elevated error rate when a unanimous majority gives wrong answers on unambiguous trials (Asch, 1956).",
      },
      {
        term: "Unanimity",
        definition:
          "All confederates agree; breaking unanimity with one dissent sharply reduces conformity.",
      },
      {
        term: "Private acceptance vs. public compliance",
        definition:
          "Whether the individual believes the group (acceptance) or only acts as if they do (compliance).",
      },
    ],
  },
  "authority-protocol": {
    design: "Between-subjects variations; Milgram obedience paradigm (ethical simulation)",
    independentVariable:
      "Situational factors: experimenter proximity, institutional legitimacy, graded shocks, peer dissent",
    dependentVariables: [
      "Maximum shock level administered",
      "Latency to refuse or question authority",
      "Subjective responsibility ratings",
    ],
    operationalDefinitions: {
      Obedience:
        "Compliance with instructions from a perceived legitimate authority despite personal reservations",
      "Agentic state":
        "Psychological shift where the actor feels an authority bears responsibility (Milgram, 1974)",
      "Gradual commitment":
        "Escalation in small steps that prevents a clear moment of refusal",
    },
    measuredConstructs: [
      "Obedience to authority",
      "Moral decision making",
      "Situational vs. dispositional attribution",
    ],
    keyTerms: [
      {
        term: "Milgram experiment",
        definition:
          "Participants administered believed electric shocks on experimenter's orders; 65% continued to maximum in baseline (Milgram, 1963).",
      },
      {
        term: "Legitimate authority",
        definition:
          "Institutionally endorsed figure whose commands are perceived as binding.",
      },
      {
        term: "Diffusion of responsibility",
        definition:
          "Reduced personal accountability when authority or group shares causal responsibility.",
      },
    ],
  },
};

export function getResearchProtocol(slug: string): ResearchProtocol | undefined {
  return RESEARCH_PROTOCOLS[slug];
}

export function buildGlossary(): ResearchTerm[] {
  const byTerm = new Map<string, ResearchTerm>();
  for (const protocol of Object.values(RESEARCH_PROTOCOLS)) {
    for (const entry of protocol.keyTerms) {
      const key = entry.term.toLowerCase();
      if (!byTerm.has(key)) byTerm.set(key, entry);
    }
  }
  return [...byTerm.values()].sort((a, b) => a.term.localeCompare(b.term));
}
