"use client"
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { Mic, MicOff, PhoneCall, PhoneOff, User, Volume2 } from 'lucide-react';
import { toast } from 'sonner';
import { FeedbackInfo } from '@/app/(routes)/dashboard/_components/FeedbackDialog';
import { getLearningSession, updateLearningSessionFeedback, queryRagKnowledge } from '@/lib/actions/learning-session';

export type LearningData = {
    topic: string | null,
    topicDescription: string | null,
    userId: string | null,
    id: string,
    materialUrl: string | null,
    status: string | null,
    feedback: FeedbackInfo | null
}

type Messages = {
    from: 'user' | 'bot',
    text: string
}

const AGENT_ID = process.env.NEXT_PUBLIC_DID_AGENT_ID!;
const CLIENT_KEY = process.env.NEXT_PUBLIC_DID_CLIENT_KEY!;

function StartLearning() {
    const { learningId } = useParams();
    const [learningData, setLearningData] = useState<LearningData>();
    const videoRef = useRef<HTMLVideoElement>(null);
    const [micOn, setMicOn] = useState(false);
    const [joined, setJoined] = useState(false);
    const [loading, setLoading] = useState(false);
    const [messages, setMessages] = useState<Messages[]>([]);
    const [agentManager, setAgentManager] = useState<any>(null);
    const [srcObject, setSrcObject] = useState<MediaStream | null>(null);
    const router = useRouter();
    const recognitionRef = useRef<any>(null);
    const [isListening, setIsListening] = useState(false);

    useEffect(() => {
        GetLearningSession();
    }, [learningId])

    const GetLearningSession = async () => {
        const result = await getLearningSession(learningId as string);
        console.log('[Learning] Session data:', result);
        //@ts-ignore
        setLearningData(result);
    }

    // Initialize Web Speech Recognition
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

            if (SpeechRecognition) {
                const recognition = new SpeechRecognition();
                recognition.continuous = false;
                recognition.interimResults = false;
                recognition.lang = 'en-US';

                recognition.onresult = (event: any) => {
                    const transcript = event.results[0][0].transcript;
                    console.log('[Speech] Recognized:', transcript);
                    handleUserResponse(transcript);
                    setIsListening(false);
                };

                recognition.onerror = (event: any) => {
                    console.error('[Speech] Error:', event.error);
                    if (event.error === 'not-allowed') {
                        toast.error('Microphone permission denied. Please enable it in browser settings.');
                    } else if (event.error === 'no-speech') {
                        toast.warning('No speech detected. Please try again.');
                        // Restart listening if in interview
                        if (joined && micOn) {
                            setTimeout(() => {
                                startListening();
                            }, 500);
                        }
                    } else {
                        toast.error('Speech recognition error: ' + event.error);
                    }
                    setIsListening(false);
                };

                recognition.onend = () => {
                    console.log('[Speech] Recognition ended');
                    setIsListening(false);
                    // Auto-restart listening if mic is still on and in conversation
                    if (joined && micOn) {
                        setTimeout(() => {
                            startListening();
                        }, 500);
                    }
                };

                recognitionRef.current = recognition;
            } else {
                console.error('[Speech] Speech Recognition not supported in this browser');
                toast.error('Speech recognition not supported in this browser. Please use Chrome or Edge.');
            }
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, [joined, micOn]);


    const startListening = () => {
        if (recognitionRef.current && !isListening) {
            try {
                recognitionRef.current.start();
                setIsListening(true);
                console.log('[Speech] Started listening');
            } catch (error: any) {
                console.error('[Speech] Error starting recognition:', error);
                if (error.message.includes('already started')) {
                    // Recognition is already running, just update state
                    setIsListening(true);
                }
            }
        }
    };

    const stopListening = () => {
        if (recognitionRef.current && isListening) {
            try {
                recognitionRef.current.stop();
                setIsListening(false);
                console.log('[Speech] Stopped listening');
            } catch (error) {
                console.error('[Speech] Error stopping recognition:', error);
            }
        }
    };

    // Initialize D-ID Agent SDK - only when ready to connect
    const initializeAgent = async () => {
        try {
            console.log('[D-ID] Initializing Agent SDK...');
            // Dynamically import D-ID SDK only on client side
            const { createAgentManager, ChatMode } = await import('@d-id/client-sdk');

            const auth = { type: 'key' as const, clientKey: CLIENT_KEY };

            const callbacks = {
                onSrcObjectReady(value: MediaStream) {
                    console.log('[D-ID] Video stream ready');
                    console.log('[D-ID] Stream tracks:', value.getTracks());
                    console.log('[D-ID] Video element exists:', !!videoRef.current);

                    if (videoRef.current) {
                        console.log('[D-ID] Setting srcObject on video element');
                        videoRef.current.srcObject = value;

                        // Explicitly play the video
                        videoRef.current.play()
                            .then(() => console.log('[D-ID] Video playing successfully'))
                            .catch(err => console.error('[D-ID] Video play error:', err));
                    } else {
                        console.error('[D-ID] Video ref is null!');
                    }
                    setSrcObject(value);
                    return value;
                },
                onVideoStateChange(state: string) {
                    console.log('[D-ID] Video state:', state);
                    // Don't clear the video stream when agent stops talking
                    // The stream should remain visible showing the idle avatar
                    if (state === "START" && videoRef.current && srcObject) {
                        // Ensure video is using the stream when starting to talk
                        videoRef.current.src = "";
                        videoRef.current.srcObject = srcObject;
                    }
                    // Note: We intentionally don't handle STOP state
                    // The video stream stays active showing the idle avatar
                },
                onConnectionStateChange(state: string) {
                    console.log('[D-ID] Connection state:', state);
                    if (state === "connected") {
                        toast.success('Connected to teacher!');
                    } else if (state === "disconnected") {
                        toast.info('Disconnected from teacher');
                    }
                },
                onNewMessage(newMessages: any[], type: string) {
                    console.log('[D-ID] New message:', newMessages, type);
                    if (type === 'answer') {
                        // Get the last assistant message
                        const lastMessage = newMessages[newMessages.length - 1];
                        if (lastMessage && lastMessage.role === 'assistant') {
                            setMessages(prev => [...prev, {
                                from: 'bot',
                                text: lastMessage.content
                            }]);
                        }
                    }
                },
                onError(error: any, errorData: any) {
                    console.error('[D-ID] Error:', error, errorData);
                    toast.error('Agent error: ' + error);
                }
            };

            const streamOptions = {
                compatibilityMode: 'auto' as const,
                streamWarmup: true
            };

            const manager = await createAgentManager(AGENT_ID, {
                mode: ChatMode.Functional,
                auth,
                callbacks,
                streamOptions
            });
            setAgentManager(manager);
            console.log('[D-ID] Agent manager initialized:', manager);
            return manager;
        } catch (error) {
            console.error('[D-ID] Failed to initialize agent:', error);
            toast.error('Failed to initialize teacher');
            return null;
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (agentManager) {
                agentManager.disconnect();
            }
        };
    }, [agentManager]);

    const StartConversation = async () => {
        try {
            setLoading(true);
            setJoined(true); // Set joined first to render video element

            // Initialize agent after video element is rendered
            let manager = agentManager;
            if (!manager) {
                console.log('[D-ID] No agent manager, initializing...');
                manager = await initializeAgent();
                if (!manager) {
                    toast.error('Failed to initialize agent');
                    setJoined(false);
                    return;
                }
            }

            // Wait a bit to ensure video element is in DOM
            await new Promise(resolve => setTimeout(resolve, 500));

            // Connect to the agent
            console.log('[D-ID] Connecting to agent...');
            await manager.connect();

            // Load initial RAG context for the topic
            const topic = learningData?.topic || 'General Learning';
            const ragResults = await queryRagKnowledge(topic, 10);

            const contextText = ragResults.map(r => r.text).filter(Boolean).join('\n\n');

            console.log('[RAG] Loaded initial context:', ragResults.length, 'chunks');

            // Build opening prompt with RAG context
            const openingPrompt = `You are an AI teacher. You will teach the learner about "${topic}".

Here is your knowledge base about this topic:
${contextText}

Start by introducing yourself and begin teaching the topic. Explain the key concepts, ask questions to check understanding, and have a natural conversation with the learner.`;

            // Make agent speak using chat
            await manager.chat(openingPrompt);

            toast.success('Learning session started! You can ask questions or respond.');
            setMicOn(true);

            // Start listening for user's response after agent finishes speaking
            setTimeout(() => {
                startListening();
            }, 3000); // Wait 3 seconds for agent to finish

        } catch (error) {
            console.error('[D-ID] Error starting conversation:', error);
            toast.error('Failed to start interview');
            setJoined(false);
        } finally {
            setLoading(false);
        }
    }

    const handleUserResponse = async (transcript: string) => {
        if (!agentManager) return;

        // Add user message
        setMessages(prev => [...prev, { from: 'user', text: transcript }]);

        try {
            // Query RAG for relevant context based on user's question/statement
            const ragResults = await queryRagKnowledge(transcript, 5);
            const contextText = ragResults.map(r => r.text).filter(Boolean).join('\n\n');

            console.log('[RAG] Retrieved context for user input:', ragResults.length, 'chunks');

            // Build prompt with RAG context
            const prompt = `Learner said: "${transcript}"

Relevant knowledge from your knowledge base:
${contextText}

As an AI teacher, respond naturally to the learner. If they asked a question, answer it based on the knowledge above. If they made a statement, provide feedback and continue teaching. Keep the conversation flowing naturally.`;

            // D-ID responds with RAG context
            await agentManager.chat(prompt);

        } catch (error) {
            console.error('[D-ID] Error processing response:', error);
            toast.error('Failed to process your response');
        }
    };

    const leaveConversation = async () => {
        if (!agentManager) return;

        // Stop listening
        stopListening();

        await agentManager.disconnect();
        setJoined(false);
        setMicOn(false);

        await GenerateFeedback();
    }

    const toggleMic = async () => {
        if (micOn) {
            // Turn off mic
            stopListening();
            setMicOn(false);
            toast.info('Mic muted');
        } else {
            // Turn on mic
            setMicOn(true);
            startListening();
            toast.info('Mic unmuted');
        }
    }

    useEffect(() => {
        console.log('Messages:', JSON.stringify(messages));
    }, [messages])

    const GenerateFeedback = async () => {
        toast.warning('Generating Feedback, Please Wait...');
        const result = await axios.post('/api/interview-feedback', {
            messages: JSON.stringify(messages)
        });
        console.log(result.data);
        toast.success('Feedback Ready!');

        const resp = await updateLearningSessionFeedback(
            learningId as string,
            result.data
        );
        console.log(resp);
        toast.success('Learning session completed!');

        router.replace('/dashboard');
    }

    return (
        <div className='flex flex-col lg:flex-row w-full min-h-screen bg-gray-50'>
            <div className='flex flex-col items-center p-6 lg:w-2/3'>
                <h2 className='text-2xl font-bold mb-6'>Learning Session (D-ID Powered)</h2>
                <div
                    className='rounded-2xl overflow-hidden border bg-black flex items-center justify-center relative'
                    style={{
                        width: 640,
                        height: 480,
                        marginTop: 20
                    }}
                >
                    {!joined ? (
                        <div className="flex flex-col items-center justify-center">
                            <User size={60} className='text-gray-400 mb-4' />
                            <p className="text-gray-400 text-sm">Click "Connect Call" to start</p>
                        </div>
                    ) : (
                        <video
                            ref={videoRef}
                            className="w-full h-full object-cover"
                            playsInline
                            autoPlay
                            muted={false}
                            onLoadedMetadata={() => console.log('[Video] Metadata loaded')}
                            onCanPlay={() => console.log('[Video] Can play')}
                            onPlay={() => console.log('[Video] Playing')}
                            onError={(e) => console.error('[Video] Error:', e)}
                        />
                    )}

                    {/* Listening indicator */}
                    {micOn && isListening && (
                        <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2 animate-pulse">
                            <Mic size={16} />
                            Listening...
                        </div>
                    )}
                    {micOn && !isListening && (
                        <div className="absolute top-4 left-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                            <Volume2 size={16} />
                            Speaking...
                        </div>
                    )}
                </div>

                <div className="mt-6 flex space-x-4">
                    {!joined ? (
                        <button
                            onClick={StartConversation}
                            disabled={loading || !learningData}
                            className="flex items-center px-5 py-3 bg-green-500 text-white hover:bg-green-400 rounded-full shadow-lg transition disabled:opacity-50"
                        >
                            <PhoneCall className="mr-2" size={20} />
                            {loading ? "Connecting..." : "Connect Call"}
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={toggleMic}
                                className={`flex items-center px-5 py-3 rounded-full shadow-lg transition ${
                                    micOn
                                        ? "bg-yellow-400 hover:bg-yellow-300 text-white"
                                        : "bg-gray-300 hover:bg-gray-200 text-gray-800"
                                }`}
                            >
                                {micOn ? (
                                    <>
                                        <Mic className="mr-2" size={20} /> Mute
                                    </>
                                ) : (
                                    <>
                                        <MicOff className="mr-2" size={20} /> Unmute
                                    </>
                                )}
                            </button>
                            <button
                                onClick={leaveConversation}
                                className="flex items-center px-5 py-3 bg-red-500 hover:bg-red-400 text-white rounded-full shadow-lg transition"
                            >
                                <PhoneOff className="mr-2" size={20} /> End Call
                            </button>
                        </>
                    )}
                </div>

                <div className="mt-4 text-sm text-gray-600">
                    <p>Teaching: {learningData?.topic || 'Loading...'}</p>
                </div>
            </div>

            <div className='flex flex-col p-6 lg:w-1/3 h-screen overflow-auto'>
                <h2 className='text-lg font-semibold my-4'>Conversation</h2>
                <div className='flex-1 border bg-white border-gray-200 rounded-xl p-4 space-y-3 overflow-y-auto'>
                    {messages?.length === 0 ? (
                        <div className="text-gray-400 text-center py-8">
                            <p>No messages yet</p>
                            <p className="text-sm mt-2">Start the call to begin the interview</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {messages?.map((msg, index) => (
                                <div
                                    key={index}
                                    className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`p-3 rounded-lg max-w-[80%] ${
                                            msg.from === 'user'
                                                ? "bg-blue-100 text-blue-900"
                                                : "bg-green-100 text-green-900"
                                        }`}
                                    >
                                        <p className="text-xs font-semibold mb-1">
                                            {msg.from === 'user' ? 'You' : 'Teacher'}
                                        </p>
                                        <p className="text-sm">{msg.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default StartLearning
