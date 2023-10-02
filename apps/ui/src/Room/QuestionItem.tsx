import React from 'react';
import { GetQuestion } from '../types';

type QuestionItemProps = {
  question: GetQuestion;
  upvoteHandler: (action: 'UNVOTE' | 'UPVOTE') => void; 
};

const QuestionItem: React.FC<QuestionItemProps> = ({ question, upvoteHandler }) => {
  const handleUpvoteClick = () => {
    const action = question.voted ? 'UNVOTE' : 'UPVOTE';
    upvoteHandler(action); // Send the action to the upvoteHandler
  };

  return (
    <div className="mb-2">
      <div className="bg-white p-4 rounded-lg shadow">
        <p className="text-xl">{question.question}</p>
        <button
          onClick={handleUpvoteClick} // Call handleUpvoteClick on button click
          className="btn btn-success mt-2"
        >
          {question.voted ? 'Unvote' : 'Upvote'} ({question.votes})
        </button>
      </div>
    </div>
  );
};

export default QuestionItem;
