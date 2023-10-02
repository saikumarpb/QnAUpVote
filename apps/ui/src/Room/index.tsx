import React, { useState, useEffect } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import QuestionItem from './QuestionItem';
import { MessageType, PostQuestion, PublishQuestion, VoteQuestion } from '../types';
import { useParams } from 'react-router';

const Room: React.FC = () => {
    const [isSubscribedToRoom, setSubscribedToRoom] = useState(false)
    const { sendJsonMessage, readyState, lastJsonMessage } = useWebSocket(
        'ws://localhost:9000',
        { share: true }
    );

    const {roomId} = useParams()

    useEffect(() => {
        if(roomId){
        const message = {
            method: 'SUBSCRIBE',
            topics: [roomId],
        };
        sendJsonMessage(message);
    }

    }, [roomId])

    useEffect(() => {
        const message = lastJsonMessage as MessageType
        if(lastJsonMessage && message.method === 'SUBSCRIBE_SUCCESS'){
            setSubscribedToRoom(() => true)
        }
    })



    const connectionStatus = {
        [ReadyState.CONNECTING]: 'Connecting',
        [ReadyState.OPEN]: 'Open',
        [ReadyState.CLOSING]: 'Closing',
        [ReadyState.CLOSED]: 'Closed',
        [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
    }[readyState];


    const [inputText, setInputText] = useState('');
    const [questions, setQuestions] = useState<PublishQuestion[]>([]);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInputText(event.target.value);
    };

    const handlePostQuestion = () => {
        const message: PostQuestion = {
            method: 'POST_QUESTION',
            roomId: '123', // Replace with the actual room ID
            question: inputText,
        };
        getEventSource()?.onmessage;
        setInputText('');
    };

    const handleUpvote = (questionId: string) => {
        const message: VoteQuestion = {
            roomId: '123', // Replace with the actual room ID
            questionId,
            method: 'UPVOTE',
        };
        sendJsonMessage(message);
    };

    useEffect(() => {
        // Handle incoming WebSocket messages here
    }, []);

    return (
        <div className="container mx-auto p-4">
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Enter your question"
                    value={inputText}
                    onChange={handleInputChange}
                    className="form-control"
                    disabled={readyState !== ReadyState.OPEN && isSubscribedToRoom}
                />
                <button
                    onClick={handlePostQuestion}
                    className="btn btn-primary mt-2"
                >
                    Post
                </button>
            </div>
            <div>
                {questions.map((question) => (
                    <QuestionItem
                        key={question.questionId}
                        question={question}
                        upvoteHandler={() => handleUpvote(question.questionId)}
                    />
                ))}
            </div>
        </div>
    );
};

export default Room;
