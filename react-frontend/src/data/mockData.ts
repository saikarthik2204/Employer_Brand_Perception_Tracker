
import { FeedbackRecord, Sentiment } from '../types';

const FEEDBACK_TEMPLATES = {
  [Sentiment.POSITIVE]: [
    "The new remote work policy is a game changer for my work-life balance.",
    "Proud to be part of a company that prioritizes ethical AI development.",
    "Great leadership team that truly listens to employee concerns.",
    "The health benefits here are second to none. Very grateful.",
    "Incredible collaboration during the Q3 product launch. Amazing team!",
    "Learning and development programs have helped me grow so much this year.",
    "The office culture is vibrant and inclusive. Best place I've worked.",
    "Clear communication from the CEO makes us feel valued and informed."
  ],
  [Sentiment.NEUTRAL]: [
    "Another quarterly meeting. Standard updates as usual.",
    "Transitioning to the new internal portal. It's okay, just different.",
    "The cafeteria menu changed. Some items are better, some worse.",
    "Just finishing up my annual performance review process.",
    "Office temperature is a bit inconsistent lately.",
    "Routine software update today. Took about 30 minutes.",
    "Attended a webinar on project management. It was informative.",
    "Parking space is becoming a bit tighter but manageable."
  ],
  [Sentiment.NEGATIVE]: [
    "Feeling burnt out due to the unrealistic deadlines on Project X.",
    "Lack of transparency regarding the recent team restructuring.",
    "The internal tools are slow and constantly crashing. Frustrating.",
    "Communication between departments is quite poor right now.",
    "Promotion cycle felt biased this time around. Disappointed.",
    "Management seems disconnected from the day-to-day challenges we face.",
    "Travel budget cuts are making it harder to support international clients.",
    "The documentation for our legacy systems is practically non-existent."
  ]
};

export const generateMockData = (count: number = 800): FeedbackRecord[] => {
  const data: FeedbackRecord[] = [];
  const now = new Date();
  
  for (let i = 0; i < count; i++) {
    const sentimentSeed = Math.random();
    let sentiment: Sentiment;
    if (sentimentSeed < 0.45) sentiment = Sentiment.POSITIVE;
    else if (sentimentSeed < 0.75) sentiment = Sentiment.NEUTRAL;
    else sentiment = Sentiment.NEGATIVE;

    const templates = FEEDBACK_TEMPLATES[sentiment];
    const text = templates[Math.floor(Math.random() * templates.length)];
    
    // Spread dates over the last 180 days
    const dateOffset = Math.floor(Math.random() * 180);
    const createdAt = new Date(now.getTime() - dateOffset * 24 * 60 * 60 * 1000).toISOString();

    data.push({
      id: `id-${i}`,
      text,
      createdAt,
      sentiment
    });
  }

  return data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};
