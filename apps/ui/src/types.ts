export type MessageType =
    | SubscribeMessage
    | VoteQuestion
    | PostQuestion
    | PublishQuestion;

export type ErrorMessage = {
    message: string;
    method: 'ERROR';
};

export type SubscribeMessage = {
    method: 'SUBSCRIBE' | 'UNSUBSCRIBE';
    topics: string[];
};

export type SubscribeSuccessMessage = {
    method: 'SUBSCRIBE_SUCCESS';
    topic: string;
};

export type VoteQuestion = {
    questionId: string;
    method: 'UPVOTE' | 'UNVOTE';
};

export type PostQuestion = {
    method: 'POST_QUESTION';
    question: string;
    roomId: string;
};

export type PublishQuestion = {
    method: 'PUBLISH_QUESTION';
    questionId: string;
    question: string;
    voteCount: number;
};

export type QuestionObject = {
    question: string;
    votedBy: string[];
};

export type GetQuestion = {
    question: string;
    questionId: string;
    votes: number;
};
