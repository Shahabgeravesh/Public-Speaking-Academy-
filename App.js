import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Get initial screen dimensions
const getScreenDimensions = () => {
  const { width, height } = Dimensions.get('window');
  return { width, height };
};

// Calculate optimal card width based on screen size
const getCardWidth = (screenWidth) => {
  // For iPad, limit card width to 600px for better readability
  // For iPhone, use full width minus padding
  const isTablet = screenWidth >= 768;
  const maxCardWidth = 600;
  const padding = 40;
  
  if (isTablet) {
    return Math.min(screenWidth - padding, maxCardWidth);
  }
  return screenWidth - padding;
};

const STORAGE_KEY = 'PSA_PROGRESS_V2';
const JOURNAL_STORAGE_KEY = 'PSA_JOURNAL_V1';

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

const STORYTELLING_CARDS = [
  {
    id: 'storytelling-1',
    title: 'Start with the Punchline',
    content: {
      explanation: 'Weak speakers warm up too long. Strong speakers start with the key moment then explain after.',
      example: '"Something funny happened today." Then tell it.',
      practice: 'Tell a story today starting with the punchline first.',
    },
  },
  {
    id: 'storytelling-2',
    title: 'One Character at a Time',
    content: {
      explanation: 'Do not introduce five people at once. It overloads the listener.',
      example: '"My friend Alex said something." Then bring the second character after.',
      practice: 'Tell a 20 second story with only one character first.',
    },
  },
  {
    id: 'storytelling-3',
    title: 'One Sentence Equals One Event',
    content: {
      explanation: 'Do not stack three events in one long line.',
      example: '"I woke up. I ate. I drove."',
      practice: 'Tell 3 events in 3 short sentences.',
    },
  },
  {
    id: 'storytelling-4',
    title: 'Set the Stakes',
    content: {
      explanation: 'Why should the listener care? State the importance quickly.',
      example: '"This matters because it wasted my whole day."',
      practice: 'Tell a story and state the stakes in the first 4 seconds.',
    },
  },
  {
    id: 'storytelling-5',
    title: 'Keep Time Clean',
    content: {
      explanation: 'Avoid messy timeline jumps.',
      example: '"First breakfast. Then store. Then home."',
      practice: 'Tell a timeline story in order.',
    },
  },
  {
    id: 'storytelling-6',
    title: 'Describe One Visual Detail',
    content: {
      explanation: 'One good detail is stronger than ten vague ones.',
      example: '"Red cup" is stronger than "cup."',
      practice: 'Tell one story with one strong visual detail.',
    },
  },
  {
    id: 'storytelling-7',
    title: 'Cut the Backstory',
    content: {
      explanation: 'Story is not biography. Delete non-critical information.',
      example: 'Skip childhood background. Go straight to the event.',
      practice: 'Tell a story without life background.',
    },
  },
  {
    id: 'storytelling-8',
    title: 'One Emotion Label',
    content: {
      explanation: 'Naming the emotion clarifies the point.',
      example: '"I was annoyed."',
      practice: 'Tell a story and name one emotion in one word.',
    },
  },
  {
    id: 'storytelling-9',
    title: 'Tension to Release',
    content: {
      explanation: 'Story requires contrast. First show the problem, then the relief or resolution.',
      example: '"Line was long. Then I got my coffee."',
      practice: 'Tell one story with a problem plus resolution.',
    },
  },
  {
    id: 'storytelling-10',
    title: 'Speak It Like Scenes',
    content: {
      explanation: 'Story equals scene one, scene two, scene three.',
      example: '"Kitchen. Car. Store."',
      practice: 'Tell a story in 3 scenes labeled "scene one, scene two, scene three."',
    },
  },
  {
    id: 'storytelling-11',
    title: 'Use Short Lines for Impact',
    content: {
      explanation: 'Short lines make tension sharp.',
      example: '"Then he said something. I froze."',
      practice: 'Tell a 20 second story with 2 short impact lines.',
    },
  },
  {
    id: 'storytelling-12',
    title: "Don't Explain the Moral",
    content: {
      explanation: 'You do not need to say "the lesson is..." The listener gets it.',
      example: 'Just end on the final moment.',
      practice: 'Tell a story and do not explain the lesson.',
    },
  },
  {
    id: 'storytelling-13',
    title: 'Use Contrast Words',
    content: {
      explanation: 'Contrast creates clarity.',
      example: '"First I thought X. Now I know Y."',
      practice: 'Tell one story with a before/after contrast.',
    },
  },
  {
    id: 'storytelling-14',
    title: 'End at the Moment',
    content: {
      explanation: 'Do not drag after the last beat.',
      example: '"And that was that." Stop.',
      practice: 'Tell a story and stop immediately after the final event.',
    },
  },
  {
    id: 'storytelling-15',
    title: 'Practice One-Minute Stories',
    content: {
      explanation: 'One minute is the perfect length for normal life storytelling.',
      example: 'One minute about "what happened at the store."',
      practice: 'Record 60 seconds telling one simple event today.',
    },
  },
];

const CLARITY_STRUCTURE_CARDS = [
  {
    id: 'clarityStructure-1',
    title: 'Say the Point First',
    content: {
      explanation: 'People focus fast. Give them the conclusion first, then details after.',
      example: '"The short version: I need a day off."',
      practice: 'Say your main point first in 2 sentences today.',
    },
  },
  {
    id: 'clarityStructure-2',
    title: 'One Sentence Equals One Idea',
    content: {
      explanation: 'If you put three ideas in one sentence, the listener will miss all three.',
      example: '"I finished work. I ate. I slept."',
      practice: 'Talk for 20 seconds using one idea per sentence only.',
    },
  },
  {
    id: 'clarityStructure-3',
    title: 'End Every Sentence Clean',
    content: {
      explanation: 'Do not fade out. Do not drag. Land the final word clearly.',
      example: 'Deliver: "That is what happened." (land the last word)',
      practice: 'Speak for 20 seconds and land every ending.',
    },
  },
  {
    id: 'clarityStructure-4',
    title: 'Remove Dead Intro Phrases',
    content: {
      explanation: 'Delete phrases like "to be honest," "honestly," "you know," and "basically."',
      example: 'Change "basically I was tired" to "I was tired."',
      practice: 'Tell 2 stories today without intro fluff.',
    },
  },
  {
    id: 'clarityStructure-5',
    title: 'Use Short Sentences to Compress Thought',
    content: {
      explanation: 'Short sentences create tight logic.',
      example: '"I am hungry. Let us eat."',
      practice: 'Take one long story and retell it in 4 short sentences.',
    },
  },
  {
    id: 'clarityStructure-6',
    title: 'Use Strong Nouns',
    content: {
      explanation: 'Specific nouns create images. Vague nouns create fog.',
      example: 'Change "fruit" to "oranges." Change "vehicle" to "Honda Civic."',
      practice: 'Say 3 sentences with specific nouns today.',
    },
  },
  {
    id: 'clarityStructure-7',
    title: 'Use Strong Verbs',
    content: {
      explanation: 'Strong verbs carry action and clarity.',
      example: 'Weak: "I might start." Strong: "I will start."',
      practice: 'Rewrite one weak sentence into a strong one.',
    },
  },
  {
    id: 'clarityStructure-8',
    title: 'Put the Most Important Word Near the End',
    content: {
      explanation: 'Endings have the highest memory weight.',
      example: '"The main problem is speed."',
      practice: 'Say one sentence about your day and put the most key word last.',
    },
  },
  {
    id: 'clarityStructure-9',
    title: 'Delete Background Story That Does Not Matter',
    content: {
      explanation: 'Context is addictive, but most of it is useless.',
      example: 'Not: "I woke up at 7, then I..." Just: "I want to talk about something funny."',
      practice: 'Tell one story today starting only with the highlight.',
    },
  },
  {
    id: 'clarityStructure-10',
    title: 'Edit While Speaking',
    content: {
      explanation: 'If you feel a sentence drifting, stop and finish early.',
      example: '"Anyway, that is it."',
      practice: 'Talk for 20 seconds and cut one sentence halfway.',
    },
  },
  {
    id: 'clarityStructure-11',
    title: 'Speak in Chapters',
    content: {
      explanation: 'Break your message into mini-chunks like "chapter one, chapter two."',
      example: '"First: the problem. Second: the plan."',
      practice: 'Explain a topic today in 2 chapters.',
    },
  },
  {
    id: 'clarityStructure-12',
    title: 'Anchor Words',
    content: {
      explanation: 'A short anchor phrase you repeat gives structure.',
      example: 'Anchor: "the truth is:"',
      practice: 'Choose one anchor phrase today and use it twice.',
    },
  },
  {
    id: 'clarityStructure-13',
    title: 'Tight Transitions',
    content: {
      explanation: 'Transitions keep clarity stable: "next," "the result," "the reason."',
      example: '"Next: I need to tell you the result."',
      practice: 'Speak for 20 seconds and use 2 transition phrases.',
    },
  },
  {
    id: 'clarityStructure-14',
    title: "Do Not Argue Inside the Sentence",
    content: {
      explanation: 'Do not negotiate while speaking. State your point, then explain.',
      example: '"We should leave. We can discuss details."',
      practice: 'Give 2 direct statements today, then explain after.',
    },
  },
  {
    id: 'clarityStructure-15',
    title: 'Stop Re-Building the Sentence Mid-Way',
    content: {
      explanation: 'If you restart, you create noise. Finish the line even if imperfect.',
      example: '"I was annoyed. That is enough detail."',
      practice: 'Talk for 20 seconds with no restarting. Finish every sentence as-is.',
    },
  },
];

const EMOTIONAL_TONE_CARDS = [
  {
    id: 'emotionalTone-1',
    title: 'Name the Emotion First',
    content: {
      explanation: 'Emotion gets messy when you hide it. Name it cleanly and briefly.',
      example: '"I am annoyed." Then talk.',
      practice: 'Today say one feeling in one word before you explain it.',
    },
  },
  {
    id: 'emotionalTone-2',
    title: "Don't Dramatize",
    content: {
      explanation: 'Emotional power equals calm plus clear. Drama equals childish.',
      example: 'Not: "I was SO mad." Say: "I was angry."',
      practice: 'Say 3 emotional sentences today without exaggeration.',
    },
  },
  {
    id: 'emotionalTone-3',
    title: 'Tone Drop Equals Seriousness',
    content: {
      explanation: 'Lower tone signals a heavier message.',
      example: 'Drop tone slightly for "this is important."',
      practice: 'Say one strong line with a tone drop at the end.',
    },
  },
  {
    id: 'emotionalTone-4',
    title: 'Slow Equals Emotionally Mature',
    content: {
      explanation: 'Fast emotion sounds reactive. Slow emotion sounds stable.',
      example: '"I did not like that." Slow and steady.',
      practice: 'Say 2 emotional statements slowly.',
    },
  },
  {
    id: 'emotionalTone-5',
    title: 'Speak After Breath',
    content: {
      explanation: 'Emotion disrupts breath. Fix breath first.',
      example: 'Inhale through your nose. Then speak.',
      practice: 'Say one sentence about something upsetting after inhaling.',
    },
  },
  {
    id: 'emotionalTone-6',
    title: "Don't Argue Inside the Line",
    content: {
      explanation: 'Finish the sentence. Do not negotiate while speaking.',
      example: '"I did not like that." Period.',
      practice: 'Say one emotional sentence today without rephrasing it.',
    },
  },
  {
    id: 'emotionalTone-7',
    title: 'One Example Only',
    content: {
      explanation: 'Emotional clarity comes from one example, not ten.',
      example: '"I got ignored." Not "there were many times..."',
      practice: 'Describe one emotional event today with one example.',
    },
  },
  {
    id: 'emotionalTone-8',
    title: 'Pause Before Punchline',
    content: {
      explanation: 'Silence makes emotion hit harder.',
      example: '"You know what bothered me?" [pause] "He walked away."',
      practice: 'Use a 1 second pause before the emotional point.',
    },
  },
  {
    id: 'emotionalTone-9',
    title: 'No Emotional Filler Words',
    content: {
      explanation: 'Words like "kinda" and "sorta" weaken emotion.',
      example: '"I felt disrespected."',
      practice: 'Express one emotion today without fillers.',
    },
  },
  {
    id: 'emotionalTone-10',
    title: 'Short Emotional Sentences',
    content: {
      explanation: 'Keep emotion lines short so they land.',
      example: '"That hurt."',
      practice: 'Express one feeling in 4 words or less.',
    },
  },
  {
    id: 'emotionalTone-11',
    title: 'Speak from Chest',
    content: {
      explanation: 'Emotions in chest voice register sound grounded.',
      example: 'Say "I care about this." in chest voice.',
      practice: 'Talk for 15 seconds in chest voice about something that mattered today.',
    },
  },
  {
    id: 'emotionalTone-12',
    title: 'Avoid Question-Tone Endings',
    content: {
      explanation: 'Do not rise pitch at the end. It makes emotion look doubtful.',
      example: '"This upset me." (downward tone)',
      practice: 'Say 2 emotional lines with downward endings.',
    },
  },
  {
    id: 'emotionalTone-13',
    title: 'Describe Physical Signal, Not Drama',
    content: {
      explanation: 'Physical description sounds believable.',
      example: '"My heart sped up."',
      practice: 'Describe a body reaction instead of complaining.',
    },
  },
  {
    id: 'emotionalTone-14',
    title: 'Highlight Contrast',
    content: {
      explanation: 'Emotion is contrast between expectation and reality.',
      example: '"I expected X. I got Y."',
      practice: 'State one expectation versus one reality today.',
    },
  },
  {
    id: 'emotionalTone-15',
    title: 'End Emotional Message Clean',
    content: {
      explanation: 'Do not drag after the point. End sharp.',
      example: '"That is how I felt." Stop.',
      practice: 'Say one emotional sentence then stop.',
    },
  },
];

const PERSUASION_CARDS = [
  {
    id: 'persuasion-1',
    title: 'State Your Position First',
    content: {
      explanation: 'Persuasion fails when you "lead up to it." Say your position upfront.',
      example: '"I want to leave at 7."',
      practice: 'Say one request today in the first sentence.',
    },
  },
  {
    id: 'persuasion-2',
    title: "Don't Defend Before They Attack",
    content: {
      explanation: 'Insecure people pre-defend their position.',
      example: 'Weak: "I do not want you to think I am selfish but..." Strong: "I need space tonight."',
      practice: 'State a preference with zero defense clause.',
    },
  },
  {
    id: 'persuasion-3',
    title: 'Single Reason Beats Five Reasons',
    content: {
      explanation: 'Many reasons look weak. One strong reason looks solid.',
      example: '"Let us take my car. It is closer."',
      practice: 'Convince someone today with one clear reason only.',
    },
  },
  {
    id: 'persuasion-4',
    title: 'Call Out the Objection Yourself',
    content: {
      explanation: 'Say the objection before they say it.',
      example: '"You might think I am overreacting. I am not."',
      practice: 'Name one expected objection in your next request.',
    },
  },
  {
    id: 'persuasion-5',
    title: 'Never Ask "Does That Make Sense?"',
    content: {
      explanation: 'That question signals low authority.',
      example: 'Replace with: "Here is the logic."',
      practice: 'Talk for 20 seconds. Never ask for clarity approval.',
    },
  },
  {
    id: 'persuasion-6',
    title: 'Talk Slower on the Key Line',
    content: {
      explanation: 'Emphasis is created by pacing shift, not yelling.',
      example: '"This part matters."',
      practice: 'Slow down one sentence about your point.',
    },
  },
  {
    id: 'persuasion-7',
    title: 'Remove Softeners',
    content: {
      explanation: 'Softeners include "kind of," "maybe," and "possibly."',
      example: '"We should go now."',
      practice: 'State one desired outcome with no softeners.',
    },
  },
  {
    id: 'persuasion-8',
    title: 'Define the Frame',
    content: {
      explanation: 'The person who decides the frame controls the conversation.',
      example: '"The real question is timing."',
      practice: 'Label the frame once today.',
    },
  },
  {
    id: 'persuasion-9',
    title: 'Turn Questions into Statements',
    content: {
      explanation: '"Should we go?" sounds weak. "We should go." shows leadership.',
      example: 'Turn "should we go?" into "we should go."',
      practice: 'Convert one question today into a statement.',
    },
  },
  {
    id: 'persuasion-10',
    title: 'Isolate the Disagreement',
    content: {
      explanation: 'Find one exact disagreement. Not everything.',
      example: '"We agree on leaving. We disagree on when."',
      practice: 'Identify exactly one disagreement.',
    },
  },
  {
    id: 'persuasion-11',
    title: 'Remove Emotion Language When Persuading',
    content: {
      explanation: 'Persuasion equals clarity, not emotional leakage.',
      example: '"This is more efficient" not "this feels better."',
      practice: 'Argue one point with zero emotion words.',
    },
  },
  {
    id: 'persuasion-12',
    title: 'Show Practical Benefit, Not Moral Superiority',
    content: {
      explanation: 'People change when it helps them, not when they are shamed.',
      example: '"We save 10 minutes" not "you should care more."',
      practice: 'Show one benefit today in numbers or time.',
    },
  },
  {
    id: 'persuasion-13',
    title: "Don't Repeat Your Argument",
    content: {
      explanation: 'Repeating signals low status.',
      example: '"I already said my point."',
      practice: 'State your point once. If they do not accept, do not restate.',
    },
  },
  {
    id: 'persuasion-14',
    title: 'Call the Decision',
    content: {
      explanation: 'Persuasion ends with a decision request.',
      example: '"So... yes or no?"',
      practice: 'Ask one clear decision question today.',
    },
  },
  {
    id: 'persuasion-15',
    title: 'Stop After the Punchline',
    content: {
      explanation: 'Over-explaining kills influence.',
      example: '"That is why this is the better option." Stop talking.',
      practice: 'State your final line then hold 2 seconds of silence.',
    },
  },
];

const IDEA_FRAMING_CARDS = [
  {
    id: 'ideaFraming-1',
    title: 'Start with the Headline',
    content: {
      explanation: 'Headline first tells the listener what container this belongs to.',
      example: '"Main point: I need more quiet at night."',
      practice: 'Deliver one headline before you explain anything.',
    },
  },
  {
    id: 'ideaFraming-2',
    title: 'One Purpose Per Conversation',
    content: {
      explanation: 'If you mix missions, you dilute leverage.',
      example: 'Not: ask a favor plus complain plus update. Choose one purpose.',
      practice: 'Pick one purpose before you speak.',
    },
  },
  {
    id: 'ideaFraming-3',
    title: 'Label the Topic Explicitly',
    content: {
      explanation: 'Humans need topic labels to file information.',
      example: '"Topic: tomorrow schedule."',
      practice: 'Label one topic out loud before describing it.',
    },
  },
  {
    id: 'ideaFraming-4',
    title: 'State Outcome Before Details',
    content: {
      explanation: 'Outcome clarifies direction. Details only matter after.',
      example: '"Goal: we leave at 7."',
      practice: 'State the desired outcome first today.',
    },
  },
  {
    id: 'ideaFraming-5',
    title: 'Create a Mental Folder',
    content: {
      explanation: 'Folders reduce mental load.',
      example: '"This is about food, not work."',
      practice: 'Use one folder label in your next talk.',
    },
  },
  {
    id: 'ideaFraming-6',
    title: 'Reduce Your Thought Scope',
    content: {
      explanation: 'If your mental scope is huge, speech becomes blurry.',
      example: '"I am only talking about dinner location."',
      practice: 'Shrink topic to one subtopic before speaking.',
    },
  },
  {
    id: 'ideaFraming-7',
    title: "Don't Explain What They Already Know",
    content: {
      explanation: 'Repeating known information insults the listener.',
      example: 'Do not define basic context they already know.',
      practice: 'Remove known context once today.',
    },
  },
  {
    id: 'ideaFraming-8',
    title: 'Define the Problem Before Telling Story',
    content: {
      explanation: 'Listeners need the reason the story matters.',
      example: '"The issue is planning. Now story:"',
      practice: 'Say the problem sentence first.',
    },
  },
  {
    id: 'ideaFraming-9',
    title: 'Separate Fact from Interpretation',
    content: {
      explanation: 'Mixing both creates confusion.',
      example: 'Fact: "He arrived late." Interpretation: "He did not care."',
      practice: 'Say one fact sentence then one interpretation sentence.',
    },
  },
  {
    id: 'ideaFraming-10',
    title: 'Isolate Your Key Idea',
    content: {
      explanation: 'People remember one idea, not seven.',
      example: '"The key is consistency."',
      practice: 'Say one idea and call it the idea.',
    },
  },
  {
    id: 'ideaFraming-11',
    title: 'Compress Your Intro',
    content: {
      explanation: 'Intros should be 3 to 7 seconds maximum.',
      example: '"Quick update."',
      practice: 'Make your next intro under 7 seconds.',
    },
  },
  {
    id: 'ideaFraming-12',
    title: "Don't Chase Side Paths",
    content: {
      explanation: 'Tangents kill clarity.',
      example: 'If your brain wants to go sideways, stop it.',
      practice: 'Drop one tangent intentionally today.',
    },
  },
  {
    id: 'ideaFraming-13',
    title: 'Put Numbers on Your Ideas',
    content: {
      explanation: 'Numbers create structure.',
      example: '"I have 2 points."',
      practice: 'Speak one idea list using numbers.',
    },
  },
  {
    id: 'ideaFraming-14',
    title: 'Decide the Destination Sentence Before Speaking',
    content: {
      explanation: 'Knowing your end line locks structure.',
      example: 'Destination: "we should choose restaurant X."',
      practice: 'Think your destination sentence first today.',
    },
  },
  {
    id: 'ideaFraming-15',
    title: 'Stop After the Conclusion',
    content: {
      explanation: 'After your conclusion, use silence. No extra sentence.',
      example: '"So the solution is X." Stop.',
      practice: 'Deliver a conclusion and stop instantly.',
    },
  },
];

const OPENING_MASTERY_CARDS = [
  {
    id: 'openingMastery-1',
    title: 'Start with the End Result',
    content: {
      explanation: 'Instead of warming up, start with the conclusion.',
      example: '"Bottom line: I want to leave early tonight."',
      practice: 'Today open one conversation with the result first.',
    },
  },
  {
    id: 'openingMastery-2',
    title: 'Cold Open',
    content: {
      explanation: 'Jump straight into the moment. No greeting. No "how was your day."',
      example: '"Listen. Something weird happened today."',
      practice: 'Use one cold open today.',
    },
  },
  {
    id: 'openingMastery-3',
    title: 'Question Open',
    content: {
      explanation: 'A short question wakes attention instantly.',
      example: '"Want to know something surprising?"',
      practice: 'Start one conversation today with a question.',
    },
  },
  {
    id: 'openingMastery-4',
    title: 'Contrast Open',
    content: {
      explanation: 'Contrast creates tension, which leads to immediate attention.',
      example: '"I expected a calm day. I got chaos instead."',
      practice: 'Open a story today with contrast.',
    },
  },
  {
    id: 'openingMastery-5',
    title: 'Snapshot-Image Open',
    content: {
      explanation: 'Paint one quick visual moment.',
      example: '"Picture this: full grocery line. Just one cashier."',
      practice: 'Start one story with a tiny picture.',
    },
  },
  {
    id: 'openingMastery-6',
    title: 'One-Word Open',
    content: {
      explanation: 'One word as opener shocks the brain into focus.',
      example: '"Enough." Pause. Then story.',
      practice: 'Open one statement today with one strong word.',
    },
  },
  {
    id: 'openingMastery-7',
    title: 'Confession Open',
    content: {
      explanation: 'Tiny vulnerability leads to attention lock.',
      example: '"I messed up today."',
      practice: 'Open one story with a confession.',
    },
  },
  {
    id: 'openingMastery-8',
    title: 'Rule Break Open',
    content: {
      explanation: 'Break an expectation in the first second.',
      example: '"I know you will not expect this."',
      practice: 'Start one talk today with a pattern break reference.',
    },
  },
  {
    id: 'openingMastery-9',
    title: 'Curiosity Gap Open',
    content: {
      explanation: 'Hint at meaning but do not reveal yet.',
      example: '"I learned something today that changed one thing for me."',
      practice: 'Open a story today with curiosity.',
    },
  },
  {
    id: 'openingMastery-10',
    title: 'Time Stamp Open',
    content: {
      explanation: 'Grounding the moment creates instant realism.',
      example: '"3pm today, this happened."',
      practice: 'Open one story today with a time stamp.',
    },
  },
  {
    id: 'openingMastery-11',
    title: 'Location Stamp Open',
    content: {
      explanation: 'Location anchors imagination faster than adjectives.',
      example: '"At the coffee shop, right at the door, this happened."',
      practice: 'Open one story today with location first.',
    },
  },
  {
    id: 'openingMastery-12',
    title: 'Person Stamp Open',
    content: {
      explanation: 'Leading with a human triggers instant empathy.',
      example: '"My neighbor said something odd today."',
      practice: 'Open one story with a person name first.',
    },
  },
  {
    id: 'openingMastery-13',
    title: 'Silence Then Line',
    content: {
      explanation: 'Pause, then speak one clean sentence.',
      example: '[Pause 1 second] "I did not expect what happened today."',
      practice: 'Use a 1-second silence before your opening sentence once today.',
    },
  },
  {
    id: 'openingMastery-14',
    title: 'Start Small',
    content: {
      explanation: 'Tiny detail leads into big idea.',
      example: '"I dropped my keys. That moment taught me something."',
      practice: 'Open one talk with one tiny detail.',
    },
  },
  {
    id: 'openingMastery-15',
    title: 'Snap Open',
    content: {
      explanation: 'Snap equals short opener plus direct point. Strong impact.',
      example: '"Quick update."',
      practice: 'Start one update today with a snap opener.',
    },
  },
];

const CLOSING_MASTERY_CARDS = [
  {
    id: 'closingMastery-1',
    title: 'Say the Conclusion Clearly',
    content: {
      explanation: 'Do not "fade out." The conclusion must sound like a conclusion.',
      example: '"So the solution is to leave earlier."',
      practice: 'End one conversation today by stating your exact conclusion in one sentence.',
    },
  },
  {
    id: 'closingMastery-2',
    title: 'Callback to the Opening',
    content: {
      explanation: 'A callback "closes the loop."',
      example: 'If you opened with "we need calm," close with "and this is how we get calm."',
      practice: 'Today pick one opener and reference it again at the end.',
    },
  },
  {
    id: 'closingMastery-3',
    title: 'End with a Beat of Silence',
    content: {
      explanation: 'Silence after a conclusion makes the ending heavier.',
      example: '"That is what matters." [pause]',
      practice: 'After your next conclusion, pause for 2 seconds.',
    },
  },
  {
    id: 'closingMastery-4',
    title: "Don't Keep Adding New Ideas at the End",
    content: {
      explanation: 'The ending is not the place to bring new content.',
      example: 'Finalize, then stop talking.',
      practice: 'When you close, say nothing extra after.',
    },
  },
  {
    id: 'closingMastery-5',
    title: 'Put the Key Word Last',
    content: {
      explanation: 'Last words have the highest memory weight.',
      example: '"The hardest part was waking up EARLY."',
      practice: 'End 2 sentences today with the strongest word last.',
    },
  },
  {
    id: 'closingMastery-6',
    title: 'Define the Meaning in 1 Line',
    content: {
      explanation: 'What is the takeaway? One line only.',
      example: '"This showed me patience is the driver."',
      practice: 'Summarize one story in one single sentence.',
    },
  },
  {
    id: 'closingMastery-7',
    title: 'Short Closer Equals Stronger Closer',
    content: {
      explanation: 'Long closings feel insecure.',
      example: '"So that is it."',
      practice: 'Close one story with 5 words or less.',
    },
  },
  {
    id: 'closingMastery-8',
    title: 'Emotional Label Ending',
    content: {
      explanation: 'If emotion drove the story, name the emotion at the end.',
      example: '"And that made me frustrated."',
      practice: 'Close one story today with a single emotion word.',
    },
  },
  {
    id: 'closingMastery-9',
    title: 'Ask for a Decision',
    content: {
      explanation: 'Some closings need a choice.',
      example: '"So yes or no?"',
      practice: 'Close one conversation today with a decision request.',
    },
  },
  {
    id: 'closingMastery-10',
    title: 'Recap in 2 Beats',
    content: {
      explanation: 'Recap equals 2 sentences maximum.',
      example: '"He said X. I realized Y."',
      practice: 'Close with a 2-beat recap.',
    },
  },
  {
    id: 'closingMastery-11',
    title: 'Give the Future Move',
    content: {
      explanation: 'Some closings need a next action.',
      example: '"So tomorrow I will call."',
      practice: 'End one talk with your next move.',
    },
  },
  {
    id: 'closingMastery-12',
    title: 'Remove Apology Endings',
    content: {
      explanation: 'Never end with "sorry if that makes sense" type lines.',
      example: 'Strong: "That is my view."',
      practice: 'End 2 conversations today with zero apology phrases.',
    },
  },
  {
    id: 'closingMastery-13',
    title: 'End on the Strong Line, Not the Greeting',
    content: {
      explanation: 'Do not destroy impact with a soft "anyway yeah ok."',
      example: 'Say conclusion then stop. Not: conclusion then "so yeah anyway."',
      practice: 'Today end one message at the conclusion sentence only.',
    },
  },
  {
    id: 'closingMastery-14',
    title: 'Repeat the Core Idea Once',
    content: {
      explanation: 'Restate only the core, not the whole thing.',
      example: '"So the core point is discipline."',
      practice: 'Pick one idea and repeat it once at the end.',
    },
  },
  {
    id: 'closingMastery-15',
    title: 'One Closer Phrase',
    content: {
      explanation: 'Use a signature closer phrase so your endings feel "designed."',
      example: '"So that is the final note."',
      practice: 'Choose your own closer phrase today and use it once.',
    },
  },
];

const IDENTITY_PROJECTION_CARDS = [
  {
    id: 'identityProjection-1',
    title: 'Choose Who You Are Before You Speak',
    content: {
      explanation: 'Identity decides tone, not words.',
      example: 'Choose "calm adult" and your voice becomes steady.',
      practice: 'Pick one identity label before you talk today (example: calm).',
    },
  },
  {
    id: 'identityProjection-2',
    title: "Don't Perform, Present",
    content: {
      explanation: 'Performance equals trying to impress. Presentation equals showing reality.',
      example: '"Here is what happened" not "you will not believe this!!"',
      practice: 'State 2 sentences flat, not dramatic.',
    },
  },
  {
    id: 'identityProjection-3',
    title: 'Be the Person Who Decides Pace',
    content: {
      explanation: 'The one who controls rhythm is the leader.',
      example: 'Slow opening sentence equals authority.',
      practice: 'Open your next conversation with a slow first sentence.',
    },
  },
  {
    id: 'identityProjection-4',
    title: 'Kill Approval Tone',
    content: {
      explanation: 'Rising pitch signals "please approve me."',
      example: 'Downward endings sound certain.',
      practice: 'End 3 sentences today with down-tone.',
    },
  },
  {
    id: 'identityProjection-5',
    title: 'Speak Like Your Time Matters',
    content: {
      explanation: 'Short clean sentences signal the value of time.',
      example: '"Here is the update."',
      practice: 'Summarize one topic in 2 sentences maximum.',
    },
  },
  {
    id: 'identityProjection-6',
    title: 'Set Boundaries Clean',
    content: {
      explanation: 'Identity becomes solid when you can say "no" calmly.',
      example: '"No, not tonight."',
      practice: 'Say one boundary sentence today.',
    },
  },
  {
    id: 'identityProjection-7',
    title: 'Describe Reality, Not Fantasy',
    content: {
      explanation: 'Grounded speakers speak from observable facts first.',
      example: '"He arrived late." Then meaning.',
      practice: 'Say 2 fact sentences before any interpretation.',
    },
  },
  {
    id: 'identityProjection-8',
    title: "Don't Rush Reason",
    content: {
      explanation: 'Leaders never defend immediately.',
      example: 'Conclusion, pause, then reason.',
      practice: 'State conclusion first then pause 1 second.',
    },
  },
  {
    id: 'identityProjection-9',
    title: 'Consistency Equals Identity',
    content: {
      explanation: 'Repeated tone creates reputation faster than vocabulary.',
      example: 'Always land endings.',
      practice: 'Today consciously maintain one vocal behavior all day.',
    },
  },
  {
    id: 'identityProjection-10',
    title: 'Talk Like You Are Not Scared of Silence',
    content: {
      explanation: 'Confidence equals calm space, not constant sound.',
      example: '"That bothered me." [pause]',
      practice: 'Add a pause before you say your emotional line.',
    },
  },
  {
    id: 'identityProjection-11',
    title: 'Name Values in Simple Language',
    content: {
      explanation: 'Values equal who you are. Keep language plain.',
      example: '"Honesty matters to me."',
      practice: 'Say one value in one sentence today.',
    },
  },
  {
    id: 'identityProjection-12',
    title: 'Remove Cuteness',
    content: {
      explanation: 'Playful tone destroys authority when misused.',
      example: '"I need focus today." Not "hehe it is weird but..."',
      practice: 'Express one need with zero cuteness layer.',
    },
  },
  {
    id: 'identityProjection-13',
    title: 'Show Direction',
    content: {
      explanation: 'Leaders point to the future, not only the past.',
      example: '"So next week I will adjust this."',
      practice: 'End one talk with a next-step line.',
    },
  },
  {
    id: 'identityProjection-14',
    title: "Don't Chase Validation Faces",
    content: {
      explanation: 'Scanning people faces for approval weakens identity.',
      example: 'Maintain forward focus mid-sentence.',
      practice: 'Finish one sentence today without checking reaction.',
    },
  },
  {
    id: 'identityProjection-15',
    title: 'Speak "Like You Mean It"',
    content: {
      explanation: 'Tone should match meaning. Calm, clean, final.',
      example: '"That is my position."',
      practice: 'Say one final line today like a decision, not a suggestion.',
    },
  },
];

const MODULES = [
  {
    id: 'fundamentals',
    title: 'Module 1: Basic Speaking Skills',
    description: 'Build a rock-solid foundation for every talk you deliver.',
    gradient: ['#4facfe', '#00f2fe'],
    cards: FUNDAMENTALS_CARDS,
  },
  {
    id: 'breathing',
    title: 'Module 2: Breathing & Voice Strength',
    description: 'Power your voice with low-belly breathing and resonant warm-ups.',
    gradient: ['#ff9a9e', '#fad0c4'],
    cards: BREATHING_CARDS,
  },
  {
    id: 'pacing',
    title: 'Module 3: Slow Down & Control Your Pace',
    description: 'Control tempo, rhythm, and intentional silence for maximum impact.',
    gradient: ['#a18cd1', '#fbc2eb'],
    cards: PACING_CARDS,
  },
  {
    id: 'language',
    title: 'Module 4: Remove Filler Words',
    description: 'Cut filler, tighten language, and land every sentence with confidence.',
    gradient: ['#f6d365', '#fda085'],
    cards: LANGUAGE_TIGHTENING_CARDS,
  },
  {
    id: 'clarityStructure',
    title: 'Module 5: Speak Clearly & Simply',
    description: 'Organize ideas into crisp sentences that audiences can follow.',
    gradient: ['#cfd9df', '#e2ebf0'],
    cards: CLARITY_STRUCTURE_CARDS,
  },
  {
    id: 'storytelling',
    title: 'Module 6: Tell Better Stories',
    description: 'Craft narratives that persuade, inspire, and stay memorable.',
    gradient: ['#84fab0', '#8fd3f4'],
    cards: STORYTELLING_CARDS,
  },
  {
    id: 'emotionalTone',
    title: 'Module 7: Express Feelings Calmly',
    description: 'Shape emotion with vocal variety, pacing, and dynamic energy.',
    gradient: ['#ffecd2', '#fcb69f'],
    cards: EMOTIONAL_TONE_CARDS,
  },
  {
    id: 'persuasion',
    title: 'Module 8: Speak With Confidence',
    description: 'Respond to pushback while keeping your argument on track.',
    gradient: ['#fbc2eb', '#a6c1ee'],
    cards: PERSUASION_CARDS,
  },
  {
    id: 'ideaFraming',
    title: 'Module 9: Stay On One Main Point',
    description: 'Sequence ideas and stories so the big picture is always clear.',
    gradient: ['#ff9a9e', '#fecfef'],
    cards: IDEA_FRAMING_CARDS,
  },
  {
    id: 'openingMastery',
    title: 'Module 10: Start Your Message Strong',
    description: 'Design magnetic openings that hook attention immediately.',
    gradient: ['#a1c4fd', '#c2e9fb'],
    cards: OPENING_MASTERY_CARDS,
  },
  {
    id: 'closingMastery',
    title: 'Module 11: End Your Message Strong',
    description: 'Land conclusions that inspire action and stay memorable.',
    gradient: ['#43e97b', '#38f9d7'],
    cards: CLOSING_MASTERY_CARDS,
  },
  {
    id: 'identityProjection',
    title: 'Module 12: Build a Confident Identity',
    description: 'Project the persona you want through movement, presence, and poise.',
    gradient: ['#667eea', '#764ba2'],
    cards: IDENTITY_PROJECTION_CARDS,
  },
];

const getModuleById = (id) => MODULES.find((module) => module.id === id) || null;

export default function App() {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const [progress, setProgress] = useState({ completedCards: {} });
  const [journalEntries, setJournalEntries] = useState({});
  const [currentModuleId, setCurrentModuleId] = useState(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState('home'); // 'home', 'module', 'journalList', 'journalEntry'
  const [editingModuleId, setEditingModuleId] = useState(null);
  const [journalEntryText, setJournalEntryText] = useState('');
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebratedModuleId, setCelebratedModuleId] = useState(null);
  const cardScrollViewRef = useRef(null);
  const hasHydrated = useRef(false);
  
  // Calculate card width and device type dynamically
  const cardWidth = useMemo(() => getCardWidth(screenWidth), [screenWidth]);
  const isTablet = screenWidth >= 768;

  useEffect(() => {
    const loadData = async () => {
      try {
        const [storedProgress, storedJournal] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEY),
          AsyncStorage.getItem(JOURNAL_STORAGE_KEY),
        ]);

        if (storedProgress) {
          const parsed = JSON.parse(storedProgress);
          if (parsed && parsed.completedCards) {
            setProgress({
              completedCards: parsed.completedCards,
            });
          }
        }

        if (storedJournal) {
          const parsed = JSON.parse(storedJournal);
          if (parsed) {
            setJournalEntries(parsed);
          }
        }
      } catch (error) {
        console.warn('Failed to load data', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
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

  useEffect(() => {
    if (isLoading) {
      return;
    }
    if (!hasHydrated.current) {
      return;
    }

    const persistJournal = async () => {
      try {
        await AsyncStorage.setItem(JOURNAL_STORAGE_KEY, JSON.stringify(journalEntries));
      } catch (error) {
        console.warn('Failed to save journal', error);
      }
    };

    persistJournal();
  }, [journalEntries, isLoading]);

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
      setCurrentView('module');
    },
    [getNextUncompletedCardIndex, isModuleUnlocked],
  );

  const handleBackHome = useCallback(() => {
    setCurrentModuleId(null);
    setCurrentCardIndex(0);
    setCurrentView('home');
    setShowCelebration(false);
    setCelebratedModuleId(null);
  }, []);

  const handleOpenJournal = useCallback(() => {
    setCurrentView('journalList');
  }, []);

  const handleOpenJournalEntry = useCallback((moduleId) => {
    const entry = journalEntries[moduleId];
    setEditingModuleId(moduleId);
    setJournalEntryText(entry?.content || '');
    setCurrentView('journalEntry');
  }, [journalEntries]);

  const handleSaveJournalEntry = useCallback(
    (moduleId, content) => {
      setJournalEntries((prev) => ({
        ...prev,
        [moduleId]: {
          content,
          date: new Date().toISOString(),
        },
      }));
      setCurrentView('journalList');
      setEditingModuleId(null);
    },
    [],
  );

  const handlePromptJournal = useCallback((moduleId) => {
    Alert.alert(
      'Module Complete!',
      'Would you like to write a journal entry about your key takeaways?',
      [
        {
          text: 'Skip',
          style: 'cancel',
        },
        {
          text: 'Write Entry',
          onPress: () => handleOpenJournalEntry(moduleId),
        },
      ],
    );
  }, [handleOpenJournalEntry]);

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

  const handleCardScroll = useCallback((event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const currentCardWidth = getCardWidth(screenWidth);
    const newIndex = Math.round(offsetX / currentCardWidth);
    if (newIndex !== currentCardIndex && newIndex >= 0 && currentModule && newIndex < currentModule.cards.length) {
      setCurrentCardIndex(newIndex);
    }
  }, [currentCardIndex, currentModule, screenWidth]);

  useEffect(() => {
    if (cardScrollViewRef.current && currentModule && currentCardIndex >= 0) {
      const currentCardWidth = getCardWidth(screenWidth);
      const scrollX = currentCardIndex * currentCardWidth;
      cardScrollViewRef.current.scrollTo({
        x: scrollX,
        animated: false,
      });
    }
  }, [currentModuleId, currentCardIndex, screenWidth]);

  const handleCardComplete = useCallback(() => {
    if (!currentModule) {
      return;
    }
    const moduleId = currentModule.id;
    const cardIndex = currentCardIndex;

    // Check if card is already completed - if so, just advance to next incomplete card
    const currentCompleted = new Set(progress.completedCards[moduleId] || []);
    if (currentCompleted.has(cardIndex)) {
      // Card already completed, just advance to next incomplete
      const nextIncomplete = currentModule.cards.findIndex((_, index) => !currentCompleted.has(index));
      if (nextIncomplete !== -1) {
        setCurrentCardIndex(nextIncomplete);
        // Scroll to next card
        setTimeout(() => {
          if (cardScrollViewRef.current) {
            const currentCardWidth = getCardWidth(screenWidth);
            const scrollX = nextIncomplete * currentCardWidth;
            cardScrollViewRef.current.scrollTo({
              x: scrollX,
              animated: true,
            });
          }
        }, 100);
      }
      return;
    }

    // Mark card as completed
    setProgress((prev) => {
      const existing = new Set(prev.completedCards[moduleId] || []);
      existing.add(cardIndex);
      const updatedArray = Array.from(existing).sort((a, b) => a - b);
      return {
        completedCards: {
          ...prev.completedCards,
          [moduleId]: updatedArray,
        },
      };
    });

    // Check if module is now complete
    const moduleLength = currentModule.cards.length;
    const newCompletedSet = new Set([...currentCompleted, cardIndex]);
    
    if (newCompletedSet.size >= moduleLength) {
      // Module complete - show celebration banner
      setCelebratedModuleId(moduleId);
      setShowCelebration(true);
      // Auto-prompt journal after a delay
      setTimeout(() => {
        handlePromptJournal(moduleId);
      }, 3000);
      return;
    }

    // Find and advance to next incomplete card
    const nextIncomplete = currentModule.cards.findIndex((_, index) => !newCompletedSet.has(index));
    if (nextIncomplete !== -1 && nextIncomplete !== cardIndex) {
      setCurrentCardIndex(nextIncomplete);
      // Scroll to next card
      setTimeout(() => {
        if (cardScrollViewRef.current) {
          const currentCardWidth = getCardWidth(screenWidth);
          const scrollX = nextIncomplete * currentCardWidth;
          cardScrollViewRef.current.scrollTo({
            x: scrollX,
            animated: true,
          });
        }
      }, 100);
    }
  }, [currentModule, currentCardIndex, progress, handlePromptJournal, screenWidth, cardWidth]);

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
          <View style={styles.headerTopRow}>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.heading}>Public Speaking Academy</Text>
              <Text style={styles.subheading}>Master every skill, one card at a time.</Text>
    </View>
            <TouchableOpacity 
              onPress={handleOpenJournal} 
              style={styles.journalButton}
              accessibilityRole="button"
              accessibilityLabel="Open Journal"
            >
              <Text style={styles.journalButtonText}>Journal</Text>
            </TouchableOpacity>
          </View>
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
                accessibilityRole="button"
                accessibilityLabel={`${module.title}. ${moduleProgress.completedCount} of ${moduleProgress.total} cards completed. ${unlocked ? 'Tap to open' : 'Locked. Complete previous module to unlock'}`}
                accessibilityState={{ disabled: !unlocked }}
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
          <ScrollView
            style={styles.moduleScrollView}
            contentContainerStyle={styles.moduleScrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.moduleHeader}>
              <TouchableOpacity 
                onPress={handleBackHome} 
                style={styles.backButton}
                accessibilityRole="button"
                accessibilityLabel="Go back to home"
              >
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
              <View style={styles.moduleHeaderText}>
                <Text style={styles.moduleHeading}>{currentModule.title}</Text>
                <Text style={styles.moduleSubheading}>{currentModule.description}</Text>
              </View>
              <TouchableOpacity
                onPress={() => handleOpenJournalEntry(currentModule.id)}
                style={styles.moduleJournalButton}
                accessibilityRole="button"
                accessibilityLabel="Open journal for this module"
              >
                <Text style={styles.moduleJournalButtonText}>Journal</Text>
              </TouchableOpacity>
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
                accessibilityRole="button"
                accessibilityLabel="Reset module progress"
                accessibilityState={{ disabled: !hasCompletedCards }}
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

            {showCelebration && celebratedModuleId === currentModule.id && (
              <View style={styles.celebrationBanner}>
                <Text style={styles.celebrationTitle}>MODULE COMPLETE!</Text>
                <Text style={styles.celebrationSubtitle}>You've mastered {currentModule.title}!</Text>
                <Text style={styles.celebrationBody}>
                  {nextModule
                    ? `${nextModule.title} is now unlocked. Keep the momentum going!`
                    : 'You have completed every module. Outstanding work!'}
                </Text>
              </View>
            )}
            {moduleProgress.complete && !showCelebration && (
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

            <View style={styles.cardCounterContainer}>
              <Text style={styles.cardCounter}>
                Card {currentCardIndex + 1} of {currentModule.cards.length}
              </Text>
            </View>

            <View style={[styles.cardScrollWrapper, isTablet && styles.cardScrollWrapperTablet]}>
              <ScrollView
                ref={cardScrollViewRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={handleCardScroll}
                decelerationRate="fast"
                snapToInterval={cardWidth}
                snapToAlignment={isTablet ? "center" : "start"}
                style={styles.cardHorizontalScroll}
                contentContainerStyle={[
                  styles.cardHorizontalScrollContent,
                  isTablet && styles.cardHorizontalScrollContentTablet,
                ]}
              >
                {currentModule.cards.map((card, index) => (
                  <View key={card.id} style={[styles.cardSlide, { width: cardWidth }]}>
                    <View style={styles.card}>
                      <Text style={styles.cardTitle}>{card.title}</Text>
                      {renderRevealedContent(card)}
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>

            <View style={styles.cardActionsContainer}>
              <TouchableOpacity
                onPress={handleCardComplete}
                disabled={completedIndexes.has(currentCardIndex)}
                style={[
                  styles.completeButton,
                  completedIndexes.has(currentCardIndex) && styles.completeButtonDisabled,
                ]}
                accessibilityRole="button"
                accessibilityLabel={completedIndexes.has(currentCardIndex) ? 'Card completed' : 'Mark card as complete'}
                accessibilityState={{ disabled: completedIndexes.has(currentCardIndex) }}
              >
                <Text
                  style={[
                    styles.completeButtonText,
                    completedIndexes.has(currentCardIndex) && styles.completeButtonTextDisabled,
                  ]}
                >
                  {completedIndexes.has(currentCardIndex) ? 'Completed ✓' : 'Mark complete'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    );
  };

  const renderJournalList = () => {
    const entriesWithModules = MODULES.map((module) => ({
      module,
      entry: journalEntries[module.id],
    }));

    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="light" />
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.headerTopRow}>
              <TouchableOpacity 
                onPress={handleBackHome} 
                style={styles.backButton}
                accessibilityRole="button"
                accessibilityLabel="Go back to home"
              >
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
              <View style={styles.headerTitleContainer}>
                <Text style={styles.heading}>Journal</Text>
              </View>
            </View>
            <Text style={styles.subheading}>Your key takeaways from each module</Text>
          </View>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.journalListContent}>
            {entriesWithModules.map(({ module, entry }) => (
              <TouchableOpacity
                key={module.id}
                onPress={() => handleOpenJournalEntry(module.id)}
                style={styles.journalEntryCard}
                accessibilityRole="button"
                accessibilityLabel={`Journal entry for ${module.title}. ${entry ? 'Has entry' : 'No entry yet'}`}
              >
                <LinearGradient colors={module.gradient} style={styles.journalEntryGradient}>
                  <View style={styles.journalEntryHeader}>
                    <Text style={styles.journalEntryTitle}>{module.title}</Text>
                    {entry && (
                      <Text style={styles.journalEntryDate}>
                        {new Date(entry.date).toLocaleDateString()}
                      </Text>
                    )}
                  </View>
                  {entry ? (
                    <Text style={styles.journalEntryPreview} numberOfLines={2}>
                      {entry.content}
                    </Text>
                  ) : (
                    <Text style={styles.journalEntryEmpty}>Tap to write your takeaways...</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  };

  const renderJournalEntry = () => {
    if (!editingModuleId) {
      return null;
    }
    const module = getModuleById(editingModuleId);
    if (!module) {
      return null;
    }

    return (
      <LinearGradient colors={module.gradient} style={styles.moduleScreen}>
        <SafeAreaView style={styles.safeAreaTransparent}>
          <StatusBar style="light" />
          <View style={styles.moduleScreenContent}>
            <View style={styles.moduleHeader}>
              <TouchableOpacity
                onPress={() => {
                  setCurrentView('journalList');
                  setEditingModuleId(null);
                }}
                style={styles.backButton}
                accessibilityRole="button"
                accessibilityLabel="Go back to journal list"
              >
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
              <View style={styles.moduleHeaderText}>
                <Text style={styles.moduleHeading}>Journal: {module.title}</Text>
                <Text style={styles.moduleSubheading}>Write your key takeaways and reflections</Text>
              </View>
            </View>

            <View style={styles.journalEditorContainer}>
              <TextInput
                style={styles.journalTextInput}
                multiline
                placeholder="What are your key takeaways from this module? What did you learn? What will you practice?"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                value={journalEntryText}
                onChangeText={setJournalEntryText}
                textAlignVertical="top"
                accessibilityLabel="Journal entry text input"
                accessibilityHint="Enter your key takeaways and reflections for this module"
              />
              <TouchableOpacity
                onPress={() => handleSaveJournalEntry(editingModuleId, journalEntryText)}
                style={styles.journalSaveButton}
                accessibilityRole="button"
                accessibilityLabel="Save journal entry"
              >
                <Text style={styles.journalSaveButtonText}>Save Entry</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  };

  if (currentView === 'journalList') {
    return renderJournalList();
  }
  if (currentView === 'journalEntry') {
    return renderJournalEntry();
  }
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
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  header: {
    marginBottom: 28,
  },
  heading: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: -0.5,
    lineHeight: 38,
  },
  subheading: {
    color: '#c0c5ff',
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 0.2,
    lineHeight: 22,
  },
  overallProgress: {
    marginTop: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  overallProgressText: {
    color: '#f5f6ff',
    fontSize: 15,
    marginBottom: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  progressTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  progressTrackLight: {
    marginTop: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  progressTrackDark: {
    marginTop: 14,
    height: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(12, 15, 36, 0.6)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 2,
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#ffffff',
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  progressFillLight: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 3,
  },
  moduleListContent: {
    paddingBottom: 120,
  },
  moduleCardWrapper: {
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  moduleCard: {
    borderRadius: 24,
    padding: 24,
    minHeight: 160,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  moduleCardDisabled: {
    opacity: 0.5,
  },
  moduleTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 10,
    letterSpacing: -0.3,
    lineHeight: 28,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  moduleDescription: {
    color: '#f6f7ff',
    fontSize: 15,
    marginBottom: 14,
    lineHeight: 21,
    opacity: 0.95,
    letterSpacing: 0.1,
  },
  moduleProgressText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2,
    marginBottom: 8,
  },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
    backgroundColor: 'rgba(6, 10, 28, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  lockText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 6,
    letterSpacing: 0.3,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  lockSubtext: {
    color: '#d9ddff',
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.2,
    opacity: 0.9,
  },
  moduleScreen: {
    flex: 1,
  },
  moduleScrollView: {
    flex: 1,
  },
  moduleScrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  moduleScreenContent: {
    flex: 1,
    padding: 20,
  },
  moduleHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    marginRight: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  moduleHeaderText: {
    flex: 1,
  },
  moduleHeading: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: -0.5,
    lineHeight: 34,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  moduleSubheading: {
    color: '#f0f4ff',
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 0.2,
    lineHeight: 22,
    opacity: 0.9,
  },
  moduleProgressCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  moduleProgressStrong: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  resetButton: {
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  resetButtonDisabled: {
    opacity: 0.4,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  resetButtonText: {
    color: '#f5f7ff',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  resetButtonTextDisabled: {
    color: 'rgba(245, 247, 255, 0.6)',
  },
  successBanner: {
    backgroundColor: 'rgba(46, 213, 115, 0.25)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: 'rgba(46, 213, 115, 0.7)',
    shadowColor: '#2ed573',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  successTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 6,
    letterSpacing: 0.3,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  successBody: {
    color: '#ffffff',
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '600',
  },
  celebrationBanner: {
    backgroundColor: 'rgba(255, 193, 7, 0.35)',
    borderRadius: 24,
    padding: 28,
    marginBottom: 24,
    borderWidth: 3,
    borderColor: 'rgba(255, 193, 7, 0.8)',
    alignItems: 'center',
    shadowColor: '#FFC107',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  celebrationTitle: {
    color: '#1a1a1a',
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 14,
    marginTop: 4,
    textAlign: 'center',
    letterSpacing: 1.2,
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  celebrationSubtitle: {
    color: '#1a1a1a',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 10,
    textAlign: 'center',
    letterSpacing: 0.3,
    textShadowColor: 'rgba(255, 255, 255, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  celebrationBody: {
    color: '#1a1a1a',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  cardProgressDots: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    marginHorizontal: -10,
    paddingHorizontal: 10,
  },
  progressDot: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 5,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  progressDotCompleted: {
    backgroundColor: '#2ed573',
    borderColor: '#1ed760',
    borderWidth: 2,
    shadowColor: '#2ed573',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
  },
  progressDotActive: {
    backgroundColor: '#ffffff',
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 5,
  },
  cardCounterContainer: {
    alignItems: 'center',
    marginBottom: 18,
    marginTop: 4,
    paddingVertical: 10,
  },
  cardCounter: {
    color: '#dfe3ff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    opacity: 0.9,
  },
  cardScrollWrapper: {
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
  },
  cardScrollWrapperTablet: {
    paddingHorizontal: 20,
  },
  cardHorizontalScroll: {
    width: '100%',
  },
  cardHorizontalScrollContent: {
    paddingHorizontal: 0,
  },
  cardHorizontalScrollContentTablet: {
    paddingHorizontal: 20,
  },
  cardSlide: {
    paddingHorizontal: 0,
    marginHorizontal: 0,
  },
  card: {
    backgroundColor: 'rgba(8, 16, 38, 0.92)',
    borderRadius: 24,
    padding: 28,
    minHeight: 380,
    justifyContent: 'flex-start',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  cardTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 20,
    letterSpacing: -0.3,
    lineHeight: 30,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  cardContent: {
    color: '#f4f6ff',
    fontSize: 17,
    lineHeight: 26,
    fontWeight: '400',
    letterSpacing: 0.1,
  },
  cardActionsContainer: {
    marginBottom: 20,
    paddingHorizontal: 0,
  },
  cardActions: {
    flexDirection: 'row',
    marginBottom: 18,
  },
  completeButton: {
    backgroundColor: '#ffffff',
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  completeButtonText: {
    color: '#121532',
    fontWeight: '800',
    fontSize: 17,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  completeButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    shadowOpacity: 0.2,
  },
  completeButtonTextDisabled: {
    color: '#666666',
  },
  primaryButton: {
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
  primaryButtonDisabled: {
    opacity: 0.6,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
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
  cardDetails: {
    marginTop: 12,
  },
  cardSection: {
    marginBottom: 20,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardSectionLabel: {
    color: '#95a0d6',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 10,
    opacity: 0.9,
  },
  cardSectionText: {
    color: '#f4f6ff',
    fontSize: 17,
    lineHeight: 26,
    fontWeight: '400',
    letterSpacing: 0.1,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  headerTitleContainer: {
    flex: 1,
  },
  journalButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
    backgroundColor: 'rgba(79, 172, 254, 0.25)',
    borderWidth: 1.5,
    borderColor: 'rgba(79, 172, 254, 0.6)',
    marginLeft: 12,
    shadowColor: '#4facfe',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  journalButtonText: {
    color: '#4facfe',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  journalListContent: {
    paddingBottom: 120,
  },
  journalEntryCard: {
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  journalEntryGradient: {
    borderRadius: 24,
    padding: 24,
    minHeight: 130,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  journalEntryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  journalEntryTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
    letterSpacing: -0.2,
    lineHeight: 26,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  journalEntryDate: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 13,
    marginLeft: 12,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  journalEntryPreview: {
    color: '#f6f7ff',
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
    letterSpacing: 0.1,
  },
  journalEntryEmpty: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 15,
    fontStyle: 'italic',
    fontWeight: '400',
    letterSpacing: 0.1,
  },
  journalEditorContainer: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  journalTextInput: {
    flex: 1,
    backgroundColor: 'rgba(8, 16, 38, 0.9)',
    borderRadius: 20,
    padding: 22,
    color: '#ffffff',
    fontSize: 17,
    lineHeight: 26,
    minHeight: 320,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    fontWeight: '400',
    letterSpacing: 0.1,
  },
  journalSaveButton: {
    marginTop: 20,
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: 'center',
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  journalSaveButtonText: {
    color: '#121532',
    fontWeight: '800',
    fontSize: 17,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  moduleJournalButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    marginLeft: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  moduleJournalButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
