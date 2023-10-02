import React, { useState, useEffect } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import QuestionItem from './QuestionItem';
import { GetQuestion, MessageType, PostQuestion, VoteQuestion } from '../types';
import { useParams } from 'react-router';
import { getQuestions } from './service';

const Room: React.FC = () => {
    const [isSubscribedToRoom, setSubscribedToRoom] = useState(false);
    const { sendJsonMessage, readyState, lastJsonMessage } = useWebSocket(
        import.meta.env.VITE_WS_BASE_URL,
        { share: true }
    );
    const [questions, setQuestions] = useState<GetQuestion[]>([]);

    const { roomId } = useParams();

    useEffect(() => {
        if (roomId) {
            const message = {
                method: 'SUBSCRIBE',
                topics: [roomId],
            };
            sendJsonMessage(message);

            getQuestions(roomId).then((data) => {
                setQuestions(() => data);
                console.log(data);
            });
        }
    }, [roomId, sendJsonMessage]);

    useEffect(() => {
        const message = lastJsonMessage as MessageType;
        if (lastJsonMessage && message.method === 'SUBSCRIBE_SUCCESS') {
            setSubscribedToRoom(() => true);
        } else if (lastJsonMessage && message.method === 'PUBLISH_QUESTION') {
            const filteredQuestions = questions.filter(
                (xs) => xs.questionId !== message.questionId
            );

            setQuestions(() => {
                return [
                    ...filteredQuestions,
                    {
                        question: message.question,
                        questionId: message.questionId,
                        votes: message.voteCount,
                    } as GetQuestion,
                ];
            });
        }
    }, [lastJsonMessage, questions]);

    const connectionStatus = {
        [ReadyState.CONNECTING]: 'Connecting',
        [ReadyState.OPEN]: 'Open',
        [ReadyState.CLOSING]: 'Closing',
        [ReadyState.CLOSED]: 'Closed',
        [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
    }[readyState];

    const [inputText, setInputText] = useState('');

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInputText(event.target.value);
    };

    const handlePostQuestion = () => {
        const message: PostQuestion = {
            method: 'POST_QUESTION',
            roomId: roomId!,
            question: inputText,
        };
        setInputText('');
        sendJsonMessage(message)
    };

    const handleUpvote = (questionId: string, action: 'UPVOTE' | 'UNVOTE') => {
        const message: VoteQuestion = {
            questionId,
            method: action,
        };
        sendJsonMessage(message);
    };

    return (
        <div className="container mx-auto p-4 w-full">
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Enter your question"
                    value={inputText}
                    onChange={handleInputChange}
                    className="form-control"
                    disabled={
                        readyState !== ReadyState.OPEN && isSubscribedToRoom
                    }
                />
                <button
                    onClick={handlePostQuestion}
                    className="btn btn-primary mt-2"
                >
                    Post
                </button>
            </div>
            <div className='max-h-[750px] overflow-scroll'>
                {questions
                    .sort((x, y) => y.votes - x.votes)
                    .map((question) => (
                        <QuestionItem
                            key={question.questionId}
                            question={question}
                            upvoteHandler={(action) =>
                                handleUpvote(question.questionId, action)
                            }
                        />
                    ))}
            </div>
        </div>
    );
};

export default Room;
