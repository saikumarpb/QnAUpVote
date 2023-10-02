import React from 'react';
import { PublishQuestion } from '../types';

type QuestionItemProps = {
  question: PublishQuestion;
  upvoteHandler: () => void;
};

const QuestionItem: React.FC<QuestionItemProps> = ({ question, upvoteHandler }) => {
  return (
    <div className="mb-2">
      <div className="bg-white p-4 rounded-lg shadow">
        <p className="text-xl">{question.question}</p>
        <button
          onClick={upvoteHandler}
          className="btn btn-success mt-2"
        >
          Upvote ({question.voteCount})
        </button>
      </div>
    </div>
  );
};

export default QuestionItem;
