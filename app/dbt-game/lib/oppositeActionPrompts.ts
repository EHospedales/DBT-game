export interface OppositeActionPrompt {
  emotion: string
  scenario: string
  urge: string
  correctActions: string[]
  explanation: string
}

export const oppositeActionPrompts: OppositeActionPrompt[] = [
  {
    emotion: "Anger",
    scenario: "Your partner forgot your anniversary",
    urge: "Yell at them and storm out",
    correctActions: [
      "Speak calmly about how you feel",
      "Plan a nice activity together",
      "Give them a hug and say you love them",
      "Write a kind note expressing your feelings"
    ],
    explanation: "When angry, act opposite by being gentle and kind to build connection."
  },
  {
    emotion: "Sadness",
    scenario: "You failed an important test",
    urge: "Stay in bed all day and avoid everyone",
    correctActions: [
      "Call a friend and talk about it",
      "Go for a walk outside",
      "Do something you enjoy like listening to music",
      "Make plans to study for the next test"
    ],
    explanation: "When sad, act opposite by being active and connecting with others."
  },
  {
    emotion: "Anxiety",
    scenario: "You have a big presentation tomorrow",
    urge: "Cancel the presentation and avoid it",
    correctActions: [
      "Practice your presentation out loud",
      "Prepare your materials carefully",
      "Talk to someone supportive about your fears",
      "Do relaxation exercises"
    ],
    explanation: "When anxious, act opposite by approaching what you fear rather than avoiding it."
  },
  {
    emotion: "Shame",
    scenario: "You made a mistake at work",
    urge: "Hide and don't tell anyone",
    correctActions: [
      "Tell your supervisor and ask for help",
      "Share the mistake with a trusted colleague",
      "Learn from it and improve your process",
      "Be kind to yourself about being human"
    ],
    explanation: "When ashamed, act opposite by being open and vulnerable rather than hiding."
  },
  {
    emotion: "Jealousy",
    scenario: "Your friend got a promotion you wanted",
    urge: "Stop talking to them and be cold",
    correctActions: [
      "Congratulate them sincerely",
      "Ask them to share what they did to succeed",
      "Celebrate their achievement",
      "Focus on your own goals and progress"
    ],
    explanation: "When jealous, act opposite by being happy for others and supportive."
  },
  {
    emotion: "Fear",
    scenario: "You're afraid to try something new",
    urge: "Say no and stay in your comfort zone",
    correctActions: [
      "Try it for just 5 minutes",
      "Ask a friend to do it with you",
      "Break it into small steps",
      "Remind yourself of past successes"
    ],
    explanation: "When afraid, act opposite by approaching rather than avoiding."
  },
  {
    emotion: "Guilt",
    scenario: "You forgot to call your mom",
    urge: "Avoid calling her and feel bad",
    correctActions: [
      "Call her right now and apologize",
      "Make plans to visit soon",
      "Do something nice for her",
      "Forgive yourself and move forward"
    ],
    explanation: "When guilty, act opposite by making amends and being kind to yourself."
  },
  {
    emotion: "Loneliness",
    scenario: "You feel isolated and want to withdraw",
    urge: "Stay home alone and watch TV",
    correctActions: [
      "Text a friend to say hi",
      "Join an online community or group",
      "Volunteer for something meaningful",
      "Go to a public place and smile at people"
    ],
    explanation: "When lonely, act opposite by reaching out and connecting with others."
  }
]