import { WebSocket } from 'uWebSockets.js';
import { v4 } from 'uuid';
import { connectRedisClient } from './redis';
import { ErrorMessage, MessageType, PublishQuestion, QuestionObject, SubscribeSuccessMessage } from './types';


const redisClient = connectRedisClient();

const decoder = new TextDecoder();

export async function processMessage(
    ws: WebSocket<{ id: string }>,
    message: MessageType
) {
    switch (message.method) {
        case 'SUBSCRIBE': {
            message.topics.forEach((topic) => {
                topic = topic.trim()

                ws.subscribe(topic);
                console.log(
                    `client: ${
                        ws.getUserData().id
                    } subscribed to topic: ${topic}`
                );
                const subscribeSuccessMessage: SubscribeSuccessMessage = {
                    method: 'SUBSCRIBE_SUCCESS',
                    topic
                }
                ws.send(JSON.stringify(subscribeSuccessMessage))
            });
            break;
        }
        case 'UNSUBSCRIBE': {
            message.topics.forEach((topic) => {
                topic = topic.trim()
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
            const prefix = "room_" + message.roomId + "_question_";
            const roomId = message.roomId.trim()
            const questionId = prefix + v4();
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

                    ws.publish(roomId, JSON.stringify(publishMessage));
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

                        const roomId = questionId.split("_")[1]

                        ws.publish(
                            roomId,
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
                        const roomId = questionId.split("_")[1]

                        ws.publish(
                            roomId,
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

