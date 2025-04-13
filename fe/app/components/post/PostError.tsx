import React from "react";

function PostError({ error }: { error: string }) {
  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    </div>
  );
}

export default PostError;
