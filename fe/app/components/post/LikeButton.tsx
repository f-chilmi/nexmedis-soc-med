import React from "react";

interface LikeButtonProps {
  isLiked: boolean;
  count: number;
  onClick: (e: React.MouseEvent) => void;
}

const LikeButton: React.FC<LikeButtonProps> = ({ isLiked, count, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center focus:outline-none cursor-pointer ${
        isLiked ? "text-blue-600" : "text-gray-500"
      } hover:text-blue-700`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5 mr-1"
        fill={isLiked ? "currentColor" : "none"}
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
        />
      </svg>
      <span>{count}</span>
    </button>
  );
};

export default LikeButton;
