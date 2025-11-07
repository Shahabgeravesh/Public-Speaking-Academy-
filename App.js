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

const STORAGE_KEY = 'PSA_PROGRESS_V1';

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

const MODULES = [
  {
    id: 'fundamentals',
    title: 'Fundamentals',
    description: 'Build a rock-solid foundation for every talk you deliver.',
    gradient: ['#4facfe', '#00f2fe'],
    cards: FUNDAMENTALS_CARDS,
  },
  {
    id: 'breathing',
    title: 'Breathing & Warm-ups',
    description: 'Power your voice with breath support and intentional warm-ups.',
    gradient: ['#ff9a9e', '#fad0c4'],
    cards: createCards('breathing', [
      'Practice diaphragmatic breathing while lying down for awareness.',
      'Use box breathing (four in, four hold, four out, four hold) to settle nerves.',
      'Warm up with lip trills to relax facial muscles.',
      'Add humming scales to gently wake up the vocal cords.',
      'Stretch the neck and shoulders to release lingering tension.',
      'Perform sirens from low to high pitch to expand vocal range.',
      'Inhale for four counts and exhale for eight to build breath control.',
      'Practice slow belly breaths while standing in strong posture.',
      'Pair breathing with gentle arm swings to sync body and voice.',
      'Use tongue twisters after breathing drills to engage articulation.',
      'Add light cardio to energize the body before a presentation.',
      'Notice how regulated breath supports volume without strain.',
      'Anchor calming breaths to a trigger phrase you can use on stage.',
      'Test how different breathing rhythms change your vocal tone.',
      'Build a five-minute warm-up routine you can rely on consistently.',
    ]),
  },
  {
    id: 'pacing',
    title: 'Pacing & Pauses',
    description: 'Control tempo, rhythm, and silence for maximum impact.',
    gradient: ['#a18cd1', '#fbc2eb'],
    cards: createCards('pacing', [
      'Record yourself reading a paragraph at a natural pace.',
      'Highlight sentences where a pause would add emphasis.',
      'Practice counting silently to two during intentional pauses.',
      'Vary tempo between stories and data-heavy sections.',
      'Use pacing changes to distinguish main points from examples.',
      'Rehearse with a metronome app to feel different speaking speeds.',
      'Create script notes that mark where you want to slow down.',
      'Pause after key questions to let the audience reflect.',
      'Build suspense by stretching pauses before delivering a reveal.',
      'Practice accelerating slightly during energetic moments.',
      'Slow to half speed when explaining complex instructions.',
      'Use pauses to breathe instead of filler words like "um."',
      'Invite interaction by pausing to make eye contact across the room.',
      'Check comprehension by observing nods during longer pauses.',
      'Finish strong with a deliberate pause before your final line.',
    ]),
  },
  {
    id: 'storytelling',
    title: 'Storytelling',
    description: 'Craft narratives that persuade, inspire, and stay memorable.',
    gradient: ['#f6d365', '#fda085'],
    cards: createCards('storytelling', [
      'Draft a story using the situation, challenge, action, result framework.',
      'Identify a relatable character your audience can root for.',
      'Set the scene with sensory detail to paint a vivid picture.',
      'Clarify the stakes so listeners understand what could be lost.',
      'Build tension by describing obstacles the character faced.',
      "Highlight the turning point that changed the story's direction.",
      "Show how the character transformed through the experience.",
      "Connect the story's lesson directly to your core message.",
      'Trim details that do not move the narrative forward.',
      'Practice delivering the story with expressive vocal changes.',
      'Use gestures that mirror the action taking place.',
      'Pause at the climax to let anticipation grow.',
      'Reinforce the takeaway with a concise moral at the end.',
      'Invite the audience to imagine themselves inside the story.',
      'Prepare a shorter backup story in case timing gets tight.',
    ]),
  },
  {
    id: 'bodyLanguage',
    title: 'Body Language',
    description: 'Project confidence with posture, movement, and expression.',
    gradient: ['#84fab0', '#8fd3f4'],
    cards: createCards('bodyLanguage', [
      'Film yourself to observe posture and alignment on stage.',
      'Practice planting your feet hip-width apart for stability.',
      'Relax your knees to avoid a stiff, locked-leg stance.',
      'Use open hand gestures that face the audience, not downward.',
      'Align gestures with key words to reinforce meaning.',
      'Explore purposeful movement between sections of your talk.',
      'Maintain eye contact for a full sentence before shifting.',
      'Smile naturally when delivering welcoming or positive lines.',
      'Eliminate nervous habits like fidgeting or pacing.',
      'Pause purposefully to reset your stance and reconnect.',
      "Mirror the audience's energy level to build rapport.",
      'Expand your physical presence without adding tension.',
      'Match facial expressions to the emotion of your message.',
      'Use micro-pauses to acknowledge audience reactions.',
      'Close with a confident stance that signals completion.',
    ]),
  },
  {
    id: 'voiceVariety',
    title: 'Voice Variety',
    description: 'Keep attention with dynamic pitch, pace, and vocal color.',
    gradient: ['#ffecd2', '#fcb69f'],
    cards: createCards('voiceVariety', [
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
    ]),
  },
  {
    id: 'speechStructure',
    title: 'Speech Structure',
    description: 'Organize ideas clearly so audiences can follow and act.',
    gradient: ['#cfd9df', '#e2ebf0'],
    cards: createCards('speechStructure', [
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
    ]),
  },
  {
    id: 'audienceEngagement',
    title: 'Audience Engagement',
    description: 'Spark participation and make listeners feel involved.',
    gradient: ['#ff9a9e', '#fecfef'],
    cards: createCards('audienceEngagement', [
      "Research your audience's demographics and motivations.",
      'Pose an opening question that invites mental participation.',
      'Reference current events your audience cares about.',
      'Use inclusive language like "we" and "us" to build connection.',
      'Add interactive moments such as quick polls or hand raises.',
      'Share audience anecdotes when they reinforce your point.',
      'Encourage reflection with well-placed rhetorical questions.',
      'Model enthusiasm to inspire matching energy.',
      'Invite volunteers for demonstrations or role plays.',
      'Make eye contact across every section of the room.',
      'Adapt vocal tone in response to audience reactions.',
      'Acknowledge contributions so listeners feel seen.',
      'Give clear instructions when asking for participation.',
      'Summarize responses to reinforce shared learning.',
      'Close by thanking the audience and signaling next steps.',
    ]),
  },
  {
    id: 'visualAids',
    title: 'Visual Aids',
    description: 'Design visuals that support rather than distract.',
    gradient: ['#a1c4fd', '#c2e9fb'],
    cards: createCards('visualAids', [
      'Decide whether slides genuinely enhance your message.',
      'Keep each slide focused on one main idea.',
      'Use large fonts and high contrast for readability.',
      'Replace dense text blocks with visuals whenever possible.',
      'Limit animations to reduce distractions.',
      'Align visuals with the story you share aloud.',
      'Practice speaking to the audience, not the screen.',
      'Integrate props only when they add clarity or emotion.',
      'Plan your position so you do not block the visuals.',
      'Test technology ahead of time to prevent surprises.',
      'Prepare a no-slide version in case of technical issues.',
      'Offer handouts only if they boost retention.',
      'Use charts that emphasize the takeaway, not every data point.',
      'Maintain consistency in color and font choices.',
      'Finish with a final image that reinforces your message.',
    ]),
  },
  {
    id: 'handlingQa',
    title: 'Handling Q&A',
    description: 'Confidently navigate audience questions and dialogue.',
    gradient: ['#fbc2eb', '#a6c1ee'],
    cards: createCards('handlingQa', [
      'Set expectations by announcing when Q&A will happen.',
      'Listen fully to each question before responding.',
      'Paraphrase the question to confirm understanding.',
      'Pause before answering to organize your thoughts.',
      'Thank the asker to acknowledge their contribution.',
      'Bridge back to your key message while answering.',
      'Admit when you do not know and promise to follow up.',
      'Redirect off-topic questions respectfully.',
      'Handle multi-part questions one portion at a time.',
      'Invite related questions that build on the discussion.',
      'Watch the clock to keep Q&A within schedule.',
      'Use open body language to remain approachable.',
      'Close Q&A by summarizing common themes.',
      'Offer next steps for those who want more detail.',
      'Transition smoothly into your final remarks.',
    ]),
  },
  {
    id: 'overcomingAnxiety',
    title: 'Overcoming Anxiety',
    description: 'Manage nerves with mindset shifts and steady habits.',
    gradient: ['#667eea', '#764ba2'],
    cards: createCards('overcomingAnxiety', [
      'Identify specific triggers that elevate your speaking anxiety.',
      'Reframe nerves as energy you can channel productively.',
      'Visualize a successful presentation in vivid detail.',
      'Use box breathing to calm your nervous system.',
      'Practice progressive muscle relaxation the night before.',
      'Replace negative self-talk with supportive affirmations.',
      'Anchor calm feelings to a simple physical gesture.',
      'Arrive early to acclimate to the environment.',
      'Build a pre-talk ritual that centers and focuses you.',
      'Seek low-stakes speaking opportunities to build confidence.',
      'Debrief each talk to track progress, not perfection.',
      'Reach out to allies who can offer encouragement.',
      'Keep hydration and nutrition steady on speaking days.',
      'Accept nerves as a sign that you care about the message.',
      'Celebrate each win to reinforce a confident identity.',
    ]),
  },
  {
    id: 'advancedDelivery',
    title: 'Advanced Delivery',
    description: 'Blend every skill for polished, high-impact presentations.',
    gradient: ['#43e97b', '#38f9d7'],
    cards: createCards('advancedDelivery', [
      'Layer storytelling, data, and interaction in one talk.',
      'Tailor tone dynamically based on real-time feedback.',
      'Experiment with staging to shape the audience experience.',
      'Integrate multimedia seamlessly with your narrative.',
      'Master callbacks that connect the opening and closing.',
      'Adapt on the fly when timing shifts unexpectedly.',
      'Facilitate panels with confident transitions between speakers.',
      'Deliver without notes while keeping structure intact.',
      'Coach other speakers to sharpen your own skills.',
      'Use silence strategically to underline big ideas.',
      'Design workshops that mix speaking with guided practice.',
      'Navigate hybrid audiences both in-room and online.',
      'Tell layered stories with multiple perspectives.',
      'Rehearse with live feedback to refine delivery choices.',
      'Debrief every advanced talk to document what worked best.',
    ]),
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
