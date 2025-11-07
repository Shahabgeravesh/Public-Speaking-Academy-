import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const STORAGE_KEY = 'PSA_PROGRESS_V2';

const createCards = (moduleId, items) =>
  items.map((content, index) => ({
    id: `${moduleId}-${index + 1}`,
    title: `Card ${index + 1}`,
    content,
  }));

const FUNDAMENTALS_CARDS = [
  {
    id: 'fundamentals-1',
    title: 'Voice Is a System',
    content: {
      explanation:
        "Your voice is not 'your throat.' Speaking equals breath supply plus resonance chambers plus articulation. When one of these is weak, your voice becomes inconsistent.",
      example: 'Someone who speaks with tight shoulders sounds squeezed even if English is perfect.',
      practice: 'Say 2 sentences about your morning. Notice which part feels tight: breath, chest, or jaw.',
    },
  },
  {
    id: 'fundamentals-2',
    title: 'Breath Is the Engine',
    content: {
      explanation: 'Breath is the fuel of sound. When breath collapses you cannot maintain a stable voice.',
      example: 'Talking while rushing between rooms always sounds choppy.',
      practice: 'Inhale through your nose for 2 seconds before you speak one sentence about yesterday.',
    },
  },
  {
    id: 'fundamentals-3',
    title: 'Resonance Shapes Sound',
    content: {
      explanation:
        'Air vibrates in cavities. Where the vibration happens changes tone: chest feels solid, nasal feels thin, head feels bright.',
      example: 'Saying "good morning" in chest voice versus nasal voice sounds totally different.',
      practice: 'Hum for 3 seconds and then say one line about your day.',
    },
  },
  {
    id: 'fundamentals-4',
    title: 'Posture Unlocks Airflow',
    content: {
      explanation: 'Slouching compresses breathing space and flattens vocal richness.',
      example: 'Sitting collapsed on a couch makes your sound dull. Upright posture opens the tone.',
      practice: 'Sit tall and say 3 sentences describing your room.',
    },
  },
  {
    id: 'fundamentals-5',
    title: 'Jaw Tension Blocks Clarity',
    content: {
      explanation: 'When the jaw is tight, articulation becomes lazy and consonants get muddy.',
      example: 'People who clench their teeth sound unclear even when vocabulary is strong.',
      practice: 'Relax your jaw consciously, then say 3 clear short sentences about any topic.',
    },
  },
  {
    id: 'fundamentals-6',
    title: 'Articulation vs Accent',
    content: {
      explanation: 'Accent does not destroy clarity. Poor articulation destroys clarity.',
      example: 'A relaxed American who drops word endings sounds worse than an ESL speaker who lands consonants cleanly.',
      practice: 'Read one sentence and emphasize every ending consonant.',
    },
  },
  {
    id: 'fundamentals-7',
    title: 'Rhythm Is Perception',
    content: {
      explanation: 'Listeners judge confidence from pacing. Rhythm tells them how sure you are.',
      example: 'Slow and steady sounds grounded. Fast and pressured sounds insecure.',
      practice: 'Speak for 15 seconds at a calm, slow pace about your afternoon plans.',
    },
  },
  {
    id: 'fundamentals-8',
    title: 'Stop Speaking While Thinking',
    content: {
      explanation: 'Do not start a sentence until the thought exists. Thinking while speaking creates filler.',
      example: '"Umm so I was like maybe..." is thinking out loud.',
      practice: 'Form the thought in silence. Then speak one clean sentence.',
    },
  },
  {
    id: 'fundamentals-9',
    title: 'Sentence Endings Matter Most',
    content: {
      explanation: 'Listeners remember the final words more than the middle. Endings must land firmly.',
      example: 'Do not fade with "That is what happened..." Instead land the last word.',
      practice: 'Say 3 sentences about today and land the final word clearly each time.',
    },
  },
  {
    id: 'fundamentals-10',
    title: 'Speak in Straight Lines',
    content: {
      explanation: 'Clear speech follows start to point to stop. Circular wandering kills attention.',
      example: '"Here is what happened." is cleaner than "Well I do not know maybe I think..."',
      practice: 'Say 2 straight-line sentences summarizing this morning.',
    },
  },
  {
    id: 'fundamentals-11',
    title: 'Confidence Equals Reduction',
    content: {
      explanation: 'Confident speakers remove unnecessary language and lead with the result.',
      example: 'Instead of three sentences of context, they give the conclusion first.',
      practice: 'Tell one small story today starting with the result.',
    },
  },
  {
    id: 'fundamentals-12',
    title: 'Precision Beats Vocabulary Size',
    content: {
      explanation: 'A large vocabulary does not create authority. Precision does.',
      example: '"He lied." is stronger than "He was not fully transparent."',
      practice: 'Take one vague sentence you said today and rewrite it sharper.',
    },
  },
  {
    id: 'fundamentals-13',
    title: 'Breath Before Emotion',
    content: {
      explanation: 'Emotion spikes break breath rhythm, which weakens sound.',
      example: 'Before responding to something upsetting, inhale through your nose and then speak.',
      practice: 'Say one sentence about something annoying. Pause, breathe, then say a clean sentence.',
    },
  },
  {
    id: 'fundamentals-14',
    title: 'Your Face Must Move',
    content: {
      explanation: 'Clear sound requires motion from lips, tongue, and jaw. A frozen face muffles sound.',
      example: 'People who barely move their mouth sound like they are mumbling into a pillow.',
      practice: 'Say 2 clear sentences exaggerating lip shaping.',
    },
  },
  {
    id: 'fundamentals-15',
    title: 'Speak to One Person Mentally',
    content: {
      explanation: 'Imagining a single listener centers tone and reduces stress.',
      example: 'Before telling a story, picture one real person listening.',
      practice: 'Think of one specific person and say 2 sentences directly to them.',
    },
  },
];

const BREATHING_CARDS = [
  {
    id: 'breathing-1',
    title: 'Belly Breathing (Not Chest)',
    content: {
      explanation:
        'Most people breathe high in the chest, which makes the voice tight and weak. Real support comes from low belly expansion.',
      example: 'When you inhale, your lower stomach should push out, not in.',
      practice: 'Place a hand on your lower belly. Inhale for 4 seconds. Speak 2 short sentences about your day.',
    },
  },
  {
    id: 'breathing-2',
    title: 'One Breath Per Sentence',
    content: {
      explanation: 'You lose control when you run out of air mid-sentence. One breath per sentence creates calmer rhythm.',
      example: 'Breathe, then say one sentence: "I slept late today."',
      practice: 'Say 3 sentences. Each sentence must have its own inhale before you speak.',
    },
  },
  {
    id: 'breathing-3',
    title: 'Slow First Word',
    content: {
      explanation: 'The first word sets the emotional tone. A slow first word sounds confident.',
      example: 'Try, "So... this annoyed me today."',
      practice: 'Say 3 sentences about your morning. Deliver the first word slowly each time.',
    },
  },
  {
    id: 'breathing-4',
    title: 'Shoulders Down Before Speaking',
    content: {
      explanation: 'Most tension lives in the shoulders. If they rise, the voice thins out.',
      example: 'Shoulders up equals stressed voice. Shoulders down equals steady voice.',
      practice: 'Drop your shoulders, then speak 3 sentences about something you bought recently.',
    },
  },
  {
    id: 'breathing-5',
    title: 'Hum Before Words',
    content: {
      explanation: 'Humming vibrates the chest and warms the voice instantly.',
      example: 'Hum for 2 seconds, then say, "Today was busy."',
      practice: 'Hum for 2 seconds and then describe one object near you.',
    },
  },
  {
    id: 'breathing-6',
    title: 'Speak on the Exhale',
    content: {
      explanation: 'Many amateurs speak while inhaling, which kills volume and control.',
      example: 'Inhale through your nose. Then speak as you exhale.',
      practice: 'Inhale, then exhale while saying 2 clear sentences.',
    },
  },
  {
    id: 'breathing-7',
    title: 'Lower Final Words',
    content: {
      explanation: 'Finish sentences slightly lower to signal certainty.',
      example: 'Weak ending: "That is what happened...?" Strong ending: "That is what happened."',
      practice: 'Say 3 sentences about yesterday. Lower the last 3 words each time.',
    },
  },
  {
    id: 'breathing-8',
    title: "Don't Force Volume",
    content: {
      explanation: 'Force equals shouting. Resonance equals full tone. You want fullness, not loudness.',
      example: 'Even whispered words can sound powerful when breath is stable.',
      practice: 'Say one quiet sentence but keep full breath support.',
    },
  },
  {
    id: 'breathing-9',
    title: 'Use Nose Inhale Only',
    content: {
      explanation: 'Mouth inhales pull in air too fast and sound desperate.',
      example: 'Before responding to someone, inhale through your nose for 1 second first.',
      practice: 'Speak for 20 seconds about your plans. Use only nose inhales between sentences.',
    },
  },
  {
    id: 'breathing-10',
    title: 'Pause Instead of Gasp',
    content: {
      explanation: 'When you lose breath, do not gasp. Pause, nose inhale, then continue.',
      example: '"I was tired." [pause] "I needed a break."',
      practice: 'Speak for 15 seconds and purposefully pause once to recover with a nose inhale.',
    },
  },
  {
    id: 'breathing-11',
    title: 'Two-Level Tone',
    content: {
      explanation: 'Switch between chest tone and lighter tone to add variety.',
      example: 'Serious parts use chest resonance. Casual parts use a lighter tone.',
      practice: 'Say 2 serious sentences in chest tone, then 2 casual sentences in a lighter tone.',
    },
  },
  {
    id: 'breathing-12',
    title: 'Open Mouth When Speaking',
    content: {
      explanation: 'A lazy, closed mouth makes sound muffled.',
      example: 'Compare saying "coffee" with barely open lips versus a wide opening.',
      practice: 'Describe your breakfast with more mouth opening than normal.',
    },
  },
  {
    id: 'breathing-13',
    title: 'Breath Reset When Emotional',
    content: {
      explanation: 'Anger or stress disrupts breath. Reset with a silent nose inhale.',
      example: 'Instead of rushing into "I cannot believe...", inhale first and then speak.',
      practice: 'Say one sentence about something annoying. Reset with a breath. Say a calmer second sentence.',
    },
  },
  {
    id: 'breathing-14',
    title: 'Release Jaw Tension',
    content: {
      explanation: 'A tight jaw blocks resonance. Relaxing it deepens tone.',
      example: 'Saying "I am fine" with a clenched jaw sounds fake.',
      practice: 'Shake your jaw gently for 2 seconds, then say 2 sentences about your evening plans.',
    },
  },
  {
    id: 'breathing-15',
    title: 'Breath Controls Pace',
    content: {
      explanation: 'Steady breath equals steady pace. Messy breath equals chaotic pace.',
      example: 'When someone is out of breath, they start talking too fast.',
      practice: 'Inhale through your nose for 2 seconds before each sentence. Say 4 simple sentences about your day.',
    },
  },
];

const PACING_CARDS = [
  {
    id: 'pacing-1',
    title: 'Slow Down 20 Percent',
    content: {
      explanation: 'Fast equals nervous. Slow equals grounded.',
      example: 'Calm delivery sounds like: "I woke up. I made coffee."',
      practice: 'Talk for 20 seconds about yesterday at a slower pace than normal.',
    },
  },
  {
    id: 'pacing-2',
    title: 'Micro Pause After Sentence',
    content: {
      explanation: 'A one second gap after each sentence increases authority.',
      example: '"I finished work." [pause] "I relaxed."',
      practice: 'Say 3 sentences. Pause for one second after each.',
    },
  },
  {
    id: 'pacing-3',
    title: 'Pause Before Key Point',
    content: {
      explanation: 'Silence before an idea creates a spotlight.',
      example: '"You know what I noticed?" [pause] "I rush too much."',
      practice: 'Say 2 normal lines, pause, then deliver the main line.',
    },
  },
  {
    id: 'pacing-4',
    title: 'Do Not Fill Silence',
    content: {
      explanation: 'Silence is better than fillers like "uh," "like," or "you know."',
      example: '"I was tired." [pause] "I slept."',
      practice: 'Speak for 20 seconds. Whenever a filler tries to appear, pause instead.',
    },
  },
  {
    id: 'pacing-5',
    title: 'One Thought Per Sentence',
    content: {
      explanation: 'A new thought deserves a new sentence.',
      example: '"Today was hot. I left the AC on."',
      practice: 'Take one messy sentence and split it into three clean ones.',
    },
  },
  {
    id: 'pacing-6',
    title: 'Land Endings Strong',
    content: {
      explanation: 'Sentence endings carry the meaning.',
      example: 'Deliver firmly: "That is what happened."',
      practice: 'Say 3 sentences. Make the final word sharp each time.',
    },
  },
  {
    id: 'pacing-7',
    title: 'Lower Pitch at the End',
    content: {
      explanation: 'Drop pitch slightly at the end to signal certainty.',
      example: '"I am leaving now." (downward ending)',
      practice: 'Say 3 sentences with downward pitch endings.',
    },
  },
  {
    id: 'pacing-8',
    title: 'Stop Talking While Thinking',
    content: {
      explanation: 'Think first, then speak after the thought is ready.',
      example: 'Take a silent pause, then deliver the sentence.',
      practice: 'Before each of 3 sentences, think for one second in silence.',
    },
  },
  {
    id: 'pacing-9',
    title: 'No Rush to Prove',
    content: {
      explanation: 'Rushing signals approval seeking. Calm rhythm shows confidence.',
      example: 'Confident speech is calm, not fast.',
      practice: 'Describe your room with a calm, slow rhythm.',
    },
  },
  {
    id: 'pacing-10',
    title: 'Pace Shift to Highlight',
    content: {
      explanation: 'Changing speed draws attention to the important part.',
      example: 'Speak normally, then slow down for the punchline.',
      practice: 'Speak for 20 seconds and slow down one important line.',
    },
  },
  {
    id: 'pacing-11',
    title: 'Silent Breath Reset',
    content: {
      explanation: 'A quiet nose inhale resets control without breaking flow.',
      example: '[pause] Inhale through the nose for one second, then speak.',
      practice: 'Talk for 15 seconds and do one silent reset halfway.',
    },
  },
  {
    id: 'pacing-12',
    title: 'Remove Double Explaining',
    content: {
      explanation: 'Do not repeat the same sentence with different words.',
      example: 'Say, "I am tired." Then stop.',
      practice: 'State one idea once and resist the urge to restate it.',
    },
  },
  {
    id: 'pacing-13',
    title: 'Beat Structure',
    content: {
      explanation: 'Each sentence is a beat in the story.',
      example: 'Beat 1 weather. Beat 2 food. Beat 3 plan.',
      practice: 'Plan 3 beats and say one sentence for each.',
    },
  },
  {
    id: 'pacing-14',
    title: 'Control Speed on Emotion',
    content: {
      explanation: 'Emotion creates speed spikes. Slow down intentionally.',
      example: '"I was angry." [pause] "I breathed." [pause] "Then I responded."',
      practice: 'Describe something that annoyed you while keeping the pace slow.',
    },
  },
  {
    id: 'pacing-15',
    title: 'Silence Equals Power Display',
    content: {
      explanation: 'Silence signals you are not afraid of the moment.',
      example: '"Listen." [pause] "This matters."',
      practice: 'Say one normal sentence, pause for two seconds, then say one strong sentence.',
    },
  },
];

const LANGUAGE_TIGHTENING_CARDS = [
  {
    id: 'language-1',
    title: 'Identify Your #1 Filler Word',
    content: {
      explanation: 'You cannot eliminate every filler. Start by removing the one you use most often.',
      example: 'Change "like I went there" to "I went there."',
      practice: 'Talk for 30 seconds, listen back, and write down your top filler word.',
    },
  },
  {
    id: 'language-2',
    title: 'Replace Filler with Silence',
    content: {
      explanation: 'Empty space sounds cleaner than "uh."',
      example: '"I was tired." [pause] "I slept."',
      practice: 'Speak for 20 seconds. Each time a filler wants to appear, pause instead.',
    },
  },
  {
    id: 'language-3',
    title: 'Stop Apologizing in Sentences',
    content: {
      explanation: 'Phrases like "I think," "maybe," or "I am not sure" weaken your message.',
      example: 'Change "Maybe we should go now" to "We should go now."',
      practice: 'State 3 opinions directly without apology words.',
    },
  },
  {
    id: 'language-4',
    title: 'Use Strong Verbs',
    content: {
      explanation: 'Strong verbs create clarity. Weak verbs create fog.',
      example: '"I will start" is stronger than "I might start."',
      practice: 'Rewrite one sentence today with a stronger verb.',
    },
  },
  {
    id: 'language-5',
    title: 'One Idea Per Sentence',
    content: {
      explanation: 'Multiple ideas in one sentence confuse people.',
      example: '"I was tired. I slept."',
      practice: 'Split one messy sentence into three separate sentences.',
    },
  },
  {
    id: 'language-6',
    title: 'Delete Your First 10 Useless Words',
    content: {
      explanation: 'The first part of most sentences is unnecessary.',
      example: '"Well you know I was thinking..." becomes "I was thinking."',
      practice: 'Say one sentence today that starts directly with your point.',
    },
  },
  {
    id: 'language-7',
    title: 'Be Specific, Not Vague',
    content: {
      explanation: 'Specific nouns are stronger than vague ones.',
      example: 'Change "I bought fruit" to "I bought oranges."',
      practice: 'Replace two vague nouns today with exact nouns.',
    },
  },
  {
    id: 'language-8',
    title: 'Speak in Present Tense More',
    content: {
      explanation: 'Present tense feels alive and strong.',
      example: '"I feel tired today" rather than "I felt tired earlier."',
      practice: 'Say three sentences about today using present tense only.',
    },
  },
  {
    id: 'language-9',
    title: 'Short Sentences Equal Sharp Messages',
    content: {
      explanation: 'Short sentences are easier to follow.',
      example: '"Today was busy. I handled a lot."',
      practice: 'Talk for 20 seconds using only short sentences.',
    },
  },
  {
    id: 'language-10',
    title: 'Stop Repeating the Same Idea',
    content: {
      explanation: 'Repeating yourself signals insecurity.',
      example: 'Say "I am tired" and stop.',
      practice: 'State one idea once and resist adding a second version.',
    },
  },
  {
    id: 'language-11',
    title: 'Land Your Last Word Clean',
    content: {
      explanation: 'The final word is what people remember most.',
      example: 'Deliver: "That is what happened."',
      practice: 'Say three sentences with a crisp final word.',
    },
  },
  {
    id: 'language-12',
    title: 'Delete Intensifiers',
    content: {
      explanation: 'Words like "very," "really," and "so" add fluff.',
      example: 'Say "I am tired" instead of "I am very tired."',
      practice: 'Pick two feelings today and speak them without intensifiers.',
    },
  },
  {
    id: 'language-13',
    title: 'Stop Over-Setting Context',
    content: {
      explanation: 'Do not waste time with long warmups. Go straight to the punchline.',
      example: '"Yesterday something funny happened."',
      practice: 'Start one story today with the punchline first.',
    },
  },
  {
    id: 'language-14',
    title: 'Lead with Your Conclusion',
    content: {
      explanation: 'Answer first, explain after.',
      example: '"We should go now." Then share the reasons.',
      practice: 'Share one story today starting with the final result.',
    },
  },
  {
    id: 'language-15',
    title: 'Speak in Straight Lines',
    content: {
      explanation: 'Do not spiral or circle. Start, make the point, and stop.',
      example: '"Here is what happened."',
      practice: 'Deliver three facts in three straight sentences.',
    },
  },
];

const STORYTELLING_CARDS = createCards('storytelling', [
  'Draft a story using the situation, challenge, action, result framework.',
  'Identify a relatable character your audience can root for.',
  'Set the scene with sensory detail to paint a vivid picture.',
  'Clarify the stakes so listeners understand what could be lost.',
  'Build tension by describing obstacles the character faced.',
  "Highlight the turning point that changed the story's direction.",
  'Show how the character transformed through the experience.',
  "Connect the story's lesson directly to your core message.",
  'Trim details that do not move the narrative forward.',
  'Practice delivering the story with expressive vocal changes.',
  'Use gestures that mirror the action taking place.',
  'Pause at the climax to let anticipation grow.',
  'Reinforce the takeaway with a concise moral at the end.',
  'Invite the audience to imagine themselves inside the story.',
  'Prepare a shorter backup story in case timing gets tight.',
]);

const CLARITY_STRUCTURE_CARDS = createCards('clarityStructure', [
  'Start with a hook that promises value immediately.',
  'State your thesis clearly before diving into details.',
  'Group supporting points into three clear pillars.',
  'Use signpost language such as "first," "next," and "finally."',
  'Integrate statistics or stories strategically within each section.',
  'Reinforce main ideas with mini-summaries after each pillar.',
  'Craft transitions that connect ideas logically.',
  'Build momentum by escalating stakes across the body.',
  'Offer concrete examples to ground abstract concepts.',
  'Recap key points before moving into the conclusion.',
  'Close with a memorable call to action that is easy to follow.',
  'End on a strong quote or story to anchor the message.',
  'Ensure every visual supports the current section.',
  'Time each segment to maintain a balanced structure.',
  'Trim any repetition that weakens your conclusion.',
]);

const EMOTIONAL_TONE_CARDS = createCards('emotionalTone', [
  'Explore your low, middle, and high registers during warm-ups.',
  'Emphasize key words by slightly increasing volume.',
  'Play with pitch changes to signal questions or excitement.',
  'Add vocal color by varying chest and head resonance.',
  'Use intentional quiet moments to draw the audience closer.',
  'Practice sustaining vowels to smooth out your delivery.',
  'Use contrast between fast and slow phrases for impact.',
  'Highlight numbers or data with a firm, grounded tone.',
  'Layer emotion into your voice to match the story arc.',
  'Avoid monotony by shifting energy every 60 seconds.',
  'Record and review to catch patterns in your intonation.',
  'Project without shouting in rooms of different sizes.',
  'Support long speaking sessions with regular vocal breaks.',
  'Experiment with expressive phrasing borrowed from poetry.',
  'Mark your script with cues for volume, pitch, and pace.',
]);

const PERSUASION_CARDS = createCards('persuasion', [
  'Set expectations for when questions and objections will be addressed.',
  'Listen fully to an objection before offering a response.',
  'Paraphrase the concern to prove you understood it accurately.',
  'Pause briefly to compose a clear, logical reply.',
  'Thank the person for raising the point to keep rapport.',
  'Bridge every answer back to your core message or promise.',
  'Admit gaps honestly and commit to follow up when needed.',
  'Redirect off-topic objections toward the key decision criteria.',
  'Break multi-part challenges into one issue at a time.',
  'Invite supporting questions that build consensus.',
  'Watch the clock so objection handling stays within scope.',
  'Maintain open body language while delivering rebuttals.',
  'Summarize common objections and how you resolved them.',
  'Offer clear next steps after handling a tough objection.',
  'Transition smoothly back into your planned narrative.',
]);

const IDEA_FRAMING_CARDS = createCards('ideaFraming', [
  "Research your audience to frame ideas around what they value most.",
  'Lead with a context sentence that anchors listeners in time or place.',
  'Sequence ideas from big picture to specific proof.',
  'Use contrast, such as before-versus-after, to spotlight core insights.',
  'Connect each supporting story back to the main thesis.',
  'Employ signposts like "first," "next," and "finally" to guide hierarchy.',
  'Use rhetorical questions to open new sections of the narrative.',
  'Highlight why each point matters before diving into detail.',
  'Blend data and anecdotes to balance logic and emotion.',
  'Revisit the central problem each time you introduce a sub-point.',
  'Use callbacks to weave earlier moments into later sections.',
  'Transition with summary sentences that close each beat.',
  'Recap the hierarchy before shifting into implementation steps.',
  'End sections with a takeaway phrase the audience can quote.',
  'Preview how the next idea builds on the structure you just established.',
]);

const OPENING_MASTERY_CARDS = createCards('openingMastery', [
  'Draft three hook options—story, question, statistic—for every talk.',
  'Practice a cold open that starts mid-action without greeting.',
  'Use a sensory detail in the first line to drop listeners into the moment.',
  'Pose a high-stakes question within the first 10 seconds.',
  'State the audience payoff before sharing your background.',
  'Use a surprising data point to reset expectations instantly.',
  'Build a micro-story that ends with the problem you will solve.',
  'Test a contrasting statement: "You think X, but actually Y."',
  'Memorize the first 30 seconds so you can maintain eye contact.',
  'Pair your opening line with a deliberate pause for emphasis.',
  'Layer a callback in the opening that you can close later.',
  'Use props or visuals only if they strengthen the first impression.',
  'Practice delivering the opening at three different energy levels.',
  'Rehearse how you will transition from the hook into the agenda.',
  'Record your opening and rate whether it sparks curiosity immediately.',
]);

const CLOSING_MASTERY_CARDS = createCards('closingMastery', [
  'Summarize the core message in one sentence before closing.',
  'Loop back to your opening hook to create narrative symmetry.',
  'Deliver a concise list of next steps or commitments.',
  'Share a success image that shows life after adopting your idea.',
  'Craft a memorable final line and rehearse landing it cleanly.',
  'Issue a clear call to action with a deadline or trigger.',
  'Highlight the cost of inaction to reinforce urgency.',
  'Use gratitude language that acknowledges audience effort.',
  'Invite reflection with a final question they can ponder later.',
  'Provide a simple way to stay in touch or continue learning.',
  'Practice ending without trailing filler or apologies.',
  'Pause after the final line to let the message settle.',
  'Coordinate body language so your stance matches the conclusion.',
  'Prepare a bonus close for situations where time gets cut short.',
  'Capture feedback on your closing to iterate the next version.',
]);

const IDENTITY_PROJECTION_CARDS = createCards('identityProjection', [
  'Film yourself to see if your posture matches the persona you want to project.',
  'Plant your feet hip-width apart to signal grounded confidence.',
  'Keep your knees relaxed so your stance feels open, not rigid.',
  'Use intentional, open-handed gestures that reinforce your message.',
  'Align gestures with key words to express consistent character.',
  'Move purposefully between zones to show control of the space.',
  'Hold eye contact for full sentences to convey presence.',
  'Let your natural smile appear when the tone should feel warm.',
  'Eliminate fidgeting habits that distract from your professional identity.',
  'Pause to reset your stance whenever energy drifts.',
  "Mirror the audience's energy level without losing your authenticity.",
  'Expand physical presence through posture, not tension.',
  'Match facial expressions to the story arc you are telling.',
  'Use micro-pauses to acknowledge audience reactions with poise.',
  'Close with a deliberate stance that embodies your chosen persona.',
]);

const MODULES = [
  {
    id: 'fundamentals',
    title: 'Module 1 · Fundamentals of Speaking Mechanics',
    description: 'Build a rock-solid foundation for every talk you deliver.',
    gradient: ['#4facfe', '#00f2fe'],
    cards: FUNDAMENTALS_CARDS,
  },
  {
    id: 'breathing',
    title: 'Module 2 · Breathing and Resonance',
    description: 'Power your voice with low-belly breathing and resonant warm-ups.',
    gradient: ['#ff9a9e', '#fad0c4'],
    cards: BREATHING_CARDS,
  },
  {
    id: 'pacing',
    title: 'Module 3 · Pacing and Silence',
    description: 'Control tempo, rhythm, and intentional silence for maximum impact.',
    gradient: ['#a18cd1', '#fbc2eb'],
    cards: PACING_CARDS,
  },
  {
    id: 'language',
    title: 'Module 4 · Filler Removal & Linguistic Tightening',
    description: 'Cut filler, tighten language, and land every sentence with confidence.',
    gradient: ['#f6d365', '#fda085'],
    cards: LANGUAGE_TIGHTENING_CARDS,
  },
  {
    id: 'clarityStructure',
    title: 'Module 5 · Clarity & Sentence Structure',
    description: 'Organize ideas into crisp sentences that audiences can follow.',
    gradient: ['#cfd9df', '#e2ebf0'],
    cards: CLARITY_STRUCTURE_CARDS,
  },
  {
    id: 'storytelling',
    title: 'Module 6 · Storytelling Fundamentals',
    description: 'Craft narratives that persuade, inspire, and stay memorable.',
    gradient: ['#84fab0', '#8fd3f4'],
    cards: STORYTELLING_CARDS,
  },
  {
    id: 'emotionalTone',
    title: 'Module 7 · Emotional Communication & Tone Shifting',
    description: 'Shape emotion with vocal variety, pacing, and dynamic energy.',
    gradient: ['#ffecd2', '#fcb69f'],
    cards: EMOTIONAL_TONE_CARDS,
  },
  {
    id: 'persuasion',
    title: 'Module 8 · Persuasion Logic & Objection Handling',
    description: 'Respond to pushback while keeping your argument on track.',
    gradient: ['#fbc2eb', '#a6c1ee'],
    cards: PERSUASION_CARDS,
  },
  {
    id: 'ideaFraming',
    title: 'Module 9 · Idea Framing & Narrative Hierarchy',
    description: 'Sequence ideas and stories so the big picture is always clear.',
    gradient: ['#ff9a9e', '#fecfef'],
    cards: IDEA_FRAMING_CARDS,
  },
  {
    id: 'openingMastery',
    title: 'Module 10 · Opening Mastery (hooks, cold opens, cliffhangers)',
    description: 'Design magnetic openings that hook attention immediately.',
    gradient: ['#a1c4fd', '#c2e9fb'],
    cards: OPENING_MASTERY_CARDS,
  },
  {
    id: 'closingMastery',
    title: 'Module 11 · Closing Mastery (loops, anchors, call to action)',
    description: 'Land conclusions that inspire action and stay memorable.',
    gradient: ['#43e97b', '#38f9d7'],
    cards: CLOSING_MASTERY_CARDS,
  },
  {
    id: 'identityProjection',
    title: 'Module 12 · Identity Projection & Character Profile Building',
    description: 'Project the persona you want through movement, presence, and poise.',
    gradient: ['#667eea', '#764ba2'],
    cards: IDENTITY_PROJECTION_CARDS,
  },
];

const getModuleById = (id) => MODULES.find((module) => module.id === id) || null;

export default function App() {
  const [progress, setProgress] = useState({ completedCards: {} });
  const [currentModuleId, setCurrentModuleId] = useState(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isCardRevealed, setIsCardRevealed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const hasHydrated = useRef(false);

  useEffect(() => {
    const loadProgress = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.completedCards) {
            setProgress({
              completedCards: parsed.completedCards,
            });
          }
        }
      } catch (error) {
        console.warn('Failed to load progress', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProgress();
  }, []);

  useEffect(() => {
    if (isLoading) {
      return;
    }
    if (!hasHydrated.current) {
      hasHydrated.current = true;
      return;
    }

    const persist = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
      } catch (error) {
        console.warn('Failed to save progress', error);
      }
    };

    persist();
  }, [progress, isLoading]);

  const getModuleProgress = useCallback(
    (moduleId) => {
      const module = getModuleById(moduleId);
      if (!module) {
        return { completedCount: 0, total: 0, complete: false };
      }

      const completedCount = progress.completedCards[moduleId]?.length || 0;
      const total = module.cards.length;
      return {
        completedCount,
        total,
        complete: total > 0 && completedCount >= total,
      };
    },
    [progress],
  );

  const isModuleUnlocked = useCallback(
    (moduleId) => {
      const moduleIndex = MODULES.findIndex((module) => module.id === moduleId);
      if (moduleIndex <= 0) {
        return true;
      }
      const previousModule = MODULES[moduleIndex - 1];
      return getModuleProgress(previousModule.id).complete;
    },
    [getModuleProgress],
  );

  const getNextUncompletedCardIndex = useCallback(
    (moduleId) => {
      const module = getModuleById(moduleId);
      if (!module) {
        return 0;
      }
      const completedSet = new Set(progress.completedCards[moduleId] || []);
      for (let index = 0; index < module.cards.length; index += 1) {
        if (!completedSet.has(index)) {
          return index;
        }
      }
      return Math.max(module.cards.length - 1, 0);
    },
    [progress],
  );

  const handleOpenModule = useCallback(
    (moduleId) => {
      if (!isModuleUnlocked(moduleId)) {
        return;
      }
      const nextIndex = getNextUncompletedCardIndex(moduleId);
      setCurrentModuleId(moduleId);
      setCurrentCardIndex(nextIndex);
      setIsCardRevealed(false);
    },
    [getNextUncompletedCardIndex, isModuleUnlocked],
  );

  const handleBackHome = useCallback(() => {
    setCurrentModuleId(null);
    setCurrentCardIndex(0);
    setIsCardRevealed(false);
  }, []);

  const currentModule = useMemo(() => getModuleById(currentModuleId), [currentModuleId]);

  const overallProgress = useMemo(() => {
    return MODULES.reduce(
      (acc, module) => {
        const completed = progress.completedCards[module.id]?.length || 0;
        return {
          completed: acc.completed + completed,
          total: acc.total + module.cards.length,
        };
      },
      { completed: 0, total: 0 },
    );
  }, [progress]);

  const overallPercent = overallProgress.total
    ? Math.round((overallProgress.completed / overallProgress.total) * 100)
    : 0;

  const completedIndexes = useMemo(() => {
    if (!currentModule) {
      return new Set();
    }
    return new Set(progress.completedCards[currentModule.id] || []);
  }, [currentModule, progress]);

  const handleToggleReveal = useCallback(() => {
    setIsCardRevealed((prev) => !prev);
  }, []);

  const handleNextCard = useCallback(() => {
    if (!currentModule) {
      return;
    }
    setCurrentCardIndex((prev) => Math.min(prev + 1, currentModule.cards.length - 1));
    setIsCardRevealed(false);
  }, [currentModule]);

  const handlePrevCard = useCallback(() => {
    if (!currentModule) {
      return;
    }
    setCurrentCardIndex((prev) => Math.max(prev - 1, 0));
    setIsCardRevealed(false);
  }, [currentModule]);

  const handleCardComplete = useCallback(() => {
    if (!currentModule) {
      return;
    }
    const moduleId = currentModule.id;
    const cardIndex = currentCardIndex;
    let updatedSet = null;

    setProgress((prev) => {
      const existing = new Set(prev.completedCards[moduleId] || []);
      if (existing.has(cardIndex)) {
        updatedSet = existing;
        return prev;
      }
      existing.add(cardIndex);
      updatedSet = existing;
      const updatedArray = Array.from(existing).sort((a, b) => a - b);
      return {
        completedCards: {
          ...prev.completedCards,
          [moduleId]: updatedArray,
        },
      };
    });

    if (!updatedSet) {
      updatedSet = new Set(progress.completedCards[moduleId] || []);
    }

    const moduleLength = currentModule.cards.length;
    if (updatedSet.size >= moduleLength) {
      setIsCardRevealed(true);
      return;
    }

    const nextIncomplete = currentModule.cards.findIndex((_, index) => !updatedSet.has(index));
    if (nextIncomplete !== -1) {
      setCurrentCardIndex(nextIncomplete);
      setIsCardRevealed(false);
      return;
    }

    if (cardIndex < moduleLength - 1) {
      setCurrentCardIndex(cardIndex + 1);
      setIsCardRevealed(false);
    }
  }, [currentModule, currentCardIndex, progress]);

  const handleResetModule = useCallback(() => {
    if (!currentModule) {
      return;
    }
    const moduleId = currentModule.id;
    Alert.alert(
      'Reset Module',
      `Reset progress for ${currentModule.title}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            setProgress((prev) => ({
              completedCards: {
                ...prev.completedCards,
                [moduleId]: [],
              },
            }));
            setCurrentCardIndex(0);
            setIsCardRevealed(false);
          },
        },
      ],
    );
  }, [currentModule]);

  const renderRevealedContent = (card) => {
    if (!card) {
      return null;
    }
    const { content } = card;
    if (typeof content === 'string') {
      return <Text style={styles.cardContent}>{content}</Text>;
    }
    if (content && typeof content === 'object') {
      const sections = [
        { key: 'explanation', label: 'Explanation' },
        { key: 'example', label: 'Example' },
        { key: 'practice', label: 'Practice' },
      ];
      return (
        <View style={styles.cardDetails}>
          {sections
            .filter(({ key }) => Boolean(content[key]))
            .map(({ key, label }) => (
              <View key={key} style={styles.cardSection}>
                <Text style={styles.cardSectionLabel}>{label}</Text>
                <Text style={styles.cardSectionText}>{content[key]}</Text>
              </View>
            ))}
        </View>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.centered]}>
        <StatusBar style="light" />
        <ActivityIndicator size="large" color="#4facfe" />
        <Text style={styles.loadingText}>Loading your academy progress...</Text>
      </SafeAreaView>
    );
  }

  const renderHomeScreen = () => (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.heading}>Public Speaking Academy</Text>
          <Text style={styles.subheading}>Master every skill, one card at a time.</Text>
          <View style={styles.overallProgress}>
            <Text style={styles.overallProgressText}>
              Overall progress: {overallProgress.completed} / {overallProgress.total} cards ({overallPercent}%)
            </Text>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width:
                      overallPercent === 0
                        ? '0%'
                        : `${Math.min(Math.max(overallPercent, 6), 100)}%`,
                  },
                ]}
              />
            </View>
          </View>
        </View>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.moduleListContent}
        >
          {MODULES.map((module, index) => {
            const moduleProgress = getModuleProgress(module.id);
            const modulePercent = moduleProgress.total
              ? Math.round((moduleProgress.completedCount / moduleProgress.total) * 100)
              : 0;
            const unlocked = isModuleUnlocked(module.id);
            const previousTitle = MODULES[index - 1]?.title;

            return (
              <TouchableOpacity
                key={module.id}
                activeOpacity={0.9}
                disabled={!unlocked}
                onPress={() => handleOpenModule(module.id)}
                style={styles.moduleCardWrapper}
              >
                <LinearGradient
                  colors={module.gradient}
                  style={[styles.moduleCard, !unlocked && styles.moduleCardDisabled]}
                >
                  <View>
                    <Text style={styles.moduleTitle}>{module.title}</Text>
                    <Text style={styles.moduleDescription}>{module.description}</Text>
                  </View>
                  <View>
                    <Text style={styles.moduleProgressText}>
                      {moduleProgress.completedCount} / {moduleProgress.total} cards complete
                    </Text>
                    <View style={styles.progressTrackLight}>
                      <View
                        style={[
                          styles.progressFillLight,
                          {
                            width:
                              modulePercent === 0
                                ? '0%'
                                : `${Math.min(Math.max(modulePercent, 8), 100)}%`,
                          },
                        ]}
                      />
                    </View>
                  </View>
                  {!unlocked && (
                    <View style={styles.lockOverlay}>
                      <Text style={styles.lockText}>Locked</Text>
                      {previousTitle ? (
                        <Text style={styles.lockSubtext}>Complete {previousTitle} to unlock.</Text>
                      ) : null}
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </SafeAreaView>
  );

  const renderModuleScreen = () => {
    if (!currentModule) {
      return null;
    }

    const moduleProgress = getModuleProgress(currentModule.id);
    const modulePercent = moduleProgress.total
      ? Math.round((moduleProgress.completedCount / moduleProgress.total) * 100)
      : 0;
    const moduleIndex = MODULES.findIndex((module) => module.id === currentModule.id);
    const nextModule = MODULES[moduleIndex + 1];
    const currentCard = currentModule.cards[currentCardIndex];
    const hasCompletedCards = moduleProgress.completedCount > 0;

    return (
      <LinearGradient colors={currentModule.gradient} style={styles.moduleScreen}>
        <SafeAreaView style={styles.safeAreaTransparent}>
          <StatusBar style="light" />
          <View style={styles.moduleScreenContent}>
            <View style={styles.moduleHeader}>
              <TouchableOpacity onPress={handleBackHome} style={styles.backButton}>
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
              <View style={styles.moduleHeaderText}>
                <Text style={styles.moduleHeading}>{currentModule.title}</Text>
                <Text style={styles.moduleSubheading}>{currentModule.description}</Text>
              </View>
            </View>

            <View style={styles.moduleProgressCard}>
              <Text style={styles.moduleProgressStrong}>
                {moduleProgress.completedCount} / {moduleProgress.total} cards complete
              </Text>
              <View style={styles.progressTrackDark}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width:
                        modulePercent === 0
                          ? '0%'
                          : `${Math.min(Math.max(modulePercent, 8), 100)}%`,
                    },
                  ]}
                />
              </View>
              <TouchableOpacity
                onPress={handleResetModule}
                disabled={!hasCompletedCards}
                style={[
                  styles.resetButton,
                  !hasCompletedCards && styles.resetButtonDisabled,
                ]}
              >
                <Text
                  style={[
                    styles.resetButtonText,
                    !hasCompletedCards && styles.resetButtonTextDisabled,
                  ]}
                >
                  Reset module progress
                </Text>
              </TouchableOpacity>
            </View>

            {moduleProgress.complete && (
              <View style={styles.successBanner}>
                <Text style={styles.successTitle}>Module complete!</Text>
                <Text style={styles.successBody}>
                  {nextModule
                    ? `${nextModule.title} is now unlocked. Keep the momentum going!`
                    : 'You have completed every module. Outstanding work!'}
                </Text>
              </View>
            )}

            <View style={styles.cardProgressDots}>
              {currentModule.cards.map((card, index) => {
                const isCompleted = completedIndexes.has(index);
                const isActive = index === currentCardIndex;
                return (
                  <View
                    key={card.id}
                    style={[
                      styles.progressDot,
                      isCompleted && styles.progressDotCompleted,
                      isActive && styles.progressDotActive,
                    ]}
                  />
                );
              })}
            </View>

            <View style={styles.cardContainer}>
              <Text style={styles.cardCounter}>
                Card {currentCardIndex + 1} of {currentModule.cards.length}
              </Text>
              <View style={[styles.card, isCardRevealed && styles.cardRevealed]}>
                <Text style={styles.cardTitle}>{currentCard.title}</Text>
                {isCardRevealed ? (
                  renderRevealedContent(currentCard)
                ) : (
                  <Text style={[styles.cardContent, styles.cardHint]}>
                    Tap reveal to uncover the guidance for this step.
                  </Text>
                )}
              </View>

              <View style={styles.cardActions}>
                <TouchableOpacity onPress={handleToggleReveal} style={styles.primaryButton}>
                  <Text style={styles.primaryButtonText}>
                    {isCardRevealed ? 'Hide content' : 'Reveal content'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleCardComplete}
                  disabled={completedIndexes.has(currentCardIndex)}
                  style={[
                    styles.secondaryButton,
                    completedIndexes.has(currentCardIndex) && styles.secondaryButtonDisabled,
                  ]}
                >
                  <Text style={styles.secondaryButtonText}>
                    {completedIndexes.has(currentCardIndex) ? 'Completed' : 'Mark complete'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.navigationRow}>
                <TouchableOpacity
                  onPress={handlePrevCard}
                  disabled={currentCardIndex === 0}
                  style={[
                    styles.navButton,
                    styles.navButtonLeft,
                    currentCardIndex === 0 && styles.navButtonDisabled,
                  ]}
                >
                  <Text style={styles.navButtonText}>Previous</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleNextCard}
                  disabled={currentCardIndex === currentModule.cards.length - 1}
                  style={[
                    styles.navButton,
                    styles.navButtonRight,
                    currentCardIndex === currentModule.cards.length - 1 && styles.navButtonDisabled,
                  ]}
                >
                  <Text style={styles.navButtonText}>Next</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  };

  return currentModule ? renderModuleScreen() : renderHomeScreen();
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#050819',
  },
  safeAreaTransparent: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#050819',
  },
  loadingText: {
    marginTop: 16,
    color: '#d7dcff',
    fontSize: 16,
  },
  header: {
    marginBottom: 24,
  },
  heading: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 6,
  },
  subheading: {
    color: '#c0c5ff',
    fontSize: 16,
  },
  overallProgress: {
    marginTop: 18,
  },
  overallProgressText: {
    color: '#f5f6ff',
    fontSize: 14,
    marginBottom: 10,
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    overflow: 'hidden',
  },
  progressTrackLight: {
    marginTop: 10,
    height: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.28)',
    overflow: 'hidden',
  },
  progressTrackDark: {
    marginTop: 14,
    height: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(12, 15, 36, 0.55)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#ffffff',
  },
  progressFillLight: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
  },
  moduleListContent: {
    paddingBottom: 120,
  },
  moduleCardWrapper: {
    marginBottom: 18,
  },
  moduleCard: {
    borderRadius: 22,
    padding: 22,
    minHeight: 150,
    justifyContent: 'space-between',
  },
  moduleCardDisabled: {
    opacity: 0.55,
  },
  moduleTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  moduleDescription: {
    color: '#f6f7ff',
    fontSize: 14,
    marginBottom: 12,
  },
  moduleProgressText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 22,
    backgroundColor: 'rgba(6, 10, 28, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  lockSubtext: {
    color: '#d9ddff',
    fontSize: 13,
  },
  moduleScreen: {
    flex: 1,
  },
  moduleScreenContent: {
    flex: 1,
    padding: 20,
  },
  moduleHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  backButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 14,
    backgroundColor: 'rgba(7, 11, 27, 0.45)',
    marginRight: 16,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  moduleHeaderText: {
    flex: 1,
  },
  moduleHeading: {
    color: '#ffffff',
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 6,
  },
  moduleSubheading: {
    color: '#f0f4ff',
    fontSize: 15,
  },
  moduleProgressCard: {
    backgroundColor: 'rgba(8, 12, 28, 0.55)',
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginBottom: 16,
  },
  moduleProgressStrong: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  resetButton: {
    marginTop: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    alignItems: 'center',
    backgroundColor: 'rgba(6, 10, 26, 0.35)',
  },
  resetButtonDisabled: {
    opacity: 0.4,
  },
  resetButtonText: {
    color: '#f5f7ff',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  resetButtonTextDisabled: {
    color: 'rgba(245, 247, 255, 0.7)',
  },
  successBanner: {
    backgroundColor: 'rgba(6, 10, 26, 0.55)',
    borderRadius: 18,
    padding: 16,
    marginBottom: 18,
  },
  successTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  successBody: {
    color: '#e4e7ff',
    fontSize: 14,
  },
  cardProgressDots: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 18,
  },
  progressDot: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    marginHorizontal: 4,
    marginVertical: 4,
  },
  progressDotCompleted: {
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
  },
  progressDotActive: {
    backgroundColor: '#ffffff',
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  cardContainer: {
    backgroundColor: 'rgba(6, 10, 26, 0.6)',
    borderRadius: 22,
    padding: 20,
    flex: 1,
  },
  cardCounter: {
    color: '#dfe3ff',
    fontSize: 14,
    marginBottom: 12,
  },
  card: {
    backgroundColor: 'rgba(8, 16, 38, 0.85)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 18,
    minHeight: 180,
    justifyContent: 'center',
  },
  cardRevealed: {
    backgroundColor: 'rgba(10, 22, 52, 0.92)',
  },
  cardTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  cardContent: {
    color: '#f4f6ff',
    fontSize: 16,
    lineHeight: 24,
  },
  cardHint: {
    color: 'rgba(244, 246, 255, 0.6)',
    fontStyle: 'italic',
  },
  cardActions: {
    flexDirection: 'row',
    marginBottom: 18,
  },
  primaryButton: {
    flex: 1,
    marginRight: 10,
    backgroundColor: '#ffffff',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#121532',
    fontWeight: '700',
    fontSize: 14,
  },
  secondaryButton: {
    flex: 1,
    marginLeft: 10,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.7)',
  },
  secondaryButtonDisabled: {
    opacity: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  secondaryButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  navigationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  navButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.65)',
  },
  navButtonLeft: {
    marginRight: 8,
  },
  navButtonRight: {
    marginLeft: 8,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  cardDetails: {
    marginTop: 8,
  },
  cardSection: {
    marginBottom: 14,
  },
  cardSectionLabel: {
    color: '#95a0d6',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  cardSectionText: {
    color: '#f4f6ff',
    fontSize: 16,
    lineHeight: 24,
  },
  resetButton: {
    marginTop: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.7)',
  },
  resetButtonDisabled: {
    opacity: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  resetButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  resetButtonTextDisabled: {
    color: 'rgba(255, 255, 255, 0.5)',
  },
});
