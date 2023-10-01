import { RedisClientType } from 'redis';
import { WebSocket } from 'uWebSockets.js';
import { v4 } from 'uuid';
import { connectRedisClient } from './redis';
import { ErrorMessage, MessageType, PublishQuestion, QuestionObject } from './types';


const redisClient = connectRedisClient();

const decoder = new TextDecoder();

export async function processMessage(
    ws: WebSocket<{ id: string }>,
    message: MessageType
) {
    switch (message.method) {
        case 'SUBSCRIBE': {
            message.topics.forEach((topic) => {
                ws.subscribe(topic);
                console.log(
                    `client: ${
                        ws.getUserData().id
                    } subscribed to topic: ${topic}`
                );
            });
            break;
        }
        case 'UNSUBSCRIBE': {
            message.topics.forEach((topic) => {
                ws.unsubscribe(topic);
                console.log(
                    `client: ${
                        ws.getUserData().id
                    } unsubscribed from topic: ${topic}`
                );
            });
            break;
        }
        case 'POST_QUESTION': {
            const questionId = v4();
            const questionObj: QuestionObject = {
                question: message.question,
                votedBy: [],
            };
            (await redisClient).json
                .set(questionId, '.', questionObj)
                .then(() => {
                    console.log('from then');
                    const publishMessage: PublishQuestion = {
                        questionId,
                        method: 'PUBLISH_QUESTION',
                        question: message.question,
                        voteCount: 0,
                    };

                    ws.publish(message.roomId, JSON.stringify(publishMessage));
                    ws.send(JSON.stringify(publishMessage));
                });
            break;
        }

        case 'UPVOTE': {
            const question = (await (
                await redisClient
            ).json.get(message.questionId)) as QuestionObject;

            const user = decoder.decode(ws.getRemoteAddressAsText());

            const isAlreadyVoted = question.votedBy.includes(user);

            const questionId = message.questionId;

            if (!isAlreadyVoted) {
                question.votedBy = [...question.votedBy, user];
                (await redisClient).json
                    .set(questionId, '.', question)
                    .then(() => {
                        const publishMessage: PublishQuestion = {
                            questionId,
                            method: 'PUBLISH_QUESTION',
                            question: question.question,
                            voteCount: question.votedBy.length,
                        };

                        ws.publish(
                            message.roomId,
                            JSON.stringify(publishMessage)
                        );
                        ws.send(JSON.stringify(publishMessage));
                    });
            } else {
                const errMsg: ErrorMessage = {
                    method: 'ERROR',
                    message: 'Already Voted',
                };
                ws.send(JSON.stringify(errMsg));
            }
            break;
        }
        case 'UNVOTE': {
            const question = (await (
                await redisClient
            ).json.get(message.questionId)) as QuestionObject;

            const user = decoder.decode(ws.getRemoteAddressAsText());

            const isAlreadyVoted = question.votedBy.includes(user);

            const questionId = message.questionId;

            if (isAlreadyVoted) {
                question.votedBy = question.votedBy.filter((xs) => xs !== user);
                (await redisClient).json
                    .set(questionId, '.', question)
                    .then(() => {
                        const publishMessage: PublishQuestion = {
                            questionId,
                            method: 'PUBLISH_QUESTION',
                            question: question.question,
                            voteCount: question.votedBy.length,
                        };

                        ws.publish(
                            message.roomId,
                            JSON.stringify(publishMessage)
                        );
                        ws.send(JSON.stringify(publishMessage));
                    });
            } else {
                const errMsg: ErrorMessage = {
                    method: 'ERROR',
                    message: "Haven't voted yet to unvote",
                };
                ws.send(JSON.stringify(errMsg));
            }
        }
    }
}
