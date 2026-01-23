export type DBTCategory =
  | "wiseMind"
  | "emotionRegulation"
  | "distressTolerance"
  | "interpersonalEffectiveness"

export type DBTPrompt = {
  id: string
  category: DBTCategory
  text: string
}

// Utility to generate IDs
function id(prefix: string, index: number) {
  return `${prefix}-${index}`
}

export const dbtPrompts: DBTPrompt[] = [
  // 🌿 WISE MIND — 25 prompts
  ...[
    "You receive a text that feels cold or dismissive. What’s your first internal reaction?",
    "You’re running late and feel pressure building. Which mind state shows up first?",
    "Someone interrupts you mid‑sentence. What emotion rises before you respond?",
    "You’re asked to make a quick decision. What part of you wants to take over?",
    "You feel torn between two good options. What helps you slow down?",
    "You notice your heart racing during a conversation. What story does your mind tell?",
    "You’re overwhelmed by tasks. What’s the first urge you feel?",
    "You’re offered unexpected help. What emotion shows up first?",
    "You feel misunderstood. What’s your instinctive reaction?",
    "You’re waiting for an important message. What mind state dominates?",
    "You’re asked to give feedback. What internal voice speaks first?",
    "You feel embarrassed. What does your body want to do?",
    "You’re praised unexpectedly. What emotion surfaces first?",
    "You’re asked to try something new. What’s your initial thought?",
    "You feel left out of a plan. What story does your mind create?",
    "You’re stuck in traffic. What emotion rises first?",
    "You’re asked to explain your feelings. What mind state appears?",
    "You’re surprised by a sudden change. What’s your first reaction?",
    "You feel judged. What urge comes up?",
    "You’re given constructive criticism. What emotion shows up first?",
    "You’re asked to apologize. What internal resistance appears?",
    "You’re asked to wait longer than expected. What mind state takes over?",
    "You feel pressure to be perfect. What emotion rises?",
    "You’re asked to compromise. What internal voice speaks first?",
    "You feel disconnected. What helps you return to center?",
  ].map((text, i) => ({
    id: id("wise", i + 1),
    category: "wiseMind" as const,
    text,
  })),

  // 🔥 DISTRESS TOLERANCE — 25 prompts
  ...[
    "You receive upsetting news. What skill would help you get through the next 10 minutes?",
    "You feel an urge to react impulsively. What could help you pause?",
    "You’re overwhelmed by emotion. Which ACCEPTS skill fits best?",
    "You feel trapped in a stressful situation. What’s one thing you can control?",
    "You’re waiting for results you can’t influence. What skill helps you cope?",
    "You feel rejected. What self‑soothing sense could you use?",
    "You’re stuck in a loop of worry. What activity could shift your focus?",
    "You feel panic rising. What temperature‑based skill might help?",
    "You’re frustrated with someone. What’s one thing you can do to tolerate the moment?",
    "You feel emotionally flooded. What grounding technique helps you return to your body?",
    "You’re overwhelmed by noise or chaos. What sensory skill helps you settle?",
    "You feel powerless. What’s one small effective action you can take?",
    "You’re spiraling into worst‑case thinking. What distraction skill fits?",
    "You feel lonely. What soothing activity helps you feel connected?",
    "You’re stuck in a conflict. What’s one thing you can accept right now?",
    "You feel shame. What self‑compassion phrase helps you cope?",
    "You’re exhausted but still stressed. What restful skill helps you reset?",
    "You feel angry. What movement‑based skill helps release energy?",
    "You’re overwhelmed by choices. What’s one thing you can postpone?",
    "You feel criticized. What grounding object could you hold?",
    "You’re overstimulated. What sensory reduction helps you calm down?",
    "You feel hopeless. What’s one thing that has helped you before?",
    "You’re stuck in rumination. What’s one thing you can do with your hands?",
    "You feel emotionally raw. What soothing environment could you create?",
    "You’re in a high‑stress moment. What’s one phrase that helps you tolerate discomfort?",
  ].map((text, i) => ({
    id: id("distress", i + 1),
    category: "distressTolerance" as const,
    text,
  })),

  // 💛 EMOTION REGULATION — 25 prompts
  ...[
    "You wake up feeling off. What vulnerability factor might be involved?",
    "You feel irritated. What opposite action could help?",
    "You’re anxious about an upcoming event. What skill helps you prepare?",
    "You feel sad. What small activity could lift your mood?",
    "You’re overwhelmed. What’s one thing you can simplify?",
    "You feel guilty. What fact‑checking question helps?",
    "You’re stressed. What routine helps you regulate?",
    "You feel jealous. What value can guide your response?",
    "You’re discouraged. What’s one thing you can accomplish today?",
    "You feel insecure. What self‑validation phrase helps?",
    "You’re angry. What’s the function of the anger?",
    "You feel anxious. What’s one thing you can do slowly?",
    "You’re sad. What’s one thing you can do gently?",
    "You feel overwhelmed. What’s one thing you can postpone?",
    "You feel tense. What body‑based skill helps?",
    "You’re frustrated. What expectation might need adjusting?",
    "You feel lonely. What connection action helps?",
    "You’re stressed. What sensory input helps regulate you?",
    "You feel stuck. What value‑aligned action helps you move forward?",
    "You’re drained. What replenishes your energy?",
    "You feel self‑critical. What’s one compassionate reframe?",
    "You’re anxious. What’s one thing you can control right now?",
    "You feel overwhelmed. What’s one thing you can remove from your plate?",
    "You’re sad. What’s one thing that brings comfort?",
    "You feel emotionally activated. What’s one thing that helps you slow down?",
  ].map((text, i) => ({
    id: id("emotion", i + 1),
    category: "emotionRegulation" as const,
    text,
  })),

  // 🤝 INTERPERSONAL EFFECTIVENESS — 25 prompts
  ...[
    "You need to ask for something important. What’s your objective?",
    "You want to say no. What boundary matters most?",
    "You feel unheard. What DEAR MAN skill fits best?",
    "You’re entering a difficult conversation. What’s your relationship goal?",
    "You feel defensive. What self‑respect value matters here?",
    "You need to give feedback. What tone supports your goal?",
    "You feel dismissed. What validation skill helps?",
    "You want to repair a rupture. What’s your first step?",
    "You feel criticized. What’s the most skillful response?",
    "You need to negotiate. What’s your bottom line?",
    "You feel pressured. What boundary could you set?",
    "You want to express a need. What’s the clearest way to say it?",
    "You feel disconnected. What small bid for connection helps?",
    "You’re in conflict. What’s one thing you can validate?",
    "You need to assert yourself. What’s your DEAR MAN Assert?",
    "You feel misunderstood. What clarification could help?",
    "You want to maintain the relationship. What GIVE skill fits?",
    "You feel hurt. What’s the most skillful way to express it?",
    "You need to ask for support. What’s your specific request?",
    "You feel ignored. What’s one effective action you can take?",
    "You want to repair trust. What’s one consistent behavior you can show?",
    "You feel overwhelmed in a conversation. What boundary helps?",
    "You want to express appreciation. What’s one specific thing you can name?",
    "You feel tension rising. What tone helps de‑escalate?",
    "You want to reconnect after conflict. What’s your first gentle step?",
  ].map((text, i) => ({
    id: id("interpersonal", i + 1),
    category: "interpersonalEffectiveness" as const,
    text,
  })),
]

// ⭐ Helper: get random prompt from any category
export function getRandomPrompt(category?: DBTCategory) {
  const pool = category
    ? dbtPrompts.filter((p) => p.category === category)
    : dbtPrompts

  return pool[Math.floor(Math.random() * pool.length)]
}
