const AI_SERVICE_URL =
  process.env.AI_SERVICE_URL || 'http://localhost:8001';

const TUTOR_PERSONAS = {
  Maya: {
    systemPrompt:
      'You are Maya, a warm, friendly conversation partner. You make the learner feel comfortable, ask curious questions about their life and interests, and encourage them to share more. Keep your responses short (2-3 sentences) so the learner has plenty of time to speak. Be genuine and supportive.',
    style: 'friendly',
  },
  James: {
    systemPrompt:
      'You are James, a business English coach. You help the learner practice professional communication: meetings, presentations, interviews, emails. You are clear, focused, and give practical feedback. Keep your responses short (2-3 sentences) and ask follow-up questions that simulate real business situations.',
    style: 'professional',
  },
  Priya: {
    systemPrompt:
      'You are Priya, a debate partner. You challenge the learner to express opinions clearly and support them with reasons. You present counterarguments respectfully and push the learner to think deeper. Keep your responses short (2-3 sentences) and always end with a thought-provoking question.',
    style: 'analytical',
  },
};

const ROLEPLAY_SCENARIOS = {
  'hr-interview': {
    label: 'HR interview',
    prompt:
      'You are conducting an HR interview. Start by asking the candidate to introduce themselves. Ask common HR questions one at a time: tell me about yourself, why do you want this role, what are your strengths, describe a challenge you overcame. React naturally to each answer. Keep each response to 2-3 sentences.',
  },
  'job-interview': {
    label: 'Job interview',
    prompt:
      'You are conducting a job interview for a software developer position. Start by asking the candidate to introduce themselves. Ask technical and behavioral questions one at a time. React naturally. Keep each response to 2-3 sentences.',
  },
  'presentation': {
    label: 'Presentation',
    prompt:
      'You are an audience member at a presentation. Ask the presenter to introduce their topic, then ask clarifying questions about their content. React with curiosity and ask follow-up questions. Keep each response to 2-3 sentences.',
  },
  'team-meeting': {
    label: 'Team meeting',
    prompt:
      'You are a team lead in a weekly meeting. Ask each team member for updates, discuss blockers, and assign next steps. React naturally to what the learner says. Keep each response to 2-3 sentences.',
  },
  'client-meeting': {
    label: 'Client meeting',
    prompt:
      'You are a client meeting with a service provider. Ask about their services, pricing, and timeline. React naturally and ask follow-up questions. Keep each response to 2-3 sentences.',
  },
  'networking': {
    label: 'Networking event',
    prompt:
      'You are a stranger at a networking event. Start a casual conversation, ask about their work and interests, and share a bit about yourself. Keep each response to 2-3 sentences.',
  },
};

const DEBATE_TOPICS = [
  { id: 'remote-work', title: 'Should remote work become the default?', prompt: 'Debate whether remote work should become the default for office jobs.' },
  { id: 'social-media', title: 'Is social media doing more harm than good?', prompt: 'Debate whether social media is doing more harm than good for society.' },
  { id: 'ai-education', title: 'Should AI be used in education?', prompt: 'Debate whether AI should be integrated into education systems.' },
  { id: 'four-day-week', title: 'Should every workplace have a four-day week?', prompt: 'Debate whether a four-day work week should be standard.' },
];

function buildConversationMessages(conversation, tutor, userMessage, mode, scenario, debateTopic, debatePosition) {
  let systemContent = TUTOR_PERSONAS[tutor]?.systemPrompt || TUTOR_PERSONAS.Maya.systemPrompt;

  if (mode === 'roleplay' && scenario && ROLEPLAY_SCENARIOS[scenario]) {
    systemContent = ROLEPLAY_SCENARIOS[scenario].prompt;
  }

  if (mode === 'debate' && debateTopic) {
    const topic = DEBATE_TOPICS.find((t) => t.id === debateTopic);
    if (topic) {
      systemContent = `You are a debate partner. The topic is: "${topic.prompt}" The learner is arguing ${debatePosition === 'for' ? 'FOR' : 'AGAINST'} the topic. You argue ${debatePosition === 'for' ? 'AGAINST' : 'FOR'}. Present one clear argument per turn. React to the learner's points. Keep each response to 3-4 sentences. Do not declare a winner — focus on the quality of argumentation.`;
    }
  }

  const messages = [{ role: 'system', content: systemContent }];

  const recentMessages = (conversation.messages || []).slice(-12);
  for (const msg of recentMessages) {
    messages.push({ role: msg.role, content: msg.content });
  }

  if (userMessage) {
    messages.push({ role: 'user', content: userMessage });
  }

  return messages;
}

export async function generateAIResponse(
  conversation,
  userMessage,
  options = {}
) {
  const {
    tutor = 'Maya',
    mode = 'conversation',
    scenario = null,
    debateTopic = null,
    debatePosition = null,
  } = options;

  const messages = buildConversationMessages(
    conversation,
    tutor,
    userMessage,
    mode,
    scenario,
    debateTopic,
    debatePosition
  );

  if (conversation.messages.length === 0) {
    messages.push({
      role: 'user',
      content:
        mode === 'roleplay'
          ? 'Start the scenario now.'
          : mode === 'debate'
            ? 'Start the debate with your opening argument.'
            : 'Start the conversation now with a friendly opening.',
    });
  }

  try {
    const response = await fetch(`${AI_SERVICE_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(payload?.detail || payload?.message || 'AI service error');
    }

    return payload.reply || payload.response || '';
  } catch (error) {
    console.error('AI conversation error:', error.message);

    if (conversation.messages.length === 0) {
      return mode === 'roleplay'
        ? "Let's begin. Tell me a bit about yourself."
        : mode === 'debate'
          ? "I'll start. I believe my position is well-supported. What's your main argument?"
          : "Hi there! I'm glad you're here. What would you like to talk about today?";
    }

    return "That's an interesting point. Could you tell me more about that?";
  }
}

export { TUTOR_PERSONAS, ROLEPLAY_SCENARIOS, DEBATE_TOPICS };
